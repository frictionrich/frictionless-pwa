# Database Setup Guide

Follow these steps in order to set up your Frictionless database.

## Step 1: Initial Database Setup

If this is your first time setting up the database, run the SQL commands in `DEPLOYMENT.md` section 1 (Database Tables).

This creates:
- `profiles` table
- `startup_profiles` table
- `investor_profiles` table
- Row Level Security policies
- Updated_at triggers

## Step 2: Run Database Migration

**Run this file:** `database-migration.sql`

This adds the new columns needed for the settings pages:

**For startup_profiles:**
- `username` (unique)
- `tagline`
- `logo_url`
- `linkedin`
- `twitter`
- `instagram`
- `tiktok`

**For investor_profiles:**
- `username` (unique)
- `tagline`
- `logo_url`
- `twitter`
- `facebook`
- `linkedin`

### How to run:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the contents of `database-migration.sql`
5. Click "Run"

You should see output showing the columns were added and a list of all columns in each table.

## Step 3: Create Storage Buckets

Create these storage buckets in Supabase Storage:

### 1. pitch-decks
- Public: **No**
- File size limit: 50MB
- Allowed MIME types: `application/pdf`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### 2. investor-decks
- Public: **No**
- File size limit: 50MB
- Allowed MIME types: `application/pdf`, `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-officedocument.presentationml.presentation`

### 3. logos
- Public: **Yes**
- File size limit: 5MB
- Allowed MIME types: `image/svg+xml`, `image/png`, `image/jpeg`, `image/gif`

## Step 4: Add Storage Policies

See `DEPLOYMENT.md` section 3 for storage policies SQL.

## Step 5: Load Mock Data (Optional)

**Run this file:** `mock-data.sql`

This creates realistic demo data:
- 1 startup profile (TechVenture AI)
- 5 investor profiles
- User ID: `d5629bd5-aaaf-42bc-9de4-1f222eacdf7e`

### How to run:

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create a new query
4. Copy and paste the contents of `mock-data.sql`
5. Click "Run"

### Note about Authentication

The mock data creates profiles but NOT auth users. To actually log in as the demo user:

1. Go to Supabase Authentication
2. Click "Add user"
3. Email: `demo@techstartup.io`
4. Password: Choose any password
5. Confirm email immediately
6. The user ID will be different from the mock data ID

**OR** manually update the mock data SQL to use your real auth user ID:

```sql
-- Replace this ID with your actual auth user ID
'd5629bd5-aaaf-42bc-9de4-1f222eacdf7e'
```

## Verification

After completing all steps, verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Check columns in startup_profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'startup_profiles';

-- Check columns in investor_profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'investor_profiles';

-- Check if mock data loaded
SELECT company_name FROM startup_profiles;
SELECT organization_name FROM investor_profiles;

-- Check storage buckets
SELECT * FROM storage.buckets;
```

## Troubleshooting

### Error: "relation startup_profiles does not exist"
Run Step 1 first (DEPLOYMENT.md section 1).

### Error: "column tagline does not exist"
Run Step 2 (database-migration.sql).

### Error: "duplicate key value violates unique constraint"
The data already exists. Either:
- Skip mock data (Step 5)
- Delete existing data first
- Update the SQL to use different IDs

### Settings page not saving
Make sure:
1. Step 2 migration completed successfully
2. Storage bucket "logos" exists and is public
3. You're logged in as an authenticated user

## Quick Start (All in One)

If you want to run everything at once:

```sql
-- 1. Run DEPLOYMENT.md section 1 (Create Tables)
-- 2. Run this:
\i database-migration.sql

-- 3. Create storage buckets manually in UI
-- 4. Run DEPLOYMENT.md section 3 (Storage Policies)
-- 5. Run this:
\i mock-data.sql
```

Note: The `\i` command only works in psql CLI, not in Supabase SQL Editor. In the SQL Editor, copy/paste each file's contents.
