import { describe, it, expect } from 'vitest';
import { executeHashGenerator } from './engine';

describe('Hash Generator Engine', () => {
  it('correctly calculates SHA-256 hex digest for standard test vector', async () => {
    // "The quick brown fox jumps over the lazy dog"
    // Expected SHA-256: d7a8fbb307d7809469ca9abb0082e4f8d5651e46d3cdb762d02d0bf37c9e5924
    const result = await executeHashGenerator({
      text: 'The quick brown fox jumps over the lazy dog',
      algorithm: 'SHA-256',
    });

    expect(result.isValid).toBe(true);
    expect(result.hexDigest).toBe(
      'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592'
    );
    expect(result.algorithm).toBe('SHA-256');
    expect(result.base64Digest).toBeDefined();
  });

  it('correctly calculates MD5 digest', async () => {
    // "The quick brown fox jumps over the lazy dog" -> 9e107d9d372bb6826bd81d3542a419d6
    const result = await executeHashGenerator({
      text: 'The quick brown fox jumps over the lazy dog',
      algorithm: 'MD5',
    });

    expect(result.isValid).toBe(true);
    expect(result.hexDigest).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });

  it('computes HMAC-SHA256 signature', async () => {
    // Key "key", Data "The quick brown fox jumps over the lazy dog"
    // HMAC-SHA256: f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
    const result = await executeHashGenerator({
      text: 'The quick brown fox jumps over the lazy dog',
      algorithm: 'SHA-256',
      hmacKey: 'key',
    });

    expect(result.isValid).toBe(true);
    expect(result.hexDigest).toBe(
      'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'
    );
  });

  it('verifies checksum matching when expectedHash is provided', async () => {
    const text = 'verify-me';
    const firstRes = await executeHashGenerator({ text, algorithm: 'SHA-256' });

    const matchRes = await executeHashGenerator({
      text,
      algorithm: 'SHA-256',
      expectedHash: firstRes.hexDigest,
    });
    expect(matchRes.isMatch).toBe(true);

    const mismatchRes = await executeHashGenerator({
      text,
      algorithm: 'SHA-256',
      expectedHash: 'wronghash1234567890',
    });
    expect(mismatchRes.isMatch).toBe(false);
  });

  it('handles empty input gracefully', async () => {
    const result = await executeHashGenerator({ text: '', algorithm: 'SHA-256' });
    expect(result.isValid).toBe(true);
    // SHA-256 of empty string: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    expect(result.hexDigest).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });
});
