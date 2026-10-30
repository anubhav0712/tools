import { z } from 'zod';
import type { ToolDefinition } from '../../core/types';
import { executeBase64Converter } from './engine';
import { Base64ConverterUI } from './ui';

export const Base64ConverterInputSchema = z.object({
  text: z.string().describe('Text or Base64 string to encode/decode'),
  mode: z.enum(['encode', 'decode']).default('encode').describe('Operation mode: encode or decode'),
  urlSafe: z.boolean().default(false).describe('Use URL-safe alphabet (- and _ instead of + and /)'),
});

export type Base64ConverterInput = z.infer<typeof Base64ConverterInputSchema>;

export const Base64ConverterOutputSchema = z.object({
  result: z.string().describe('Encoded or decoded string'),
  isValid: z.boolean().describe('Whether the operation succeeded'),
  error: z.string().optional().describe('Error message if decoding failed'),
  byteSize: z.number().describe('Byte length of the result'),
});

export type Base64ConverterOutput = z.infer<typeof Base64ConverterOutputSchema>;

export const base64ConverterTool: ToolDefinition<
  typeof Base64ConverterInputSchema,
  typeof Base64ConverterOutputSchema
> = {
  metadata: {
    id: 'base64-converter',
    name: 'Base64 Encoder & Decoder',
    category: 'converter',
    description: 'Encode and decode standard or URL-safe Base64 strings with full UTF-8 Unicode support.',
    keywords: ['base64', 'encode', 'decode', 'b64', 'urlsafe', 'ascii', 'utf8'],
    version: '1.0.0',
    icon: 'Binary',
  },
  agent: {
    mcp: true,
    deepLink: true,
    agentPrompt: 'Encode plain text to Base64 or decode Base64 strings back to UTF-8 text.',
  },
  inputSchema: Base64ConverterInputSchema,
  outputSchema: Base64ConverterOutputSchema,
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
