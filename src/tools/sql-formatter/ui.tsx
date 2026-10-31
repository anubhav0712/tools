import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Minimize2,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { CodeEditor } from '../../design-system/code-editor';
import { executeSqlFormatter } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { SqlFormatterInput, SqlFormatterOutput } from './definition';

export const SqlFormatterUI: React.FC<
  ToolComponentProps<SqlFormatterInput, SqlFormatterOutput>
> = ({ tool, initialInput }) => {
  const [sql, setSql] = useState<string>(
    initialInput?.sql ||
      'select u.id, u.name, o.total_amount from users u left join orders o on u.id = o.user_id where u.active = 1 and o.status = "completed" group by u.id, u.name order by o.total_amount desc limit 50;'
  );
  const [mode, setMode] = useState<'beautify' | 'minify'>(
    initialInput?.mode || 'beautify'
  );
  const [uppercaseKeywords, setUppercaseKeywords] = useState<boolean>(
    initialInput?.uppercaseKeywords ?? true
  );
  const [indentSpaces, setIndentSpaces] = useState<number>(
    initialInput?.indentSpaces ?? 2
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<SqlFormatterOutput>(() =>
    executeSqlFormatter({ sql, mode, uppercaseKeywords, indentSpaces })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeSqlFormatter({ sql, mode, uppercaseKeywords, indentSpaces });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [sql, mode, uppercaseKeywords, indentSpaces]);

  const handleCopy = async () => {
    if (!output.formattedSql) return;
    await navigator.clipboard.writeText(output.formattedSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output.formattedSql) return;
    const blob = new Blob([output.formattedSql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSql('');
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ sql, mode, uppercaseKeywords, indentSpaces }}
    >
      <div className="flex flex-col gap-5">
        {/* Controls Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mode Toggle */}
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('beautify')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'beautify'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Beautify</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('minify')}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'minify'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Minify</span>
              </button>
            </div>

            {/* Uppercase toggle */}
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercaseKeywords}
                onChange={(e) => setUppercaseKeywords(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>UPPERCASE Keywords</span>
            </label>

            {/* Indentation */}
            {mode === 'beautify' && (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 border-l border-slate-200 pl-3">
                <span>Indent:</span>
                <div className="flex gap-1">
                  {[2, 4].map((spaces) => (
                    <button
                      key={spaces}
                      type="button"
                      onClick={() => setIndentSpaces(spaces)}
                      className={`px-2 py-0.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                        indentSpaces === spaces
                          ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {spaces} spaces
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={!output.formattedSql}
              className="text-xs h-7 px-2.5 gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Download .sql</span>
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

        {/* Split CodeEditors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeEditor
            label="Raw SQL Input"
            value={sql}
            onChange={setSql}
            placeholder="Paste your SQL statement here..."
            filename="query_raw.sql"
            height="h-80 lg:h-[450px]"
          />

          <CodeEditor
            label={`Formatted Output (${output.statementCount} statement${output.statementCount === 1 ? '' : 's'})`}
            value={output.formattedSql}
            readOnly
            filename="query_formatted.sql"
            height="h-80 lg:h-[450px]"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!output.formattedSql}
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
            <strong>Zero Egress Guarantee:</strong> Proprietary database table names, internal column keys, and query filters are processed strictly in your local browser sandbox.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
