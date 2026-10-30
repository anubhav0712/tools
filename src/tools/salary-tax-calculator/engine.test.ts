import { describe, it, expect } from 'vitest';
import { executeSalaryTax } from './engine';

describe('Salary & Take-Home Tax Calculator Engine', () => {
  describe('India New Tax Regime', () => {
    it('applies 87A rebate for income up to ₹7.75 Lakhs (effective zero tax)', () => {
      // CTC ₹7,50,000 - 75,000 std deduction = 6,75,000 taxable <= 7L => 0 base tax
      const res = executeSalaryTax({
        region: 'IN',
        annualGrossSalary: 750000,
        indiaRegime: 'new',
        includeEpf: false,
      });

      expect(res.breakdown.incomeTax).toBe(0);
      expect(res.totalTaxAnnual).toBe(0);
      expect(res.annualTakeHome).toBe(750000 - 2400); // minus ₹2,400 prof tax

      // Verify brackets reflect the Section 87A rebate so slab sum matches net income tax
      const rebateBracket = res.brackets.find((b) => b.label.includes('87A'));
      expect(rebateBracket).toBeDefined();
      const sumOfBrackets = res.brackets.reduce((sum, b) => sum + b.taxOwed, 0);
      expect(sumOfBrackets).toBe(0);
    });

    it('calculates tax accurately for ₹15 Lakhs under New Regime', () => {
      // Gross 15L - 75k std deduction = 14.25L taxable
      // Slabs:
      // 0-3L: 0
      // 3-7L: 4L * 5% = 20k
      // 7-10L: 3L * 10% = 30k
      // 10-12L: 2L * 15% = 30k
      // 12-14.25L: 2.25L * 20% = 45k
      // Base Tax = 20k + 30k + 30k + 45k = 125,000
      // Cess 4% = 5,000
      // Total Tax = 130,000
      const res = executeSalaryTax({
        region: 'IN',
        annualGrossSalary: 1500000,
        indiaRegime: 'new',
        includeEpf: false,
      });

      expect(res.breakdown.incomeTax).toBe(125000);
      expect(res.breakdown.additionalTaxOrCess).toBe(5000);
      expect(res.totalTaxAnnual).toBe(130000);
    });

    it('respects advanced overrides like custom standard deduction and cess rate', () => {
      const res = executeSalaryTax({
        region: 'IN',
        annualGrossSalary: 1500000,
        indiaRegime: 'new',
        customStandardDeduction: 100000, // Custom 1L standard deduction
        customCessRatePercent: 0,        // 0% cess
        includeEpf: false,
      });

      // 15L - 1L = 14L taxable.
      // Slabs: 0-3L 0, 3-7L 20k, 7-10L 30k, 10-12L 30k, 12-14L 40k = 120,000 base tax
      expect(res.breakdown.incomeTax).toBe(120000);
      expect(res.breakdown.additionalTaxOrCess).toBe(0);
      expect(res.totalTaxAnnual).toBe(120000);
    });

    it('applies Section 87A Marginal Relief when income marginally exceeds ₹7.75 Lakhs', () => {
      // Gross 7,85,000 - 75,000 std deduction = 7,10,000 taxable.
      // Excess income over ₹7,00,000 is ₹10,000.
      // Normal slab tax would be: 3-7L (20k) + 10k * 10% (1k) = 21,000.
      // With Marginal Relief, tax cannot exceed excess income (₹10,000)!
      const res = executeSalaryTax({
        region: 'IN',
        annualGrossSalary: 785000,
        indiaRegime: 'new',
        includeEpf: false,
      });

      expect(res.breakdown.incomeTax).toBe(10000); // capped at excess income!
      expect(res.marginalReliefBenefit).toBe(11000); // saved ₹11,000
    });
  });

  describe('US Federal & FICA Tax', () => {
    it('computes take-home salary with standard deduction and FICA for $100k Single', () => {
      const res = executeSalaryTax({
        region: 'US',
        annualGrossSalary: 100000,
        usFilingStatus: 'single',
        usStateTaxRate: 0, // no state tax test
        usPreTaxDeductions: 0,
      });

      // Taxable = 100,000 - 14,600 = 85,400
      // 10% on 11,600 = 1,160
      // 12% on (47,150 - 11,600 = 35,550) = 4,266
      // 22% on (85,400 - 47,150 = 38,250) = 8,415
      // Federal = 1,160 + 4,266 + 8,415 = 13,841
      // FICA: SS = 6,200, Medicare = 1,450 => 7,650
      expect(res.breakdown.incomeTax).toBe(13841);
      expect(res.annualGross).toBe(100000);
      expect(res.monthlyGross).toBe(8333);
      expect(res.annualTakeHome).toBe(100000 - (13841 + 7650));
      expect(res.effectiveTaxRatePercent).toBeGreaterThan(20);
    });

    it('applies Head of Household standard deduction and brackets correctly', () => {
      const res = executeSalaryTax({
        region: 'US',
        annualGrossSalary: 85000,
        usFilingStatus: 'head_of_household',
        usStateTaxRate: 0,
        usPreTaxDeductions: 0,
      });

      // Standard deduction for Head of Household is $21,900
      expect(res.breakdown.standardDeduction).toBe(21900);
      expect(res.breakdown.taxableIncome).toBe(85000 - 21900);
    });
  });
});
