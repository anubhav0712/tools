import React, { useState } from 'react';
import { Copy, Check, Trash2, Download } from 'lucide-react';
import { Button } from './button';

export interface CodeEditorProps {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  actions?: React.ReactNode;
  height?: string;
  language?: string;
  filename?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Enter input...',
  readOnly = false,
  actions,
  height = 'h-64 sm:h-80 lg:h-96',
  language = 'text',
  filename = 'output.txt',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!value) return;
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lineCount = value ? value.split('\n').length : 1;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 select-none">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-600">
              {label}
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} • {new Blob([value]).size} bytes
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {actions}

          {!readOnly && onChange && value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange('')}
              title="Clear input"
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 h-7 px-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}

          {readOnly && value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download file"
              className="text-slate-500 hover:text-slate-800 h-7 px-2"
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          )}

          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-slate-600 hover:text-slate-900 h-7 px-2 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Editor Body */}
      <div className={`relative flex font-mono text-xs sm:text-sm ${height}`}>
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full h-full p-3.5 bg-transparent text-slate-900 placeholder:text-slate-400 resize-none font-mono focus:outline-none leading-relaxed"
          data-language={language}
        />
      </div>
    </div>
  );
};
