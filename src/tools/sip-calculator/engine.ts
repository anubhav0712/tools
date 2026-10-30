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
  const initialLumpSum = Math.max(0, input.initialLumpSum || 0);
  const inflationRate = Math.max(0, input.inflationRatePercent || 0) / 100;
  const capitalGainsTaxPercent = Math.max(0, input.capitalGainsTaxPercent || 0) / 100;
  const capitalGainsExemption = Math.max(0, input.capitalGainsExemption || 0);

  const monthlyRate = annualReturn / (12 * 100);
  const totalMonths = years * 12;

  let totalInvested = initialLumpSum;
  let futureValue = initialLumpSum;
  let currentMonthly = initialMonthly;

  const yearlySchedule: SipYearlyBreakdown[] = [];

  for (let m = 1; m <= totalMonths; m++) {
    // Add monthly investment at start of period (Annuity Due)
    totalInvested += currentMonthly;
    futureValue = (futureValue + currentMonthly) * (1 + monthlyRate);

    // End of each year (12 months)
    if (m % 12 === 0) {
      const year = m / 12;
      const realVal = inflationRate > 0
        ? futureValue / Math.pow(1 + inflationRate, year)
        : futureValue;

      yearlySchedule.push({
        year,
        totalInvested: Math.round(totalInvested),
        totalReturns: Math.round(Math.max(0, futureValue - totalInvested)),
        futureValue: Math.round(futureValue),
        realFutureValue: Math.round(realVal),
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

  // Real purchasing power
  const realMaturityValue = inflationRate > 0
    ? Math.round(futureValue / Math.pow(1 + inflationRate, years))
    : Math.round(futureValue);
  const purchasingPowerLoss = Math.max(0, Math.round(futureValue - realMaturityValue));

  // Capital gains tax estimation (e.g. India 12.5% LTCG above ₹1.25L exemption)
  let estimatedTax = 0;
  if (capitalGainsTaxPercent > 0) {
    const taxableGains = Math.max(0, totalReturns - capitalGainsExemption);
    estimatedTax = Math.round(taxableGains * capitalGainsTaxPercent);
  }
  const postTaxMaturityValue = Math.round(futureValue - estimatedTax);

  return {
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    maturityValue: Math.round(futureValue),
    investedPercentage,
    returnsPercentage,
    yearlySchedule,
    realMaturityValue,
    purchasingPowerLoss,
    estimatedTax,
    postTaxMaturityValue,
    cagr: annualReturn,
  };
}
