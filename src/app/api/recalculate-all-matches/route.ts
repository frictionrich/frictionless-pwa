import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Verify the request has the correct secret token for security
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET;

    if (!expectedToken) {
      console.error('CRON_SECRET environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
      console.error('Unauthorized recalculate-all-matches request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting batch match recalculation for all startups...');

    // Get all startup profiles
    const { data: startups, error: startupsError } = await supabase
      .from('startup_profiles')
      .select('user_id');

    if (startupsError) {
      console.error('Error fetching startups:', startupsError);
      throw startupsError;
    }

    if (!startups || startups.length === 0) {
      console.log('No startups found to recalculate matches for');
      return NextResponse.json({
        success: true,
        message: 'No startups found',
        startups_processed: 0,
      });
    }

    console.log(`Found ${startups.length} startups to process`);

    // Recalculate matches for each startup
    const results = [];
    for (const startup of startups) {
      try {
        // Call the existing calculate-matches endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/calculate-matches`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ startup_id: startup.user_id }),
        });

        if (response.ok) {
          const result = await response.json();
          results.push({
            startup_id: startup.user_id,
            success: true,
            matches_created: result.matches_created,
          });
          console.log(`✅ Recalculated matches for startup ${startup.user_id}: ${result.matches_created} matches`);
        } else {
          const error = await response.text();
          results.push({
            startup_id: startup.user_id,
            success: false,
            error: error,
          });
          console.error(`❌ Failed to recalculate matches for startup ${startup.user_id}:`, error);
        }
      } catch (error: any) {
        results.push({
          startup_id: startup.user_id,
          success: false,
          error: error.message,
        });
        console.error(`❌ Error recalculating matches for startup ${startup.user_id}:`, error);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✅ Batch recalculation complete: ${successCount} succeeded, ${failureCount} failed`);

    return NextResponse.json({
      success: true,
      startups_processed: startups.length,
      successes: successCount,
      failures: failureCount,
      results: results,
    });
  } catch (error: any) {
    console.error('Error in batch recalculation:', error);
    return NextResponse.json(
      { error: 'Failed to recalculate matches', details: error.message },
      { status: 500 }
    );
  }
}
