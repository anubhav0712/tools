import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Trash2,
  Undo2,
  ShieldCheck,
  EyeOff,
  Layers,
  Square,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import type { ToolComponentProps } from '../../core/types';
import type {
  PhotoRedactorInput,
  PhotoRedactorOutput,
  RedactionRegion,
  RedactionType,
} from './definition';
import { applyRedactionsToImageData } from './engine';

export const PhotoRedactorUI: React.FC<
  ToolComponentProps<PhotoRedactorInput, PhotoRedactorOutput>
> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [redactionType, setRedactionType] = useState<RedactionType>('pixelate');
  const [intensity, setIntensity] = useState<number>(16);
  const [regions, setRegions] = useState<RedactionRegion[]>([]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadSelectedFile(file);
  };

  const loadSelectedFile = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImage(img);
        setRegions([]);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Re-render Canvas with Base Image + Redactions
  const renderCanvas = useCallback(async () => {
    if (!loadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = loadedImage.width;
    canvas.height = loadedImage.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw pristine image
    ctx.drawImage(loadedImage, 0, 0);

    // Apply all redactions to image data
    if (regions.length > 0) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyRedactionsToImageData(imgData, regions);
      ctx.putImageData(imgData, 0, 0);
    }

    // Export local blob
    canvas.toBlob((blob) => {
      if (blob) {
        setProcessedBlob(blob);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    }, 'image/png');
  }, [loadedImage, regions, downloadUrl]);

  useEffect(() => {
    renderCanvas();
  }, [loadedImage, regions]);

  // Convert mouse client coordinates to canvas pixel space
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setIsDrawing(true);
    setStartPos(coords);
    setCurrentPos(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setCurrentPos(coords);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Discard tiny accidental clicks
    if (width > 8 && height > 8) {
      const newRegion: RedactionRegion = {
        id: Math.random().toString(36).substring(2, 9),
        type: redactionType,
        x,
        y,
        width,
        height,
        intensity,
      };
      setRegions((prev) => [...prev, newRegion]);
    }
  };

  const handleUndo = () => {
    setRegions((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setRegions([]);
  };

  const handleDeleteRegion = (id: string) => {
    setRegions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDownload = () => {
    if (!downloadUrl || !selectedFile) return;
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${baseName}_redacted.png`;
    a.click();
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setSelectedFile(null);
    setLoadedImage(null);
    setRegions([]);
    setDownloadUrl('');
    setProcessedBlob(null);
  };

  return (
    <ToolShell tool={tool} onReset={handleReset}>
      <div className="space-y-6">
        {/* Privacy Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <h2 className="text-lg font-bold">100% In-Browser Privacy Sandbox</h2>
              </div>
              <p className="text-xs text-emerald-100 max-w-xl">
                Redact sensitive Aadhaar, SSN, credit cards, bank statements, faces, and street license
                plates. Pixels are irreversibly overwritten in local memory; zero bytes leave your computer.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                🔒 Zero Server Uploads
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                🧹 Auto EXIF/GPS Scrubbing
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                ⚡ Irreversible Pixel Destruction
              </span>
            </div>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Canvas Area */}
          <div className="lg:col-span-2 space-y-4">
            {!loadedImage ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50/70 hover:bg-slate-50 rounded-xl p-12 text-center cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  Upload Image, ID Card, or Screenshot
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Supports JPG, PNG, WEBP, or HEIC (from camera rolls or files)
                </p>
                <Button size="sm" variant="secondary">
                  Choose Photo to Redact
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700 select-none">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    className="block w-full h-auto max-h-[500px] object-contain cursor-crosshair mx-auto"
                  />
                  {/* Active selection box overlay */}
                  {isDrawing && canvasRef.current && (
                    <div
                      className="absolute border-2 border-dashed border-red-500 bg-red-500/20 pointer-events-none"
                      style={{
                        left: `${(Math.min(startPos.x, currentPos.x) / canvasRef.current.width) * 100}%`,
                        top: `${(Math.min(startPos.y, currentPos.y) / canvasRef.current.height) * 100}%`,
                        width: `${(Math.abs(currentPos.x - startPos.x) / canvasRef.current.width) * 100}%`,
                        height: `${(Math.abs(currentPos.y - startPos.y) / canvasRef.current.height) * 100}%`,
                      }}
                    />
                  )}
                  <div className="absolute bottom-2 left-3 bg-black/75 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5">
                    <Square className="w-3 h-3" /> Click & drag over text or faces to censor
                  </div>
                </div>

                {/* Toolbar Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={regions.length === 0}
                      onClick={handleUndo}
                      className="flex items-center gap-1"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Undo
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={regions.length === 0}
                      onClick={handleClearAll}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </Button>
                  </div>

                  <div className="text-slate-500 font-medium">
                    {regions.length} {regions.length === 1 ? 'redaction' : 'redactions'} applied
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Redaction Options & History */}
          <div className="space-y-4">
            {/* Redaction Mode Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-slate-600" /> Redaction Style
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRedactionType('pixelate')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    redactionType === 'pixelate'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-bold text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="text-xs">🔲 Pixelate</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Scrambled blocks</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRedactionType('blur')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    redactionType === 'blur'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-bold text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="text-xs">💧 Blur</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Heavy Gaussian</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRedactionType('blackout')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    redactionType === 'blackout'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 font-bold text-emerald-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="text-xs">⬛ Blackout</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Solid opaque</div>
                </button>
              </div>

              {/* Intensity Slider */}
              {redactionType !== 'blackout' && (
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {redactionType === 'pixelate' ? 'Block Size' : 'Blur Radius'}:
                    </span>
                    <span className="font-mono text-slate-600">{intensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="36"
                    step="2"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Redactions List Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 max-h-[260px] overflow-y-auto">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Redaction Layers
                </span>
                <span className="text-[11px] font-normal text-slate-400">
                  {regions.length} total
                </span>
              </h3>

              {regions.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs italic">
                  No redactions drawn yet. Click and drag over the image to censor.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {regions.map((r, index) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 font-bold text-[10px] flex items-center justify-center text-slate-700">
                          {index + 1}
                        </span>
                        <span className="font-medium capitalize text-slate-800">
                          {r.type}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {Math.round(r.width)}×{Math.round(r.height)}px
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRegion(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove this redaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Download Button */}
            <Button
              className="w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
              disabled={!processedBlob || !loadedImage}
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download Redacted Photo
            </Button>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
