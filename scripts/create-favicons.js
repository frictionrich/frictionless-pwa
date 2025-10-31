const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createFavicons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const logoPath = path.join(publicDir, 'frictionless-logo-original.png');

  console.log('Creating favicons from Frictionless logo...\n');

  try {
    // Check if source logo exists
    if (!fs.existsSync(logoPath)) {
      console.error('Error: frictionless-logo-original.png not found in public directory');
      process.exit(1);
    }

    // Get logo metadata
    const metadata = await sharp(logoPath).metadata();
    console.log(`Source image: ${metadata.width}x${metadata.height}`);

    // Create 192x192 favicon for PWA manifest
    console.log('\nCreating favicon.png (192x192)...');
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-new.png'));
    console.log('✓ favicon.png created (192x192)');

    // Create 512x512 logo for PWA manifest
    console.log('\nCreating logo.png (512x512)...');
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'logo-new.png'));
    console.log('✓ logo.png created (512x512)');

    // Create 32x32 for traditional favicon.ico
    console.log('\nCreating favicon-32.png (32x32)...');
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-32.png'));
    console.log('✓ favicon-32.png created (32x32)');

    // Create 16x16 for traditional favicon.ico
    console.log('\nCreating favicon-16.png (16x16)...');
    await sharp(logoPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-16.png'));
    console.log('✓ favicon-16.png created (16x16)');

    console.log('\n✅ All favicons created successfully!');
    console.log('\nGenerated files:');
    console.log('  - favicon-new.png (192x192) - for PWA manifest');
    console.log('  - logo-new.png (512x512) - for PWA manifest');
    console.log('  - favicon-32.png (32x32) - for traditional favicon');
    console.log('  - favicon-16.png (16x16) - for traditional favicon');
    console.log('\nNext steps:');
    console.log('  1. Manually replace favicon.png with favicon-new.png');
    console.log('  2. Manually replace logo.png with logo-new.png');
    console.log('  3. (Optional) Use a tool to combine favicon-16.png and favicon-32.png into favicon.ico');

  } catch (error) {
    console.error('Error creating favicons:', error);
    process.exit(1);
  }
}

createFavicons();
