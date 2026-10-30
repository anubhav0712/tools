import type { ToolDefinition } from '../../core/types';
import { executeFd, type FdInput, type FdOutput } from './engine';
import { FdUI } from './ui';

export const fdCalculatorTool: ToolDefinition<FdInput, FdOutput> = {
  metadata: {
    id: 'fd-calculator',
    name: 'Fixed Deposit & CD Calculator',
    category: 'finance',
    description: 'Calculate guaranteed bank Fixed Deposit (FD) and Certificate of Deposit (CD) returns with quarterly compounding, senior citizen bonus, and TDS deductions.',
    keywords: ['fd', 'fixed deposit', 'cd', 'certificate of deposit', 'term deposit', 'senior citizen', 'tds', 'bank interest'],
    version: '1.0.0',
    icon: 'PiggyBank',
  },
  examples: [
    {
      title: '3-Year Bank Fixed Deposit',
      description: '₹5,00,000 at 7.1% p.a. quarterly compounding',
      input: {
        depositAmount: 500000,
        annualInterestRate: 7.1,
        tenureYears: 3,
        compoundingFrequency: 'quarterly',
      },
    },
    {
      title: 'US 1-Year Certificate of Deposit (CD)',
      description: '$10,000 at 5.0% APY monthly compounding',
      input: {
        depositAmount: 10000,
        annualInterestRate: 5.0,
        tenureYears: 1,
        compoundingFrequency: 'monthly',
      },
    },
  ],
  execute: executeFd,
  Component: FdUI,
};
