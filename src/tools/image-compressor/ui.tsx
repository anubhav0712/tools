import React, { useState, useEffect } from 'react';
import {
  Minimize2,
  Download,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeImageCompressor } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type {
  ImageCompressorInput,
  ImageCompressorOutput,
  OutputImageFormat,
} from './definition';

export const ImageCompressorUI: React.FC<
  ToolComponentProps<ImageCompressorInput, ImageCompressorOutput>
> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [quality, setQuality] = useState<number>(0.8);
  const [format, setFormat] = useState<OutputImageFormat>('image/webp');
  const [maxWidth, setMaxWidth] = useState<number>(1920);

  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<ImageCompressorOutput>({
    isValid: true,
    originalSizeBytes: 0,
    compressedSizeBytes: 0,
    reductionPercentage: 0,
  });

  const runCompress = async (file: File) => {
    const start = performance.now();
    const res = await executeImageCompressor({
      fileBlob: file,
      quality,
      format,
      maxWidth: maxWidth > 0 ? maxWidth : undefined,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);

    if (res.compressedBlob) {
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      const url = URL.createObjectURL(res.compressedBlob);
      setCompressedUrl(url);
    }
  };

  useEffect(() => {
    if (selectedFile) {
      runCompress(selectedFile);
    }
  }, [selectedFile, quality, format, maxWidth]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const ext = format === 'image/webp' ? 'webp' : format === 'image/png' ? 'png' : 'jpg';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `${baseName}_compressed.${ext}`;
    a.click();
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setSelectedFile(null);
    setFileName('');
    setPreviewUrl('');
    setCompressedUrl('');
    setOutput({
      isValid: true,
      originalSizeBytes: 0,
      compressedSizeBytes: 0,
      reductionPercentage: 0,
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Upload Drop Zone if no file */}
        {!selectedFile ? (
          <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl bg-slate-50/70 hover:bg-indigo-50/20 transition-all cursor-pointer text-center group">
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
              <Minimize2 className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Select an image to compress locally
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Supports JPEG, PNG, and WebP. Images are downscaled and compressed entirely inside your browser GPU/canvas with zero upload to any server.
            </p>
          </label>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{fileName}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({formatSize(output.originalSizeBytes)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!compressedUrl}
                  className="text-xs h-8 px-3 gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download ({formatSize(output.compressedSizeBytes)})</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-rose-600 h-8 px-2 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Choose Another</span>
                </Button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <span className="text-xs text-slate-500">Original Size</span>
                <span className="text-sm font-bold text-slate-700 font-mono">
                  {formatSize(output.originalSizeBytes)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
                <span className="text-xs text-slate-500">Compressed Size</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">
                  {formatSize(output.compressedSizeBytes)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs flex items-center justify-between text-emerald-950">
                <span className="text-xs font-medium">Reduction</span>
                <span className="text-sm font-extrabold font-mono">
                  -{output.reductionPercentage}%
                </span>
              </div>
            </div>

            {/* Compression Settings Panel */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-5">
              {/* Quality Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Quality Level: {Math.round(quality * 100)}%
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Lower = smaller file size, Higher = sharper image
                  </span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Output Format Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Target Format:</span>
                <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                  {[
                    { id: 'image/webp', label: 'WebP (Best Compression)' },
                    { id: 'image/jpeg', label: 'JPEG' },
                    { id: 'image/png', label: 'PNG' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setFormat(fmt.id as OutputImageFormat)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        format === fmt.id
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resize Max Width */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Max Dimension Limit:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Original', val: 0 },
                    { label: '1920px (Full HD)', val: 1920 },
                    { label: '1280px (HD)', val: 1280 },
                    { label: '800px (Web)', val: 800 },
                  ].map((res) => (
                    <button
                      key={res.val}
                      type="button"
                      onClick={() => setMaxWidth(res.val)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                        maxWidth === res.val
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Preview Container */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-700">Compressed Image Preview</span>
              <div className="w-full h-80 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
                {compressedUrl && (
                  <img
                    src={compressedUrl}
                    alt="Compressed output preview"
                    className="max-h-full max-w-full object-contain rounded-xl shadow-xs"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Photos and graphics are resized and encoded on your device&apos;s local GPU / Canvas. Never sent to remote compression servers.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
