const sharp = require('sharp');

async function generateHeader() {
  const WIDTH = 4096;
  const HEIGHT = 2304;
  const bgPath = process.argv[2] || 'attached_assets/generated_images/synccos_bg3.png';
  const outputPath = 'synccos-header.jpg';

  const svgText = `
  <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#B54FC4;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#80E8FF;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#12CDF5;stop-opacity:1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 60}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="280"
          font-weight="bold"
          letter-spacing="20"
          fill="url(#textGrad)"
          text-anchor="middle"
          filter="url(#glow)">Synccos</text>
  </svg>`;

  const textOverlay = Buffer.from(svgText);

  const result = await sharp(bgPath)
    .resize(WIDTH, HEIGHT, { fit: 'cover' })
    .composite([{ input: textOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(outputPath);

  console.log(`Output: ${outputPath}`);
  console.log(`Dimensions: ${result.width}x${result.height}`);
  console.log(`Size: ${result.size} bytes (${(result.size / 1024 / 1024).toFixed(2)} MB)`);

  if (result.size > 1024 * 1024) {
    console.log('File exceeds 1 MB, recompressing at lower quality...');
    const fs = require('fs');
    const reResult = await sharp(outputPath)
      .jpeg({ quality: 70, mozjpeg: true })
      .toFile('synccos-header-tmp.jpg');
    fs.renameSync('synccos-header-tmp.jpg', outputPath);
    console.log(`Recompressed: ${reResult.size} bytes (${(reResult.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  const metadata = await sharp(outputPath).metadata();
  console.log(`\nVerification:`);
  console.log(`  Format: ${metadata.format}`);
  console.log(`  Width: ${metadata.width}`);
  console.log(`  Height: ${metadata.height}`);
  console.log(`  Channels: ${metadata.channels}`);
  console.log(`  Has alpha: ${metadata.hasAlpha}`);
}

generateHeader().catch(console.error);
