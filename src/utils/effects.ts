/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DitherMode, ColorMapPreset, GlitchParameters } from '../types';
import { COLOR_PALETTES } from '../data/presets';

interface Color {
  r: number;
  g: number;
  b: number;
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): Color {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Generate a 256-color gradient Look-Up Table (LUT)
function generateLut(colorsHex: string[]): Color[] {
  const lut: Color[] = new Array(256);
  const rgbs = colorsHex.map(hexToRgb);

  if (rgbs.length === 1) {
    const col = rgbs[0];
    lut.fill(col);
    return lut;
  }

  const numStops = rgbs.length;
  for (let i = 0; i < 256; i++) {
    const percent = i / 255;
    const rawIndex = percent * (numStops - 1);
    const lowerStop = Math.floor(rawIndex);
    const upperStop = Math.ceil(rawIndex);
    const diff = rawIndex - lowerStop;

    const c1 = rgbs[lowerStop];
    const c2 = rgbs[upperStop];

    lut[i] = {
      r: Math.round(c1.r * (1 - diff) + c2.r * diff),
      g: Math.round(c1.g * (1 - diff) + c2.g * diff),
      b: Math.round(c1.b * (1 - diff) + c2.b * diff),
    };
  }

  return lut;
}

// Bayer Dither Matrices
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const BAYER_8X8 = [
  [0, 48, 12, 60, 3, 51, 15, 63],
  [32, 16, 44, 28, 35, 19, 47, 31],
  [8, 56, 4, 52, 11, 59, 7, 55],
  [40, 24, 36, 20, 43, 27, 39, 23],
  [2, 50, 14, 62, 1, 49, 13, 61],
  [34, 18, 46, 30, 33, 17, 45, 29],
  [10, 58, 6, 54, 9, 57, 5, 53],
  [42, 26, 38, 22, 41, 25, 37, 21],
];

/**
 * Runs the dither filter on pixel buffers (Floyd-Steinberg, Bayer)
 */
function applyDithering(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  mode: DitherMode,
  threshold: number
) {
  if (mode === DitherMode.NONE) return;

  if (mode === DitherMode.THRESHOLD) {
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = lum >= threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
    return;
  }

  if (mode === DitherMode.NOISE) {
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      // Random offset centered on threshold
      const noise = (Math.random() - 0.5) * (threshold * 0.8);
      const val = lum + noise >= threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = val;
    }
    return;
  }

  if (mode === DitherMode.BAYER_4X4 || mode === DitherMode.BAYER_8X8) {
    const size = mode === DitherMode.BAYER_4X4 ? 4 : 8;
    const matrix = mode === DitherMode.BAYER_4X4 ? BAYER_4X4 : BAYER_8X8;
    const div = mode === DitherMode.BAYER_4X4 ? 16 : 64;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x * 4;
        const oldLum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        // Bayer threshold scale adjusted by user threshold control
        const brightnessFactor = threshold / 128; // standard threshold is 128
        const matrixVal = (matrix[y % size][x % size] / div) * 255 * brightnessFactor;

        const newLum = oldLum >= matrixVal ? 255 : 0;
        data[idx] = data[idx + 1] = data[idx + 2] = newLum;
      }
    }
    return;
  }

  if (mode === DitherMode.FLOYD_STEINBERG) {
    // Copy luma channel to Float32 array to avoid rounding errors during propagation
    const lumaBuffer = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      lumaBuffer[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    }

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const oldVal = lumaBuffer[idx];
        const newVal = oldVal >= threshold ? 255 : 0;

        // Apply immediately
        const pIdx = idx * 4;
        data[pIdx] = data[pIdx + 1] = data[pIdx + 2] = newVal;

        const error = oldVal - newVal;

        // Propagate Floyd-Steinberg error constants
        if (x + 1 < width) {
          lumaBuffer[idx + 1] += error * (7 / 16);
        }
        if (y + 1 < height) {
          if (x - 1 >= 0) {
            lumaBuffer[idx + width - 1] += error * (3 / 16);
          }
          lumaBuffer[idx + width] += error * (5 / 16);
          if (x + 1 < width) {
            lumaBuffer[idx + width + 1] += error * (1 / 16);
          }
        }
      }
    }
  }
}

