import type { ToolDefinition } from '../../core/types';
import { executeTextAnalyzer } from './engine';
import { TextAnalyzerUI } from './ui';

export interface TextAnalyzerInput {
  text: string;
}

export interface TextAnalyzerOutput {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
}

export const textAnalyzerTool: ToolDefinition<TextAnalyzerInput, TextAnalyzerOutput> = {
  metadata: {
    id: 'text-analyzer',
    name: 'Word Counter & Text Analyzer',
    category: 'text',
    description: 'Instant word count, character count, sentences, paragraphs, and reading time estimates for writers, students, and everyday tasks.',
    keywords: ['word counter', 'character count', 'words', 'reading time', 'text', 'essay', 'characters'],
    version: '1.0.0',
    icon: 'FileText',
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'Unicode Standard Annex #29 (Unicode Text Segmentation)',
      lastReviewedDate: '2026-10-31',
      changeRisk: 'none',
      notes: 'Word and character counting algorithms are deterministic.',
    },
  },
  examples: [
    {
      title: 'Sample Paragraph',
      description: 'Analyze an excerpt to inspect statistics',
      input: {
        text: 'Tools is a modern, privacy-first online utility that runs 100% in your browser. All processing happens locally on your device with complete privacy.',
      },
    },
  ],
  execute: executeTextAnalyzer,
  Component: TextAnalyzerUI,
};
