import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  ArrowLeftRight,
  Plus,
  Minus,
  Percent,
  Check,
  Columns,
  List,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeDiffChecker } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { DiffCheckerInput, DiffCheckerOutput, DiffLine } from './definition';

export const DiffCheckerUI: React.FC<ToolComponentProps<DiffCheckerInput, DiffCheckerOutput>> = ({
  tool,
  initialInput,
}) => {
  const [originalText, setOriginalText] = useState<string>(
    initialInput?.originalText ||
      'PORT=3000\nNODE_ENV=development\nDB_HOST=localhost\nCACHE_ENABLED=false'
  );
  const [modifiedText, setModifiedText] = useState<string>(
    initialInput?.modifiedText ||
      'PORT=8080\nNODE_ENV=production\nDB_HOST=db.internal.net\nCACHE_ENABLED=true\nLOG_LEVEL=info'
  );
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(
    initialInput?.ignoreWhitespace ?? false
  );
  const [ignoreCase, setIgnoreCase] = useState<boolean>(initialInput?.ignoreCase ?? false);
  const [diffMode, setDiffMode] = useState<'split' | 'unified'>(initialInput?.diffMode || 'split');
  const [execTime, setExecTime] = useState<number>(0);
  const [output, setOutput] = useState<DiffCheckerOutput>(() =>
    executeDiffChecker({ originalText, modifiedText, ignoreWhitespace, ignoreCase })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeDiffChecker({
      originalText,
      modifiedText,
      ignoreWhitespace,
      ignoreCase,
      diffMode,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [originalText, modifiedText, ignoreWhitespace, ignoreCase, diffMode]);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
  };

  const handleLoadPreset = (index: number) => {
    const ex = tool.examples?.[index];
    if (ex) {
      setOriginalText(ex.input.originalText);
      setModifiedText(ex.input.modifiedText);
    }
  };

  const renderLineContent = (line: DiffLine) => {
    if (line.characterChanges && line.characterChanges.length > 0) {
      return (
        <span>
          {line.characterChanges.map((chunk, idx) => {
            let chunkClass = '';
            if (chunk.type === 'insert') {
              chunkClass = 'bg-emerald-200/90 text-emerald-950 font-bold px-0.5 rounded';
            } else if (chunk.type === 'delete') {
              chunkClass = 'bg-rose-200/90 text-rose-950 line-through px-0.5 rounded';
            }
            return (
              <span key={idx} className={chunkClass}>
                {chunk.text}
              </span>
            );
          })}
        </span>
      );
    }
    return <span>{line.content || '\u00A0'}</span>;
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleClear}
      executionTimeMs={execTime}
      inputData={{ originalText, modifiedText, ignoreWhitespace, ignoreCase }}
    >
      <div className="flex flex-col gap-5">
        {/* Controls & Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Presets */}
            {tool.examples && tool.examples.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">Presets:</span>
                {tool.examples.map((ex, idx) => (
                  <Button
                    key={ex.title}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLoadPreset(idx)}
                    className="text-xs h-7 px-2"
                  >
                    {ex.title}
                  </Button>
                ))}
              </div>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleSwap}
              className="text-xs h-7 px-2.5 gap-1.5"
              title="Swap original and modified text"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Swap</span>
            </Button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Ignore Whitespace</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span>Ignore Case</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setDiffMode('split')}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  diffMode === 'split'
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Columns className="w-3 h-3" />
                <span>Split</span>
              </button>
              <button
                type="button"
                onClick={() => setDiffMode('unified')}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  diffMode === 'unified'
                    ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3 h-3" />
                <span>Unified</span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-rose-600 h-7 px-2 gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Change Statistics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Similarity</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900">
                {output.similarityPercentage}%
              </span>
              <Percent className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Additions</span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-600">
              <Plus className="w-4 h-4" />
              <span>{output.additionsCount} lines</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Deletions</span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-rose-600">
              <Minus className="w-4 h-4" />
              <span>{output.deletionsCount} lines</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">Unchanged</span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-700">
              <Check className="w-4 h-4 text-slate-400" />
              <span>{output.unchangedCount} lines</span>
            </div>
          </div>
        </div>

        {/* Editable Input Panes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Original Text / Before</span>
              <span className="text-[11px] font-mono text-slate-400">
                {originalText.split('\n').length} lines
              </span>
            </label>
            <textarea
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Paste original snippet here..."
              rows={8}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Modified Text / After</span>
              <span className="text-[11px] font-mono text-slate-400">
                {modifiedText.split('\n').length} lines
              </span>
            </label>
            <textarea
              value={modifiedText}
              onChange={(e) => setModifiedText(e.target.value)}
              placeholder="Paste modified snippet here..."
              rows={8}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
            />
          </div>
        </div>

        {/* Visual Diff Output Viewer */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Visual Diff Result ({output.lines.length} lines total)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              Green = Added • Red = Removed • Highlighting = In-line changes
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs font-mono text-xs">
            {output.lines.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No text to compare. Enter content above to view diff.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto max-h-[500px]">
                {output.lines.map((line, idx) => {
                  let rowBg = 'bg-white text-slate-800 hover:bg-slate-50/70';
                  let prefix = ' ';
                  let prefixColor = 'text-slate-300';

                  if (line.type === 'insert') {
                    rowBg = 'bg-emerald-50/80 text-emerald-900 font-medium';
                    prefix = '+';
                    prefixColor = 'text-emerald-600 font-bold';
                  } else if (line.type === 'delete') {
                    rowBg = 'bg-rose-50/80 text-rose-900';
                    prefix = '-';
                    prefixColor = 'text-rose-600 font-bold';
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 py-1 px-3 ${rowBg} transition-colors`}
                    >
                      {/* Line Numbers */}
                      <div className="flex items-center gap-2 select-none text-[11px] text-slate-400 w-16 shrink-0 justify-end font-mono">
                        <span className="w-7 text-right">
                          {line.lineNumberOriginal ?? ''}
                        </span>
                        <span className="w-7 text-right">
                          {line.lineNumberModified ?? ''}
                        </span>
                      </div>

                      {/* Plus/Minus Indicator */}
                      <span className={`w-3 select-none text-center ${prefixColor}`}>
                        {prefix}
                      </span>

                      {/* Code Content */}
                      <div className="flex-1 whitespace-pre-wrap break-all">
                        {renderLineContent(line)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
