import { describe, it, expect } from 'vitest';
import { executeImageCompressor, calculateDimensions } from './engine';

describe('Image Compressor Engine', () => {
  it('correctly calculates scaled dimensions respecting aspect ratio', () => {
    const scaled = calculateDimensions(4000, 2000, 2000, undefined);
    expect(scaled.width).toBe(2000);
    expect(scaled.height).toBe(1000);
  });

  it('handles zero or negative input dimensions safely', () => {
    const scaled = calculateDimensions(0, 0, 1920, 1080);
    expect(scaled.width).toBeGreaterThanOrEqual(1);
    expect(scaled.height).toBeGreaterThanOrEqual(1);
  });

  it('does not upscale smaller images', () => {
    const scaled = calculateDimensions(800, 600, 1920, 1080);
    expect(scaled.width).toBe(800);
    expect(scaled.height).toBe(600);
  });

  it('processes image blob input in test environment', async () => {
    const mockBlob = new Blob(['mock-binary-image-data-bytes'], { type: 'image/jpeg' });
    const result = await executeImageCompressor({
      fileBlob: mockBlob,
      quality: 0.8,
      format: 'image/webp',
    });

    expect(result.isValid).toBe(true);
    expect(result.originalSizeBytes).toBe(mockBlob.size);
    expect(result.compressedSizeBytes).toBeDefined();
  });

  it('handles null/undefined file blob gracefully', async () => {
    const result = await executeImageCompressor({});
    expect(result.isValid).toBe(true);
    expect(result.originalSizeBytes).toBe(0);
    expect(result.reductionPercentage).toBe(0);
  });
});
