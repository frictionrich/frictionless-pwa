const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function resizeIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const logoPath = path.join(publicDir, 'logo.png');
  const faviconOutputPath = path.join(publicDir, 'favicon.png');
  const logoOutputPath = path.join(publicDir, 'logo.png');

  console.log('Starting icon resize process...');

  try {
    // Check if logo.png exists
    if (!fs.existsSync(logoPath)) {
      console.error('Error: logo.png not found in public directory');
      process.exit(1);
    }

    // Resize logo to 192x192 for favicon.png
    console.log('Creating favicon.png (192x192)...');
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(publicDir, 'favicon-temp.png'));

    // Replace old favicon
    fs.renameSync(
      path.join(publicDir, 'favicon-temp.png'),
      faviconOutputPath
    );
    console.log('✓ favicon.png created successfully (192x192)');

    // Resize logo to 512x512 for logo.png
    console.log('Creating logo.png (512x512)...');
    const logoBuffer = await sharp(logoPath).metadata();

    // Only resize if not already 512x512
    if (logoBuffer.width !== 512 || logoBuffer.height !== 512) {
      // Delete old logo first
      try {
        if (fs.existsSync(logoOutputPath)) {
          fs.unlinkSync(logoOutputPath);
        }
      } catch (err) {
        console.warn('Warning: Could not delete old logo.png, it may be in use');
      }

      await sharp(logoPath)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(path.join(publicDir, 'logo-512.png'));

      console.log('✓ logo-512.png created successfully (512x512)');
      console.log('  Note: Please manually rename logo-512.png to logo.png after stopping the dev server');
    } else {
      console.log('✓ logo.png already correct size (512x512)');
    }

    console.log('\n✓ All icons resized successfully!');
    console.log('  - favicon.png: 192x192');
    console.log('  - logo.png: 512x512');

  } catch (error) {
    console.error('Error resizing icons:', error);
    process.exit(1);
  }
}

resizeIcons();
