export interface DebtPayoffInput {
  balance: number;
  annualInterestRate: number; // e.g. 24 for 24% APR
  monthlyPayment: number;     // Planned monthly payment
  extraMonthlyPayment?: number; // Extra snowball payment
  minimumPaymentPercentage?: number; // e.g. 3% minimum rule
  useMinimumPayment?: boolean;
}

export interface DebtPayoffMonth {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface DebtPayoffOutput {
  initialBalance: number;
  monthlyPaymentUsed: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  monthsToPayoff: number;
  isPayable: boolean; // false if payment < monthly interest (debt ballooning)
  minimumPaymentTrapWarning: boolean;
  savingsWithExtra?: {
    monthsSaved: number;
    interestSaved: number;
  };
  schedule: DebtPayoffMonth[];
}

function simulatePayoff(
  balance: number,
  monthlyRate: number,
  payment: number
): { months: number; totalInterest: number; schedule: DebtPayoffMonth[]; isPayable: boolean } {
  let currBalance = balance;
  let totalInterest = 0;
  const schedule: DebtPayoffMonth[] = [];
  const maxMonths = 600; // 50 years cap

  for (let m = 1; m <= maxMonths; m++) {
    const interest = currBalance * monthlyRate;
    totalInterest += interest;

    if (payment <= interest && m === 1) {
      return { months: Infinity, totalInterest: Infinity, schedule: [], isPayable: false };
    }

    const principal = Math.min(currBalance, payment - interest);
    currBalance = Math.max(0, currBalance - principal);

    if (m <= 60 || m % 12 === 0 || currBalance === 0) {
      schedule.push({
        month: m,
        payment: Math.round(principal + interest),
        principal: Math.round(principal),
        interest: Math.round(interest),
        remainingBalance: Math.round(currBalance),
      });
    }

    if (currBalance <= 0.01) {
      return { months: m, totalInterest: Math.round(totalInterest), schedule, isPayable: true };
    }
  }

  return { months: maxMonths, totalInterest: Math.round(totalInterest), schedule, isPayable: false };
}

export function executeDebtPayoff(input: DebtPayoffInput): DebtPayoffOutput {
  const balance = Math.max(0, input.balance || 0);
  const apr = Math.max(0, input.annualInterestRate || 0) / 100;
  const monthlyRate = apr / 12;

  const minPercent = (input.minimumPaymentPercentage || 3) / 100;
  const computedMinPayment = Math.max(balance * minPercent, 25);

  const basePayment = input.useMinimumPayment
    ? computedMinPayment
    : Math.max(0, input.monthlyPayment || computedMinPayment);

  const extraPayment = Math.max(0, input.extraMonthlyPayment || 0);
  const totalPayment = basePayment + extraPayment;

  // Run base simulation
  const baseSim = simulatePayoff(balance, monthlyRate, basePayment);
  // Run with extra payment simulation if extra > 0
  const activeSim = extraPayment > 0
    ? simulatePayoff(balance, monthlyRate, totalPayment)
    : baseSim;

  let savingsWithExtra: { monthsSaved: number; interestSaved: number } | undefined = undefined;
  if (extraPayment > 0 && baseSim.isPayable && activeSim.isPayable) {
    savingsWithExtra = {
      monthsSaved: Math.max(0, baseSim.months - activeSim.months),
      interestSaved: Math.max(0, baseSim.totalInterest - activeSim.totalInterest),
    };
  }

  const isPayable = activeSim.isPayable;
  const monthsToPayoff = isPayable ? activeSim.months : 0;
  const totalInterestPaid = isPayable ? activeSim.totalInterest : 0;
  const totalAmountPaid = isPayable ? Math.round(balance + totalInterestPaid) : 0;

  return {
    initialBalance: Math.round(balance),
    monthlyPaymentUsed: Math.round(totalPayment),
    totalInterestPaid,
    totalAmountPaid,
    monthsToPayoff,
    isPayable,
    minimumPaymentTrapWarning: Boolean(input.useMinimumPayment || basePayment <= computedMinPayment * 1.1),
    savingsWithExtra,
    schedule: activeSim.schedule,
  };
}
