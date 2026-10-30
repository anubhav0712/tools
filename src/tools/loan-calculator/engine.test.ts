import { describe, it, expect } from 'vitest';
import { executeLoanCalculator } from './engine';

describe('Loan Calculator Engine', () => {
  it('calculates standard home loan EMI correctly', () => {
    // 50 Lakhs loan at 8.75% for 20 years
    const res = executeLoanCalculator({
      principal: 5000000,
      annualInterestRate: 8.75,
      tenureYears: 20,
    });

    expect(res.monthlyEmi).toBeGreaterThan(43000);
    expect(res.monthlyEmi).toBeLessThan(45000);
    expect(res.totalPayment).toBeGreaterThan(res.totalInterest);
    expect(res.payoffMonths).toBe(240);
  });

  it('calculates prepayment savings correctly', () => {
    const resWithout = executeLoanCalculator({
      principal: 100000,
      annualInterestRate: 7,
      tenureYears: 10,
      extraMonthlyPayment: 0,
    });

    const resWith = executeLoanCalculator({
      principal: 100000,
      annualInterestRate: 7,
      tenureYears: 10,
      extraMonthlyPayment: 200,
    });

    expect(resWith.payoffMonths).toBeLessThan(resWithout.payoffMonths);
    expect(resWith.interestSavedWithPrepayment).toBeGreaterThan(0);
    expect(resWith.monthsSavedWithPrepayment).toBeGreaterThan(0);
  });

  it('handles zero principal gracefully', () => {
    const res = executeLoanCalculator({
      principal: 0,
      annualInterestRate: 7,
      tenureYears: 10,
    });

    expect(res.monthlyEmi).toBe(0);
    expect(res.totalInterest).toBe(0);
    expect(res.totalPayment).toBe(0);
  });

  it('computes TILA APR higher than note rate when origination fees are charged', () => {
    const res = executeLoanCalculator({
      principal: 400000,
      annualInterestRate: 6.85,
      tenureYears: 30,
      originationFeePercent: 1.5, // 1.5% points/fees
    });

    expect(res.apr).toBeGreaterThan(6.85);
    expect(res.totalFinanceCharges).toBeGreaterThan(res.totalInterest);
  });

  it('tracks PMI and terminates it when balance reaches 78% LTV under HPA rules', () => {
    const res = executeLoanCalculator({
      principal: 270000,
      homeValue: 300000, // 90% LTV
      annualInterestRate: 6.5,
      tenureYears: 30,
      pmiAnnualPercent: 0.85,
    });

    expect(res.loanToValueRatio).toBe(90);
    expect(res.pmiMonthly).toBeGreaterThan(0);
    expect(res.pmiMonthsRemaining).toBeGreaterThan(0);
    expect(res.pmiMonthsRemaining).toBeLessThan(360); // Drops off before loan ends!
  });
});
