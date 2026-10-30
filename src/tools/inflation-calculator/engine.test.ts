import { describe, it, expect } from 'vitest';
import { executeInflation } from './engine';

describe('Inflation & Purchasing Power Calculator Engine', () => {
  it('calculates future cost and purchasing power decay accurately', () => {
    // 100,000 at 6% for 12 years: Rule of 72 means prices double in ~12 years
    const res = executeInflation({
      amount: 100000,
      annualInflationRate: 6,
      years: 12,
    });

    expect(res.doublingYears).toBe(12);
    expect(res.futureCost).toBeGreaterThan(200000); // 100k * (1.06)^12 = 201,219
    expect(res.purchasingPowerValue).toBeLessThan(50000);
    expect(res.purchasingPowerLossPercent).toBeGreaterThan(50);
  });

  it('handles 0% inflation without crashing', () => {
    const res = executeInflation({
      amount: 50000,
      annualInflationRate: 0,
      years: 10,
    });

    expect(res.futureCost).toBe(50000);
    expect(res.purchasingPowerValue).toBe(50000);
    expect(res.purchasingPowerLossPercent).toBe(0);
  });

  it('calculates exact logarithmic doubling time vs Rule of 72 heuristic', () => {
    const res = executeInflation({
      amount: 100000,
      annualInflationRate: 8,
      years: 10,
    });

    expect(res.doublingYears).toBe(9); // 72 / 8 = 9
    expect(res.exactDoublingYears).toBeGreaterThan(8.9);
    expect(res.exactDoublingYears).toBeLessThan(9.1);
    expect(res.annualizedDecayRate).toBeGreaterThan(7.0);
  });
});
