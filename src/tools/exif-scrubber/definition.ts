import type { ToolDefinition } from '../../core/types';
import { executeExifScrubber } from './engine';
import { ExifScrubberUI } from './ui';

export interface GpsCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  mapUrl?: string;
}

export interface ExifExtractedData {
  make?: string;
  model?: string;
  dateTime?: string;
  software?: string;
  iso?: number;
  fNumber?: string;
  exposureTime?: string;
  gps?: GpsCoordinates;
  hasExif: boolean;
}

export interface ExifScrubberInput {
  fileBuffer?: ArrayBuffer;
  fileName?: string;
  mimeType?: string;
}

export interface ExifScrubberOutput {
  isValid: boolean;
  error?: string;
  extracted: ExifExtractedData;
  cleanedBuffer?: ArrayBuffer;
  originalByteSize: number;
  cleanedByteSize: number;
  bytesSaved: number;
}

export const exifScrubberTool: ToolDefinition<
  ExifScrubberInput,
  ExifScrubberOutput
> = {
  metadata: {
    id: 'exif-scrubber',
    name: 'EXIF & GPS Scrubber',
    category: 'visual',
    description: 'Inspect and remove sensitive GPS locations, camera serials, and timestamps embedded in your photos.',
    keywords: ['exif', 'metadata', 'gps', 'photo', 'privacy', 'scrubber', 'image', 'cleaner'],
    version: '1.0.0',
    icon: 'Camera',
    persistableInUrl: false, // Never serialize binary images into URL!
    reviewPolicy: {
      cadence: 'standards-track',
      regulatoryCategory: 'data-privacy-law',
      governingBodyOrStandard: 'Camera & Imaging Products Association (CIPA DC-008-2019 / Exif 2.32 Standard)',
      lastReviewedDate: '2026-10-31',
      nextReviewDate: '2027-10-31',
      reviewTrigger: 'New EXIF metadata tag registrations or mobile computational photography privacy disclosures',
      changeRisk: 'medium',
      notes: 'Review whenever new privacy-sensitive metadata markers (e.g. spatial audio, computational photography tags, AI camera watermarks) are introduced.',
    },
  },
  examples: [],
  execute: executeExifScrubber,
  Component: ExifScrubberUI,
};
