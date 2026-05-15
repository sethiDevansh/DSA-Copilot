/**
 * scripts/generate-icons.js
 *
 * Generates placeholder PNG icons for the Chrome extension using
 * the `canvas` npm package.
 *
 * Usage:
 *   npm install canvas --save-dev   (one-time)
 *   node scripts/generate-icons.js
 */

const { createCanvas } = require('canvas');
const fs               = require('fs');
const path             = require('path');

const SIZES = [16, 32, 48, 128];
const OUT   = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

for (const size of SIZES) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');

  // Background
  const r = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#09d2f5');
  grad.addColorStop(1, '#0093bb');
  ctx.fillStyle = grad;
  ctx.fill();

  // Text symbol (only if large enough)
  if (size >= 32) {
    ctx.fillStyle    = '#000';
    ctx.font         = `bold ${Math.round(size * 0.38)}px monospace`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('/', size / 2, size / 2);
  }

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT, `icon${size}.png`), buffer);
  console.log(`✓ icon${size}.png`);
}

console.log('Icons generated in public/icons/');
