import type { ToolDefinition } from '../../core/types';
import { executeCompoundInterest, type CompoundInterestInput, type CompoundInterestOutput } from './engine';
import { CompoundInterestUI } from './ui';

export const compoundInterestCalculatorTool: ToolDefinition<CompoundInterestInput, CompoundInterestOutput> = {
  metadata: {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    category: 'finance',
    description: 'Calculate interest growth with flexible compounding frequencies (daily, monthly, quarterly, annually) and regular deposits.',
    keywords: ['compound interest', 'interest', 'savings', 'hysa', 'cd', 'wealth', 'growth', 'fixed deposit'],
    version: '1.0.0',
    icon: 'TrendingUp',
  },
  examples: [
    {
      title: 'High Yield Savings / Index Fund',
      description: '$10,000 principal at 8% compounded monthly for 10 years with $200/mo deposit',
      input: {
        initialPrincipal: 10000,
        annualInterestRate: 8,
        investmentYears: 10,
        compoundingFrequency: 'monthly',
        regularDeposit: 200,
        depositFrequency: 'monthly',
      },
    },
  ],
  execute: executeCompoundInterest,
  Component: CompoundInterestUI,
};
