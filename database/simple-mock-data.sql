-- Simple Mock Data for Frictionless Platform
-- This version inserts ONLY profile data for existing auth users
--
-- HOW TO USE:
-- 1. Create a user in Supabase Authentication first (manually or via signup)
-- 2. Get the user's UUID from the auth.users table or the signup response
-- 3. Replace 'YOUR_USER_ID_HERE' below with your actual user UUID
-- 4. Run this script
--
-- This will create demo investor profiles that will show up in your startup dashboard

-- ============================================
-- DISABLE RLS FOR MOCK DATA INSERTS
-- ============================================
-- RLS policies require auth.uid() which is NULL when running SQL scripts directly

ALTER TABLE investor_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- INSERT MOCK INVESTOR PROFILES
-- (These don't need auth users - they're just data)
-- ============================================

-- We'll insert investor profiles directly without creating auth users
-- These will show up in the startup dashboard as potential matches

-- Clear existing mock data (optional)
-- DELETE FROM investor_profiles WHERE organization_name IN ('Capital Factory', 'Geekdom Fund', 'MGV Capital', 'Irys Insights', 'Venture Heights');

-- Investor 1: Capital Factory
INSERT INTO investor_profiles (
  id,
  user_id,
  organization_name,
  username,
  tagline,
  logo_url,
  website,
  description,
  focus_sectors,
  focus_stages,
  ticket_size_min,
  ticket_size_max,
  geography,
  twitter,
  facebook,
  linkedin,
  created_at,
  updated_at
) VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111', -- Placeholder UUID (not a real auth user)
  'Capital Factory',
  'capitalfactory',
  'Texas'' largest startup accelerator. We invest in AI, SaaS, FinTech, and HealthTech startups with strong Texas and LATAM connections.',
  'https://via.placeholder.com/400x400/1E40AF/FFFFFF?text=CF',
  'https://capitalfactory.com',
  'Capital Factory is Texas'' center of gravity for entrepreneurs. We are the most active investor in Texas startups, with focus on AI, SaaS, FinTech, and HealthTech.',
  ARRAY['AI', 'SaaS', 'FinTech', 'HealthTech'],
  ARRAY['Pre-seed', 'Seed', 'Series A'],
  50000,
  500000,
  ARRAY['Texas', 'LATAM'],
  'capitalfactory',
  'capitalfactory',
  'company/capital-factory',
  NOW() - INTERVAL '90 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  updated_at = NOW();

