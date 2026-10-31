import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  Download,
  ShieldCheck,
  List,
  Clock,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeMarkdownPreview } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { MarkdownPreviewInput, MarkdownPreviewOutput } from './definition';

export const MarkdownPreviewUI: React.FC<
  ToolComponentProps<MarkdownPreviewInput, MarkdownPreviewOutput>
> = ({ tool, initialInput }) => {
  const [markdown, setMarkdown] = useState<string>(
    initialInput?.markdown ||
      '# Project Antigravity\n\n> 100% In-Browser, Zero-Egress Suite.\n\n## Core Principles\n- **Zero Server Uploads**: Runs entirely in the client sandbox\n- **Zero Tracking**: No Google Analytics or third-party pixels\n\n### Comparison Table\n| Feature | Antigravity | Legacy Tools |\n| --- | --- | --- |\n| Offline Ready | Yes | No |\n| Privacy Protected | 100% | Often Leaks |\n\n```typescript\n// Sample code snippet\nconst isPrivate = true;\nconsole.log({ isPrivate });\n```'
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<MarkdownPreviewOutput>(() =>
    executeMarkdownPreview({ markdown })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeMarkdownPreview({ markdown });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [markdown]);

  const handleCopyHtml = async () => {
    if (!output.html) return;
    await navigator.clipboard.writeText(output.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    if (!output.html) return;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; }
    blockquote { border-left: 4px solid #6366f1; background: #eef2ff; margin: 16px 0; padding: 8px 16px; font-style: italic; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    code { background: #f1f5f9; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
  </style>
</head>
<body>
${output.html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setMarkdown('');
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ markdown }}
    >
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full">
        {/* Top Controls & Metrics Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Stats:</span>
            </span>
            <span className="font-mono text-slate-600 font-bold">
              {output.wordCount} words
            </span>
            <span>•</span>
            <span className="font-mono text-slate-600">
              {output.characterCount} chars
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>~{output.readingTimeMinutes} min read</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyHtml}
              disabled={!output.html}
              className="text-xs h-7 px-2.5 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>HTML Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Copy HTML</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadHtml}
              disabled={!output.html}
              className="text-xs h-7 px-2.5 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export HTML</span>
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

        {/* Table of Contents Pill Bar (if headers exist) */}
        {output.tableOfContents.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 overflow-x-auto scrollbar-none text-xs">
            <div className="flex items-center gap-1.5 text-indigo-900 font-semibold shrink-0">
              <List className="w-3.5 h-3.5 text-indigo-600" />
              <span>Table of Contents:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {output.tableOfContents.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-white border border-indigo-100 text-indigo-700 font-medium whitespace-nowrap text-[11px]"
                >
                  {item.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Split Editor and Preview Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Markdown Raw Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Markdown Source</span>
              <span className="text-[11px] font-mono text-slate-400">GFM Enabled</span>
            </label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Write your markdown here..."
              rows={22}
              className="w-full p-4 font-mono text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
            />
          </div>

          {/* Right: Rich Formatted HTML Preview */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Live Rendered View</span>
              <span className="text-[11px] text-emerald-600 font-medium">Instant HMR Preview</span>
            </label>
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs h-[480px] overflow-y-auto">
              {output.html ? (
                <div
                  className="prose prose-slate max-w-none text-xs leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: output.html }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Preview will appear here as you type...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Your confidential notes, strategy documents, and drafts are rendered and formatted purely inside your local browser sandbox.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
