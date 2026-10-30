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
  });
});
