import type {
  LoanCalculatorInput,
  LoanCalculatorOutput,
  AmortizationYear,
} from './definition';

/**
 * Solve for APR using binary search on net proceeds = PV(annuity)
 */
function calculateTilaApr(
  netProceeds: number,
  monthlyPayment: number,
  totalMonths: number
): number {
  if (netProceeds <= 0 || monthlyPayment <= 0 || totalMonths <= 0) return 0;

  let low = 0.000001;
  let high = 1.0; // 100% monthly rate upper bound

  for (let iter = 0; iter < 40; iter++) {
    const mid = (low + high) / 2;
    // PV of ordinary annuity = PMT * [1 - (1 + mid)^(-n)] / mid
    const pv = (monthlyPayment * (1 - Math.pow(1 + mid, -totalMonths))) / mid;

    if (pv > netProceeds) {
      low = mid; // discount rate too low
    } else {
      high = mid; // discount rate too high
    }
  }

  const monthlyApr = (low + high) / 2;
  return Number((monthlyApr * 12 * 100).toFixed(3));
}

export function executeLoanCalculator(input: LoanCalculatorInput): LoanCalculatorOutput {
  const principal = Math.max(0, input.principal || 0);
  const annualRate = Math.max(0, input.annualInterestRate || 0);
  const tenureYears = Math.max(1, input.tenureYears || 1);
  const extraMonthly = Math.max(0, input.extraMonthlyPayment || 0);
  const propertyTaxAnnual = Math.max(0, input.propertyTaxAnnual || 0);
  const insuranceAnnual = Math.max(0, input.insuranceAnnual || 0);

  const originationFeePercent = Math.max(0, input.originationFeePercent || 0);
  const closingCostsFixed = Math.max(0, input.closingCostsFixed || 0);
  const homeValue = input.homeValue ? Math.max(principal, input.homeValue) : principal;
  const pmiRate = Math.max(0, input.pmiAnnualPercent || 0) / 100;

  const totalMonths = tenureYears * 12;
  const monthlyRate = annualRate / (12 * 100);

  if (principal === 0) {
    return {
      monthlyEmi: 0,
      totalMonthlyPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
      principalPercentage: 100,
      interestPercentage: 0,
      payoffMonths: 0,
      interestSavedWithPrepayment: 0,
      monthsSavedWithPrepayment: 0,
      yearlySchedule: [],
      apr: 0,
      totalFinanceCharges: 0,
      loanToValueRatio: 0,
      pmiMonthly: 0,
      pmiMonthsRemaining: 0,
      totalPmiPaid: 0,
    };
  }

  // Base EMI without extra prepayment
  let monthlyEmi = 0;
  if (monthlyRate === 0) {
    monthlyEmi = principal / totalMonths;
  } else {
    monthlyEmi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const monthlyTaxAndInsurance = (propertyTaxAnnual + insuranceAnnual) / 12;

  // LTV & PMI setup
  const ltv = homeValue > 0 ? Number(((principal / homeValue) * 100).toFixed(1)) : 80;
  const requiresPmi = ltv > 80 && pmiRate > 0;
  const pmiThresholdBalance = homeValue * 0.78; // HPA 78% auto-drop threshold
  const baseMonthlyPmi = requiresPmi ? (principal * pmiRate) / 12 : 0;

  // Simulate month-by-month without prepayment for baseline comparison
  let baselineTotalInterest = 0;
  let balanceBaseline = principal;
  for (let m = 0; m < totalMonths; m++) {
    const interest = balanceBaseline * monthlyRate;
    const principalPortion = monthlyEmi - interest;
    baselineTotalInterest += interest;
    balanceBaseline = Math.max(0, balanceBaseline - principalPortion);
    if (balanceBaseline <= 0) break;
  }

  // Simulate month-by-month with extra prepayment and PMI tracking
  let balance = principal;
  let actualTotalInterest = 0;
  let actualMonths = 0;
  let totalPmiPaid = 0;
  let pmiMonthsCount = 0;
  const yearlySchedule: AmortizationYear[] = [];

  let currentYearPrincipal = 0;
  let currentYearInterest = 0;
  let currentYear = 1;

  while (balance > 0.01 && actualMonths < 600) {
    actualMonths++;
    const interest = balance * monthlyRate;
    actualTotalInterest += interest;

    // PMI calculation per HPA 1998 rule
    if (requiresPmi && balance > pmiThresholdBalance) {
      totalPmiPaid += baseMonthlyPmi;
      pmiMonthsCount++;
    }

    let totalMonthlyPaid = monthlyEmi + extraMonthly;
    let principalPortion = totalMonthlyPaid - interest;

    if (principalPortion > balance) {
      principalPortion = balance;
      totalMonthlyPaid = principalPortion + interest;
    }

    balance -= principalPortion;
    currentYearPrincipal += principalPortion;
    currentYearInterest += interest;

    if (actualMonths % 12 === 0 || balance <= 0.01) {
      yearlySchedule.push({
        year: currentYear,
        principalPaid: Math.round(currentYearPrincipal),
        interestPaid: Math.round(currentYearInterest),
        remainingBalance: Math.max(0, Math.round(balance)),
      });
      currentYearPrincipal = 0;
      currentYearInterest = 0;
      currentYear++;
    }

    if (balance <= 0.01) break;
  }

  const totalPayment = principal + actualTotalInterest;
  const principalPercentage = Math.round((principal / totalPayment) * 100);
  const interestPercentage = 100 - principalPercentage;

  const interestSaved = Math.max(0, baselineTotalInterest - actualTotalInterest);
  const monthsSaved = Math.max(0, totalMonths - actualMonths);

  // Upfront financing fees & APR
  const upfrontFees = (principal * originationFeePercent) / 100 + closingCostsFixed;
  const netProceeds = principal - upfrontFees;
  const apr = upfrontFees > 0
    ? calculateTilaApr(netProceeds, monthlyEmi, totalMonths)
    : annualRate;

  const totalFinanceCharges = Math.round(actualTotalInterest + upfrontFees + totalPmiPaid);

  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalMonthlyPayment: Math.round(
      monthlyEmi + monthlyTaxAndInsurance + extraMonthly + (requiresPmi && balance > pmiThresholdBalance ? baseMonthlyPmi : 0)
    ),
    totalInterest: Math.round(actualTotalInterest),
    totalPayment: Math.round(totalPayment),
    principalPercentage,
    interestPercentage,
    payoffMonths: actualMonths,
    interestSavedWithPrepayment: Math.round(interestSaved),
    monthsSavedWithPrepayment: monthsSaved,
    yearlySchedule,
    apr,
    totalFinanceCharges,
    loanToValueRatio: ltv,
    pmiMonthly: Math.round(baseMonthlyPmi),
    pmiMonthsRemaining: pmiMonthsCount,
    totalPmiPaid: Math.round(totalPmiPaid),
  };
}
