import type {
  LoanCalculatorInput,
  LoanCalculatorOutput,
  AmortizationYear,
} from './definition';

export function executeLoanCalculator(input: LoanCalculatorInput): LoanCalculatorOutput {
  const principal = Math.max(0, input.principal || 0);
  const annualRate = Math.max(0, input.annualInterestRate || 0);
  const tenureYears = Math.max(1, input.tenureYears || 1);
  const extraMonthly = Math.max(0, input.extraMonthlyPayment || 0);
  const propertyTaxAnnual = Math.max(0, input.propertyTaxAnnual || 0);
  const insuranceAnnual = Math.max(0, input.insuranceAnnual || 0);

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

  // Simulate month-by-month without prepayment
  let baselineTotalInterest = 0;
  let balanceBaseline = principal;
  for (let m = 0; m < totalMonths; m++) {
    const interest = balanceBaseline * monthlyRate;
    const principalPortion = monthlyEmi - interest;
    baselineTotalInterest += interest;
    balanceBaseline = Math.max(0, balanceBaseline - principalPortion);
    if (balanceBaseline <= 0) break;
  }

  // Simulate month-by-month with extra prepayment (if any)
  let balance = principal;
  let actualTotalInterest = 0;
  let actualMonths = 0;
  const yearlySchedule: AmortizationYear[] = [];

  let currentYearPrincipal = 0;
  let currentYearInterest = 0;
  let currentYear = 1;

  while (balance > 0.01 && actualMonths < 600) {
    actualMonths++;
    const interest = balance * monthlyRate;
    actualTotalInterest += interest;

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

  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalMonthlyPayment: Math.round(monthlyEmi + monthlyTaxAndInsurance + extraMonthly),
    totalInterest: Math.round(actualTotalInterest),
    totalPayment: Math.round(totalPayment),
    principalPercentage,
    interestPercentage,
    payoffMonths: actualMonths,
    interestSavedWithPrepayment: Math.round(interestSaved),
    monthsSavedWithPrepayment: monthsSaved,
    yearlySchedule,
  };
}
