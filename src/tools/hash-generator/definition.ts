import type { ToolDefinition } from '../../core/types';
import { executeHashGenerator } from './engine';
import { HashGeneratorUI } from './ui';

export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'SHA-384' | 'SHA-1' | 'MD5';

export interface HashGeneratorInput {
  text?: string;
  fileBuffer?: ArrayBuffer;
  algorithm: HashAlgorithm;
  hmacKey?: string;
  expectedHash?: string; // For checksum verification
}

export interface HashGeneratorOutput {
  isValid: boolean;
  error?: string;
  algorithm: HashAlgorithm;
  hexDigest: string;
  base64Digest: string;
  inputByteLength: number;
  isMatch?: boolean; // If expectedHash was provided
}

export const hashGeneratorTool: ToolDefinition<HashGeneratorInput, HashGeneratorOutput> = {
  metadata: {
    id: 'hash-generator',
    name: 'Hash & HMAC Generator',
    category: 'crypto',
    description: 'Compute SHA-256, SHA-512, SHA-1, MD5 hashes and HMAC signatures 100% locally in browser memory.',
    keywords: ['hash', 'sha256', 'sha512', 'md5', 'hmac', 'checksum', 'crypto', 'digest', 'verify'],
    version: '1.0.0',
    icon: 'Hash',
    persistableInUrl: false, // Prevent HMAC keys or secrets from persisting in URL
  },
  examples: [
    {
      title: 'SHA-256 Text Hash',
      description: 'Standard 256-bit cryptographic digest',
      input: {
        text: 'The quick brown fox jumps over the lazy dog',
        algorithm: 'SHA-256',
      },
    },
    {
      title: 'HMAC-SHA256 Signature',
      description: 'Keyed-hash message authentication code',
      input: {
        text: '{"userId": 1001, "role": "admin"}',
        algorithm: 'SHA-256',
        hmacKey: 'super-secret-key-12345',
      },
    },
    {
      title: 'SHA-512 Digest',
      description: 'High-security 512-bit digest',
      input: {
        text: 'Antigravity offline tools',
        algorithm: 'SHA-512',
      },
    },
  ],
  execute: executeHashGenerator,
  Component: HashGeneratorUI,
};
