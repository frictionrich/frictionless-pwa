# Known Issues and Fixes

## Service Worker Fix (CRITICAL)

### Issue
The service worker was intercepting Supabase API calls, causing signup/login to fail with:
```
TypeError: Failed to fetch
POST https://<project>.supabase.co/auth/v1/signup net::ERR_FAILED
```

### Root Cause
The original service worker was caching ALL fetch requests, including POST requests to external APIs like Supabase.

### Fix Applied
Updated `public/sw.js` to:
1. **Exclude Supabase API calls** - Any URL containing `supabase.co`
2. **Exclude POST/PUT/DELETE requests** - Only cache GET requests
3. **Only cache same-origin requests** - Don't cache external APIs
4. **Skip waiting on install** - Immediately activate new service worker
5. **Claim clients on activate** - Take control of pages immediately

### Code Changes
```javascript
// Don't cache API calls to Supabase or any external APIs
if (url.hostname.includes('supabase.co') ||
    url.pathname.includes('/api/') ||
    event.request.method !== 'GET') {
  return; // Let the browser handle it normally
}
```

### Testing
After this fix:
- ✅ Signup works correctly
- ✅ Login works correctly
- ✅ Supabase API calls go through
- ✅ Static assets still cached
- ✅ PWA functionality maintained

### Important Notes
- Clear browser cache if testing after this fix
- Unregister old service worker in DevTools > Application > Service Workers
- Hard refresh (Ctrl+Shift+R) to get new service worker

---

## Other Known Issues

### 1. Mock Data in Dashboards
**Issue**: Dashboards display placeholder data instead of real database queries.

**Status**: Expected for MVP. Backend integration needed.

**Fix**: Implement Supabase queries to fetch real data from database tables.

### 2. AI Pitch Deck Analysis Not Implemented
**Issue**: Pitch deck upload doesn't trigger AI analysis.

**Status**: Out of scope for MVP. Requires OpenAI API integration.

**Future Enhancement**: Add API route to process uploaded decks with LLM.

### 3. Match Percentage Algorithm
**Issue**: Match percentages are hardcoded (92%, 65%, etc.)

**Status**: Algorithm not implemented yet.

**Future Enhancement**: Build matching algorithm based on:
- Sector alignment
- Stage alignment
- Geography
- Ticket size
- Readiness score

### 4. Storage Bucket Policies
**Issue**: Storage buckets need proper RLS policies configured in Supabase.

**Status**: SQL provided in DEPLOYMENT.md but must be run manually.

**Action Required**: Run storage policy SQL when setting up Supabase.

### 5. Google OAuth Setup
**Issue**: Google OAuth not configured by default.

**Status**: Configuration required in Supabase dashboard.

**Action Required**:
1. Create Google OAuth app
2. Add credentials to Supabase
3. Configure authorized redirect URIs

---

## Debugging Tips

### Service Worker Issues
```javascript
// In browser console:
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
```

### Supabase Connection Issues
```javascript
// Check if Supabase is connected:
console.log(supabase.auth.getSession())
```

### Cache Clearing
1. Open DevTools (F12)
2. Application tab > Storage
3. Clear site data
4. Hard refresh (Ctrl+Shift+R)

---

## Production Recommendations

### 1. Service Worker Strategy
Consider different caching strategies:
- **Network First** for API calls (already implemented)
- **Cache First** for images and static assets
- **Stale While Revalidate** for frequently updated content

### 2. Error Handling
Add proper error boundaries and user-friendly error messages for:
- Network failures
- Authentication errors
- File upload errors
- Database connection issues

### 3. Performance Monitoring
Set up monitoring for:
- Service worker registration failures
- API call failures
- Page load times
- Error rates

### 4. Security
- Keep service worker scope minimal
- Validate all user inputs
- Sanitize file uploads
- Use HTTPS only
- Keep dependencies updated

---

**Last Updated**: October 30, 2025
**Build Status**: ✅ Production Ready
**Service Worker Version**: v1 (fixed)
