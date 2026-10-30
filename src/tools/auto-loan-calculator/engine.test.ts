import { describe, it, expect } from 'vitest';
import { executeAutoLoan } from './engine';

describe('Car Loan & Auto Financing Engine', () => {
  it('calculates monthly car payment with sales tax and trade-in', () => {
    // $35,000 car, $5,000 down payment, $2,000 trade-in, 6% tax, 60 months, 6.5% APR
    const res = executeAutoLoan({
      vehiclePrice: 35000,
      downPayment: 5000,
      tradeInValue: 2000,
      salesTaxRatePercent: 6,
      includeTaxInLoan: true,
      loanTermMonths: 60,
      annualInterestRate: 6.5,
    });

    expect(res.vehiclePrice).toBe(35000);
    expect(res.salesTaxAmount).toBe(Math.round((35000 - 2000) * 0.06)); // 1,980
    expect(res.loanAmountFinanced).toBe(35000 + 1980 - 7000); // 29,980
    expect(res.monthlyPayment).toBeGreaterThan(500);
    expect(res.monthlyPayment).toBeLessThan(700);
    expect(res.trueTotalCostOfOwnership).toBeGreaterThan(35000);
  });

  it('handles zero interest or full cash payment safely', () => {
    const res = executeAutoLoan({
      vehiclePrice: 20000,
      downPayment: 20000,
      salesTaxRatePercent: 0,
      loanTermMonths: 36,
      annualInterestRate: 0,
    });

    expect(res.loanAmountFinanced).toBe(0);
    expect(res.monthlyPayment).toBe(0);
    expect(res.totalInterestPaid).toBe(0);
  });
});
