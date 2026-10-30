import { describe, it, expect } from 'vitest';
import { executeSipCalculator } from './engine';

describe('SIP Calculator Engine', () => {
  it('calculates regular monthly SIP growth over 10 years at 12%', () => {
    const res = executeSipCalculator({
      monthlyInvestment: 10000,
      annualExpectedReturn: 12,
      investmentYears: 10,
    });

    expect(res.totalInvested).toBe(1200000); // 10,000 * 120
    expect(res.maturityValue).toBeGreaterThan(2300000); // ~23.2 Lakhs
    expect(res.totalReturns).toBeGreaterThan(1100000);
    expect(res.yearlySchedule.length).toBe(10);
  });

  it('calculates step-up SIP growth', () => {
    const regular = executeSipCalculator({
      monthlyInvestment: 10000,
      annualExpectedReturn: 12,
      investmentYears: 10,
      annualStepUpPercent: 0,
    });

    const withStepUp = executeSipCalculator({
      monthlyInvestment: 10000,
      annualExpectedReturn: 12,
      investmentYears: 10,
      annualStepUpPercent: 10,
    });

    expect(withStepUp.totalInvested).toBeGreaterThan(regular.totalInvested);
    expect(withStepUp.maturityValue).toBeGreaterThan(regular.maturityValue);
  });

  it('handles zero monthly investment', () => {
    const res = executeSipCalculator({
      monthlyInvestment: 0,
      annualExpectedReturn: 12,
      investmentYears: 5,
    });

    expect(res.totalInvested).toBe(0);
    expect(res.maturityValue).toBe(0);
  });
});
