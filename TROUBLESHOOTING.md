# Troubleshooting Guide

## Common Issues and Solutions

### ❌ Issue: `net::ERR_NAME_NOT_RESOLVED` when signing up

**Error Message:**
```
POST https://[old-project].supabase.co/auth/v1/signup net::ERR_NAME_NOT_RESOLVED
TypeError: Failed to fetch
```

**Cause:**
Browser is using cached build with old Supabase URL. The environment variables were updated but the browser still has the old URL.

**Solution:**

1. **Clear Next.js build cache:**
   ```bash
   cd C:\Projects\frictionless
   rm -rf .next
   npm run dev
   ```

2. **Hard refresh the browser:**
   - Chrome/Edge: `Ctrl + Shift + R`
   - Firefox: `Ctrl + Shift + Delete` → Clear everything

3. **Clear service worker:**
   - Open DevTools (F12)
   - Application tab → Service Workers
   - Click "Unregister" on all service workers
   - Close and reopen browser

4. **Clear browser cache completely:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"
   - Select "All time"
   - Clear data

5. **Verify environment variables:**
   ```bash
   # Check .env.local has correct URL
   cat .env.local
   ```

---

### ❌ Issue: Service Worker blocks API calls

**Error Message:**
```
The FetchEvent resulted in a network error response: the promise was rejected
```

**Solution:**
✅ **Already Fixed!** The service worker has been updated to exclude Supabase API calls.

If you still see this:
1. Unregister old service workers (see above)
2. Hard refresh browser
3. Verify `public/sw.js` has the fix (should exclude `supabase.co`)

---

### ❌ Issue: Build fails with TypeScript errors

**Solution:**
Check that all imports are correct and types are properly defined. Common fixes:
- Use `as any` for Supabase types temporarily
- Ensure all files have proper exports
- Run `npm install` to ensure all dependencies are installed

---

### ❌ Issue: Supabase connection fails

**Error Messages:**
- "Invalid API key"
- "Project not found"
- "Authentication failed"

**Solution:**

1. **Verify Supabase project exists:**
   - Log into https://app.supabase.com
   - Check project status (should be "Active")

2. **Check environment variables in `.env.local`:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
   ```

3. **Get fresh keys from Supabase:**
   - Project Settings → API
   - Copy Project URL
   - Copy anon/public key
   - Copy service_role key

4. **Restart dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

---

### ❌ Issue: Database tables don't exist

**Error Message:**
```
relation "profiles" does not exist
```

**Solution:**
You need to create the database tables first:

1. Open Supabase dashboard
2. Go to SQL Editor
3. Copy all SQL from `DEPLOYMENT.md` section "Database Tables"
4. Run the SQL
5. Verify tables exist in Table Editor

---

### ❌ Issue: File upload fails

**Error Messages:**
- "Bucket not found"
- "Permission denied"
- "Storage error"

**Solution:**

1. **Create storage buckets:**
   - Go to Supabase → Storage
   - Create bucket: `pitch-decks` (Private)
   - Create bucket: `investor-decks` (Private)

2. **Add storage policies:**
   - Copy SQL from `DEPLOYMENT.md` section "Storage Policies"
   - Run in SQL Editor

3. **Verify bucket settings:**
   - Both should be "Private"
   - File size limit: 50MB
   - Allowed MIME types: PDF, PPT, PPTX

---

### ❌ Issue: Google OAuth not working

**Solution:**

Google OAuth requires additional configuration:

1. **Create Google OAuth credentials:**
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://[your-project].supabase.co/auth/v1/callback`
     - `http://localhost:3001/auth/callback` (for local testing)

2. **Add to Supabase:**
   - Supabase → Authentication → Providers
   - Enable Google
   - Add Client ID and Client Secret
   - Save

3. **Test:**
   - Click "Sign up with Google" button
   - Should redirect to Google login
   - Should redirect back to app after login

---

### ❌ Issue: Port 3001 already in use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

```bash
# Kill process on port 3001
npx kill-port 3001

# Or find and kill manually
netstat -ano | findstr :3001
taskkill /PID [process_id] /F

# Then restart
npm run dev
```

---

### ❌ Issue: Build warnings about metadata

**Warning Message:**
```
Unsupported metadata themeColor is configured in metadata export
```

**Solution:**
These are warnings, not errors. They don't affect functionality. To fix (optional):
- Move `themeColor` and `viewport` to separate `generateViewport` export
- See Next.js docs for details

For now, these warnings can be ignored as they don't break the app.

---

## Debugging Tips

### 1. Check Browser Console
Always open DevTools (F12) and check the Console tab for errors.

### 2. Check Network Tab
In DevTools → Network tab:
- Look for failed requests (red)
- Check request URL (should match your Supabase project)
- Check response status codes

### 3. Check Supabase Logs
In Supabase dashboard:
- Go to Logs
- Filter by error level
- Check for authentication errors

### 4. Test Supabase Connection
```javascript
// In browser console:
const { data, error } = await supabase.auth.getSession()
console.log({ data, error })
```

### 5. Verify Environment Variables
```bash
# In terminal:
echo $NEXT_PUBLIC_SUPABASE_URL
# Should output your Supabase URL
```

---

## Fresh Start Checklist

If nothing works, try a complete fresh start:

```bash
# 1. Stop all running servers
# Press Ctrl+C in terminal

# 2. Clear all caches
rm -rf .next
rm -rf node_modules

# 3. Reinstall dependencies
npm install

# 4. Rebuild
npm run build

# 5. Start fresh
npm run dev

# 6. In browser:
# - Clear all cache and cookies
# - Unregister all service workers
# - Hard refresh (Ctrl+Shift+R)
# - Visit http://localhost:3001
```

---

## Still Having Issues?

### Check These Files:
1. `.env.local` - Correct Supabase keys?
2. `public/sw.js` - Has the fix to exclude API calls?
3. `src/lib/supabase/client.ts` - Correct configuration?

### Verify Database Setup:
1. Tables exist in Supabase
2. RLS policies are enabled
3. Storage buckets exist
4. Storage policies configured

### Test Basic Functionality:
1. Can you visit homepage?
2. Can you see the signup page?
3. Do form fields work?
4. Does browser console show errors?

### Get Help:
- Check `FIXES.md` for known issues
- Review `DEPLOYMENT.md` for setup steps
- Check Supabase documentation
- Check Next.js documentation

---

## Quick Reference

### Restart Everything
```bash
# Kill port
npx kill-port 3001

# Clear cache
rm -rf .next

# Restart server
npm run dev
```

### Clear Browser
1. F12 → Application → Clear storage → Clear site data
2. F12 → Application → Service Workers → Unregister all
3. Ctrl+Shift+R (hard refresh)

### Check Logs
- Browser: F12 → Console
- Server: Terminal running `npm run dev`
- Supabase: Dashboard → Logs

---

**Most Common Solution**: Clear `.next` folder, unregister service workers, and hard refresh browser!
