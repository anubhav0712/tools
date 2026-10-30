import React, { useState, useEffect, useTransition } from 'react';
import { ArrowLeftRight, AlertCircle } from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { CodeEditor } from '../../design-system/code-editor';
import { Button } from '../../design-system/button';
import { executeBase64Converter } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { Base64ConverterInput, Base64ConverterOutput } from './definition';

export const Base64ConverterUI: React.FC<ToolComponentProps<Base64ConverterInput, Base64ConverterOutput>> = ({
  tool,
  initialInput,
}) => {
  const [text, setText] = useState<string>(initialInput?.text || 'Hello World! 🎉');
  const [mode, setMode] = useState<'encode' | 'decode'>(initialInput?.mode || 'encode');
  const [urlSafe, setUrlSafe] = useState<boolean>(initialInput?.urlSafe || false);
  const [output, setOutput] = useState<Base64ConverterOutput>({
    result: '',
    isValid: true,
    byteSize: 0,
  });
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [, startTransition] = useTransition();

  const runConverter = (t: string, m: 'encode' | 'decode', u: boolean) => {
    const start = performance.now();
    const res = executeBase64Converter({ text: t, mode: m, urlSafe: u });
    const end = performance.now();
    setExecutionTime(end - start);
    setOutput(res);
  };

  useEffect(() => {
    startTransition(() => {
      runConverter(text, mode, urlSafe);
    });
  }, [text, mode, urlSafe]);

  const handleSwap = () => {
    if (output.isValid && output.result) {
      setText(output.result);
      setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
    }
  };

  const handleReset = () => {
    setText('');
    setOutput({ result: '', isValid: true, byteSize: 0 });
    setExecutionTime(0);
  };

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={executionTime}
      inputData={{ text, mode, urlSafe }}
      outputData={output}
    >
      {/* Controls Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('encode')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                mode === 'encode'
                  ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Encode (Text → Base64)
            </button>
            <button
              type="button"
              onClick={() => setMode('decode')}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                mode === 'decode'
                  ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Decode (Base64 → Text)
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none hover:text-slate-900">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span>URL-Safe Alphabet</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          {output.isValid && output.result && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSwap}
              title="Use output as next input and flip mode"
              className="text-xs gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Swap Input / Output</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {!output.isValid && output.error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-rose-900">Base64 Decoding Error</span>
            <p className="font-mono text-rose-700">{output.error}</p>
          </div>
        </div>
      )}

      {/* Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label={mode === 'encode' ? 'Raw Text (UTF-8)' : 'Base64 Input'}
          value={text}
          onChange={setText}
          placeholder={mode === 'encode' ? 'Type text to encode...' : 'Paste Base64 to decode...'}
          filename={mode === 'encode' ? 'input.txt' : 'input.b64'}
          height="h-64 sm:h-80 lg:h-[450px]"
        />

        <CodeEditor
          label={mode === 'encode' ? 'Base64 Output' : 'Decoded Text (UTF-8)'}
          value={output.result}
          readOnly
          placeholder="Result will appear here..."
          filename={mode === 'encode' ? 'encoded.b64' : 'decoded.txt'}
          height="h-64 sm:h-80 lg:h-[450px]"
        />
      </div>
    </ToolShell>
  );
};
