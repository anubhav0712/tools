import { describe, it, expect } from 'vitest';
import { executeDebtPayoff } from './engine';

describe('Credit Card & Debt Payoff Engine', () => {
  it('calculates payoff months and interest for fixed payment', () => {
    // $5,000 balance at 20% APR with $250 monthly payment
    const res = executeDebtPayoff({
      balance: 5000,
      annualInterestRate: 20,
      monthlyPayment: 250,
      extraMonthlyPayment: 0,
    });

    expect(res.isPayable).toBe(true);
    expect(res.monthsToPayoff).toBeGreaterThan(0);
    expect(res.monthsToPayoff).toBeLessThan(30);
    expect(res.totalInterestPaid).toBeGreaterThan(0);
  });

  it('demonstrates interest and time savings with extra snowball payment', () => {
    const res = executeDebtPayoff({
      balance: 100000, // ₹1 Lakh
      annualInterestRate: 36, // 36% typical credit card APR
      monthlyPayment: 5000,
      extraMonthlyPayment: 2000,
    });

    expect(res.isPayable).toBe(true);
    expect(res.savingsWithExtra).toBeDefined();
    expect(res.savingsWithExtra?.monthsSaved).toBeGreaterThan(0);
    expect(res.savingsWithExtra?.interestSaved).toBeGreaterThan(0);
  });

  it('detects unpayable debt when payment is less than monthly interest', () => {
    // $10,000 balance at 24% APR => monthly interest is $200.
    // If payment is $100, debt grows indefinitely.
    const res = executeDebtPayoff({
      balance: 10000,
      annualInterestRate: 24,
      monthlyPayment: 100,
    });

    expect(res.isPayable).toBe(false);
  });
});
