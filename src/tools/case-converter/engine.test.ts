import { describe, it, expect } from 'vitest';
import { executeCaseConverter } from './engine';

describe('Case Converter Engine', () => {
  it('converts multi-word string to all programming cases', () => {
    const input = 'hello world from AGY';
    const result = executeCaseConverter({ text: input });

    expect(result.isValid).toBe(true);
    expect(result.wordCount).toBe(4);

    const camel = result.formats.find((f) => f.id === 'camelCase')?.value;
    const pascal = result.formats.find((f) => f.id === 'pascalCase')?.value;
    const snake = result.formats.find((f) => f.id === 'snake_case')?.value;
    const kebab = result.formats.find((f) => f.id === 'kebab-case')?.value;
    const constant = result.formats.find((f) => f.id === 'constantCase')?.value;

    expect(camel).toBe('helloWorldFromAgy');
    expect(pascal).toBe('HelloWorldFromAgy');
    expect(snake).toBe('hello_world_from_agy');
    expect(kebab).toBe('hello-world-from-agy');
    expect(constant).toBe('HELLO_WORLD_FROM_AGY');
  });

  it('correctly cleans accents and punctuation into an SEO slug', () => {
    const input = 'Crème Brûlée & Coffee!';
    const result = executeCaseConverter({ text: input });

    const slug = result.formats.find((f) => f.id === 'slug')?.value;
    expect(slug).toBe('creme-brulee-coffee');
  });

  it('handles existing camelCase input properly', () => {
    const input = 'mySuperAwesomeFunction';
    const result = executeCaseConverter({ text: input });

    const snake = result.formats.find((f) => f.id === 'snake_case')?.value;
    expect(snake).toBe('my_super_awesome_function');
  });

  it('handles empty input gracefully', () => {
    const result = executeCaseConverter({ text: '' });
    expect(result.isValid).toBe(true);
    expect(result.formats).toEqual([]);
    expect(result.wordCount).toBe(0);
  });
});
