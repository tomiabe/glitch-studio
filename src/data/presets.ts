/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DitherMode, ColorMapPreset, Preset, StarterImage } from '../types';

export const STARTER_IMAGES: StarterImage[] = [
  {
    id: 'cyberpunk_portrait',
    name: 'Cybernetic Android',
    url: '/src/assets/images/cyberpunk_portrait_1781102413635.png',
    description: 'High-contrast portrait of a tech-enhanced android woman, ideal for beautiful halftone and dither dots.'
  },
  {
    id: 'brutalist_structure',
    name: 'Brutalist Structure',
    url: '/src/assets/images/brutalist_structure_1781102429428.png',
    description: 'Rigid geometry, cascaded spheres and grids. Shows off pixel sorting and horizontal slicing beautifully.'
  },
  {
    id: 'scifi_skull_hud',
    name: 'Humanist Tech HUD',
    url: '/src/assets/images/scifi_skull_hud_1781102444188.png',
    description: 'Crisp vector outline of a skull integrated with circuit layouts. Perfect for scanlines and CRT grids.'
  },
  {
    id: 'procedural_grid',
    name: 'Procedural Tech Pattern (System)',
    url: 'procedural',
    description: 'A dynamically generated canvas mesh grid of technical circles, crosshairs, and monospaced glyphs.'
  }
];

export const COLOR_PALETTES = {
  [ColorMapPreset.MONOCHROME]: {
    name: 'Monochrome (1-Bit)',
    colors: ['#000000', '#ffffff'],
    description: 'Pure high-contrast black and white.'
  },
  [ColorMapPreset.VERCEL_DARK]: {
    name: 'Geist Charcoal',
    colors: ['#09090b', '#71717a', '#fafafa'],
    description: 'Crisp, tech-inspired grayscale gradient.'
  },
  [ColorMapPreset.CYBERPUNK]: {
    name: 'Neon Cyberpunk',
    colors: ['#0a0015', '#00ffcc', '#ff007f'],
    description: 'Electric pink and deep turquoise.'
  },
  [ColorMapPreset.EMERALD_TECH]: {
    name: 'Emerald Matrix',
    colors: ['#022c22', '#10b981', '#ecfdf5'],
    description: 'A warm technical laboratory emerald look.'
  },
  [ColorMapPreset.AMBER_CRT]: {
    name: 'Phosphor Amber',
    colors: ['#120900', '#f59e0b', '#fffbeb'],
    description: 'Retro 80s amber mainframes and industrial terminals.'
  },
  [ColorMapPreset.SOLARIZED_SUNSET]: {
    name: 'Solarized Sunset',
    colors: ['#1c0024', '#f43f5e', '#fed7aa'],
    description: 'Vibrant violet-rose with soft warm cream highlights.'
  },
  [ColorMapPreset.ACID_MATRIX]: {
    name: 'Acid Luma',
    colors: ['#0a0f0d', '#a3e635', '#f7fee7'],
    description: 'High frequency neon-lime green with deep obsidian.'
  },
  [ColorMapPreset.TOKYO_NEON]: {
    name: 'Tokyo Neon Grid',
    colors: ['#0d0415', '#7c3aed', '#38bdf8', '#ffffff'],
    description: 'Intense violet, cyan, and crisp white highlights.'
  },
  [ColorMapPreset.EIGHT_BIT_GAMEBOY]: {
    name: 'DMG-01 Gameboy',
    colors: ['#0f380f', '#306230', '#8bac0f', '#9bbc0f'],
    description: 'Nostalgic matrix green game console LCD screen.'
  }
};

export const DEFAULT_PARAMETERS = {
  brightness: 0,
  contrast: 0,
  grayscale: false,
  ditherMode: DitherMode.BAYER_8X8,
  ditherThreshold: 128,
  halftoneDotSize: 6,
  halftoneAngle: 45,
  sliceDensity: 15,
  sliceIntensity: 10,
  sliceSpeed: 0,
  rgbOffset: 6,
  rgbAngle: 120,
  pixelSortEnabled: false,
  pixelSortThreshold: 45,
  pixelSortDirection: 'horizontal' as const,
  pixelSortLength: 150,
  blockCorruptionEnabled: false,
  blockCorruptionSize: 16,
  blockCorruptionDensity: 30,
  blockCorruptionOffset: 25,
  databendIntensity: 0,
  databendLines: 0,
  scanlinesIntensity: 15,
  scanlinesSpacing: 3,
  crtGridEnabled: false,
  vhsGrain: 10,
  colorPreset: ColorMapPreset.MONOCHROME,
  colorMix: 0,
  glyphOverlayEnabled: false,
  glyphOverlayGrid: false,
  glyphText: 'ST-002 // CRITICAL SYSTEM INTERRUPT'
};

