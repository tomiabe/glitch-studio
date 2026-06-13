/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Info,
  Sliders,
  Sparkles,
  MousePointer,
  Check,
} from 'lucide-react';
import { GlitchParameters } from '../types';

interface CanvasContainerProps {
  originalCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  targetCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  params: GlitchParameters;
  isProcedural: boolean;
  onRefresh: () => void;
}

export default function CanvasContainer({
  originalCanvasRef,
  targetCanvasRef,
  canvasWidth,
  canvasHeight,
  params,
  isProcedural,
  onRefresh,
}: CanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [splitOffset, setSplitOffset] = useState<number>(50); // 0 to 100% split
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'webp'>('png');
  const [copied, setCopied] = useState<boolean>(false);

  // Drag split slider handle helper
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (clientX / rect.width) * 100));
      setSplitOffset(percentage);
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Track cursor position inside canvas for real-time mesh feedback
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvasWidth);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvasHeight);
    setMousePos({ x, y });
  };

  // Export Canvas Download handler
  const handleDownload = () => {
    const canvas = targetCanvasRef.current;
    if (!canvas) return;

    const mime = exportFormat === 'png' ? 'image/png' : 'image/webp';
    const ext = exportFormat === 'png' ? 'png' : 'webp';
    const link = document.createElement('a');

    link.download = `aesthetic-glitch-${Date.now()}.${ext}`;
    link.href = canvas.toDataURL(mime, 0.95);
    link.click();
  };

  // Copy Image to Clipboard using modern format
  const handleClipboardCopy = async () => {
    const canvas = targetCanvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png');
    } catch (err) {
      console.error("Unable to copy to clipboard in sandbox iframe:", err);
    }
  };

  // Statistics estimates
  const bitsPerPixel = params.ditherMode === 'none' ? 24 : 1;
  const rawBytes = Math.round((canvasWidth * canvasHeight * bitsPerPixel) / 8);
  const kbSize = (rawBytes / 1024).toFixed(1);

  return (
    <main className="flex-1 bg-[#09090b] flex flex-col h-full overflow-hidden select-none">
      {/* Top action toolbar */}
      <div className="h-14 border-b border-[#1f1f23] flex items-center justify-between px-6 bg-[#0c0c0e]">
        {/* Dimensions info */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-wider text-zinc-400">
            VIEWPORT: <span className="text-zinc-100 font-semibold">{canvasWidth}x{canvasHeight}</span>
          </span>
          <span className="text-[#3c3c43] text-sm">|</span>
          <span className="font-mono text-[10px] text-zinc-500 hidden sm:inline">
            PAYLOAD: <span className="text-zinc-400">{kbSize} KB</span>
          </span>
        </div>

        {/* Toolbar view & action buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom Actions */}
          <div className="flex items-center bg-[#131316] border border-[#1f1f23] rounded p-0.5">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1 hover:bg-[#1f1f26] rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[10px] text-zinc-300 w-12 text-center select-none font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(Math.min(8, zoom + 0.25))}
              className="p-1 hover:bg-[#1f1f26] rounded text-zinc-400 hover:text-zinc-100 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[#3c3c43] text-sm hidden sm:inline">|</span>

          {/* Copy Action */}
          <button
            onClick={handleClipboardCopy}
            className={`px-3 py-1.5 rounded border text-[11px] font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              copied
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-[#131316] border-[#1f1f23] text-zinc-400 hover:border-zinc-400 hover:text-zinc-200'
            }`}
            title="Saves PNG artifact directly to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          {/* Export Settings */}
          <div className="flex items-center bg-[#131316] border border-[#1f1f23] rounded p-0.5 font-mono text-[10px]">
            <button
              onClick={() => setExportFormat('png')}
              className={`px-2 py-1 rounded cursor-pointer ${
                exportFormat === 'png'
                  ? 'bg-[#1e1e24] text-zinc-100 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              PNG
            </button>
            <button
              onClick={() => setExportFormat('webp')}
              className={`px-2 py-1 rounded cursor-pointer ${
                exportFormat === 'webp'
                  ? 'bg-[#1e1e24] text-zinc-100 font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              WEBP
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded bg-zinc-100 font-mono text-[11px] text-zinc-950 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      {/* Main interactive viewport workspace */}
      <div className="flex-1 w-full bg-[#060608] relative overflow-hidden flex items-center justify-center p-8">
        {/* Floating instruction banner */}
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-md border border-[#1f1f23] bg-[#0c0c0f]/80 backdrop-blur text-[10px] font-mono text-zinc-400 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
          <span>DRAG THE SPLIT SLIDER HORIZONTALLY TO COMPARE ORIGINAL</span>
        </div>

        {/* Checkerboard container representing transparency */}
        <div
          ref={containerRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative transition-all duration-100 ease-out shadow-[0_24px_64px_rgba(0,0,0,0.85)] rounded overflow-hidden select-none select-none max-w-full"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            imageRendering: zoom > 1.2 ? 'pixelated' : 'auto',
          }}
        >
          {/* Background transparency card grid pattern */}
          <div className="absolute inset-0 pattern-grid opacity-10 z-0"></div>

          {/* Canvas 1: Raw Original */}
          <canvas
            ref={originalCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
          />

          {/* Canvas 2: Processed (Glitched) */}
          <canvas
            ref={targetCanvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20"
            style={{
              clipPath: `polygon(${splitOffset}% 0, 100% 0, 100% 100%, ${splitOffset}% 100%)`,
            }}
          />

          {/* Draggable vertical division boundary line */}
          <div
            className="absolute top-0 bottom-0 w-1.5 h-full opacity-65 hover:opacity-100 cursor-ew-resize group select-none z-30 flex items-center justify-center transition-opacity"
            style={{ left: `calc(${splitOffset}% - 3px)` }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingSplit(true);
            }}
          >
            {/* The line */}
            <div className="w-[1.5px] h-full bg-zinc-200 shadow-[0_0_8px_rgba(255,255,255,0.7)]"></div>
            {/* Draggable handle badge circle */}
            <div className="absolute w-5 h-5 rounded-full border border-zinc-200 bg-zinc-950/95 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.5)] transform scale-100 hover:scale-110 active:scale-90 transition-transform">
              <div className="flex gap-0.5">
                <div className="w-[1.5px] h-2 bg-zinc-400 rounded-full"></div>
                <div className="w-[1.5px] h-2 bg-zinc-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coordinate and system stats footer */}
      <div className="h-10 border-t border-[#1f1f23] flex items-center justify-between px-6 bg-[#0c0c0e] text-[10px] font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <MousePointer className="w-3.5 h-3.5 text-zinc-500" />
            <span>
              POS:{' '}
              {isHovered ? (
                <span className="text-zinc-300">
                  {mousePos.x}, {mousePos.y}
                </span>
              ) : (
                <span>---</span>
              )}
            </span>
          </div>
          <span>/</span>
          <span>
            SAMPLE_VAL:{' '}
            {isHovered ? (
              <span className="text-zinc-400">
                LUMA:{Math.round(255 * (1 - (mousePos.y / canvasHeight)))}
              </span>
            ) : (
              <span>NULL</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>FRAME_LIMIT: 60FPS</span>
          <span className="text-[#3c3c43]">|</span>
          <span className="text-zinc-400">RENDER_STABLE</span>
        </div>
      </div>
    </main>
  );
}
