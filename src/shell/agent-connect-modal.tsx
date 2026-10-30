import React, { useState } from 'react';
import {
  Bot,
  Check,
  Copy,
  X,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../design-system/button';
import type { ToolDefinition } from '../core/types';

export interface AgentConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolDefinition[];
}

export const AgentConnectModal: React.FC<AgentConnectModalProps> = ({
  isOpen,
  onClose,
  tools,
}) => {
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'npx'>('claude');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const mcpTools = tools.filter((t) => t.agent.mcp);

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        'tools-suite': {
          command: 'npx',
          args: ['-y', 'tools-mcp'],
        },
      },
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      name: 'tools-suite',
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'tools-mcp'],
    },
    null,
    2
  );

  const npxCommand = 'npx -y tools-mcp';

  const getCopyContent = () => {
    if (activeTab === 'claude') return claudeConfig;
    if (activeTab === 'cursor') return cursorConfig;
    return npxCommand;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCopyContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-white">Connect to AI Agents</h2>
              <p className="text-xs text-slate-400">
                Plug all {mcpTools.length} local tools directly into Claude, Cursor, or any MCP client
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* Privacy Guarantee Pill */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              <strong>Zero cloud transmission:</strong> The tools execute 100% locally on your machine over stdio.
            </span>
          </div>

          {/* Client Selection Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'claude', label: 'Claude Desktop' },
              { id: 'cursor', label: 'Cursor / Windsurf' },
              { id: 'npx', label: 'Direct CLI' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-950 text-purple-200 border border-purple-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Setup Instructions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              {activeTab === 'claude' && (
                <span>
                  Add to <code className="font-mono text-purple-300">claude_desktop_config.json</code>:
                </span>
              )}
              {activeTab === 'cursor' && (
                <span>
                  Add to Cursor Settings &gt; Features &gt; MCP:
                </span>
              )}
              {activeTab === 'npx' && (
                <span>Run in your terminal or agent script:</span>
              )}

              <Button
                variant="agent"
                size="sm"
                onClick={handleCopy}
                className="h-7 text-xs px-2.5 gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Config</span>
                  </>
                )}
              </Button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed">
              {getCopyContent()}
            </pre>
          </div>

          {/* Included Tools Checklist */}
          <div className="flex flex-col gap-2.5 pt-2">
            <span className="text-xs font-semibold text-slate-300">
              Tools available to your agent ({mcpTools.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mcpTools.map((t) => (
                <div
                  key={t.metadata.id}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white">{t.metadata.name}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {t.metadata.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 text-xs">
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noreferrer"
            className="text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <span>Learn about Model Context Protocol</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
