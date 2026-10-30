import { z } from 'zod';
import type { ToolDefinition } from '../../core/types';
import { executeTextAnalyzer } from './engine';
import { TextAnalyzerUI } from './ui';

export const TextAnalyzerInputSchema = z.object({
  text: z.string().describe('The text to analyze and count'),
});

export type TextAnalyzerInput = z.infer<typeof TextAnalyzerInputSchema>;

export const TextAnalyzerOutputSchema = z.object({
  words: z.number().describe('Total word count'),
  characters: z.number().describe('Total character count including spaces'),
  charactersNoSpaces: z.number().describe('Character count excluding spaces'),
  sentences: z.number().describe('Estimated sentence count'),
  paragraphs: z.number().describe('Paragraph count'),
  readingTimeMinutes: z.number().describe('Estimated reading time in minutes (based on 200 WPM)'),
  speakingTimeMinutes: z.number().describe('Estimated speaking time in minutes (based on 130 WPM)'),
});

export type TextAnalyzerOutput = z.infer<typeof TextAnalyzerOutputSchema>;

export const textAnalyzerTool: ToolDefinition<
  typeof TextAnalyzerInputSchema,
  typeof TextAnalyzerOutputSchema
> = {
  metadata: {
    id: 'text-analyzer',
    name: 'Word Counter & Text Analyzer',
    category: 'text',
    description: 'Instant word count, character count, sentences, paragraphs, and reading time estimates for writers, students, and everyday tasks.',
    keywords: ['word counter', 'character count', 'words', 'reading time', 'text', 'essay', 'characters'],
    version: '1.0.0',
    icon: 'FileText',
  },
  agent: {
    mcp: true,
    deepLink: true,
    agentPrompt: 'Analyze text to get word count, characters, sentence count, and reading time estimates.',
  },
  inputSchema: TextAnalyzerInputSchema,
  outputSchema: TextAnalyzerOutputSchema,
  examples: [
    {
      title: 'Sample Paragraph',
      description: 'Analyze an excerpt to inspect statistics',
      input: {
        text: 'Antigravity is an AI pair programmer built for high craft software engineering. It operates autonomously to create, modify, and polish software with exceptional attention to detail. All tools run directly in your browser with complete privacy.',
      },
    },
  ],
  execute: executeTextAnalyzer,
  Component: TextAnalyzerUI,
};
