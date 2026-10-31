import React, { useState, useEffect } from 'react';
import {
  Link2,
  Copy,
  Check,
  ShieldCheck,
  Tag,
  Table as TableIcon,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeUrlInspector } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { UrlInspectorInput, UrlInspectorOutput } from './definition';

export const UrlInspectorUI: React.FC<
  ToolComponentProps<UrlInspectorInput, UrlInspectorOutput>
> = ({ tool, initialInput }) => {
  const [rawUrl, setRawUrl] = useState<string>(
    initialInput?.rawUrl ||
      'https://example.com/checkout?plan=pro&ref=twitter&utm_source=spring_sale&utm_medium=social&utm_campaign=launch_2026#pricing'
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<UrlInspectorOutput>(() =>
    executeUrlInspector({ rawUrl })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeUrlInspector({ rawUrl });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [rawUrl]);

  const handleCopy = async (val: string, keyName: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReset = () => {
    setRawUrl('');
  };

  const handleLoadPreset = (idx: number) => {
    const ex = tool.examples?.[idx];
    if (ex) {
      setRawUrl(ex.input.rawUrl);
    }
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ rawUrl }}
    >
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Presets and Controls Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Presets:</span>
            {tool.examples?.map((ex, idx) => (
              <Button
                key={ex.title}
                variant="secondary"
                size="sm"
                onClick={() => handleLoadPreset(idx)}
                className="text-xs h-7 px-2.5"
              >
                {ex.title}
              </Button>
            ))}
          </div>

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

        {/* Hero URL Input */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-indigo-600" />
            <span>Target URL or Query String</span>
          </label>
          <textarea
            value={rawUrl}
            onChange={(e) => setRawUrl(e.target.value)}
            placeholder="Paste complete URL here (e.g. https://...)..."
            rows={3}
            className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
          />
        </div>

        {/* URL Component Cards */}
        {output.isValid && (output.host || output.pathname) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Protocol
              </span>
              <span className="font-mono text-sm font-bold text-indigo-600 break-all">
                {output.protocol || 'None'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Host / Domain
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 break-all">
                {output.host || 'None'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Pathname
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 break-all">
                {output.pathname || '/'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Hash / Anchor
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 break-all">
                {output.hash || 'None'}
              </span>
            </div>
          </div>
        )}

        {/* Marketing UTM Tracking Tags (if detected) */}
        {Object.keys(output.utmTags).length > 0 && (
          <div className="p-5 rounded-3xl bg-indigo-50/70 border border-indigo-100 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">
                Detected Marketing & Campaign Tags (UTM)
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {Object.entries(output.utmTags).map(([tagKey, tagVal]) => (
                <div
                  key={tagKey}
                  className="p-2.5 rounded-xl bg-white border border-indigo-100 text-xs flex flex-col gap-0.5"
                >
                  <span className="font-mono text-[11px] text-indigo-600 font-semibold">
                    {tagKey}
                  </span>
                  <span className="font-mono text-slate-900 font-medium break-all">
                    {tagVal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Query Parameters Table */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-indigo-600" />
              <span>Query Parameters ({output.queryParams.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Key-Value Breakdown
            </span>
          </div>

          {output.queryParams.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No query parameters found in the provided URL.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Parameter Key</th>
                    <th className="py-2.5 px-3">Decoded Value</th>
                    <th className="py-2.5 px-3 hidden sm:table-cell">Raw Encoded Value</th>
                    <th className="py-2.5 px-3 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {output.queryParams.map((param, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-bold text-indigo-600">
                        {param.key}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 break-all max-w-xs font-medium">
                        {param.decodedValue}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 break-all max-w-xs hidden sm:table-cell text-[11px]">
                        {param.rawValue}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(param.decodedValue, param.key)}
                          className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-600"
                        >
                          {copiedKey === param.key ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Encode / Decode Views */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Fully Encoded URL</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(output.encodedUrl, 'enc')}
                className="h-6 text-xs text-indigo-600 px-1.5 gap-1"
              >
                {copiedKey === 'enc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </Button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-700 break-all max-h-24 overflow-y-auto">
              {output.encodedUrl || 'Empty'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Fully Decoded URL</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(output.decodedUrl, 'dec')}
                className="h-6 text-xs text-indigo-600 px-1.5 gap-1"
              >
                {copiedKey === 'dec' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </Button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-700 break-all max-h-24 overflow-y-auto">
              {output.decodedUrl || 'Empty'}
            </div>
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Sensitive session tokens, internal staging domains, and OAuth callback secrets in your query parameters are parsed purely on your client device.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
