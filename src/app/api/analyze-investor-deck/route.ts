import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure route segment for larger body size (4.5MB for Vercel)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

const INVESTOR_DECK_ANALYZER_PROMPT = `You are a Frictionless Intelligence analyst evaluating investor/fund profiles. Extract and structure information in JSON format for comprehensive investor reports.

Analyze the investor deck or profile and extract the following information in valid JSON format:

{
  "fund_name": "string",
  "investor_name": "string (individual investor name if applicable)",
  "headquarters": "string (City, State/Country)",
  "fund_size": "string (e.g., '$50M' or 'Angel Investor')",
  "average_ticket": "string (e.g., '$25K-$150K')",
  "stage_focus": "array of stages (Pre-seed, Seed, Series A, etc.)",
  "sector_focus": "array of sectors/industries",
  "geography_focus": "array of geographic regions",
  "investment_thesis": "string (detailed investment philosophy)",
  "portfolio_highlights": "array of portfolio company names",
  "investment_criteria": {
    "minimum_revenue": "string or null",
    "team_requirements": "string",
    "other_requirements": "string"
  },
  "value_add": "string (how they help portfolio companies)",
  "decision_process": "string (how they make investment decisions)",
  "timeline": "string (typical decision timeline)",
  "frictionless_insights": {
    "strongest_startup_types": "string (sectors, geographies, stages they match best)",
    "readiness_range": "string (typical readiness scores they target, e.g., '60-80%')",
    "ideal_coinvestment": "string (preferred co-investment conditions)"
  }
}

Return ONLY valid JSON with no markdown formatting. Ensure all fields are populated with realistic values based on the investor deck content. If information is not available, use null for specific fields or empty strings/arrays for text fields.`;

export async function POST(request: NextRequest) {
  try {
    const { content, fileName } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided' },
        { status: 400 }
      );
    }

    // Check content size (roughly 4.5MB limit for Vercel)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB in bytes
    const contentSize = new Blob([content]).size;
    if (contentSize > maxSize) {
      return NextResponse.json(
        { error: 'File content exceeds 4.5MB limit. Please upload a smaller file.' },
        { status: 413 }
      );
    }

    // Analyze with OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: INVESTOR_DECK_ANALYZER_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this investor deck or profile content:\n\nFile: ${fileName}\n\nContent:\n${content}`,
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
    console.error('Error analyzing investor deck:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze investor deck',
        details: error.message
      },
      { status: 500 }
    );
  }
}
