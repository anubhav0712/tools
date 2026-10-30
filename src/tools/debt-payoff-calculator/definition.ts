import type { ToolDefinition } from '../../core/types';
import { executeDebtPayoff, type DebtPayoffInput, type DebtPayoffOutput } from './engine';
import { DebtPayoffUI } from './ui';

export const debtPayoffCalculatorTool: ToolDefinition<DebtPayoffInput, DebtPayoffOutput> = {
  metadata: {
    id: 'debt-payoff-calculator',
    name: 'Credit Card & Debt Payoff Calculator',
    category: 'finance',
    description: 'Calculate debt-free payoff timelines, total interest charges, and interest saved with extra monthly snowball payments.',
    keywords: ['credit card', 'debt', 'snowball', 'payoff', 'apr', 'interest', 'minimum payment', 'debt free'],
    version: '1.0.0',
    icon: 'CreditCard',
  },
  examples: [
    {
      title: 'Credit Card Debt Snowball',
      description: '$6,000 balance at 22% APR with $50 extra monthly snowball',
      input: {
        balance: 6000,
        annualInterestRate: 22,
        monthlyPayment: 250,
        extraMonthlyPayment: 50,
      },
    },
  ],
  execute: executeDebtPayoff,
  Component: DebtPayoffUI,
};
