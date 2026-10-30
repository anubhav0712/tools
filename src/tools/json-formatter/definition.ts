import { z } from 'zod';
import type { ToolDefinition } from '../../core/types';
import { executeJsonFormatter } from './engine';
import { JsonFormatterUI } from './ui';

export const JsonFormatterInputSchema = z.object({
  rawJson: z.string().describe('The raw JSON string to format, validate, or minify'),
  indent: z.number().min(0).max(8).default(2).describe('Indentation spaces (0 for minification, default 2)'),
  sortKeys: z.boolean().default(false).describe('Whether to sort JSON object keys alphabetically'),
});

export type JsonFormatterInput = z.infer<typeof JsonFormatterInputSchema>;

export const JsonFormatterOutputSchema = z.object({
  formatted: z.string().describe('Formatted or minified JSON string'),
  isValid: z.boolean().describe('Whether the input was valid JSON'),
  error: z.string().optional().describe('Error message if invalid'),
  lineCount: z.number().describe('Number of lines in the output'),
  byteSize: z.number().describe('Output size in bytes'),
});

export type JsonFormatterOutput = z.infer<typeof JsonFormatterOutputSchema>;

export const jsonFormatterTool: ToolDefinition<
  typeof JsonFormatterInputSchema,
  typeof JsonFormatterOutputSchema
> = {
  metadata: {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'developer',
    description: 'Format, validate, sort object keys, or minify JSON data with instant local parsing and syntax validation.',
    keywords: ['json', 'format', 'minify', 'prettify', 'validate', 'sort keys', 'beautify'],
    version: '1.0.0',
    icon: 'Braces',
  },
  agent: {
    mcp: true,
    deepLink: true,
    agentPrompt: 'Use this tool to safely format, validate, minify, or canonicalize JSON payloads without sending data to external APIs.',
  },
  inputSchema: JsonFormatterInputSchema,
  outputSchema: JsonFormatterOutputSchema,
  examples: [
    {
      title: 'Simple User Object',
      description: 'Formats and sorts keys for an unformatted JSON object',
      input: {
        rawJson: '{"name":"Alex","id":102,"active":true,"roles":["admin","editor"]}',
        indent: 2,
        sortKeys: true,
      },
    },
    {
      title: 'Minification Example',
      description: 'Compresses JSON to a single line with zero indentation',
      input: {
        rawJson: '{\n  "status": "ok",\n  "timestamp": 1730000000\n}',
        indent: 0,
        sortKeys: false,
      },
    },
  ],
  execute: executeJsonFormatter,
  Component: JsonFormatterUI,
};