/**
 * Grayscale converter
 */
function applyGrayscale(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = lum;
  }
}

/**
 * Programmatic horizontal shearing for random horizontal lines
 */
function applySlices(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  density: number,
  intensity: number
) {
  if (density === 0 || intensity === 0) return;

  const clone = new Uint8ClampedArray(data);
  const totalSlices = Math.round((density / 100) * 40);
  const maxShift = (intensity / 100) * 80; // offset bounds in pixel width

  for (let slice = 0; slice < totalSlices; slice++) {
    const sliceHeight = Math.floor(Math.random() * 22) + 3; // 3 to 25px tall
    const startY = Math.floor(Math.random() * (height - sliceHeight));
    const shiftX = Math.round((Math.random() - 0.5) * maxShift);

    if (startY < 0) continue;

    for (let sy = startY; sy < startY + sliceHeight; sy++) {
      if (sy >= height) continue;
      const rowOffset = sy * width * 4;

      for (let sx = 0; sx < width; sx++) {
        let sourceX = sx - shiftX;
        // Wrap coordinates to keep canvas clean
        if (sourceX < 0) {
          sourceX = (sourceX + width) % width;
        } else if (sourceX >= width) {
          sourceX = sourceX % width;
        }

        const targetIdx = rowOffset + sx * 4;
        const sourceIdx = rowOffset + sourceX * 4;

        data[targetIdx] = clone[sourceIdx];
        data[targetIdx + 1] = clone[sourceIdx + 1];
        data[targetIdx + 2] = clone[sourceIdx + 2];
      }
    }
  }
}

/**
 * Chromatic Aberration channel offset shifter
 */
function applyRgbShift(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  offset: number,
  angleDegrees: number
) {
  if (offset === 0) return;

  const rad = (angleDegrees * Math.PI) / 180;
  const dx = Math.round(offset * Math.cos(rad));
  const dy = Math.round(offset * Math.sin(rad));

  // Clone red and blue channels
  const rChannel = new Uint8Array(width * height);
  const bChannel = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    rChannel[i] = data[i * 4];
    bChannel[i] = data[i * 4 + 2];
  }

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width * 4;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x * 4;

      // Shift Red channel in direction (-dx, -dy)
      const rx = x - dx;
      const ry = y - dy;
      if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
        data[idx] = rChannel[ry * width + rx];
      }

      // Shift Blue channel in direction (+dx, +dy)
      const bx = x + dx;
      const by = y + dy;
      if (bx >= 0 && bx < width && by >= 0 && by < height) {
        data[idx + 2] = bChannel[by * width + bx];
      }
    }
  }
}

/**
 * Brightness / Contrast tuning
 */
function applyBrightnessContrast(
  data: Uint8ClampedArray,
  brightness: number,
  contrast: number
) {
  if (brightness === 0 && contrast === 0) return;

  const bAdj = (brightness / 100) * 255;
  const cAdj = (contrast + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Subtract 128 mid, scale by contrast, re-add 128 mid and add brightness offset
    data[i] = Math.min(255, Math.max(0, (r - 128) * cAdj + 128 + bAdj));
    data[i + 1] = Math.min(255, Math.max(0, (g - 128) * cAdj + 128 + bAdj));
    data[i + 2] = Math.min(255, Math.max(0, (b - 128) * cAdj + 128 + bAdj));
  }
}

/**
 * Pixel Sorting algorithm
 * Checks pixels along lines, groups them if they meet luma threshold, and sorts.
 */
