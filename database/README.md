# Database Setup and Mock Data

This directory contains database migration files and mock data scripts for the Frictionless platform.

## Files

### Migration Files

- **`20251031a-add-profile-fields.sql`** - Adds username, tagline, logo_url, and social media fields to both startup_profiles and investor_profiles tables.

### Mock Data Files

- **`mock-data.sql`** - Creates a startup profile for ONE specific auth user (d5629bd5-aaaf-42bc-9de4-1f222eacdf7e). Investor profiles must be created through the signup flow.

## Important: Understanding the Database Schema

### Foreign Key Chain

The database has a strict foreign key chain that cannot be bypassed:

```
auth.users (Supabase Auth - managed by Supabase)
    ↓ (FK constraint)
profiles (id references auth.users.id)
    ↓ (FK constraint)
startup_profiles (user_id references profiles.id)
investor_profiles (user_id references profiles.id)
```

**This means:**
1. You **MUST** have an auth user in `auth.users` first (created via Supabase Auth or app signup)
2. Then you can create a `profiles` record referencing that auth user
3. Then you can create `startup_profiles` or `investor_profiles` referencing that profile

**You CANNOT:**
- Create profiles for UUIDs that don't exist in `auth.users`
- Skip the foreign key chain
- Create mock investor profiles via SQL (they need real auth users)

### Row Level Security (RLS)

The database tables have Row Level Security enabled with policies that check `auth.uid()`. When running SQL scripts directly in the Supabase SQL editor, there is no authenticated session, so `auth.uid()` returns NULL and the RLS policies block inserts.

