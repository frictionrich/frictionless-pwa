# Database Setup and Mock Data

This directory contains database migration files and mock data scripts for the Frictionless platform.

## Files

### Migration Files

- **`20251031a-add-profile-fields.sql`** - Adds username, tagline, logo_url, and social media fields to both startup_profiles and investor_profiles tables.

### Mock Data Files

- **`mock-data.sql`** - Comprehensive mock data with 1 startup profile and 5 investor profiles. Creates both profiles and auth-linked records.
- **`simple-mock-data.sql`** - Simplified version that creates only investor profiles without auth users. Good for quick testing.

## Important: Row Level Security (RLS)

The database tables have Row Level Security enabled with policies that check `auth.uid()`. When running SQL scripts directly in the Supabase SQL editor, there is no authenticated session, so `auth.uid()` returns NULL and the RLS policies block inserts.

### Solution

Both mock data files now include:

1. **Disable RLS** at the beginning:
```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles DISABLE ROW LEVEL SECURITY;
```

2. **Insert mock data** (runs without RLS blocking)

3. **Re-enable RLS** at the end:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startup_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
```

This ensures the mock data can be inserted while maintaining security for normal application usage.

## How to Use

### Option 1: Full Mock Data (mock-data.sql)

This creates a complete demo environment with both startup and investor data.

1. Go to your Supabase project's SQL Editor
2. Copy and paste the entire contents of `mock-data.sql`
3. Run the script
4. You'll get:
   - 1 startup profile (TechVenture AI) with user ID: `d5629bd5-aaaf-42bc-9de4-1f222eacdf7e`
   - 5 investor profiles (Capital Factory, Geekdom Fund, MGV Capital, Irys Insights, Venture Heights)

**Note:** You still need to create the auth user manually in Supabase Authentication with the email `demo@techstartup.io` and the UUID `d5629bd5-aaaf-42bc-9de4-1f222eacdf7e`.

### Option 2: Simple Mock Data (simple-mock-data.sql)

This creates only investor profiles, useful when you already have a startup account.

1. Sign up for a startup account in the app
2. Note your user ID from the browser console or Supabase dashboard
3. Go to Supabase SQL Editor
4. Copy and paste the contents of `simple-mock-data.sql`
5. Run the script
6. You'll see 5 investor profiles in your dashboard

### Option 3: Add Profile Fields Migration

If you already have profiles but need to add the new fields:

1. Go to Supabase SQL Editor
2. Copy and paste the contents of `20251031a-add-profile-fields.sql`
3. Run the script
4. This adds username, tagline, logo_url, and social media fields

## Database Schema

The database has a chain of foreign keys:

```
auth.users (Supabase Auth)
    ↓
profiles (id references auth.users.id)
    ↓
startup_profiles (user_id references profiles.id)
investor_profiles (user_id references profiles.id)
```

This means:
1. You must have an auth user first
2. Then create a profile record
3. Then create a startup_profile or investor_profile

The mock data scripts handle this order automatically.

## Troubleshooting

### Error: "violates foreign key constraint"

This means a profile is being inserted without the parent record existing. The most common causes:

1. **Missing auth user** - For `profiles` table, the auth user must exist first
2. **Missing profile** - For `investor_profiles`/`startup_profiles`, the profile record must exist first
3. **RLS blocking inserts** - RLS policies require `auth.uid()` which is NULL in SQL scripts

**Solution:** Use the updated mock data files which disable RLS during inserts.

### Error: "RLS policy violation"

This happens when trying to insert data with RLS enabled and no authenticated session.

**Solution:** The mock data files now disable RLS before inserting and re-enable it afterward.

### Investors not showing up in startup dashboard

Check:
1. Are investor_profiles records in the database? Run: `SELECT * FROM investor_profiles;`
2. Is your startup user authenticated? Check the browser console for auth errors
3. Does the RLS policy allow startups to view investor profiles? It should with: `profiles.role = 'startup'`

### Startup profile not loading

Check:
1. Does your user have a profile record? Run: `SELECT * FROM profiles WHERE id = 'YOUR_USER_ID';`
2. Does your user have a startup_profile record? Run: `SELECT * FROM startup_profiles WHERE user_id = 'YOUR_USER_ID';`
3. Is your profile.role set to 'startup'?

## Next Steps

After running the mock data:

1. **For Startups**: Log in with your account and visit `/dashboard/startup` to see 5 investor matches
2. **For Investors**: Create an investor account and visit `/dashboard/investor` to see the startup profile
3. **Test Settings**: Go to Settings to update your profile, upload a logo, add social links
4. **Test Readiness**: Navigate to the Readiness page (currently "coming soon")
5. **Test Performance**: Navigate to the Performance page (currently "coming soon")

## Security Notes

- **Never disable RLS in production** - Only disable during mock data inserts
- **Always re-enable RLS** - The scripts automatically re-enable after inserts
- **Use environment-specific data** - Don't use mock data in production
- **Validate user input** - The app validates all user-submitted data
- **Keep auth separate** - Auth users are managed by Supabase Auth, not these scripts
