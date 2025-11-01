# Supabase Setup Guide

This guide covers the necessary Supabase configuration for the Frictionless platform.

## Authentication Settings

### Disable Email Confirmation (Development Only)

For development and testing, you should disable email confirmation to allow users to sign up and immediately access the onboarding flow without having to verify their email.

**Steps:**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Email Auth**
4. **Uncheck** "Enable email confirmations"
5. Click **Save**

**⚠️ Important:** For production, you should re-enable email confirmations for security.

### Alternative: Auto-confirm Emails

If you want to keep email confirmations enabled but auto-confirm for testing:

1. Go to **Authentication** → **Settings**
2. Under **Email Auth**, check "Enable email confirmations"
3. In your Supabase SQL Editor, run:
```sql
-- Auto-confirm all new signups (DEVELOPMENT ONLY)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = NEW.id AND email_confirmed_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**⚠️ Warning:** Remove this trigger before going to production!

## Database Setup

### 1. Run Migrations

Run these SQL files in order in your Supabase SQL Editor:

```bash
1. database/20251031a-add-profile-fields.sql
2. database/20251031b-create-matches-table.sql
3. database/20251031c-add-ai-analysis-fields.sql
4. database/20251031d-create-readiness-assessment-table.sql
5. database/20251031e-auto-create-profiles-trigger.sql
6. database/20251031f-fix-readiness-assessment-fields.sql
7. database/20251031g-add-investor-ai-fields.sql
8. database/20251031h-change-readiness-scores-to-numeric.sql
```

### 2. Load Mock Data (Optional)

For testing, you can load mock data:

```bash
database/mock-data.sql
```

This creates:
- 1 startup profile (juan@stealth.com)
- 7 investor profiles
- 7 matches with varying percentages

## Storage Buckets

Create the following storage buckets:

### pitch-decks bucket
1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `pitch-decks`
4. Public bucket: **Yes** (so URLs can be accessed)
5. Click **Create bucket**

### RLS Policies for pitch-decks
Run this SQL to set up Row Level Security:

```sql
-- Allow authenticated users to upload their own pitch decks
CREATE POLICY "Users can upload their own pitch decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own pitch decks
CREATE POLICY "Users can read their own pitch decks"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to pitch decks (if needed for sharing)
CREATE POLICY "Public can read pitch decks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pitch-decks');
```

## Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Verification

After setup, verify everything works:

1. ✅ Sign up a new user
2. ✅ User is immediately authenticated (no email confirmation required)
3. ✅ User can complete onboarding
4. ✅ Pitch deck upload works
5. ✅ User is redirected to dashboard

## Troubleshooting

### "Not authenticated" error during onboarding
- **Solution:** Disable email confirmations in Supabase Auth settings

### "Email already registered" error
- **Solution:** Delete the user from Authentication → Users and try again

### Pitch deck upload fails
- **Solution:** Ensure `pitch-decks` bucket exists and is public

### RLS errors when querying data
- **Solution:** Check that RLS policies are properly set up in the migration files
