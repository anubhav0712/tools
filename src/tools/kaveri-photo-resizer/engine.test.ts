import { describe, it, expect } from 'vitest';
import {
  KAVERI_PRESETS,
  getRotatedDimensions,
  calculateImagePosition,
  executeKaveriPhotoResizer,
} from './engine';

describe('kaveriPhotoResizer engine', () => {
  describe('KAVERI_PRESETS specifications', () => {
    it('should have exact B2 dimensions and size ceiling for Karnataka Kaveri 2.0', () => {
      const b2 = KAVERI_PRESETS.b2;
      expect(b2.width).toBe(2673);
      expect(b2.height).toBe(1890);
      expect(b2.maxBytes).toBe(1950000);
      expect(b2.maxBytes).toBeLessThan(2000000); // Strictly under 2MB
      const ratio = b2.width / b2.height;
      expect(ratio).toBeCloseTo(1.414, 2); // ISO 216 / B2 aspect ratio
    });

    it('should have exact passport dimensions and 50KB ceiling for Seva Sindhu', () => {
      const passport = KAVERI_PRESETS.passport;
      expect(passport.width).toBe(200);
      expect(passport.height).toBe(230);
      expect(passport.maxBytes).toBe(50000);
      expect(passport.maxBytes).toBeLessThanOrEqual(50000); // Strictly <= 50KB
    });
  });

  describe('getRotatedDimensions', () => {
    it('returns original dimensions for 0 and 360 degrees', () => {
      const dim0 = getRotatedDimensions(1920, 1080, 0);
      expect(dim0).toEqual({ width: 1920, height: 1080 });

      const dim360 = getRotatedDimensions(1920, 1080, 360);
      expect(dim360).toEqual({ width: 1920, height: 1080 });
    });

    it('swaps width and height for 90 and 270 degrees', () => {
      const dim90 = getRotatedDimensions(1920, 1080, 90);
      expect(dim90).toEqual({ width: 1080, height: 1920 });

      const dim270 = getRotatedDimensions(1920, 1080, 270);
      expect(dim270).toEqual({ width: 1080, height: 1920 });
    });

    it('handles negative angles properly', () => {
      const dimNeg90 = getRotatedDimensions(1920, 1080, -90);
      expect(dimNeg90).toEqual({ width: 1080, height: 1920 });
    });

    it('guards against non-positive dimensions', () => {
      const zeroDim = getRotatedDimensions(0, -5, 0);
      expect(zeroDim.width).toBeGreaterThanOrEqual(1);
      expect(zeroDim.height).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculateImagePosition', () => {
    const targetW = 2673;
    const targetH = 1890;
    const sourceW = 4000;
    const sourceH = 3000;

    it('calculates fill mode centering correctly', () => {
      const pos = calculateImagePosition(sourceW, sourceH, targetW, targetH, 0, 'fill', 1, 0, 0);
      expect(pos.scale).toBeGreaterThan(0);
      expect(pos.drawX + (pos.rotatedWidth * pos.scale) / 2).toBeCloseTo(targetW / 2, 1);
      expect(pos.drawY + (pos.rotatedHeight * pos.scale) / 2).toBeCloseTo(targetH / 2, 1);
      expect(pos.centerX).toBeCloseTo(targetW / 2, 1);
      expect(pos.centerY).toBeCloseTo(targetH / 2, 1);
    });

    it('calculates fit mode to contain entire image within target', () => {
      const pos = calculateImagePosition(sourceW, sourceH, targetW, targetH, 0, 'fit', 1, 0, 0);
      const scaledW = pos.rotatedWidth * pos.scale;
      const scaledH = pos.rotatedHeight * pos.scale;
      expect(scaledW).toBeLessThanOrEqual(targetW + 0.01);
      expect(scaledH).toBeLessThanOrEqual(targetH + 0.01);
    });

    it('applies zoom scaling', () => {
      const posBase = calculateImagePosition(sourceW, sourceH, targetW, targetH, 0, 'fill', 1, 0, 0);
      const posZoom = calculateImagePosition(sourceW, sourceH, targetW, targetH, 0, 'fill', 1.5, 0, 0);
      expect(posZoom.scale).toBeCloseTo(posBase.scale * 1.5, 4);
    });

    it('applies pan offsets to center coordinates', () => {
      const pos = calculateImagePosition(sourceW, sourceH, targetW, targetH, 0, 'fill', 1, 50, -30);
      expect(pos.drawX).toBeCloseTo((targetW - pos.rotatedWidth * pos.scale) / 2 + 50, 1);
      expect(pos.drawY).toBeCloseTo((targetH - pos.rotatedHeight * pos.scale) / 2 - 30, 1);
    });
  });

  describe('executeKaveriPhotoResizer', () => {
    it('returns empty compliant structure when no fileBlob is provided', async () => {
      const res = await executeKaveriPhotoResizer({ preset: 'b2' });
      expect(res.isValid).toBe(true);
      expect(res.targetWidth).toBe(2673);
      expect(res.targetHeight).toBe(1890);
      expect(res.actualSizeBytes).toBe(0);
      expect(res.isCompliant).toBe(false);
    });

    it('handles headless environment execution with valid blob', async () => {
      const dummyBlob = new Blob(['mock image data'], { type: 'image/jpeg' });
      const res = await executeKaveriPhotoResizer({
        fileBlob: dummyBlob,
        preset: 'b2',
        format: 'png',
      });
      expect(res.isValid).toBe(true);
      expect(res.targetWidth).toBe(2673);
      expect(res.targetHeight).toBe(1890);
      expect(res.isWithinSizeLimit).toBe(true);
      expect(res.isCompliant).toBe(true);
    });

    it('executes passport preset accurately', async () => {
      const dummyBlob = new Blob(['mock passport'], { type: 'image/jpeg' });
      const res = await executeKaveriPhotoResizer({
        fileBlob: dummyBlob,
        preset: 'passport',
        format: 'jpg',
      });
      expect(res.isValid).toBe(true);
      expect(res.targetWidth).toBe(200);
      expect(res.targetHeight).toBe(230);
      expect(res.targetMaxBytes).toBe(50000);
    });
  });
});
