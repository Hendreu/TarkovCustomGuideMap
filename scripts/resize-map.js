const sharp = require('sharp');
const path = require('path');

async function resizeMap() {
  const inputPath = path.join(__dirname, '..', 'mapas', 'groundzero.png');
  const outputPath = path.join(__dirname, '..', 'public', 'maps', 'GroundZero.png');

  try {
    await sharp(inputPath)
      .resize(1573, 804, {
        fit: 'fill'
      })
      .toFile(outputPath);
    
    console.log('✓ Ground Zero map resized to 1573x804');
  } catch (error) {
    console.error('Error resizing image:', error);
  }
}

resizeMap();
