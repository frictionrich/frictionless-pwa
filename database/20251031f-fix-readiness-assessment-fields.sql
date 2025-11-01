-- Database Migration - Fix Readiness Assessment Field Names and Consolidate Industry/Sector
-- This migration updates field names to match the JSON schema exactly

-- ============================================
-- 1. FIX READINESS ASSESSMENTS TABLE
-- ============================================
-- Rename columns to match the API JSON schema
ALTER TABLE readiness_assessments
  RENAME COLUMN product_readiness TO product;

ALTER TABLE readiness_assessments
  RENAME COLUMN technology_maturity TO technology;

ALTER TABLE readiness_assessments
  RENAME COLUMN go_to_market_readiness TO go_to_market;

-- Update comments to reflect new field names
COMMENT ON COLUMN readiness_assessments.product IS 'Product maturity, features, user feedback, MVP status (0-100) - 15% weight';
COMMENT ON COLUMN readiness_assessments.technology IS 'Scalability, architecture, technical debt, tech stack (0-100) - 15% weight';
COMMENT ON COLUMN readiness_assessments.go_to_market IS 'GTM strategy, customer acquisition, distribution, sales channels (0-100) - 25% weight';

-- Update existing comments to include weights
COMMENT ON COLUMN readiness_assessments.overall_score IS 'Weighted average: (formation×0.10) + (business_plan×0.20) + (pitch×0.15) + (product×0.15) + (technology×0.15) + (go_to_market×0.25)';
COMMENT ON COLUMN readiness_assessments.formation IS 'Legal structure, IP, compliance (0-100) - 10% weight';
COMMENT ON COLUMN readiness_assessments.business_plan IS 'Maturity of revenue, unit costs, business model, expansion strategy, distribution (0-100) - 20% weight';
COMMENT ON COLUMN readiness_assessments.pitch IS 'Clarity of problem, solution, competition, ask, market, strategy (0-100) - 15% weight';

-- ============================================
-- 2. CONSOLIDATE SECTOR AND INDUSTRY FIELDS IN STARTUP_PROFILES
-- ============================================
-- Copy data from sector to industry if industry is null
UPDATE startup_profiles
SET industry = sector
WHERE industry IS NULL AND sector IS NOT NULL;

-- Drop the sector column (we'll use industry going forward to match JSON schema)
ALTER TABLE startup_profiles
DROP COLUMN IF EXISTS sector;

-- Update index to use industry instead of sector
CREATE INDEX IF NOT EXISTS idx_startup_profiles_industry ON startup_profiles(industry);

-- Verification
SELECT 'Database schema updated successfully!' as status;

-- Show updated readiness_assessments table structure
SELECT 'readiness_assessments columns:' as table_name;
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'readiness_assessments'
ORDER BY ordinal_position;

-- Show startup_profiles columns
SELECT 'startup_profiles columns:' as table_name;
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'startup_profiles'
ORDER BY ordinal_position;
