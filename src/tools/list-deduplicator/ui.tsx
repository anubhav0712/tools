import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  ShieldCheck,
  ArrowUpDown,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeListDeduplicator } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type {
  ListDeduplicatorInput,
  ListDeduplicatorOutput,
  SetOperation,
} from './definition';

export const ListDeduplicatorUI: React.FC<
  ToolComponentProps<ListDeduplicatorInput, ListDeduplicatorOutput>
> = ({ tool, initialInput }) => {
  const [listA, setListA] = useState<string>(
    initialInput?.listA ||
      'alice@example.com\nbob@example.com\nalice@example.com\ncharlie@example.com\nBOB@EXAMPLE.COM'
  );
  const [listB, setListB] = useState<string>(initialInput?.listB || '');
  const [operation, setOperation] = useState<SetOperation>(
    initialInput?.operation || 'dedupe'
  );
  const [caseSensitive, setCaseSensitive] = useState<boolean>(
    initialInput?.caseSensitive ?? false
  );
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(
    initialInput?.trimWhitespace ?? true
  );
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc' | 'numeric'>(
    initialInput?.sortOrder || 'asc'
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<ListDeduplicatorOutput>(() =>
    executeListDeduplicator({
      listA,
      listB,
      operation,
      caseSensitive,
      trimWhitespace,
      sortOrder,
    })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeListDeduplicator({
      listA,
      listB,
      operation,
      caseSensitive,
      trimWhitespace,
      sortOrder,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [listA, listB, operation, caseSensitive, trimWhitespace, sortOrder]);

  const handleCopy = async () => {
    if (!output.resultText) return;
    await navigator.clipboard.writeText(output.resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output.resultText) return;
    const blob = new Blob([output.resultText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setListA('');
    setListB('');
  };

  const needsListB = operation !== 'dedupe';

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ listA, operation, caseSensitive, trimWhitespace, sortOrder }}
    >
      <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
        {/* Operations Selector Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 overflow-x-auto scrollbar-none">
            {[
              { id: 'dedupe', label: 'Deduplicate (Single List)' },
              { id: 'intersection', label: 'Intersection (A ∩ B)' },
              { id: 'difference', label: 'Difference (A - B)' },
              { id: 'union', label: 'Union (A ∪ B)' },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setOperation(op.id as SetOperation)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  operation === op.id
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!output.resultText}
              className="text-xs h-7 px-2.5 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download .txt</span>
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

        {/* Options Ribbon */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>Case Sensitive</span>
            </label>

            <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={(e) => setTrimWhitespace(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>Trim Whitespace</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Sort Order:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
            >
              <option value="none">Original Order (No Sort)</option>
              <option value="asc">A → Z (Alphabetical)</option>
              <option value="desc">Z → A (Reverse)</option>
              <option value="numeric">1 → 9 (Numeric)</option>
            </select>
          </div>
        </div>

        {/* Stats Metrics Ribbon */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Original Items</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {output.originalCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Unique Output</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">
              {output.uniqueCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Duplicates Removed</span>
            <span className="text-sm font-bold text-rose-600 font-mono">
              {output.duplicatesRemoved}
            </span>
          </div>
        </div>

        {/* Input/Output Workspaces */}
        <div className={`grid grid-cols-1 ${needsListB ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
          {/* List A */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">List A</label>
              <span className="text-slate-400 font-mono text-[11px]">
                {listA.split('\n').filter(Boolean).length} lines
              </span>
            </div>
            <textarea
              value={listA}
              onChange={(e) => setListA(e.target.value)}
              placeholder="Paste List A items (one per line)..."
              rows={12}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
            />
          </div>

          {/* List B (if set operation) */}
          {needsListB && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">List B</label>
                <span className="text-slate-400 font-mono text-[11px]">
                  {listB.split('\n').filter(Boolean).length} lines
                </span>
              </div>
              <textarea
                value={listB}
                onChange={(e) => setListB(e.target.value)}
                placeholder="Paste List B items (one per line)..."
                rows={12}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
              />
            </div>
          )}

          {/* Output List */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Processed Result</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output.resultText}
                className="h-6 text-xs text-indigo-600 gap-1 px-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <textarea
              value={output.resultText}
              readOnly
              placeholder="Results will appear here..."
              rows={12}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-100/70 border border-slate-200 text-slate-900 focus:outline-none shadow-2xs resize-none"
            />
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Proprietary client lists, internal ID numbers, and confidential contact directories are processed purely on your device.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
