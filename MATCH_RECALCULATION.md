# Match Recalculation Setup

This document explains how the automated daily match recalculation system works and how to set it up.

## Overview

The system recalculates matches between all startups and investors once per day using a GitHub Action workflow. This ensures that:
- New investors automatically get matched with existing startups
- Changes to investor profiles update matches
- The matching algorithm improvements automatically apply to all existing matches

## How It Works

### 1. API Endpoint
**Location:** `src/app/api/recalculate-all-matches/route.ts`

This endpoint:
- Fetches all startup profiles from the database
- Calls `/api/calculate-matches` for each startup
- Recalculates matches against all investors
- Returns a summary of successes and failures

**Security:** Protected by a `CRON_SECRET` token that must be passed in the `Authorization` header.

### 2. GitHub Action
**Location:** `.github/workflows/recalculate-matches.yml`

This workflow:
- Runs daily at 2 AM UTC
- Can be manually triggered from the GitHub Actions UI
- Makes a POST request to the recalculation endpoint
- Logs the results

## Setup Instructions

### Step 1: Generate a CRON_SECRET

Generate a secure random token:

```bash
# On macOS/Linux:
openssl rand -hex 32

# Or use any password generator to create a long random string
```

### Step 2: Add Environment Variables

#### In Vercel (Production):
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `CRON_SECRET` | Your generated secret token | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Your production URL (e.g., `https://frictionless-pwa.vercel.app`) | Production |

#### In Local Development:
Add to your `.env.local` file:

```env
CRON_SECRET=your_generated_secret_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `CRON_SECRET` | Same token as in Vercel |
| `NEXT_PUBLIC_SITE_URL` | Your production URL |

### Step 4: Enable the Workflow

The workflow is automatically enabled once the files are pushed to the repository. You can:

- **View runs:** Go to **Actions** tab in GitHub
- **Manual trigger:** Click "Run workflow" button on the workflow page
- **View logs:** Click on any workflow run to see detailed logs

## Manual Recalculation

You can manually trigger match recalculation in several ways:

### Option 1: GitHub Actions UI
1. Go to **Actions** tab
2. Select "Recalculate Matches Daily" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

### Option 2: API Request
Use curl or any HTTP client:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://your-site.vercel.app/api/recalculate-all-matches
```

### Option 3: From Code
Call the endpoint from your application when needed:

```typescript
const response = await fetch('/api/recalculate-all-matches', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.CRON_SECRET}`,
    'Content-Type': 'application/json',
  },
});
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "startups_processed": 10,
  "successes": 9,
  "failures": 1,
  "results": [
    {
      "startup_id": "uuid-1",
      "success": true,
      "matches_created": 6
    },
    {
      "startup_id": "uuid-2",
      "success": false,
      "error": "Error message"
    }
  ]
}
```

### Error Response (401, 500)
```json
{
  "error": "Unauthorized"
}
```

## Monitoring

### View Logs

**GitHub Actions:**
- Go to Actions tab → Select workflow run → View logs

**Vercel:**
- Go to your project → Logs → Functions
- Filter by `/api/recalculate-all-matches`

### What to Monitor

Look for these log messages:
- `🔄 Starting batch match recalculation for all startups...`
- `Found X startups to process`
- `✅ Recalculated matches for startup [id]: X matches`
- `❌ Failed to recalculate matches for startup [id]`
- `✅ Batch recalculation complete: X succeeded, Y failed`

## Troubleshooting

### Workflow fails with 401 Unauthorized
- Check that `CRON_SECRET` matches in both GitHub Secrets and Vercel Environment Variables
- Ensure the secret is set for the correct environment (Production)

### Workflow fails with 500 Server Error
- Check Vercel function logs for detailed error messages
- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Ensure Supabase credentials are configured

### Some startups fail to recalculate
- Check the `results` array in the response for specific error messages
- Individual failures don't stop the entire batch process
- Review Vercel logs for the specific startup that failed

## Schedule Modification

To change when the workflow runs, edit `.github/workflows/recalculate-matches.yml`:

```yaml
schedule:
  # Run at 2 AM UTC daily
  - cron: '0 2 * * *'

  # Run at 6 AM UTC daily
  - cron: '0 6 * * *'

  # Run every 12 hours
  - cron: '0 */12 * * *'

  # Run on weekdays only at 3 AM UTC
  - cron: '0 3 * * 1-5'
```

Cron syntax: `minute hour day month day-of-week`

## Cost Considerations

- Each recalculation processes all startups
- Each startup calculates matches with all investors
- Consider your database query limits and function execution time
- For large datasets, consider implementing pagination or rate limiting

## Future Improvements

Potential enhancements:
- Add email notifications for failed recalculations
- Implement incremental matching (only recalculate changed profiles)
- Add metrics/analytics dashboard
- Implement rate limiting for very large datasets
- Add Slack/Discord notifications for completion status
