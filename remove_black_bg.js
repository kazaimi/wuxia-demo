import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const PUBLIC_DIR = './public';
const files = [
  'boss_chaos_eye.png',
  'boss_shadow_chain.png',
  'boss_roar_skull.png',
  'boss_extinction_spear.png'
];

async function removeBlackBackground(filename) {
  const inputPath = path.join(PUBLIC_DIR, filename);
  
  // Create a backup first just in case
  const backupPath = path.join(PUBLIC_DIR, filename + '.bak');
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(inputPath, backupPath);
    console.log(`Created backup for ${filename}`);
  }

  console.log(`Processing ${filename}...`);
  
  const image = sharp(backupPath);
  const metadata = await image.metadata();
  
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const lowThreshold = 20;   // Anything below this brightness is fully transparent
  const highThreshold = 85;  // Anything above this brightness is fully opaque

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate brightness as the maximum channel value (keeps colors vibrant)
    const brightness = Math.max(r, g, b);
    
    let alpha = 255;
    if (brightness <= lowThreshold) {
      alpha = 0;
    } else if (brightness < highThreshold) {
      // Linear interpolation for smooth feathering
      alpha = Math.round(((brightness - lowThreshold) / (highThreshold - lowThreshold)) * 255);
    }
    
    data[i + 3] = alpha;

    // Optional: Un-multiply alpha to prevent dark fringes on the edges
    if (alpha > 0 && alpha < 255) {
      const factor = 255 / alpha;
      data[i] = Math.min(255, Math.round(r * factor));
      data[i + 1] = Math.min(255, Math.round(g * factor));
      data[i + 2] = Math.min(255, Math.round(b * factor));
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(inputPath);

  console.log(`Saved transparent image to ${inputPath}`);
}

async function main() {
  try {
    for (const file of files) {
      await removeBlackBackground(file);
    }
    console.log('All images processed successfully!');
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

main();
