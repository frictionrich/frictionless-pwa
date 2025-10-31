# Frictionless

**Startup Funding, Reimagined** - Instant Alignment for Founders and Investors. Matched. Measured. Monitored.

## Overview

Frictionless is a streamlined investor-startup ecosystem designed for frictionless collaboration. It's a dual-sided marketplace that empowers both startups and investors by enabling founders to showcase their companies, demonstrate investment readiness, and connect with aligned capital sources — while providing investors with tools to discover, track, and engage with high-potential startups that match their thesis and timing.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Deployment**: Vercel (recommended)
- **PWA**: Progressive Web App with offline support

## Features

### For Startups
- **Frictionless Onboarding**: Upload pitch deck and let AI extract key data
- **Smart Matching**: Get matched with investors based on sector, stage, and readiness
- **Investor Discovery**: Browse and filter investors by thesis, stage, geography
- **Readiness Assessment**: Track and improve your investment readiness score
- **Dashboard**: View funding progress, engagement metrics, and KPIs
- **Messaging**: Connect with interested investors

### For Investors
- **Frictionless Onboarding**: Share investment thesis and preferences
- **Startup Discovery**: Browse high-potential startups with smart filters
- **Match Scoring**: See compatibility scores for each startup
- **Deal Flow Management**: Track and manage your startup pipeline
- **Readiness Insights**: View startup readiness scores and metrics
- **Activity Tracking**: Monitor all interactions and updates

### For Admins
- **User Management**: Manage startup and investor accounts
- **Assessment Engine**: Configure readiness assessment questions and scoring
- **Platform Oversight**: Monitor sharing settings and privacy controls
- **Quality Control**: Audit AI-extracted profiles for accuracy

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frictionless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   The `.env.local` file should already be configured with:
   ```
   PORT=3001
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Set up Supabase**

   Run the database migrations in the `database/` directory to create the necessary tables:
   - `profiles` - User profiles with role information
   - `startup_profiles` - Startup-specific data
   - `investor_profiles` - Investor-specific data

   Create storage buckets:
   - `pitch-decks` - For startup pitch decks
   - `investor-decks` - For investor decks

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
frictionless/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── auth/              # Authentication pages (login, signup, etc.)
│   │   ├── dashboard/         # Dashboard pages for startups and investors
│   │   ├── onboarding/        # Onboarding flows
│   │   ├── layout.tsx         # Root layout with PWA support
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components (Button, Input, Card, etc.)
│   │   └── layout/           # Layout components (Sidebar, etc.)
│   ├── lib/                   # Utility functions and configurations
│   │   ├── supabase/         # Supabase client setup
│   │   └── utils.ts          # Helper functions
│   ├── styles/               # Global styles
│   │   └── globals.css       # Tailwind imports and custom styles
│   └── types/                # TypeScript type definitions
│       └── database.ts       # Supabase database types
├── public/                    # Static assets
│   ├── logo.png              # Frictionless logo
│   ├── favicon.png           # Favicon
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
├── docs/                      # Documentation
├── figma/                     # Design files and screenshots
└── database/                  # Database schemas and migrations
```

## Design System

The application follows a comprehensive design system based on the Figma designs:

### Colors
- **Primary**: #28CB88 (Green)
- **Secondary**: #263238 (Dark Grey)
- **Info**: #2194F3 (Blue)
- **Success**: #2E7D31 (Green)
- **Warning**: #FBC02D (Yellow)
- **Error**: #E53835 (Red)

### Typography
- **Font Family**: Inter
- **Headlines**: 64px, 36px, 28px, 20px (Semi Bold)
- **Body**: 18px, 16px, 14px, 12px (Regular & Medium)

### Components
All components follow the design system with consistent spacing, colors, and interactions.

## Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on push to main

3. **Configure Domain**
   - Add your custom domain in Vercel settings
   - Update Supabase redirect URLs to match your domain

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

## Database Schema

### profiles
- `id` (uuid, primary key)
- `email` (text)
- `role` (enum: startup | investor | admin)
- `created_at`, `updated_at` (timestamp)

### startup_profiles
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `company_name`, `website`, `pitch_deck_url`
- `description`, `sector`, `stage`
- `readiness_score` (numeric)
- `created_at`, `updated_at`

### investor_profiles
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to profiles)
- `organization_name`, `website`, `investor_deck_url`
- `description`, `focus_sectors[]`, `focus_stages[]`
- `ticket_size_min`, `ticket_size_max`
- `geography[]`
- `created_at`, `updated_at`

## Security

- Authentication via Supabase Auth (Email/Password + Google OAuth)
- Row Level Security (RLS) policies on all tables
- Environment variables for sensitive data
- HTTPS enforced in production
- Data encryption in transit

## PWA Features

- Installable on mobile and desktop
- Offline support with service worker
- Responsive design (mobile and desktop breakpoints)
- App manifest for native app-like experience

## Future Enhancements

### Planned Features (Not in MVP)
- Virtual Data Room for secure document sharing
- AI-powered pitch deck analysis with LLM
- Web scraper for startup data enrichment
- In-app assessment form for missing data
- White-label version for investor websites
- Advanced analytics and reporting
- Map view for geographic discovery
- Community features for networking

## Contributing

This is a private project. For internal development:

1. Create a feature branch
2. Make your changes
3. Submit a pull request for review
4. Ensure tests pass and linting is clean

## Support

For issues or questions:
- Check the documentation in `/docs`
- Review requirements in `/docs/requirements.txt`
- Contact the development team

## License

Copyright © 2025 Frictionless Inc. All rights reserved.

---

**Built with ❤️ for startups and investors**
