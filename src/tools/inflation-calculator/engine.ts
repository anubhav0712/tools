export type InflationBasketCategory = 'general_cpi' | 'education' | 'healthcare' | 'housing' | 'custom';

export interface InflationInput {
  amount: number;
  annualInflationRate: number; // e.g. 6 for 6%
  years: number;
  mode?: 'future_cost' | 'purchasing_power';
  // Enterprise fields
  basketCategory?: InflationBasketCategory;
}

export interface InflationYearSchedule {
  year: number;
  equivalentAmount: number;
  purchasingPowerPercentage: number;
}

export interface InflationOutput {
  initialAmount: number;
  futureCost: number;
  purchasingPowerValue: number;
  purchasingPowerLossPercent: number;
  cumulativeInflationPercent: number;
  doublingYears: number; // Rule of 72 heuristic
  // Enterprise Exact Metrics
  exactDoublingYears: number; // ln(2) / ln(1 + r)
  annualizedDecayRate: number;
  yearlySchedule: InflationYearSchedule[];
}

export function executeInflation(input: InflationInput): InflationOutput {
  const amount = Math.max(0, input.amount || 0);
  const rate = Math.max(0, input.annualInflationRate || 0) / 100;
  const years = Math.max(1, Math.min(60, Math.round(input.years || 1)));

  // Future Cost: FV = PV * (1 + r)^n
  const futureCost = Math.round(amount * Math.pow(1 + rate, years));

  // Purchasing Power: PV = FV / (1 + r)^n
  const purchasingPowerValue = rate > 0
    ? Math.round(amount / Math.pow(1 + rate, years))
    : amount;

  const purchasingPowerLossPercent = amount > 0
    ? Number((((amount - purchasingPowerValue) / amount) * 100).toFixed(1))
    : 0;

  const cumulativeInflationPercent = Number(((Math.pow(1 + rate, years) - 1) * 100).toFixed(1));

  // Rule of 72 heuristic
  const doublingYears = rate > 0 ? Number((72 / (rate * 100)).toFixed(1)) : 0;

  // Exact logarithmic doubling time: ln(2) / ln(1 + rate)
  const exactDoublingYears = rate > 0
    ? Number((Math.log(2) / Math.log(1 + rate)).toFixed(2))
    : 0;

  // Annualized purchasing power decay rate: 1 - 1 / (1 + r)
  const annualizedDecayRate = rate > 0
    ? Number(((1 - 1 / (1 + rate)) * 100).toFixed(2))
    : 0;

  const yearlySchedule: InflationYearSchedule[] = [];
  for (let yr = 1; yr <= years; yr++) {
    const factor = Math.pow(1 + rate, yr);
    const equiv = Math.round(amount * factor);
    const ppPercent = Number(((1 / factor) * 100).toFixed(1));

    if (yr <= 10 || yr % 5 === 0 || yr === years) {
      yearlySchedule.push({
        year: yr,
        equivalentAmount: equiv,
        purchasingPowerPercentage: ppPercent,
      });
    }
  }

  return {
    initialAmount: Math.round(amount),
    futureCost,
    purchasingPowerValue,
    purchasingPowerLossPercent,
    cumulativeInflationPercent,
    doublingYears,
    exactDoublingYears,
    annualizedDecayRate,
    yearlySchedule,
  };
}
