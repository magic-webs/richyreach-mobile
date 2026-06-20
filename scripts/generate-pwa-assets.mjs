import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

const sourceIcon = './assets/images/richyreach-logo.png';
const publicDir = './public';

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  console.log(`Creating directory: ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generate() {
  try {
    const targets = [
      { name: 'favicon.png', size: 48 },
      { name: 'logo192.png', size: 192 },
      { name: 'logo512.png', size: 512 }
    ];

    for (const target of targets) {
      console.log(`Reading source icon: ${sourceIcon}`);
      const img = await Jimp.read(sourceIcon);
      
      console.log(`Resizing to ${target.size}x${target.size}...`);
      img.resize({ w: target.size, h: target.size });
      
      const outputPath = path.join(publicDir, target.name);
      console.log(`Writing to ${outputPath}...`);
      await img.write(outputPath);
    }
    
    console.log('Successfully generated all PWA icons!');
  } catch (error) {
    console.error('Failed to generate PWA icons:', error);
    process.exit(1);
  }
}

generate();
