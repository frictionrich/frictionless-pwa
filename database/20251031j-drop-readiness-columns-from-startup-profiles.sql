-- Database Migration - Drop readiness_assessment and readiness_score columns
-- These columns have been moved to the readiness_assessments table

-- Drop readiness_score column from startup_profiles
ALTER TABLE startup_profiles DROP COLUMN IF EXISTS readiness_score;

-- Drop readiness_assessment column from startup_profiles
ALTER TABLE startup_profiles DROP COLUMN IF EXISTS readiness_assessment;

-- Verification
SELECT 'Readiness columns dropped from startup_profiles successfully!' as status;
