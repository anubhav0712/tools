import { describe, it, expect } from 'vitest';
import { executeFd } from './engine';

describe('Fixed Deposit & CD Calculator Engine', () => {
  it('calculates quarterly compounding FD maturity accurately', () => {
    // ₹1,00,000 at 7.0% for 3 years quarterly:
    // A = 100000 * (1 + 0.07/4)^(12) = 123,143.9
    const res = executeFd({
      depositAmount: 100000,
      annualInterestRate: 7.0,
      tenureYears: 3,
      compoundingFrequency: 'quarterly',
    });

    expect(res.principal).toBe(100000);
    expect(res.maturityAmount).toBe(123144);
    expect(res.totalInterestEarned).toBe(23144);
    expect(res.absoluteReturnPercent).toBeCloseTo(23.14, 1);

    // Verify schedule reports incremental period interest distinct from cumulative interest
    expect(res.schedule).toHaveLength(3);
    const yr1 = res.schedule[0];
    const yr2 = res.schedule[1];
    expect(yr1.interestEarned).toBe(yr1.cumulativeInterest);
    expect(yr2.interestEarned).not.toBe(yr2.cumulativeInterest);
    expect(yr2.interestEarned + yr1.interestEarned).toBe(yr2.cumulativeInterest);
  });

  it('adds senior citizen bonus rate properly', () => {
    const res = executeFd({
      depositAmount: 200000,
      annualInterestRate: 7.0,
      tenureYears: 1,
      isSeniorCitizen: true,
      seniorBonusRatePercent: 0.5,
    });

    expect(res.effectiveRate).toBe(7.5);
  });

  it('calculates TDS when interest crosses threshold', () => {
    // Large deposit causing > 40,000 interest per year
    const res = executeFd({
      depositAmount: 1000000,
      annualInterestRate: 7.5,
      tenureYears: 2,
      estimateTds: true,
    });

    expect(res.estimatedTdsAmount).toBeGreaterThan(0);
    expect(res.postTaxMaturityAmount).toBe(res.maturityAmount - res.estimatedTdsAmount);
  });

  it('calculates regular monthly interest payout for retirees', () => {
    const res = executeFd({
      depositAmount: 1200000,
      annualInterestRate: 7.5,
      tenureYears: 3,
      payoutType: 'monthly_payout',
    });

    expect(res.periodicPayoutAmount).toBeGreaterThan(7000);
    expect(res.maturityAmount).toBe(1200000); // principal preserved at maturity
    expect(res.effectiveApy).toBeGreaterThan(7.5);
  });
});
