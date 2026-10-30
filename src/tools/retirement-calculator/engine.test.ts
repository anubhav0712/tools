import { describe, it, expect } from 'vitest';
import { executeRetirementPlanner } from './engine';

describe('Retirement & FIRE Planner Engine', () => {
  it('correctly calculates retirement needs with inflation and investment growth', () => {
    const res = executeRetirementPlanner({
      currentAge: 30,
      retirementAge: 60,
      lifeExpectancyYears: 85,
      currentMonthlyExpense: 50000,
      inflationRatePercent: 6,
      preRetirementReturnRate: 12,
      postRetirementReturnRate: 7,
      currentSavings: 500000,
      monthlyContribution: 25000,
    });

    expect(res.yearsToRetirement).toBe(30);
    expect(res.yearsInRetirement).toBe(25);
    expect(res.monthlyExpenseAtRetirement).toBeGreaterThan(50000);
    expect(res.requiredCorpus).toBeGreaterThan(10000000); // More than 1 Crore
    expect(res.projectedCorpus).toBeGreaterThan(0);
    expect(res.timeline.length).toBeGreaterThan(0);
    // Ensure final timeline milestone exactly matches projectedCorpus without compounding discrepancy
    const finalMilestone = res.timeline[res.timeline.length - 1];
    expect(finalMilestone.projectedCorpus).toBe(res.projectedCorpus);
  });

  it('determines if user is retirement ready and handles shortfall', () => {
    const res = executeRetirementPlanner({
      currentAge: 55,
      retirementAge: 60,
      lifeExpectancyYears: 80,
      currentMonthlyExpense: 60000,
      inflationRatePercent: 5,
      preRetirementReturnRate: 8,
      postRetirementReturnRate: 6,
      currentSavings: 100000,
      monthlyContribution: 2000, // Very low contribution
    });

    expect(res.isRetirementReady).toBe(false);
    expect(res.shortfallOrSurplus).toBeLessThan(0);
    expect(res.recommendedMonthlySaving).toBeGreaterThan(res.projectedCorpus / (5 * 12));
  });

  it('reduces target required corpus when guaranteed post-retirement pension is present', () => {
    const withoutPension = executeRetirementPlanner({
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancyYears: 85,
      currentMonthlyExpense: 50000,
      inflationRatePercent: 5,
      preRetirementReturnRate: 10,
      postRetirementReturnRate: 7,
      currentSavings: 500000,
      monthlyContribution: 20000,
    });

    const withPension = executeRetirementPlanner({
      currentAge: 35,
      retirementAge: 65,
      lifeExpectancyYears: 85,
      currentMonthlyExpense: 50000,
      inflationRatePercent: 5,
      preRetirementReturnRate: 10,
      postRetirementReturnRate: 7,
      currentSavings: 500000,
      monthlyContribution: 20000,
      postRetirementGuaranteedIncomeAnnual: 500000, // ₹5L annual pension
    });

    expect(withPension.netRequiredCorpusAfterPension).toBeLessThan(withoutPension.requiredCorpus);
  });
});
