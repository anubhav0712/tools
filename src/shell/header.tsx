import React from 'react';
import { Wrench, ShieldCheck, Search, Github } from 'lucide-react';

export interface HeaderProps {
  onOpenSearch: () => void;
  onHomeClick: () => void;
  currentToolName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onHomeClick,
  currentToolName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Tools
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                  100% Private
                </span>
              </div>
            </div>
          </button>

          {currentToolName && (
            <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
              <span>/</span>
              <span className="text-slate-700 font-medium truncate max-w-xs">{currentToolName}</span>
            </div>
          )}
        </div>

        {/* Center Search / Command Trigger */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs transition-colors cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search all tools, everyday utilities, formats...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Cloud • In-Browser</span>
          </div>

          <a
            href="https://github.com/anubhav0712/tools"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
