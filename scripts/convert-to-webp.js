import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

async function convertPngToWebp(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let totalSaved = 0;
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const saved = await convertPngToWebp(fullPath);
      totalSaved += saved;
      continue;
    }
    if (!entry.name.endsWith('.png')) continue;

    const webpPath = fullPath.replace(/\.png$/, '.webp');
    const originalSize = fs.statSync(fullPath).size;

    try {
      await sharp(fullPath)
        .webp({ quality: 82 })
        .toFile(webpPath);

      const newSize = fs.statSync(webpPath).size;
      const saved = originalSize - newSize;
      totalSaved += saved;
      count++;

      const pct = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`✅ ${entry.name} → ${entry.name.replace('.png', '.webp')}  ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB  (-${pct}%)`);

      // Remove original PNG
      fs.unlinkSync(fullPath);
    } catch (e) {
      console.error(`❌ Failed: ${entry.name} - ${e.message}`);
    }
  }

  return totalSaved;
}

console.log('🎨 Converting PNG → WebP...\n');
const totalSaved = await convertPngToWebp(publicDir);
console.log(`\n🏁 Done! Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
