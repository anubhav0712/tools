import React, { useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Sparkles,
  ShieldCheck,
  Check,
  RotateCcw,
  Share2,
  Terminal,
  X,
  Copy,
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import type { ToolDefinition } from '../core/types';

export interface ToolShellProps {
  tool: ToolDefinition;
  onBack?: () => void;
  onReset?: () => void;
  executionTimeMs?: number;
  outputData?: unknown;
  inputData?: unknown;
  children: React.ReactNode;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  onBack,
  onReset,
  executionTimeMs,
  outputData,
  inputData,
  children,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [copiedModalJson, setCopiedModalJson] = useState(false);

  const handleShareUrl = async () => {
    let url = window.location.href;
    if (inputData && tool.agent.deepLink !== false) {
      const serialized = encodeURIComponent(JSON.stringify(inputData));
      url = `${window.location.origin}${window.location.pathname}#tool=${tool.metadata.id}&input=${serialized}`;
    }
    await navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleCopyAgentContext = async () => {
    const payload = {
      tool: tool.metadata.id,
      name: tool.metadata.name,
      description: tool.metadata.description,
      input: inputData,
      output: outputData,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedModalJson(true);
    setTimeout(() => setCopiedModalJson(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-4">
        {onBack && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-400 hover:text-white -ml-2 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all tools</span>
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {tool.metadata.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                v{tool.metadata.version}
              </span>
              <Badge variant="default" className="capitalize">
                {tool.metadata.category}
              </Badge>
              {tool.agent.mcp ? (
                <button
                  type="button"
                  onClick={() => setShowAgentModal(true)}
                  title="Click to view MCP & API spec"
                  className="cursor-pointer transition-opacity hover:opacity-80"
                >
                  <Badge variant="agent">
                    <Bot className="w-3 h-3 text-purple-400" />
                    <span>MCP Ready</span>
                  </Badge>
                </button>
              ) : (
                <Badge variant="gui">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Interactive GUI</span>
                </Badge>
              )}
              <Badge variant="default" className="text-emerald-400/90 border-emerald-900/50">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>100% Local</span>
              </Badge>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              {tool.metadata.description}
            </p>
          </div>

          {/* Action Bar (Focused on human user workflow) */}
          <div className="flex items-center gap-2 flex-wrap">
            {tool.agent.deepLink !== false && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShareUrl}
                title="Copy shareable link with current input"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Link Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share URL</span>
                  </>
                )}
              </Button>
            )}

            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                title="Reset input and output"
                className="text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-col gap-6">{children}</div>

      {/* Tool Status & Privacy Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Privacy Guaranteed: Processed 100% locally in browser</span>
          {typeof executionTimeMs === 'number' && (
            <>
              <span className="text-slate-700">•</span>
              <span className="font-mono text-slate-400">
                {executionTimeMs.toFixed(2)}ms
              </span>
            </>
          )}
        </div>

        {tool.agent.mcp && (
          <button
            type="button"
            onClick={() => setShowAgentModal(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-purple-300 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer / Agent Spec</span>
          </button>
        )}
      </div>

      {/* Developer & Agent Spec Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-sm text-white">
                  Agent & Developer Spec: {tool.metadata.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAgentModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs text-slate-300 max-h-[70vh] overflow-y-auto">
              <div>
                <span className="text-slate-400 font-medium">Tool ID:</span>
                <code className="ml-2 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-purple-300">
                  {tool.metadata.id}
                </code>
              </div>

              {tool.agent.agentPrompt && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-1">Agent Instructions:</span>
                  <p>{tool.agent.agentPrompt}</p>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-400 block mb-1">Local MCP Server Invocation:</span>
                <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto">
{`npx tsx scripts/mcp-server.ts`}
                </pre>
              </div>

              {Boolean(inputData || outputData) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-400">Current Payload (JSON):</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyAgentContext}
                      className="text-xs h-6 px-2 text-purple-300 gap-1"
                    >
                      {copiedModalJson ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Payload</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-800 overflow-x-auto max-h-48">
                    {JSON.stringify({ input: inputData, output: outputData }, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-slate-950/40">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAgentModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
