import React, { useState, useEffect } from 'react';
import {
  Palette,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeColorContrastChecker } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { ColorContrastInput, ColorContrastOutput } from './definition';

function toValidColorPickerValue(hex: string, fallback: string): string {
  const clean = (hex || '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return `#${clean}`;
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    return `#${clean.split('').map((c) => c + c).join('')}`;
  }
  return fallback;
}

export const ColorContrastCheckerUI: React.FC<
  ToolComponentProps<ColorContrastInput, ColorContrastOutput>
> = ({ tool, initialInput }) => {
  const [foregroundHex, setForegroundHex] = useState<string>(
    initialInput?.foregroundHex || '#4F46E5'
  );
  const [backgroundHex, setBackgroundHex] = useState<string>(
    initialInput?.backgroundHex || '#FFFFFF'
  );

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<ColorContrastOutput>(() =>
    executeColorContrastChecker({ foregroundHex, backgroundHex })
  );

  useEffect(() => {
    const start = performance.now();
    const res = executeColorContrastChecker({ foregroundHex, backgroundHex });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [foregroundHex, backgroundHex]);

  const handleSwap = () => {
    const temp = foregroundHex;
    setForegroundHex(backgroundHex);
    setBackgroundHex(temp);
  };

  const handleCopy = async (val: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedHex(val);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleLoadPreset = (idx: number) => {
    const ex = tool.examples?.[idx];
    if (ex) {
      setForegroundHex(ex.input.foregroundHex);
      setBackgroundHex(ex.input.backgroundHex);
    }
  };

  return (
    <ToolShell
      tool={tool}
      onReset={() => {
        setForegroundHex('#4F46E5');
        setBackgroundHex('#FFFFFF');
      }}
      executionTimeMs={execTime}
      inputData={{ foregroundHex, backgroundHex }}
    >
      <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* Presets and Swap Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Presets:</span>
            {tool.examples?.map((ex, idx) => (
              <Button
                key={ex.title}
                variant="secondary"
                size="sm"
                onClick={() => handleLoadPreset(idx)}
                className="text-xs h-7 px-2.5"
              >
                {ex.title}
              </Button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSwap}
            className="text-xs h-7 px-2.5 gap-1.5"
            title="Swap foreground and background colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
            <span>Swap Colors</span>
          </Button>
        </div>

        {/* Color Inputs & Hero Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Foreground Input */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-700">
              Text / Foreground Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={toValidColorPickerValue(foregroundHex, '#4F46E5')}
                onChange={(e) => setForegroundHex(e.target.value.toUpperCase())}
                className="w-12 h-12 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white shrink-0"
              />
              <input
                type="text"
                value={foregroundHex}
                onChange={(e) => setForegroundHex(e.target.value)}
                placeholder="#000000"
                maxLength={7}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 uppercase"
              />
            </div>
          </div>

          {/* Background Input */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-700">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={toValidColorPickerValue(backgroundHex, '#FFFFFF')}
                onChange={(e) => setBackgroundHex(e.target.value.toUpperCase())}
                className="w-12 h-12 rounded-xl border border-slate-200 p-0.5 cursor-pointer bg-white shrink-0"
              />
              <input
                type="text"
                value={backgroundHex}
                onChange={(e) => setBackgroundHex(e.target.value)}
                placeholder="#FFFFFF"
                maxLength={7}
                className="w-full px-3 py-2 text-sm font-mono font-bold rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 uppercase"
              />
            </div>
          </div>

          {/* Contrast Score Hero */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-white border border-indigo-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-indigo-700 font-medium">
              <span>Contrast Ratio</span>
              <span className="font-semibold">WCAG 2.1</span>
            </div>
            <div className="my-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                {output.ratioDisplay}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              {output.wcagAaNormal ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passes Standard Text AA
                </span>
              ) : (
                <span className="text-rose-700 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Fails Standard Text AA (&lt; 4.5:1)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Visual Preview Box */}
        <div
          className="p-8 rounded-3xl border shadow-sm transition-colors duration-200 flex flex-col gap-4"
          style={{
            backgroundColor: output.isValid ? output.backgroundHex : '#FFFFFF',
            borderColor: '#E2E8F0',
          }}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80" style={{ color: output.foregroundHex }}>
            <span className="flex items-center gap-1.5 font-sans font-semibold">
              <Eye className="w-4 h-4" /> Live Visual Preview Card
            </span>
            <span>{output.foregroundHex} on {output.backgroundHex}</span>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight transition-colors"
            style={{ color: output.foregroundHex }}
          >
            Accessible typography empowers every user.
          </h2>

          <p
            className="text-xs sm:text-sm leading-relaxed max-w-3xl transition-colors"
            style={{ color: output.foregroundHex }}
          >
            This preview demonstrates how regular paragraph body text and interface controls render under your chosen color combination. Ensuring sufficient contrast guarantees readability across high-glare outdoor environments and assistive technologies.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
              style={{
                backgroundColor: output.foregroundHex,
                color: output.backgroundHex,
              }}
            >
              Interactive Button
            </button>
            <span
              className="text-xs font-medium underline"
              style={{ color: output.foregroundHex }}
            >
              Accessible Link Text
            </span>
          </div>
        </div>

        {/* WCAG Criteria Breakdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'AA Normal Text', req: '4.5:1 min', pass: output.wcagAaNormal },
            { label: 'AA Large Text', req: '3.0:1 min (18pt+)', pass: output.wcagAaLarge },
            { label: 'AAA Normal Text', req: '7.0:1 min', pass: output.wcagAaaNormal },
            { label: 'AAA Large Text', req: '4.5:1 min', pass: output.wcagAaaLarge },
            { label: 'UI & Graphics', req: '3.0:1 min', pass: output.wcagUiComponent },
          ].map((item) => (
            <div
              key={item.label}
              className={`p-3.5 rounded-2xl border shadow-2xs flex flex-col gap-1.5 ${
                item.pass
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/70 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{item.label}</span>
                {item.pass ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <span className="text-[11px] opacity-80">{item.req}</span>
              <span className="text-xs font-extrabold uppercase mt-1">
                {item.pass ? 'Pass' : 'Fail'}
              </span>
            </div>
          ))}
        </div>

        {/* Tailwind Color Palette Shades */}
        {output.paletteShades.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>Generated Tailwind Palette Swatches (50–900)</span>
              </h3>
              <span className="text-[11px] text-slate-400">Click to copy hex</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {output.paletteShades.map((swatch) => (
                <button
                  key={swatch.shade}
                  type="button"
                  onClick={() => handleCopy(swatch.hex)}
                  className="flex flex-col items-center p-2 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div
                    className="w-full h-10 rounded-lg shadow-inner mb-1.5"
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                    {swatch.shade}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono group-hover:text-indigo-600">
                    {copiedHex === swatch.hex ? 'Copied!' : swatch.hex}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Callout */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Brand colors and accessibility design tokens are computed 100% on your device using W3C relative luminance mathematical formulas.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
