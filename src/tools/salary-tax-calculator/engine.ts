import type { RegionCode } from '../../core/locale';

export type IndiaTaxRegime = 'new' | 'old';
export type UsFilingStatus = 'single' | 'married';

export interface SalaryTaxInput {
  region: RegionCode;
  annualGrossSalary: number;
  // India specific
  indiaRegime?: IndiaTaxRegime;
  indiaDeductions80C?: number; // Old regime: max 1.5L
  indiaDeductions80D?: number; // Old regime: health insurance
  indiaHraDeduction?: number;  // Old regime: rent exemption
  includeEpf?: boolean;        // Employee PF deduction
  // US specific
  usFilingStatus?: UsFilingStatus;
  usStateTaxRate?: number;     // e.g. 4.5% average or 0% for TX/FL
  usPreTaxDeductions?: number; // 401(k) / HSA / FSA
}

export interface TaxBracketBreakdown {
  label: string;
  rate: number;
  taxableAmount: number;
  taxOwed: number;
}

export interface SalaryTaxOutput {
  annualGross: number;
  monthlyGross: number;
  biweeklyGross: number;

  totalTaxAnnual: number;
  totalDeductionsAnnual: number; // EPF or 401k
  annualTakeHome: number;
  monthlyTakeHome: number;
  biweeklyTakeHome: number;

  effectiveTaxRatePercent: number;
  marginalTaxRatePercent: number;

  breakdown: {
    incomeTax: number;
    additionalTaxOrCess: number; // India: 4% cess; US: FICA (SS + Medicare) + State
    retirementOrPf: number;      // EPF or 401k
    standardDeduction: number;
    taxableIncome: number;
  };

  brackets: TaxBracketBreakdown[];
}

