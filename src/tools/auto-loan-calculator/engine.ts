export interface AutoLoanInput {
  vehiclePrice: number;        // Purchase price / MSRP
  downPayment: number;         // Upfront cash
  tradeInValue?: number;       // Trade-in vehicle credit
  salesTaxRatePercent?: number;// Sales tax or RTO registration %
  includeTaxInLoan?: boolean;  // Whether taxes are rolled into financing
  loanTermMonths: number;      // 36, 48, 60, 72, 84
  annualInterestRate: number;  // APR %
}

export interface AutoLoanOutput {
  vehiclePrice: number;
  salesTaxAmount: number;
  totalDownPaymentAndTradeIn: number;
  loanAmountFinanced: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalLoanPayment: number;
  trueTotalCostOfOwnership: number;
  upfrontCashNeeded: number;
}

export function executeAutoLoan(input: AutoLoanInput): AutoLoanOutput {
  const price = Math.max(0, input.vehiclePrice || 0);
  const down = Math.max(0, input.downPayment || 0);
  const tradeIn = Math.max(0, input.tradeInValue || 0);
  const taxRate = Math.max(0, input.salesTaxRatePercent || 0) / 100;
  const termMonths = Math.max(6, Math.min(120, Math.round(input.loanTermMonths || 60)));
  const apr = Math.max(0, input.annualInterestRate || 0) / 100;
  const monthlyRate = apr / 12;

  // Tax is calculated on taxable amount (price minus trade-in in many jurisdictions, or on price)
  const taxableBasis = Math.max(0, price - tradeIn);
  const salesTaxAmount = Math.round(taxableBasis * taxRate);

  const totalDownPaymentAndTradeIn = down + tradeIn;

  let loanAmountFinanced = 0;
  let upfrontCashNeeded = down;

  if (input.includeTaxInLoan) {
    loanAmountFinanced = Math.max(0, price + salesTaxAmount - totalDownPaymentAndTradeIn);
  } else {
    loanAmountFinanced = Math.max(0, price - totalDownPaymentAndTradeIn);
    upfrontCashNeeded += salesTaxAmount;
  }

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = termMonths > 0 ? loanAmountFinanced / termMonths : 0;
  } else {
    // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    monthlyPayment =
      (loanAmountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  monthlyPayment = Math.round(monthlyPayment);
  const totalLoanPayment = monthlyPayment * termMonths;
  const totalInterestPaid = Math.max(0, totalLoanPayment - loanAmountFinanced);
  const trueTotalCostOfOwnership = Math.round(price + salesTaxAmount + totalInterestPaid);

  return {
    vehiclePrice: Math.round(price),
    salesTaxAmount,
    totalDownPaymentAndTradeIn: Math.round(totalDownPaymentAndTradeIn),
    loanAmountFinanced: Math.round(loanAmountFinanced),
    monthlyPayment,
    totalInterestPaid: Math.round(totalInterestPaid),
    totalLoanPayment: Math.round(totalLoanPayment),
    trueTotalCostOfOwnership,
    upfrontCashNeeded: Math.round(upfrontCashNeeded),
  };
}
