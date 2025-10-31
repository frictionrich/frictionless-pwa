# PWA Icon Fix

## Issue
PWA manifest icons need to be specific sizes (192x192, 512x512) but the downloaded images may be different sizes.

## Current Solution
The manifest.json has been updated to use:
- `favicon.png` for 192x192 icon
- `logo.png` for 512x512 icon

## Proper Fix (For Production)

You should create properly sized PWA icons. Here's how:

### Option 1: Use Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload your logo (`public/logo.png`)
3. Generate all sizes
4. Download and replace in `public/` folder

### Option 2: Use ImageMagick
```bash
# Install ImageMagick, then:

# Create 192x192 icon
convert public/logo.png -resize 192x192 public/icon-192.png

# Create 512x512 icon
convert public/logo.png -resize 512x512 public/icon-512.png

# Create favicon
convert public/logo.png -resize 32x32 public/favicon.ico
```

### Option 3: Use Figma/Photoshop
1. Open logo in design tool
2. Export as PNG:
   - 192x192 → icon-192.png
   - 512x512 → icon-512.png
   - 32x32 → favicon.ico
   - 180x180 → apple-touch-icon.png
3. Save to `public/` folder

## Updated Manifest

Then update `public/manifest.json`:

```json
{
  "name": "Frictionless",
  "short_name": "Frictionless",
  "description": "Startup Funding, Reimagined",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#28CB88",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

## Quick Fix for Now

The current manifest should work for basic PWA functionality. The warning won't prevent the app from working, but properly sized icons will:
- Look better on home screens
- Pass PWA audits
- Provide better user experience

## Testing PWA

After fixing icons:
1. Build: `npm run build`
2. Serve: `npm start`
3. Open Chrome DevTools
4. Go to Application → Manifest
5. Check if all icons load correctly
6. Test "Add to Home Screen"

## Apple Touch Icon

Also add to `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  // ... existing metadata
  icons: {
    icon: '/favicon.png',
    apple: '/apple-touch-icon.png', // 180x180
  },
}
```

Then create `public/apple-touch-icon.png` (180x180).

---

**For Now**: App works with current icons, but create proper sizes before production launch.
