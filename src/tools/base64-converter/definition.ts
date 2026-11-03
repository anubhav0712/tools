import type { ToolDefinition } from '../../core/types';
import { executeBase64Converter } from './engine';
import { Base64ConverterUI } from './ui';

export interface Base64ConverterInput {
  text: string;
  mode?: 'encode' | 'decode';
  urlSafe?: boolean;
}

export interface Base64ConverterOutput {
  result: string;
  isValid: boolean;
  error?: string;
  byteSize: number;
}

export const base64ConverterTool: ToolDefinition<Base64ConverterInput, Base64ConverterOutput> = {
  metadata: {
    id: 'base64-converter',
    name: 'Base64 Encoder & Decoder',
    category: 'converter',
    description: 'Encode and decode standard or URL-safe Base64 strings with full UTF-8 Unicode support.',
    keywords: ['base64', 'encode', 'decode', 'b64', 'urlsafe', 'ascii', 'utf8'],
    version: '1.0.0',
    icon: 'Binary',
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'IETF RFC 4648 (The Base16, Base32, and Base64 Data Encodings)',
      lastReviewedDate: '2026-10-31',
      changeRisk: 'none',
      notes: 'Base64 alphabet and byte framing are immutable.',
    },
  },
  examples: [
    {
      title: 'Encode Greeting',
      description: 'Encode a UTF-8 string to standard Base64',
      input: {
        text: 'Hello, World! 🚀',
        mode: 'encode',
        urlSafe: false,
      },
    },
    {
      title: 'Decode Token Payload',
      description: 'Decode a Base64 string',
      input: {
        text: 'SGVsbG8sIFdvcmxkISDwn5mp',
        mode: 'decode',
        urlSafe: false,
      },
    },
  ],
  execute: executeBase64Converter,
  Component: Base64ConverterUI,
};
