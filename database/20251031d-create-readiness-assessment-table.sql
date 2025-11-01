-- Database Migration - Create Readiness Assessment Table
-- This table stores readiness scores for each pitch deck uploaded by a startup

-- Create readiness_assessments table
CREATE TABLE IF NOT EXISTS readiness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pitch_deck_path TEXT NOT NULL,

  -- Readiness scores (0-100)
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  formation INTEGER CHECK (formation >= 0 AND formation <= 100),
  business_plan INTEGER CHECK (business_plan >= 0 AND business_plan <= 100),
  pitch INTEGER CHECK (pitch >= 0 AND pitch <= 100),
  product_readiness INTEGER CHECK (product_readiness >= 0 AND product_readiness <= 100),
  technology_maturity INTEGER CHECK (technology_maturity >= 0 AND technology_maturity <= 100),
  go_to_market_readiness INTEGER CHECK (go_to_market_readiness >= 0 AND go_to_market_readiness <= 100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_startup_id ON readiness_assessments(startup_id);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_created_at ON readiness_assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readiness_assessments_pitch_deck_path ON readiness_assessments(pitch_deck_path);

-- Add unique constraint to prevent duplicate assessments for same deck
CREATE UNIQUE INDEX IF NOT EXISTS idx_readiness_assessments_unique_deck
  ON readiness_assessments(startup_id, pitch_deck_path);

-- Add comments to document the fields
COMMENT ON TABLE readiness_assessments IS 'Stores AI-generated readiness assessment scores for each pitch deck upload';
COMMENT ON COLUMN readiness_assessments.startup_id IS 'Reference to the startup (profiles table)';
COMMENT ON COLUMN readiness_assessments.pitch_deck_path IS 'Storage path to the pitch deck file (e.g., user_id/pitch-deck-123.pdf)';
COMMENT ON COLUMN readiness_assessments.overall_score IS 'Weighted average of all readiness components (0-100)';
COMMENT ON COLUMN readiness_assessments.formation IS 'Legal structure, IP, compliance readiness (0-100)';
COMMENT ON COLUMN readiness_assessments.business_plan IS 'Maturity of revenue, unit costs, business model, expansion strategy, distribution (0-100)';
COMMENT ON COLUMN readiness_assessments.pitch IS 'Clarity of problem, solution, competition, ask, market, strategy (0-100)';
COMMENT ON COLUMN readiness_assessments.product_readiness IS 'Product maturity, features, user feedback (0-100)';
COMMENT ON COLUMN readiness_assessments.technology_maturity IS 'Scalability, architecture, technical debt (0-100)';
COMMENT ON COLUMN readiness_assessments.go_to_market_readiness IS 'GTM strategy, customer acquisition, distribution (0-100)';

-- Enable Row Level Security (RLS)
ALTER TABLE readiness_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own assessments
CREATE POLICY "Users can view their own readiness assessments"
  ON readiness_assessments
  FOR SELECT
  USING (auth.uid() = startup_id);

-- RLS Policy: Users can insert their own assessments
CREATE POLICY "Users can insert their own readiness assessments"
  ON readiness_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = startup_id);

-- RLS Policy: Users can update their own assessments
CREATE POLICY "Users can update their own readiness assessments"
  ON readiness_assessments
  FOR UPDATE
  USING (auth.uid() = startup_id)
  WITH CHECK (auth.uid() = startup_id);

-- RLS Policy: Users can delete their own assessments
CREATE POLICY "Users can delete their own readiness assessments"
  ON readiness_assessments
  FOR DELETE
  USING (auth.uid() = startup_id);

-- Verification
SELECT 'Readiness assessments table created successfully!' as status;

-- Show table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'readiness_assessments'
ORDER BY ordinal_position;
