import React, { useState } from 'react';
import {
  FilePlus,
  Download,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Layers,
  FileText,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executePdfManipulator } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type {
  PdfManipulatorInput,
  PdfManipulatorOutput,
  PdfOperation,
} from './definition';

export const PdfManipulatorUI: React.FC<
  ToolComponentProps<PdfManipulatorInput, PdfManipulatorOutput>
> = ({ tool }) => {
  const [operation, setOperation] = useState<PdfOperation>('merge');
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; buffer: ArrayBuffer; size: number }>
  >([]);
  const [pageRange, setPageRange] = useState<string>('1');

  const [execTime, setExecTime] = useState<number>(0);
  const [output, setOutput] = useState<PdfManipulatorOutput>({
    isValid: true,
    totalPages: 0,
    originalPageCount: 0,
    byteSize: 0,
  });

  const runOperation = (
    files: Array<{ name: string; buffer: ArrayBuffer; size: number }>,
    op: PdfOperation,
    range: string
  ) => {
    if (files.length === 0) {
      setOutput({ isValid: true, totalPages: 0, originalPageCount: 0, byteSize: 0 });
      return;
    }

    const start = performance.now();
    const res = executePdfManipulator({
      operation: op,
      files: files.map((f) => ({ name: f.name, buffer: f.buffer })),
      pageRange: range,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const promises: Promise<{ name: string; buffer: ArrayBuffer; size: number }>[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      promises.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              name: file.name,
              buffer: event.target?.result as ArrayBuffer,
              size: file.size,
            });
          };
          reader.readAsArrayBuffer(file);
        })
      );
    }

    Promise.all(promises).then((newFiles) => {
      const updated = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updated);
      runOperation(updated, operation, pageRange);
    });
  };

  const removeFile = (index: number) => {
    const updated = uploadedFiles.filter((_, idx) => idx !== index);
    setUploadedFiles(updated);
    runOperation(updated, operation, pageRange);
  };

  const handleDownload = () => {
    if (!output.outputBuffer) return;
    const blob = new Blob([output.outputBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = operation === 'merge' ? 'merged_document.pdf' : 'extracted_pages.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setOutput({ isValid: true, totalPages: 0, originalPageCount: 0, byteSize: 0 });
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setOperation('merge');
                runOperation(uploadedFiles, 'merge', pageRange);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                operation === 'merge'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Merge Multiple PDFs
            </button>
            <button
              type="button"
              onClick={() => {
                setOperation('extract');
                runOperation(uploadedFiles, 'extract', pageRange);
              }}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                operation === 'extract'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Extract Page Range
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={!output.outputBuffer}
              className="text-xs h-8 px-3 gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF ({output.totalPages} pages)</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 h-8 px-2 gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-3xl bg-slate-50/70 hover:bg-indigo-50/20 transition-all cursor-pointer text-center group">
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple={operation === 'merge'}
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-105 transition-transform">
            <FilePlus className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {operation === 'merge' ? 'Select or drop PDF files to merge' : 'Select a PDF to extract pages from'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            100% in-browser binary manipulation. Contracts, tax filings, and bank statements are processed in memory and never uploaded to any cloud server.
          </p>
        </label>

        {/* Extract Range Option (if extract mode) */}
        {operation === 'extract' && uploadedFiles.length > 0 && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Pages to Extract:</span>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => {
                  setPageRange(e.target.value);
                  runOperation(uploadedFiles, 'extract', e.target.value);
                }}
                placeholder="e.g. 1-2, 4"
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-[11px] text-slate-400">
              Document has {output.originalPageCount} total pages
            </span>
          </div>
        )}

        {/* Error Notice */}
        {!output.isValid && output.error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-rose-900">PDF Processing Error</span>
              <p className="font-mono text-rose-700">{output.error}</p>
            </div>
          </div>
        )}

        {/* File Queue List */}
        {uploadedFiles.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Uploaded Documents Queue ({uploadedFiles.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Will be compiled in top-to-bottom order
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50/70 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-900">{file.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(idx)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Sensitive legal contracts, tax documents, and financial records never leave your device. All object trees and page streams are parsed and assembled directly inside browser memory.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
