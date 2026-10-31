import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  FileUp,
  AlertTriangle,
  Trash2,
  Eye,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { CodeEditor } from '../../design-system/code-editor';
import { executeSvgSanitizer } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { SvgSanitizerInput, SvgSanitizerOutput } from './definition';

export const SvgSanitizerUI: React.FC<
  ToolComponentProps<SvgSanitizerInput, SvgSanitizerOutput>
> = ({ tool, initialInput }) => {
  const [rawSvg, setRawSvg] = useState<string>(
    initialInput?.rawSvg ||
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#4F46E5" />\n  <script>alert("XSS")</script>\n</svg>'
  );
  const [stripDimensions, setStripDimensions] = useState<boolean>(
    initialInput?.stripDimensions ?? false
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<SvgSanitizerOutput>(() =>
    executeSvgSanitizer({ rawSvg, stripDimensions })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeSvgSanitizer({ rawSvg, stripDimensions });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [rawSvg, stripDimensions]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setRawSvg(content);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output.sanitizedSvg) return;
    const blob = new Blob([output.sanitizedSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sanitized.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!output.sanitizedSvg) return;
    await navigator.clipboard.writeText(output.sanitizedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setRawSvg('');
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ rawSvg, stripDimensions }}
    >
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
        {/* Controls Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            {tool.examples && tool.examples.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Presets:</span>
                {tool.examples.map((ex) => (
                  <Button
                    key={ex.title}
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setRawSvg(ex.input.rawSvg);
                      setStripDimensions(Boolean(ex.input.stripDimensions));
                    }}
                    className="text-xs h-7 px-2"
                  >
                    {ex.title}
                  </Button>
                ))}
              </div>
            )}

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none border-l border-slate-200 pl-3">
              <input
                type="checkbox"
                checked={stripDimensions}
                onChange={(e) => setStripDimensions(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>Strip width/height (Make Responsive)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs">
              <input type="file" accept=".svg,image/svg+xml" onChange={handleFileUpload} className="hidden" />
              <FileUp className="w-3.5 h-3.5 text-slate-500" />
              <span>Load SVG</span>
            </label>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!output.sanitizedSvg}
              className="text-xs h-7 px-2.5 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download .svg</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 h-7 px-2 gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Stats Metrics Ribbon */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Elements / Handlers Stripped</span>
            <span className="text-sm font-bold text-rose-600 font-mono">
              {output.removedElementsCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Original Size</span>
            <span className="text-sm font-bold text-slate-700 font-mono">
              {output.originalByteSize} B
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Bytes Saved</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">
              {output.bytesSaved} B ({output.originalByteSize > 0 ? Math.round((output.bytesSaved / output.originalByteSize) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Error Notice */}
        {!output.isValid && output.error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-rose-900">Invalid SVG Input</span>
              <p className="font-mono text-rose-700">{output.error}</p>
            </div>
          </div>
        )}

        {/* Live SVG Visual Preview */}
        {output.isValid && output.sanitizedSvg && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Sanitized Vector Preview</span>
            </div>
            <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-4 overflow-hidden">
              <div
                className="max-h-full max-w-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: output.sanitizedSvg }}
              />
            </div>
          </div>
        )}

        {/* Split Source Code Editors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeEditor
            label="Original SVG Source"
            value={rawSvg}
            onChange={setRawSvg}
            placeholder="Paste raw SVG markup here..."
            filename="source.svg"
            height="h-72 lg:h-[400px]"
          />

          <CodeEditor
            label="Cleaned & Sanitized SVG"
            value={output.sanitizedSvg}
            readOnly
            filename="sanitized.svg"
            height="h-72 lg:h-[400px]"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output.sanitizedSvg}
                className="text-xs text-indigo-600 hover:text-indigo-700 gap-1 h-6 px-2"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            }
          />
        </div>

        {/* Privacy Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Vector graphics and design assets are sanitized entirely inside client memory, eliminating XSS vectors and unwanted metadata without third-party APIs.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
