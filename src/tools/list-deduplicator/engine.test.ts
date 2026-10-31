import { describe, it, expect } from 'vitest';
import { executeListDeduplicator } from './engine';

describe('List Deduplicator Engine', () => {
  it('deduplicates case-insensitively and tracks duplicates count', () => {
    const list = 'apple\nbanana\nApple\norange\nBANANA';
    const result = executeListDeduplicator({
      listA: list,
      operation: 'dedupe',
      caseSensitive: false,
      trimWhitespace: true,
      sortOrder: 'none',
    });

    expect(result.isValid).toBe(true);
    expect(result.originalCount).toBe(5);
    expect(result.uniqueCount).toBe(3);
    expect(result.duplicatesRemoved).toBe(2);
    expect(result.resultList).toEqual(['apple', 'banana', 'orange']);
  });

  it('computes set intersection between List A and List B', () => {
    const listA = '101\n102\n103\n104';
    const listB = '103\n104\n105\n106';
    const result = executeListDeduplicator({
      listA,
      listB,
      operation: 'intersection',
      sortOrder: 'asc',
    });

    expect(result.isValid).toBe(true);
    expect(result.resultList).toEqual(['103', '104']);
  });

  it('computes set difference (A minus B)', () => {
    const listA = '101\n102\n103';
    const listB = '102\n104';
    const result = executeListDeduplicator({
      listA,
      listB,
      operation: 'difference',
    });

    expect(result.isValid).toBe(true);
    expect(result.resultList).toEqual(['101', '103']);
  });

  it('supports numeric sort order', () => {
    const list = '10\n2\n1\n20\n3';
    const result = executeListDeduplicator({
      listA: list,
      operation: 'dedupe',
      sortOrder: 'numeric',
    });

    expect(result.resultList).toEqual(['1', '2', '3', '10', '20']);
  });

  it('handles empty input gracefully', () => {
    const result = executeListDeduplicator({ listA: '', operation: 'dedupe' });
    expect(result.isValid).toBe(true);
    expect(result.resultList).toEqual([]);
    expect(result.originalCount).toBe(0);
  });
});
