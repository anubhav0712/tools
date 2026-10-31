import { describe, it, expect } from 'vitest';
import { executeDiffChecker } from './engine';

describe('Diff Checker Engine', () => {
  it('returns 100% similarity and zero additions/deletions for identical text', () => {
    const text = 'line 1\nline 2\nline 3';
    const result = executeDiffChecker({ originalText: text, modifiedText: text });

    expect(result.isValid).toBe(true);
    expect(result.similarityPercentage).toBe(100);
    expect(result.additionsCount).toBe(0);
    expect(result.deletionsCount).toBe(0);
    expect(result.unchangedCount).toBe(3);
  });

  it('detects single word change and generates character-level changes', () => {
    const orig = 'The quick brown fox';
    const mod = 'The fast brown fox';
    const result = executeDiffChecker({ originalText: orig, modifiedText: mod });

    expect(result.isValid).toBe(true);
    expect(result.additionsCount).toBe(1);
    expect(result.deletionsCount).toBe(1);
    expect(result.lines.length).toBe(2);
    // Deleted line has character changes
    expect(result.lines[0].characterChanges).toBeDefined();
    expect(result.lines[1].characterChanges).toBeDefined();
  });

  it('respects ignoreWhitespace option for trailing whitespace', () => {
    const orig = 'hello   \nworld';
    const mod = 'hello\nworld  ';
    const result = executeDiffChecker({
      originalText: orig,
      modifiedText: mod,
      ignoreWhitespace: true,
    });

    expect(result.similarityPercentage).toBe(100);
    expect(result.additionsCount).toBe(0);
    expect(result.deletionsCount).toBe(0);
  });

  it('normalizes CRLF and LF newlines', () => {
    const orig = 'line1\r\nline2';
    const mod = 'line1\nline2';
    const result = executeDiffChecker({ originalText: orig, modifiedText: mod });

    expect(result.similarityPercentage).toBe(100);
    expect(result.additionsCount).toBe(0);
  });

  it('handles empty inputs without throwing errors', () => {
    const result = executeDiffChecker({ originalText: '', modifiedText: '' });
    expect(result.isValid).toBe(true);
    expect(result.lines).toEqual([]);
    expect(result.similarityPercentage).toBe(100);
  });

  it('handles completely disjoint text', () => {
    const orig = 'apple\nbanana';
    const mod = 'cat\ndog';
    const result = executeDiffChecker({ originalText: orig, modifiedText: mod });

    expect(result.similarityPercentage).toBe(0);
    expect(result.additionsCount).toBe(2);
    expect(result.deletionsCount).toBe(2);
  });
});
