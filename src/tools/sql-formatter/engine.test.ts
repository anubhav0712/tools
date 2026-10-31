import { describe, it, expect } from 'vitest';
import { executeSqlFormatter } from './engine';

describe('SQL Formatter Engine', () => {
  it('formats and capitalizes a basic SELECT query', () => {
    const raw = 'select id, name from users where active = 1';
    const result = executeSqlFormatter({
      sql: raw,
      mode: 'beautify',
      uppercaseKeywords: true,
      indentSpaces: 2,
    });

    expect(result.isValid).toBe(true);
    expect(result.formattedSql).toContain('SELECT id, name');
    expect(result.formattedSql).toContain('FROM users');
    expect(result.formattedSql).toContain('WHERE active = 1');
  });

  it('minifies query by stripping whitespace and comments', () => {
    const raw = `-- get active users\nSELECT id, name\nFROM users /* main table */\nWHERE active = 1;`;
    const result = executeSqlFormatter({
      sql: raw,
      mode: 'minify',
      uppercaseKeywords: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.formattedSql).not.toContain('--');
    expect(result.formattedSql).not.toContain('/*');
    expect(result.formattedSql).toBe('SELECT id, name FROM users WHERE active = 1;');
  });

  it('preserves string literals inside quotes without casing change', () => {
    const raw = `select * from logs where message = 'error: connection failed'`;
    const result = executeSqlFormatter({
      sql: raw,
      mode: 'beautify',
      uppercaseKeywords: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.formattedSql).toContain("'error: connection failed'");
  });

  it('handles empty input gracefully', () => {
    const result = executeSqlFormatter({ sql: '   ' });
    expect(result.isValid).toBe(true);
    expect(result.formattedSql).toBe('');
    expect(result.byteSize).toBe(0);
  });
});
