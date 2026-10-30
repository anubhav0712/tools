import type { ToolDefinition } from '../../core/types';
import { executeEmergencyFund, type EmergencyFundInput, type EmergencyFundOutput } from './engine';
import { EmergencyFundUI } from './ui';

export const emergencyFundCalculatorTool: ToolDefinition<EmergencyFundInput, EmergencyFundOutput> = {
  metadata: {
    id: 'emergency-fund-calculator',
    name: 'Emergency Fund & Safety Net Calculator',
    category: 'finance',
    description: 'Calculate how much cash cushion you need for 3, 6, 9, or 12 months of essential living expenses and find out when you will reach 100% funded.',
    keywords: ['emergency fund', 'safety net', 'savings', 'expenses', 'budget', 'rainy day', 'liquidity', 'runway'],
    version: '1.0.0',
    icon: 'ShieldAlert',
  },
  examples: [
    {
      title: '6-Month Emergency Cushion',
      description: 'Standard 6 months of living expenses with monthly savings roadmap',
      input: {
        housingExpense: 25000,
        foodExpense: 15000,
        utilitiesExpense: 5000,
        loanEmisExpense: 12000,
        insuranceHealthcareExpense: 3000,
        miscEssentialsExpense: 5000,
        bufferMonths: 6,
        currentSavings: 100000,
        monthlySavingsContribution: 20000,
      },
    },
  ],
  execute: executeEmergencyFund,
  Component: EmergencyFundUI,
};
