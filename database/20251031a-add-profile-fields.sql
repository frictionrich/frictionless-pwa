-- Database Migration - Add Settings Page Fields
-- Run this BEFORE running mock-data.sql

-- Add new fields to startup_profiles
ALTER TABLE startup_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- Add unique constraint on username (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'startup_profiles_username_key'
  ) THEN
    ALTER TABLE startup_profiles ADD CONSTRAINT startup_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Add new fields to investor_profiles
ALTER TABLE investor_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- Add unique constraint on username (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'investor_profiles_username_key'
  ) THEN
    ALTER TABLE investor_profiles ADD CONSTRAINT investor_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Verify changes
SELECT 'startup_profiles columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'startup_profiles'
ORDER BY ordinal_position;

SELECT 'investor_profiles columns:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'investor_profiles'
ORDER BY ordinal_position;
