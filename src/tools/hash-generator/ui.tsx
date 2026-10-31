import React, { useState, useEffect } from 'react';
import {
  Hash,
  FileCheck,
  Key,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  FileUp,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeHashGenerator } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { HashAlgorithm, HashGeneratorInput, HashGeneratorOutput } from './definition';

export const HashGeneratorUI: React.FC<
  ToolComponentProps<HashGeneratorInput, HashGeneratorOutput>
> = ({ tool, initialInput }) => {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [text, setText] = useState<string>(
    initialInput?.text || 'The quick brown fox jumps over the lazy dog'
  );
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>(
    initialInput?.algorithm || 'SHA-256'
  );
  const [hmacKey, setHmacKey] = useState<string>(initialInput?.hmacKey || '');
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);

  const [copiedHex, setCopiedHex] = useState(false);
  const [copiedBase64, setCopiedBase64] = useState(false);
  const [execTime, setExecTime] = useState(0);

  const [output, setOutput] = useState<HashGeneratorOutput>({
    isValid: true,
    algorithm: 'SHA-256',
    hexDigest: '',
    base64Digest: '',
    inputByteLength: 0,
  });

  const runCalculation = async () => {
    const start = performance.now();
    const res = await executeHashGenerator({
      text: inputType === 'text' ? text : undefined,
      fileBuffer: inputType === 'file' && fileBuffer ? fileBuffer : undefined,
      algorithm,
      hmacKey: hmacKey.trim() || undefined,
      expectedHash: expectedHash.trim() || undefined,
    });
    const end = performance.now();
    setExecTime(end - start);
    setOutput(res);
  };

  useEffect(() => {
    runCalculation();
  }, [text, fileBuffer, algorithm, hmacKey, expectedHash, inputType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (buffer) {
        setFileBuffer(buffer);
        setInputType('file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleReset = () => {
    setText('');
    setFileBuffer(null);
    setFileName('');
    setFileSize(0);
    setHmacKey('');
    setExpectedHash('');
  };

  const copyHex = async () => {
    if (!output.hexDigest) return;
    await navigator.clipboard.writeText(output.hexDigest);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  const copyBase64 = async () => {
    if (!output.base64Digest) return;
    await navigator.clipboard.writeText(output.base64Digest);
    setCopiedBase64(true);
    setTimeout(() => setCopiedBase64(false), 2000);
  };

  const algorithms: HashAlgorithm[] = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1', 'MD5'];

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      executionTimeMs={execTime}
      inputData={{ text, algorithm }}
    >
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Controls & Algorithm Picker Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500">Algorithm:</span>
            <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              {algorithms.map((alg) => (
                <button
                  key={alg}
                  type="button"
                  onClick={() => setAlgorithm(alg)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    algorithm === alg
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {alg}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setInputType('text')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  inputType === 'text'
                    ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Text Input
              </button>
              <button
                type="button"
                onClick={() => setInputType('file')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  inputType === 'file'
                    ? 'bg-white text-indigo-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                File Checksum
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 h-7 px-2 gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        {/* Input Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-4">
          {inputType === 'text' ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700">Raw Text Input</label>
                <span className="font-mono text-slate-400 text-[11px]">
                  {output.inputByteLength} bytes
                </span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste text to hash..."
                rows={4}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-2xs resize-none"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <label className="text-xs font-semibold text-slate-700">Select Local File</label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl bg-slate-50 hover:bg-indigo-50/30 transition-colors cursor-pointer text-center">
                <input type="file" onChange={handleFileUpload} className="hidden" />
                <FileUp className="w-8 h-8 text-indigo-600 mb-2" />
                <span className="text-xs font-semibold text-slate-800">
                  {fileName ? fileName : 'Click to choose a file or drag & drop'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  {fileSize > 0
                    ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB • Processed 100% locally in browser memory`
                    : 'Any file size • Zero bytes ever uploaded to cloud'}
                </span>
              </label>
            </div>
          )}

          {/* Optional HMAC Key Input */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>HMAC Secret Key (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">Leave empty for standard hash</span>
            </div>
            <input
              type="text"
              value={hmacKey}
              onChange={(e) => setHmacKey(e.target.value)}
              placeholder="Enter secret key to compute HMAC..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Digest Results Output */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {hmacKey ? `HMAC-${algorithm} Signature` : `${algorithm} Digest`}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {output.hexDigest.length} hex chars
            </span>
          </div>

          {/* Hex Digest */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Hexadecimal Format</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 break-all select-all">
                {output.hexDigest || 'Calculating...'}
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={copyHex}
                className="h-10 px-3.5 gap-1.5 shrink-0"
              >
                {copiedHex ? (
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
          </div>

          {/* Base64 Digest */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Base64 Format</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 break-all select-all">
                {output.base64Digest || 'Calculating...'}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyBase64}
                className="h-10 px-3.5 gap-1.5 shrink-0"
              >
                {copiedBase64 ? (
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
          </div>

          {/* Checksum Match Verifier Box */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Verify Against Expected Hash / Checksum</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Paste expected hash here to compare..."
                className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
              {expectedHash.trim() && (
                output.isMatch ? (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Checksum Matches!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Mismatch</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Privacy Callout */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Egress Guarantee:</strong> Whether hashing private API keys, cryptographic secrets, or local disk binaries, all digest hashing executes inside browser Web Crypto memory. Nothing is ever transmitted to a server.
          </span>
        </div>
      </div>
    </ToolShell>
  );
};
