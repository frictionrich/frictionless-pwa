-- Database Migration - Create Matches Table
-- This table stores investor-startup matches with match percentages

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  investor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_percentage INTEGER NOT NULL CHECK (match_percentage >= 0 AND match_percentage <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique match pairs (prevent duplicate matches)
  UNIQUE(startup_id, investor_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_matches_startup_id ON matches(startup_id);
CREATE INDEX IF NOT EXISTS idx_matches_investor_id ON matches(investor_id);
CREATE INDEX IF NOT EXISTS idx_matches_percentage ON matches(match_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for matches table

-- Startups can view their own matches
CREATE POLICY "Startups can view their matches"
  ON matches
  FOR SELECT
  USING (
    startup_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'startup'
    )
  );

-- Investors can view their own matches
CREATE POLICY "Investors can view their matches"
  ON matches
  FOR SELECT
  USING (
    investor_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'investor'
    )
  );

-- Startups can update their match status
CREATE POLICY "Startups can update their matches"
  ON matches
  FOR UPDATE
  USING (
    startup_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'startup'
    )
  );

-- Investors can update their match status
CREATE POLICY "Investors can update their matches"
  ON matches
  FOR UPDATE
  USING (
    investor_id IN (
      SELECT id FROM profiles WHERE id = auth.uid() AND role = 'investor'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_matches_timestamp
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_matches_updated_at();

-- Verify table creation
SELECT 'Matches table created successfully!' as status;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'matches'
ORDER BY ordinal_position;
