-- Mock Data for Frictionless Platform
-- User ID: d5629bd5-aaaf-42bc-9de4-1f222eacdf7e
-- This script creates a startup profile for ONE existing auth user
--
-- IMPORTANT: Before running this script:
-- 1. Create an auth user in Supabase Authentication with UUID: d5629bd5-aaaf-42bc-9de4-1f222eacdf7e
--    - You can do this manually in Supabase Dashboard > Authentication > Users
--    - Or sign up through the app and note the user's UUID
-- 2. Once the auth user exists, run this script to create the profile data
--
-- NOTE: Investor profiles cannot be created via SQL because they require auth users.
-- To test investor functionality, sign up investor accounts through the app's signup flow.

-- ============================================
-- DISABLE RLS FOR MOCK DATA INSERTS
-- ============================================
-- RLS policies require auth.uid() which is NULL when running SQL scripts directly
-- We temporarily disable RLS, insert the data, then re-enable it

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. CREATE PROFILE FOR TEST USER
-- ============================================

-- Insert or update profile (as startup)
-- This assumes the auth user d5629bd5-aaaf-42bc-9de4-1f222eacdf7e already exists
INSERT INTO profiles (id, email, role, created_at, updated_at)
VALUES (
  'd5629bd5-aaaf-42bc-9de4-1f222eacdf7e',
  'demo@techstartup.io',
  'startup',
  NOW() - INTERVAL '30 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'startup', updated_at = NOW();

-- ============================================
-- 2. CREATE STARTUP PROFILE
-- ============================================

INSERT INTO startup_profiles (
  user_id,
  company_name,
  username,
  tagline,
  logo_url,
  website,
  pitch_deck_url,
  description,
  sector,
  stage,
  readiness_score,
  linkedin,
  twitter,
  instagram,
  tiktok,
  created_at,
  updated_at
) VALUES (
  'd5629bd5-aaaf-42bc-9de4-1f222eacdf7e',
  'TechVenture AI',
  'techventure',
  'AI-powered platform automating business operations for mid-market companies, reducing operational costs by 40% through intelligent workflow optimization.',
  'https://via.placeholder.com/400x400/28CB88/FFFFFF?text=TV',
  'https://techventure.ai',
  'https://techventure.ai/deck.pdf',
  'TechVenture AI is revolutionizing business automation for mid-market companies. Our AI-powered platform learns your business processes and automatically optimizes workflows, reducing operational costs by an average of 40% while improving accuracy and speed. With our no-code interface, teams can deploy AI automation in days, not months.',
  'SaaS/B2B/AI & Automation',
  'Seed',
  82,
  'techventure-ai',
  'techventureai',
  'techventure.ai',
  'techventureai',
  NOW() - INTERVAL '30 days',
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  username = EXCLUDED.username,
  tagline = EXCLUDED.tagline,
  logo_url = EXCLUDED.logo_url,
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  sector = EXCLUDED.sector,
  stage = EXCLUDED.stage,
  readiness_score = EXCLUDED.readiness_score,
  linkedin = EXCLUDED.linkedin,
  twitter = EXCLUDED.twitter,
  instagram = EXCLUDED.instagram,
  tiktok = EXCLUDED.tiktok,
  updated_at = NOW();

-- ============================================
-- RE-ENABLE RLS
-- ============================================
-- Re-enable Row Level Security after inserting mock data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUMMARY
-- ============================================
-- Mock data created for:
-- ✓ 1 Startup profile (TechVenture AI) - User ID: d5629bd5-aaaf-42bc-9de4-1f222eacdf7e
--
-- To use this data:
-- 1. Make sure the auth user exists in Supabase Authentication first
-- 2. Run this SQL in your Supabase SQL editor
-- 3. Log in as demo@techstartup.io to see the startup dashboard
--
-- To test investor matching:
-- 1. Create investor accounts by signing up through the app at /auth/signup
-- 2. Select "Investor" role during signup
-- 3. Complete the investor onboarding flow
-- 4. Those investor profiles will then appear in the startup's dashboard
--
-- Note: You cannot create investor profiles via SQL because they require
-- real auth users to exist first. The app's signup flow handles this automatically.
-- ============================================

-- Verification query
SELECT 'Mock startup profile created successfully!' as status;
SELECT company_name, sector, stage, readiness_score
FROM startup_profiles
WHERE user_id = 'd5629bd5-aaaf-42bc-9de4-1f222eacdf7e';
