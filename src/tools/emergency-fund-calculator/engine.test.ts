import { describe, it, expect } from 'vitest';
import { executeEmergencyFund } from './engine';

describe('Emergency Fund Calculator Engine', () => {
  it('calculates 6-month target fund and shortfall accurately', () => {
    const res = executeEmergencyFund({
      housingExpense: 20000,
      foodExpense: 15000,
      utilitiesExpense: 5000,
      loanEmisExpense: 10000,
      insuranceHealthcareExpense: 3000,
      miscEssentialsExpense: 2000,
      bufferMonths: 6,
      currentSavings: 150000,
      monthlySavingsContribution: 25000,
    });

    // Total monthly = 55,000. 6 months = 330,000
    expect(res.totalMonthlyExpense).toBe(55000);
    expect(res.targetFundAmount).toBe(330000);
    expect(res.isFullyFunded).toBe(false);
    expect(res.shortfallOrSurplus).toBe(-180000);
    expect(res.monthsToFullFund).toBe(Math.ceil(180000 / 25000)); // 8 months
  });

  it('recognizes fully funded emergency safety net', () => {
    const res = executeEmergencyFund({
      housingExpense: 2000,
      foodExpense: 800,
      utilitiesExpense: 400,
      loanEmisExpense: 500,
      insuranceHealthcareExpense: 300,
      miscEssentialsExpense: 0,
      bufferMonths: 3,
      currentSavings: 15000,
    });

    // Total monthly = 4,000. 3 months = 12,000. Savings = 15,000.
    expect(res.targetFundAmount).toBe(12000);
    expect(res.isFullyFunded).toBe(true);
    expect(res.percentFunded).toBe(125);
  });
});