// ---------------- INDIA TAX CALCULATION ----------------
function calculateIndiaTax(input: SalaryTaxInput): SalaryTaxOutput {
  const gross = Math.max(0, input.annualGrossSalary || 0);
  const regime = input.indiaRegime || 'new';

  let standardDeduction = regime === 'new' ? 75000 : 50000;
  let otherDeductions = 0;

  if (regime === 'old') {
    const d80c = Math.min(150000, Math.max(0, input.indiaDeductions80C || 0));
    const d80d = Math.min(50000, Math.max(0, input.indiaDeductions80D || 0));
    const hra = Math.max(0, input.indiaHraDeduction || 0);
    otherDeductions = d80c + d80d + hra;
  }

  const taxableIncome = Math.max(0, gross - standardDeduction - otherDeductions);
  const brackets: TaxBracketBreakdown[] = [];
  let baseTax = 0;
  let marginalRate = 0;

  if (regime === 'new') {
    // New Slabs FY 2024-25 / 2025-26
    const slabs = [
      { max: 300000, rate: 0.00, label: '₹0 - ₹3L (0%)' },
      { max: 700000, rate: 0.05, label: '₹3L - ₹7L (5%)' },
      { max: 1000000, rate: 0.10, label: '₹7L - ₹10L (10%)' },
      { max: 1200000, rate: 0.15, label: '₹10L - ₹12L (15%)' },
      { max: 1500000, rate: 0.20, label: '₹12L - ₹15L (20%)' },
      { max: Infinity, rate: 0.30, label: 'Above ₹15L (30%)' },
    ];

    let prevLimit = 0;
    for (const slab of slabs) {
      if (taxableIncome > prevLimit) {
        const taxableChunk = Math.min(taxableIncome, slab.max) - prevLimit;
        const taxChunk = taxableChunk * slab.rate;
        baseTax += taxChunk;
        brackets.push({
          label: slab.label,
          rate: slab.rate * 100,
          taxableAmount: Math.round(taxableChunk),
          taxOwed: Math.round(taxChunk),
        });
        if (slab.rate > 0) marginalRate = slab.rate * 100;
        prevLimit = slab.max;
      }
    }

    // Rebate u/s 87A: If taxable income <= 7,00,000, tax is zero
    if (taxableIncome <= 700000) {
      baseTax = 0;
    }
  } else {
    // Old Slabs
    const slabs = [
      { max: 250000, rate: 0.00, label: '₹0 - ₹2.5L (0%)' },
      { max: 500000, rate: 0.05, label: '₹2.5L - ₹5L (5%)' },
      { max: 1000000, rate: 0.20, label: '₹5L - ₹10L (20%)' },
      { max: Infinity, rate: 0.30, label: 'Above ₹10L (30%)' },
    ];

    let prevLimit = 0;
    for (const slab of slabs) {
      if (taxableIncome > prevLimit) {
        const taxableChunk = Math.min(taxableIncome, slab.max) - prevLimit;
        const taxChunk = taxableChunk * slab.rate;
        baseTax += taxChunk;
        brackets.push({
          label: slab.label,
          rate: slab.rate * 100,
          taxableAmount: Math.round(taxableChunk),
          taxOwed: Math.round(taxChunk),
        });
        if (slab.rate > 0) marginalRate = slab.rate * 100;
        prevLimit = slab.max;
      }
    }

    // Rebate u/s 87A for Old Regime: if taxable income <= 5,00,000, tax is zero
    if (taxableIncome <= 500000) {
      baseTax = 0;
    }
  }

  // 4% Health & Education Cess
  const cess = baseTax > 0 ? baseTax * 0.04 : 0;
  const totalTax = baseTax + cess;

  // EPF: Employee contribution ~ 12% of basic (assuming basic is ~40-50% of CTC, capped or 1800/mo min)
  const monthlyEpf = input.includeEpf !== false ? Math.min(gross * 0.05, 21600) : 0;
  const annualEpf = monthlyEpf;
  const professionalTax = 2400; // Standard ₹200/mo

  const totalDeductionsAnnual = Math.round(totalTax + annualEpf + professionalTax);
  const annualTakeHome = Math.max(0, Math.round(gross - totalDeductionsAnnual));
  const monthlyTakeHome = Math.round(annualTakeHome / 12);
  const biweeklyTakeHome = Math.round(annualTakeHome / 26);

  const effectiveTaxRate = gross > 0 ? (totalTax / gross) * 100 : 0;

  return {
    annualGross: Math.round(gross),
    monthlyGross: Math.round(gross / 12),
    biweeklyGross: Math.round(gross / 26),
    totalTaxAnnual: Math.round(totalTax),
    totalDeductionsAnnual,
    annualTakeHome,
    monthlyTakeHome,
    biweeklyTakeHome,
    effectiveTaxRatePercent: Number(effectiveTaxRate.toFixed(1)),
    marginalTaxRatePercent: marginalRate,
    breakdown: {
      incomeTax: Math.round(baseTax),
      additionalTaxOrCess: Math.round(cess),
      retirementOrPf: Math.round(annualEpf + professionalTax),
      standardDeduction: Math.round(standardDeduction + otherDeductions),
      taxableIncome: Math.round(taxableIncome),
    },
    brackets,
  };
}

