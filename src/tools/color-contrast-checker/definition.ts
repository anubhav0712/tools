import type { ToolDefinition } from '../../core/types';
import { executeColorContrastChecker } from './engine';
import { ColorContrastCheckerUI } from './ui';

export interface ColorShade {
  shade: number; // 50, 100, 200, ... 900
  hex: string;
}

export interface ColorContrastInput {
  foregroundHex: string;
  backgroundHex: string;
}

export interface ColorContrastOutput {
  isValid: boolean;
  error?: string;
  foregroundHex: string;
  backgroundHex: string;
  contrastRatio: number;
  ratioDisplay: string;
  wcagAaNormal: boolean;
  wcagAaLarge: boolean;
  wcagAaaNormal: boolean;
  wcagAaaLarge: boolean;
  wcagUiComponent: boolean;
  paletteShades: ColorShade[];
}

export const colorContrastCheckerTool: ToolDefinition<
  ColorContrastInput,
  ColorContrastOutput
> = {
  metadata: {
    id: 'color-contrast-checker',
    name: 'Color Contrast & Palette',
    category: 'visual',
    description: 'Calculate WCAG 2.1 AA/AAA accessibility contrast ratios and generate Tailwind-compatible palettes.',
    keywords: ['color', 'contrast', 'wcag', 'accessibility', 'a11y', 'palette', 'tailwind', 'hex', 'design'],
    version: '1.0.0',
    icon: 'Palette',
    reviewPolicy: {
      cadence: 'standards-track',
      regulatoryCategory: 'accessibility-std',
      governingBodyOrStandard: 'W3C Web Content Accessibility Guidelines (WCAG 2.1 / WCAG 2.2 / APCA WCAG 3.0 draft)',
      lastReviewedDate: '2026-10-31',
      nextReviewDate: '2027-04-30',
      reviewTrigger: 'W3C WAI formal releases of WCAG 2.2 adoption or WCAG 3.0 APCA contrast algorithms',
      changeRisk: 'medium',
      notes: 'Monitor W3C accessibility guidelines for transitions from WCAG 2.x relative luminance ratios to WCAG 3.0 APCA.',
    },
  },
  examples: [
    {
      title: 'High Contrast (Black on White)',
      description: 'Standard maximum accessibility score',
      input: {
        foregroundHex: '#000000',
        backgroundHex: '#FFFFFF',
      },
    },
    {
      title: 'Brand Indigo on Light Gray',
      description: 'Testing modern brand colors on UI backgrounds',
      input: {
        foregroundHex: '#4F46E5',
        backgroundHex: '#F8FAFC',
      },
    },
    {
      title: 'Dark Mode Text',
      description: 'Off-white text on Slate 900 background',
      input: {
        foregroundHex: '#F1F5F9',
        backgroundHex: '#0F172A',
      },
    },
  ],
  execute: executeColorContrastChecker,
  Component: ColorContrastCheckerUI,
};
