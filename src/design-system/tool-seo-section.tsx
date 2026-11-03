import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Compass,
  FileText,
  Search,
  Sparkles,
  Scale,
  Code2,
  Check,
  Copy,
} from 'lucide-react';
import type { ToolDefinition } from '../core/types';
import { TOOL_SEO_DATA } from '../core/seo-data';
import { registry } from '../core/registry';
import { getToolUrl } from '../core/url-state';

/* =========================================================================
   1. HOW TO USE TAB COMPONENT
   ========================================================================= */

export interface ToolGuideTabProps {
  tool: ToolDefinition;
  onSwitchToTool?: () => void;
}

export const ToolGuideTab: React.FC<ToolGuideTabProps> = ({ tool, onSwitchToTool }) => {
  const seoConfig = TOOL_SEO_DATA[tool.metadata.id];
  const steps = seoConfig?.howToUse || [
    'Enter or paste your input into the workspace editor.',
    'Adjust options and configuration settings as needed.',
    'Review the calculated output and statistics in real-time.',
    'Copy or export the generated results directly to your clipboard or file.',
  ];

  const examples = tool.examples || [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      {/* Intro Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-slate-50 to-emerald-50/80 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900">
              How to Use {tool.metadata.name}
            </h3>
            <p className="text-xs text-slate-600">
              Follow this step-by-step walkthrough to get the most accurate and efficient results.
            </p>
          </div>
        </div>

        {onSwitchToTool && (
          <button
            type="button"
            onClick={onSwitchToTool}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Open Tool Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Step-by-Step Grid */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Step-by-Step Instructions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col gap-2 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-[10px] font-mono font-semibold text-slate-400">
                  STEP {idx + 1}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Input Examples & Presets (if available) */}
      {examples.length > 0 && (
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sample Inputs & Presets
            </h4>
            <span className="text-xs text-slate-500">
              {examples.length} {examples.length === 1 ? 'example' : 'examples'} available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((eg, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{eg.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      Preset {idx + 1}
                    </span>
                  </div>
                  {eg.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {eg.description}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto max-h-36 scrollbar-thin">
                  <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap break-all">
                    {typeof eg.input === 'string'
                      ? eg.input
                      : JSON.stringify(eg.input, null, 2)}
                  </pre>
                </div>

                {onSwitchToTool && (
                  <button
                    type="button"
                    onClick={onSwitchToTool}
                    className="self-end text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Use in tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Tips & Privacy Card */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 leading-relaxed">
          <span className="font-semibold text-slate-900">Privacy & Performance Tip</span>
          <p>
            Because all processing executes strictly in your browser memory, you can safely use this tool with sensitive customer credentials, private keys, financial statements, and confidential records with zero risk of exposure.
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   2. DOCUMENTATION & METHODOLOGY TAB COMPONENT
   ========================================================================= */

export interface ToolDocsTabProps {
  tool: ToolDefinition;
  documentation?: React.ReactNode;
}

export const ToolDocsTab: React.FC<ToolDocsTabProps> = ({ tool, documentation }) => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const handleCopyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const policy = tool.metadata.reviewPolicy;
  const formulaCitations = tool.metadata.formulaCitations || [];
  const parameters = tool.metadata.parameters;
  const paramEntries = parameters ? Object.entries(parameters) : [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      {/* Custom Documentation (if provided by tool) */}
      {documentation && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <FileText className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Technical Documentation & Guide
            </h3>
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
            {documentation}
          </div>
        </div>
      )}

      {/* Mathematical Formulas & Methodology */}
      {formulaCitations.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Calculator className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Mathematical Formulas & Calculation Engine
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formulaCitations.map((fc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2.5 justify-between"
              >
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{fc.name}</h4>
                  <div className="group relative p-3 rounded-xl bg-slate-50 font-mono text-xs text-indigo-900 border border-slate-200 overflow-x-auto flex items-center justify-between gap-2">
                    <span className="select-all">{fc.formula}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyFormula(fc.formula)}
                      title="Copy formula"
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition shrink-0 cursor-pointer"
                    >
                      {copiedFormula === fc.formula ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {fc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regulatory Standards & Compliance Audit Schedule */}
      {policy && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-indigo-700">
              <Scale className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Regulatory & Standards Governance
              </h3>
            </div>
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                policy.cadence === 'immutable'
                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              Cadence: {policy.cadence.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Governing Body / Law</span>
              <span className="font-semibold text-slate-900">{policy.governingBodyOrStandard}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Last Verified</span>
              <span className="font-mono font-semibold text-slate-900">{policy.lastReviewedDate}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Next Scheduled Audit</span>
              <span className="font-mono font-semibold text-slate-900">{policy.nextReviewDate || 'N/A (Immutable)'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1">
              <span className="text-[10px] font-mono uppercase text-slate-400">Change Risk Level</span>
              <span className={`font-semibold capitalize ${
                policy.changeRisk === 'high'
                  ? 'text-rose-600'
                  : policy.changeRisk === 'medium'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}>
                {policy.changeRisk} Risk
              </span>
            </div>
          </div>

          {policy.notes && (
            <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              <strong className="text-slate-700">Governance Notes:</strong> {policy.notes}
            </p>
          )}
        </div>
      )}

      {/* Parameter Reference Dictionary (if defined) */}
      {paramEntries.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Code2 className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Parameter Specification Dictionary
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Parameter</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Unit</th>
                  <th className="py-2.5 px-4 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paramEntries.map(([key, schema]) => (
                  <tr key={key} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">
                      {schema.label || key}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {schema.dataType}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">
                      {schema.unit || 'none'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 leading-relaxed">
                      {schema.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Zero-Egress Privacy Verification */}
      <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3.5 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 leading-relaxed">
          <span className="font-bold text-emerald-950">Zero-Egress In-Browser Architecture</span>
          <p>
            This tool executes 100% within your client browser. There are no backend database writes, no cloud analytics trackers (no Google Analytics, no telemetry), and inputs never traverse the public internet.
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   3. FAQS TAB COMPONENT
   ========================================================================= */

export interface ToolFaqTabProps {
  tool: ToolDefinition;
}

export const ToolFaqTab: React.FC<ToolFaqTabProps> = ({ tool }) => {
  const seoConfig = TOOL_SEO_DATA[tool.metadata.id];
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndices, setOpenIndices] = useState<Record<number, boolean>>({ 0: true });

  const rawFaqs = seoConfig?.faqs || [];

  // Always append the universal privacy FAQ if not already present
  const allFaqs = useMemo(() => {
    const list = [...rawFaqs];
    const hasPrivacyFaq = list.some((f) =>
      f.question.toLowerCase().includes('private') || f.question.toLowerCase().includes('server')
    );
    if (!hasPrivacyFaq) {
      list.push({
        question: `Is my data saved or uploaded to an external server when using ${tool.metadata.name}?`,
        answer: `No. All calculations, formatting, and operations execute entirely in your local browser sandbox memory. Zero data is ever sent across the network or stored on third-party servers.`,
      });
    }
    return list;
  }, [rawFaqs, tool.metadata.name]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return allFaqs;
    const q = searchQuery.toLowerCase().trim();
    return allFaqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    );
  }, [allFaqs, searchQuery]);

  const toggleFaq = (idx: number) => {
    setOpenIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    const next: Record<number, boolean> = {};
    filteredFaqs.forEach((_, i) => (next[i] = true));
    setOpenIndices(next);
  };

  const collapseAll = () => {
    setOpenIndices({});
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header & Search Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-slate-500">
              Answers to common operational, technical, and privacy questions.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
            >
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500">
              No questions found matching &ldquo;{searchQuery}&rdquo;.
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = Boolean(openIndices[idx]);
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/70 transition-colors gap-3"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4.5 pb-4.5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* =========================================================================
   4. RELATED TOOLS SECTION (FOOTER CROSS-LINKING)
   ========================================================================= */

export interface ToolRelatedSectionProps {
  tool: ToolDefinition;
  onSelectTool?: (toolId: string) => void;
}

export const ToolRelatedSection: React.FC<ToolRelatedSectionProps> = ({
  tool,
  onSelectTool,
}) => {
  const seoConfig = TOOL_SEO_DATA[tool.metadata.id];
  const relatedTools = (seoConfig?.relatedToolIds || [])
    .map((id) => registry.get(id))
    .filter((t): t is ToolDefinition => Boolean(t));

  if (relatedTools.length === 0) return null;

  return (
    <div className="pt-8 border-t border-slate-200 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-700">
          <Compass className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Explore Related Utilities
          </h3>
        </div>
        <span className="text-xs text-slate-400">100% Client-Side Suite</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
              className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition flex flex-col justify-between gap-3 group cursor-pointer"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono capitalize">
                    {relTool.metadata.category}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {relTool.metadata.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {relTool.metadata.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================================
   5. BACKWARDS-COMPATIBLE WRAPPER
   ========================================================================= */

export const ToolSeoSection: React.FC<ToolRelatedSectionProps> = ({
  tool,
  onSelectTool,
}) => {
  return <ToolRelatedSection tool={tool} onSelectTool={onSelectTool} />;
};
