import type { ToolDefinition } from '../../core/types';
import { executePassphraseGenerator } from './engine';
import { PassphraseGeneratorUI } from './ui';

export type PassphraseMode = 'diceware' | 'random_password' | 'hex_key' | 'uuid';

export interface PassphraseGeneratorInput {
  mode: PassphraseMode;
  wordCount?: number;          // For Diceware (e.g. 4-8 words)
  separator?: string;          // e.g. "-", " ", "."
  passwordLength?: number;     // For random_password (e.g. 12-64 chars)
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeAmbiguous?: boolean;  // Exclude 0, O, l, 1, I
  byteLength?: number;         // For hex_key (e.g. 16, 32, 64)
}

export interface PassphraseGeneratorOutput {
  isValid: boolean;
  error?: string;
  generatedSecret: string;
  entropyBits: number;
  strengthGrade: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  crackTimeDisplay: string;
}

export const passphraseGeneratorTool: ToolDefinition<
  PassphraseGeneratorInput,
  PassphraseGeneratorOutput
> = {
  metadata: {
    id: 'passphrase-generator',
    name: 'Passphrase & Key Generator',
    category: 'crypto',
    description: 'Generate cryptographically secure passwords, memorable Diceware phrases, and hex keys 100% offline.',
    keywords: ['password', 'passphrase', 'diceware', 'generator', 'crypto', 'entropy', 'security', 'uuid', 'secret'],
    version: '1.0.0',
    icon: 'Key',
    persistableInUrl: false, // Never leak generated passwords into URL!
  },
  examples: [
    {
      title: '5-Word Diceware',
      description: 'Ultra-secure, memorable passphrase',
      input: {
        mode: 'diceware',
        wordCount: 5,
        separator: '-',
      },
    },
    {
      title: '20-Char Strong Password',
      description: 'High-entropy random characters with symbols',
      input: {
        mode: 'random_password',
        passwordLength: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeAmbiguous: true,
      },
    },
    {
      title: '256-bit API Secret',
      description: '32-byte cryptographic hex token',
      input: {
        mode: 'hex_key',
        byteLength: 32,
      },
    },
  ],
  execute: executePassphraseGenerator,
  Component: PassphraseGeneratorUI,
};
