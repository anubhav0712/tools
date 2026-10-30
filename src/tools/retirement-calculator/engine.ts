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
  // Enterprise fields
  annualStepUpSavingsPercent?: number; // Career salary step-up
  postRetirementGuaranteedIncomeAnnual?: number; // Social Security / NPS / pension
  swrPercent?: number; // Custom Safe Withdrawal Rate (default 4%)
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
  // Enterprise Metrics
  netRequiredCorpusAfterPension?: number;
  swrSafeWithdrawalAmount?: number;
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
  const stepUpRate = Math.max(0, input.annualStepUpSavingsPercent || 0) / 100;
  const guaranteedPension = Math.max(0, input.postRetirementGuaranteedIncomeAnnual || 0);

  const currentMonthlyExpense = Math.max(0, input.currentMonthlyExpense || 0);
  const currentSavings = Math.max(0, input.currentSavings || 0);
  const initialMonthlyContribution = Math.max(0, input.monthlyContribution || 0);

  // 1. Calculate Monthly Expense adjusted for inflation at retirement age
  const inflationFactorAtRetire = Math.pow(1 + inflationRate, yearsToRetire);
  const monthlyExpenseAtRetirement = currentMonthlyExpense * inflationFactorAtRetire;
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // 2. Real rate of return during retirement (Fisher equation)
  const realPostReturnRate = (1 + postReturnRate) / (1 + inflationRate) - 1;

  // 3. Required Corpus at retirement using Present Value of Growing Annuity
  // Net of guaranteed pension streams
  const netAnnualExpenseNeeded = Math.max(0, annualExpenseAtRetirement - guaranteedPension);

  let requiredCorpus = 0;
  let netRequiredCorpusAfterPension = 0;

  if (Math.abs(realPostReturnRate) < 0.0001) {
    requiredCorpus = annualExpenseAtRetirement * yearsInRetire;
    netRequiredCorpusAfterPension = netAnnualExpenseNeeded * yearsInRetire;
  } else {
    const annuityFactor = (1 - Math.pow(1 + realPostReturnRate, -yearsInRetire)) / realPostReturnRate;
    requiredCorpus = annualExpenseAtRetirement * annuityFactor;
    netRequiredCorpusAfterPension = netAnnualExpenseNeeded * annuityFactor;
  }
  requiredCorpus = Math.max(0, Math.round(requiredCorpus));
  netRequiredCorpusAfterPension = Math.max(0, Math.round(netRequiredCorpusAfterPension));

  // The actual corpus target considering guaranteed pension
  const activeRequiredCorpus = guaranteedPension > 0 ? netRequiredCorpusAfterPension : requiredCorpus;

  // 4. Project Corpus at retirement age based on current savings and contributions (with optional annual step-up)
  const monthlyPreRate = preReturnRate / 12;
  let projectedSavingsCorpus = currentSavings * Math.pow(1 + preReturnRate, yearsToRetire);
  let projectedContributionsCorpus = 0;

  if (stepUpRate > 0) {
    // Month-by-month accumulation with annual step-up
    let currentMonthly = initialMonthlyContribution;
    let accum = 0;
    for (let m = 1; m <= yearsToRetire * 12; m++) {
      accum = (accum + currentMonthly) * (1 + monthlyPreRate);
      if (m % 12 === 0) {
        currentMonthly *= (1 + stepUpRate);
      }
    }
    projectedContributionsCorpus = accum;
  } else {
    // Closed-form FV of monthly annuity
    const totalMonths = yearsToRetire * 12;
    projectedContributionsCorpus = monthlyPreRate > 0
      ? initialMonthlyContribution * ((Math.pow(1 + monthlyPreRate, totalMonths) - 1) / monthlyPreRate)
      : initialMonthlyContribution * totalMonths;
  }

  const projectedCorpus = Math.round(projectedSavingsCorpus + projectedContributionsCorpus);
  const shortfallOrSurplus = projectedCorpus - activeRequiredCorpus;
  const isRetirementReady = shortfallOrSurplus >= 0;

  // 5. Recommended monthly saving needed if there's a shortfall
  let recommendedMonthlySaving = initialMonthlyContribution;
  if (shortfallOrSurplus < 0) {
    const additionalCorpusNeeded = activeRequiredCorpus - projectedSavingsCorpus;
    const totalMonths = yearsToRetire * 12;
    if (additionalCorpusNeeded > 0 && monthlyPreRate > 0) {
      recommendedMonthlySaving = Math.round(
        additionalCorpusNeeded / ((Math.pow(1 + monthlyPreRate, totalMonths) - 1) / monthlyPreRate)
      );
    }
  }

  // 6. FIRE metrics
  const fireNumber25x = Math.round(annualExpenseAtRetirement * 25);
  const fireNumber33x = Math.round(annualExpenseAtRetirement * 33.33);
  const swrRate = (input.swrPercent || 4) / 100;
  const swrSafeWithdrawalAmount = Math.round(projectedCorpus * swrRate);

  // 7. Timeline trajectory
  const timeline: RetirementYearMilestone[] = [];

  for (let yr = 1; yr <= yearsToRetire; yr++) {
    if (yr % 5 === 0 || yr === yearsToRetire) {
      const age = currentAge + yr;
      const monthsElapsed = yr * 12;
      const yrSavingsFV = currentSavings * Math.pow(1 + preReturnRate, yr);
      const yrContribFV = monthlyPreRate > 0
        ? initialMonthlyContribution * ((Math.pow(1 + monthlyPreRate, monthsElapsed) - 1) / monthlyPreRate)
        : initialMonthlyContribution * monthsElapsed;
      const milestoneCorpus = Math.round(yrSavingsFV + yrContribFV);

      timeline.push({
        age,
        year: yr,
        annualExpense: Math.round(currentMonthlyExpense * 12 * Math.pow(1 + inflationRate, yr)),
        projectedCorpus: milestoneCorpus,
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
    netRequiredCorpusAfterPension,
    swrSafeWithdrawalAmount,
  };
}
