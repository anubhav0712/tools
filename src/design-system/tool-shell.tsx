import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Check,
  RotateCcw,
  Share2,
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import type { ToolDefinition } from '../core/types';

export interface ToolShellProps {
  tool: ToolDefinition;
  onBack?: () => void;
  onReset?: () => void;
  executionTimeMs?: number;
  inputData?: unknown;
  children: React.ReactNode;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  onBack,
  onReset,
  executionTimeMs,
  inputData,
  children,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareUrl = async () => {
    let url = window.location.href;
    if (inputData) {
      const serialized = encodeURIComponent(JSON.stringify(inputData));
      url = `${window.location.origin}${window.location.pathname}#tool=${tool.metadata.id}&input=${serialized}`;
    }
    await navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6 max-w-7xl mx-auto w-full">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {onBack && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-500 hover:text-slate-900 -ml-2 gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to all tools</span>
            </Button>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-200">
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
              <Badge variant="default" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>100% In-Browser</span>
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {tool.metadata.description}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShareUrl}
              title="Copy shareable link with current input"
            >
              {copiedShare ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share URL</span>
                </>
              )}
            </Button>

            {onReset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                title="Reset input and output"
                className="text-slate-600 hover:text-slate-900"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex flex-col gap-5 sm:gap-6">{children}</div>

      {/* Tool Status & Privacy Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-2.5 px-4 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Private & Secure: Processed 100% locally on your device</span>
          {typeof executionTimeMs === 'number' && (
            <>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">
                {executionTimeMs.toFixed(2)}ms
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
