# Deployment Guide

This guide covers deployment to Vercel and setting up the Supabase database.

## Supabase Setup

### 1. Database Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('startup', 'investor', 'admin');

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Startup profiles table
CREATE TABLE startup_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  username TEXT,
  tagline TEXT,
  logo_url TEXT,
  website TEXT,
  pitch_deck_url TEXT,
  description TEXT,
  sector TEXT,
  stage TEXT,
  readiness_score NUMERIC,
  linkedin TEXT,
  twitter TEXT,
  instagram TEXT,
  tiktok TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(username)
);

-- Investor profiles table
CREATE TABLE investor_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT,
  username TEXT,
  tagline TEXT,
  logo_url TEXT,
  website TEXT,
  investor_deck_url TEXT,
  description TEXT,
  focus_sectors TEXT[],
  focus_stages TEXT[],
  ticket_size_min NUMERIC,
  ticket_size_max NUMERIC,
  geography TEXT[],
  twitter TEXT,
  facebook TEXT,
  linkedin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(username)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Startup profiles policies
CREATE POLICY "Startups can view their own profile"
  ON startup_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Startups can update their own profile"
  ON startup_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Startups can insert their own profile"
  ON startup_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Investors can view startup profiles"
  ON startup_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'investor'
    )
  );

-- Investor profiles policies
CREATE POLICY "Investors can view their own profile"
  ON investor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Investors can update their own profile"
  ON investor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Investors can insert their own profile"
  ON investor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Startups can view investor profiles"
  ON investor_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'startup'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_startup_profiles_updated_at
  BEFORE UPDATE ON startup_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investor_profiles_updated_at
  BEFORE UPDATE ON investor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.1 Update Existing Database (If tables already exist)

If you already have the tables created, run these ALTER TABLE commands to add the new fields:

```sql
-- Add new fields to startup_profiles
ALTER TABLE startup_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT;

-- Add unique constraint on username
ALTER TABLE startup_profiles
  ADD CONSTRAINT startup_profiles_username_key UNIQUE (username);

-- Add new fields to investor_profiles
ALTER TABLE investor_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS linkedin TEXT;

-- Add unique constraint on username
ALTER TABLE investor_profiles
  ADD CONSTRAINT investor_profiles_username_key UNIQUE (username);
```

### 2. Storage Buckets

Create three storage buckets in Supabase:

1. **pitch-decks**
   - Public: No
   - File size limit: 50MB
   - Allowed MIME types: application/pdf, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation

2. **investor-decks**
   - Public: No
   - File size limit: 50MB
   - Allowed MIME types: application/pdf, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation

3. **logos**
   - Public: Yes
   - File size limit: 5MB
   - Allowed MIME types: image/svg+xml, image/png, image/jpeg, image/gif

### 3. Storage Policies

For each bucket, add these policies:

```sql
-- Policy for authenticated users to upload to pitch-decks
CREATE POLICY "Startups can upload pitch decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pitch-decks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own files
CREATE POLICY "Users can view their own pitch decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Similar policies for investor-decks
CREATE POLICY "Investors can upload investor decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'investor-decks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own investor decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'investor-decks' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. Authentication Configuration

In Supabase Dashboard > Authentication > Providers:

1. Enable Email provider
2. Enable Google OAuth:
   - Add your Google OAuth Client ID
   - Add your Google OAuth Client Secret
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`

3. Configure redirect URLs in Site URL settings:
   - Site URL: `http://localhost:3001` (development)
   - Add redirect URL: `http://localhost:3001/auth/callback`
   - For production, add your Vercel domain

## Vercel Deployment

### 1. Prepare Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 3. Environment Variables

Add these in Vercel dashboard (Settings > Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

Make sure to add them for:
- Production
- Preview
- Development

### 4. Deploy

Click "Deploy" and Vercel will:
1. Build your application
2. Deploy to a production URL
3. Set up automatic deployments for future pushes

### 5. Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs to match your domain

## Post-Deployment

### 1. Update Supabase URLs

In Supabase Dashboard > Authentication > URL Configuration:
- Update Site URL to your Vercel domain
- Add authorized redirect URLs:
  - `https://your-domain.com/auth/callback`
  - `https://your-domain.vercel.app/auth/callback`

### 2. Test Authentication

1. Visit your deployed site
2. Try signing up with email
3. Test Google OAuth
4. Verify onboarding flows work
5. Check dashboard access

### 3. Monitor

- Check Vercel Analytics for performance
- Monitor Supabase logs for errors
- Set up error tracking (optional: Sentry)

## Staging Environment

To create a staging environment:

1. Create a separate Supabase project for staging
2. In Vercel, create environment-specific variables
3. Use Git branches:
   - `main` → Production
   - `staging` → Staging environment

## Troubleshooting

### Build Fails

- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors: `npm run build` locally

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check redirect URLs are properly configured
- Ensure RLS policies are set up correctly

### Database Connection Issues

- Verify Supabase project is active
- Check environment variables are set in Vercel
- Test database connection with Supabase client

## Security Checklist

- [ ] All environment variables are set in Vercel
- [ ] Supabase RLS policies are enabled on all tables
- [ ] Storage bucket policies restrict access appropriately
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Sensitive keys are not committed to repository
- [ ] Google OAuth credentials are configured correctly
- [ ] Redirect URLs are whitelisted in Supabase

## Performance Optimization

- Static pages are automatically optimized by Next.js
- Images use Next.js Image component for optimization
- Service worker caches static assets
- Consider adding:
  - CDN for assets (Vercel does this automatically)
  - Database indexes for common queries
  - Caching for frequently accessed data

---

Your Frictionless app should now be deployed and ready to use!
