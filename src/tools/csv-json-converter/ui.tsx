import React, { useState, useEffect } from 'react';
import {
  FileUp,
  Download,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { CodeEditor } from '../../design-system/code-editor';
import { executeCsvJsonConverter } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type {
  ConversionDirection,
  CsvJsonConverterInput,
  CsvJsonConverterOutput,
} from './definition';

export const CsvJsonConverterUI: React.FC<
  ToolComponentProps<CsvJsonConverterInput, CsvJsonConverterOutput>
> = ({ tool, initialInput }) => {
  const [direction, setDirection] = useState<ConversionDirection>(
    initialInput?.direction || 'csv_to_json'
  );
  const [data, setData] = useState<string>(
    initialInput?.data ||
      'id,name,role,department\n101,Alice Smith,Engineer,Platform\n102,Bob Jones,Product Manager,Core\n103,Charlie Brown,Designer,Brand'
  );
  const [delimiter, setDelimiter] = useState<string>(initialInput?.delimiter || ',');
  const [hasHeader, setHasHeader] = useState<boolean>(initialInput?.hasHeader ?? true);
  const [anonymizeInput, setAnonymizeInput] = useState<string>('');
  const [anonymizeMode, setAnonymizeMode] = useState<'mask' | 'hash'>('mask');
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<CsvJsonConverterOutput>(() =>
    executeCsvJsonConverter({
      direction,
      data,
      delimiter,
      hasHeader,
      anonymizeColumns: anonymizeInput ? anonymizeInput.split(',') : [],
      anonymizeMode,
    })
  );

  useEffect(() => {
    const start = performance.now();
    const cols = anonymizeInput
      ? anonymizeInput
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];
    const res = executeCsvJsonConverter({
      direction,
      data,
      delimiter,
      hasHeader,
      anonymizeColumns: cols,
      anonymizeMode,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [direction, data, delimiter, hasHeader, anonymizeInput, anonymizeMode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setData(content);
        if (file.name.endsWith('.json')) {
          setDirection('json_to_csv');
        } else if (file.name.endsWith('.csv')) {
          setDirection('csv_to_json');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!output.converted) return;
    const isJson = direction === 'csv_to_json';
    const isMd = direction === 'csv_to_markdown';
    const ext = isJson ? 'json' : isMd ? 'md' : 'csv';
    const mime = isJson ? 'application/json' : isMd ? 'text/markdown' : 'text/csv';

    const blob = new Blob([output.converted], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!output.converted) return;
    await navigator.clipboard.writeText(output.converted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setData('');
    setAnonymizeInput('');
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ direction, delimiter, hasHeader }}
    >
      <div className="flex flex-col gap-5">
        {/* Direction Tabs & Primary Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 overflow-x-auto scrollbar-none">
            {[
              { id: 'csv_to_json', label: 'CSV → JSON' },
              { id: 'json_to_csv', label: 'JSON → CSV' },
              { id: 'csv_to_markdown', label: 'CSV → Markdown' },
              { id: 'markdown_to_csv', label: 'Markdown → CSV' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDirection(tab.id as ConversionDirection)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  direction === tab.id
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="inline-flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs">
              <input
                type="file"
                accept=".csv,.json,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              <FileUp className="w-3.5 h-3.5 text-slate-500" />
              <span>Load File</span>
            </label>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!output.converted}
              className="text-xs h-7 px-2.5 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export</span>
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

        {/* Options & Anonymizer Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-medium">Delimiter:</span>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="&#9;">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>First row contains headers</span>
            </label>
          </div>

          {/* Anonymizer Pill */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <input
              type="text"
              value={anonymizeInput}
              onChange={(e) => setAnonymizeInput(e.target.value)}
              placeholder="Redact column names (e.g. email, ssn)..."
              className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
            <select
              value={anonymizeMode}
              onChange={(e) => setAnonymizeMode(e.target.value as any)}
              className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="mask">Mask</option>
              <option value="hash">Hash</option>
            </select>
          </div>
        </div>

        {/* Error Notice */}
        {!output.isValid && output.error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-rose-900">Conversion Error</span>
              <p className="font-mono text-rose-700">{output.error}</p>
            </div>
          </div>
        )}

        {/* Split View Workspaces */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeEditor
            label="Input Source"
            value={data}
            onChange={setData}
            placeholder="Paste your source data here..."
            filename={direction.startsWith('csv') ? 'input.csv' : 'input.json'}
            height="h-80 lg:h-[450px]"
          />

          <CodeEditor
            label={`Converted Output (${output.rowCount} rows, ${output.columnCount} columns)`}
            value={output.converted}
            readOnly
            filename={direction.endsWith('json') ? 'output.json' : 'output.csv'}
            height="h-80 lg:h-[450px]"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output.converted}
                className="text-xs text-indigo-600 hover:text-indigo-700 gap-1 h-6 px-2"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            }
          />
        </div>

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Corporate spreadsheets, salary sheets, and CRM customer data are parsed and transformed 100% in client memory. Never stored, never uploaded.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
