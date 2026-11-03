import { describe, it, expect } from 'vitest';
import {
  clipRegion,
  applyPixelation,
  applyBlackout,
  applyBoxBlur,
  applyRedactionsToImageData,
  executePhotoRedactor,
} from './engine';

describe('photoRedactor engine', () => {
  describe('clipRegion', () => {
    it('normalizes negative width and height', () => {
      const clipped = clipRegion(50, 50, -20, -10, 100, 100);
      expect(clipped).toEqual({ x: 30, y: 40, width: 20, height: 10 });
    });

    it('clamps regions exceeding canvas boundaries', () => {
      const clipped = clipRegion(80, 80, 50, 50, 100, 100);
      expect(clipped).toEqual({ x: 80, y: 80, width: 20, height: 20 });
    });

    it('returns null for regions completely outside image', () => {
      const clipped = clipRegion(150, 150, 50, 50, 100, 100);
      expect(clipped).toBeNull();
    });
  });

  describe('applyBlackout', () => {
    it('destructively sets target pixels to solid black (0, 0, 0)', () => {
      const width = 10;
      const height = 10;
      const buffer = new Uint8ClampedArray(width * height * 4).fill(255); // White image

      // Blackout a 4x4 box at (2, 2)
      applyBlackout(buffer, width, height, 2, 2, 4, 4);

      // Check inside blackout area
      for (let y = 2; y < 6; y++) {
        for (let x = 2; x < 6; x++) {
          const idx = (y * width + x) * 4;
          expect(buffer[idx]).toBe(0); // R
          expect(buffer[idx + 1]).toBe(0); // G
          expect(buffer[idx + 2]).toBe(0); // B
          expect(buffer[idx + 3]).toBe(255); // Alpha
        }
      }

      // Check pixel outside area remains untouched (255)
      const outsideIdx = (0 * width + 0) * 4;
      expect(buffer[outsideIdx]).toBe(255);
      expect(buffer[outsideIdx + 1]).toBe(255);
    });
  });

  describe('applyPixelation', () => {
    it('averages colors across discrete blocks destructively', () => {
      const width = 8;
      const height = 8;
      const buffer = new Uint8ClampedArray(width * height * 4);

      // Fill with alternating pattern
      for (let i = 0; i < buffer.length; i += 8) {
        buffer[i] = 100;
        buffer[i + 4] = 200;
      }

      // Pixelate entire 8x8 area with block size 4
      applyPixelation(buffer, width, height, 0, 0, 8, 8, 4);

      // In a 4x4 block, all pixels must now share the exact same R value
      const block1R = buffer[0];
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const idx = (y * width + x) * 4;
          expect(buffer[idx]).toBe(block1R);
        }
      }
    });
  });

  describe('applyBoxBlur', () => {
    it('smoothes sharp contrast transitions in target area', () => {
      const width = 10;
      const height = 10;
      const buffer = new Uint8ClampedArray(width * height * 4);

      // Sharp edge: left side black (0), right side white (255)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const val = x < 5 ? 0 : 255;
          buffer[idx] = val;
          buffer[idx + 1] = val;
          buffer[idx + 2] = val;
          buffer[idx + 3] = 255;
        }
      }

      applyBoxBlur(buffer, width, height, 0, 0, 10, 10, 2);

      // Pixel at boundary (x = 4) should no longer be 0, but blurred to intermediate value
      const edgeIdx = (5 * width + 4) * 4;
      expect(buffer[edgeIdx]).toBeGreaterThan(0);
      expect(buffer[edgeIdx]).toBeLessThan(255);
    });
  });

  describe('applyRedactionsToImageData', () => {
    it('applies multiple redactions in sequence', () => {
      const width = 16;
      const height = 16;
      const data = new Uint8ClampedArray(width * height * 4).fill(200);
      const mockImageData = {
        width,
        height,
        data,
        colorSpace: 'srgb' as PredefinedColorSpace,
      } as ImageData;

      applyRedactionsToImageData(mockImageData, [
        { id: '1', type: 'blackout', x: 0, y: 0, width: 4, height: 4 },
        { id: '2', type: 'pixelate', x: 8, y: 8, width: 6, height: 6, intensity: 3 },
      ]);

      // Region 1 must be black
      expect(data[0]).toBe(0);
      expect(data[1]).toBe(0);
      expect(data[2]).toBe(0);
    });
  });

  describe('executePhotoRedactor', () => {
    it('returns valid empty output when no fileBlob is provided', async () => {
      const res = await executePhotoRedactor({});
      expect(res.isValid).toBe(true);
      expect(res.redactionsApplied).toBe(0);
    });

    it('processes redactions in headless mode with dummy blob', async () => {
      const dummyBlob = new Blob(['sample-image'], { type: 'image/png' });
      const res = await executePhotoRedactor({
        fileBlob: dummyBlob,
        regions: [
          { id: 'r1', type: 'blackout', x: 10, y: 10, width: 50, height: 20 },
        ],
      });
      expect(res.isValid).toBe(true);
      expect(res.redactionsApplied).toBe(1);
      expect(res.originalSizeBytes).toBe(dummyBlob.size);
    });
  });
});
