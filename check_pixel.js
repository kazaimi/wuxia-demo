import sharp from 'sharp';

async function main() {
  try {
    const image = sharp('./public/boss_mola_portrait.png');
    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    console.log(`Image size: ${info.width}x${info.height}, channels: ${info.channels}`);
    
    // Check some corner pixels
    const cornerPixels = [
      [0, 0],
      [10, 10],
      [info.width - 1, 0],
      [0, info.height - 1]
    ];
    
    for (const [x, y] of cornerPixels) {
      const idx = (y * info.width + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = info.channels === 4 ? data[idx + 3] : 255;
      console.log(`Pixel at (${x}, ${y}): R=${r}, G=${g}, B=${b}, A=${a}`);
    }
  } catch (err) {
    console.error(err);
  }
}

main();
