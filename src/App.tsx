/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  Tv,
  HelpCircle,
  Binary,
  Layers,
  Cpu,
  User,
  GitBranch,
  Volume2,
  Info,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import CanvasContainer from './components/CanvasContainer';
import { DitherMode, ColorMapPreset, GlitchParameters } from './types';
import { DEFAULT_PARAMETERS, STARTER_IMAGES } from './data/presets';
import { processGlitchImage } from './utils/effects';

export default function App() {
  const [params, setParams] = useState<GlitchParameters>(DEFAULT_PARAMETERS);
  const [selectedImageId, setSelectedImageId] = useState<string>('cyberpunk_portrait');
  const [customImageSrc, setCustomImageSrc] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ w: number; h: number }>({ w: 512, h: 512 });
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showInfoPanel, setShowInfoPanel] = useState<boolean>(false);

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<HTMLImageElement | null>(null);

  // Decoupled Image Loading Strategy
  useEffect(() => {
    if (selectedImageId === 'procedural_grid') {
      imageCacheRef.current = null;
      triggerRender();
      return;
    }

    const starter = STARTER_IMAGES.find((x) => x.id === selectedImageId);
    const srcUrl = selectedImageId === 'custom' ? customImageSrc : starter?.url;
    if (!srcUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = srcUrl;
    img.onload = () => {
      imageCacheRef.current = img;
      triggerRender();
    };
    img.onerror = () => {
      console.error('Failed to load image asset: ' + srcUrl);
    };
  }, [selectedImageId, customImageSrc, dimensions]);

  // Trigger processed render loops on parameter updates
  useEffect(() => {
    triggerRender();
  }, [params]);

  const triggerRender = () => {
    const originalCanvas = originalCanvasRef.current;
    const targetCanvas = targetCanvasRef.current;
    if (!originalCanvas || !targetCanvas) return;

    const isProcedural = selectedImageId === 'procedural_grid';
    const img = imageCacheRef.current;

    // Reset dimensions inside canvas refs safely
    originalCanvas.width = dimensions.w;
    originalCanvas.height = dimensions.h;
    targetCanvas.width = dimensions.w;
    targetCanvas.height = dimensions.h;

    const origCtx = originalCanvas.getContext('2d');
    if (origCtx) {
      origCtx.clearRect(0, 0, dimensions.w, dimensions.h);
      if (isProcedural) {
        // Draw standard systemic grid lines on original canvas baseline
        origCtx.fillStyle = '#06060c';
        origCtx.fillRect(0, 0, dimensions.w, dimensions.h);

        origCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        origCtx.lineWidth = 1;
        origCtx.beginPath();
        origCtx.arc(dimensions.w / 2, dimensions.h / 2, dimensions.w * 0.28, 0, Math.PI * 2);
        origCtx.stroke();

        origCtx.beginPath();
        origCtx.arc(dimensions.w / 2, dimensions.h / 2, dimensions.w * 0.14, 0, Math.PI * 2);
        origCtx.stroke();

        origCtx.strokeRect(dimensions.w * 0.15, dimensions.h * 0.15, dimensions.w * 0.7, dimensions.h * 0.7);
      } else if (img) {
        // Center-crop source photo nicely to match canvas dimensions
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = dimensions.w / dimensions.h;

        let sx = 0,
          sy = 0,
          sWidth = img.width,
          sHeight = img.height;

        if (imgAspectRatio > canvasAspectRatio) {
          sWidth = img.height * canvasAspectRatio;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width / canvasAspectRatio;
          sy = (img.height - sHeight) / 2;
        }

        origCtx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, dimensions.w, dimensions.h);
      }
    }

    // Pass image or original canvas drawing to glitch processing steps
    if (isProcedural) {
      processGlitchImage(originalCanvas, targetCanvas, params, true);
    } else if (img) {
      processGlitchImage(img, targetCanvas, params, false);
    }
  };

  // Upload parsing handler
  const handleCustomImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCustomImageSrc(e.target.result as string);
        setSelectedImageId('custom');
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset parameters to pristine
  const resetToDefault = () => {
    setParams(DEFAULT_PARAMETERS);
  };

  // Clean random parameter generation
  const handleRandomize = () => {
    const ditherModes = [
      DitherMode.NONE,
      DitherMode.THRESHOLD,
      DitherMode.BAYER_4X4,
      DitherMode.BAYER_8X8,
      DitherMode.FLOYD_STEINBERG,
      DitherMode.COLOR_HALFTONE,
      DitherMode.NOISE,
    ];
    const colorPresets = [
      ColorMapPreset.MONOCHROME,
      ColorMapPreset.VERCEL_DARK,
      ColorMapPreset.CYBERPUNK,
      ColorMapPreset.EMERALD_TECH,
      ColorMapPreset.AMBER_CRT,
      ColorMapPreset.SOLARIZED_SUNSET,
      ColorMapPreset.ACID_MATRIX,
      ColorMapPreset.TOKYO_NEON,
      ColorMapPreset.EIGHT_BIT_GAMEBOY,
    ];

    setParams({
      brightness: Math.round((Math.random() - 0.5) * 35),
      contrast: Math.round((Math.random() - 0.5) * 45),
      grayscale: Math.random() > 0.4,
      ditherMode: ditherModes[Math.floor(Math.random() * ditherModes.length)],
      ditherThreshold: Math.floor(Math.random() * 140) + 60,
      halftoneDotSize: Math.floor(Math.random() * 9) + 4,
      halftoneAngle: Math.floor(Math.random() * 90),
      sliceDensity: Math.floor(Math.random() * 32),
      sliceIntensity: Math.floor(Math.random() * 25),
      sliceSpeed: 0,
      rgbOffset: Math.floor(Math.random() * 18),
      rgbAngle: Math.floor(Math.random() * 360),
      pixelSortEnabled: Math.random() > 0.5,
      pixelSortThreshold: Math.floor(Math.random() * 45) + 20,
      pixelSortDirection: Math.random() > 0.5 ? 'horizontal' : 'vertical',
      pixelSortLength: Math.floor(Math.random() * 220) + 40,
      blockCorruptionEnabled: Math.random() > 0.4,
      blockCorruptionSize: [8, 16, 24, 32][Math.floor(Math.random() * 4)],
      blockCorruptionDensity: Math.floor(Math.random() * 35) + 5,
      blockCorruptionOffset: Math.floor(Math.random() * 25),
      databendIntensity: Math.floor(Math.random() * 30),
      databendLines: Math.floor(Math.random() * 12),
      scanlinesIntensity: Math.floor(Math.random() * 24),
      scanlinesSpacing: Math.floor(Math.random() * 3) + 2,
      crtGridEnabled: Math.random() > 0.75,
      vhsGrain: Math.floor(Math.random() * 25) + 5,
      colorPreset: colorPresets[Math.floor(Math.random() * colorPresets.length)],
      colorMix: Math.random() > 0.3 ? Math.floor(Math.random() * 60) + 40 : 0,
      glyphOverlayEnabled: Math.random() > 0.5,
      glyphOverlayGrid: Math.random() > 0.5,
      glyphText: params.glyphText,
    });
  };

  // Drag and drop loader helpers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCustomImageUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className="flex flex-col h-screen text-zinc-100 bg-[#060608] overflow-hidden font-sans select-none relative"
    >
      {/* Drag & Drop Visual overlay backdrop */}
      {dragActive && (
        <div className="absolute inset-0 bg-black/85 z-50 flex flex-col items-center justify-center border-4 border-dashed border-zinc-500 m-4 rounded-xl animate-pulse">
          <div className="p-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-100 mb-4">
            <Cpu className="w-12 h-12" />
          </div>
          <h2 className="text-xl font-mono uppercase tracking-wider font-semibold text-zinc-200">
            DETECTIN RAW SIGNAL CHANNEL
          </h2>
          <p className="text-sm font-mono text-zinc-500 mt-2">
            Release mouse button to input custom canvas image
          </p>
        </div>
      )}

      {/* Main Studio Header Header */}
      <header className="h-[52px] border-b border-[#1f1f23] flex items-center justify-between px-6 bg-[#09090b] z-40 shrink-0 select-none">
        {/* Logo and metadata label */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-zinc-200/20 blur-sm rounded-full"></div>
            <div className="relative w-7 h-7 bg-zinc-100 rounded-sm flex items-center justify-center text-zinc-950">
              <span className="font-mono text-xs font-black tracking-tighter">GL</span>
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-mono text-xs font-semibold tracking-wide text-zinc-100">
              GLITCH-DITHER STUDIO
            </span>
            <span className="text-[9px] font-mono text-zinc-400">
              STATE: READY // PORT 3000
            </span>
          </div>
        </div>

        {/* Studio canvas size settings with full vertical/portrait and custom input customization */}
        <div className="flex items-center gap-2 bg-[#131316] border border-[#1f1f23] rounded p-1 font-mono text-[10px]">
          <span className="hidden sm:inline px-1 text-zinc-500 text-[9px] uppercase tracking-wider font-bold">
            RESOLUTION:
          </span>
          <select
            value={`${dimensions.w}x${dimensions.h}`}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== 'custom') {
                const [w, h] = val.split('x').map(Number);
                setDimensions({ w, h });
              }
            }}
            className="bg-[#1c1c21] text-zinc-100 border border-[#27272c] outline-none py-1 px-2 rounded text-[10px] cursor-pointer"
          >
            <option value="512x512">512x512 (1:1 SQ)</option>
            <option value="1080x1080">1080x1080 (1:1 HD)</option>
            <option value="800x600">800x600 (4:3 Landscape)</option>
            <option value="600x800">600x800 (3:4 Portrait)</option>
            <option value="1080x1920">1080x1920 (9:16 Vertical)</option>
            <option value="1920x1080">1920x1080 (16:9 Landscape)</option>
            <option value="custom">Custom Sizing...</option>
          </select>

          <div className="flex items-center gap-1 border-l border-[#1f1f23] pl-2">
            <input
              type="number"
              value={dimensions.w}
              onChange={(e) => {
                const val = Math.max(16, Math.min(4096, parseInt(e.target.value) || 512));
                setDimensions((prev) => ({ ...prev, w: val }));
              }}
              className="w-12 bg-black/40 text-center py-0.5 border border-[#1f1f23] rounded text-[10px] text-zinc-200 focus:outline-none focus:border-zinc-500"
              placeholder="W"
              title="Width"
            />
            <span className="text-zinc-600">x</span>
            <input
              type="number"
              value={dimensions.h}
              onChange={(e) => {
                const val = Math.max(16, Math.min(4096, parseInt(e.target.value) || 512));
                setDimensions((prev) => ({ ...prev, h: val }));
              }}
              className="w-12 bg-black/40 text-center py-0.5 border border-[#1f1f23] rounded text-[10px] text-zinc-200 focus:outline-none focus:border-zinc-500"
              placeholder="H"
              title="Height"
            />
          </div>
        </div>

        {/* User profile tags mimicking premium layout */}
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm bg-[#111] border border-[#222] text-[#888] hover:text-[#bbb] transition-colors cursor-pointer" onClick={() => setShowInfoPanel(!showInfoPanel)}>
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{showInfoPanel ? 'HIDE INFO' : 'SHOW INFO'}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-zinc-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="hidden sm:inline">LIVE PREVIEW</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Side menu sidebar */}
        <Sidebar
          params={params}
          onParamsChange={(newParams) => setParams((prev) => ({ ...prev, ...newParams }))}
          selectedImageId={selectedImageId}
          onSelectImage={(id) => setSelectedImageId(id)}
          onCustomImageUpload={handleCustomImageUpload}
          resetToDefault={resetToDefault}
          onRandomize={handleRandomize}
        />

        {/* Center viewing Canvas */}
        <CanvasContainer
          originalCanvasRef={originalCanvasRef}
          targetCanvasRef={targetCanvasRef}
          canvasWidth={dimensions.w}
          canvasHeight={dimensions.h}
          params={params}
          isProcedural={selectedImageId === 'procedural_grid'}
          onRefresh={triggerRender}
        />

        {/* Extra Info Panel displaying the instructions block */}
        {showInfoPanel && (
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-[#1f1f23] bg-[#0c0c0e]/95 lg:bg-[#0c0c0e] p-5 font-mono overflow-y-auto hidden xl:block animate-fadeIn">
            <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-200 mb-4 pb-2 border-b border-[#1f1f23]">
              STUDIO GUIDE
            </h3>

            <div className="space-y-4 text-[11px] leading-relaxed text-zinc-400">
              <div>
                <span className="text-zinc-200 font-semibold block mb-1">
                  1. HIGH-CONTRAST BAYER DITHER
                </span>
                <p>
                  Dither decomposes grayscale gradients into high-contrast grid matrices (ordered or error-diffusion). Excellent for 8-bit DMG aesthetics.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-semibold block mb-1">
                  2. CHROMATIC ABERRATION
                </span>
                <p>
                  Simulates digital lens subpixel dispersion. Offset the Red and Blue levels to create stunning magenta-cyan outline overlaps.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-semibold block mb-1">
                  3. PIXEL SORTING
                </span>
                <p>
                  Threshold-based sorting lists. Sorts rows/columns of pixels directly by brightness levels, generating gorgeous cascading line decay.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-semibold block mb-1">
                  4. CORRUPTED TILES
                </span>
                <p>
                  Splices structural squares, shuffles block bytes, or fills cells with digital monochrome static representing extreme databending.
                </p>
              </div>

              <div>
                <span className="text-zinc-200 font-semibold block mb-1">
                  5. GRAPHIC WATERMARKS
                </span>
                <p>
                  Layer monospaced tech grids, crosshairs, and watermark labels onto the final canvas. Highly compatible with Vercel and Apple visuals.
                </p>
              </div>

              <div className="pt-2 border-t border-[#1f1f23] text-[9px] text-zinc-500">
                <span>PRESS ESC TO HIDE PANEL</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
