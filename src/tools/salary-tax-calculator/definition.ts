import type { ToolDefinition } from '../../core/types';
import { executeSalaryTax, type SalaryTaxInput, type SalaryTaxOutput } from './engine';
import { SalaryTaxUI } from './ui';

export const salaryTaxCalculatorTool: ToolDefinition<SalaryTaxInput, SalaryTaxOutput> = {
  metadata: {
    id: 'salary-tax-calculator',
    name: 'Salary & Take-Home Pay Calculator',
    category: 'finance',
    description: 'Calculate net in-hand monthly salary, income tax brackets, EPF/401(k), and deductions for India (New/Old Regime) and the US.',
    keywords: ['salary', 'in-hand', 'take home', 'tax', 'income tax', 'ctc', 'paycheck', 'fica', '401k', 'epf', 'new tax regime'],
    version: '1.0.0',
    icon: 'DollarSign',
  },
  examples: [
    {
      title: 'India CTC ₹15 Lakhs (New Regime)',
      description: 'Standard ₹15L package under FY 2024-25 / 2025-26 rules',
      input: {
        region: 'IN',
        annualGrossSalary: 1500000,
        indiaRegime: 'new',
        includeEpf: true,
      },
    },
    {
      title: 'US $100k Paycheck',
      description: '$100,000 gross annual salary for Single filer',
      input: {
        region: 'US',
        annualGrossSalary: 100000,
        usFilingStatus: 'single',
        usStateTaxRate: 4.5,
      },
    },
  ],
  execute: executeSalaryTax,
  Component: SalaryTaxUI,
};
