import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  RotateCw,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ZoomIn,
  Move,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import type { ToolComponentProps } from '../../core/types';
import type {
  KaveriPhotoResizerInput,
  KaveriPhotoResizerOutput,
  KaveriPresetKey,
  KaveriFileFormat,
  KaveriFitMode,
} from './definition';
import {
  KAVERI_PRESETS,
  calculateImagePosition,
  optimizeCanvasBlob,
} from './engine';

export const KaveriPhotoResizerUI: React.FC<
  ToolComponentProps<KaveriPhotoResizerInput, KaveriPhotoResizerOutput>
> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [preset, setPreset] = useState<KaveriPresetKey>('b2');
  const [format, setFormat] = useState<KaveriFileFormat>('png');
  const [fitMode, setFitMode] = useState<KaveriFitMode>('fill');
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [calcSizeBytes, setCalcSizeBytes] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentPreset = KAVERI_PRESETS[preset];

  // Load File
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
        setRotation(0);
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

  // Render Preview Canvas & Generate Output Blob
  const renderCanvas = useCallback(async () => {
    if (!loadedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = currentPreset.width;
    canvas.height = currentPreset.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pure white background for SRO portal requirements
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const layout = calculateImagePosition(
      loadedImage.width,
      loadedImage.height,
      currentPreset.width,
      currentPreset.height,
      rotation,
      fitMode,
      zoom,
      panX,
      panY
    );

    ctx.translate(layout.centerX, layout.centerY);
    ctx.rotate((((rotation % 360) + 360) % 360 * Math.PI) / 180);

    const drawW = loadedImage.width * layout.scale;
    const drawH = loadedImage.height * layout.scale;

    ctx.drawImage(loadedImage, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Optimize Blob in Background
    setIsProcessing(true);
    try {
      const optimized = await optimizeCanvasBlob(canvas, format, currentPreset.maxBytes);
      setCalcSizeBytes(optimized.sizeBytes);
      setOutputBlob(optimized.blob);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(optimized.blob);
      setDownloadUrl(url);
    } catch (err) {
      console.warn('Canvas optimization error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [loadedImage, currentPreset, rotation, fitMode, zoom, panX, panY, format]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Mouse & Touch Pan Handling
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleRatio = canvasRef.current.width / rect.width;

    const dx = (e.clientX - dragStart.x) * scaleRatio;
    const dy = (e.clientY - dragStart.y) * scaleRatio;

    setPanX((prev) => prev + dx);
    setPanY((prev) => prev + dy);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    setZoom((prev) => Math.max(0.2, Math.min(5, prev * factor)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetAdjustments = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
    setFitMode('fill');
  };

  const handleDownload = () => {
    if (!outputBlob || !downloadUrl) return;
    const docPrefix =
      preset === 'b2'
        ? 'kaveri_marriage_joint_photo_2673x1890'
        : 'seva_sindhu_passport_photo_200x230';
    const namePrefix = selectedFile
      ? `${selectedFile.name.replace(/\.[^/.]+$/, '')}_${preset}`
      : docPrefix;
    const ext = outputBlob.type === 'image/png' ? '.png' : '.jpg';
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${namePrefix}${ext}`;
    a.click();
  };

  const handleFullReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setSelectedFile(null);
    setLoadedImage(null);
    setOutputBlob(null);
    setDownloadUrl('');
    setCalcSizeBytes(0);
    handleResetAdjustments();
  };

  const sizeKB = (calcSizeBytes / 1024).toFixed(1);
  const sizeMB = (calcSizeBytes / (1024 * 1024)).toFixed(2);
  const isWithinSize = calcSizeBytes > 0 && calcSizeBytes <= currentPreset.maxBytes;

  return (
    <ToolShell
      tool={tool}
      onReset={handleFullReset}
    >
      <div className="space-y-6">
        {/* SRO Badge Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-blue-200" />
                <h2 className="text-lg font-bold">Karnataka Kaveri 2.0 & SRO Verified</h2>
              </div>
              <p className="text-xs text-blue-100 max-w-xl">
                Pre-calibrated for Karnataka Kaveri Online Services marriage certificate joint couple photos
                and Sub-Registrar Office uploads with 100% in-browser processing.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                📐 2673 × 1890 px (B2)
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                📦 &lt; 2.0 MB Strict Limit
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full font-semibold border border-white/30">
                🔒 100% In-Browser Privacy
              </span>
            </div>
          </div>
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Canvas & Controls */}
          <div className="lg:col-span-2 space-y-4">
            {!loadedImage ? (
              /* Dropzone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-xl p-12 text-center cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  Upload Couple Photo for Kaveri Registration
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Drag and drop JPG, PNG, or WEBP from your phone or camera
                </p>
                <Button size="sm" variant="secondary">
                  Choose Photo File
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
              /* Interactive Canvas Area */
              <div className="space-y-3">
                <div className="relative bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700 select-none">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    className="block w-full h-auto max-h-[500px] object-contain cursor-grab active:cursor-grabbing mx-auto"
                  />
                  <div className="absolute bottom-2 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-md pointer-events-none flex items-center gap-1.5">
                    <Move className="w-3 h-3" /> Drag to position • Scroll to zoom
                  </div>
                </div>

                {/* Interactive Toolbar */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <ZoomIn className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-700">Zoom:</span>
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.01"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600 w-10 text-right">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('fill');
                        setPanX(0);
                        setPanY(0);
                        setZoom(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        fitMode === 'fill'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Fill entire target canvas, cropping edges"
                    >
                      Fill & Center
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFitMode('fit');
                        setPanX(0);
                        setPanY(0);
                        setZoom(1);
                      }}
                      className={`px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        fitMode === 'fit'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title="Fit entire image with white borders"
                    >
                      Preserve All
                    </button>
                    <button
                      type="button"
                      onClick={handleRotate}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1"
                      title="Rotate 90 degrees clockwise"
                    >
                      <RotateCw className="w-3.5 h-3.5" /> Rotate
                    </button>
                    <button
                      type="button"
                      onClick={handleResetAdjustments}
                      className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium"
                      title="Reset zoom and framing"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Different Photo
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

            {/* Sub-Registrar Guidelines Card */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                Sub-Registrar Office (SRO) Best Practices for Marriage Registration:
              </div>
              <ul className="list-disc list-inside space-y-1 text-amber-800/90 pl-1">
                <li>
                  <strong>Joint Framing:</strong> Both bride and groom should face front, visible waist-up with neutral expressions.
                </li>
                <li>
                  <strong>Plain Background:</strong> A clean white or light background is strictly advised to avoid SRO rejections.
                </li>
                <li>
                  <strong>Avoid Rejections:</strong> Do not use heavily filtered selfies, wedding rituals where faces are obscured, or cropped group photos.
                </li>
              </ul>
            </div>
          </div>

          {/* Right Col: Format Controls & Validation */}
          <div className="space-y-4">
            {/* 1. Document Preset */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Document Preset
              </h3>

              <div className="space-y-2">
                <label
                  onClick={() => setPreset('b2')}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    preset === 'b2'
                      ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="docPreset"
                    checked={preset === 'b2'}
                    onChange={() => setPreset('b2')}
                    className="mt-1 accent-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Kaveri Joint Photo (B2 / 2B)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      2673 × 1890 px • Strictly &lt; 2.0 MB • Official Portal Format
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setPreset('passport')}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    preset === 'passport'
                      ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="docPreset"
                    checked={preset === 'passport'}
                    onChange={() => setPreset('passport')}
                    className="mt-1 accent-blue-600"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Individual Passport Photo
                    </div>
                    <div className="text-[11px] text-slate-500">
                      200 × 230 px • Strictly &lt; 50 KB • Seva Sindhu / SRO
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 2. Output Format */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. File Format
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('png')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    format === 'png'
                      ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">PNG Format</div>
                  <div className="text-[10px] text-slate-500">Mandated by Kaveri 2.0</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('jpg')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    format === 'jpg'
                      ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-400'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">JPEG Format</div>
                  <div className="text-[10px] text-slate-500">For physical printing</div>
                </button>
              </div>
            </div>

            {/* 3. Portal Compliance Audit Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                3. Kaveri Portal Compliance Audit
              </h3>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Target Width:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {currentPreset.width} px
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Target Height:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {currentPreset.height} px
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Aspect Ratio:</span>
                  <span className="font-semibold text-slate-900">{currentPreset.ratio}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Size Ceiling:</span>
                  <span className="font-semibold text-slate-900">{currentPreset.limitLabel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/80">
                  <span className="text-slate-500">Export File Size:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {calcSizeBytes > 0 ? `${sizeKB} KB (${sizeMB} MB)` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className="text-slate-500">Portal Status:</span>
                  {isProcessing ? (
                    <span className="text-amber-600 font-semibold flex items-center gap-1 text-[11px]">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Verifying...
                    </span>
                  ) : !loadedImage ? (
                    <span className="text-slate-400 text-[11px]">Waiting for photo</span>
                  ) : isWithinSize ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kaveri 2.0 Compliant
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" /> Exceeds Size Limit
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Download Button */}
            <Button
              className="w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
              disabled={!outputBlob || !isWithinSize || isProcessing}
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download Kaveri-Ready Photo
            </Button>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
