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
  },
  examples: [],
  execute: executeExifScrubber,
  Component: ExifScrubberUI,
};
