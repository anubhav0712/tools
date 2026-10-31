import { describe, it, expect } from 'vitest';
import { executeCronParser } from './engine';

describe('Cron Parser Engine', () => {
  it('correctly parses and humanizes "*/15 * * * *"', () => {
    const result = executeCronParser({ expression: '*/15 * * * *', previewCount: 5 });
    expect(result.isValid).toBe(true);
    expect(result.humanDescription).toBe('Every 15 minutes');
    expect(result.nextRuns.length).toBe(5);
    expect(result.fields.length).toBe(5);
  });

  it('correctly parses standard "@daily" preset', () => {
    const result = executeCronParser({ expression: '@daily', previewCount: 3 });
    expect(result.isValid).toBe(true);
    expect(result.expression).toBe('0 0 * * *');
    expect(result.humanDescription).toContain('At 12:00 AM');
    expect(result.nextRuns.length).toBe(3);
  });

  it('correctly handles weekday schedule "0 9 * * 1-5"', () => {
    const result = executeCronParser({ expression: '0 9 * * 1-5', previewCount: 4 });
    expect(result.isValid).toBe(true);
    expect(result.humanDescription).toBe('At 9:00 AM, Monday through Friday');
    expect(result.nextRuns.length).toBe(4);
  });

  it('correctly handles named weekdays and months like "0 9 * JAN MON-FRI"', () => {
    const result = executeCronParser({ expression: '0 9 * JAN MON-FRI', previewCount: 3 });
    expect(result.isValid).toBe(true);
    expect(result.fields[3].raw).toBe('JAN');
    expect(result.fields[4].raw).toBe('MON-FRI');
  });

  it('rejects invalid segment count', () => {
    const result = executeCronParser({ expression: '* * *' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('require exactly 5 fields');
  });

  it('rejects out of bounds values (e.g. minute 75)', () => {
    const result = executeCronParser({ expression: '75 * * * *' });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('out of allowed bounds');
  });

  it('handles empty expression gracefully', () => {
    const result = executeCronParser({ expression: '' });
    expect(result.isValid).toBe(true);
    expect(result.nextRuns).toEqual([]);
  });
});
