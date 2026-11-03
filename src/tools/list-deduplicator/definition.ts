import type { ToolDefinition } from '../../core/types';
import { executeListDeduplicator } from './engine';
import { ListDeduplicatorUI } from './ui';

export type SetOperation = 'dedupe' | 'union' | 'intersection' | 'difference';

export interface ListDeduplicatorInput {
  listA: string;
  listB?: string;
  operation: SetOperation;
  caseSensitive?: boolean;
  trimWhitespace?: boolean;
  sortOrder?: 'none' | 'asc' | 'desc' | 'numeric';
}

export interface ListDeduplicatorOutput {
  isValid: boolean;
  resultList: string[];
  resultText: string;
  originalCount: number;
  uniqueCount: number;
  duplicatesRemoved: number;
}

export const listDeduplicatorTool: ToolDefinition<
  ListDeduplicatorInput,
  ListDeduplicatorOutput
> = {
  metadata: {
    id: 'list-deduplicator',
    name: 'List Deduplicator & Set Ops',
    category: 'text',
    description: 'Deduplicate, sort, and calculate set union, intersection, and difference between lists 100% locally.',
    keywords: ['list', 'deduplicate', 'unique', 'sort', 'intersection', 'union', 'set', 'text'],
    version: '1.0.0',
    icon: 'ListFilter',
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'Discrete Mathematics Set Operations (Zermelo-Fraenkel set theory)',
      lastReviewedDate: '2026-10-31',
      changeRisk: 'none',
      notes: 'Mathematical set operations (intersection, union, relative complement) are invariant.',
    },
  },
  examples: [
    {
      title: 'Email List Deduplication',
      description: 'Remove duplicates from subscriber list',
      input: {
        listA: 'alice@example.com\nbob@example.com\nalice@example.com\ncharlie@example.com\nBOB@EXAMPLE.COM',
        operation: 'dedupe',
        caseSensitive: false,
        trimWhitespace: true,
        sortOrder: 'asc',
      },
    },
    {
      title: 'Common Customers (Intersection)',
      description: 'Find user IDs present in both Campaign A and Campaign B',
      input: {
        listA: 'USR_101\nUSR_102\nUSR_103\nUSR_104',
        listB: 'USR_103\nUSR_104\nUSR_105\nUSR_106',
        operation: 'intersection',
        caseSensitive: false,
        trimWhitespace: true,
        sortOrder: 'asc',
      },
    },
  ],
  execute: executeListDeduplicator,
  Component: ListDeduplicatorUI,
};
