/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum DitherMode {
  NONE = 'none',
  THRESHOLD = 'threshold',
  BAYER_4X4 = 'bayer_4x4',
  BAYER_8X8 = 'bayer_8x8',
  FLOYD_STEINBERG = 'floyd_steinberg',
  COLOR_HALFTONE = 'color_halftone',
  NOISE = 'noise',
}

export enum ColorMapPreset {
  MONOCHROME = 'monochrome',
  VERCEL_DARK = 'vercel_dark',
  CYBERPUNK = 'cyberpunk',
  EMERALD_TECH = 'emerald_tech',
  AMBER_CRT = 'amber_crt',
  SOLARIZED_SUNSET = 'solarized_sunset',
  ACID_MATRIX = 'acid_matrix',
  TOKYO_NEON = 'tokyo_neon',
  EIGHT_BIT_GAMEBOY = 'eight_bit_gameboy',
}

export interface GlitchParameters {
  // Image brightness/contrast adjustments before effects
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  grayscale: boolean;

  // Dither & Halftone
  ditherMode: DitherMode;
  ditherThreshold: number; // 0 to 255
  halftoneDotSize: number; // 2 to 24px
  halftoneAngle: number; // 0 to 360 degrees

  // Glitch Slices (Horizontal distortion)
  sliceDensity: number; // 0 to 100
  sliceIntensity: number; // 0 to 100
  sliceSpeed: number; // 0 to 10 (for animated playback)

  // Chromatic Aberration / RGB Shift
  rgbOffset: number; // 0 to 100px
  rgbAngle: number; // 0 to 360 degrees

  // Pixel Sorting
  pixelSortEnabled: boolean;
  pixelSortThreshold: number; // 0 to 100 (brightness threshold)
  pixelSortDirection: 'horizontal' | 'vertical';
  pixelSortLength: number; // 10 to 500px

  // Blocky Compression & Corruption
  blockCorruptionEnabled: boolean;
  blockCorruptionSize: number; // 4px to 128px
  blockCorruptionDensity: number; // 0 to 100
  blockCorruptionOffset: number; // 0 to 100px

  // Databending Artifacts
  databendIntensity: number; // 0 to 100
  databendLines: number; // 0 to 50

  // Post effects & styling overlays
  scanlinesIntensity: number; // 0 to 100
  scanlinesSpacing: number; // 2 to 8px
  crtGridEnabled: boolean;
  vhsGrain: number; // 0 to 100

  // Color Mapping
  colorPreset: ColorMapPreset;
  colorMix: number; // 0 to 100 (map intensity: 0 = original/grayscale, 100 = full duotone)

  // Glyph interface overlay
  glyphOverlayEnabled: boolean;
  glyphOverlayGrid: boolean;
  glyphText: string;
}

export interface StarterImage {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  params: Partial<GlitchParameters>;
}