function applyPixelSorting(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  direction: 'horizontal' | 'vertical',
  maxLength: number
) {
  // Translate threshold parameter (0..100) to luma (0..255)
  const lumaThreshold = (threshold / 100) * 255;

  if (direction === 'horizontal') {
    for (let y = 0; y < height; y++) {
      let x = 0;
      const rowOffset = y * width * 4;
      while (x < width) {
        const idx = rowOffset + x * 4;
        const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        if (luma >= lumaThreshold) {
          const startX = x;
          let endX = x;

          // Find sorted span boundary
          while (endX < width && endX - startX < maxLength) {
            const currentIdx = rowOffset + endX * 4;
            const currentLuma =
              0.299 * data[currentIdx] + 0.587 * data[currentIdx + 1] + 0.114 * data[currentIdx + 2];
            if (currentLuma < lumaThreshold) {
              break;
            }
            endX++;
          }

          if (endX - startX > 2) {
            // Sort pixels in this span
            const span: { r: number; g: number; b: number; luma: number }[] = [];
            for (let k = startX; k < endX; k++) {
              const pIdx = rowOffset + k * 4;
              const r = data[pIdx];
              const g = data[pIdx + 1];
              const b = data[pIdx + 2];
              span.push({ r, g, b, luma: 0.299 * r + 0.587 * g + 0.114 * b });
            }

            // High-contrast brightness sort descend
            span.sort((a, b) => b.luma - a.luma);

            for (let k = startX; k < endX; k++) {
              const pIdx = rowOffset + k * 4;
              const item = span[k - startX];
              data[pIdx] = item.r;
              data[pIdx + 1] = item.g;
              data[pIdx + 2] = item.b;
            }
          }
          x = endX;
        } else {
          x++;
        }
      }
    }
  } else {
    // Vertical Pixel sorting
    for (let x = 0; x < width; x++) {
      let y = 0;
      while (y < height) {
        const idx = (y * width + x) * 4;
        const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

        if (luma >= lumaThreshold) {
          const startY = y;
          let endY = y;

          while (endY < height && endY - startY < maxLength) {
            const currentIdx = (endY * width + x) * 4;
            const currentLuma =
              0.299 * data[currentIdx] + 0.587 * data[currentIdx + 1] + 0.114 * data[currentIdx + 2];
            if (currentLuma < lumaThreshold) {
              break;
            }
            endY++;
          }

          if (endY - startY > 2) {
            const span: { r: number; g: number; b: number; luma: number }[] = [];
            for (let k = startY; k < endY; k++) {
              const pIdx = (k * width + x) * 4;
              const r = data[pIdx];
              const g = data[pIdx + 1];
              const b = data[pIdx + 2];
              span.push({ r, g, b, luma: 0.299 * r + 0.587 * g + 0.114 * b });
            }

            span.sort((a, b) => b.luma - a.luma);

            for (let k = startY; k < endY; k++) {
              const pIdx = (k * width + x) * 4;
              const item = span[k - startY];
              data[pIdx] = item.r;
              data[pIdx + 1] = item.g;
              data[pIdx + 2] = item.b;
            }
          }
          y = endY;
        } else {
          y++;
        }
      }
    }
  }
}

/**
 * Swaps / duplicates squares (tiled corruption checkerboards)
 */
