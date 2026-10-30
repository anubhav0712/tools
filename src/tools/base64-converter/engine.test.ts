import { describe, it, expect } from 'vitest';
import { executeBase64Converter } from './engine';

describe('Base64 Converter Engine', () => {
  it('encodes ASCII text to standard Base64', () => {
    const res = executeBase64Converter({ text: 'Hello World', mode: 'encode', urlSafe: false });
    expect(res.isValid).toBe(true);
    expect(res.result).toBe('SGVsbG8gV29ybGQ=');
  });

  it('decodes standard Base64 back to text', () => {
    const res = executeBase64Converter({ text: 'SGVsbG8gV29ybGQ=', mode: 'decode', urlSafe: false });
    expect(res.isValid).toBe(true);
    expect(res.result).toBe('Hello World');
  });

  it('correctly handles UTF-8 emojis and special characters', () => {
    const text = 'Hello 🚀 Antigravity 🌟';
    const encoded = executeBase64Converter({ text, mode: 'encode', urlSafe: false });
    expect(encoded.isValid).toBe(true);

    const decoded = executeBase64Converter({ text: encoded.result, mode: 'decode', urlSafe: false });
    expect(decoded.isValid).toBe(true);
    expect(decoded.result).toBe(text);
  });

  it('supports URL-safe Base64 without + or / and stripped padding', () => {
    const text = 'subjects?_d=1&test=true';
    const encoded = executeBase64Converter({ text, mode: 'encode', urlSafe: true });
    expect(encoded.isValid).toBe(true);
    expect(encoded.result).not.toContain('+');
    expect(encoded.result).not.toContain('/');

    const decoded = executeBase64Converter({ text: encoded.result, mode: 'decode', urlSafe: true });
    expect(decoded.isValid).toBe(true);
    expect(decoded.result).toBe(text);
  });

  it('correctly decodes multiline or wrapped URL-safe Base64 with whitespace', () => {
    const text = 'subjects?_d=1&test=true';
    const encoded = executeBase64Converter({ text, mode: 'encode', urlSafe: true }).result;
    const multiline = `${encoded.slice(0, 10)}\n${encoded.slice(10)}`;

    const decoded = executeBase64Converter({ text: multiline, mode: 'decode', urlSafe: true });
    expect(decoded.isValid).toBe(true);
    expect(decoded.result).toBe(text);
  });

  it('reports errors for corrupted Base64 in decode mode', () => {
    const res = executeBase64Converter({ text: '!!!NotValidBase64@@@', mode: 'decode', urlSafe: false });
    expect(res.isValid).toBe(false);
    expect(res.error).toBeDefined();
  });
});
