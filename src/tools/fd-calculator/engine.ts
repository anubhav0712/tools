export type FdCompoundingFrequency = 'quarterly' | 'monthly' | 'half-yearly' | 'annually' | 'simple';
export type FdPayoutType = 'cumulative' | 'monthly_payout' | 'quarterly_payout' | 'annual_payout';

export interface FdInput {
  depositAmount: number;
  annualInterestRate: number; // e.g. 7.1 for 7.1%
  tenureYears: number;
  tenureMonths?: number;
  tenureDays?: number;
  compoundingFrequency?: FdCompoundingFrequency;
  payoutType?: FdPayoutType;
  isSeniorCitizen?: boolean;
  seniorBonusRatePercent?: number; // default +0.5%
  estimateTds?: boolean;
  investorTaxSlabPercent?: number; // e.g. 30% for actual tax liability
}

export interface FdScheduleItem {
  period: number;
  label: string;
  interestEarned: number;
  cumulativeInterest: number;
  balance: number;
}

export interface FdOutput {
  principal: number;
  effectiveRate: number;
  totalInterestEarned: number;
  maturityAmount: number;
  absoluteReturnPercent: number;
  estimatedTdsAmount: number;
  postTaxMaturityAmount: number;
  schedule: FdScheduleItem[];
  // Enterprise fields
  periodicPayoutAmount?: number; // e.g. Monthly or Quarterly cash income
  effectiveApy?: number;         // Effective annual percentage yield
  totalTaxLiability?: number;    // At investor marginal slab
}

export function executeFd(input: FdInput): FdOutput {
  const principal = Math.max(0, input.depositAmount || 0);
  const baseRate = Math.max(0, input.annualInterestRate || 0);
  const seniorBonus = input.isSeniorCitizen ? (input.seniorBonusRatePercent ?? 0.5) : 0;
  const effectiveRate = baseRate + seniorBonus;
  const rateFraction = effectiveRate / 100;

  const years = Math.max(0, input.tenureYears || 0);
  const months = Math.max(0, input.tenureMonths || 0);
  const days = Math.max(0, input.tenureDays || 0);
  const totalYears = years + months / 12 + days / 365;

  const payoutType = input.payoutType || 'cumulative';
  const compFreq = input.compoundingFrequency || 'quarterly';

  let n = 4; // quarterly default
  if (compFreq === 'monthly') n = 12;
  else if (compFreq === 'half-yearly') n = 2;
  else if (compFreq === 'annually') n = 1;

  let maturityAmount = 0;
  let totalInterest = 0;
  let periodicPayoutAmount = 0;

  if (payoutType === 'monthly_payout') {
    // Under Indian banking practice, monthly payout is discounted from quarterly card rate:
    // monthlyRate = (1 + r/4)^(1/3) - 1
    const monthlyRate = Math.pow(1 + rateFraction / 4, 1 / 3) - 1;
    periodicPayoutAmount = Math.round(principal * monthlyRate);
    totalInterest = periodicPayoutAmount * Math.round(totalYears * 12);
    maturityAmount = principal; // Principal returned at maturity
  } else if (payoutType === 'quarterly_payout') {
    periodicPayoutAmount = Math.round((principal * rateFraction) / 4);
    totalInterest = periodicPayoutAmount * Math.round(totalYears * 4);
    maturityAmount = principal;
  } else if (compFreq === 'simple' || totalYears < 1 / 12) {
    totalInterest = principal * rateFraction * totalYears;
    maturityAmount = principal + totalInterest;
  } else {
    // Standard compound interest formula: A = P * (1 + r/n)^(n*t)
    maturityAmount = principal * Math.pow(1 + rateFraction / n, n * totalYears);
    totalInterest = maturityAmount - principal;
  }

  // Effective APY calculation
  const effectiveApy = effectiveRate > 0
    ? Number(((Math.pow(1 + rateFraction / n, n) - 1) * 100).toFixed(2))
    : 0;

  // Estimated TDS (India standard rule: 10% TDS if interest > 40k/yr, 50k for senior)
  let estimatedTdsAmount = 0;
  if (input.estimateTds) {
    const annualInterest = totalYears > 0 ? totalInterest / totalYears : totalInterest;
    const tdsThreshold = input.isSeniorCitizen ? 50000 : 40000;
    if (annualInterest > tdsThreshold) {
      estimatedTdsAmount = Math.round(totalInterest * 0.10);
    }
  }

  // Marginal tax liability if specified
  let totalTaxLiability = estimatedTdsAmount;
  if (input.investorTaxSlabPercent !== undefined && input.investorTaxSlabPercent > 0) {
    totalTaxLiability = Math.round(totalInterest * (input.investorTaxSlabPercent / 100));
  }

  const postTaxMaturityAmount = Math.round(maturityAmount - estimatedTdsAmount);
  const absoluteReturnPercent = principal > 0
    ? Number(((totalInterest / principal) * 100).toFixed(2))
    : 0;

  // Generate Year/Quarter schedule
  const schedule: FdScheduleItem[] = [];
  const scheduleSteps = Math.min(20, Math.ceil(totalYears));
  let prevBalance = principal;

  for (let yr = 1; yr <= scheduleSteps; yr++) {
    const t = Math.min(yr, totalYears);
    let bal = principal;
    let intSoFar = 0;
    let periodInterest = 0;

    if (payoutType === 'monthly_payout' || payoutType === 'quarterly_payout') {
      intSoFar = Math.round((totalInterest / totalYears) * t);
      periodInterest = yr === 1 ? intSoFar : intSoFar - Math.round((totalInterest / totalYears) * (yr - 1));
      bal = principal;
    } else {
      bal = compFreq === 'simple'
        ? principal + principal * rateFraction * t
        : principal * Math.pow(1 + rateFraction / n, n * t);
      intSoFar = bal - principal;
      periodInterest = bal - prevBalance;
      prevBalance = bal;
    }

    schedule.push({
      period: yr,
      label: `Year ${yr}${yr === scheduleSteps && totalYears % 1 !== 0 ? ' (Maturity)' : ''}`,
      interestEarned: Math.round(periodInterest),
      cumulativeInterest: Math.round(intSoFar),
      balance: Math.round(bal),
    });
  }

  return {
    principal: Math.round(principal),
    effectiveRate: Number(effectiveRate.toFixed(2)),
    totalInterestEarned: Math.round(totalInterest),
    maturityAmount: Math.round(maturityAmount),
    absoluteReturnPercent,
    estimatedTdsAmount,
    postTaxMaturityAmount,
    schedule,
    periodicPayoutAmount: periodicPayoutAmount > 0 ? periodicPayoutAmount : undefined,
    effectiveApy,
    totalTaxLiability,
  };
}