function applyBlockCorruption(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  size: number,
  density: number,
  offset: number
) {
  if (density === 0) return;

  const clone = new Uint8ClampedArray(data);
  const cols = Math.ceil(width / size);
  const rows = Math.ceil(height / size);
  const totalBlocks = cols * rows;

  // Corrupt a percentage of the tiles
  const numBlocksToCorrupt = Math.round((density / 100) * totalBlocks * 0.3);

  for (let b = 0; b < numBlocksToCorrupt; b++) {
    const srcCol = Math.floor(Math.random() * cols);
    const srcRow = Math.floor(Math.random() * rows);
    const destCol = Math.floor(Math.random() * cols);
    const destRow = Math.floor(Math.random() * rows);

    const shiftX = Math.round((Math.random() - 0.5) * offset);
    const shiftY = Math.round((Math.random() - 0.5) * offset);

    const type = Math.random();

    for (let y = 0; y < size; y++) {
      const targetY = destRow * size + y;
      if (targetY >= height) continue;

      const sourceY = Math.min(height - 1, Math.max(0, srcRow * size + y + shiftY));

      for (let x = 0; x < size; x++) {
        const targetX = destCol * size + x;
        if (targetX >= width) continue;

        const sourceX = Math.min(width - 1, Math.max(0, srcCol * size + x + shiftX));

        const destIdx = (targetY * width + targetX) * 4;
        const sourceIdx = (sourceY * width + sourceX) * 4;

        if (type < 0.5) {
          // Copy a shifted blocks
          data[destIdx] = clone[sourceIdx];
          data[destIdx + 1] = clone[sourceIdx + 1];
          data[destIdx + 2] = clone[sourceIdx + 2];
        } else if (type < 0.8) {
          // Grayscale inversion
          const r = clone[destIdx];
          const g = clone[destIdx + 1];
          const b = clone[destIdx + 2];
          data[destIdx] = 255 - r;
          data[destIdx + 1] = 255 - g;
          data[destIdx + 2] = 255 - b;
        } else {
          // Static Noise block
          const n = Math.random() * 255;
          data[destIdx] = n;
          data[destIdx + 1] = n;
          data[destIdx + 2] = n;
        }
      }
    }
  }
}

/**
 * Creates high-fidelity databending row displacement horizontal signal errors
 */
function applyDatabendLines(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  lineCount: number
) {
  if (intensity === 0 || lineCount === 0) return;

  const clone = new Uint8ClampedArray(data);

  for (let i = 0; i < lineCount; i++) {
    const targetY = Math.floor(Math.random() * height);
    const thickness = Math.floor(Math.random() * 6) + 1; // 1 to 7px thick
    const shift = Math.round((Math.random() - 0.5) * (intensity / 100) * 180);
    const glitchChannelMode = Math.random() > 0.5;

    for (let ty = targetY; ty < Math.min(height, targetY + thickness); ty++) {
      const rowOffset = ty * width * 4;

      for (let sx = 0; sx < width; sx++) {
        let sourceX = sx - shift;
        if (sourceX < 0) sourceX = (sourceX + width) % width;
        else if (sourceX >= width) sourceX = sourceX % width;

        const targetIdx = rowOffset + sx * 4;
        const sourceIdx = rowOffset + sourceX * 4;

        if (glitchChannelMode) {
          // Direct byte-wise color permutation
          data[targetIdx] = clone[sourceIdx + 1]; // R becomes G
          data[targetIdx + 1] = clone[sourceIdx + 2]; // G becomes B
          data[targetIdx + 2] = clone[sourceIdx]; // B becomes R
        } else {
          data[targetIdx] = clone[sourceIdx];
          data[targetIdx + 1] = clone[sourceIdx + 1];
          data[targetIdx + 2] = clone[sourceIdx + 2];
        }
      }
    }
  }
}

/**
 * Color overlay mapping via gradient look-ups
 */
function applyColorMapping(
  data: Uint8ClampedArray,
  preset: ColorMapPreset,
  mixVal: number
) {
  if (mixVal === 0 || preset === ColorMapPreset.MONOCHROME) return;

  const palette = COLOR_PALETTES[preset];
  if (!palette) return;

  const lut = generateLut(palette.colors);
  const factor = mixVal / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const target = lut[Math.min(255, Math.max(0, luma))];

    // Linear interpolate between current pixel and LUT color map
    data[i] = r * (1 - factor) + target.r * factor;
    data[i + 1] = g * (1 - factor) + target.g * factor;
    data[i + 2] = b * (1 - factor) + target.b * factor;
  }
}

/**
 * VHS grain and analogue TV static offsets
 */
function applyVhsGrain(data: Uint8ClampedArray, percentage: number) {
  if (percentage === 0) return;
  const scale = (percentage / 100) * 120; // grain dispersion bounds

  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * scale;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
}

/**
 * Raster Scanline shadows
 */
function applyScanlines(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  spacing: number
) {
  if (intensity === 0) return;
  const multiplier = 1 - intensity / 100;

  for (let y = 0; y < height; y++) {
    if (y % spacing === 0) {
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x * 4;
        data[idx] *= multiplier;
        data[idx + 1] *= multiplier;
        data[idx + 2] *= multiplier;
      }
    }
  }
}

