import React, { useState } from 'react';
import {
  Camera,
  MapPin,
  ShieldCheck,
  Download,
  AlertTriangle,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { Badge } from '../../design-system/badge';
import { executeExifScrubber } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { ExifScrubberInput, ExifScrubberOutput } from './definition';

export const ExifScrubberUI: React.FC<
  ToolComponentProps<ExifScrubberInput, ExifScrubberOutput>
> = ({ tool }) => {
  const [fileName, setFileName] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<ExifScrubberOutput>({
    isValid: true,
    extracted: { hasExif: false },
    originalByteSize: 0,
    cleanedByteSize: 0,
    bytesSaved: 0,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        const start = performance.now();
        const res = executeExifScrubber({
          fileBuffer: buffer,
          fileName: file.name,
          mimeType: file.type,
        });
        const end = performance.now();
        setExecTime(end - start);
        setOutput(res);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadCleaned = () => {
    if (!output.cleanedBuffer) return;
    const blob = new Blob([output.cleanedBuffer], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrubbed_${fileName || 'photo.jpg'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFileName('');
    setPreviewUrl('');
    setOutput({
      isValid: true,
      extracted: { hasExif: false },
      originalByteSize: 0,
      cleanedByteSize: 0,
      bytesSaved: 0,
    });
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Upload Drop Zone */}
        {!fileName ? (
          <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl bg-slate-50/70 hover:bg-indigo-50/20 transition-all cursor-pointer text-center group">
            <input type="file" accept="image/jpeg,image/jpg" onChange={handleFileUpload} className="hidden" />
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Click to select a photo or drag & drop here
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Supports JPEG / JPG camera photos. All inspection and GPS stripping happens 100% in your local browser sandbox.
            </p>
          </label>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">{fileName}</span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({(output.originalByteSize / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadCleaned}
                  className="text-xs h-8 px-3 gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Cleaned Photo</span>
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

            {/* Split View: Photo preview and metadata card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Photo Preview */}
              <div className="md:col-span-5 p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col items-center justify-center">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Upload Preview"
                    className="max-h-64 object-contain rounded-2xl shadow-inner"
                  />
                )}
              </div>

              {/* Metadata Breakdown */}
              <div className="md:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Detected Photo Metadata
                  </h3>
                  {output.extracted.hasExif ? (
                    output.extracted.gps ? (
                      <Badge variant="danger" className="text-xs gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>GPS Location Embedded</span>
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-xs gap-1">
                        <span>Device Metadata Found</span>
                      </Badge>
                    )
                  ) : (
                    <Badge variant="success" className="text-xs gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>No EXIF Metadata Found</span>
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col gap-0.5">
                    <span className="text-slate-500 text-[11px] font-medium">Camera Hardware</span>
                    <span className="font-bold text-slate-900">
                      {output.extracted.make || output.extracted.model
                        ? `${output.extracted.make || ''} ${output.extracted.model || ''}`.trim()
                        : 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col gap-0.5">
                    <span className="text-slate-500 text-[11px] font-medium">Date & Timestamp</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {output.extracted.dateTime || 'Not specified'}
                    </span>
                  </div>

                  {output.extracted.gps ? (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-rose-900">
                        <MapPin className="w-4 h-4 text-rose-600" />
                        <span>Exact Geolocation Coordinates</span>
                      </div>
                      <span className="font-mono text-rose-800">
                        Lat: {output.extracted.gps.latitude}° | Lon: {output.extracted.gps.longitude}°
                      </span>
                      {output.extracted.gps.mapUrl && (
                        <a
                          href={output.extracted.gps.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:underline text-[11px] font-medium"
                        >
                          View location on OpenStreetMap →
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="sm:col-span-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Zero GPS coordinates detected in this file.</span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col gap-1">
                  <span className="font-semibold text-emerald-900">Scrubber Status</span>
                  <p>
                    All APP1 EXIF headers and metadata segments have been purged in the scrubbed download. Your image retains full resolution with zero location footprint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Your personal photos, family albums, and home location coordinates never touch a cloud server. Everything is sanitized in browser memory.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
