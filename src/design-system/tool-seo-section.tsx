import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Compass,
} from 'lucide-react';
import type { ToolDefinition } from '../core/types';
import { TOOL_SEO_DATA } from '../core/seo-data';
import { registry } from '../core/registry';
import { getToolUrl } from '../core/url-state';

export interface ToolSeoSectionProps {
  tool: ToolDefinition;
  onSelectTool?: (toolId: string) => void;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({ tool, onSelectTool }) => {
  const seoConfig = TOOL_SEO_DATA[tool.metadata.id];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const relatedTools = (seoConfig?.relatedToolIds || [])
    .map((id) => registry.get(id))
    .filter((t): t is ToolDefinition => Boolean(t));

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 flex flex-col gap-10 text-slate-800">
      {/* 1. Value Proposition Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900">
              100% In-Browser & Private Execution
            </h3>
            <p className="text-xs text-slate-600">
              This utility processes data entirely inside your device's browser memory. Zero network calls, zero data logging.
            </p>
          </div>
        </div>
      </div>

      {/* 2. How to Use & Instructions */}
      {seoConfig?.howToUse && seoConfig.howToUse.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <BookOpen className="w-4 h-4" />
            <h2 className="text-base font-bold text-slate-900">
              How to Use {tool.metadata.name}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {seoConfig.howToUse.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-1.5"
              >
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Step {idx + 1}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Formulas & Regulatory Standards (if available) */}
      {tool.metadata.formulaCitations && tool.metadata.formulaCitations.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Calculator className="w-4 h-4" />
            <h2 className="text-base font-bold text-slate-900">
              Mathematical Formulas & Methodology
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.metadata.formulaCitations.map((fc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2"
              >
                <h4 className="text-xs font-bold text-slate-900">{fc.name}</h4>
                <div className="p-2.5 rounded-lg bg-slate-50 font-mono text-xs text-indigo-900 border border-slate-200 overflow-x-auto">
                  {fc.formula}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {fc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Frequently Asked Questions (FAQ) */}
      {seoConfig?.faqs && seoConfig.faqs.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <HelpCircle className="w-4 h-4" />
            <h2 className="text-base font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {seoConfig.faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-slate-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Related Tools (Topical Silo Cross-Linking) */}
      {relatedTools.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Compass className="w-4 h-4" />
            <h2 className="text-base font-bold text-slate-900">
              Explore Related Tools
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {relatedTools.map((relTool) => {
              const href = getToolUrl(relTool.metadata.id);
              return (
                <a
                  key={relTool.metadata.id}
                  href={href}
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey && onSelectTool) {
                      e.preventDefault();
                      onSelectTool(relTool.metadata.id);
                    }
                  }}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between gap-2 group cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {relTool.metadata.name}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {relTool.metadata.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform pt-1">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
