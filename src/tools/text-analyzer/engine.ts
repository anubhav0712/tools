import type { TextAnalyzerInput, TextAnalyzerOutput } from './definition';

export function executeTextAnalyzer(input: TextAnalyzerInput): TextAnalyzerOutput {
  const text = input.text || '';
  const trimmed = text.trim();

  if (!trimmed) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
    };
  }

  // Count words: match non-whitespace sequences
  const words = (trimmed.match(/[\p{L}\p{N}_'-]+/gu) || []).length;

  // Characters
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  // Sentences: split by punctuation followed by space or end of string
  const sentences = (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length;

  // Paragraphs: split by double newlines or single non-empty lines
  const paragraphs = trimmed
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean).length;

  // Reading time (average 200 words per minute)
  const readingTimeMinutes = Math.max(0.1, Number((words / 200).toFixed(1)));

  // Speaking time (average 130 words per minute)
  const speakingTimeMinutes = Math.max(0.1, Number((words / 130).toFixed(1)));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes: words > 0 ? readingTimeMinutes : 0,
    speakingTimeMinutes: words > 0 ? speakingTimeMinutes : 0,
  };
}
