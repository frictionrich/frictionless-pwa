import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure route segment for larger body size (4.5MB for Vercel)
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for Node.js APIs like Buffer

// Load the startup pitch analyzer prompt from file
const PITCH_DECK_ANALYZER_PROMPT = fs.readFileSync(
  path.join(process.cwd(), 'ai_prompts', 'startup_pitch_analyzer.txt'),
  'utf-8'
);

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

          if (pdfData.Pages && pdfData.Pages.length > 0) {
            for (let i = 0; i < pdfData.Pages.length; i++) {
              const page = pdfData.Pages[i];

              // Try different possible text structures
              if (page.Texts && Array.isArray(page.Texts) && page.Texts.length > 0) {
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
                  // Sometimes text might be in a different format
                  else if (text.w) {
                    // Some PDFs store text width-based
                    fullText += String(text.w) + ' ';
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

          if (extractedText.length === 0) {
            console.error('No text extracted from PDF');
          }

          resolve(extractedText);
        });
      });

      // Parse the PDF buffer
      pdfParser.parseBuffer(Buffer.from(uint8Array));

      // Wait for parsing to complete
      content = await parsePromise;
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

    // Replace the placeholder in the prompt with the actual deck content
    const promptWithContent = PITCH_DECK_ANALYZER_PROMPT.replace('{{PITCH_DECK_TEXT}}', content);

    // Analyze with OpenAI
    console.log('📤 Calling OpenAI API to analyze pitch deck...');
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: promptWithContent,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      console.log('✅ OpenAI API call succeeded');
      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      return NextResponse.json({
        success: true,
        analysis,
      });
    } catch (openaiError: any) {
      console.error('❌ OpenAI API call failed:', openaiError.message);
      console.error('OpenAI error details:', openaiError);
      throw openaiError;
    }
  } catch (error: any) {
    console.error('Error analyzing pitch deck:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Failed to analyze pitch deck',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
