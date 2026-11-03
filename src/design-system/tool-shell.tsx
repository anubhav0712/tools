import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  RotateCcw,
  Share2,
  BookOpen,
  Sliders,
  Wrench,
  Copy,
  X,
  FileText,
  HelpCircle,
  Calculator,
  Binary,
  Sparkles,
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import type { ToolDefinition } from '../core/types';
import {
  ToolGuideTab,
  ToolDocsTab,
  ToolFaqTab,
  ToolRelatedSection,
} from './tool-seo-section';
import { getToolUrl, getBaseBasePath } from '../core/url-state';
import { TOOL_SEO_DATA } from '../core/seo-data';

export type ToolShellTab = 'tool' | 'guide' | 'docs' | 'faqs' | 'settings';

export interface ToolShellProps {
  tool: ToolDefinition;
  onBack?: () => void;
  onReset?: () => void;
  onSelectTool?: (toolId: string) => void;
  executionTimeMs?: number;
  inputData?: unknown;
  documentation?: React.ReactNode;
  advancedSettings?: React.ReactNode;
  children: React.ReactNode;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  onBack,
  onReset,
  onSelectTool,
  executionTimeMs: _executionTimeMs,
  inputData,
  documentation,
  advancedSettings,
  children,
}) => {
  const [activeTab, setActiveTab] = useState<ToolShellTab>('tool');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState(null, '', getBaseBasePath());
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const isPrivateTool = tool.metadata.persistableInUrl === false;

  const generateShareableUrl = (): string => {
    const origin = window.location.origin;
    const toolUrl = getToolUrl(tool.metadata.id);
    if (isPrivateTool) {
      return `${origin}${toolUrl}`;
    }
    if (inputData !== undefined && inputData !== null) {
      const serialized = encodeURIComponent(JSON.stringify(inputData));
      return `${origin}${toolUrl}?input=${serialized}`;
    }
    return `${origin}${toolUrl}`;
  };

  const handleShareUrl = async () => {
    const url = generateShareableUrl();
    setShareUrl(url);

    try {
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setIsShareModalOpen(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      setIsShareModalOpen(true);
    }
  };

  const getToolTabDetails = () => {
    switch (tool.metadata.category) {
      case 'finance':
        return { label: 'Calculator', icon: Calculator };
      case 'converter':
        return { label: 'Converter', icon: Binary };
      case 'crypto':
        return { label: 'Security Tool', icon: ShieldCheck };
      case 'text':
        return { label: 'Text Tool', icon: FileText };
      default:
        return { label: 'Workspace', icon: Wrench };
    }
  };

  const { label: toolTabLabel, icon: ToolTabIcon } = getToolTabDetails();

  const docsTabLabel = documentation
    ? 'Documentation & Guide'
    : tool.metadata.formulaCitations && tool.metadata.formulaCitations.length > 0
    ? 'Formulas & Specs'
    : 'Documentation';

  const seoConfig = TOOL_SEO_DATA[tool.metadata.id];
  const faqCount = seoConfig?.faqs?.length || 4;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-slate-500 hover:text-slate-900 -ml-2 gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all tools</span>
          </Button>

          {/* Privacy Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Runs 100% on your device</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {tool.metadata.name}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono border border-slate-200">
                v{tool.metadata.version}
              </span>
              <Badge variant="default" className="capitalize">
                {tool.metadata.category}
              </Badge>
              {tool.metadata.reviewPolicy && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border ${
                    tool.metadata.reviewPolicy.cadence === 'immutable'
                      ? 'bg-slate-50 text-slate-500 border-slate-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                  }`}
                  title={
                    tool.metadata.reviewPolicy.cadence === 'immutable'
                      ? `Immutable standard: ${tool.metadata.reviewPolicy.governingBodyOrStandard}`
                      : `Governed by ${tool.metadata.reviewPolicy.governingBodyOrStandard}. Next review: ${tool.metadata.reviewPolicy.nextReviewDate || 'Periodic'}`
                  }
                >
                  {tool.metadata.reviewPolicy.cadence === 'immutable'
                    ? 'Spec: Immutable'
                    : `Verified: ${tool.metadata.reviewPolicy.lastReviewedDate.split('-')[0]}`}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {tool.metadata.description}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShareUrl}
              title="Copy shareable link with current inputs"
              className="gap-1.5 shadow-2xs"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Share Link</span>
                </>
              )}
            </Button>

            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                title="Reset input and output"
                className="text-slate-600 hover:text-slate-900 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Unified Tab Navigation Bar */}
        <div className="flex items-center gap-1 border-b border-slate-200 -mb-2 overflow-x-auto scrollbar-none pt-1">
          {/* 1. Main Interactive Tool Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('tool')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'tool'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ToolTabIcon className="w-3.5 h-3.5" />
            <span>{toolTabLabel}</span>
          </button>

          {/* 2. How to Use & Walkthrough Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>How to Use</span>
          </button>

          {/* 3. Documentation & Specs Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'docs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{docsTabLabel}</span>
          </button>

          {/* 4. Frequently Asked Questions Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'faqs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FAQs</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === 'faqs'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {faqCount}
            </span>
          </button>

          {/* 5. Advanced Settings Tab (conditional) */}
          {advancedSettings && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      <div className="flex flex-col gap-6 min-h-[360px]">
        {activeTab === 'tool' && (
          <div className="flex flex-col gap-6">
            {children}

            {/* Quick Helper Shortcut Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Need instructions, formulas, or have questions about this tool?</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('guide')}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:text-indigo-600 hover:border-indigo-200 transition shadow-2xs cursor-pointer"
                >
                  How to Use →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('docs')}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:text-indigo-600 hover:border-indigo-200 transition shadow-2xs cursor-pointer"
                >
                  {docsTabLabel} →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('faqs')}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:text-indigo-600 hover:border-indigo-200 transition shadow-2xs cursor-pointer"
                >
                  FAQs ({faqCount}) →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <ToolGuideTab
            tool={tool}
            onSwitchToTool={() => setActiveTab('tool')}
          />
        )}

        {activeTab === 'docs' && (
          <ToolDocsTab
            tool={tool}
            documentation={documentation}
          />
        )}

        {activeTab === 'faqs' && (
          <ToolFaqTab tool={tool} />
        )}

        {activeTab === 'settings' && advancedSettings && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs">
            {advancedSettings}
          </div>
        )}
      </div>

      {/* Explore Related Utilities (Persistent Footer) */}
      <ToolRelatedSection tool={tool} onSelectTool={onSelectTool} />

      {/* Share Link Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Share2 className="w-4 h-4" />
                <span>Shareable Calculation Link</span>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs flex flex-col gap-1 leading-relaxed ${
                isPrivateTool
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-200 text-amber-900'
              }`}
            >
              <span
                className={`font-semibold ${
                  isPrivateTool ? 'text-emerald-950' : 'text-amber-950'
                }`}
              >
                {isPrivateTool
                  ? '🔒 Zero-Egress Privacy Enforced'
                  : 'Notice: Plain-Text Parameters'}
              </span>
              <p>
                {isPrivateTool
                  ? 'This tool handles sensitive credentials or private data. To prevent data leakage, your inputs are strictly excluded from the URL link. The recipient will open a clean, private workspace.'
                  : 'Inputs and calculation values in this link are serialized in plain text within the URL. Anyone with this link can view the numbers you entered. Do not share generated links if they contain sensitive or confidential financial data.'}
              </p>
            </div>

            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent text-xs text-slate-800 font-mono focus:outline-none select-all"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopiedShare(true);
                  setTimeout(() => setCopiedShare(false), 2000);
                }}
                className="gap-1.5 shrink-0"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Zero servers involved • 100% Client-Side
              </span>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
