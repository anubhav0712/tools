import type { ToolDefinition } from '../../core/types';
import { executeRegexTester } from './engine';
import { RegexTesterUI } from './ui';

export interface RegexMatchGroup {
  name?: string;
  index: number;
  value: string;
}

export interface RegexMatchItem {
  match: string;
  index: number;
  groups: RegexMatchGroup[];
}

export interface RegexTesterInput {
  pattern: string;
  flags?: string;
  testText: string;
}

export interface RegexTesterOutput {
  isValid: boolean;
  error?: string;
  matches: RegexMatchItem[];
  matchCount: number;
  highlightedSegments: Array<{ text: string; isMatch: boolean; matchIndex?: number }>;
}

export const regexTesterTool: ToolDefinition<RegexTesterInput, RegexTesterOutput> = {
  metadata: {
    id: 'regex-tester',
    name: 'RegEx Tester',
    category: 'developer',
    description: 'Test, evaluate, and visualize regular expressions with real-time match highlights and capture groups.',
    keywords: ['regex', 'regexp', 'regular expression', 'test', 'pattern', 'match', 'developer'],
    version: '1.0.0',
    icon: 'SearchCode',
  },
  examples: [
    {
      title: 'Email Address Extractor',
      description: 'Find all email addresses in text',
      input: {
        pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
        flags: 'g',
        testText: 'Contact support@example.com or sales@enterprise.org for assistance. Internal dev: admin@local.test',
      },
    },
    {
      title: 'Named Capture Groups (URLs)',
      description: 'Extract protocol, domain, and path',
      input: {
        pattern: '(?<protocol>https?)://(?<domain>[a-zA-Z0-9.-]+)(?<path>/[^\\s]*)?',
        flags: 'g',
        testText: 'Visit https://github.com/tools/suite or http://localhost:3000/api/v1',
      },
    },
  ],
  execute: executeRegexTester,
  Component: RegexTesterUI,
};
