import type { ToolDefinition } from '../../core/types';
import { executeAutoLoan, type AutoLoanInput, type AutoLoanOutput } from './engine';
import { AutoLoanUI } from './ui';

export const autoLoanCalculatorTool: ToolDefinition<AutoLoanInput, AutoLoanOutput> = {
  metadata: {
    id: 'auto-loan-calculator',
    name: 'Car Loan & Auto Financing Calculator',
    category: 'finance',
    description: 'Calculate monthly car EMI payments, sales tax / RTO charges, trade-in value deductions, and true total cost of vehicle ownership.',
    keywords: ['car loan', 'auto loan', 'car emi', 'vehicle financing', 'rto', 'sales tax', 'trade in', 'car payment'],
    version: '1.0.0',
    icon: 'Car',
  },
  examples: [
    {
      title: 'New Car Financing (60 Months)',
      description: '$35,000 / ₹15 Lakhs vehicle purchase with 20% down payment',
      input: {
        vehiclePrice: 35000,
        downPayment: 7000,
        tradeInValue: 0,
        salesTaxRatePercent: 6,
        includeTaxInLoan: true,
        loanTermMonths: 60,
        annualInterestRate: 6.5,
      },
    },
  ],
  execute: executeAutoLoan,
  Component: AutoLoanUI,
};
