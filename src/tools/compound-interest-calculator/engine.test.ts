import { describe, it, expect } from 'vitest';
import { executeCompoundInterest } from './engine';

describe('Compound Interest Calculator Engine', () => {
  it('correctly calculates annual compounding without deposits', () => {
    // 10,000 at 10% for 3 years:
    // Year 1: 11,000
    // Year 2: 12,100
    // Year 3: 13,310
    const res = executeCompoundInterest({
      initialPrincipal: 10000,
      annualInterestRate: 10,
      investmentYears: 3,
      compoundingFrequency: 'annually',
      regularDeposit: 0,
    });

    expect(res.initialPrincipal).toBe(10000);
    expect(res.finalBalance).toBe(13310);
    expect(res.totalInterest).toBe(3310);
    expect(res.yearlySchedule).toHaveLength(3);
    expect(res.yearlySchedule[2].endBalance).toBe(13310);
  });

  it('handles monthly compounding with regular monthly deposits', () => {
    const res = executeCompoundInterest({
      initialPrincipal: 5000,
      annualInterestRate: 7,
      investmentYears: 5,
      compoundingFrequency: 'monthly',
      regularDeposit: 200,
      depositFrequency: 'monthly',
    });

    expect(res.finalBalance).toBeGreaterThan(res.totalContributions);
    expect(res.totalContributions).toBe(5000 + 200 * 60);
    expect(res.compoundAdvantage).toBeGreaterThan(0);
  });

  it('handles zero principal and edge inputs safely', () => {
    const res = executeCompoundInterest({
      initialPrincipal: 0,
      annualInterestRate: 0,
      investmentYears: 1,
      compoundingFrequency: 'monthly',
    });

    expect(res.finalBalance).toBe(0);
    expect(res.totalInterest).toBe(0);
  });

  it('calculates Truth in Savings APY and exact doubling period', () => {
    const res = executeCompoundInterest({
      initialPrincipal: 10000,
      annualInterestRate: 6,
      investmentYears: 5,
      compoundingFrequency: 'monthly',
    });

    expect(res.apyPercent).toBeGreaterThan(6.0);
    expect(res.apyPercent).toBeLessThan(6.2);
    expect(res.exactDoublingYears).toBeGreaterThan(11);
    expect(res.exactDoublingYears).toBeLessThan(12);
  });
});
