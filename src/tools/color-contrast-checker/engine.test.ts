import { describe, it, expect } from 'vitest';
import { executeColorContrastChecker } from './engine';

describe('Color Contrast Checker Engine', () => {
  it('correctly calculates 21:1 for black on white', () => {
    const result = executeColorContrastChecker({
      foregroundHex: '#000000',
      backgroundHex: '#FFFFFF',
    });

    expect(result.isValid).toBe(true);
    expect(result.contrastRatio).toBe(21);
    expect(result.wcagAaNormal).toBe(true);
    expect(result.wcagAaLarge).toBe(true);
    expect(result.wcagAaaNormal).toBe(true);
    expect(result.wcagAaaLarge).toBe(true);
    expect(result.wcagUiComponent).toBe(true);
  });

  it('fails low contrast gray on white', () => {
    const result = executeColorContrastChecker({
      foregroundHex: '#CCCCCC',
      backgroundHex: '#FFFFFF',
    });

    expect(result.isValid).toBe(true);
    expect(result.contrastRatio).toBeLessThan(2);
    expect(result.wcagAaNormal).toBe(false);
    expect(result.wcagAaaNormal).toBe(false);
  });

  it('generates 10 Tailwind palette shades', () => {
    const result = executeColorContrastChecker({
      foregroundHex: '#4F46E5',
      backgroundHex: '#FFFFFF',
    });

    expect(result.isValid).toBe(true);
    expect(result.paletteShades.length).toBe(10);
    expect(result.paletteShades[0].shade).toBe(50);
    expect(result.paletteShades[9].shade).toBe(900);
  });

  it('reports error on invalid hex code', () => {
    const result = executeColorContrastChecker({
      foregroundHex: '#ZZZZZZ',
      backgroundHex: '#FFFFFF',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