**Solution:** The mock data file disables RLS before inserts and re-enables it afterward:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;
-- ... insert data ...
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
```

## How to Use Mock Data

### Step 1: Create the Auth User

You have two options:

**Option A: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User** (or **Invite User**)
4. Set the email to: `demo@techstartup.io`
5. Set a password
6. **IMPORTANT:** After creating, click on the user and note their UUID
7. If the UUID is different from `d5629bd5-aaaf-42bc-9de4-1f222eacdf7e`, you'll need to update the mock-data.sql file with the actual UUID

**Option B: Via App Signup**
1. Go to your app's signup page: `/auth/signup`
2. Sign up with email `demo@techstartup.io`
3. Select "Startup" as the role
4. Complete the onboarding
5. Check the browser console or Supabase dashboard for the user's UUID
6. Update mock-data.sql with the actual UUID if different

### Step 2: Run the Mock Data Script

1. Go to your Supabase project's **SQL Editor**
2. Copy the entire contents of `database/mock-data.sql`
3. Paste and run the script
4. You should see: "Mock startup profile created successfully!"
5. Verify by running: `SELECT * FROM startup_profiles;`

### Step 3: Create Investor Profiles (Optional)

Investor profiles **cannot** be created via SQL because they require real auth users. Instead:

1. Open a new incognito/private browser window
2. Go to `/auth/signup` in your app
3. Sign up with a different email (e.g., `investor1@test.com`)
4. Select **"Investor"** as the role
5. Complete the investor onboarding flow
6. Repeat for as many investor profiles as you want to test

The investor profiles will automatically appear in the startup dashboard's "Top Matches" section.

## Troubleshooting

### Error: "violates foreign key constraint profiles_id_fkey"

**Full error:**
```
ERROR: 23503: insert or update on table "profiles" violates foreign key constraint "profiles_id_fkey"
DETAIL: Key (id)=(xxx) is not present in table "users".
```

**Cause:** You're trying to create a profile for a UUID that doesn't exist in `auth.users`.

**Solution:**
1. Create the auth user first in Supabase Authentication (see Step 1 above)
2. Make sure the UUID in mock-data.sql matches the auth user's UUID exactly
3. Run the script again

### Error: "violates foreign key constraint investor_profiles_user_id_fkey"

**Cause:** You're trying to create an investor profile via SQL, but the referenced user doesn't exist in `auth.users`.

**Solution:** You cannot create investor profiles via SQL. Use the app's signup flow instead (see Step 3 above).

### Error: "RLS policy violation" or "permission denied"

**Cause:** RLS policies are blocking the insert because there's no authenticated session.

**Solution:** The mock-data.sql file already handles this by disabling RLS. Make sure you're running the entire script, including the `ALTER TABLE ... DISABLE ROW LEVEL SECURITY;` commands at the top.

### Startup dashboard shows "No investors yet"

**Cause:** There are no investor profiles in the database.

**Solution:**
1. Create investor accounts through the signup flow (see Step 3 above)
2. Make sure the investors completed the onboarding process
3. Check the database: `SELECT * FROM investor_profiles;`
4. Verify RLS policies allow startups to view investors

### Mock data script succeeds but profile doesn't appear

**Causes:**
1. The auth user doesn't exist
2. The UUID in the script doesn't match the auth user's UUID
3. RLS policies are blocking your access

**Solution:**
1. Verify the auth user exists: Go to Supabase Dashboard > Authentication > Users
2. Check the UUID matches exactly (case-sensitive)
3. Try logging in as that user and visiting the dashboard
4. Check browser console for auth errors

## Migration Files

### Adding Profile Fields (20251031a-add-profile-fields.sql)

If you already have profiles but need to add the new fields:

1. Go to Supabase SQL Editor
2. Copy and paste the contents of `20251031a-add-profile-fields.sql`
3. Run the script

This adds:
- `username` (unique)
- `tagline`
- `logo_url`
- Social media fields: `linkedin`, `twitter`, `instagram` (for startups), `facebook` (for investors)

## Testing the App

After setting up mock data:

### For Startups
1. Log in with the startup account (`demo@techstartup.io`)
2. Visit `/dashboard/startup` to see:
   - Overall stats
   - Top investor matches (if you created investor accounts)
   - Recent activity
3. Visit `/dashboard/startup/settings` to update profile
4. Visit `/dashboard/startup/investors` (coming soon page)
5. Visit `/dashboard/startup/readiness` (coming soon page)
6. Visit `/dashboard/startup/performance` (coming soon page)

### For Investors
1. Sign up an investor account through `/auth/signup`
2. Complete investor onboarding
3. Visit `/dashboard/investor` to see:
   - Deal flow stats
   - Portfolio overview
4. Visit `/dashboard/investor/settings` to update profile
5. Visit `/dashboard/investor/startups` (coming soon page)

### Testing Matching
1. Create multiple investor accounts with different `focus_sectors`
2. Log in as the startup
3. The dashboard should show match percentages based on sector overlap
4. Investors with sectors matching the startup's sector get higher scores (85-100%)
5. Investors without sector overlap get lower scores (50-80%)

## Security Notes

- **Never disable RLS in production** - Only disable during development/testing for mock data inserts
- **Always re-enable RLS** - The mock-data.sql script automatically re-enables after inserts
- **Use environment-specific data** - Don't use mock data in production
- **Validate user input** - The app validates all user-submitted data
- **Keep auth separate** - Auth users are managed by Supabase Auth, not these scripts
- **Test RLS policies** - After setup, test that users can only access their own data

## Common Commands

```sql
-- View all profiles
SELECT * FROM profiles;

-- View all startup profiles
SELECT * FROM startup_profiles;

-- View all investor profiles
SELECT * FROM investor_profiles;

-- Check if your auth user exists
SELECT * FROM auth.users WHERE email = 'demo@techstartup.io';

-- Delete mock data (if needed)
DELETE FROM startup_profiles WHERE user_id = 'd5629bd5-aaaf-42bc-9de4-1f222eacdf7e';
DELETE FROM profiles WHERE id = 'd5629bd5-aaaf-42bc-9de4-1f222eacdf7e';
-- Note: Don't delete from auth.users via SQL - use Supabase Dashboard

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Next Steps

1. ✅ Set up the database schema (DEPLOYMENT.md)
2. ✅ Run migrations (20251031a-add-profile-fields.sql)
3. ✅ Create auth user for mock data
4. ✅ Run mock-data.sql
5. ✅ Create investor accounts via signup
6. ✅ Test the startup and investor dashboards
7. 🔄 Implement remaining features (see TODO.md)
