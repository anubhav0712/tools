import React, { useState } from 'react';
import {
  Search,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Braces,
} from 'lucide-react';
import { Badge } from '../design-system/badge';
import type { ToolDefinition } from '../core/types';

export interface CatalogGridProps {
  tools: ToolDefinition[];
  onSelectTool: (toolId: string) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ tools, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mcpOnly, setMcpOnly] = useState<boolean>(false);

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Tools' },
    { id: 'developer', label: 'Developer' },
    { id: 'data', label: 'Data & Formats' },
    { id: 'crypto', label: 'Crypto & Hash' },
    { id: 'text', label: 'Text & Regex' },
    { id: 'converter', label: 'Converters' },
  ];

  const filteredTools = tools.filter((tool) => {
    if (mcpOnly && !tool.agent.mcp) return false;
    if (selectedCategory !== 'all' && tool.metadata.category !== selectedCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = tool.metadata.name.toLowerCase().includes(q);
    const matchDesc = tool.metadata.description.toLowerCase().includes(q);
    const matchKeywords = tool.metadata.keywords.some((k) => k.toLowerCase().includes(q));
    return matchName || matchDesc || matchKeywords;
  });

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full py-6">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-4 py-8 px-4 rounded-3xl bg-gradient-to-b from-indigo-950/20 via-slate-900/40 to-transparent border border-slate-800/60">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs font-medium text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pure Client-Side Architecture • Zero Cloud Egress</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl leading-tight">
          Specialized Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Humans & AI Agents</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
          High-performance developer and data utilities that run 100% inside your browser. No servers, no tracking, complete privacy, and agent-ready contracts.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Offline Capable</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>MCP Schema Export</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Web Worker Accelerated</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & MCP Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center gap-2 text-xs text-slate-400 hover:text-white cursor-pointer select-none whitespace-nowrap">
            <input
              type="checkbox"
              checked={mcpOnly}
              onChange={(e) => setMcpOnly(e.target.checked)}
              className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
            />
            <span className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              MCP Ready Only
            </span>
          </label>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
          <p className="text-sm text-slate-400">No tools found matching your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.metadata.id}
              onClick={() => onSelectTool(tool.metadata.id)}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-slate-900 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-indigo-950/20"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Braces className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {tool.agent.mcp ? (
                      <Badge variant="agent">
                        <Bot className="w-3 h-3 text-purple-400" />
                        <span>MCP</span>
                      </Badge>
                    ) : (
                      <Badge variant="gui">
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        <span>GUI</span>
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base text-white group-hover:text-indigo-300 transition-colors">
                    {tool.metadata.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.metadata.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize font-mono text-[11px] text-slate-400">
                  {tool.metadata.category}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Open Tool
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
