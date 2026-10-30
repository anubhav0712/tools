import { describe, it, expect } from 'vitest';
import { executeTextAnalyzer } from './engine';

describe('Text Analyzer Engine', () => {
  it('accurately counts words and characters', () => {
    const input = { text: 'The quick brown fox jumps over the lazy dog.' };
    const res = executeTextAnalyzer(input);

    expect(res.words).toBe(9);
    expect(res.characters).toBe(44);
    expect(res.charactersNoSpaces).toBe(36);
    expect(res.sentences).toBe(1);
    expect(res.paragraphs).toBe(1);
  });

  it('handles empty text gracefully', () => {
    const res = executeTextAnalyzer({ text: '    ' });
    expect(res.words).toBe(0);
    expect(res.characters).toBe(0);
    expect(res.sentences).toBe(0);
    expect(res.readingTimeMinutes).toBe(0);
  });

  it('handles multi-paragraph text and reading time estimation', () => {
    const text = 'First paragraph here.\n\nSecond paragraph here with more content.';
    const res = executeTextAnalyzer({ text });
    expect(res.paragraphs).toBe(2);
    expect(res.words).toBe(9);
    expect(res.readingTimeMinutes).toBeGreaterThan(0);
  });
});
