export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancyYears?: number; // default 85
  currentMonthlyExpense: number;
  inflationRatePercent: number; // e.g. 6% in India, 3% in US
  preRetirementReturnRate: number; // e.g. 11%
  postRetirementReturnRate: number; // e.g. 7%
  currentSavings: number;
  monthlyContribution: number;
}

export interface RetirementYearMilestone {
  age: number;
  year: number;
  annualExpense: number;
  projectedCorpus: number;
  phase: 'accumulation' | 'distribution';
}

export interface RetirementOutput {
  yearsToRetirement: number;
  yearsInRetirement: number;
  monthlyExpenseAtRetirement: number;
  annualExpenseAtRetirement: number;
  requiredCorpus: number;
  projectedCorpus: number;
  shortfallOrSurplus: number; // positive = surplus, negative = shortfall
  isRetirementReady: boolean;
  recommendedMonthlySaving: number;
  fireNumber25x: number; // 4% rule
  fireNumber33x: number; // 3% rule
  timeline: RetirementYearMilestone[];
}

export function executeRetirementPlanner(input: RetirementInput): RetirementOutput {
  const currentAge = Math.max(18, Math.min(80, input.currentAge || 30));
  const retirementAge = Math.max(currentAge + 1, Math.min(90, input.retirementAge || 60));
  const lifeExpectancy = Math.max(retirementAge + 1, Math.min(105, input.lifeExpectancyYears || 85));

  const yearsToRetire = retirementAge - currentAge;
  const yearsInRetire = lifeExpectancy - retirementAge;

  const inflationRate = Math.max(0, input.inflationRatePercent || 0) / 100;
  const preReturnRate = Math.max(0, input.preRetirementReturnRate || 0) / 100;
  const postReturnRate = Math.max(0, input.postRetirementReturnRate || 0) / 100;

  const currentMonthlyExpense = Math.max(0, input.currentMonthlyExpense || 0);
  const currentSavings = Math.max(0, input.currentSavings || 0);
  const monthlyContribution = Math.max(0, input.monthlyContribution || 0);

  // 1. Calculate Monthly Expense adjusted for inflation at retirement age
  // FV = PV * (1 + inflation)^yearsToRetire
  const inflationFactorAtRetire = Math.pow(1 + inflationRate, yearsToRetire);
  const monthlyExpenseAtRetirement = currentMonthlyExpense * inflationFactorAtRetire;
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // 2. Real rate of return during retirement (Fisher equation: (1 + r) / (1 + i) - 1)
  const realPostReturnRate = (1 + postReturnRate) / (1 + inflationRate) - 1;

  // 3. Required Corpus at retirement using Present Value of Growing Annuity
  // If real return > 0: PV = Expense * (1 - (1 + realRate)^-n) / realRate
  let requiredCorpus = 0;
  if (Math.abs(realPostReturnRate) < 0.0001) {
    requiredCorpus = annualExpenseAtRetirement * yearsInRetire;
  } else {
    requiredCorpus =
      annualExpenseAtRetirement *
      ((1 - Math.pow(1 + realPostReturnRate, -yearsInRetire)) / realPostReturnRate);
  }
  requiredCorpus = Math.max(0, Math.round(requiredCorpus));

  // 4. Project Corpus at retirement age based on current savings and contributions
  // Growth of current savings:
  const savingsFutureValue = currentSavings * Math.pow(1 + preReturnRate, yearsToRetire);

  // Growth of monthly contributions:
  // FV of annuity = P * [((1 + r/12)^(n*12) - 1) / (r/12)]
  const monthlyPreRate = preReturnRate / 12;
  const totalMonths = yearsToRetire * 12;
  const contributionsFutureValue = monthlyPreRate > 0
    ? monthlyContribution * ((Math.pow(1 + monthlyPreRate, totalMonths) - 1) / monthlyPreRate)
    : monthlyContribution * totalMonths;

  const projectedCorpus = Math.round(savingsFutureValue + contributionsFutureValue);
  const shortfallOrSurplus = projectedCorpus - requiredCorpus;
  const isRetirementReady = shortfallOrSurplus >= 0;

  // 5. Recommended monthly saving needed if there's a shortfall
  let recommendedMonthlySaving = monthlyContribution;
  if (shortfallOrSurplus < 0) {
    const additionalCorpusNeeded = requiredCorpus - savingsFutureValue;
    if (additionalCorpusNeeded > 0 && monthlyPreRate > 0) {
      recommendedMonthlySaving = Math.round(
        additionalCorpusNeeded / ((Math.pow(1 + monthlyPreRate, totalMonths) - 1) / monthlyPreRate)
      );
    }
  }

  // 6. FIRE 4% rule (25x) and 3.3% rule (30x-33x) in retirement dollars
  const fireNumber25x = Math.round(annualExpenseAtRetirement * 25);
  const fireNumber33x = Math.round(annualExpenseAtRetirement * 33.33);

  // 7. Timeline trajectory
  const timeline: RetirementYearMilestone[] = [];
  let corpusTracker = currentSavings;

  for (let yr = 1; yr <= yearsToRetire; yr++) {
    const age = currentAge + yr;
    corpusTracker = corpusTracker * (1 + preReturnRate) + monthlyContribution * 12;
    if (yr % 5 === 0 || yr === yearsToRetire) {
      timeline.push({
        age,
        year: yr,
        annualExpense: Math.round(currentMonthlyExpense * 12 * Math.pow(1 + inflationRate, yr)),
        projectedCorpus: Math.round(corpusTracker),
        phase: 'accumulation',
      });
    }
  }

  return {
    yearsToRetirement: yearsToRetire,
    yearsInRetirement: yearsInRetire,
    monthlyExpenseAtRetirement: Math.round(monthlyExpenseAtRetirement),
    annualExpenseAtRetirement: Math.round(annualExpenseAtRetirement),
    requiredCorpus,
    projectedCorpus,
    shortfallOrSurplus,
    isRetirementReady,
    recommendedMonthlySaving,
    fireNumber25x,
    fireNumber33x,
    timeline,
  };
}
