import type { ToolDefinition } from '../../core/types';
import { executePhotoRedactor } from './engine';
import { PhotoRedactorUI } from './ui';

export type RedactionType = 'pixelate' | 'blur' | 'blackout';

export interface RedactionRegion {
  id: string;
  type: RedactionType;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity?: number; // Block size for pixelate (e.g. 10-30), blur radius for blur (e.g. 8-25)
}

export interface PhotoRedactorInput {
  fileBlob?: Blob;
  regions?: RedactionRegion[];
  stripMetadata?: boolean;
  outputFormat?: 'image/png' | 'image/jpeg';
  quality?: number;
}

export interface PhotoRedactorOutput {
  isValid: boolean;
  error?: string;
  processedBlob?: Blob;
  redactionsApplied: number;
  originalSizeBytes: number;
  processedSizeBytes: number;
}

export const photoRedactorTool: ToolDefinition<
  PhotoRedactorInput,
  PhotoRedactorOutput
> = {
  metadata: {
    id: 'photo-redactor',
    name: 'Private Photo Redactor & Sensitive Blur',
    category: 'visual',
    description: 'Irreversibly blur, pixelate, or black out sensitive personal data (IDs, credit cards, faces, addresses) 100% locally in your browser.',
    keywords: [
      'redact',
      'blur',
      'pixelate',
      'censor',
      'privacy',
      'blackout',
      'sensitive',
      'pii',
      'face-blur',
      'exif',
      'sanitize',
    ],
    version: '1.0.0',
    icon: 'Shield',
    persistableInUrl: false,
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'data-privacy-law',
      governingBodyOrStandard: 'W3C Canvas 2D Context / NIST SP 800-88 Media Sanitization Guidelines',
      lastReviewedDate: '2026-11-03',
      changeRisk: 'low',
      notes: 'Canvas pixel destructive modification overwrites backing memory buffers with zero external server transmission.',
    },
  },
  examples: [],
  execute: executePhotoRedactor,
  Component: PhotoRedactorUI,
};
