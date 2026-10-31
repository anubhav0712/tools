import type { ToolDefinition } from '../../core/types';
import { executeCaseConverter } from './engine';
import { CaseConverterUI } from './ui';

export interface CaseFormatResult {
  id: string;
  label: string;
  value: string;
}

export interface CaseConverterInput {
  text: string;
}

export interface CaseConverterOutput {
  isValid: boolean;
  formats: CaseFormatResult[];
  characterCount: number;
  wordCount: number;
}

export const caseConverterTool: ToolDefinition<CaseConverterInput, CaseConverterOutput> = {
  metadata: {
    id: 'case-converter',
    name: 'Case Converter & Slug Generator',
    category: 'text',
    description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, Title Case, and clean URL slugs.',
    keywords: ['case', 'converter', 'camelcase', 'snake_case', 'slug', 'pascalcase', 'text'],
    version: '1.0.0',
    icon: 'Type',
  },
  examples: [
    {
      title: 'Variable Naming',
      description: 'Convert plain words into code identifiers',
      input: {
        text: 'user authentication token validator',
      },
    },
    {
      title: 'Article Title to Slug',
      description: 'Accents and punctuation to clean SEO slug',
      input: {
        text: 'The 10 Best Crème Brûlée Recipes & Tips!',
      },
    },
  ],
  execute: executeCaseConverter,
  Component: CaseConverterUI,
};
