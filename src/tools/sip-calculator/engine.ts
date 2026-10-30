import type {
  SipCalculatorInput,
  SipCalculatorOutput,
  SipYearlyBreakdown,
} from './definition';

export function executeSipCalculator(input: SipCalculatorInput): SipCalculatorOutput {
  const initialMonthly = Math.max(0, input.monthlyInvestment || 0);
  const annualReturn = Math.max(0, input.annualExpectedReturn || 0);
  const years = Math.max(1, input.investmentYears || 1);
  const stepUp = Math.max(0, input.annualStepUpPercent || 0);

  const monthlyRate = annualReturn / (12 * 100);
  const totalMonths = years * 12;

  let totalInvested = 0;
  let futureValue = 0;
  let currentMonthly = initialMonthly;

  const yearlySchedule: SipYearlyBreakdown[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Add monthly investment
    totalInvested += currentMonthly;
    // Compound for 1 month
    futureValue = (futureValue + currentMonthly) * (1 + monthlyRate);

    // End of each year (12 months)
    if (m % 12 === 0) {
      const year = m / 12;
      yearlySchedule.push({
        year,
        totalInvested: Math.round(totalInvested),
        totalReturns: Math.round(Math.max(0, futureValue - totalInvested)),
        futureValue: Math.round(futureValue),
      });

      // Apply annual step-up if configured
      if (stepUp > 0) {
        currentMonthly = currentMonthly * (1 + stepUp / 100);
      }
    }
  }

  const totalReturns = Math.max(0, futureValue - totalInvested);
  const investedPercentage = futureValue > 0 ? Math.round((totalInvested / futureValue) * 100) : 100;
  const returnsPercentage = 100 - investedPercentage;

  return {
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    maturityValue: Math.round(futureValue),
    investedPercentage,
    returnsPercentage,
    yearlySchedule,
  };
}
