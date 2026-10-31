import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Layers,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeCronParser } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { CronParserInput, CronParserOutput } from './definition';

export const CronParserUI: React.FC<
  ToolComponentProps<CronParserInput, CronParserOutput>
> = ({ tool, initialInput }) => {
  const [expression, setExpression] = useState<string>(
    initialInput?.expression || '*/15 * * * *'
  );
  const [previewCount, setPreviewCount] = useState<number>(
    initialInput?.previewCount ?? 5
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<CronParserOutput>(() =>
    executeCronParser({ expression, previewCount })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeCronParser({ expression, previewCount });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [expression, previewCount]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setExpression('*/15 * * * *');
  };

  const presets = [
    { label: 'Every 5 Mins', expr: '*/5 * * * *' },
    { label: 'Every 15 Mins', expr: '*/15 * * * *' },
    { label: 'Hourly', expr: '0 * * * *' },
    { label: 'Daily Midnight', expr: '0 0 * * *' },
    { label: 'Weekdays 9 AM', expr: '0 9 * * 1-5' },
    { label: 'Weekly Sun', expr: '0 0 * * 0' },
    { label: 'Monthly 1st', expr: '0 0 1 * *' },
  ];

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ expression, previewCount }}
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Presets Bar */}
        <div className="flex items-center gap-2 overflow-x-auto p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Common Presets:
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setExpression(p.expr)}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap transition-colors cursor-pointer ${
                expression === p.expr
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Hero Expression Input & Human Sentence */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Cron Expression (5 fields: min hour dom mon dow)</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 text-xs text-slate-500 hover:text-indigo-600 gap-1 px-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. 0 9-17 * * 1-5"
              className="w-full px-4 py-3 text-lg font-mono tracking-wider font-bold rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Human-Readable Banner */}
          {output.isValid ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950">
              <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                  Plain English Explanation
                </span>
                <span className="text-base font-bold text-slate-900">
                  {output.humanDescription}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-rose-900">Invalid Cron Expression</span>
                <p className="font-mono text-rose-700">{output.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* 5 Field Cards Breakdown */}
        {output.isValid && output.fields.length === 5 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Field Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {output.fields.map((f) => (
                <div
                  key={f.name}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1"
                >
                  <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                    {f.name}
                  </span>
                  <span className="font-mono text-base font-bold text-indigo-600">
                    {f.raw}
                  </span>
                  <span className="text-[11px] text-slate-600 leading-tight">
                    {f.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Scheduled Execution Previews */}
        {output.isValid && output.nextRuns.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Upcoming Trigger Dates (Next {output.nextRuns.length} Runs)
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Show:</span>
                {[5, 10].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPreviewCount(cnt)}
                    className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                      previewCount === cnt
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {output.nextRuns.map((iso, idx) => {
                const date = new Date(iso);
                const formattedDate = date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                const formattedTime = date.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={iso}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50/80 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {formattedDate}
                        </span>
                        <span className="text-xs font-mono text-indigo-600 font-bold">
                          {formattedTime}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                      {iso}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};
