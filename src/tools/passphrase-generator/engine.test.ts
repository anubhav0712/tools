import { describe, it, expect } from 'vitest';
import { executePassphraseGenerator } from './engine';

describe('Passphrase Generator Engine', () => {
  it('generates a 5-word Diceware passphrase with custom separator', () => {
    const result = executePassphraseGenerator({
      mode: 'diceware',
      wordCount: 5,
      separator: '-',
    });

    expect(result.isValid).toBe(true);
    const words = result.generatedSecret.split('-');
    expect(words.length).toBe(5);
    expect(result.entropyBits).toBeGreaterThanOrEqual(40);
    expect(result.strengthGrade).toBeDefined();
  });

  it('generates a random password of specified length with all charsets', () => {
    const result = executePassphraseGenerator({
      mode: 'random_password',
      passwordLength: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeAmbiguous: false,
    });

    expect(result.isValid).toBe(true);
    expect(result.generatedSecret.length).toBe(24);
    expect(result.entropyBits).toBeGreaterThan(100);
    expect(['strong', 'very_strong']).toContain(result.strengthGrade);
  });

  it('excludes ambiguous characters when flag is set', () => {
    const result = executePassphraseGenerator({
      mode: 'random_password',
      passwordLength: 50,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeAmbiguous: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.generatedSecret).not.toMatch(/[01lIO]/);
  });

  it('generates 32-byte hex key', () => {
    const result = executePassphraseGenerator({
      mode: 'hex_key',
      byteLength: 32,
    });

    expect(result.isValid).toBe(true);
    expect(result.generatedSecret.length).toBe(64); // 32 bytes = 64 hex chars
    expect(result.entropyBits).toBe(256);
    expect(result.strengthGrade).toBe('very_strong');
  });

  it('generates valid UUID v4', () => {
    const result = executePassphraseGenerator({
      mode: 'uuid',
    });

    expect(result.isValid).toBe(true);
    expect(result.generatedSecret).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('fails gracefully when all character sets are deselected', () => {
    const result = executePassphraseGenerator({
      mode: 'random_password',
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false,
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('select at least one character set');
  });
});
