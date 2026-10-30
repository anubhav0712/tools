import type { ToolDefinition } from '../../core/types';
import { executeRetirementPlanner, type RetirementInput, type RetirementOutput } from './engine';
import { RetirementUI } from './ui';

export const retirementCalculatorTool: ToolDefinition<RetirementInput, RetirementOutput> = {
  metadata: {
    id: 'retirement-calculator',
    name: 'Retirement & FIRE Planner',
    category: 'finance',
    description: 'Calculate target retirement corpus, inflation-adjusted living expenses, shortfall/surplus, and Trinity FIRE 4% numbers.',
    keywords: ['retirement', 'fire', 'financial independence', 'corpus', 'pension', '401k', 'nps', 'nest egg', 'inflation'],
    version: '1.0.0',
    icon: 'Flame',
  },
  examples: [
    {
      title: 'Age 30 Planning for 60',
      description: 'Monthly expenses ₹50k, 6% inflation, 12% pre-retirement return',
      input: {
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancyYears: 85,
        currentMonthlyExpense: 50000,
        inflationRatePercent: 6,
        preRetirementReturnRate: 12,
        postRetirementReturnRate: 7,
        currentSavings: 500000,
        monthlyContribution: 25000,
      },
    },
  ],
  execute: executeRetirementPlanner,
  Component: RetirementUI,
};
