-- Database Migration - Add AI Analysis Fields to Startup Profiles
-- This migration adds all fields from the AI pitch deck analyzer

-- Add company information fields
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS headquarters TEXT,
ADD COLUMN IF NOT EXISTS funding_ask TEXT;

-- Add business model and value proposition
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS business_model TEXT,
ADD COLUMN IF NOT EXISTS value_proposition TEXT,
ADD COLUMN IF NOT EXISTS target_market TEXT;

-- Add competitive analysis fields (stored as JSON arrays)
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS competitive_landscape JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS key_differentiators JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS key_challenges JSONB DEFAULT '[]';

-- Add team information
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS team_size INTEGER,
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';

-- Add financial metrics
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS mrr INTEGER,
ADD COLUMN IF NOT EXISTS revenue INTEGER,
ADD COLUMN IF NOT EXISTS burn_rate INTEGER,
ADD COLUMN IF NOT EXISTS runway_months INTEGER,
ADD COLUMN IF NOT EXISTS total_raised INTEGER,
ADD COLUMN IF NOT EXISTS valuation INTEGER;

-- Add traction and product fields
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS traction TEXT,
ADD COLUMN IF NOT EXISTS product_status TEXT,
ADD COLUMN IF NOT EXISTS geography_focus TEXT[];

-- Add funding and market fields
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS use_of_funds TEXT,
ADD COLUMN IF NOT EXISTS market_size TEXT,
ADD COLUMN IF NOT EXISTS market_growth TEXT;

-- Add AI analysis outputs (stored as JSON)
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS strategic_insights JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS readiness_assessment JSONB DEFAULT '{}';

-- Add timestamp for when AI analysis was performed
ALTER TABLE startup_profiles
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_startup_profiles_stage ON startup_profiles(stage);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_industry ON startup_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_valuation ON startup_profiles(valuation);
CREATE INDEX IF NOT EXISTS idx_startup_profiles_readiness_score ON startup_profiles(readiness_score);

-- Add comments to document the fields
COMMENT ON COLUMN startup_profiles.industry IS 'Industry/sector of the startup (e.g., FinTech/Investment/AI & Big Data)';
COMMENT ON COLUMN startup_profiles.headquarters IS 'Physical location of headquarters (e.g., Austin, Texas, USA)';
COMMENT ON COLUMN startup_profiles.funding_ask IS 'Fundraising details (e.g., $1M SAFE)';
COMMENT ON COLUMN startup_profiles.business_model IS 'How the company makes money';
COMMENT ON COLUMN startup_profiles.value_proposition IS 'Unique value offered to customers';
COMMENT ON COLUMN startup_profiles.target_market IS 'Description of target customer segments';
COMMENT ON COLUMN startup_profiles.competitive_landscape IS 'JSON array of competitor names';
COMMENT ON COLUMN startup_profiles.key_differentiators IS 'JSON array of competitive advantages';
COMMENT ON COLUMN startup_profiles.key_challenges IS 'JSON array of main challenges';
COMMENT ON COLUMN startup_profiles.team_size IS 'Number of team members';
COMMENT ON COLUMN startup_profiles.team_members IS 'JSON array of team member objects with name, role, background';
COMMENT ON COLUMN startup_profiles.mrr IS 'Monthly Recurring Revenue in dollars';
COMMENT ON COLUMN startup_profiles.revenue IS 'Annual revenue in dollars';
COMMENT ON COLUMN startup_profiles.burn_rate IS 'Monthly burn rate in dollars';
COMMENT ON COLUMN startup_profiles.runway_months IS 'Number of months of runway remaining';
COMMENT ON COLUMN startup_profiles.total_raised IS 'Total funding raised to date in dollars';
COMMENT ON COLUMN startup_profiles.valuation IS 'Current valuation in dollars';
COMMENT ON COLUMN startup_profiles.traction IS 'Description of traction/growth metrics';
COMMENT ON COLUMN startup_profiles.product_status IS 'Current product stage (e.g., MVP, Beta, Live)';
COMMENT ON COLUMN startup_profiles.geography_focus IS 'Array of target geographic markets';
COMMENT ON COLUMN startup_profiles.use_of_funds IS 'How the raised funds will be used';
COMMENT ON COLUMN startup_profiles.market_size IS 'Total addressable market size';
COMMENT ON COLUMN startup_profiles.market_growth IS 'Market growth rate/trend';
COMMENT ON COLUMN startup_profiles.recommendations IS 'JSON array of AI-generated recommendations';
COMMENT ON COLUMN startup_profiles.strategic_insights IS 'JSON array of AI-generated strategic insights';
COMMENT ON COLUMN startup_profiles.readiness_assessment IS 'JSON object with readiness scores across different dimensions';
COMMENT ON COLUMN startup_profiles.ai_analyzed_at IS 'Timestamp of last AI analysis';

-- Verification
SELECT 'AI analysis fields added successfully!' as status;

-- Show all columns in startup_profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'startup_profiles'
ORDER BY ordinal_position;
