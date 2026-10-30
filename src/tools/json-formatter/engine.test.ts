import { describe, it, expect } from 'vitest';
import { executeJsonFormatter } from './engine';

describe('JSON Formatter Engine', () => {
  it('formats valid JSON with standard indentation', () => {
    const input = {
      rawJson: '{"name":"John","age":30}',
      indent: 2,
      sortKeys: false,
    };
    const result = executeJsonFormatter(input);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.formatted).toBe('{\n  "name": "John",\n  "age": 30\n}');
    expect(result.lineCount).toBe(4);
  });

  it('minifies JSON when indent is 0', () => {
    const input = {
      rawJson: '{\n  "name": "John",\n  "age": 30\n}',
      indent: 0,
      sortKeys: false,
    };
    const result = executeJsonFormatter(input);

    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('{"name":"John","age":30}');
    expect(result.lineCount).toBe(1);
  });

  it('sorts keys alphabetically when sortKeys is true', () => {
    const input = {
      rawJson: '{"zebra": 1, "apple": 2, "banana": 3}',
      indent: 2,
      sortKeys: true,
    };
    const result = executeJsonFormatter(input);

    expect(result.isValid).toBe(true);
    const keys = Object.keys(JSON.parse(result.formatted));
    expect(keys).toEqual(['apple', 'banana', 'zebra']);
  });

  it('detects and reports invalid JSON syntax errors', () => {
    const input = {
      rawJson: '{"name": "John", invalid}',
      indent: 2,
      sortKeys: false,
    };
    const result = executeJsonFormatter(input);

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.formatted).toBe(input.rawJson);
  });

  it('handles empty input gracefully', () => {
    const result = executeJsonFormatter({ rawJson: '   ', indent: 2, sortKeys: false });
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('');
    expect(result.byteSize).toBe(0);
  });

  it('handles undefined or missing rawJson without crashing', () => {
    const result = executeJsonFormatter({} as any);
    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('');
    expect(result.byteSize).toBe(0);
  });
});
