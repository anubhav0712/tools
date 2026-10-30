import type { ToolDefinition } from '../../core/types';
import { executeInflation, type InflationInput, type InflationOutput } from './engine';
import { InflationUI } from './ui';

export const inflationCalculatorTool: ToolDefinition<InflationInput, InflationOutput> = {
  metadata: {
    id: 'inflation-calculator',
    name: 'Inflation & Purchasing Power Calculator',
    category: 'finance',
    description: 'Calculate the true future cost of goods and the erosion of your money’s purchasing power over time using the Rule of 72.',
    keywords: ['inflation', 'purchasing power', 'cpi', 'future value', 'rule of 72', 'cost of living', 'wealth decay'],
    version: '1.0.0',
    icon: 'Percent',
  },
  examples: [
    {
      title: '20 Year Inflation Impact',
      description: '$100,000 / ₹1 Crore over 20 years at 6% annual inflation',
      input: {
        amount: 100000,
        annualInflationRate: 6,
        years: 20,
      },
    },
  ],
  execute: executeInflation,
  Component: InflationUI,
};
