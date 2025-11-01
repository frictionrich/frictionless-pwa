-- Database Migration - Add Alamo Angel Investor Profiles
-- This migration adds 6 real investor profiles from the Alamo Angels network

-- ============================================
-- DISABLE RLS FOR INVESTOR PROFILE INSERTS
-- ============================================
-- RLS policies require auth.uid() which is NULL when running SQL scripts directly
-- We temporarily disable RLS, insert the data, then re-enable it

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. CREATE AUTH USERS FOR INVESTORS
-- ============================================

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES
  -- Luis Martínez - Capital Factory
  (
    '00000000-0000-0000-0000-000000000000',
    'aa000001-0001-0001-0001-000000000001',
    'authenticated',
    'authenticated',
    'luis@capitalfactory.com',
    '$2a$10$dummyhashedpasswordforalamoinvestor1',
    NOW() - INTERVAL '365 days',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Luis Martínez"}',
    NOW() - INTERVAL '365 days',
    NOW(),
    '',
    ''
  ),
  -- Mike Troy - Geekdom Fund
  (
    '00000000-0000-0000-0000-000000000000',
    'aa000002-0002-0002-0002-000000000002',
    'authenticated',
    'authenticated',
    'mike@geekdomfund.com',
    '$2a$10$dummyhashedpasswordforalamoinvestor2',
    NOW() - INTERVAL '360 days',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Mike Troy"}',
    NOW() - INTERVAL '360 days',
    NOW(),
    '',
    ''
  ),
  -- Mariano González - MGV Capital
  (
    '00000000-0000-0000-0000-000000000000',
    'aa000003-0003-0003-0003-000000000003',
    'authenticated',
    'authenticated',
    'mariano@mgvcapital.com',
    '$2a$10$dummyhashedpasswordforalamoinvestor3',
    NOW() - INTERVAL '355 days',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Mariano González"}',
    NOW() - INTERVAL '355 days',
    NOW(),
    '',
    ''
  ),
  -- Will Conway - Tech Bloc / Mailgun
  (
    '00000000-0000-0000-0000-000000000000',
    'aa000004-0004-0004-0004-000000000004',
    'authenticated',
    'authenticated',
    'will@techbloc.org',
    '$2a$10$dummyhashedpasswordforalamoinvestor4',
    NOW() - INTERVAL '350 days',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Will Conway"}',
    NOW() - INTERVAL '350 days',
    NOW(),
    '',
    ''
  ),
  -- Beto Altamirano - Irys Insights
  (
    '00000000-0000-0000-0000-000000000000',
    'aa000005-0005-0005-0005-000000000005',
    'authenticated',
    'authenticated',
    'beto@irysinsights.com',
    '$2a$10$dummyhashedpasswordforalamoinvestor5',
    NOW() - INTERVAL '345 days',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Beto Altamirano"}',
    NOW() - INTERVAL '345 days',
    NOW(),
    '',
    ''
  ),
  -- Alfonso García - 365 Retail Markets / Tech Bloc
  (
    '00000000-0000-0000-0000-000000000000',
    'aa000006-0006-0006-0006-000000000006',
    'authenticated',
    'authenticated',
    'alfonso@365retailmarkets.com',
    '$2a$10$dummyhashedpasswordforalamoinvestor6',
    NOW() - INTERVAL '340 days',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alfonso García"}',
    NOW() - INTERVAL '340 days',
    NOW(),
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE PROFILES
-- ============================================

INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES
  ('aa000001-0001-0001-0001-000000000001', 'luis@capitalfactory.com', 'investor', NOW() - INTERVAL '365 days', NOW()),
  ('aa000002-0002-0002-0002-000000000002', 'mike@geekdomfund.com', 'investor', NOW() - INTERVAL '360 days', NOW()),
  ('aa000003-0003-0003-0003-000000000003', 'mariano@mgvcapital.com', 'investor', NOW() - INTERVAL '355 days', NOW()),
  ('aa000004-0004-0004-0004-000000000004', 'will@techbloc.org', 'investor', NOW() - INTERVAL '350 days', NOW()),
  ('aa000005-0005-0005-0005-000000000005', 'beto@irysinsights.com', 'investor', NOW() - INTERVAL '345 days', NOW()),
  ('aa000006-0006-0006-0006-000000000006', 'alfonso@365retailmarkets.com', 'investor', NOW() - INTERVAL '340 days', NOW())
ON CONFLICT (id) DO UPDATE
SET updated_at = NOW();

-- ============================================
-- 3. CREATE INVESTOR PROFILES
-- ============================================

INSERT INTO investor_profiles (
  user_id,
  organization_name,
  investor_name,
  headquarters,
  website,
  focus_sectors,
  focus_stages,
  geography_focus,
  investment_thesis,
  value_add,
  created_at,
  updated_at
) VALUES
  -- Luis Martínez - Capital Factory
  (
    'aa000001-0001-0001-0001-000000000001',
    'Capital Factory',
    'Luis Martínez',
    'Austin, Texas, USA',
    'https://capitalfactory.com',
    ARRAY['AI', 'SaaS', 'FinTech', 'HealthTech'],
    ARRAY['Pre-seed', 'Seed', 'Series A'],
    ARRAY['Texas', 'LATAM'],
    'Capital Factory focuses on high-growth technology companies with a strong product-market fit. We invest in founders building transformative solutions in AI, SaaS, FinTech, and HealthTech, with a particular interest in Texas-based companies and LATAM expansion opportunities.',
    'Access to Capital Factory''s extensive network of mentors, corporate partners, and follow-on investors. We provide hands-on support with go-to-market strategy, fundraising, and scaling operations across Texas and Latin America.',
    NOW() - INTERVAL '365 days',
    NOW()
  ),
  -- Mike Troy - Geekdom Fund
  (
    'aa000002-0002-0002-0002-000000000002',
    'Geekdom Fund',
    'Mike Troy',
    'San Antonio, Texas, USA',
    'https://geekdom.com',
    ARRAY['AI', 'Automation', 'Robotics', 'SaaS'],
    ARRAY['Pre-seed', 'Seed'],
    ARRAY['Texas', 'US'],
    'Geekdom Fund invests in early-stage Texas startups building the future of intelligent automation. We focus on AI-driven solutions, robotics, and B2B SaaS platforms that solve real problems for enterprise customers.',
    'Deep connections within the Texas startup ecosystem, access to Geekdom''s coworking and community resources, and mentorship from experienced operators who have scaled successful technology companies.',
    NOW() - INTERVAL '360 days',
    NOW()
  ),
  -- Mariano González - MGV Capital
  (
    'aa000003-0003-0003-0003-000000000003',
    'MGV Capital',
    'Mariano González',
    'Austin, Texas, USA',
    'https://mgvcapital.com',
    ARRAY['AI/ML', 'B2B SaaS', 'Deep Tech', 'Data Infrastructure'],
    ARRAY['Seed', 'Series A'],
    ARRAY['Texas', 'US', 'LATAM'],
    'MGV Capital invests in technical founders building category-defining B2B solutions. We focus on AI/automation, deep tech, and data infrastructure companies with strong technical moats and clear paths to enterprise adoption.',
    'Strategic guidance on product development, enterprise sales, and technical hiring. Our portfolio includes multiple successful exits in AI and B2B SaaS, providing valuable pattern recognition for scaling technical companies.',
    NOW() - INTERVAL '355 days',
    NOW()
  ),
  -- Will Conway - Tech Bloc / Mailgun
  (
    'aa000004-0004-0004-0004-000000000004',
    'Tech Bloc',
    'Will Conway',
    'San Antonio, Texas, USA',
    'https://techbloc.org',
    ARRAY['SaaS', 'DevOps', 'Infrastructure', 'Developer Tools'],
    ARRAY['Seed', 'Series A'],
    ARRAY['Texas', 'US'],
    'As a former Mailgun executive, I invest in developer-focused tools and infrastructure companies that solve real technical problems. I look for founders with deep domain expertise building products that developers love and enterprises need.',
    'Operational expertise from scaling Mailgun, strategic introductions to enterprise customers and technical talent, and deep understanding of developer-first go-to-market strategies. Active involvement in ecosystem development through Tech Bloc.',
    NOW() - INTERVAL '350 days',
    NOW()
  ),
  -- Beto Altamirano - Irys Insights
  (
    'aa000005-0005-0005-0005-000000000005',
    'Irys Insights',
    'Beto Altamirano',
    'San Antonio, Texas, USA',
    'https://irysinsights.com',
    ARRAY['Smart Cities', 'IoT', 'Civic Innovation', 'ESG', 'Climate Tech'],
    ARRAY['Pre-seed', 'Seed'],
    ARRAY['Texas', 'US', 'LATAM'],
    'Irys Insights focuses on companies creating positive social and environmental impact through technology. We invest in smart city solutions, IoT platforms, and civic innovation that address real community challenges while building sustainable businesses.',
    'Access to municipal and government partnerships, ESG expertise, and connections within the impact investing community. We help startups navigate public sector procurement and build sustainable business models that create measurable social value.',
    NOW() - INTERVAL '345 days',
    NOW()
  ),
  -- Alfonso García - 365 Retail Markets / Tech Bloc
  (
    'aa000006-0006-0006-0006-000000000006',
    '365 Retail Markets / Tech Bloc',
    'Alfonso García',
    'San Antonio, Texas, USA',
    'https://365retailmarkets.com',
    ARRAY['AI', 'FinTech', 'CleanTech', 'Consumer Tech', 'Marketplace'],
    ARRAY['Seed', 'Series A'],
    ARRAY['Texas', 'US', 'LATAM'],
    'Cross-industry investor with experience scaling consumer-facing businesses and marketplaces. I invest in companies applying AI and automation to traditional industries, with a focus on FinTech, CleanTech, and consumer marketplace innovation.',
    'Operational expertise from building 365 Retail Markets, strategic advice on scaling consumer businesses, and extensive network in both B2B and B2C markets. Strong connections to corporate partners and follow-on investors through Tech Bloc.',
    NOW() - INTERVAL '340 days',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  investor_name = EXCLUDED.investor_name,
  headquarters = EXCLUDED.headquarters,
  website = EXCLUDED.website,
  focus_sectors = EXCLUDED.focus_sectors,
  focus_stages = EXCLUDED.focus_stages,
  geography_focus = EXCLUDED.geography_focus,
  investment_thesis = EXCLUDED.investment_thesis,
  value_add = EXCLUDED.value_add,
  updated_at = NOW();

-- ============================================
-- RE-ENABLE RLS
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Verification
SELECT 'Alamo Angel investor profiles added successfully!' as status;

-- Show the newly created investor profiles
SELECT
  ip.organization_name,
  ip.investor_name,
  ip.headquarters,
  array_to_string(ip.focus_sectors, ', ') as focus_sectors,
  array_to_string(ip.geography_focus, ', ') as geography_focus
FROM investor_profiles ip
WHERE ip.user_id IN (
  'aa000001-0001-0001-0001-000000000001',
  'aa000002-0002-0002-0002-000000000002',
  'aa000003-0003-0003-0003-000000000003',
  'aa000004-0004-0004-0004-000000000004',
  'aa000005-0005-0005-0005-000000000005',
  'aa000006-0006-0006-0006-000000000006'
)
ORDER BY ip.created_at;
