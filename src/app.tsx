import React, { useState, useEffect } from 'react';
import { registry } from './core/registry';
import { parseUrlState, setUrlTool } from './core/url-state';
import { Header } from './shell/header';
import { CatalogGrid } from './shell/catalog-grid';
import { CommandPalette } from './shell/command-palette';
import { ErrorBoundary } from './design-system/error-boundary';
import { FinancialDisclaimer } from './design-system/financial-disclaimer';
// Import tools to ensure they are registered
import './tools';

export const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [initialInput, setInitialInput] = useState<unknown>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Synchronize state with URL hash & history navigation
  useEffect(() => {
    const handleNavigation = () => {
      const { toolId, initialInput: input } = parseUrlState();
      setActiveToolId(toolId || null);
      setInitialInput(input);
    };

    // Initial check
    handleNavigation();

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
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
    setInitialInput(undefined);
    setUrlTool(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    setActiveToolId(null);
    setInitialInput(undefined);
    setUrlTool(null);
  };

  const activeTool = activeToolId ? registry.get(activeToolId) : undefined;
  const allTools = registry.getAll();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        onHomeClick={handleHomeClick}
        currentToolName={activeTool?.metadata.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ErrorBoundary
          resetKeys={[activeToolId, initialInput]}
          onReset={() => setInitialInput(undefined)}
        >
          {activeTool ? (
            <activeTool.Component
              key={activeTool.metadata.id}
              tool={activeTool}
              initialInput={initialInput}
            />
          ) : (
            <CatalogGrid
              tools={allTools}
              onSelectTool={handleSelectTool}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tools={allTools}
        onSelectTool={handleSelectTool}
      />

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 font-medium">
              Tools — 100% In-Browser. Zero cloud upload. Total privacy.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <a
                href="https://github.com/anubhav0712/tools"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
              >
                GitHub Repository
              </a>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 text-center sm:text-left">
            <FinancialDisclaimer variant="footer" />
          </div>
        </div>
      </footer>
    </div>
  );
};
