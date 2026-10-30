import React, { useState, useEffect, useTransition } from 'react';
import { Play, ArrowUpDown, AlertCircle, FileUp } from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { CodeEditor } from '../../design-system/code-editor';
import { Button } from '../../design-system/button';
import { executeJsonFormatter } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { JsonFormatterInput, JsonFormatterOutput } from './definition';

export const JsonFormatterUI: React.FC<ToolComponentProps<JsonFormatterInput, JsonFormatterOutput>> = ({
  tool,
  initialInput,
}) => {
  const [rawJson, setRawJson] = useState<string>(
    initialInput?.rawJson || '{\n  "title": "Online Tools",\n  "offline": true,\n  "privacy": "100%",\n  "features": ["fast", "clean", "responsive"]\n}'
  );
  const [indent, setIndent] = useState<number>(initialInput?.indent ?? 2);
  const [sortKeys, setSortKeys] = useState<boolean>(initialInput?.sortKeys ?? false);
  const [output, setOutput] = useState<JsonFormatterOutput>({
    formatted: '',
    isValid: true,
    lineCount: 0,
    byteSize: 0,
  });
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [, startTransition] = useTransition();

  const runFormatter = (text: string, ind: number, sort: boolean) => {
    const start = performance.now();
    const res = executeJsonFormatter({ rawJson: text, indent: ind, sortKeys: sort });
    const end = performance.now();
    setExecutionTime(end - start);
    setOutput(res);
  };

  useEffect(() => {
    startTransition(() => {
      runFormatter(rawJson, indent, sortKeys);
    });
  }, [rawJson, indent, sortKeys]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setRawJson(content);
    };
    reader.readAsText(file);
  };

  const handleLoadExample = (exampleIndex: number) => {
    const ex = tool.examples?.[exampleIndex];
    if (ex) {
      setRawJson(ex.input.rawJson);
      setIndent(ex.input.indent);
      setSortKeys(ex.input.sortKeys);
    }
  };

  const handleReset = () => {
    setRawJson('');
    setOutput({ formatted: '', isValid: true, lineCount: 0, byteSize: 0 });
    setExecutionTime(0);
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={executionTime}
      inputData={{ rawJson, indent, sortKeys }}
    >
      {/* Controls & Presets Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500">Indent:</span>
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            {[
              { label: '2 Spaces', val: 2 },
              { label: '4 Spaces', val: 4 },
              { label: 'Minify', val: 0 },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setIndent(opt.val)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  indent === opt.val
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer ml-1 select-none hover:text-slate-900">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              Sort Keys
            </span>
          </label>
        </div>

        {/* Examples & Upload Actions */}
        <div className="flex items-center gap-2">
          {tool.examples && tool.examples.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Presets:</span>
              {tool.examples.map((ex, idx) => (
                <Button
                  key={ex.title}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLoadExample(idx)}
                  className="text-xs text-slate-600 hover:text-indigo-600 h-7 px-2"
                >
                  {ex.title}
                </Button>
              ))}
            </div>
          )}

          <label className="inline-flex items-center gap-1.5 text-xs h-7 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors cursor-pointer shadow-2xs">
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Load File</span>
          </label>
        </div>
      </div>

      {/* Syntax Error Banner */}
      {!output.isValid && output.error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-rose-900">Invalid JSON Syntax</span>
            <p className="font-mono text-rose-700">{output.error}</p>
          </div>
        </div>
      )}

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label="Raw Input JSON"
          value={rawJson}
          onChange={setRawJson}
          placeholder="Paste or type raw JSON here..."
          filename="input.json"
          height="h-64 sm:h-80 lg:h-[450px]"
        />

        <CodeEditor
          label={indent === 0 ? 'Minified Output' : 'Formatted Output'}
          value={output.formatted}
          readOnly
          filename="formatted.json"
          height="h-64 sm:h-80 lg:h-[450px]"
          actions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runFormatter(rawJson, indent, sortKeys)}
              className="text-xs text-indigo-600 hover:text-indigo-700 gap-1 h-6 px-2"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Re-run</span>
            </Button>
          }
        />
      </div>
    </ToolShell>
  );
};
