import type { ToolDefinition } from '../../core/types';
import { executeJsonFormatter } from './engine';
import { JsonFormatterUI } from './ui';

export interface JsonFormatterInput {
  rawJson: string;
  indent?: number;
  sortKeys?: boolean;
}

export interface JsonFormatterOutput {
  formatted: string;
  isValid: boolean;
  error?: string;
  lineCount: number;
  byteSize: number;
}

export const jsonFormatterTool: ToolDefinition<JsonFormatterInput, JsonFormatterOutput> = {
  metadata: {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'developer',
    description: 'Format, validate, sort object keys, or minify JSON data with instant local parsing and syntax validation.',
    keywords: ['json', 'format', 'minify', 'prettify', 'validate', 'sort keys', 'beautify'],
    version: '1.0.0',
    icon: 'Braces',
  },
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