// ---------------- US TAX CALCULATION ----------------
function calculateUsTax(input: SalaryTaxInput): SalaryTaxOutput {
  const gross = Math.max(0, input.annualGrossSalary || 0);
  const status = input.usFilingStatus || 'single';
  const preTaxDeductions = Math.max(0, input.usPreTaxDeductions || 0); // 401(k)
  const stateRate = Math.max(0, input.usStateTaxRate ?? 4.5) / 100;

  // Standard deduction 2024
  const standardDeduction = status === 'married' ? 29200 : 14600;
  const taxableIncome = Math.max(0, gross - preTaxDeductions - standardDeduction);

  // Federal Brackets 2024
  const singleSlabs = [
    { max: 11600, rate: 0.10, label: 'Up to $11,600 (10%)' },
    { max: 47150, rate: 0.12, label: '$11,600 - $47,150 (12%)' },
    { max: 100525, rate: 0.22, label: '$47,150 - $100,525 (22%)' },
    { max: 191950, rate: 0.24, label: '$100,525 - $191,950 (24%)' },
    { max: 243725, rate: 0.32, label: '$191,950 - $243,725 (32%)' },
    { max: 609350, rate: 0.35, label: '$243,725 - $609,350 (35%)' },
    { max: Infinity, rate: 0.37, label: 'Over $609,350 (37%)' },
  ];

  const marriedSlabs = [
    { max: 23200, rate: 0.10, label: 'Up to $23,200 (10%)' },
    { max: 94300, rate: 0.12, label: '$23,200 - $94,300 (12%)' },
    { max: 201050, rate: 0.22, label: '$94,300 - $201,050 (22%)' },
    { max: 383900, rate: 0.24, label: '$201,050 - $383,900 (24%)' },
    { max: 487450, rate: 0.32, label: '$383,900 - $487,450 (32%)' },
    { max: 731200, rate: 0.35, label: '$487,450 - $731,200 (35%)' },
    { max: Infinity, rate: 0.37, label: 'Over $731,200 (37%)' },
  ];

  const slabs = status === 'married' ? marriedSlabs : singleSlabs;
  const brackets: TaxBracketBreakdown[] = [];
  let federalTax = 0;
  let marginalRate = 0;

  let prevLimit = 0;
  for (const slab of slabs) {
    if (taxableIncome > prevLimit) {
      const taxableChunk = Math.min(taxableIncome, slab.max) - prevLimit;
      const taxChunk = taxableChunk * slab.rate;
      federalTax += taxChunk;
      brackets.push({
        label: slab.label,
        rate: slab.rate * 100,
        taxableAmount: Math.round(taxableChunk),
        taxOwed: Math.round(taxChunk),
      });
      marginalRate = slab.rate * 100;
      prevLimit = slab.max;
    }
  }

  // FICA:
  // Social Security: 6.2% up to $168,600 wage limit
  const ssWageBase = Math.min(gross, 168600);
  const socialSecurityTax = ssWageBase * 0.062;

  // Medicare: 1.45% all wages + 0.9% on wages over 200k (single) / 250k (married)
  const medicareThreshold = status === 'married' ? 250000 : 200000;
  const standardMedicare = gross * 0.0145;
  const additionalMedicare = gross > medicareThreshold ? (gross - medicareThreshold) * 0.009 : 0;
  const totalMedicare = standardMedicare + additionalMedicare;

  const totalFica = socialSecurityTax + totalMedicare;

  // State Tax
  const stateTax = taxableIncome * stateRate;

  const totalTaxes = federalTax + totalFica + stateTax;
  const totalDeductionsAnnual = Math.round(totalTaxes + preTaxDeductions);
  const annualTakeHome = Math.max(0, Math.round(gross - totalDeductionsAnnual));
  const monthlyTakeHome = Math.round(annualTakeHome / 12);
  const biweeklyTakeHome = Math.round(annualTakeHome / 26);

  const effectiveTaxRate = gross > 0 ? (totalTaxes / gross) * 100 : 0;

  return {
    annualGross: Math.round(gross),
    monthlyGross: Math.round(gross / 12),
    biweeklyGross: Math.round(gross / 26),
    totalTaxAnnual: Math.round(totalTaxes),
    totalDeductionsAnnual,
    annualTakeHome,
    monthlyTakeHome,
    biweeklyTakeHome,
    effectiveTaxRatePercent: Number(effectiveTaxRate.toFixed(1)),
    marginalTaxRatePercent: marginalRate,
    breakdown: {
      incomeTax: Math.round(federalTax),
      additionalTaxOrCess: Math.round(totalFica + stateTax),
      retirementOrPf: Math.round(preTaxDeductions),
      standardDeduction: Math.round(standardDeduction),
      taxableIncome: Math.round(taxableIncome),
    },
    brackets,
  };
}

export function executeSalaryTax(input: SalaryTaxInput): SalaryTaxOutput {
  if (input.region === 'IN') {
    return calculateIndiaTax(input);
  }
  return calculateUsTax(input);
}
