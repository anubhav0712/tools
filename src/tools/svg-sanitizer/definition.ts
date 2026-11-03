import type { ToolDefinition } from '../../core/types';
import { executeSvgSanitizer } from './engine';
import { SvgSanitizerUI } from './ui';

export interface SvgSanitizerInput {
  rawSvg: string;
  stripDimensions?: boolean;
}

export interface SvgSanitizerOutput {
  isValid: boolean;
  error?: string;
  sanitizedSvg: string;
  removedElementsCount: number;
  originalByteSize: number;
  cleanedByteSize: number;
  bytesSaved: number;
}

export const svgSanitizerTool: ToolDefinition<SvgSanitizerInput, SvgSanitizerOutput> = {
  metadata: {
    id: 'svg-sanitizer',
    name: 'SVG Sanitizer & Cleaner',
    category: 'visual',
    description: 'Clean bloated vector files and neutralize XSS attack vectors from Illustrator, Figma, and untrusted sources.',
    keywords: ['svg', 'sanitizer', 'cleaner', 'xss', 'security', 'vector', 'optimizer', 'design'],
    version: '1.0.0',
    icon: 'Sparkles',
    reviewPolicy: {
      cadence: 'event-driven',
      regulatoryCategory: 'security-standards',
      governingBodyOrStandard: 'OWASP XSS Prevention Cheat Sheet / W3C SVG 2 Specification',
      lastReviewedDate: '2026-10-31',
      nextReviewDate: '2027-04-30',
      reviewTrigger: 'Publication of new SVG-based XSS vectors, CVEs in browser SVG engines, or W3C element additions',
      changeRisk: 'high',
      notes: 'Audit against newly discovered SVG vectors, novel script execution techniques, CSS injection, and foreignObject exploits.',
    },
  },
  examples: [
    {
      title: 'Malicious Vector with Script Tag',
      description: 'Neutralize embedded XSS payload',
      input: {
        rawSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="indigo" /><script>alert("XSS")</script></svg>',
        stripDimensions: false,
      },
    },
    {
      title: 'Bloated Illustrator Export',
      description: 'Strip XML declarations, metadata, and comments',
      input: {
        rawSvg: '<?xml version="1.0" encoding="utf-8"?>\n<!-- Generator: Adobe Illustrator 27.0.0 -->\n<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">\n<metadata><author>Designer</author></metadata>\n<rect width="200" height="200" fill="#4F46E5" />\n</svg>',
        stripDimensions: true,
      },
    },
  ],
  execute: executeSvgSanitizer,
  Component: SvgSanitizerUI,
};
