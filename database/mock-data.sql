-- Mock Data for Frictionless Platform
-- This script creates sample startup and investor profiles with matches
--
-- IMPORTANT: Before running this script:
-- 1. Make sure to run the database migration scripts first:
--    - 20251031a-add-profile-fields.sql
--    - 20251031b-create-matches-table.sql
-- 2. This script creates mock auth.users entries (not real authentication)
-- 3. For production, users should sign up through the app
--
-- WARNING: This script inserts directly into auth.users which is normally
-- managed by Supabase Auth. These are test accounts only.
-- The passwords are dummy hashes and cannot be used to log in.

-- ============================================
-- DISABLE RLS FOR MOCK DATA INSERTS
-- ============================================
-- RLS policies require auth.uid() which is NULL when running SQL scripts directly
-- We temporarily disable RLS, insert the data, then re-enable it

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. CREATE AUTH USERS
-- ============================================
-- Create mock users in auth.users table
-- Note: These are for testing only. In production, users sign up through the app.

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
  (
    '00000000-0000-0000-0000-000000000000',
    'b6b67a3f-8639-4aff-89ad-fb39551f1507',
    'authenticated',
    'authenticated',
    'juan@stealth.com',
    '$2a$10$dummyhashedpasswordforjuan',
    NOW() - INTERVAL '30 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '30 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000001-0001-0001-0001-000000000001',
    'authenticated',
    'authenticated',
    'contact@ephemeral.io',
    '$2a$10$dummyhashedpasswordforinvestor1',
    NOW() - INTERVAL '180 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '180 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000002-0002-0002-0002-000000000002',
    'authenticated',
    'authenticated',
    'invest@stack3dlab.com',
    '$2a$10$dummyhashedpasswordforinvestor2',
    NOW() - INTERVAL '150 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '150 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '30000003-0003-0003-0003-000000000003',
    'authenticated',
    'authenticated',
    'team@getwarpspeed.com',
    '$2a$10$dummyhashedpasswordforinvestor3',
    NOW() - INTERVAL '120 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '120 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '40000004-0004-0004-0004-000000000004',
    'authenticated',
    'authenticated',
    'hello@cloudwatch.app',
    '$2a$10$dummyhashedpasswordforinvestor4',
    NOW() - INTERVAL '90 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '90 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '50000005-0005-0005-0005-000000000005',
    'authenticated',
    'authenticated',
    'fund@contrastai.com',
    '$2a$10$dummyhashedpasswordforinvestor5',
    NOW() - INTERVAL '60 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '60 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '60000006-0006-0006-0006-000000000006',
    'authenticated',
    'authenticated',
    'team@convergence.io',
    '$2a$10$dummyhashedpasswordforinvestor6',
    NOW() - INTERVAL '45 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '45 days',
    NOW(),
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '70000007-0007-0007-0007-000000000007',
    'authenticated',
    'authenticated',
    'invest@sisyphus.com',
    '$2a$10$dummyhashedpasswordforinvestor7',
    NOW() - INTERVAL '30 days',
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW() - INTERVAL '30 days',
    NOW(),
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. CREATE PROFILES
-- ============================================

-- Startup profile
INSERT INTO profiles (id, email, role, created_at, updated_at)
VALUES (
  'b6b67a3f-8639-4aff-89ad-fb39551f1507',
  'juan@stealth.com',
  'startup',
  NOW() - INTERVAL '30 days',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role = 'startup', updated_at = NOW();

-- Investor profiles
INSERT INTO profiles (id, email, role, created_at, updated_at) VALUES
  ('10000001-0001-0001-0001-000000000001', 'contact@ephemeral.io', 'investor', NOW() - INTERVAL '180 days', NOW()),
  ('20000002-0002-0002-0002-000000000002', 'invest@stack3dlab.com', 'investor', NOW() - INTERVAL '150 days', NOW()),
  ('30000003-0003-0003-0003-000000000003', 'team@getwarpspeed.com', 'investor', NOW() - INTERVAL '120 days', NOW()),
  ('40000004-0004-0004-0004-000000000004', 'hello@cloudwatch.app', 'investor', NOW() - INTERVAL '90 days', NOW()),
  ('50000005-0005-0005-0005-000000000005', 'fund@contrastai.com', 'investor', NOW() - INTERVAL '60 days', NOW()),
  ('60000006-0006-0006-0006-000000000006', 'team@convergence.io', 'investor', NOW() - INTERVAL '45 days', NOW()),
  ('70000007-0007-0007-0007-000000000007', 'invest@sisyphus.com', 'investor', NOW() - INTERVAL '30 days', NOW())
ON CONFLICT (id) DO UPDATE
SET updated_at = NOW();

-- ============================================
-- 3. CREATE STARTUP PROFILE
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
  'b6b67a3f-8639-4aff-89ad-fb39551f1507',
  'Stealth Startup',
  'stealth',
  'Building the future of work automation',
  'https://static.thenounproject.com/png/4631196-200.png',
  'https://stealth.com',
  'https://stealth.com/deck.pdf',
  'We are building innovative solutions for the future of work, focusing on AI-powered automation and workflow optimization.',
  'SaaS/AI & Automation',
  'Seed',
  75,
  'stealth-startup',
  'stealthstartup',
  'stealth.startup',
  'stealthstartup',
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
-- 4. CREATE INVESTOR PROFILES
-- ============================================

INSERT INTO investor_profiles (
  user_id,
  organization_name,
  username,
  tagline,
  logo_url,
  website,
  focus_sectors,
  focus_stages,
  ticket_size_min,
  ticket_size_max,
  created_at,
  updated_at
) VALUES
  (
    '10000001-0001-0001-0001-000000000001',
    'Ephemeral',
    'ephemeral',
    'Early-stage ventures in AI and automation',
    'https://static.thenounproject.com/png/3586383-200.png',
    'ephemeral.io',
    ARRAY['SaaS', 'AI/ML', 'Automation'],
    ARRAY['Pre-seed', 'Seed'],
    500000,
    1000000,
    NOW() - INTERVAL '180 days',
    NOW()
  ),
  (
    '20000002-0002-0002-0002-000000000002',
    'Stack3d Lab',
    'stack3dlab',
    'Building the next generation of B2B software',
    'https://static.thenounproject.com/png/2044851-200.png',
    'stack3dlab.com',
    ARRAY['SaaS', 'B2B', 'FinTech'],
    ARRAY['Seed', 'Series A'],
    500000,
    1000000,
    NOW() - INTERVAL '150 days',
    NOW()
  ),
  (
    '30000003-0003-0003-0003-000000000003',
    'Warpspeed',
    'warpspeed',
    'Accelerating innovation at the speed of light',
    'https://static.thenounproject.com/png/1372766-200.png',
    'getwarpspeed.com',
    ARRAY['SaaS', 'AI/ML', 'Productivity'],
    ARRAY['Pre-seed', 'Seed'],
    500000,
    1000000,
    NOW() - INTERVAL '120 days',
    NOW()
  ),
  (
    '40000004-0004-0004-0004-000000000004',
    'CloudWatch',
    'cloudwatch',
    'Infrastructure and cloud-native investments',
    'https://static.thenounproject.com/png/2933808-200.png',
    'cloudwatch.app',
    ARRAY['SaaS', 'Cloud', 'Infrastructure'],
    ARRAY['Seed', 'Series A'],
    500000,
    1000000,
    NOW() - INTERVAL '90 days',
    NOW()
  ),
  (
    '50000005-0005-0005-0005-000000000005',
    'ContrastAI',
    'contrastai',
    'AI-first fund backing transformative technologies',
    'https://static.thenounproject.com/png/3512047-200.png',
    'contrastai.com',
    ARRAY['AI/ML', 'Deep Tech'],
    ARRAY['Seed', 'Series A'],
    500000,
    1000000,
    NOW() - INTERVAL '60 days',
    NOW()
  ),
  (
    '60000006-0006-0006-0006-000000000006',
    'Convergence',
    'convergence',
    'Where technology meets opportunity',
    'https://static.thenounproject.com/png/1863654-200.png',
    'convergence.io',
    ARRAY['E-commerce', 'Marketplace', 'Consumer'],
    ARRAY['Pre-seed', 'Seed'],
    500000,
    1000000,
    NOW() - INTERVAL '45 days',
    NOW()
  ),
  (
    '70000007-0007-0007-0007-000000000007',
    'Sisyphus',
    'sisyphus',
    'Patient capital for ambitious founders',
    'https://static.thenounproject.com/png/2553924-200.png',
    'sisyphus.com',
    ARRAY['HealthTech', 'BioTech', 'Science'],
    ARRAY['Seed', 'Series A'],
    500000,
    1000000,
    NOW() - INTERVAL '30 days',
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE SET
  organization_name = EXCLUDED.organization_name,
  username = EXCLUDED.username,
  tagline = EXCLUDED.tagline,
  website = EXCLUDED.website,
  focus_sectors = EXCLUDED.focus_sectors,
  focus_stages = EXCLUDED.focus_stages,
  ticket_size_min = EXCLUDED.ticket_size_min,
  ticket_size_max = EXCLUDED.ticket_size_max,
  updated_at = NOW();

-- ============================================
-- 5. CREATE MATCHES
-- ============================================

INSERT INTO matches (startup_id, investor_id, match_percentage, status, created_at, updated_at) VALUES
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '10000001-0001-0001-0001-000000000001', 92, 'pending', NOW() - INTERVAL '5 days', NOW()),
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '20000002-0002-0002-0002-000000000002', 92, 'pending', NOW() - INTERVAL '5 days', NOW()),
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '30000003-0003-0003-0003-000000000003', 92, 'pending', NOW() - INTERVAL '4 days', NOW()),
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '40000004-0004-0004-0004-000000000004', 92, 'pending', NOW() - INTERVAL '3 days', NOW()),
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '50000005-0005-0005-0005-000000000005', 65, 'pending', NOW() - INTERVAL '2 days', NOW()),
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '60000006-0006-0006-0006-000000000006', 20, 'pending', NOW() - INTERVAL '1 day', NOW()),
  ('b6b67a3f-8639-4aff-89ad-fb39551f1507', '70000007-0007-0007-0007-000000000007', 20, 'pending', NOW(), NOW())
