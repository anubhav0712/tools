import React, { useState, useEffect, useTransition } from 'react';
import { Clock, Mic, Copy, Check, Trash2, FileUp } from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { Button } from '../../design-system/button';
import { executeTextAnalyzer } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { TextAnalyzerInput, TextAnalyzerOutput } from './definition';

export const TextAnalyzerUI: React.FC<ToolComponentProps<TextAnalyzerInput, TextAnalyzerOutput>> = ({
  tool,
  initialInput,
}) => {
  const [text, setText] = useState<string>(
    initialInput?.text ||
      'Welcome to Tools! This is a modern, privacy-first online utility that runs 100% in your browser.\n\nWhether you need to count words for an essay, format a data document, or convert files, your data never leaves your device. No cloud servers are involved, and it works completely offline.'
  );

  const [output, setOutput] = useState<TextAnalyzerOutput>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
    speakingTimeMinutes: 0,
  });

  const [copied, setCopied] = useState(false);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [, startTransition] = useTransition();

  const runAnalysis = (content: string) => {
    const start = performance.now();
    const res = executeTextAnalyzer({ text: content });
    const end = performance.now();
    setExecutionTime(end - start);
    setOutput(res);
  };

  useEffect(() => {
    startTransition(() => {
      runAnalysis(text);
    });
  }, [text]);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setText(content);
    };
    reader.readAsText(file);
  };

  // Case conversions for everyday text manipulation
  const toUppercase = () => setText((prev) => prev.toUpperCase());
  const toLowercase = () => setText((prev) => prev.toLowerCase());
  const toTitleCase = () =>
    setText((prev) =>
      prev.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
    );
  const cleanExtraSpaces = () =>
    setText((prev) => prev.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim());

  return (
    <ToolShell
      tool={tool}
      onReset={() => setText('')}
      executionTimeMs={executionTime}
      inputData={{ text }}
      outputData={output}
    >
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Words</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {output.words.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Characters</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {output.characters.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {output.charactersNoSpaces} without spaces
          </span>
        </div>

        <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Sentences</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {output.sentences}
          </span>
        </div>

        <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Paragraphs</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {output.paragraphs}
          </span>
        </div>

        <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Reading</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            ~{output.readingTimeMinutes} <span className="text-xs font-normal text-slate-500">min</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">at 200 WPM</span>
        </div>

        <div className="flex flex-col p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Mic className="w-3.5 h-3.5 text-purple-500" />
            <span>Speaking</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            ~{output.speakingTimeMinutes} <span className="text-xs font-normal text-slate-500">min</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">at 130 WPM</span>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-slate-500 mr-1 hidden sm:inline">Transform:</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={toTitleCase}
              className="text-xs h-7 px-2.5"
            >
              Title Case
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={toUppercase}
              className="text-xs h-7 px-2.5"
            >
              UPPERCASE
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={toLowercase}
              className="text-xs h-7 px-2.5"
            >
              lowercase
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={cleanExtraSpaces}
              className="text-xs h-7 px-2.5"
              title="Remove redundant spaces and duplicate blank lines"
            >
              Clean Spaces
            </Button>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".txt,.md,.text"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="text-xs h-7 px-2 text-slate-600 gap-1"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  input?.click();
                }}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload</span>
              </Button>
            </label>

            {text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText('')}
                className="text-xs h-7 px-2 text-slate-500 hover:text-rose-600"
                title="Clear text"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="text-xs h-7 px-3 gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Big Clean Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here to count words, characters, and estimate reading time..."
          spellCheck
          className="w-full h-80 sm:h-96 p-4 sm:p-6 text-sm sm:text-base leading-relaxed text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none"
        />
      </div>
    </ToolShell>
  );
};
