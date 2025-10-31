-- Mock Data for Frictionless Platform
-- User ID: d5629bd5-aaaf-42bc-9de4-1f222eacdf7e
-- This script creates realistic mock data to showcase all platform features

-- ============================================
-- DISABLE RLS FOR MOCK DATA INSERTS
-- ============================================
-- RLS policies require auth.uid() which is NULL when running SQL scripts directly
-- We temporarily disable RLS, insert the data, then re-enable it

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. CREATE PROFILE FOR TEST USER
-- ============================================

-- Insert or update profile (as startup)
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
-- 3. CREATE MOCK INVESTOR PROFILES
-- ============================================

-- Create 5 mock investors to show in the investors list

-- Investor 1: Capital Factory
DO $$
DECLARE
  investor_id_1 UUID := 'a1111111-1111-1111-1111-111111111111';
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (investor_id_1, 'luis@capitalfactory.com', 'investor', NOW() - INTERVAL '90 days', NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'investor';

  INSERT INTO investor_profiles (
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
    investor_id_1,
    'Capital Factory',
    'capitalfactory',
    'Texas'' largest startup accelerator. We invest in AI, SaaS, FinTech, and HealthTech startups with strong Texas and LATAM connections.',
    'https://via.placeholder.com/400x400/1E40AF/FFFFFF?text=CF',
    'https://capitalfactory.com',
    'Capital Factory is Texas'' center of gravity for entrepreneurs. We are the most active investor in Texas startups, with focus on AI, SaaS, FinTech, and HealthTech. We provide startups with funding, mentorship, and a collaborative community.',
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
  ON CONFLICT (user_id) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    username = EXCLUDED.username,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    focus_sectors = EXCLUDED.focus_sectors,
    focus_stages = EXCLUDED.focus_stages,
    updated_at = NOW();
END $$;

-- Investor 2: Geekdom Fund
DO $$
DECLARE
  investor_id_2 UUID := 'a2222222-2222-2222-2222-222222222222';
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (investor_id_2, 'mike@geekdomfund.com', 'investor', NOW() - INTERVAL '85 days', NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'investor';

  INSERT INTO investor_profiles (
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
    investor_id_2,
    'Geekdom Fund',
    'geekdomfund',
    'Early-stage fund focused on AI, automation, robotics, and SaaS. We back technical founders building the future of work.',
    'https://via.placeholder.com/400x400/DC2626/FFFFFF?text=GF',
    'https://geekdomfund.com',
    'Geekdom Fund invests in early-stage startups revolutionizing industries through technology. We focus on AI, automation, robotics, and SaaS companies with technical founders and clear paths to product-market fit.',
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
  ON CONFLICT (user_id) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    username = EXCLUDED.username,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    focus_sectors = EXCLUDED.focus_sectors,
    focus_stages = EXCLUDED.focus_stages,
    updated_at = NOW();
END $$;

-- Investor 3: MGV Capital
DO $$
DECLARE
  investor_id_3 UUID := 'a3333333-3333-3333-3333-333333333333';
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (investor_id_3, 'mariano@mgvcapital.com', 'investor', NOW() - INTERVAL '80 days', NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'investor';

  INSERT INTO investor_profiles (
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
    investor_id_3,
    'MGV Capital',
    'mgvcapital',
    'Deep tech investor backing AI/automation, B2B SaaS, and data infrastructure companies building transformative technologies.',
    'https://via.placeholder.com/400x400/7C3AED/FFFFFF?text=MGV',
    'https://mgvcapital.com',
    'MGV Capital partners with technical founders building deep tech companies. We invest in AI/automation, B2B SaaS, and data infrastructure with focus on companies solving complex technical challenges with massive market potential.',
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
  ON CONFLICT (user_id) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    username = EXCLUDED.username,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    focus_sectors = EXCLUDED.focus_sectors,
    focus_stages = EXCLUDED.focus_stages,
    updated_at = NOW();
END $$;

-- Investor 4: Irys Insights
DO $$
DECLARE
  investor_id_4 UUID := 'a4444444-4444-4444-4444-444444444444';
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (investor_id_4, 'beto@irysinsights.com', 'investor', NOW() - INTERVAL '75 days', NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'investor';

  INSERT INTO investor_profiles (
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
    investor_id_4,
    'Irys Insights',
    'irysinsights',
    'Impact investor focused on Smart Cities, IoT, Civic Innovation, and ESG. We back companies making cities more sustainable and livable.',
    'https://via.placeholder.com/400x400/059669/FFFFFF?text=II',
    'https://irysinsights.com',
    'Irys Insights invests in companies building the future of urban living. We focus on Smart Cities, IoT, Civic Innovation, and ESG-focused startups that make cities more sustainable, efficient, and livable for all residents.',
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
  ON CONFLICT (user_id) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    username = EXCLUDED.username,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    focus_sectors = EXCLUDED.focus_sectors,
    focus_stages = EXCLUDED.focus_stages,
    updated_at = NOW();
END $$;

-- Investor 5: Venture Heights
DO $$
DECLARE
  investor_id_5 UUID := 'a5555555-5555-5555-5555-555555555555';
BEGIN
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (investor_id_5, 'alfonso@ventureheights.com', 'investor', NOW() - INTERVAL '70 days', NOW())
  ON CONFLICT (id) DO UPDATE SET role = 'investor';

  INSERT INTO investor_profiles (
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
    investor_id_5,
    'Venture Heights',
    'ventureheights',
    'Cross-industry investor in AI, FinTech, CleanTech, Consumer, and Marketplace innovation. We back exceptional founders across diverse sectors.',
    'https://via.placeholder.com/400x400/EA580C/FFFFFF?text=VH',
    'https://ventureheights.com',
    'Venture Heights is a sector-agnostic fund investing in exceptional founders building transformative companies. We focus on AI, FinTech, CleanTech, Consumer, and Marketplace innovation with emphasis on strong unit economics and scalability.',
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
  ON CONFLICT (user_id) DO UPDATE SET
    organization_name = EXCLUDED.organization_name,
    username = EXCLUDED.username,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    focus_sectors = EXCLUDED.focus_sectors,
    focus_stages = EXCLUDED.focus_stages,
    updated_at = NOW();
END $$;

-- ============================================
-- RE-ENABLE RLS
-- ============================================
-- Re-enable Row Level Security after inserting mock data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUMMARY
-- ============================================
-- Mock data created for:
-- ✓ 1 Startup profile (TechVenture AI) - ID: d5629bd5-aaaf-42bc-9de4-1f222eacdf7e
-- ✓ 5 Investor profiles with detailed information
-- ✓ All profiles have realistic data including logos, social links, focus areas
-- ✓ Data demonstrates: matching scores, readiness assessment, sector alignment
--
-- To use this data:
-- 1. Run this SQL in your Supabase SQL editor
-- 2. Log in as demo@techstartup.io (create auth user separately)
-- 3. Navigate through all dashboard screens to see functionality
-- ============================================