ON CONFLICT (startup_id, investor_id) DO UPDATE SET
  match_percentage = EXCLUDED.match_percentage,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================
-- RE-ENABLE RLS
-- ============================================
-- Re-enable Row Level Security after inserting mock data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SUMMARY
-- ============================================
-- Mock data created for:
-- ✓ 8 Auth users (1 startup + 7 investors)
-- ✓ 8 Profiles (1 startup + 7 investors)
-- ✓ 1 Startup profile (Stealth Startup)
-- ✓ 7 Investor profiles (Ephemeral, Stack3d Lab, Warpspeed, CloudWatch, ContrastAI, Convergence, Sisyphus)
-- ✓ 7 Matches with varying percentages (92%, 92%, 92%, 92%, 65%, 20%, 20%)
--
-- To use this data:
-- 1. Make sure to run all migration scripts first
-- 2. Run this SQL in your Supabase SQL editor
-- 3. The mock users are created but with dummy passwords
-- 4. To actually log in, you'll need to reset passwords via Supabase Dashboard
--    or create new users through the app signup flow
--
-- Test Users Created:
-- - juan@stealth.com (startup)
-- - contact@ephemeral.io (investor)
-- - invest@stack3dlab.com (investor)
-- - team@getwarpspeed.com (investor)
-- - hello@cloudwatch.app (investor)
-- - fund@contrastai.com (investor)
-- - team@convergence.io (investor)
-- - invest@sisyphus.com (investor)
-- ============================================

-- Verification queries
SELECT 'Mock data created successfully!' as status;

SELECT 'Startup Profile:' as section;
SELECT company_name, sector, stage, readiness_score
FROM startup_profiles
WHERE user_id = 'b6b67a3f-8639-4aff-89ad-fb39551f1507';

SELECT 'Investor Profiles:' as section;
SELECT COUNT(*) as total_investors
FROM investor_profiles;

SELECT 'Matches:' as section;
SELECT
  ip.organization_name,
  m.match_percentage,
  m.status
FROM matches m
JOIN investor_profiles ip ON ip.user_id = m.investor_id
WHERE m.startup_id = 'b6b67a3f-8639-4aff-89ad-fb39551f1507'
ORDER BY m.match_percentage DESC;
