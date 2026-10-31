import { describe, it, expect } from 'vitest';
import { executeExifScrubber } from './engine';

function createMockJpegWithExif(): ArrayBuffer {
  // Construct a minimal valid JPEG with APP1 segment
  const app1Data = new Uint8Array([
    0xff, 0xd8, // SOI
    0xff, 0xe1, // APP1 marker
    0x00, 0x2e, // Segment length (46 bytes)
    // "Exif\0\0"
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
    // TIFF Header: 'II' (Little Endian), 0x002A, offset 8
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
    // IFD0: 1 entry
    0x01, 0x00,
    // Entry 1: Tag 0x010F (Make), Type 2 (ASCII), Count 7, Value offset 26
    0x0f, 0x01, 0x02, 0x00, 0x07, 0x00, 0x00, 0x00, 0x1a, 0x00, 0x00, 0x00,
    // Next IFD offset: 0
    0x00, 0x00, 0x00, 0x00,
    // String data at offset 26 (from TIFF header = index 14+26 = 40): "Canon\0"
    0x43, 0x61, 0x6e, 0x6f, 0x6e, 0x00, 0x00, 0x00,
    // SOS marker and image data
    0xff, 0xda, 0x00, 0x08, 0x01, 0x02, 0x03, 0x04,
    // EOI
    0xff, 0xd9,
  ]);

  return app1Data.buffer;
}

describe('EXIF Scrubber Engine', () => {
  it('detects and extracts camera metadata from JPEG', () => {
    const buffer = createMockJpegWithExif();
    const result = executeExifScrubber({ fileBuffer: buffer });

    expect(result.isValid).toBe(true);
    expect(result.extracted.hasExif).toBe(true);
    expect(result.extracted.make).toBe('Canon');
  });

  it('removes APP1 EXIF segment completely in cleanedBuffer', () => {
    const buffer = createMockJpegWithExif();
    const result = executeExifScrubber({ fileBuffer: buffer });

    expect(result.cleanedBuffer).toBeDefined();
    expect(result.cleanedByteSize).toBeLessThan(result.originalByteSize);
    expect(result.bytesSaved).toBeGreaterThan(0);

    // Verify cleaned buffer has no APP1 marker
    const recheck = executeExifScrubber({ fileBuffer: result.cleanedBuffer });
    expect(recheck.extracted.hasExif).toBe(false);
  });

  it('handles empty buffer gracefully', () => {
    const result = executeExifScrubber({ fileBuffer: new ArrayBuffer(0) });
    expect(result.isValid).toBe(true);
    expect(result.extracted.hasExif).toBe(false);
    expect(result.bytesSaved).toBe(0);
  });
});
