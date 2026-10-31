import { describe, it, expect } from 'vitest';
import { executeRegexTester } from './engine';

describe('RegEx Tester Engine', () => {
  it('finds global matches with capture groups', () => {
    const text = 'test user@example.com and dev@company.org done';
    const result = executeRegexTester({
      pattern: '([a-z]+)@([a-z.]+)',
      flags: 'g',
      testText: text,
    });

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(2);
    expect(result.matches[0].match).toBe('user@example.com');
    expect(result.matches[0].groups.length).toBe(2);
    expect(result.matches[0].groups[0].value).toBe('user');
    expect(result.matches[0].groups[1].value).toBe('example.com');
  });

  it('supports named capture groups', () => {
    const text = '2026-10-31';
    const result = executeRegexTester({
      pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})',
      flags: '',
      testText: text,
    });

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    const groups = result.matches[0].groups;
    expect(groups.find((g) => g.name === 'year')?.value).toBe('2026');
    expect(groups.find((g) => g.name === 'month')?.value).toBe('10');
    expect(groups.find((g) => g.name === 'day')?.value).toBe('31');
  });

  it('catches invalid regex syntax gracefully', () => {
    const result = executeRegexTester({
      pattern: '[unclosed',
      flags: 'g',
      testText: 'sample text',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.matchCount).toBe(0);
  });

  it('generates highlighted segments accurately', () => {
    const text = 'abc123def';
    const result = executeRegexTester({
      pattern: '\\d+',
      flags: 'g',
      testText: text,
    });

    expect(result.isValid).toBe(true);
    expect(result.highlightedSegments.length).toBe(3);
    expect(result.highlightedSegments[0]).toEqual({ text: 'abc', isMatch: false });
    expect(result.highlightedSegments[1]).toEqual({ text: '123', isMatch: true, matchIndex: 1 });
    expect(result.highlightedSegments[2]).toEqual({ text: 'def', isMatch: false });
  });

  it('handles empty pattern gracefully', () => {
    const result = executeRegexTester({
      pattern: '',
      testText: 'hello world',
    });

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(0);
  });
});
