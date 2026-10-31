import { describe, it, expect } from 'vitest';
import { executeCsvJsonConverter } from './engine';

describe('CSV JSON Converter Engine', () => {
  it('converts basic CSV to JSON array of objects', () => {
    const csv = 'id,name,role\n1,Alice,Dev\n2,Bob,QA';
    const result = executeCsvJsonConverter({
      direction: 'csv_to_json',
      data: csv,
      delimiter: ',',
      hasHeader: true,
      indent: 2,
    });

    expect(result.isValid).toBe(true);
    expect(result.rowCount).toBe(2);
    expect(result.columnCount).toBe(3);
    const parsed = JSON.parse(result.converted);
    expect(parsed[0].name).toBe('Alice');
    expect(parsed[1].role).toBe('QA');
  });

  it('handles CSV with quoted fields containing commas', () => {
    const csv = 'name,address\n"Smith, John","123 Main St, Apt 4"';
    const result = executeCsvJsonConverter({
      direction: 'csv_to_json',
      data: csv,
      delimiter: ',',
      hasHeader: true,
    });

    expect(result.isValid).toBe(true);
    const parsed = JSON.parse(result.converted);
    expect(parsed[0].name).toBe('Smith, John');
    expect(parsed[0].address).toBe('123 Main St, Apt 4');
  });

  it('anonymizes specified columns when requested', () => {
    const csv = 'id,email,score\n1,john@secret.org,95';
    const result = executeCsvJsonConverter({
      direction: 'csv_to_json',
      data: csv,
      anonymizeColumns: ['email'],
      anonymizeMode: 'mask',
    });

    expect(result.isValid).toBe(true);
    const parsed = JSON.parse(result.converted);
    expect(parsed[0].email).toBe('[REDACTED]');
    expect(parsed[0].score).toBe(95);
  });

  it('converts JSON array to CSV with escaped commas', () => {
    const json = JSON.stringify([
      { name: 'Smith, Jane', age: 32 },
      { name: 'Doe, John', age: 40 },
    ]);
    const result = executeCsvJsonConverter({
      direction: 'json_to_csv',
      data: json,
      delimiter: ',',
      hasHeader: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.rowCount).toBe(2);
    expect(result.converted).toContain('"Smith, Jane",32');
  });

  it('converts CSV to Markdown table', () => {
    const csv = 'Product,Price\nLaptop,999\nMouse,25';
    const result = executeCsvJsonConverter({
      direction: 'csv_to_markdown',
      data: csv,
      delimiter: ',',
      hasHeader: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.converted).toContain('| Product | Price |');
    expect(result.converted).toContain('| --- | --- |');
    expect(result.converted).toContain('| Laptop | 999 |');
  });

  it('preserves leading zeroes on zip codes and numeric identifiers', () => {
    const csv = 'id,zip,score\n007,07030,95';
    const result = executeCsvJsonConverter({
      direction: 'csv_to_json',
      data: csv,
      delimiter: ',',
      hasHeader: true,
    });

    expect(result.isValid).toBe(true);
    const parsed = JSON.parse(result.converted);
    expect(parsed[0].id).toBe('007');
    expect(parsed[0].zip).toBe('07030');
    expect(parsed[0].score).toBe(95);
  });

  it('handles invalid JSON gracefully when converting to CSV', () => {
    const result = executeCsvJsonConverter({
      direction: 'json_to_csv',
      data: '{ invalid_json }',
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
