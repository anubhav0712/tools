import type { ToolDefinition } from '../../core/types';
import { executeDiffChecker } from './engine';
import { DiffCheckerUI } from './ui';

export type DiffChangeType = 'equal' | 'insert' | 'delete';

export interface DiffCharacterChange {
  type: DiffChangeType;
  text: string;
}

export interface DiffLine {
  type: DiffChangeType;
  lineNumberOriginal?: number;
  lineNumberModified?: number;
  content: string;
  characterChanges?: DiffCharacterChange[];
}

export interface DiffCheckerInput {
  originalText: string;
  modifiedText: string;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  diffMode?: 'split' | 'unified';
}

export interface DiffCheckerOutput {
  isValid: boolean;
  error?: string;
  lines: DiffLine[];
  additionsCount: number;
  deletionsCount: number;
  unchangedCount: number;
  similarityPercentage: number;
}

export const diffCheckerTool: ToolDefinition<DiffCheckerInput, DiffCheckerOutput> = {
  metadata: {
    id: 'diff-checker',
    name: 'Diff Checker',
    category: 'developer',
    description: 'Compare text, code, or configuration files side-by-side with character-level diff highlighting.',
    keywords: ['diff', 'compare', 'code', 'merge', 'git', 'changes', 'text compare', 'patch'],
    version: '1.0.0',
    icon: 'GitCompare',
    persistableInUrl: false, // Ensure private code snippets do not leak in URL
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'Myers 1986 O(ND) Difference Algorithm / POSIX diff',
      lastReviewedDate: '2026-10-31',
      changeRisk: 'none',
      notes: 'Myers Longest Common Subsequence (LCS) algorithm is mathematically proven and invariant.',
    },
  },
  examples: [
    {
      title: 'Config Change Example',
      description: 'Environment file comparison',
      input: {
        originalText: 'PORT=3000\nNODE_ENV=development\nDB_HOST=localhost\nCACHE_ENABLED=false',
        modifiedText: 'PORT=8080\nNODE_ENV=production\nDB_HOST=db.internal.net\nCACHE_ENABLED=true\nLOG_LEVEL=info',
        ignoreWhitespace: false,
        ignoreCase: false,
        diffMode: 'split',
      },
    },
    {
      title: 'Code Refactor Example',
      description: 'JavaScript function signature modernization',
      input: {
        originalText: 'function calculateTotal(items) {\n  var total = 0;\n  for (var i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}',
        modifiedText: 'function calculateTotal(items: CartItem[]): number {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}',
        ignoreWhitespace: false,
        ignoreCase: false,
        diffMode: 'split',
      },
    },
  ],
  execute: executeDiffChecker,
  Component: DiffCheckerUI,
};
