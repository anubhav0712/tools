import type { ToolDefinition } from '../../core/types';
import { executeLoanCalculator } from './engine';
import { LoanCalculatorUI } from './ui';

export interface LoanCalculatorInput {
  principal: number;          // Total loan amount
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureYears: number;        // Loan term in years
  extraMonthlyPayment?: number; // Optional prepayment amount
  propertyTaxAnnual?: number;   // US property tax
  insuranceAnnual?: number;     // US home insurance
}

export interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface LoanCalculatorOutput {
  monthlyEmi: number;
  totalMonthlyPayment: number; // EMI + taxes/insurance
  totalInterest: number;
  totalPayment: number;
  principalPercentage: number;
  interestPercentage: number;
  payoffMonths: number;
  interestSavedWithPrepayment: number;
  monthsSavedWithPrepayment: number;
  yearlySchedule: AmortizationYear[];
}

export const loanCalculatorTool: ToolDefinition<LoanCalculatorInput, LoanCalculatorOutput> = {
  metadata: {
    id: 'loan-calculator',
    name: 'Loan & Mortgage EMI Calculator',
    category: 'finance',
    description: 'Calculate monthly EMI, total interest, and amortization schedule with country-specific loan rates, property taxes, and prepayment savings.',
    keywords: ['loan', 'mortgage', 'emi', 'interest', 'home loan', 'amortization', 'prepayment', 'car loan'],
    version: '1.0.0',
    icon: 'Calculator',
  },
  examples: [
    {
      title: 'Home Loan Example',
      description: 'Standard home loan scenario',
      input: {
        principal: 5000000,
        annualInterestRate: 8.75,
        tenureYears: 20,
      },
    },
  ],
  execute: executeLoanCalculator,
  Component: LoanCalculatorUI,
};
