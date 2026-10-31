import React, { useState, useEffect } from 'react';
import {
  SearchCode,
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  Table as TableIcon,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { Badge } from '../../design-system/badge';
import { executeRegexTester } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { RegexTesterInput, RegexTesterOutput } from './definition';

export const RegexTesterUI: React.FC<
  ToolComponentProps<RegexTesterInput, RegexTesterOutput>
> = ({ tool, initialInput }) => {
  const [pattern, setPattern] = useState<string>(
    initialInput?.pattern || '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})'
  );
  const [flagG, setFlagG] = useState<boolean>(true);
  const [flagI, setFlagI] = useState<boolean>(false);
  const [flagM, setFlagM] = useState<boolean>(false);
  const [flagS, setFlagS] = useState<boolean>(false);

  const [testText, setTestText] = useState<string>(
    initialInput?.testText ||
      'Contact support@example.com or sales@enterprise.org for assistance. Internal dev: admin@local.test'
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number>(0);

  const currentFlags = [
    flagG ? 'g' : '',
    flagI ? 'i' : '',
    flagM ? 'm' : '',
    flagS ? 's' : '',
  ].join('');

  const [output, setOutput] = useState<RegexTesterOutput>(() =>
    executeRegexTester({ pattern, flags: currentFlags, testText })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeRegexTester({ pattern, flags: currentFlags, testText });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [pattern, flagG, flagI, flagM, flagS, testText]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`/${pattern}/${currentFlags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPattern('');
    setTestText('');
  };

  const presets = [
    {
      label: 'Email',
      p: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
      f: { g: true, i: true, m: false, s: false },
      sample: 'Contact support@example.com or sales@corp.org',
    },
    {
      label: 'URL',
      p: '(?<protocol>https?)://(?<domain>[a-zA-Z0-9.-]+)(?<path>/[^\\s]*)?',
      f: { g: true, i: true, m: false, s: false },
      sample: 'Visit https://github.com or http://localhost:8080/api',
    },
    {
      label: 'Date (YYYY-MM-DD)',
      p: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})',
      f: { g: true, i: false, m: false, s: false },
      sample: 'Created on 2026-10-31 and updated on 2026-11-05',
    },
    {
      label: 'Hex Color',
      p: '#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b',
      f: { g: true, i: false, m: false, s: false },
      sample: 'Colors: #4f46e5, #ffffff, and 000',
    },
  ];

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ pattern, flags: currentFlags, testText }}
    >
      <div className="flex flex-col gap-5 max-w-6xl mx-auto w-full">
        {/* Presets Bar */}
        <div className="flex items-center gap-2 overflow-x-auto p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Common Patterns:
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => {
                setPattern(p.p);
                setFlagG(p.f.g);
                setFlagI(p.f.i);
                setFlagM(p.f.m);
                setFlagS(p.f.s);
                if (p.sample) setTestText(p.sample);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white font-medium whitespace-nowrap transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Hero Pattern Editor Bar */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <SearchCode className="w-4 h-4 text-indigo-600" />
                <span>Regular Expression Pattern</span>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-6 text-xs text-slate-500 hover:text-indigo-600 gap-1 px-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Regex</span>
              </Button>
            </div>

            <div className="flex items-center rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 overflow-hidden shadow-2xs">
              <span className="px-3 text-slate-400 font-mono text-base font-bold select-none">
                /
              </span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern here..."
                className="w-full py-2.5 font-mono text-sm text-slate-900 bg-transparent focus:outline-none"
              />
              <span className="px-3 text-slate-400 font-mono text-base font-bold select-none">
                /
              </span>

              {/* Flags Selector Toggles */}
              <div className="flex items-center gap-1 pr-2 border-l border-slate-200 pl-2">
                {[
                  { label: 'g', state: flagG, set: setFlagG, title: 'Global match' },
                  { label: 'i', state: flagI, set: setFlagI, title: 'Case insensitive' },
                  { label: 'm', state: flagM, set: setFlagM, title: 'Multiline' },
                  { label: 's', state: flagS, set: setFlagS, title: 'Dot matches newline (dotAll)' },
                ].map((flg) => (
                  <button
                    key={flg.label}
                    type="button"
                    onClick={() => flg.set(!flg.state)}
                    title={flg.title}
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      flg.state
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {flg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Syntax Error Notice */}
          {!output.isValid && output.error && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-rose-900">Invalid RegEx Syntax</span>
                <p className="font-mono text-rose-700">{output.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Split View: Test Text & Real-Time Highlight Matcher */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">Test String / Input Text</label>
              <span className="text-slate-400 font-mono text-[11px]">
                {testText.length} chars
              </span>
            </div>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter sample text to test against..."
              rows={8}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Match Highlight Preview</span>
                <Badge
                  variant={output.matchCount > 0 ? 'success' : 'neutral'}
                  className="text-[10px] px-2 py-0.5"
                >
                  {output.matchCount} match{output.matchCount === 1 ? '' : 'es'}
                </Badge>
              </label>
            </div>

            <div className="p-3 font-mono text-xs rounded-xl bg-white border border-slate-200 text-slate-800 h-44 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed shadow-2xs">
              {output.highlightedSegments.map((seg, idx) =>
                seg.isMatch ? (
                  <mark
                    key={idx}
                    className="bg-amber-200 text-amber-950 font-bold px-1 py-0.5 rounded shadow-2xs mx-0.5"
                    title={`Match #${seg.matchIndex}`}
                  >
                    {seg.text}
                  </mark>
                ) : (
                  <span key={idx}>{seg.text}</span>
                )
              )}
            </div>
          </div>
        </div>

        {/* Capture Groups Table */}
        {output.matches.length > 0 && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                <span>Extracted Matches & Capture Groups</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {output.matches.length} record{output.matches.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2 px-3 w-16">#</th>
                    <th className="py-2 px-3">Full Match</th>
                    <th className="py-2 px-3">Capture Groups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {output.matches.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3 font-bold text-indigo-600">{idx + 1}</td>
                      <td className="py-2 px-3 text-slate-900 font-semibold">{m.match}</td>
                      <td className="py-2 px-3">
                        {m.groups.length === 0 ? (
                          <span className="text-slate-400 text-[11px]">No capture groups</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {m.groups.map((grp, gIdx) => (
                              <span
                                key={gIdx}
                                className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px]"
                              >
                                {grp.name ? `${grp.name}: ` : `$${grp.index}: `}
                                <strong>{grp.value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Proprietary server logs, API responses, and sensitive production data tested in this evaluator never leave your browser.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
