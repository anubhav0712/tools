import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Table as TableIcon,
  Code2,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { Badge } from '../../design-system/badge';
import { CodeEditor } from '../../design-system/code-editor';
import { executeJwtInspector } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { JwtInspectorInput, JwtInspectorOutput } from './definition';

export const JwtInspectorUI: React.FC<ToolComponentProps<JwtInspectorInput, JwtInspectorOutput>> = ({
  tool,
  initialInput,
}) => {
  const [token, setToken] = useState<string>(
    initialInput?.token ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFuZHLDqSBEZXZlbG9wZXIiLCJlbWFpbCI6ImFuZHJlQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sImlhdCI6MTc2MTgwMDAwMCwiZXhwIjoyNTIwMDAwMDAwfQ.signature_placeholder_sample'
  );
  const [viewTab, setViewTab] = useState<'claims' | 'payload' | 'header'>('claims');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number>(0);
  const [output, setOutput] = useState<JwtInspectorOutput>(() => executeJwtInspector({ token }));

  useEffect(() => {
    const start = performance.now();
    const res = executeJwtInspector({ token });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [token]);

  const handleCopy = async (val: string, keyName: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleClear = () => {
    setToken('');
  };

  const handleLoadPreset = (index: number) => {
    const ex = tool.examples?.[index];
    if (ex) {
      setToken(ex.input.token);
    }
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleClear}
      executionTimeMs={execTime}
      inputData={{ token }}
    >
      <div className="flex flex-col gap-5">
        {/* Presets and Status Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-500">Presets:</span>
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

          <div className="flex items-center gap-2">
            {token && output.isValid && (
              output.expiresAt ? (
                output.isExpired ? (
                  <Badge variant="danger" className="gap-1 px-2.5 py-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{output.timeUntilExpiry || 'Expired'}</span>
                  </Badge>
                ) : (
                  <Badge variant="success" className="gap-1 px-2.5 py-1 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{output.timeUntilExpiry || 'Active'}</span>
                  </Badge>
                )
              ) : (
                <Badge variant="neutral" className="gap-1 px-2.5 py-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>No Expiry Set</span>
                </Badge>
              )
            )}

            {token && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-xs text-slate-500 hover:text-rose-600 h-7 px-2 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </Button>
            )}
          </div>
        </div>

        {/* Error Notice */}
        {!output.isValid && output.error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-rose-900">Malformed JWT Token</span>
              <p className="font-mono text-rose-700">{output.error}</p>
            </div>
          </div>
        )}

        {/* Main Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Raw Encoded Token Input */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Encoded Token (header.payload.signature)</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {token.length} chars
              </span>
            </div>

            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste Bearer or JWT token here..."
              rows={12}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>100% Private Sandbox:</strong> This token is parsed strictly in your browser. It is never logged, never transmitted over the network, and excluded from URL hashes.
              </span>
            </div>
          </div>

          {/* Right Column: Decoded Payload & Claims */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* View Sub-tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewTab('claims')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    viewTab === 'claims'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Claims Table ({output.claimsTable.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab('payload')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    viewTab === 'payload'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Payload JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewTab('header')}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    viewTab === 'header'
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Header</span>
                </button>
              </div>

              {output.algorithm && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Alg: {output.algorithm}
                </span>
              )}
            </div>

            {/* Sub-tab 1: Claims Table */}
            {viewTab === 'claims' && (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {output.claimsTable.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No claims to display. Paste a valid JWT to view parsed claims.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                        <tr>
                          <th className="py-2.5 px-3">Claim (Key)</th>
                          <th className="py-2.5 px-3">Decoded Value</th>
                          <th className="py-2.5 px-3 hidden sm:table-cell">RFC / Purpose</th>
                          <th className="py-2.5 px-3 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {output.claimsTable.map((claim) => {
                          const displayVal =
                            typeof claim.value === 'object'
                              ? JSON.stringify(claim.value)
                              : String(claim.value);

                          return (
                            <tr key={claim.key} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600">
                                {claim.key}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-800 break-all max-w-xs">
                                {displayVal}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 hidden sm:table-cell">
                                {claim.description}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(displayVal, claim.key)}
                                  className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-600"
                                >
                                  {copiedKey === claim.key ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 2: Payload JSON */}
            {viewTab === 'payload' && (
              <CodeEditor
                label="Decoded Payload JSON"
                value={JSON.stringify(output.payload, null, 2)}
                readOnly
                filename="payload.json"
                height="h-80"
              />
            )}

            {/* Sub-tab 3: Header JSON */}
            {viewTab === 'header' && (
              <CodeEditor
                label="Decoded Header JSON"
                value={JSON.stringify(output.header, null, 2)}
                readOnly
                filename="header.json"
                height="h-80"
              />
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
