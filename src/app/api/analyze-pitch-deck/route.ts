import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure route segment for larger body size (4.5MB for Vercel)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for Node.js APIs like Buffer

const PITCH_DECK_ANALYZER_PROMPT = `You are a Frictionless Intelligence analyst evaluating startup pitch decks. Extract and structure information in JSON format for a comprehensive Funding Intelligence Report.

Analyze the pitch deck and extract the following information in valid JSON format:

{
  "company_name": "string",
  "industry": "string (e.g., 'FinTech/Alternative Lending/AI & Big Data' or 'SportsTech/AI/Talent Recruitment')",
  "stage": "string (Pre-seed, Seed, Series A, Scaling, Bridge Round, etc.)",
  "headquarters": "string (City, State/Country)",
  "funding_ask": "string (e.g., '$1M-$3M equity or loan bridge' or '$250K-$400K SAFE')",
  "business_model": "string (detailed description of how the company makes money)",
  "value_proposition": "string (clear statement of unique value)",
  "target_market": "string (description of target customer segments)",

  "competitive_landscape": "array of competitor company names",
  "key_differentiators": "array of strings (what makes this company unique vs competitors)",
  "key_challenges": "array of strings (main obstacles or risks the company faces)",

  "team_size": "number (total team members)",
  "team_members": "array of {name: string, role: string, background: string}",

  "mrr": "number or null (monthly recurring revenue in dollars)",
  "revenue": "number or null (annual revenue in dollars)",
  "burn_rate": "number or null (monthly burn in dollars)",
  "runway_months": "number or null",
  "total_raised": "number or null (total funding raised to date in dollars)",
  "valuation": "number or null (current valuation in dollars)",

  "traction": "string (key metrics, user numbers, growth rates, partnerships, achievements)",
  "product_status": "string (MVP, Live, Scaling, etc. - include platform details)",
  "geography_focus": "array of geographic markets (countries/regions where they operate)",
  "use_of_funds": "string (how the funding will be used)",

  "market_size": "string (e.g., '$2.3B (2024)' or 'LATAM alternative lending market ≈ $28B (2024)')",
  "market_growth": "string (e.g., 'growing 15% CAGR' or 'to $58B by 2028')",

  "recommendations": "array of objects with {action: string, area: string, impact: string}",
  "strategic_insights": "array of 2-4 bullet point strings providing strategic observations",

  "readiness_assessment": {
    "overall_score": "number 0-100 (weighted average of all components using Frictionless model: Formation 10%, Business Plan 20%, Pitch 15%, Product 15%, Technology 15%, Go-To-Market 25%)",
    "foundational_setup": "number 0-100 (legal structure, IP, compliance)",
    "team_readiness": "number 0-100 (team experience, completeness, commitment)",
    "funding_strategy": "number 0-100 (clarity of ask, use of funds, financial projections)",
    "financial_health": "number 0-100 (runway, burn rate, revenue metrics)",
    "product_readiness": "number 0-100 (product maturity, features, user feedback)",
    "tech_maturity": "number 0-100 (scalability, architecture, technical debt)",
    "go_to_market_readiness": "number 0-100 (GTM strategy, customer acquisition, distribution)",
    "storytelling_communication": "number 0-100 (pitch clarity, deck quality, narrative)",
    "market_positioning": "number 0-100 (market opportunity, competitive position, timing)"
  }
}

Return ONLY valid JSON with no markdown formatting. Ensure all fields are populated with realistic values based on the pitch deck content. If information is not available, use null for numbers or empty strings/arrays for text fields.`;

export async function POST(request: NextRequest) {
  try {
    // Parse multipart/form-data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (4.5MB limit for Vercel)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 4.5MB limit. Please upload a smaller file.' },
        { status: 413 }
      );
    }

    // Check if it's a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported for AI analysis' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using pdf-parse (dynamic import handles ESM module)
    // pdf-parse v2.4.5 is ESM-only and exports the function as the module namespace
    const pdfParseModule = await import('pdf-parse') as any;
    // Access the default export if it exists, otherwise use the module itself
    const pdfParse = pdfParseModule.default ?? pdfParseModule;
    const pdfData = await pdfParse(buffer);
    const content = pdfData.text;

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: 'Could not extract enough text from PDF' },
        { status: 400 }
      );
    }

    console.log('Extracted text length:', content.length);
    console.log('First 200 chars:', content.substring(0, 200));

    // Analyze with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: PITCH_DECK_ANALYZER_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this pitch deck content:\n\nFile: ${file.name}\n\nContent:\n${content}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Error analyzing pitch deck:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze pitch deck',
        details: error.message
      },
      { status: 500 }
    );
  }
}
