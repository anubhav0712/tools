import type { ToolDefinition } from '../../core/types';
import { executePassportPhotoGrid } from './engine';
import { PassportPhotoGridUI } from './ui';

export type PassportGridPresetKey =
  | 'us_passport'
  | 'schengen_eu'
  | 'india_passport'
  | 'india_visa'
  | 'uk_passport';

export interface PassportGridPresetConfig {
  id: PassportGridPresetKey;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  photoCount: number;
  gridCols: number;
  gridRows: number;
  description: string;
}

export interface PassportPhotoGridInput {
  fileBlob?: Blob;
  preset?: PassportGridPresetKey;
  zoom?: number;
  panX?: number;
  panY?: number;
  includeCuttingLines?: boolean;
}

export interface PassportPhotoGridOutput {
  isValid: boolean;
  error?: string;
  processedBlob?: Blob;
  photoCount: number;
  sheetWidthPx: number;
  sheetHeightPx: number;
  dpi: number;
  preset: PassportGridPresetKey;
}

export const passportPhotoGridTool: ToolDefinition<
  PassportPhotoGridInput,
  PassportPhotoGridOutput
> = {
  metadata: {
    id: 'passport-photo-grid',
    name: 'Printable 4x6" Passport Photo Grid Maker',
    category: 'visual',
    description: 'Tile 4, 6, or 8 passport photos onto a standard 4x6" print sheet at exact 300 DPI with cutting lines for $0.20 kiosk printing.',
    keywords: [
      'passport-photo',
      '4x6-grid',
      'printable',
      'print-sheet',
      'kiosk',
      'visa-photo',
      '300-dpi',
      'biometric',
      'photo-booth',
      'cvs',
      'walgreens',
    ],
    version: '1.0.0',
    icon: 'Grid',
    persistableInUrl: false,
    reviewPolicy: {
      cadence: 'standards-track',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'ICAO Doc 9303 (Machine Readable Travel Documents) / ISO/IEC 19794-5 (Biometric Face Format)',
      lastReviewedDate: '2026-11-03',
      nextReviewDate: '2027-11-03',
      reviewTrigger: 'Changes to ICAO Doc 9303 passport biometric guidelines or photographic 4x6 standard lab specifications',
      changeRisk: 'medium',
      notes: 'Verify 4x6 inch standard sizing at 300 DPI (1800x1200 px) and biometric country head ratios.',
    },
  },
  examples: [],
  execute: executePassportPhotoGrid,
  Component: PassportPhotoGridUI,
};
