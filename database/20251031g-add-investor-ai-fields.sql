-- Database Migration - Add AI Analysis Fields to Investor Profiles
-- This migration adds all fields from the AI investor deck analyzer

-- Add investor information fields
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS investor_name TEXT,
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS fund_size TEXT,
ADD COLUMN IF NOT EXISTS average_ticket TEXT;

-- Add geographic and portfolio fields
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS geography_focus TEXT[],
ADD COLUMN IF NOT EXISTS portfolio_highlights JSONB DEFAULT '[]';

-- Add investment thesis and criteria
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS investment_thesis TEXT,
ADD COLUMN IF NOT EXISTS investment_criteria JSONB DEFAULT '{}';

-- Add value proposition and process fields
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS value_add TEXT,
ADD COLUMN IF NOT EXISTS decision_process TEXT,
ADD COLUMN IF NOT EXISTS timeline TEXT;

-- Add Frictionless insights (stored as JSON)
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS frictionless_insights JSONB DEFAULT '{}';

-- Add timestamp for when AI analysis was performed
ALTER TABLE investor_profiles
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_investor_profiles_headquarters ON investor_profiles(headquarters);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_fund_size ON investor_profiles(fund_size);

-- Add comments to document the fields
COMMENT ON COLUMN investor_profiles.investor_name IS 'Individual investor name if applicable';
COMMENT ON COLUMN investor_profiles.headquarters IS 'Physical location of fund/investor headquarters (e.g., Austin, Texas, USA)';
COMMENT ON COLUMN investor_profiles.fund_size IS 'Total fund size (e.g., $50M or Angel Investor)';
COMMENT ON COLUMN investor_profiles.average_ticket IS 'Average investment amount (e.g., $25K-$150K)';
COMMENT ON COLUMN investor_profiles.geography_focus IS 'Array of target geographic regions for investment';
COMMENT ON COLUMN investor_profiles.portfolio_highlights IS 'JSON array of notable portfolio company names';
COMMENT ON COLUMN investor_profiles.investment_thesis IS 'Detailed investment philosophy and approach';
COMMENT ON COLUMN investor_profiles.investment_criteria IS 'JSON object with minimum_revenue, team_requirements, other_requirements';
COMMENT ON COLUMN investor_profiles.value_add IS 'How the investor helps portfolio companies beyond capital';
COMMENT ON COLUMN investor_profiles.decision_process IS 'How the investor makes investment decisions';
COMMENT ON COLUMN investor_profiles.timeline IS 'Typical decision timeline from pitch to close';
COMMENT ON COLUMN investor_profiles.frictionless_insights IS 'JSON object with strongest_startup_types, readiness_range, ideal_coinvestment';
COMMENT ON COLUMN investor_profiles.ai_analyzed_at IS 'Timestamp of last AI analysis of investor deck';

-- Verification
SELECT 'Investor AI analysis fields added successfully!' as status;

-- Show all columns in investor_profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'investor_profiles'
ORDER BY ordinal_position;
