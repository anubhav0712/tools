export interface AutoLoanInput {
  vehiclePrice: number;        // Purchase price / MSRP
  downPayment: number;         // Upfront cash
  tradeInValue?: number;       // Trade-in vehicle credit
  tradeInLoanOwed?: number;    // Balance owed on trade-in vehicle (negative equity)
  dealerDocFee?: number;       // Documentation & title fees
  salesTaxRatePercent?: number;// Sales tax or RTO registration %
  salesTaxTradeInCredit?: boolean; // Whether trade-in reduces taxable amount (state specific)
  includeTaxInLoan?: boolean;  // Whether taxes are rolled into financing
  includeFeesInLoan?: boolean; // Whether dealer fees are rolled into financing
  loanTermMonths: number;      // 36, 48, 60, 72, 84
  annualInterestRate: number;  // APR %
}

export interface AutoLoanOutput {
  vehiclePrice: number;
  salesTaxAmount: number;
  totalDownPaymentAndTradeIn: number;
  netTradeInValue: number;
  totalFees: number;
  loanAmountFinanced: number;
  monthlyPayment: number;
  totalInterestPaid: number;
  totalLoanPayment: number;
  trueTotalCostOfOwnership: number;
  upfrontCashNeeded: number;
  loanToValueRatio: number; // Financed amount / MSRP percentage
}

export function executeAutoLoan(input: AutoLoanInput): AutoLoanOutput {
  const price = Math.max(0, input.vehiclePrice || 0);
  const down = Math.max(0, input.downPayment || 0);
  const tradeIn = Math.max(0, input.tradeInValue || 0);
  const tradeInOwed = Math.max(0, input.tradeInLoanOwed || 0);
  const docFee = Math.max(0, input.dealerDocFee || 0);
  const taxRate = Math.max(0, input.salesTaxRatePercent || 0) / 100;
  const termMonths = Math.max(6, Math.min(120, Math.round(input.loanTermMonths || 60)));
  const apr = Math.max(0, input.annualInterestRate || 0) / 100;
  const monthlyRate = apr / 12;

  // Net trade-in equity (can be negative if underwater!)
  const netTradeInValue = tradeIn - tradeInOwed;

  // Tax calculation: in states granting trade-in tax credit, trade-in allowance reduces taxable basis
  const tradeInCreditAllowed = input.salesTaxTradeInCredit !== false;
  const taxableBasis = tradeInCreditAllowed
    ? Math.max(0, price - tradeIn)
    : price;
  const salesTaxAmount = Math.round(taxableBasis * taxRate);

  const totalFees = docFee;

  let loanAmountFinanced = price;
  let upfrontCashNeeded = down;

  // Apply down payment
  loanAmountFinanced -= down;

  // Apply net trade-in: if positive it reduces loan; if negative it adds to loan!
  loanAmountFinanced -= netTradeInValue;

  if (input.includeTaxInLoan) {
    loanAmountFinanced += salesTaxAmount;
  } else {
    upfrontCashNeeded += salesTaxAmount;
  }

  if (input.includeFeesInLoan !== false && totalFees > 0) {
    loanAmountFinanced += totalFees;
  } else {
    upfrontCashNeeded += totalFees;
  }

  loanAmountFinanced = Math.max(0, loanAmountFinanced);

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = termMonths > 0 ? loanAmountFinanced / termMonths : 0;
  } else {
    monthlyPayment =
      (loanAmountFinanced * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  monthlyPayment = Math.round(monthlyPayment);
  const totalLoanPayment = monthlyPayment * termMonths;
  const totalInterestPaid = Math.max(0, totalLoanPayment - loanAmountFinanced);
  const trueTotalCostOfOwnership = Math.round(price + salesTaxAmount + totalFees + totalInterestPaid);

  const loanToValueRatio = price > 0
    ? Number(((loanAmountFinanced / price) * 100).toFixed(1))
    : 0;

  return {
    vehiclePrice: Math.round(price),
    salesTaxAmount,
    totalDownPaymentAndTradeIn: Math.round(down + Math.max(0, netTradeInValue)),
    netTradeInValue: Math.round(netTradeInValue),
    totalFees,
    loanAmountFinanced: Math.round(loanAmountFinanced),
    monthlyPayment,
    totalInterestPaid: Math.round(totalInterestPaid),
    totalLoanPayment: Math.round(totalLoanPayment),
    trueTotalCostOfOwnership,
    upfrontCashNeeded: Math.round(upfrontCashNeeded),
    loanToValueRatio,
  };
}
