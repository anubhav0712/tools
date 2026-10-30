export type CompoundingFrequency = 'annually' | 'semi-annually' | 'quarterly' | 'monthly' | 'daily';
export type DepositFrequency = 'monthly' | 'annually';

export interface CompoundInterestInput {
  initialPrincipal: number;
  annualInterestRate: number; // e.g. 8 for 8%
  investmentYears: number;
  compoundingFrequency: CompoundingFrequency;
  regularDeposit?: number;
  depositFrequency?: DepositFrequency;
}

export interface CompoundYearlySchedule {
  year: number;
  depositsToDate: number;
  interestEarnedYear: number;
  totalInterestToDate: number;
  endBalance: number;
}

export interface CompoundInterestOutput {
  initialPrincipal: number;
  totalContributions: number;
  totalInterest: number;
  finalBalance: number;
  simpleInterestBalance: number;
  compoundAdvantage: number; // compound balance - simple interest balance
  yearlySchedule: CompoundYearlySchedule[];
}

const FREQUENCY_MAP: Record<CompoundingFrequency, number> = {
  annually: 1,
  'semi-annually': 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

export function executeCompoundInterest(input: CompoundInterestInput): CompoundInterestOutput {
  const principal = Math.max(0, input.initialPrincipal || 0);
  const annualRate = Math.max(0, input.annualInterestRate || 0) / 100;
  const years = Math.max(1, Math.min(100, Math.round(input.investmentYears || 1)));
  const compFreq = FREQUENCY_MAP[input.compoundingFrequency] || 12;
  const regularDeposit = Math.max(0, input.regularDeposit || 0);
  const depositFreq = input.depositFrequency === 'annually' ? 1 : 12;

  let currentBalance = principal;
  let cumulativeDeposits = principal;
  let cumulativeInterest = 0;

  const yearlySchedule: CompoundYearlySchedule[] = [];

  // Monthly simulation step for precise compounding & deposits
  const totalMonths = years * 12;
  let interestThisYear = 0;

  // Rate per sub-period
  const ratePerCompounding = annualRate / compFreq;
  const compoundIntervalInMonths = 12 / compFreq;

  for (let m = 1; m <= totalMonths; m++) {
    // Add periodic deposit if applicable
    if (depositFreq === 12) {
      currentBalance += regularDeposit;
      cumulativeDeposits += regularDeposit;
    } else if (depositFreq === 1 && m % 12 === 1) {
      // Annual deposit at start of each year
      currentBalance += regularDeposit;
      cumulativeDeposits += regularDeposit;
    }

    // Apply compounding if at compound interval
    const isCompoundMonth = compFreq <= 12
      ? (m % compoundIntervalInMonths === 0)
      : true; // for daily, simulate continuous monthly approx

    if (isCompoundMonth) {
      let interestEarned = 0;
      if (compFreq === 365) {
        // Daily rate compounded across ~30.416 days
        const daysInMonth = 365 / 12;
        const growthFactor = Math.pow(1 + annualRate / 365, daysInMonth);
        interestEarned = currentBalance * (growthFactor - 1);
      } else {
        interestEarned = currentBalance * ratePerCompounding;
      }
      currentBalance += interestEarned;
      cumulativeInterest += interestEarned;
      interestThisYear += interestEarned;
    }

    // End of year summary
    if (m % 12 === 0) {
      const yearNum = m / 12;
      yearlySchedule.push({
        year: yearNum,
        depositsToDate: Math.round(cumulativeDeposits),
        interestEarnedYear: Math.round(interestThisYear),
        totalInterestToDate: Math.round(cumulativeInterest),
        endBalance: Math.round(currentBalance),
      });
      interestThisYear = 0;
    }
  }

  // Calculate Simple Interest baseline for comparison
  // SI = P + P*r*t + regular deposits simple interest
  const simpleInterestPrincipal = principal * annualRate * years;
  const simpleInterestDeposits = regularDeposit * (depositFreq * years) * (annualRate * (years / 2));
  const simpleInterestBalance = Math.round(cumulativeDeposits + simpleInterestPrincipal + simpleInterestDeposits);

  const finalBalance = Math.round(currentBalance);
  const totalInterest = Math.round(cumulativeInterest);
  const compoundAdvantage = Math.max(0, finalBalance - simpleInterestBalance);

  return {
    initialPrincipal: Math.round(principal),
    totalContributions: Math.round(cumulativeDeposits),
    totalInterest,
    finalBalance,
    simpleInterestBalance,
    compoundAdvantage,
    yearlySchedule,
  };
}
