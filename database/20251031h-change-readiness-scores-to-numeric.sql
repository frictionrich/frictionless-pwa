-- Database Migration - Change Readiness Assessment Scores to NUMERIC
-- This migration changes score columns from INTEGER to NUMERIC to accept decimal values (e.g., 72.5)

-- Change all score columns from INTEGER to NUMERIC(5,2)
-- NUMERIC(5,2) allows values from 0.00 to 100.00 with 2 decimal places

ALTER TABLE readiness_assessments
  ALTER COLUMN overall_score TYPE NUMERIC(5,2),
  ALTER COLUMN formation TYPE NUMERIC(5,2),
  ALTER COLUMN business_plan TYPE NUMERIC(5,2),
  ALTER COLUMN pitch TYPE NUMERIC(5,2),
  ALTER COLUMN product TYPE NUMERIC(5,2),
  ALTER COLUMN technology TYPE NUMERIC(5,2),
  ALTER COLUMN go_to_market TYPE NUMERIC(5,2);

-- Update constraints to work with NUMERIC type
ALTER TABLE readiness_assessments
  DROP CONSTRAINT IF EXISTS readiness_assessments_overall_score_check,
  DROP CONSTRAINT IF EXISTS readiness_assessments_formation_check,
  DROP CONSTRAINT IF EXISTS readiness_assessments_business_plan_check,
  DROP CONSTRAINT IF EXISTS readiness_assessments_pitch_check,
  DROP CONSTRAINT IF EXISTS readiness_assessments_product_check,
  DROP CONSTRAINT IF EXISTS readiness_assessments_technology_check,
  DROP CONSTRAINT IF EXISTS readiness_assessments_go_to_market_check;

-- Re-add constraints for NUMERIC type
ALTER TABLE readiness_assessments
  ADD CONSTRAINT readiness_assessments_overall_score_check CHECK (overall_score >= 0 AND overall_score <= 100),
  ADD CONSTRAINT readiness_assessments_formation_check CHECK (formation >= 0 AND formation <= 100),
  ADD CONSTRAINT readiness_assessments_business_plan_check CHECK (business_plan >= 0 AND business_plan <= 100),
  ADD CONSTRAINT readiness_assessments_pitch_check CHECK (pitch >= 0 AND pitch <= 100),
  ADD CONSTRAINT readiness_assessments_product_check CHECK (product >= 0 AND product <= 100),
  ADD CONSTRAINT readiness_assessments_technology_check CHECK (technology >= 0 AND technology <= 100),
  ADD CONSTRAINT readiness_assessments_go_to_market_check CHECK (go_to_market >= 0 AND go_to_market <= 100);

-- Update comments to reflect NUMERIC type
COMMENT ON COLUMN readiness_assessments.overall_score IS 'Weighted average: (formation×0.10) + (business_plan×0.20) + (pitch×0.15) + (product×0.15) + (technology×0.15) + (go_to_market×0.25). Decimal values 0.00-100.00';
COMMENT ON COLUMN readiness_assessments.formation IS 'Legal structure, IP, compliance (0.00-100.00) - 10% weight';
COMMENT ON COLUMN readiness_assessments.business_plan IS 'Maturity of revenue, unit costs, business model, expansion strategy, distribution (0.00-100.00) - 20% weight';
COMMENT ON COLUMN readiness_assessments.pitch IS 'Clarity of problem, solution, competition, ask, market, strategy (0.00-100.00) - 15% weight';
COMMENT ON COLUMN readiness_assessments.product IS 'Product maturity, features, user feedback, MVP status (0.00-100.00) - 15% weight';
COMMENT ON COLUMN readiness_assessments.technology IS 'Scalability, architecture, technical debt, tech stack (0.00-100.00) - 15% weight';
COMMENT ON COLUMN readiness_assessments.go_to_market IS 'GTM strategy, customer acquisition, distribution, sales channels (0.00-100.00) - 25% weight';

-- Verification
SELECT 'Readiness assessments table updated to NUMERIC type!' as status;

-- Show updated table structure
SELECT
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'readiness_assessments'
  AND column_name IN ('overall_score', 'formation', 'business_plan', 'pitch', 'product', 'technology', 'go_to_market')
ORDER BY ordinal_position;
