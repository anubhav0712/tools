import React, { useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Sparkles,
  ShieldCheck,
  Check,
  RotateCcw,
  Code2,
  Share2,
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
  const [copiedAgent, setCopiedAgent] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showMcpSchema, setShowMcpSchema] = useState(false);

  const handleCopyAgentContext = async () => {
    const payload = {
      tool: tool.metadata.id,
      name: tool.metadata.name,
      description: tool.metadata.description,
      input: inputData,
      output: outputData,
    };
    const markdownContext = [
      `### Tool Context: ${tool.metadata.name}`,
      `*Description*: ${tool.metadata.description}`,
      '```json',
      JSON.stringify(payload, null, 2),
      '```',
    ].join('\n');

    await navigator.clipboard.writeText(markdownContext);
    setCopiedAgent(true);
    setTimeout(() => setCopiedAgent(false), 2000);
  };

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
                <Badge variant="agent">
                  <Bot className="w-3 h-3 text-purple-400" />
                  <span>MCP Ready</span>
                </Badge>
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

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {tool.agent.deepLink !== false && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShareUrl}
                title="Copy shareable link with input"
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

            {tool.agent.mcp && (
              <>
                <Button
                  variant="agent"
                  size="sm"
                  onClick={handleCopyAgentContext}
                  title="Copy inputs and outputs formatted as markdown context for AI agents"
                >
                  {copiedAgent ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-purple-300" />
                      <span>Copied for Agent</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-purple-300" />
                      <span>Copy for Agent</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowMcpSchema(!showMcpSchema)}
                  title="View MCP Tool Schema definition"
                >
                  <Code2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>MCP Schema</span>
                </Button>
              </>
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

      {/* MCP Schema Drawer / Modal View */}
      {showMcpSchema && tool.agent.mcp && (
        <div className="p-4 rounded-xl border border-purple-900/60 bg-purple-950/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              MCP Tool Definition ({tool.metadata.id})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMcpSchema(false)}
              className="text-xs text-purple-300 hover:text-white h-6 px-2"
            >
              Close
            </Button>
          </div>
          <pre className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-purple-200 overflow-x-auto max-h-60 border border-purple-900/40">
            {JSON.stringify(
              {
                name: tool.metadata.id,
                description: tool.metadata.description,
                agentPrompt: tool.agent.agentPrompt,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex flex-col gap-6">{children}</div>

      {/* Tool Status Footer */}
      <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Privacy Guaranteed: Processed 100% locally in browser</span>
        </div>
        {typeof executionTimeMs === 'number' && (
          <div className="font-mono text-slate-400">
            Execution: <span className="text-slate-200">{executionTimeMs.toFixed(2)}ms</span>
          </div>
        )}
      </div>
    </div>
  );
};
