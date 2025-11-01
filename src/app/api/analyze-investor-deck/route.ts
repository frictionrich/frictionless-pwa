import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure route segment for larger body size (4.5MB for Vercel)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for Node.js APIs like Buffer

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

    // Convert file to Uint8Array (pdfjs-dist requires Uint8Array, not Buffer)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Extract text from PDF using pdf2json (simple, server-side friendly)
    let content: string;
    try {
      console.log('Importing pdf2json...');
      // Use pdf2json which is designed for Node.js/serverless environments
      const pdf2jsonModule = await import('pdf2json');
      const PDFParser = (pdf2jsonModule as any).default || pdf2jsonModule;

      // Create parser instance (constructor takes no arguments or optional boolean)
      const pdfParser = new PDFParser();

      // Set up promise to wait for parsing completion
      const parsePromise = new Promise<string>((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('PDF parsing error:', errData);
          reject(new Error(`PDF parsing error: ${errData.parserError}`));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          // Extract text from all pages
          let fullText = '';

          console.log('PDF data structure:', {
            hasPages: !!pdfData.Pages,
            pagesCount: pdfData.Pages?.length || 0,
            firstPageStructure: pdfData.Pages?.[0] ? Object.keys(pdfData.Pages[0]) : []
          });

          if (pdfData.Pages && pdfData.Pages.length > 0) {
            for (let i = 0; i < pdfData.Pages.length; i++) {
              const page = pdfData.Pages[i];

              // Try different possible text structures
              if (page.Texts && Array.isArray(page.Texts) && page.Texts.length > 0) {
                console.log(`Page ${i + 1}: Found ${page.Texts.length} text items`);

                for (const text of page.Texts) {
                  // Check if text has R array (run array)
                  if (text.R && Array.isArray(text.R)) {
                    for (const r of text.R) {
                      if (r.T !== undefined && r.T !== null) {
                        // Decode URI component to handle special characters
                        try {
                          const decoded = decodeURIComponent(r.T);
                          fullText += decoded + ' ';
                        } catch {
                          // If decode fails, use as-is
                          fullText += String(r.T) + ' ';
                        }
                      }
                    }
                  }
                  // Sometimes text is directly in T property (without R array)
                  else if (text.T !== undefined && text.T !== null) {
                    try {
                      const decoded = decodeURIComponent(text.T);
                      fullText += decoded + ' ';
                    } catch {
                      fullText += String(text.T) + ' ';
                    }
                  }
                }
              }

              // Also check if there's a FillTexts property
              if (page.FillTexts && Array.isArray(page.FillTexts)) {
                for (const fillText of page.FillTexts) {
                  if (fillText.R && Array.isArray(fillText.R)) {
                    for (const r of fillText.R) {
                      if (r.T) {
                        try {
                          fullText += decodeURIComponent(r.T) + ' ';
                        } catch {
                          fullText += r.T + ' ';
                        }
                      }
                    }
                  }
                }
              }
            }
          }

          const extractedText = fullText.trim();
          console.log(`Extracted ${extractedText.length} characters from PDF`);

          if (extractedText.length === 0) {
            console.log('No text extracted. PDF structure sample:', JSON.stringify(pdfData).substring(0, 500));
          }

          resolve(extractedText);
        });
      });

      // Parse the PDF buffer
      console.log('Parsing PDF, buffer size:', uint8Array.length);
      pdfParser.parseBuffer(Buffer.from(uint8Array));

      // Wait for parsing to complete
      content = await parsePromise;
      console.log('PDF text extracted, length:', content.length);
    } catch (parseError: any) {
      console.error('PDF parsing error:', parseError);
      throw new Error(`Failed to parse PDF: ${parseError.message}`);
    }

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
          content: INVESTOR_DECK_ANALYZER_PROMPT,
        },
        {
          role: 'user',
          content: `Analyze this investor deck or profile content:\n\nFile: ${file.name}\n\nContent:\n${content}`,
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
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Failed to analyze investor deck',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
