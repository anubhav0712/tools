import type { ToolDefinition } from '../../core/types';
import { executePdfManipulator } from './engine';
import { PdfManipulatorUI } from './ui';

export type PdfOperation = 'merge' | 'extract' | 'reorder';

export interface PdfManipulatorInput {
  operation: PdfOperation;
  files: Array<{ name: string; buffer: ArrayBuffer }>;
  pageRange?: string; // e.g. "1-2, 4"
  pageOrder?: number[]; // 1-based page indices e.g. [3, 1, 2]
}

export interface PdfManipulatorOutput {
  isValid: boolean;
  error?: string;
  outputBuffer?: ArrayBuffer;
  totalPages: number;
  originalPageCount: number;
  byteSize: number;
}

export const pdfManipulatorTool: ToolDefinition<
  PdfManipulatorInput,
  PdfManipulatorOutput
> = {
  metadata: {
    id: 'pdf-manipulator',
    name: 'Local PDF Manipulator',
    category: 'everyday',
    description: 'Merge, split, reorder, and extract pages from sensitive PDF contracts and bank statements with zero cloud uploads.',
    keywords: ['pdf', 'merge', 'split', 'extract', 'reorder', 'pages', 'document', 'privacy'],
    version: '1.0.0',
    icon: 'Files',
    persistableInUrl: false, // Critical: Sensitive documents must NEVER leak in URL!
  },
  examples: [],
  execute: executePdfManipulator,
  Component: PdfManipulatorUI,
};
