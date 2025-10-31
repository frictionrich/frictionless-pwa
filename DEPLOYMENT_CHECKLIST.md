# Deployment Checklist

Use this checklist to deploy Frictionless to production.

## Pre-Deployment

### ✅ Local Testing
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` and test locally at http://localhost:3001
- [ ] Test signup flow for startups
- [ ] Test signup flow for investors
- [ ] Test login flow
- [ ] Test forgot password flow
- [ ] Verify responsive design on mobile and desktop
- [ ] Run `npm run build` successfully

### ✅ Code Repository
- [ ] Initialize git: `git init`
- [ ] Add files: `git add .`
- [ ] Initial commit: `git commit -m "Initial commit"`
- [ ] Create private GitHub repository
- [ ] Add remote: `git remote add origin <url>`
- [ ] Push code: `git push -u origin main`

## Supabase Setup

### Database Tables
- [ ] Log into Supabase dashboard
- [ ] Navigate to SQL Editor
- [ ] Run all SQL from `DEPLOYMENT.md` section "Database Tables"
- [ ] Verify tables created: `profiles`, `startup_profiles`, `investor_profiles`
- [ ] Verify triggers created for `updated_at`

### Row Level Security (RLS)
- [ ] Enable RLS on all three tables
- [ ] Run policy SQL from `DEPLOYMENT.md`
- [ ] Test policies work correctly

### Storage Buckets
- [ ] Create bucket: `pitch-decks`
- [ ] Create bucket: `investor-decks`
- [ ] Set both buckets to Private
- [ ] Add storage policies from `DEPLOYMENT.md`
- [ ] Set file size limit: 50MB for both

### Authentication
- [ ] Enable Email provider in Supabase Auth
- [ ] Configure Site URL: `http://localhost:3001` (development)
- [ ] Add redirect URL: `http://localhost:3001/auth/callback`
- [ ] (Optional) Enable Google OAuth:
  - [ ] Create Google OAuth app
  - [ ] Add client ID and secret to Supabase
  - [ ] Add authorized redirect URIs

### Environment Variables
- [ ] Verify `.env.local` has correct values:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`

## Vercel Deployment

### Prepare Vercel Account
- [ ] Sign up/login to https://vercel.com
- [ ] Connect GitHub account

### Import Project
- [ ] Click "Add New Project"
- [ ] Select frictionless repository
- [ ] Configure build settings:
  - Framework Preset: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: `.next`

### Environment Variables in Vercel
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Add `OPENAI_API_KEY`
- [ ] Set for Production, Preview, and Development

### Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note deployment URL: `https://frictionless-xyz.vercel.app`

## Post-Deployment

### Update Supabase URLs
- [ ] In Supabase > Authentication > URL Configuration:
  - [ ] Update Site URL to Vercel domain
  - [ ] Add redirect URL: `https://your-domain.vercel.app/auth/callback`
  - [ ] Add redirect URL: `https://your-domain.com/auth/callback` (if custom domain)

### Test Production Site
- [ ] Visit production URL
- [ ] Test signup as startup
- [ ] Test signup as investor
- [ ] Test login
- [ ] Test Google OAuth (if configured)
- [ ] Test responsive design
- [ ] Test PWA installation

### Custom Domain (Optional)
- [ ] Go to Vercel project settings > Domains
- [ ] Add custom domain
- [ ] Configure DNS settings as instructed
- [ ] Wait for SSL certificate provisioning
- [ ] Update Supabase redirect URLs with custom domain

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] Check Vercel Analytics for traffic
- [ ] Monitor Supabase logs for errors
- [ ] (Optional) Set up Sentry for error tracking

### Security Checklist
- [ ] All environment variables are in Vercel (not in code)
- [ ] RLS policies are enabled on all tables
- [ ] Storage buckets have proper access policies
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] `.env.local` is in `.gitignore`

### Performance Checklist
- [ ] Build size is reasonable (<200KB per page)
- [ ] Lighthouse score >90 (run on production)
- [ ] Images are optimized
- [ ] Service worker is caching properly

## Continuous Deployment

### GitHub Integration
- [ ] Verify Vercel is connected to GitHub
- [ ] Test: Push to main → Auto-deploy to production
- [ ] Test: Create PR → Auto-deploy to preview URL

### Branch Strategy
- [ ] `main` branch → Production
- [ ] `staging` branch → Staging environment (optional)
- [ ] Feature branches → Preview deployments

## Future Tasks

### Phase 2 Features
- [ ] Implement AI pitch deck analysis
- [ ] Build real matching algorithm
- [ ] Add messaging system
- [ ] Create admin dashboard
- [ ] Add search and filtering
- [ ] Implement notifications

### Database Enhancements
- [ ] Add indexes for common queries
- [ ] Set up database backups
- [ ] Configure database alerts

### Analytics
- [ ] Set up Google Analytics
- [ ] Track user conversions
- [ ] Monitor signup funnels

## Rollback Plan

If deployment fails:
1. Check Vercel build logs for errors
2. Verify environment variables are correct
3. Test build locally: `npm run build`
4. Check Supabase connection from production
5. Rollback to previous deployment in Vercel dashboard

## Support

- Technical issues: Review logs in Vercel and Supabase
- Build errors: Check `npm run build` locally first
- Database issues: Verify RLS policies and table structure
- Auth issues: Check Supabase Auth settings and redirect URLs

---

## Quick Reference

### Useful Commands
```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Check linting
npm run lint
```

### Important URLs
- **Local**: http://localhost:3001
- **Supabase**: https://app.supabase.com
- **Vercel**: https://vercel.com
- **GitHub**: https://github.com/<your-username>/frictionless

### Key Files
- `.env.local` - Environment variables (local)
- `DEPLOYMENT.md` - Detailed deployment guide
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick setup guide

---

**Deployment Date**: _______________

**Deployed By**: _______________

**Production URL**: _______________

**Status**: _______________

✅ = Complete | ⏳ = In Progress | ❌ = Blocked
