import type { ToolDefinition } from '../../core/types';
import { executeImageCompressor } from './engine';
import { ImageCompressorUI } from './ui';

export type OutputImageFormat = 'image/webp' | 'image/jpeg' | 'image/png';

export interface ImageCompressorInput {
  fileBlob?: Blob;
  quality?: number; // 0.1 to 1.0
  format?: OutputImageFormat;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ImageCompressorOutput {
  isValid: boolean;
  error?: string;
  compressedBlob?: Blob;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  originalDimensions?: { width: number; height: number };
  newDimensions?: { width: number; height: number };
}

export const imageCompressorTool: ToolDefinition<
  ImageCompressorInput,
  ImageCompressorOutput
> = {
  metadata: {
    id: 'image-compressor',
    name: 'Image Compressor & WebP',
    category: 'visual',
    description: 'Compress, downscale, and convert images to WebP/JPEG locally without uploading to cloud services.',
    keywords: ['image', 'compress', 'webp', 'jpeg', 'png', 'resize', 'optimize', 'visual'],
    version: '1.0.0',
    icon: 'Minimize2',
    persistableInUrl: false,
  },
  examples: [],
  execute: executeImageCompressor,
  Component: ImageCompressorUI,
};
