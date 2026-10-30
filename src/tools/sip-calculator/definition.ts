import type { ToolDefinition } from '../../core/types';
import { executeSipCalculator } from './engine';
import { SipCalculatorUI } from './ui';

export interface SipCalculatorInput {
  monthlyInvestment: number;    // Amount invested each month
  annualExpectedReturn: number; // e.g. 12 for 12%
  investmentYears: number;      // Duration in years
  annualStepUpPercent?: number; // e.g. 10 for 10% annual increase in SIP
  // Enterprise fields
  initialLumpSum?: number;      // Existing portfolio amount
  inflationRatePercent?: number;// Expected annual inflation for real return calculation
  capitalGainsTaxPercent?: number; // e.g. 12.5% for India Budget 2024 equity LTCG
  capitalGainsExemption?: number;  // e.g. 125000 in India
}

export interface SipYearlyBreakdown {
  year: number;
  totalInvested: number;
  totalReturns: number;
  futureValue: number;
  realFutureValue?: number; // Inflation-adjusted purchasing power
}

export interface SipCalculatorOutput {
  totalInvested: number;
  totalReturns: number;
  maturityValue: number;
  investedPercentage: number;
  returnsPercentage: number;
  yearlySchedule: SipYearlyBreakdown[];
  // Enterprise metrics
  realMaturityValue?: number;     // Purchasing power in today's currency
  purchasingPowerLoss?: number;   // Difference between nominal and real corpus
  estimatedTax?: number;          // Estimated capital gains tax
  postTaxMaturityValue?: number;  // Net in-hand corpus after capital gains tax
  cagr?: number;                  // Compounded Annual Growth Rate
}

export const sipCalculatorTool: ToolDefinition<SipCalculatorInput, SipCalculatorOutput> = {
  metadata: {
    id: 'sip-calculator',
    name: 'SIP & Systematic Investment Calculator',
    category: 'finance',
    description: 'Calculate wealth generated through monthly systematic investments (SIP / DCA) with compound returns, annual step-up, inflation-adjusted purchasing power, and LTCG tax analysis.',
    keywords: ['sip', 'mutual fund', 'investment', 'compound', 'wealth', 'dca', 'stocks', 'returns', '401k', 'step up', 'ltcg'],
    version: '1.1.0',
    icon: 'TrendingUp',
    regulatoryStandards: [
      'Association of Mutual Funds in India (AMFI) Disclosure Norms',
      'Securities and Exchange Board of India (SEBI) Performance Reporting Regulations',
      'US SEC Investor Bulletin on Dollar-Cost Averaging',
      'Indian Finance Act 2024 Section 112A (12.5% Equity LTCG)',
    ],
    supportedRegions: ['IN', 'US', 'GLOBAL'],
    formulaCitations: [
      {
        name: 'Systematic Investment Plan Annuity Due',
        formula: 'FV = P * [((1 + r)^n - 1) / r] * (1 + r)',
        description: 'Monthly systematic compounding where investment occurs at the start of each period.',
      },
      {
        name: 'Fisher Inflation-Adjusted Real Value',
        formula: 'FV_real = FV_nominal / (1 + inflation)^years',
        description: 'Purchasing power adjustment discounting future corpus into base-year constant currency.',
      },
    ],
    parameters: {
      monthlyInvestment: {
        name: 'monthlyInvestment',
        label: 'Monthly SIP Amount',
        description: 'Amount invested systematically every month.',
        dataType: 'number',
        unit: 'currency',
        required: true,
        min: 100,
        max: 50000000,
        step: 500,
        defaultValue: 10000,
        group: 'basic',
      },
      annualExpectedReturn: {
        name: 'annualExpectedReturn',
        label: 'Expected Return Rate (p.a.)',
        description: 'Expected annualized portfolio growth rate.',
        dataType: 'number',
        unit: 'percent',
        required: true,
        min: 1,
        max: 35,
        step: 0.5,
        defaultValue: 12,
        group: 'basic',
      },
      investmentYears: {
        name: 'investmentYears',
        label: 'Investment Time Horizon',
        description: 'Duration of the systematic investment plan in years.',
        dataType: 'number',
        unit: 'years',
        required: true,
        min: 1,
        max: 50,
        step: 1,
        defaultValue: 15,
        group: 'basic',
      },
      annualStepUpPercent: {
        name: 'annualStepUpPercent',
        label: 'Annual Step-Up Rate',
        description: 'Percentage by which monthly contribution increases each year with salary hikes.',
        dataType: 'number',
        unit: 'percent',
        required: false,
        min: 0,
        max: 50,
        step: 1,
        defaultValue: 0,
        group: 'scenario',
      },
      initialLumpSum: {
        name: 'initialLumpSum',
        label: 'Initial Starting Lump-Sum',
        description: 'Existing portfolio capital deployed at day zero.',
        dataType: 'number',
        unit: 'currency',
        required: false,
        min: 0,
        max: 1000000000,
        step: 5000,
        defaultValue: 0,
        group: 'advanced',
      },
      inflationRatePercent: {
        name: 'inflationRatePercent',
        label: 'Expected Annual Inflation',
        description: 'Inflation rate used to calculate real purchasing power of future corpus.',
        dataType: 'number',
        unit: 'percent',
        required: false,
        min: 0,
        max: 20,
        step: 0.5,
        defaultValue: 6,
        group: 'advanced',
      },
    },
  },
  examples: [
    {
      title: 'Nifty 50 Wealth Accumulator',
      description: '₹15,000 monthly for 20 years at 12% p.a. with 6% inflation adjustment',
      input: {
        monthlyInvestment: 15000,
        annualExpectedReturn: 12,
        investmentYears: 20,
        annualStepUpPercent: 0,
        inflationRatePercent: 6,
      },
    },
    {
      title: '10% Annual Step-Up Supercharger',
      description: '₹10,000 monthly with 10% annual salary step-up at 12.5% return for 15 years',
      input: {
        monthlyInvestment: 10000,
        annualExpectedReturn: 12.5,
        investmentYears: 15,
        annualStepUpPercent: 10,
      },
    },
    {
      title: 'US S&P 500 Dollar-Cost Averaging',
      description: '$1,000/mo at 9.5% for 25 years with $10,000 initial lump-sum and 3% inflation',
      input: {
        monthlyInvestment: 1000,
        annualExpectedReturn: 9.5,
        investmentYears: 25,
        initialLumpSum: 10000,
        inflationRatePercent: 3,
      },
    },
    {
      title: 'Child Higher Education 15-Year Goal',
      description: '₹25,000 monthly for 15 years at 11% with Budget 2024 LTCG tax deduction (12.5%)',
      input: {
        monthlyInvestment: 25000,
        annualExpectedReturn: 11,
        investmentYears: 15,
        capitalGainsTaxPercent: 12.5,
        capitalGainsExemption: 125000,
      },
    },
  ],
  execute: executeSipCalculator,
  Component: SipCalculatorUI,
};
