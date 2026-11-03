import type { ToolDefinition } from '../../core/types';
import { executeKaveriPhotoResizer } from './engine';
import { KaveriPhotoResizerUI } from './ui';

export type KaveriPresetKey = 'b2' | 'passport';
export type KaveriFileFormat = 'png' | 'jpg';
export type KaveriFitMode = 'fill' | 'fit';

export interface KaveriPhotoPresetConfig {
  width: number;
  height: number;
  maxBytes: number;
  label: string;
  ratio: string;
  limitLabel: string;
  description: string;
}

export interface KaveriPhotoResizerInput {
  fileBlob?: Blob;
  preset?: KaveriPresetKey;
  format?: KaveriFileFormat;
  fitMode?: KaveriFitMode;
  zoom?: number;
  panX?: number;
  panY?: number;
  rotation?: number; // 0, 90, 180, 270
}

export interface KaveriPhotoResizerOutput {
  isValid: boolean;
  error?: string;
  processedBlob?: Blob;
  targetWidth: number;
  targetHeight: number;
  targetMaxBytes: number;
  actualSizeBytes: number;
  isWithinSizeLimit: boolean;
  isCompliant: boolean;
  aspectRatio: string;
  format: KaveriFileFormat;
}

export const kaveriPhotoResizerTool: ToolDefinition<
  KaveriPhotoResizerInput,
  KaveriPhotoResizerOutput
> = {
  metadata: {
    id: 'kaveri-photo-resizer',
    name: 'Kaveri 2.0 Marriage Certificate Photo Resizer',
    category: 'visual',
    description: 'Calibrated specifically for Karnataka Kaveri 2.0 portal (2673×1890 px PNG under 2MB) and Sub-Registrar Office specifications.',
    keywords: [
      'kaveri',
      'marriage-certificate',
      'karnataka',
      'resizer',
      'b2',
      'photo',
      'passport',
      'sub-registrar',
      'seva-sindhu',
      'png',
    ],
    version: '1.0.0',
    icon: 'Camera',
    persistableInUrl: false,
    reviewPolicy: {
      cadence: 'event-driven',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'Karnataka Department of Stamps and Registration / Kaveri 2.0 Portal Guidelines',
      lastReviewedDate: '2026-11-03',
      nextReviewDate: '2027-11-03',
      reviewTrigger: 'Changes to Kaveri 2.0 portal image upload dimensions or file size ceiling specifications',
      changeRisk: 'medium',
      notes: 'Ensure B2 dimensions (2673x1890) and <2.0MB limits match SRO marriage registration guidelines.',
    },
  },
  examples: [],
  execute: executeKaveriPhotoResizer,
  Component: KaveriPhotoResizerUI,
};
