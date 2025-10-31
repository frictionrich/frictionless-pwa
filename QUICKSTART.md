# Quick Start Guide

Get the Frictionless app running locally in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm

## Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001)

### 3. Explore the App

- **Homepage**: http://localhost:3001
- **Sign Up** (Startup): http://localhost:3001/auth/signup?role=startup
- **Sign Up** (Investor): http://localhost:3001/auth/signup?role=investor
- **Login**: http://localhost:3001/auth/login

## What's Already Configured

✅ Next.js 14 with App Router
✅ TypeScript
✅ Tailwind CSS with custom design system
✅ Supabase client setup (`.env.local` already configured)
✅ Authentication flows (Email/Password + Google OAuth ready)
✅ PWA configuration with service worker
✅ Responsive design (mobile & desktop)

## Next Steps

### Set Up Database

Follow the instructions in `DEPLOYMENT.md` to:
1. Create database tables in Supabase
2. Set up storage buckets
3. Configure Row Level Security policies

### Test Features

1. **Sign Up as a Startup**
   - Create an account
   - Complete onboarding (company info + pitch deck upload)
   - View startup dashboard with investor matches

2. **Sign Up as an Investor**
   - Create an account
   - Complete onboarding (org info + investment thesis)
   - View investor dashboard with startup matches

## Key Files

- `src/app/` - All pages and routes
- `src/components/` - Reusable UI components
- `src/lib/supabase/` - Supabase client configuration
- `src/styles/globals.css` - Global styles and design system
- `tailwind.config.ts` - Tailwind configuration with custom colors

## Common Commands

```bash
# Development
npm run dev          # Start dev server on port 3001

# Production
npm run build        # Create production build
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm test             # Run tests (when configured)
```

## Design System

The app uses a comprehensive design system based on Figma designs:

### Colors
- **Primary Green**: `#28CB88`
- **Secondary Dark**: `#263238`
- **Success**: `#2E7D31`
- **Warning**: `#FBC02D`
- **Error**: `#E53835`

### Components
All UI components are in `src/components/ui/`:
- `Button` - Primary, secondary, tertiary variants
- `Input` - Form inputs with validation
- `Card` - Content containers
- `MatchBadge` - Display match percentages

## Troubleshooting

### Port 3001 already in use
```bash
# Kill the process using port 3001
npx kill-port 3001
# Or change the port in package.json scripts
```

### Module not found errors
```bash
npm install  # Reinstall dependencies
```

### Supabase connection issues
1. Check `.env.local` has correct Supabase URL and keys
2. Verify Supabase project is active
3. Check database tables exist (see DEPLOYMENT.md)

## Support

- Check `README.md` for full documentation
- Review `DEPLOYMENT.md` for deployment instructions
- See `docs/requirements.txt` for feature specifications

---

**You're all set! Start building with Frictionless.** 🚀
