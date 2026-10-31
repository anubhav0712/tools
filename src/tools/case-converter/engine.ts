import type {
  CaseConverterInput,
  CaseConverterOutput,
  CaseFormatResult,
} from './definition';

function splitIntoWords(str: string): string[] {
  if (!str.trim()) return [];

  // Split on camelCase boundaries, snake_case, kebab-case, dots, and whitespace
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/[-_.\s/\\+]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function executeCaseConverter(input: CaseConverterInput): CaseConverterOutput {
  const text = (input?.text || '').trim();

  if (!text) {
    return {
      isValid: true,
      formats: [],
      characterCount: 0,
      wordCount: 0,
    };
  }

  const words = splitIntoWords(text);
  const cleanWords = words.map((w) => removeAccents(w).toLowerCase());

  // camelCase
  const camelCase =
    cleanWords.length === 0
      ? ''
      : cleanWords[0] +
        cleanWords
          .slice(1)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join('');

  // PascalCase
  const pascalCase = cleanWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  // snake_case
  const snakeCase = cleanWords.join('_');

  // kebab-case
  const kebabCase = cleanWords.join('-');

  // CONSTANT_CASE
  const constantCase = cleanWords.map((w) => w.toUpperCase()).join('_');

  // Title Case
  const titleCase = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // Sentence case
  const sentenceCase =
    words.length === 0
      ? ''
      : words
          .join(' ')
          .toLowerCase()
          .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

  // Clean URL slug
  const slug = removeAccents(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const formats: CaseFormatResult[] = [
    { id: 'camelCase', label: 'camelCase', value: camelCase },
    { id: 'pascalCase', label: 'PascalCase', value: pascalCase },
    { id: 'snake_case', label: 'snake_case', value: snakeCase },
    { id: 'kebab-case', label: 'kebab-case', value: kebabCase },
    { id: 'constantCase', label: 'CONSTANT_CASE', value: constantCase },
    { id: 'titleCase', label: 'Title Case', value: titleCase },
    { id: 'sentenceCase', label: 'Sentence case', value: sentenceCase },
    { id: 'slug', label: 'URL Slug', value: slug },
    { id: 'lowercase', label: 'lowercase', value: text.toLowerCase() },
    { id: 'uppercase', label: 'UPPERCASE', value: text.toUpperCase() },
  ];

  return {
    isValid: true,
    formats,
    characterCount: text.length,
    wordCount: words.length,
  };
}
