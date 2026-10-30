import React, { useState, useRef, useEffect } from 'react';
import { Wrench, Search, Github, ChevronDown, Check } from 'lucide-react';
import { useRegion } from '../core/locale-context';
import { REGIONS, RegionCode } from '../core/locale';

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
  const { region, setRegion } = useRegion();
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRegion = REGIONS[region];

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
            <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              Tools
            </span>
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
              <span>Search all tools, finance calculators, formats...</span>
            </div>
            <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-500 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Region / Currency Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer shadow-2xs"
              title="Change country / currency rules"
            >
              <span>{currentRegion.flag}</span>
              <span className="font-semibold">{currentRegion.currency}</span>
              <span className="text-slate-400">({currentRegion.currencySymbol})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isRegionOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 text-xs animate-in fade-in duration-100">
                <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Region & Currency
                </div>
                {(Object.keys(REGIONS) as RegionCode[]).map((code) => {
                  const r = REGIONS[code];
                  const isSelected = r.code === region;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setRegion(code);
                        setIsRegionOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{r.flag}</span>
                        <span>{r.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

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