export const PRESETS: Preset[] = [
  {
    id: 'pristine',
    name: 'Pristine Base',
    description: 'No glitched slices or dither. Just the original source image with subtle film grain.',
    params: {
      ditherMode: DitherMode.NONE,
      sliceDensity: 0,
      sliceIntensity: 0,
      rgbOffset: 0,
      pixelSortEnabled: false,
      blockCorruptionEnabled: false,
      scanlinesIntensity: 0,
      vhsGrain: 5,
      colorPreset: ColorMapPreset.MONOCHROME,
      colorMix: 0,
      glyphOverlayEnabled: false
    }
  },
  {
    id: 'newsprint_dither',
    name: 'Vercel Newsprint',
    description: 'Traditional high-contrast halftone screen with sharp dot pitches and black/white newspaper print aesthetic.',
    params: {
      grayscale: true,
      ditherMode: DitherMode.COLOR_HALFTONE,
      halftoneDotSize: 8,
      halftoneAngle: 45,
      sliceDensity: 3,
      sliceIntensity: 2,
      rgbOffset: 0,
      contrast: 25,
      brightness: 10,
      vhsGrain: 12,
      scanlinesIntensity: 0,
      colorPreset: ColorMapPreset.VERCEL_DARK,
      colorMix: 100,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: true,
      glyphText: 'V-04 // PRINT CORE'
    }
  },
  {
    id: 'cyber_dither',
    name: 'Floyd-Steinberg Retro Cyber',
    description: 'Error-diffusion dithering mapped to high-intensity Tokyo Neon gradient, accented by fine horizontal slices and chromatic aberration.',
    params: {
      ditherMode: DitherMode.FLOYD_STEINBERG,
      contrast: 15,
      sliceDensity: 25,
      sliceIntensity: 15,
      rgbOffset: 12,
      vhsGrain: 15,
      scanlinesIntensity: 20,
      scanlinesSpacing: 4,
      colorPreset: ColorMapPreset.CYBERPUNK,
      colorMix: 100,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: false,
      glyphText: 'PORT_STREAM.DUMP'
    }
  },
  {
    id: 'databend_decay',
    name: 'Decayed Data Stream',
    description: 'Heavy programmatic compression block corruption, color bleeding, scanlines, and pixel-sorting threshold glitches.',
    params: {
      ditherMode: DitherMode.NONE,
      contrast: 10,
      sliceDensity: 40,
      sliceIntensity: 25,
      rgbOffset: 16,
      pixelSortEnabled: true,
      pixelSortThreshold: 35,
      pixelSortDirection: 'horizontal',
      pixelSortLength: 200,
      blockCorruptionEnabled: true,
      blockCorruptionSize: 24,
      blockCorruptionDensity: 45,
      blockCorruptionOffset: 35,
      databendIntensity: 40,
      databendLines: 15,
      scanlinesIntensity: 35,
      crtGridEnabled: true,
      vhsGrain: 25,
      colorPreset: ColorMapPreset.TOKYO_NEON,
      colorMix: 85,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: true,
      glyphText: 'SYS.MEM_ERR_CRITICAL'
    }
  },
  {
    id: 'gameboy_retro',
    name: 'DMG-01 Gameboy LCD',
    description: 'Bayer ordered dither mapped perfectly to the classic 4-shade green liquid crystal display of the 1989 Gameboy.',
    params: {
      grayscale: true,
      ditherMode: DitherMode.BAYER_8X8,
      contrast: 20,
      brightness: -5,
      sliceDensity: 0,
      rgbOffset: 0,
      scanlinesIntensity: 15,
      scanlinesSpacing: 3,
      crtGridEnabled: false,
      vhsGrain: 8,
      colorPreset: ColorMapPreset.EIGHT_BIT_GAMEBOY,
      colorMix: 100,
      glyphOverlayEnabled: false
    }
  },
  {
    id: 'phosphor_amber',
    name: 'Amber Terminal Screen',
    description: 'Industrial mainframe display style with vertical pixel sorting, intense horizontal lines, and phosphor amber overlays.',
    params: {
      ditherMode: DitherMode.NONE, // No dither, keeps pixel sorting values elegant and smooth
      contrast: 30,
      brightness: 10,
      ditherThreshold: 140,
      sliceDensity: 12,
      sliceIntensity: 18,
      rgbOffset: 8,
      pixelSortEnabled: true,
      pixelSortThreshold: 55,
      pixelSortDirection: 'vertical',
      pixelSortLength: 80,
      scanlinesIntensity: 50,
      scanlinesSpacing: 3,
      crtGridEnabled: true,
      vhsGrain: 15,
      colorPreset: ColorMapPreset.AMBER_CRT,
      colorMix: 100,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: true,
      glyphText: 'AMBER_SYS_1984 V3.2'
    }
  },
  {
    id: 'acid_corrupt',
    name: 'Acid Matrix Corruption',
    description: 'High-frequency lime green neon distortion over pixel sorted noise cascades with intense signal aberration.',
    params: {
      brightness: 15,
      contrast: 40,
      ditherMode: DitherMode.BAYER_4X4,
      sliceDensity: 60,
      sliceIntensity: 40,
      rgbOffset: 25,
      pixelSortEnabled: true,
      pixelSortThreshold: 25,
      pixelSortDirection: 'horizontal',
      pixelSortLength: 350,
      blockCorruptionEnabled: true,
      blockCorruptionSize: 8,
      blockCorruptionDensity: 70,
      blockCorruptionOffset: 50,
      scanlinesIntensity: 30,
      vhsGrain: 40,
      colorPreset: ColorMapPreset.ACID_MATRIX,
      colorMix: 100,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: true,
      glyphText: 'ACID.KERNEL.EXPLOIT'
    }
  },
  {
    id: 'solarized_sunset_wave',
    name: 'Solarized Sunset Synthwave',
    description: 'Beautiful purple-rose halftone dither with chromatic subpixel aberration, perfect for editorial and retro synthwave styles.',
    params: {
      brightness: 5,
      contrast: 15,
      ditherMode: DitherMode.COLOR_HALFTONE,
      halftoneDotSize: 6,
      halftoneAngle: 15,
      sliceDensity: 8,
      sliceIntensity: 5,
      rgbOffset: 14,
      rgbAngle: 45,
      pixelSortEnabled: false,
      blockCorruptionEnabled: false,
      scanlinesIntensity: 18,
      scanlinesSpacing: 3,
      crtGridEnabled: false,
      vhsGrain: 15,
      colorPreset: ColorMapPreset.SOLARIZED_SUNSET,
      colorMix: 90,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: false,
      glyphText: 'SUNSET.CHIP_08'
    }
  },
  {
    id: 'emerald_matrix_lab',
    name: 'Emerald Laboratory HUD',
    description: 'Retro phosphor green digital monitor aesthetic with heavy vertical scanlines, Bayer ordered dithering, and vertical pixel cascades.',
    params: {
      brightness: 10,
      contrast: 25,
      ditherMode: DitherMode.BAYER_8X8,
      ditherThreshold: 110,
      sliceDensity: 20,
      sliceIntensity: 12,
      rgbOffset: 6,
      pixelSortEnabled: true,
      pixelSortThreshold: 40,
      pixelSortDirection: 'vertical',
      pixelSortLength: 120,
      blockCorruptionEnabled: true,
      blockCorruptionSize: 16,
      blockCorruptionDensity: 20,
      blockCorruptionOffset: 15,
      scanlinesIntensity: 45,
      scanlinesSpacing: 2,
      crtGridEnabled: true,
      vhsGrain: 18,
      colorPreset: ColorMapPreset.EMERALD_TECH,
      colorMix: 100,
      glyphOverlayEnabled: true,
      glyphOverlayGrid: true,
      glyphText: 'EMERALD_LAB_SECURE'
    }
  },
  {
    id: 'analog_vhs_bleed',
    name: 'Analog VHS Bleed',
    description: 'Vibrant magnetic cassette simulation with high dispersion, chroma bleed, tracking glitch artifacts, and heavy luminance noise.',
    params: {
      brightness: -5,
      contrast: 20,
      ditherMode: DitherMode.NOISE,
      ditherThreshold: 130,
      sliceDensity: 45,
      sliceIntensity: 22,
      rgbOffset: 22,
      rgbAngle: 180,
      pixelSortEnabled: true,
      pixelSortThreshold: 50,
      pixelSortDirection: 'horizontal',
      pixelSortLength: 180,
      blockCorruptionEnabled: true,
      blockCorruptionSize: 32,
      blockCorruptionDensity: 35,
      blockCorruptionOffset: 25,
      scanlinesIntensity: 25,
      scanlinesSpacing: 4,
      crtGridEnabled: true,
      vhsGrain: 45,
      colorPreset: ColorMapPreset.TOKYO_NEON,
      colorMix: 75,
      glyphOverlayEnabled: false
    }
  },
  {
    id: 'bayer_monochrome_monolith',
    name: '1-Bit Bayer Monolith',
    description: 'Striking high-contrast retro Macintosh 1-bit display style with clean ordered dither pattern scaling and zero noise.',
    params: {
      brightness: 15,
      contrast: 50,
      grayscale: true,
      ditherMode: DitherMode.BAYER_8X8,
      ditherThreshold: 128,
      sliceDensity: 0,
      sliceIntensity: 0,
      rgbOffset: 0,
      pixelSortEnabled: false,
      blockCorruptionEnabled: false,
      scanlinesIntensity: 0,
      crtGridEnabled: false,
      vhsGrain: 0,
      colorPreset: ColorMapPreset.MONOCHROME,
      colorMix: 100,
      glyphOverlayEnabled: false
    }
  },
  {
    id: 'subtle_cyber_shift',
    name: 'Subtle Tokyo Aberration',
    description: 'Extremely clean cyan-magenta subpixel alignment shift with very subtle scanline grid overlays, optimized for detailed high-res photos.',
    params: {
      brightness: 2,
      contrast: 8,
      ditherMode: DitherMode.NONE,
      sliceDensity: 6,
      sliceIntensity: 4,
      rgbOffset: 8,
      rgbAngle: 110,
      pixelSortEnabled: false,
      blockCorruptionEnabled: false,
      scanlinesIntensity: 12,
      scanlinesSpacing: 3,
      crtGridEnabled: false,
      vhsGrain: 8,
      colorPreset: ColorMapPreset.CYBERPUNK,
      colorMix: 35,
      glyphOverlayEnabled: false
    }
  }
];
