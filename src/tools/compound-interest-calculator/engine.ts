export type CompoundingFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily' | 'continuously';
export type DepositFrequency = 'monthly' | 'annually';

export interface CompoundInterestInput {
  initialPrincipal: number;
  annualInterestRate: number; // e.g. 8 for 8%
  investmentYears: number;
  compoundingFrequency: CompoundingFrequency;
  regularDeposit?: number;
  depositFrequency?: DepositFrequency;
  // Enterprise fields
  depositTiming?: 'beginning' | 'end';
  inflationRatePercent?: number;
  taxRatePercent?: number;
}

export interface CompoundYearlySchedule {
  year: number;
  depositsToDate: number;
  interestEarnedYear: number;
  totalInterestToDate: number;
  endBalance: number;
  realEndBalance?: number;
}

export interface CompoundInterestOutput {
  initialPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
  simpleInterestBalance: number;
  compoundAdvantage: number; // compound balance - simple interest balance
  yearlySchedule: CompoundYearlySchedule[];
  // Enterprise Compliance Metrics
  apyPercent?: number;                   // Truth in Savings Act (TISA) APY
  exactDoublingYears?: number;           // ln(2) / [n * ln(1 + r/n)]
  inflationAdjustedFinalBalance?: number;// Real purchasing power in today's currency
  totalTaxPaid?: number;                 // If interest is taxed annually
}

const FREQUENCY_MAP: Record<CompoundingFrequency, number> = {
  annually: 1,
  'semi-annually': 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
  continuously: 3650, // approximated closely
};

export function executeCompoundInterest(input: CompoundInterestInput): CompoundInterestOutput {
  const principal = Math.max(0, input.initialPrincipal || 0);
  const annualRate = Math.max(0, input.annualInterestRate || 0) / 100;
  const years = Math.max(1, Math.min(100, Math.round(input.investmentYears || 1)));
  const compFreqStr = input.compoundingFrequency || 'monthly';
  const compFreq = FREQUENCY_MAP[compFreqStr] || 12;
  const regularDeposit = Math.max(0, input.regularDeposit || 0);
  const depositFreq = input.depositFrequency === 'annually' ? 1 : 12;
  const inflationRate = Math.max(0, input.inflationRatePercent || 0) / 100;
  const taxRate = Math.max(0, input.taxRatePercent || 0) / 100;

  // Regulatory APY calculation: (1 + r/n)^n - 1 or e^r - 1
  let apyPercent = 0;
  if (compFreqStr === 'continuously') {
    apyPercent = annualRate > 0 ? Number(((Math.exp(annualRate) - 1) * 100).toFixed(3)) : 0;
  } else {
    apyPercent = annualRate > 0 ? Number(((Math.pow(1 + annualRate / compFreq, compFreq) - 1) * 100).toFixed(3)) : 0;
  }

  // Exact Doubling Time: ln(2) / ln(1 + APY)
  const apyFraction = apyPercent / 100;
  const exactDoublingYears = apyFraction > 0
    ? Number((Math.log(2) / Math.log(1 + apyFraction)).toFixed(2))
    : 0;

  let currentBalance = principal;
  let cumulativeDeposits = principal;
  let cumulativeInterest = 0;
  let totalTaxPaid = 0;

  const yearlySchedule: CompoundYearlySchedule[] = [];
  const totalMonths = years * 12;
  let interestThisYear = 0;

  const ratePerCompounding = annualRate / compFreq;
  const compoundIntervalInMonths = Math.max(1, 12 / compFreq);

  for (let m = 1; m <= totalMonths; m++) {
    // Add periodic deposit if applicable
    if (depositFreq === 12) {
      currentBalance += regularDeposit;
      cumulativeDeposits += regularDeposit;
    } else if (depositFreq === 1 && m % 12 === 1) {
      currentBalance += regularDeposit;
      cumulativeDeposits += regularDeposit;
    }

    // Apply compounding
    const isCompoundMonth = compFreq <= 12
      ? (m % compoundIntervalInMonths === 0)
      : true;

    if (isCompoundMonth) {
      let interestEarned = 0;
      if (compFreqStr === 'continuously') {
        const growthFactor = Math.exp(annualRate / 12);
        interestEarned = currentBalance * (growthFactor - 1);
      } else if (compFreq === 365) {
        const daysInMonth = 365 / 12;
        const growthFactor = Math.pow(1 + annualRate / 365, daysInMonth);
        interestEarned = currentBalance * (growthFactor - 1);
      } else {
        interestEarned = currentBalance * ratePerCompounding;
      }

      if (taxRate > 0) {
        const tax = interestEarned * taxRate;
        totalTaxPaid += tax;
        interestEarned -= tax;
      }

      currentBalance += interestEarned;
      cumulativeInterest += interestEarned;
      interestThisYear += interestEarned;
    }

    // End of year summary
    if (m % 12 === 0) {
      const yearNum = m / 12;
      const realBal = inflationRate > 0
        ? currentBalance / Math.pow(1 + inflationRate, yearNum)
        : currentBalance;

      yearlySchedule.push({
        year: yearNum,
        depositsToDate: Math.round(cumulativeDeposits),
        interestEarnedYear: Math.round(interestThisYear),
        totalInterestToDate: Math.round(cumulativeInterest),
        endBalance: Math.round(currentBalance),
        realEndBalance: Math.round(realBal),
      });
      interestThisYear = 0;
    }
  }

  // Simple Interest baseline comparison
  const simpleInterestPrincipal = principal * annualRate * years;
  const simpleInterestDeposits = regularDeposit * (depositFreq * years) * (annualRate * (years / 2));
  const simpleInterestBalance = Math.round(cumulativeDeposits + simpleInterestPrincipal + simpleInterestDeposits);

  const finalBalance = Math.round(currentBalance);
  const totalInterest = Math.round(cumulativeInterest);
  const compoundAdvantage = Math.max(0, finalBalance - simpleInterestBalance);

  const inflationAdjustedFinalBalance = inflationRate > 0
    ? Math.round(finalBalance / Math.pow(1 + inflationRate, years))
    : finalBalance;

  return {
    initialPrincipal: Math.round(principal),
    totalContributions: Math.round(cumulativeDeposits),
    totalInterest,
    finalBalance,
    simpleInterestBalance,
    compoundAdvantage,
    yearlySchedule,
    apyPercent,
    exactDoublingYears,
    inflationAdjustedFinalBalance,
    totalTaxPaid: Math.round(totalTaxPaid),
  };
}
