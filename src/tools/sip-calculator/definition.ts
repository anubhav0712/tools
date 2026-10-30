import type { ToolDefinition } from '../../core/types';
import { executeSipCalculator } from './engine';
import { SipCalculatorUI } from './ui';

export interface SipCalculatorInput {
  monthlyInvestment: number;  // Amount invested each month
  annualExpectedReturn: number; // e.g. 12 for 12%
  investmentYears: number;    // Duration in years
  annualStepUpPercent?: number; // e.g. 10 for 10% annual increase in SIP
}

export interface SipYearlyBreakdown {
  year: number;
  totalInvested: number;
  totalReturns: number;
  futureValue: number;
}

export interface SipCalculatorOutput {
  totalInvested: number;
  totalReturns: number;
  maturityValue: number;
  investedPercentage: number;
  returnsPercentage: number;
  yearlySchedule: SipYearlyBreakdown[];
}

export const sipCalculatorTool: ToolDefinition<SipCalculatorInput, SipCalculatorOutput> = {
  metadata: {
    id: 'sip-calculator',
    name: 'SIP & Investment Growth Calculator',
    category: 'finance',
    description: 'Calculate wealth generated through monthly systematic investments (SIP / DCA) with compound returns, annual step-up, and year-by-year growth projections.',
    keywords: ['sip', 'mutual fund', 'investment', 'compound', 'wealth', 'dca', 'stocks', 'returns', '401k'],
    version: '1.0.0',
    icon: 'TrendingUp',
  },
  examples: [
    {
      title: 'Long-Term Equity SIP',
      description: '₹10,000 monthly for 15 years at 12% p.a.',
      input: {
        monthlyInvestment: 10000,
        annualExpectedReturn: 12,
        investmentYears: 15,
        annualStepUpPercent: 0,
      },
    },
  ],
  execute: executeSipCalculator,
  Component: SipCalculatorUI,
};
