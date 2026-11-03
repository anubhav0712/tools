import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Scissors,
  Printer,
  ZoomIn,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import type { ToolComponentProps } from '../../core/types';
import type {
  PassportPhotoGridInput,
  PassportPhotoGridOutput,
  PassportGridPresetKey,
} from './definition';
import { PASSPORT_GRID_PRESETS, calculateGridLayout } from './engine';

export const PassportPhotoGridUI: React.FC<
  ToolComponentProps<PassportPhotoGridInput, PassportPhotoGridOutput>
> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState<PassportGridPresetKey>('us_passport');
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [includeCuttingLines, setIncludeCuttingLines] = useState<boolean>(true);

  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePreset = PASSPORT_GRID_PRESETS[preset];

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
        setZoom(1);
        setPanX(0);
        setPanY(0);
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

  const renderSheet = useCallback(async () => {
    if (!loadedImage || !canvasRef.current) return;

    const layout = calculateGridLayout(preset, 300);
    const canvas = canvasRef.current;
    canvas.width = layout.sheetWidth;
    canvas.height = layout.sheetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Solid white photo sheet
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scaleW = layout.cellWidth / loadedImage.width;
    const scaleH = layout.cellHeight / loadedImage.height;
    const baseScale = Math.max(scaleW, scaleH);
    const scale = baseScale * zoom;

    const drawW = loadedImage.width * scale;
    const drawH = loadedImage.height * scale;

    for (const cell of layout.cells) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(cell.x, cell.y, cell.width, cell.height);
      ctx.clip();

      const cellCenterX = cell.x + cell.width / 2 + panX;
      const cellCenterY = cell.y + cell.height / 2 + panY;

      ctx.drawImage(
        loadedImage,
        cellCenterX - drawW / 2,
        cellCenterY - drawH / 2,
        drawW,
        drawH
      );

      ctx.restore();

      // Subtle cutting hairline around cell
      if (includeCuttingLines) {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        setProcessedBlob(blob);
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
      }
    }, 'image/jpeg', 0.98);
  }, [loadedImage, preset, zoom, panX, panY, includeCuttingLines, downloadUrl]);

  useEffect(() => {
    renderSheet();
  }, [renderSheet]);

  const handleDownload = () => {
    if (!downloadUrl || !selectedFile) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `passport_photos_4x6_${preset}_300dpi.jpg`;
    a.click();
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setSelectedFile(null);
    setLoadedImage(null);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setDownloadUrl('');
    setProcessedBlob(null);
  };

  return (
    <ToolShell tool={tool} onReset={handleReset}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-800 to-sky-700 text-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Printer className="w-5 h-5 text-sky-200" />
                <h2 className="text-lg font-bold">Printable 4×6" Passport Photo Sheet Generator</h2>
              </div>
              <p className="text-xs text-sky-100 max-w-xl">
                Tile compliant passport and visa photos onto a standard 4×6 inch sheet at exact 300 DPI.
                Print at CVS, Walgreens, or home for ~$0.30 instead of paying $25 at a photo studio.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                🖨️ Exact 300 DPI Output
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                ✂️ Hairline Cutting Guides
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                🔒 100% In-Browser Privacy
              </span>
            </div>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Preview Canvas */}
          <div className="lg:col-span-2 space-y-4">
            {!loadedImage ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-xl p-12 text-center cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  Upload Passport Portrait Photo
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Front-facing, eye-level photo with clean white background
                </p>
                <Button size="sm" variant="secondary">
                  Choose Portrait Photo
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
                    className="block w-full h-auto max-h-[500px] object-contain mx-auto"
                  />
                  <div className="absolute bottom-2 left-3 bg-black/75 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5">
                    <Scissors className="w-3 h-3 text-sky-300" /> Standard 4×6" Print Sheet (1800 × 1200 px @ 300 DPI)
                  </div>
                </div>

                {/* Framing & Zoom Toolbar */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <ZoomIn className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700">Head Zoom:</span>
                    <input
                      type="range"
                      min="0.6"
                      max="2.5"
                      step="0.02"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600 w-10 text-right">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Pan:</span>
                    <button
                      type="button"
                      onClick={() => setPanY((prev) => prev - 10)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 font-bold"
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanY((prev) => prev + 10)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 font-bold"
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanX((prev) => prev - 10)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 font-bold"
                      title="Move left"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanX((prev) => prev + 10)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-100 font-bold"
                      title="Move right"
                    >
                      ▶
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Portrait
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

            {/* Printing Guide Card */}
            <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs text-sky-950 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sky-900">
                <Printer className="w-4 h-4 text-sky-600 flex-shrink-0" />
                How to Print for ~$0.30 at CVS, Walgreens, or Home:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-sky-900/90 pl-1 leading-relaxed">
                <li>
                  <strong>Download Sheet:</strong> Export the generated 300 DPI JPEG image.
                </li>
                <li>
                  <strong>Order 4×6" Print:</strong> Upload to CVS/Walgreens/Boots or insert USB at kiosk as a standard <strong>4×6 inch photo print</strong> (NOT "passport photo service").
                </li>
                <li>
                  <strong>Crucial Print Setting:</strong> Ensure print size is set to <strong>100% / Actual Size</strong>. <em>Do NOT select "Fit to Page" or "Auto-Crop"</em>.
                </li>
                <li>
                  <strong>Cut Out:</strong> Use scissors or paper trimmer along the subtle hairline borders.
                </li>
              </ol>
            </div>
          </div>

          {/* Right Col: Preset Options & Export */}
          <div className="space-y-4">
            {/* Country Preset Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Select Country & Dimension
              </h3>

              <div className="space-y-2">
                {Object.values(PASSPORT_GRID_PRESETS).map((p) => (
                  <label
                    key={p.id}
                    onClick={() => setPreset(p.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      preset === p.id
                        ? 'bg-sky-50 border-sky-400 ring-1 ring-sky-400'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="passportPreset"
                      checked={preset === p.id}
                      onChange={() => setPreset(p.id)}
                      className="mt-1 accent-sky-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Print Settings Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Grid Customization
              </h3>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCuttingLines}
                  onChange={(e) => setIncludeCuttingLines(e.target.checked)}
                  className="rounded accent-sky-600"
                />
                <span>Include subtle cutting lines between photos</span>
              </label>

              <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Sheet Resolution:</span>
                  <span className="font-mono font-semibold">1800 × 1200 px</span>
                </div>
                <div className="flex justify-between">
                  <span>Physical Print DPI:</span>
                  <span className="font-semibold text-emerald-700">300 DPI (Archival)</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Photos:</span>
                  <span className="font-semibold">{activePreset.photoCount} photos</span>
                </div>
              </div>
            </div>

            {/* Action Download Button */}
            <Button
              className="w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
              disabled={!processedBlob || !loadedImage}
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download 300 DPI Print Sheet
            </Button>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
