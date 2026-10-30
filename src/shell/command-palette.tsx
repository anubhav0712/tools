import React, { useEffect, useRef, useState } from 'react';
import { Search, Bot, ArrowRight, X } from 'lucide-react';
import type { ToolDefinition } from '../core/types';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tools: ToolDefinition[];
  onSelectTool: (toolId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tools,
  onSelectTool,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open through callback if needed or handle in parent
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = tools.filter((tool) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      tool.metadata.name.toLowerCase().includes(q) ||
      tool.metadata.description.toLowerCase().includes(q) ||
      tool.metadata.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-0 w-full max-w-xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm focus:outline-none"
    >
      <div className="flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a tool name, format, or keyword..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No tools matching "{query}"
            </div>
          ) : (
            filtered.map((tool) => (
              <button
                key={tool.metadata.id}
                type="button"
                onClick={() => {
                  onSelectTool(tool.metadata.id);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white group-hover:text-indigo-400">
                      {tool.metadata.name}
                    </span>
                    {tool.agent.mcp && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/50">
                        <Bot className="w-2.5 h-2.5" />
                        MCP
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 line-clamp-1">
                    {tool.metadata.description}
                  </span>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or click</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[10px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </dialog>
  );
};
