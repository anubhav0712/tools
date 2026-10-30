import React, { useState, useEffect } from 'react';
import { registry } from './core/registry';
import { parseUrlState, setUrlTool } from './core/url-state';
import { Header } from './shell/header';
import { CatalogGrid } from './shell/catalog-grid';
import { CommandPalette } from './shell/command-palette';
// Import tools to ensure they are registered
import './tools';

export const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [initialInput, setInitialInput] = useState<unknown>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Synchronize state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const { toolId, initialInput: input } = parseUrlState();
      setActiveToolId(toolId || null);
      setInitialInput(input);
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTool = (id: string) => {
    setActiveToolId(id);
    setUrlTool(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    setActiveToolId(null);
    setUrlTool(null);
  };

  const activeTool = activeToolId ? registry.get(activeToolId) : undefined;
  const allTools = registry.getAll();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onHomeClick={handleHomeClick}
        currentToolName={activeTool?.metadata.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTool ? (
          <activeTool.Component
            tool={activeTool}
            initialInput={initialInput}
          />
        ) : (
          <CatalogGrid
            tools={allTools}
            onSelectTool={handleSelectTool}
          />
        )}
      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tools={allTools}
        onSelectTool={handleSelectTool}
      />

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Tools Suite — 100% Client-Side Execution. Zero cloud servers. Total data privacy.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              type="button"
              onClick={() => {
                const json = JSON.stringify(registry.getMcpReady().map((t) => ({ id: t.metadata.id, description: t.metadata.description })), null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mcp-tools.json';
                a.click();
              }}
              className="hover:text-indigo-400 transition-colors"
            >
              Export MCP Manifest
            </button>
            <span>•</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
