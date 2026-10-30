import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Wrench,
} from 'lucide-react';
import type { ToolDefinition } from '../core/types';

export interface CatalogGridProps {
  tools: ToolDefinition[];
  onSelectTool: (toolId: string) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ tools, onSelectTool }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Tools' },
    { id: 'text', label: 'Text & Writing' },
    { id: 'converter', label: 'Converters' },
    { id: 'developer', label: 'Developer & Data' },
  ];

  const filteredTools = tools.filter((tool) => {
    if (selectedCategory !== 'all' && tool.metadata.category !== selectedCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = tool.metadata.name.toLowerCase().includes(q);
    const matchDesc = tool.metadata.description.toLowerCase().includes(q);
    const matchKeywords = tool.metadata.keywords.some((k) => k.toLowerCase().includes(q));
    return matchName || matchDesc || matchKeywords;
  });

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-7xl mx-auto w-full py-4 sm:py-6">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-3 sm:gap-4 py-8 sm:py-12 px-4 rounded-3xl bg-gradient-to-b from-indigo-50/70 via-white to-white border border-indigo-100/80 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-200/80 text-xs font-medium text-indigo-700 shadow-2xs">
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Runs 100% on your device • Zero cloud upload</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl leading-tight">
          Fast, Free & Completely <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Private Online Tools</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Everyday utilities, text formatters, converters, and developer tools that run entirely in your browser. No files leave your computer.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Privacy Guaranteed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Works Completely Offline</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs"
          />
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm text-slate-500">No tools found matching your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.metadata.id}
              onClick={() => onSelectTool(tool.metadata.id)}
              className="group flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer shadow-xs"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono capitalize">
                    {tool.metadata.category}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {tool.metadata.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tool.metadata.description}
                  </p>
                </div>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px] text-slate-400">
                  v{tool.metadata.version}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
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
