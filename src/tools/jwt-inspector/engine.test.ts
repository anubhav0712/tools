import { describe, it, expect } from 'vitest';
import { executeJwtInspector } from './engine';

describe('JWT Inspector Engine', () => {
  it('decodes a valid active JWT with future expiration', () => {
    // Header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    // Payload: {"sub":"user_123","name":"Alice","exp":2520000000} -> eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbGljZSIsImV4cCI6MjUyMDAwMDAwMH0
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsIm5hbWUiOiJBbGljZSIsImV4cCI6MjUyMDAwMDAwMH0.mock_signature';
    const result = executeJwtInspector({ token });

    expect(result.isValid).toBe(true);
    expect(result.header.alg).toBe('HS256');
    expect(result.payload.name).toBe('Alice');
    expect(result.isExpired).toBe(false);
    expect(result.algorithm).toBe('HS256');
    expect(result.expiresAt).toBeDefined();
    expect(result.timeUntilExpiry).toContain('Expires in');
    expect(result.claimsTable.length).toBeGreaterThan(0);
  });

  it('correctly marks past expiration as isExpired: true', () => {
    // exp is 1500000000 (July 2017)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImV4cCI6MTUwMDAwMDAwMH0.mock_sig';
    const result = executeJwtInspector({ token });

    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(true);
    expect(result.timeUntilExpiry).toContain('Expired');
  });

  it('fails gracefully on invalid JWT segment counts', () => {
    const result = executeJwtInspector({ token: 'header_only.payload_only' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('3 dot-separated segments');
  });

  it('fails gracefully on corrupted Base64 strings', () => {
    const result = executeJwtInspector({ token: '!!!.@@@.###' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Failed to decode');
  });

  it('correctly decodes UTF-8 multi-byte unicode characters (emojis, accents)', () => {
    // Buffer.from('{"sub":"123","name":"André 🚀"}').toString('base64url')
    const header = 'eyJhbGciOiJIUzI1NiJ9';
    const payload = Buffer.from('{"sub":"123","name":"André 🚀"}').toString('base64url');
    const token = `${header}.${payload}.signature`;
    const result = executeJwtInspector({ token });

    expect(result.isValid).toBe(true);
    expect(result.payload.name).toBe('André 🚀');
  });

  it('handles extreme or out-of-range timestamps without throwing RangeError', () => {
    const header = 'eyJhbGciOiJIUzI1NiJ9';
    const payload = Buffer.from('{"sub":"123","exp":999999999999999,"iat":1e25,"nbf":-999999999999999}').toString('base64url');
    const token = `${header}.${payload}.signature`;
    const result = executeJwtInspector({ token });

    expect(result.isValid).toBe(true);
    expect(result.payload.exp).toBe(999999999999999);
  });

  it('handles empty input gracefully', () => {
    const result = executeJwtInspector({ token: '   ' });
    expect(result.isValid).toBe(true);
    expect(result.claimsTable).toEqual([]);
  });
});
