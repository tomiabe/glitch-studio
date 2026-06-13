/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Sliders,
  Sparkles,
  Binary,
  Layers,
  Palette,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Cpu,
  CornerDownRight,
  RefreshCw,
} from 'lucide-react';
import {
  DitherMode,
  ColorMapPreset,
  GlitchParameters,
  StarterImage,
  Preset,
} from '../types';
import { COLOR_PALETTES, PRESETS, STARTER_IMAGES } from '../data/presets';

interface SidebarProps {
  params: GlitchParameters;
  onParamsChange: (newParams: Partial<GlitchParameters>) => void;
  selectedImageId: string;
  onSelectImage: (id: string) => void;
  onCustomImageUpload: (file: File) => void;
  resetToDefault: () => void;
  onRandomize: () => void;
}

export default function Sidebar({
  params,
  onParamsChange,
  selectedImageId,
  onSelectImage,
  onCustomImageUpload,
  resetToDefault,
  onRandomize,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<'tune' | 'dither' | 'glitch' | 'color'>('tune');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onCustomImageUpload(e.target.files[0]);
    }
  };

  const currentPresetColors = COLOR_PALETTES[params.colorPreset]?.colors || [];

  return (
    <aside className="w-full lg:w-96 shrink-0 bg-[#09090b] border-r border-[#1f1f23] text-zinc-100 flex flex-col h-full overflow-hidden select-none">
      {/* Title Header */}
      <div className="p-5 border-b border-[#1f1f23] flex items-center justify-between">
        <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-zinc-400">
          SYSTEM PARAMETERS
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRandomize}
            title="Randomize Parameters"
            className="p-1.5 hover:bg-[#1a1a1e] rounded border border-[#27272a] text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetToDefault}
            title="Reset to Baseline Preset"
            className="p-1.5 hover:bg-[#1a1a1e] rounded border border-[#27272a] text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Pick List */}
      <div className="p-4 border-b border-[#1f1f23] bg-[#0c0c0e]">
        <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-1.5">
          Master Presets
        </label>
        <select
          onChange={(e) => {
            const selectedPreset = PRESETS.find((p) => p.id === e.target.value);
            if (selectedPreset) {
              onParamsChange(selectedPreset.params);
            }
          }}
          className="w-full p-2 bg-[#131316] border border-[#1f1f23] rounded text-zinc-300 font-mono focus:outline-none focus:border-zinc-400 text-xs cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Select Preset Config...</option>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Image Inputs */}
      <div className="p-4 border-b border-[#1f1f23] bg-[#09090b]">
        <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-2">
          Source Material
        </label>
        
        <div className="mb-2.5 p-2 rounded bg-[#0c0c0e] border border-[#1f1f23] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-300 truncate max-w-[180px]">
              {selectedImageId === 'custom' ? 'Custom Uploaded Image' : 'Default Studio Template'}
            </span>
          </div>
          {selectedImageId === 'custom' && (
            <button
              onClick={() => onSelectImage('cyberpunk_portrait')}
              className="text-[9px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              RESET
            </button>
          )}
        </div>

        {/* Upload Trigger */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 rounded bg-[#131316] border border-[#1f1f23] hover:border-[#27272e] flex items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-zinc-100 font-mono cursor-pointer transition-all active:scale-[0.98]"
        >
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span>UPLOAD IMAGE</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Tabs Menu Controls */}
      <div className="grid grid-cols-4 bg-[#0c0c0e] border-b border-[#1f1f23] text-zinc-400 font-mono text-[10px] text-center shrink-0">
        <button
          onClick={() => setActiveTab('tune')}
          className={`py-3 flex flex-col items-center gap-1 transition-all border-b cursor-pointer ${
            activeTab === 'tune'
              ? 'border-zinc-100 text-zinc-100 bg-[#09090b]'
              : 'border-transparent hover:text-zinc-200 hover:bg-[#131316]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>TUNE</span>
        </button>
        <button
          onClick={() => setActiveTab('dither')}
          className={`py-3 flex flex-col items-center gap-1 transition-all border-b cursor-pointer ${
            activeTab === 'dither'
              ? 'border-zinc-100 text-zinc-100 bg-[#09090b]'
              : 'border-transparent hover:text-zinc-200 hover:bg-[#131316]'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>DITHER</span>
        </button>
        <button
          onClick={() => setActiveTab('glitch')}
          className={`py-3 flex flex-col items-center gap-1 transition-all border-b cursor-pointer ${
            activeTab === 'glitch'
              ? 'border-zinc-100 text-zinc-100 bg-[#09090b]'
              : 'border-transparent hover:text-zinc-200 hover:bg-[#131316]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>GLITCH</span>
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`py-3 flex flex-col items-center gap-1 transition-all border-b cursor-pointer ${
            activeTab === 'color'
              ? 'border-zinc-100 text-zinc-100 bg-[#09090b]'
              : 'border-transparent hover:text-zinc-200 hover:bg-[#131316]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>POST</span>
        </button>
      </div>

      {/* Tab Sections containing the inputs */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-[#09090b] text-xs">
        {activeTab === 'tune' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-zinc-300">
                <span>BRIGHTNESS</span>
                <span className="font-semibold text-zinc-400">{params.brightness}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.brightness}
                onChange={(e) => onParamsChange({ brightness: parseInt(e.target.value) })}
                className="w-full dark-slider"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-zinc-300">
                <span>CONTRAST</span>
                <span className="font-semibold text-zinc-400">{params.contrast}%</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={params.contrast}
                onChange={(e) => onParamsChange({ contrast: parseInt(e.target.value) })}
                className="w-full dark-slider"
              />
            </div>

            <div className="pt-2 border-t border-[#1a1a1e] flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] text-zinc-300 uppercase tracking-wide">
                  Grayscale Force
                </span>
                <span className="text-[10px] text-zinc-500">
                  Convert original pixels to luminance value first
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={params.grayscale}
                  onChange={(e) => onParamsChange({ grayscale: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#1b1b1f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-200 peer-checked:after:bg-[#09090b]"></div>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'dither' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-1.5">
                Dither Strategy
              </label>
              <select
                value={params.ditherMode}
                onChange={(e) => onParamsChange({ ditherMode: e.target.value as DitherMode })}
                className="w-full p-2 bg-[#131316] border border-[#1f1f23] rounded text-zinc-300 font-mono focus:outline-none focus:border-zinc-400"
              >
                <option value={DitherMode.NONE}>None (Full-Color Pass)</option>
                <option value={DitherMode.THRESHOLD}>1-Bit Static Threshold</option>
                <option value={DitherMode.BAYER_4X4}>Ordered Dither (Bayer 4x4)</option>
                <option value={DitherMode.BAYER_8X8}>Ordered Dither (Bayer 8x8)</option>
                <option value={DitherMode.FLOYD_STEINBERG}>Floyd-Steinberg Error Diffusion</option>
                <option value={DitherMode.COLOR_HALFTONE}>Traditional Halftone Dotted Screen</option>
                <option value={DitherMode.NOISE}>Additive Noise Threshold</option>
              </select>
            </div>

            {params.ditherMode !== DitherMode.NONE &&
              params.ditherMode !== DitherMode.COLOR_HALFTONE && (
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-zinc-300">
                    <span>THRESHOLD LEVEL</span>
                    <span className="font-semibold text-zinc-400">{params.ditherThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="254"
                    value={params.ditherThreshold}
                    onChange={(e) => onParamsChange({ ditherThreshold: parseInt(e.target.value) })}
                    className="w-full dark-slider"
                  />
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Defines the cut-off luminance split (baseline 128).
                  </div>
                </div>
              )}

            {params.ditherMode === DitherMode.COLOR_HALFTONE && (
              <div className="space-y-4 p-3 bg-[#0c0c0e] rounded border border-[#1f1f23]">
                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-zinc-300 font-semibold">
                    <span>DOT PITCH SIZE</span>
                    <span className="text-zinc-400">{params.halftoneDotSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="24"
                    value={params.halftoneDotSize}
                    onChange={(e) => onParamsChange({ halftoneDotSize: parseInt(e.target.value) })}
                    className="w-full dark-slider"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-zinc-300 font-semibold">
                    <span>TILT ANGLE</span>
                    <span className="text-zinc-400">{params.halftoneAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={params.halftoneAngle}
                    onChange={(e) => onParamsChange({ halftoneAngle: parseInt(e.target.value) })}
                    className="w-full dark-slider"
                  />
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Rotates the dot orientation of the press screen grid.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'glitch' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Chromatic Aberration */}
            <div className="space-y-3 p-3 bg-[#0c0c0e] rounded border border-[#1f1f23]">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                Chromatic Aberration (RGB Shift)
              </span>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-zinc-300">
                  <span>DISPERSION WIDTH</span>
                  <span>{params.rgbOffset}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={params.rgbOffset}
                  onChange={(e) => onParamsChange({ rgbOffset: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-zinc-300">
                  <span>DISPERSION ANGLE</span>
                  <span>{params.rgbAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={params.rgbAngle}
                  onChange={(e) => onParamsChange({ rgbAngle: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>
            </div>

            {/* Horizontal Slices */}
            <div className="space-y-3 p-3 bg-[#0c0c0e] rounded border border-[#1f1f23]">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                Slicing & Signal Shunting
              </span>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-zinc-300">
                  <span>SLICE FREQUENCY</span>
                  <span>{params.sliceDensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.sliceDensity}
                  onChange={(e) => onParamsChange({ sliceDensity: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-zinc-300">
                  <span>OFFSET STRENGTH</span>
                  <span>{params.sliceIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.sliceIntensity}
                  onChange={(e) => onParamsChange({ sliceIntensity: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>
            </div>

            {/* Pixel Sorting */}
            <div className="p-3 bg-[#0c0c0e] rounded border border-[#1f1f23] space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                  Pixel Sorting
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.pixelSortEnabled}
                    onChange={(e) => onParamsChange({ pixelSortEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#1b1b1f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-none after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-200 peer-checked:after:bg-[#09090b]"></div>
                </label>
              </div>

              {params.pixelSortEnabled && (
                <div className="space-y-3 pt-2 border-t border-[#1a1a1e] text-[11px] animate-fadeIn">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>SORT THRESHOLD</span>
                      <span>{params.pixelSortThreshold}% luma</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={params.pixelSortThreshold}
                      onChange={(e) =>
                        onParamsChange({ pixelSortThreshold: parseInt(e.target.value) })
                      }
                      className="w-full dark-slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>SPAN MAX LENGTH</span>
                      <span>{params.pixelSortLength}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="400"
                      value={params.pixelSortLength}
                      onChange={(e) =>
                        onParamsChange({ pixelSortLength: parseInt(e.target.value) })
                      }
                      className="w-full dark-slider"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-mono tracking-wider text-zinc-500 mb-1">
                      Sort Axis
                    </label>
                    <div className="grid grid-cols-2 gap-1 font-mono text-[10px]">
                      <button
                        onClick={() => onParamsChange({ pixelSortDirection: 'horizontal' })}
                        className={`py-1 rounded border cursor-pointer ${
                          params.pixelSortDirection === 'horizontal'
                            ? 'border-zinc-300 text-zinc-100 bg-[#161619]'
                            : 'border-[#1f1f23] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Horizontal
                      </button>
                      <button
                        onClick={() => onParamsChange({ pixelSortDirection: 'vertical' })}
                        className={`py-1 rounded border cursor-pointer ${
                          params.pixelSortDirection === 'vertical'
                            ? 'border-zinc-300 text-zinc-100 bg-[#161619]'
                            : 'border-[#1f1f23] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Vertical
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Block Corruption */}
            <div className="p-3 bg-[#0c0c0e] rounded border border-[#1f1f23] space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                  Corrupted Block Tiling
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.blockCorruptionEnabled}
                    onChange={(e) => onParamsChange({ blockCorruptionEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#1b1b1f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-none after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-200 peer-checked:after:bg-[#09090b]"></div>
                </label>
              </div>

              {params.blockCorruptionEnabled && (
                <div className="space-y-3 pt-2 border-t border-[#1a1a1e] animate-fadeIn">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span>TILE CELL SIZE</span>
                      <span>{params.blockCorruptionSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="64"
                      step="4"
                      value={params.blockCorruptionSize}
                      onChange={(e) =>
                        onParamsChange({ blockCorruptionSize: parseInt(e.target.value) })
                      }
                      className="w-full dark-slider"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span>CORRUPTION FREQUENCY</span>
                      <span>{params.blockCorruptionDensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={params.blockCorruptionDensity}
                      onChange={(e) =>
                        onParamsChange({ blockCorruptionDensity: parseInt(e.target.value) })
                      }
                      className="w-full dark-slider"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Databending Lines */}
            <div className="p-3 bg-[#0c0c0e] rounded border border-[#1f1f23] space-y-3">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                Databend Jitter
              </span>
              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>DISPLACEMENT FORCE</span>
                  <span>{params.databendIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.databendIntensity}
                  onChange={(e) => onParamsChange({ databendIntensity: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>CORRUPT LINE COUNT</span>
                  <span>{params.databendLines} lines</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={params.databendLines}
                  onChange={(e) => onParamsChange({ databendLines: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'color' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Color LUT / Preset Grid */}
            <div className="space-y-3 p-3 bg-[#0c0c0e] rounded border border-[#1f1f23]">
              <span className="block text-[10px] font-mono text-zinc-500 tracking-wider">
                DUP/TRITONE COLOR GRADIENT MAP
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(COLOR_PALETTES).map(([key, palette]) => {
                  const isSel = params.colorPreset === key;
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        onParamsChange({
                          colorPreset: key as ColorMapPreset,
                          colorMix: params.colorMix === 0 ? 100 : params.colorMix,
                        })
                      }
                      className={`w-full text-left p-2 rounded border font-mono text-[10px] transition-all flex flex-col gap-1.5 cursor-pointer ${
                        isSel
                          ? 'bg-[#18181b] border-zinc-200 text-zinc-100'
                          : 'bg-[#111113] border-[#1c1c1f] hover:border-[#2e2e34]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{palette.name}</span>
                        {isSel && (
                          <span className="text-[8px] bg-zinc-200 text-zinc-950 px-1 py-0.2 rounded font-mono scale-90">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {palette.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 rounded-full border border-black/30"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <span className="text-zinc-500 text-[9px] ml-1 truncate">
                          {palette.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {params.colorPreset !== ColorMapPreset.MONOCHROME && (
                <div className="pt-2 border-t border-[#1a1a1e] space-y-1">
                  <div className="flex justify-between font-mono text-[10px] text-zinc-300">
                    <span>PALETTE INTENSITY MIX</span>
                    <span>{params.colorMix}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={params.colorMix}
                    onChange={(e) => onParamsChange({ colorMix: parseInt(e.target.value) })}
                    className="w-full dark-slider"
                  />
                </div>
              )}
            </div>

            {/* Analogue TV TV Overlay */}
            <div className="p-3 bg-[#0c0c0e] rounded border border-[#1f1f23] space-y-3">
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                Scanline & VHS Retro overlays
              </span>

              <div>
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>SCANLINES INTENSITY</span>
                  <span>{params.scanlinesIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.scanlinesIntensity}
                  onChange={(e) => onParamsChange({ scanlinesIntensity: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>

              {params.scanlinesIntensity > 0 && (
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span>SCANLINES HEIGHT</span>
                    <span>{params.scanlinesSpacing}px spacing</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={params.scanlinesSpacing}
                    onChange={(e) => onParamsChange({ scanlinesSpacing: parseInt(e.target.value) })}
                    className="w-full dark-slider"
                  />
                </div>
              )}

              <div className="pt-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] text-zinc-300">CRT Phosphor Triad Grid</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.crtGridEnabled}
                    onChange={(e) => onParamsChange({ crtGridEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#1b1b1f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-none after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-200 peer-checked:after:bg-[#09090b]"></div>
                </label>
              </div>

              <div className="pt-1 border-t border-[#1a1a1e]">
                <div className="flex justify-between text-[10px] font-mono mb-1">
                  <span>VHS FILM GRAIN</span>
                  <span>{params.vhsGrain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.vhsGrain}
                  onChange={(e) => onParamsChange({ vhsGrain: parseInt(e.target.value) })}
                  className="w-full dark-slider"
                />
              </div>
            </div>

            {/* Technical Watermark HUD Interface */}
            <div className="p-3 bg-[#0c0c0e] rounded border border-[#1f1f23] space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">
                  Technical HUD Watermark
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.glyphOverlayEnabled}
                    onChange={(e) => onParamsChange({ glyphOverlayEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#1b1b1f] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-none after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-zinc-200 peer-checked:after:bg-[#09090b]"></div>
                </label>
              </div>

              {params.glyphOverlayEnabled && (
                <div className="space-y-3 pt-2 border-t border-[#1a1a1e] text-[11px] animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span>Background Mesh Grid</span>
                    <input
                      type="checkbox"
                      checked={params.glyphOverlayGrid}
                      onChange={(e) => onParamsChange({ glyphOverlayGrid: e.target.checked })}
                      className="rounded border-[#2c2c32] bg-[#0c0c0e] text-zinc-100 focus:ring-0 cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-zinc-400 mb-1">Watermark Header:</span>
                    <input
                      type="text"
                      value={params.glyphText}
                      onChange={(e) => onParamsChange({ glyphText: e.target.value })}
                      className="w-full p-1.5 bg-[#131316] border border-[#1f1f23] rounded font-mono text-[10px] text-zinc-100 focus:outline-none focus:border-zinc-400"
                      placeholder="e.g. CRITICAL STATE"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preset Details Banner Footer */}
      <div className="p-3 bg-[#0c0c0e] border-t border-[#1f1f23] font-mono text-[9px] text-zinc-500 flex justify-between">
        <span>CRAFTED GLITCH LAB // V1.0</span>
        <span>STABLE STATE</span>
      </div>
    </aside>
  );
}
