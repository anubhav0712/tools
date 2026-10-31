import React, { useState, useEffect } from 'react';
import {
  Type,
  Copy,
  Check,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeCaseConverter } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { CaseConverterInput, CaseConverterOutput } from './definition';

export const CaseConverterUI: React.FC<
  ToolComponentProps<CaseConverterInput, CaseConverterOutput>
> = ({ tool, initialInput }) => {
  const [text, setText] = useState<string>(
    initialInput?.text || 'user authentication token validator'
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<CaseConverterOutput>(() =>
    executeCaseConverter({ text })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeCaseConverter({ text });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [text]);

  const handleCopy = async (val: string, keyId: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReset = () => {
    setText('');
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ text }}
    >
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Input Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-600" />
              <span>Input Text</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-slate-400">
                {output.wordCount} words • {output.characterCount} chars
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-rose-600 h-6 px-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste any text or variable name here..."
            rows={3}
            className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
          />
        </div>

        {/* Results List */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
          <h3 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
            Converted Case Formats
          </h3>

          <div className="flex flex-col divide-y divide-slate-100">
            {output.formats.map((fmt) => (
              <div
                key={fmt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
              >
                <span className="text-xs font-semibold text-slate-500 w-36 shrink-0">
                  {fmt.label}
                </span>

                <span className="flex-1 font-mono text-xs text-slate-900 font-medium break-all select-all">
                  {fmt.value || '—'}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(fmt.value, fmt.id)}
                  disabled={!fmt.value}
                  className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  {copiedKey === fmt.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> All text and variable names are transformed 100% locally in your browser memory.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
