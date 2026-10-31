import React, { useState, useEffect } from 'react';
import {
  Key,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Sliders,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Hash,
  Fingerprint,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executePassphraseGenerator } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type {
  PassphraseGeneratorInput,
  PassphraseGeneratorOutput,
  PassphraseMode,
} from './definition';

export const PassphraseGeneratorUI: React.FC<
  ToolComponentProps<PassphraseGeneratorInput, PassphraseGeneratorOutput>
> = ({ tool, initialInput }) => {
  const [mode, setMode] = useState<PassphraseMode>(initialInput?.mode || 'diceware');
  const [wordCount, setWordCount] = useState<number>(initialInput?.wordCount ?? 5);
  const [separator, setSeparator] = useState<string>(initialInput?.separator ?? '-');
  const [passwordLength, setPasswordLength] = useState<number>(
    initialInput?.passwordLength ?? 20
  );
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(
    initialInput?.includeUppercase ?? true
  );
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(
    initialInput?.includeLowercase ?? true
  );
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(
    initialInput?.includeNumbers ?? true
  );
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(
    initialInput?.includeSymbols ?? true
  );
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(
    initialInput?.excludeAmbiguous ?? true
  );
  const [byteLength, setByteLength] = useState<number>(initialInput?.byteLength ?? 32);

  const [copied, setCopied] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(true);
  const [triggerNonce, setTriggerNonce] = useState<number>(0);
  const [execTime, setExecTime] = useState<number>(0);

  const [output, setOutput] = useState<PassphraseGeneratorOutput>(() =>
    executePassphraseGenerator({
      mode,
      wordCount,
      separator,
      passwordLength,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeAmbiguous,
      byteLength,
    })
  );

  const regenerate = () => {
    setTriggerNonce((prev) => prev + 1);
  };

  useEffect(() => {
    const start = performance.now();
    const res = executePassphraseGenerator({
      mode,
      wordCount,
      separator,
      passwordLength,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeAmbiguous,
      byteLength,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  }, [
    mode,
    wordCount,
    separator,
    passwordLength,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    byteLength,
    triggerNonce,
  ]);

  const handleCopy = async () => {
    if (!output.generatedSecret) return;
    await navigator.clipboard.writeText(output.generatedSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = (grade: string) => {
    switch (grade) {
      case 'very_weak':
        return 'bg-rose-500 text-rose-700';
      case 'weak':
        return 'bg-orange-500 text-orange-700';
      case 'moderate':
        return 'bg-amber-500 text-amber-700';
      case 'strong':
        return 'bg-emerald-500 text-emerald-700';
      case 'very_strong':
        return 'bg-indigo-600 text-indigo-700';
      default:
        return 'bg-slate-400 text-slate-600';
    }
  };

  return (
    <ToolShell
      tool={tool}
      onReset={regenerate}
      executionTimeMs={execTime}
      inputData={{ mode }}
    >
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Mode Selector Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('diceware')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'diceware'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Diceware Phrase</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('random_password')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'random_password'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Random Password</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('hex_key')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'hex_key'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Hash className="w-4 h-4" />
            <span>Hex API Key</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('uuid')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              mode === 'uuid'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>UUID v4</span>
          </button>
        </div>

        {/* Hero Secret Display Card */}
        <div className="flex flex-col gap-3 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Generated Output</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                title={showSecret ? 'Mask secret' : 'Reveal secret'}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{showSecret ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-sm sm:text-base text-slate-900 break-all select-all flex items-center min-h-[56px]">
              {showSecret ? (
                output.generatedSecret || 'Select options below'
              ) : (
                <span className="tracking-widest text-slate-400">••••••••••••••••••••••••</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={handleCopy}
                className="gap-2 h-12 px-5 text-sm font-semibold shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={regenerate}
                className="h-12 w-12 p-0 text-slate-700 hover:text-indigo-600"
                title="Generate another"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Entropy & Strength Meter */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Strength:</span>
                <span className="font-bold text-slate-900 capitalize">
                  {output.strengthGrade.replace('_', ' ')}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  ({output.entropyBits} bits entropy)
                </span>
              </div>
              <span className="text-slate-500 text-[11px]">
                Estimated crack time: <strong>{output.crackTimeDisplay}</strong>
              </span>
            </div>

            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor(
                  output.strengthGrade
                ).split(' ')[0]}`}
                style={{
                  width: `${Math.min(100, Math.max(10, (output.entropyBits / 128) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-5">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Customize Generator Settings</span>
          </div>

          {/* Diceware Options */}
          {mode === 'diceware' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-700">Word Count: {wordCount} words</label>
                  <span className="text-slate-400 text-[11px]">Recommended: 5 to 7 words</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={10}
                  step={1}
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-700">Word Separator:</span>
                <div className="flex gap-2">
                  {[
                    { label: 'Hyphen (-)', val: '-' },
                    { label: 'Space ( )', val: ' ' },
                    { label: 'Dot (.)', val: '.' },
                    { label: 'Underscore (_)', val: '_' },
                  ].map((sep) => (
                    <button
                      key={sep.val}
                      type="button"
                      onClick={() => setSeparator(sep.val)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-colors cursor-pointer ${
                        separator === sep.val
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {sep.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Random Password Options */}
          {mode === 'random_password' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-slate-700">Password Length: {passwordLength} characters</label>
                  <span className="text-slate-400 text-[11px]">Recommended: 16+</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={64}
                  step={1}
                  value={passwordLength}
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Uppercase Letters (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Lowercase Letters (a-z)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Special Symbols (!@#$%...)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={excludeAmbiguous}
                    onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Exclude Ambiguous Characters (e.g. 0, O, 1, l, I)</span>
                </label>
              </div>
            </div>
          )}

          {/* Hex Key Options */}
          {mode === 'hex_key' && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-medium text-slate-700">Token Byte Length:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '16 Bytes (128-bit)', val: 16 },
                  { label: '32 Bytes (256-bit)', val: 32 },
                  { label: '64 Bytes (512-bit)', val: 64 },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setByteLength(opt.val)}
                    className={`text-xs px-3.5 py-2 rounded-xl border font-medium transition-colors cursor-pointer ${
                      byteLength === opt.val
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* UUID notice */}
          {mode === 'uuid' && (
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard RFC 4122 UUID Version 4 generated using cryptographically secure pseudo-random number generator (CSPRNG). 122 bits of randomness guarantee global uniqueness across distributed systems.
            </p>
          )}
        </div>

        {/* Privacy Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-800">100% Offline & Non-Logged Generation</span>
            <p>
              Unlike online password generators that may retain secrets in server logs or transmit them over unencrypted links, this tool utilizes your device&apos;s native hardware entropy source (<code className="font-mono text-indigo-600">crypto.getRandomValues</code>). Nothing ever leaves your browser.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