/**
 * Cycles RGB columns for an amazing subpixel TV grid overlay
 */
function applyCrtPhosphor(data: Uint8ClampedArray, width: number, height: number) {
  const crtFactor = 0.58; // slightly darken adjacent phosphor bars for structural CRT layout

  for (let x = 0; x < width; x++) {
    const channel = x % 3; // Red=0, Green=1, Blue=2 phosphor triads
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      if (channel === 0) {
        data[idx + 1] *= crtFactor; // dampen green
        data[idx + 2] *= crtFactor; // dampen blue
      } else if (channel === 1) {
        data[idx] *= crtFactor; // dampen red
        data[idx + 2] *= crtFactor; // dampen blue
      } else {
        data[idx] *= crtFactor; // dampen red
        data[idx + 1] *= crtFactor; // dampen green
      }
    }
  }
}

/**
 * Draws crisp technical grid lines in-context
 */
function drawTechnicalMesh(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  // Render a Vercel-like dotted grid layout
  const gridSpacing = 32;
  ctx.beginPath();
  for (let x = 0; x < width; x += gridSpacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y < height; y += gridSpacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Add precise crosshairs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  const crosshairSize = 10;
  const padding = 20;

  // Top Left Crosshair
  ctx.beginPath();
  ctx.moveTo(padding, padding + crosshairSize);
  ctx.lineTo(padding, padding);
  ctx.lineTo(padding + crosshairSize, padding);
  ctx.stroke();

  // Bottom Right Crosshair
  ctx.beginPath();
  ctx.moveTo(width - padding, height - padding - crosshairSize);
  ctx.lineTo(width - padding, height - padding);
  ctx.lineTo(width - padding - crosshairSize, height - padding);
  ctx.stroke();
}

/**
 * Draws technical statistics text directly onto canvas (Disabled to keep image frame clean)
 */
function drawTechnicalText(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string
) {
  // Empty definition to keep image frame entirely pristine and text-free
}

/**
 * Core image processing coordinator
 */
export function processGlitchImage(
  sourceImage: HTMLImageElement | HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  params: GlitchParameters,
  isProcedural = false
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const width = targetCanvas.width;
  const height = targetCanvas.height;

  // Clear previous output
  ctx.clearRect(0, 0, width, height);

  // 1. Render initial source image
  if (isProcedural) {
    // Render procedural tech generator inside canvas!
    ctx.fillStyle = '#06060c';
    ctx.fillRect(0, 0, width, height);

    // Procedural glowing spheres & recursive tech shapes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    // Draw tech circular compass
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width / 2, height / 2, width * 0.14, 0, Math.PI * 2);
    ctx.stroke();

    // Draw some radial tech spokes
    ctx.beginPath();
    const numSpokes = 16;
    for (let i = 0; i < numSpokes; i++) {
      const angle = (i * Math.PI) / (numSpokes / 2);
      ctx.moveTo(width / 2, height / 2);
      ctx.lineTo(
        width / 2 + Math.cos(angle) * (width * 0.32),
        height / 2 + Math.sin(angle) * (height * 0.32)
      );
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // Concentric grid bars and technical boxes
    ctx.strokeRect(width * 0.15, height * 0.15, width * 0.7, height * 0.7);
  } else {
    // Standard Draw scaled & center-cropped
    const imgAspectRatio = sourceImage.width / sourceImage.height;
    const canvasAspectRatio = width / height;

    let sx = 0,
      sy = 0,
      sWidth = sourceImage.width,
      sHeight = sourceImage.height;

    if (imgAspectRatio > canvasAspectRatio) {
      sWidth = sourceImage.height * canvasAspectRatio;
      sx = (sourceImage.width - sWidth) / 2;
    } else {
      sHeight = sourceImage.width / canvasAspectRatio;
      sy = (sourceImage.height - sHeight) / 2;
    }

    ctx.drawImage(sourceImage, sx, sy, sWidth, sHeight, 0, 0, width, height);
  }

  // Handle color halftone Screen rendering first since it is drawn in direct vector circles
  if (params.ditherMode === DitherMode.COLOR_HALFTONE) {
    // Read preprocessed image data from scaled drawing
    const baseImgData = ctx.getImageData(0, 0, width, height);
    applyBrightnessContrast(baseImgData.data, params.brightness, params.contrast);
    if (params.grayscale) applyGrayscale(baseImgData.data);

    // Save offscreen context data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCanvas.getContext('2d')?.putImageData(baseImgData, 0, 0);

    // Draw a dark canvas backdrop to lay solid halftone dots onto
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, width, height);

    // Run tilted halftone DOT rendering
    const angleRad = (params.halftoneAngle * Math.PI) / 180;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    const step = params.halftoneDotSize;
    const maxDiag = Math.ceil(Math.sqrt(width * width + height * height));

    const sourceData = baseImgData.data;

    ctx.fillStyle = '#ffffff';
    for (let gx = -maxDiag; gx < width + maxDiag; gx += step) {
      for (let gy = -maxDiag; gy < height + maxDiag; gy += step) {
        // Project grid cell coordinates back to upright original space
        const rx = Math.round(gx * cosAngle - gy * sinAngle + width / 2);
        const ry = Math.round(gx * sinAngle + gy * cosAngle + height / 2);

        if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
          const idx = (ry * width + rx) * 4;
          const r = sourceData[idx];
          const g = sourceData[idx + 1];
          const b = sourceData[idx + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;

          // Dot size matches local brightness
          const radius = (step / 2) * (luma / 255) * 1.35;

          if (radius > 0.4) {
            ctx.beginPath();
            ctx.arc(rx, ry, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }
  } else {
    // Normal sequential pixel processing steps
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    // 1. Adjust brightness controls and luma contrast
    applyBrightnessContrast(d, params.brightness, params.contrast);

    // 2. Grayscale if required
    if (params.grayscale) {
      applyGrayscale(d);
    }

    // 3. Dither if not halftone screen
    applyDithering(d, width, height, params.ditherMode, params.ditherThreshold);

    // 4. Glitch slicing horizontal
    applySlices(d, width, height, params.sliceDensity, params.sliceIntensity);

    // 5. Pixel sorting
    if (params.pixelSortEnabled) {
      applyPixelSorting(
        d,
        width,
        height,
        params.pixelSortThreshold,
        params.pixelSortDirection,
        params.pixelSortLength
      );
    }

    // 6. Blocky structural tiles corruption
    if (params.blockCorruptionEnabled) {
      applyBlockCorruption(
        d,
        width,
        height,
        params.blockCorruptionSize,
        params.blockCorruptionDensity,
        params.blockCorruptionOffset
      );
    }

    // 7. Databending line jitters
    if (params.databendIntensity > 0) {
      applyDatabendLines(d, width, height, params.databendIntensity, params.databendLines);
    }

    // 8. Chromatic shift
    if (params.rgbOffset > 0) {
      applyRgbShift(d, width, height, params.rgbOffset, params.rgbAngle);
    }

    // 9. Gradient Map mapping
    applyColorMapping(d, params.colorPreset, params.colorMix);

    // 10. Scanlines structure
    applyScanlines(d, width, height, params.scanlinesIntensity, params.scanlinesSpacing);

    // 11. Phosphor triads CRT
    if (params.crtGridEnabled) {
      applyCrtPhosphor(d, width, height);
    }

    // 12. Digital Static Film Noise
    applyVhsGrain(d, params.vhsGrain);

    // Redraw final processed pixel vector back
    ctx.putImageData(imgData, 0, 0);
  }

  // Direct vectors layering (Corner markers / text glyph overlay layer on top)
  if (params.glyphOverlayEnabled) {
    if (params.glyphOverlayGrid) {
      drawTechnicalMesh(ctx, width, height);
    }
    if (params.glyphText) {
      drawTechnicalText(ctx, width, height, params.glyphText);
    }
  }
}
