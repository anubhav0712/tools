export interface EmergencyFundInput {
  housingExpense: number;       // Rent or Mortgage
  foodExpense: number;          // Groceries & Food essentials
  utilitiesExpense: number;     // Electricity, Water, Internet, Phone
  loanEmisExpense: number;      // Mandatory loan payments / EMIs
  insuranceHealthcareExpense: number; // Insurance premiums, medicines
  miscEssentialsExpense: number;// Other unavoidable essentials
  bufferMonths: number;         // 3, 6, 9, or 12 months
  currentSavings: number;       // Money already set aside
  monthlySavingsContribution?: number; // How much user can save each month
}

export interface EmergencyFundOutput {
  totalMonthlyExpense: number;
  targetFundAmount: number;
  currentSavings: number;
  shortfallOrSurplus: number;
  percentFunded: number;
  monthsToFullFund: number;
  isFullyFunded: boolean;
  expenseBreakdown: {
    label: string;
    amount: number;
    percent: number;
  }[];
}

export function executeEmergencyFund(input: EmergencyFundInput): EmergencyFundOutput {
  const housing = Math.max(0, input.housingExpense || 0);
  const food = Math.max(0, input.foodExpense || 0);
  const utilities = Math.max(0, input.utilitiesExpense || 0);
  const loans = Math.max(0, input.loanEmisExpense || 0);
  const insurance = Math.max(0, input.insuranceHealthcareExpense || 0);
  const misc = Math.max(0, input.miscEssentialsExpense || 0);

  const totalMonthlyExpense = housing + food + utilities + loans + insurance + misc;
  const bufferMonths = Math.max(1, Math.min(24, Math.round(input.bufferMonths || 6)));
  const currentSavings = Math.max(0, input.currentSavings || 0);
  const monthlyContrib = Math.max(0, input.monthlySavingsContribution || 0);

  const targetFundAmount = totalMonthlyExpense * bufferMonths;
  const shortfallOrSurplus = currentSavings - targetFundAmount;
  const isFullyFunded = shortfallOrSurplus >= 0;

  const percentFunded = targetFundAmount > 0
    ? Math.min(200, Math.round((currentSavings / targetFundAmount) * 100))
    : 100;

  const remainingShortfall = Math.max(0, targetFundAmount - currentSavings);
  const monthsToFullFund = monthlyContrib > 0 && remainingShortfall > 0
    ? Math.ceil(remainingShortfall / monthlyContrib)
    : 0;

  const items = [
    { label: 'Housing & Rent', amount: housing },
    { label: 'Food & Groceries', amount: food },
    { label: 'Utilities & Bills', amount: utilities },
    { label: 'Loan EMIs & Debt', amount: loans },
    { label: 'Healthcare & Insurance', amount: insurance },
    { label: 'Misc Essentials', amount: misc },
  ];

  const expenseBreakdown = items
    .filter((item) => item.amount > 0)
    .map((item) => ({
      ...item,
      percent: totalMonthlyExpense > 0 ? Math.round((item.amount / totalMonthlyExpense) * 100) : 0,
    }));

  return {
    totalMonthlyExpense: Math.round(totalMonthlyExpense),
    targetFundAmount: Math.round(targetFundAmount),
    currentSavings: Math.round(currentSavings),
    shortfallOrSurplus: Math.round(shortfallOrSurplus),
    percentFunded,
    monthsToFullFund,
    isFullyFunded,
    expenseBreakdown,
  };
}