-- Investor 2: Geekdom Fund
INSERT INTO investor_profiles (
  id,
  user_id,
  organization_name,
  username,
  tagline,
  logo_url,
  website,
  description,
  focus_sectors,
  focus_stages,
  ticket_size_min,
  ticket_size_max,
  geography,
  twitter,
  facebook,
  linkedin,
  created_at,
  updated_at
) VALUES (
  'a2222222-2222-2222-2222-222222222222',
  'a2222222-2222-2222-2222-222222222222',
  'Geekdom Fund',
  'geekdomfund',
  'Early-stage fund focused on AI, automation, robotics, and SaaS. We back technical founders building the future of work.',
  'https://via.placeholder.com/400x400/DC2626/FFFFFF?text=GF',
  'https://geekdomfund.com',
  'Geekdom Fund invests in early-stage startups revolutionizing industries through technology.',
  ARRAY['AI', 'Automation', 'Robotics', 'SaaS'],
  ARRAY['Pre-seed', 'Seed'],
  25000,
  250000,
  ARRAY['Texas', 'US Southwest'],
  'geekdomfund',
  'geekdomfund',
  'company/geekdom-fund',
  NOW() - INTERVAL '85 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  updated_at = NOW();

-- Investor 3: MGV Capital
INSERT INTO investor_profiles (
  id,
  user_id,
  organization_name,
  username,
  tagline,
  logo_url,
  website,
  description,
  focus_sectors,
  focus_stages,
  ticket_size_min,
  ticket_size_max,
  geography,
  twitter,
  facebook,
  linkedin,
  created_at,
  updated_at
) VALUES (
  'a3333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  'MGV Capital',
  'mgvcapital',
  'Deep tech investor backing AI/automation, B2B SaaS, and data infrastructure companies building transformative technologies.',
  'https://via.placeholder.com/400x400/7C3AED/FFFFFF?text=MGV',
  'https://mgvcapital.com',
  'MGV Capital partners with technical founders building deep tech companies.',
  ARRAY['AI', 'B2B SaaS', 'Deep Tech', 'Data Infrastructure'],
  ARRAY['Seed', 'Series A'],
  100000,
  1000000,
  ARRAY['North America', 'Europe'],
  'mgvcapital',
  'mgvcapital',
  'company/mgv-capital',
  NOW() - INTERVAL '80 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  updated_at = NOW();

-- Investor 4: Irys Insights
INSERT INTO investor_profiles (
  id,
  user_id,
  organization_name,
  username,
  tagline,
  logo_url,
  website,
  description,
  focus_sectors,
  focus_stages,
  ticket_size_min,
  ticket_size_max,
  geography,
  twitter,
  facebook,
  linkedin,
  created_at,
  updated_at
) VALUES (
  'a4444444-4444-4444-4444-444444444444',
  'a4444444-4444-4444-4444-444444444444',
  'Irys Insights',
  'irysinsights',
  'Impact investor focused on Smart Cities, IoT, Civic Innovation, and ESG.',
  'https://via.placeholder.com/400x400/059669/FFFFFF?text=II',
  'https://irysinsights.com',
  'Irys Insights invests in companies building the future of urban living.',
  ARRAY['Smart Cities', 'IoT', 'Civic Innovation', 'ESG'],
  ARRAY['Seed', 'Series A'],
  75000,
  750000,
  ARRAY['US', 'Global'],
  'irysinsights',
  'irysinsights',
  'company/irys-insights',
  NOW() - INTERVAL '75 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  updated_at = NOW();

-- Investor 5: Venture Heights
INSERT INTO investor_profiles (
  id,
  user_id,
  organization_name,
  username,
  tagline,
  logo_url,
  website,
  description,
  focus_sectors,
  focus_stages,
  ticket_size_min,
  ticket_size_max,
  geography,
  twitter,
  facebook,
  linkedin,
  created_at,
  updated_at
) VALUES (
  'a5555555-5555-5555-5555-555555555555',
  'a5555555-5555-5555-5555-555555555555',
  'Venture Heights',
  'ventureheights',
  'Cross-industry investor in AI, FinTech, CleanTech, Consumer, and Marketplace innovation.',
  'https://via.placeholder.com/400x400/EA580C/FFFFFF?text=VH',
  'https://ventureheights.com',
  'Venture Heights is a sector-agnostic fund investing in exceptional founders.',
  ARRAY['AI', 'FinTech', 'CleanTech', 'Consumer', 'Marketplace'],
  ARRAY['Pre-seed', 'Seed', 'Series A'],
  50000,
  500000,
  ARRAY['North America'],
  'ventureheights',
  'ventureheights',
  'company/venture-heights',
  NOW() - INTERVAL '70 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  updated_at = NOW();

-- ============================================
-- OPTIONAL: ADD YOUR STARTUP PROFILE
-- ============================================
-- Uncomment and update this section with your actual auth user ID

/*
INSERT INTO startup_profiles (
  user_id,
  company_name,
  username,
  tagline,
  logo_url,
  website,
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
  'YOUR_USER_ID_HERE', -- Replace with your actual auth user UUID
  'TechVenture AI',
  'techventure',
  'AI-powered platform automating business operations for mid-market companies.',
  'https://via.placeholder.com/400x400/28CB88/FFFFFF?text=TV',
  'https://techventure.ai',
  'TechVenture AI revolutionizes business automation for mid-market companies.',
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
  updated_at = NOW();
*/

-- ============================================
-- RE-ENABLE RLS
-- ============================================

ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Mock investor profiles created:' as status;
SELECT organization_name, focus_sectors, ticket_size_min, ticket_size_max
FROM investor_profiles
ORDER BY created_at DESC;
