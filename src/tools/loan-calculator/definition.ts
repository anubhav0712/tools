import type { ToolDefinition } from '../../core/types';
import { executeLoanCalculator } from './engine';
import { LoanCalculatorUI } from './ui';

export type LoanPaymentFrequency = 'monthly' | 'biweekly' | 'accelerated_biweekly';

export interface LoanCalculatorInput {
  principal: number;          // Total loan amount
  annualInterestRate: number; // e.g. 8.5 for 8.5%
  tenureYears: number;        // Loan term in years
  extraMonthlyPayment?: number; // Optional prepayment amount
  propertyTaxAnnual?: number;   // US property tax
  insuranceAnnual?: number;     // US home insurance
  // Enterprise fields
  originationFeePercent?: number; // Lender points / origination % (e.g. 1.0 for 1%)
  closingCostsFixed?: number;     // Upfront fixed closing costs
  homeValue?: number;             // Market/Purchase property value (for LTV & PMI)
  pmiAnnualPercent?: number;      // Private Mortgage Insurance annual % (e.g. 0.85%)
  paymentFrequency?: LoanPaymentFrequency; // Repayment frequency mode
}

export interface AmortizationYear {
  year: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface LoanCalculatorOutput {
  monthlyEmi: number;
  totalMonthlyPayment: number; // EMI + taxes/insurance + PMI + extra
  totalInterest: number;
  totalPayment: number;
  principalPercentage: number;
  interestPercentage: number;
  payoffMonths: number;
  interestSavedWithPrepayment: number;
  monthsSavedWithPrepayment: number;
  yearlySchedule: AmortizationYear[];
  // Enterprise Compliance Metrics
  apr?: number;                 // Truth in Lending Act (TILA Regulation Z) APR
  totalFinanceCharges?: number; // Total Interest + Upfront Fees + PMI
  loanToValueRatio?: number;    // Initial LTV (%)
  pmiMonthly?: number;          // Monthly PMI amount while active
  pmiMonthsRemaining?: number;  // Months until balance drops below 78% LTV (HPA rule)
  totalPmiPaid?: number;        // Cumulative PMI paid
}

export const loanCalculatorTool: ToolDefinition<LoanCalculatorInput, LoanCalculatorOutput> = {
  metadata: {
    id: 'loan-calculator',
    name: 'Loan & Mortgage EMI Calculator',
    category: 'finance',
    description: 'Calculate monthly EMI, total interest, and amortization schedule with country-specific loan rates, property taxes, TILA APR, and prepayment savings.',
    keywords: ['loan', 'mortgage', 'emi', 'interest', 'home loan', 'amortization', 'prepayment', 'car loan', 'apr', 'tila', 'pmi'],
    version: '1.1.0',
    icon: 'Calculator',
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'TILA Regulation Z § 1026.22 / Uniform Amortization Annuity Mathematics',
      lastReviewedDate: '2026-10-01',
      changeRisk: 'low',
      notes: 'Amortization annuity formula is mathematically invariant. TILA APR root-finding is standard IRR.',
    },
    regulatoryStandards: [
      'Truth in Lending Act (TILA / Regulation Z § 1026.22)',
      'Homeowners Protection Act (HPA 1998 - 78% LTV PMI Auto-Termination)',
      'Fannie Mae / Freddie Mac Uniform Amortization Guidelines',
      'Reserve Bank of India (RBI) Master Directions on Retail Loans',
    ],
    supportedRegions: ['US', 'IN', 'GLOBAL'],
    formulaCitations: [
      {
        name: 'Fixed Rate Amortization Payment',
        formula: 'EMI = P * [r(1 + r)^n] / [(1 + r)^n - 1]',
        description: 'Standard reducing balance annuity formula for monthly loan repayment.',
      },
      {
        name: 'TILA APR Internal Rate of Return',
        formula: 'P - Fees = Sum_{t=1}^n [Payment_t / (1 + APR/12)^t]',
        description: 'Federal Truth in Lending Act APR solving for annualized borrowing rate including points and origination fees.',
      },
    ],
    parameters: {
      principal: {
        name: 'principal',
        label: 'Loan Principal',
        description: 'Total amount borrowed after down payment.',
        dataType: 'number',
        unit: 'currency',
        required: true,
        min: 1000,
        max: 500000000,
        step: 1000,
        defaultValue: 400000,
        group: 'basic',
      },
      annualInterestRate: {
        name: 'annualInterestRate',
        label: 'Annual Interest Rate (Note Rate)',
        description: 'Nominal annual interest rate on the loan note.',
        dataType: 'number',
        unit: 'percent',
        required: true,
        min: 0.1,
        max: 35,
        step: 0.05,
        defaultValue: 6.85,
        group: 'basic',
      },
      tenureYears: {
        name: 'tenureYears',
        label: 'Loan Tenure',
        description: 'Duration of the loan in years.',
        dataType: 'number',
        unit: 'years',
        required: true,
        min: 1,
        max: 40,
        step: 1,
        defaultValue: 30,
        group: 'basic',
      },
      extraMonthlyPayment: {
        name: 'extraMonthlyPayment',
        label: 'Extra Monthly Prepayment',
        description: 'Additional principal repaid each month to accelerate payoff and save interest.',
        dataType: 'number',
        unit: 'currency',
        required: false,
        min: 0,
        max: 1000000,
        step: 50,
        defaultValue: 0,
        group: 'scenario',
      },
      originationFeePercent: {
        name: 'originationFeePercent',
        label: 'Origination & Discount Points',
        description: 'Percentage of principal charged upfront by lender (affects APR).',
        dataType: 'number',
        unit: 'percent',
        required: false,
        min: 0,
        max: 10,
        step: 0.125,
        defaultValue: 0,
        group: 'fees',
        regulatoryReference: '12 CFR § 1026.4',
      },
      homeValue: {
        name: 'homeValue',
        label: 'Home Purchase Value',
        description: 'Total market/purchase value of property for LTV assessment.',
        dataType: 'number',
        unit: 'currency',
        required: false,
        min: 0,
        max: 1000000000,
        defaultValue: 500000,
        group: 'advanced',
      },
    },
  },
  examples: [
    {
      title: 'US 30-Year Conventional Mortgage',
      description: '$400,000 principal at 6.85% fixed rate for 30 years with property tax and insurance',
      input: {
        principal: 400000,
        annualInterestRate: 6.85,
        tenureYears: 30,
        homeValue: 500000,
        propertyTaxAnnual: 4500,
        insuranceAnnual: 1200,
      },
    },
    {
      title: 'US 15-Year Fast-Track Mortgage',
      description: '$350,000 principal at 6.15% fixed rate for 15 years with 1% origination fee',
      input: {
        principal: 350000,
        annualInterestRate: 6.15,
        tenureYears: 15,
        originationFeePercent: 1.0,
      },
    },
    {
      title: 'India SBI Regular Home Loan with Prepayment',
      description: '₹50,00,000 at 8.75% for 20 years with ₹5,000 extra monthly prepayment',
      input: {
        principal: 5000000,
        annualInterestRate: 8.75,
        tenureYears: 20,
        extraMonthlyPayment: 5000,
      },
    },
    {
      title: 'FHA Loan with 3.5% Down & PMI',
      description: '$289,500 loan on $300,000 home (96.5% LTV) with 0.85% annual PMI',
      input: {
        principal: 289500,
        homeValue: 300000,
        annualInterestRate: 6.5,
        tenureYears: 30,
        pmiAnnualPercent: 0.85,
      },
    },
  ],
  execute: executeLoanCalculator,
  Component: LoanCalculatorUI,
};
