import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { startup_id } = await request.json();

    if (!startup_id) {
      return NextResponse.json(
        { error: 'startup_id is required' },
        { status: 400 }
      );
    }

    // Get the startup profile
    const { data: startup, error: startupError } = await supabase
      .from('startup_profiles')
      .select('*')
      .eq('user_id', startup_id)
      .single();

    if (startupError || !startup) {
      return NextResponse.json(
        { error: 'Startup profile not found' },
        { status: 404 }
      );
    }

    // Get all investor profiles
    const { data: investors, error: investorsError } = await supabase
      .from('investor_profiles')
      .select('*');

    if (investorsError || !investors || investors.length === 0) {
      return NextResponse.json(
        { error: 'No investors found' },
        { status: 404 }
      );
    }

    // Calculate match score for each investor
    const matches = investors.map((investor) => {
      const matchScore = calculateMatchScore(startup, investor);
      return {
        startup_id,
        investor_id: investor.user_id,
        match_percentage: Math.round(matchScore),
        status: 'pending',
      };
    });

    // Delete existing matches for this startup (to allow re-matching)
    await supabase
      .from('matches')
      .delete()
      .eq('startup_id', startup_id);

    // Insert new matches
    const { data: insertedMatches, error: matchesError } = await supabase
      .from('matches')
      .insert(matches)
      .select();

    if (matchesError) {
      console.error('Error inserting matches:', matchesError);
      return NextResponse.json(
        { error: 'Failed to create matches', details: matchesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matches_created: insertedMatches?.length || 0,
      matches: insertedMatches,
    });
  } catch (error: any) {
    console.error('Error calculating matches:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Calculate match score between startup and investor (0-100)
function calculateMatchScore(startup: any, investor: any): number {
  let score = 0;
  let totalWeight = 0;

  // 1. Sector Match (30% weight)
  const sectorWeight = 30;
  const sectorScore = calculateSectorMatch(startup.industry, investor.focus_sectors);
  score += sectorScore * sectorWeight;
  totalWeight += sectorWeight;

  // 2. Stage Match (25% weight)
  const stageWeight = 25;
  const stageScore = calculateStageMatch(startup.stage, investor.focus_stages);
  score += stageScore * stageWeight;
  totalWeight += stageWeight;

  // 3. Geography Match (15% weight)
  const geoWeight = 15;
  const geoScore = calculateGeographyMatch(startup.headquarters, investor.geography_focus);
  score += geoScore * geoWeight;
  totalWeight += geoWeight;

  // 4. Readiness Score Match (20% weight)
  const readinessWeight = 20;
  const readinessScore = calculateReadinessMatch(startup.readiness_score);
  score += readinessScore * readinessWeight;
  totalWeight += readinessWeight;

  // 5. Ticket Size Match (10% weight)
  const ticketWeight = 10;
  const ticketScore = calculateTicketSizeMatch(
    startup.funding_ask,
    investor.ticket_size_min,
    investor.ticket_size_max
  );
  score += ticketScore * ticketWeight;
  totalWeight += ticketWeight;

  // Return normalized score (0-100)
  return totalWeight > 0 ? score / totalWeight : 0;
}

// Calculate sector/industry match (0-1)
function calculateSectorMatch(startupIndustry: string | null, investorSectors: string[] | null): number {
  if (!startupIndustry || !investorSectors || investorSectors.length === 0) {
    return 0.5; // Neutral if data missing
  }

  const startupSectorLower = startupIndustry.toLowerCase();

  // Check for exact matches or partial matches
  for (const sector of investorSectors) {
    const sectorLower = sector.toLowerCase();

    // Exact match
    if (startupSectorLower === sectorLower) {
      return 1.0;
    }

    // Partial match (e.g., "SaaS" in "B2B SaaS")
    if (startupSectorLower.includes(sectorLower) || sectorLower.includes(startupSectorLower)) {
      return 0.9;
    }

    // Common synonyms/related sectors
    if (areSectorsRelated(startupSectorLower, sectorLower)) {
      return 0.8;
    }
  }

  return 0.3; // Some baseline score even without match
}

// Check if sectors are related
function areSectorsRelated(sector1: string, sector2: string): boolean {
  const relatedGroups = [
    ['ai', 'ml', 'machine learning', 'artificial intelligence', 'ai/ml'],
    ['saas', 'software', 'b2b saas', 'enterprise software'],
    ['fintech', 'finance', 'financial services', 'payments'],
    ['healthtech', 'health', 'medical', 'healthcare'],
    ['cleantech', 'climate tech', 'sustainability', 'green tech'],
    ['iot', 'internet of things', 'smart cities', 'sensors'],
    ['marketplace', 'platform', 'consumer tech'],
    ['devops', 'infrastructure', 'cloud', 'developer tools'],
  ];

  for (const group of relatedGroups) {
    const inGroup1 = group.some(term => sector1.includes(term));
    const inGroup2 = group.some(term => sector2.includes(term));
    if (inGroup1 && inGroup2) {
      return true;
    }
  }

  return false;
}

// Calculate stage match (0-1)
function calculateStageMatch(startupStage: string | null, investorStages: string[] | null): number {
  if (!startupStage || !investorStages || investorStages.length === 0) {
    return 0.5; // Neutral if data missing
  }

  const stageLower = startupStage.toLowerCase();

  // Exact match
  for (const invStage of investorStages) {
    if (stageLower === invStage.toLowerCase()) {
      return 1.0;
    }
  }

  // Adjacent stage match (e.g., Seed investor might consider late Pre-seed)
  const stageOrder = ['pre-seed', 'seed', 'series a', 'series b', 'series c'];
  const startupStageIndex = stageOrder.findIndex(s => stageLower.includes(s));

  if (startupStageIndex !== -1) {
    for (const invStage of investorStages) {
      const invStageLower = invStage.toLowerCase();
      const invStageIndex = stageOrder.findIndex(s => invStageLower.includes(s));

      if (invStageIndex !== -1) {
        const distance = Math.abs(startupStageIndex - invStageIndex);
        if (distance === 0) return 1.0;
        if (distance === 1) return 0.7; // Adjacent stage
      }
    }
  }

  return 0.2; // Low score for non-matching stages
}

// Calculate geography match (0-1)
function calculateGeographyMatch(startupHQ: string | null, investorGeos: string[] | null): number {
  if (!startupHQ || !investorGeos || investorGeos.length === 0) {
    return 0.5; // Neutral if data missing
  }

  const hqLower = startupHQ.toLowerCase();

  // Check for matches
  for (const geo of investorGeos) {
    const geoLower = geo.toLowerCase();

    // Exact match
    if (hqLower.includes(geoLower) || geoLower.includes(hqLower)) {
      return 1.0;
    }

    // Texas-specific matching
    if (hqLower.includes('texas') || hqLower.includes('tx') || hqLower.includes('austin') || hqLower.includes('san antonio')) {
      if (geoLower.includes('texas') || geoLower.includes('tx')) {
        return 1.0;
      }
    }

    // US matching
    if (geoLower === 'us' || geoLower === 'usa' || geoLower === 'united states') {
      if (hqLower.includes('usa') || hqLower.includes('united states') || isUSCity(hqLower)) {
        return 0.9;
      }
    }
  }

  return 0.4; // Some baseline for no match
}

// Check if location is a US city
function isUSCity(location: string): boolean {
  const usCities = ['texas', 'california', 'new york', 'boston', 'seattle', 'austin', 'san francisco', 'chicago', 'miami', 'atlanta'];
  return usCities.some(city => location.includes(city));
}

// Calculate readiness score match (0-1)
function calculateReadinessMatch(readinessScore: number | null): number {
  if (!readinessScore) {
    return 0.5; // Neutral if no score
  }

  // Higher readiness scores are better
  if (readinessScore >= 80) return 1.0;
  if (readinessScore >= 70) return 0.9;
  if (readinessScore >= 60) return 0.8;
  if (readinessScore >= 50) return 0.6;
  if (readinessScore >= 40) return 0.4;
  return 0.3;
}

// Calculate ticket size match (0-1)
function calculateTicketSizeMatch(
  fundingAsk: string | null,
  ticketMin: number | null,
  ticketMax: number | null
): number {
  if (!fundingAsk || (!ticketMin && !ticketMax)) {
    return 0.5; // Neutral if data missing
  }

  // Extract number from funding ask (e.g., "$1M" -> 1000000)
  const askAmount = extractAmount(fundingAsk);
  if (!askAmount) {
    return 0.5;
  }

  // Check if ask is within ticket range
  const min = ticketMin || 0;
  const max = ticketMax || Infinity;

  if (askAmount >= min && askAmount <= max) {
    return 1.0; // Perfect match
  }

  // Check if it's close (within 50%)
  if (askAmount >= min * 0.5 && askAmount <= max * 1.5) {
    return 0.7; // Close match
  }

  return 0.3; // Out of range
}

// Extract numeric amount from string (e.g., "$1M" -> 1000000)
function extractAmount(str: string): number | null {
  const cleaned = str.toLowerCase().replace(/[$,\s]/g, '');

  // Handle K, M, B suffixes
  let multiplier = 1;
  if (cleaned.includes('k')) {
    multiplier = 1000;
  } else if (cleaned.includes('m')) {
    multiplier = 1000000;
  } else if (cleaned.includes('b')) {
    multiplier = 1000000000;
  }

  const numberMatch = cleaned.match(/[\d.]+/);
  if (numberMatch) {
    return parseFloat(numberMatch[0]) * multiplier;
  }

  return null;
}
