import type { ToolDefinition } from '../../core/types';
import { executeMarkdownPreview } from './engine';
import { MarkdownPreviewUI } from './ui';

export interface TocItem {
  level: number;
  text: string;
  id: string;
}

export interface MarkdownPreviewInput {
  markdown: string;
}

export interface MarkdownPreviewOutput {
  isValid: boolean;
  html: string;
  tableOfContents: TocItem[];
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
}

export const markdownPreviewTool: ToolDefinition<
  MarkdownPreviewInput,
  MarkdownPreviewOutput
> = {
  metadata: {
    id: 'markdown-preview',
    name: 'Markdown Live Preview',
    category: 'text',
    description: 'Edit, preview, and export Markdown documents with GitHub Flavored styling and table of contents.',
    keywords: ['markdown', 'preview', 'gfm', 'html', 'docs', 'editor', 'notes', 'text'],
    version: '1.0.0',
    icon: 'BookOpen',
  },
  examples: [
    {
      title: 'Project Documentation Sample',
      description: 'Markdown with headers, tables, blockquotes, and code',
      input: {
        markdown: `# Project Antigravity\n\n> 100% In-Browser, Zero-Egress Suite.\n\n## Core Principles\n- **Zero Server Uploads**: Runs entirely in the client sandbox\n- **Zero Tracking**: No Google Analytics or third-party pixels\n\n### Comparison Table\n| Feature | Antigravity | Legacy Tools |\n| --- | --- | --- |\n| Offline Ready | Yes | No |\n| Privacy Protected | 100% | Often Leaks |\n\n\`\`\`typescript\n// Sample code snippet\nconst isPrivate = true;\nconsole.log({ isPrivate });\n\`\`\``,
      },
    },
  ],
  execute: executeMarkdownPreview,
  Component: MarkdownPreviewUI,
};
