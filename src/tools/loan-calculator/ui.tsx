import React, { useState, useEffect, useTransition } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { FinancialDisclaimer } from '../../design-system/financial-disclaimer';
import { Button } from '../../design-system/button';
import { useRegion } from '../../core/locale-context';
import { executeLoanCalculator } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { LoanCalculatorInput, LoanCalculatorOutput } from './definition';

export const LoanCalculatorUI: React.FC<ToolComponentProps<LoanCalculatorInput, LoanCalculatorOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, formatCurrency, formatCompact } = useRegion();

  // Region-specific smart defaults
  const defaultPrincipal = region === 'IN' ? 5000000 : 400000;
  const defaultRate = region === 'IN' ? 8.75 : 6.85;
  const defaultTenure = region === 'IN' ? 20 : 30;

  const [principal, setPrincipal] = useState<number>(initialInput?.principal ?? defaultPrincipal);
  const [rate, setRate] = useState<number>(initialInput?.annualInterestRate ?? defaultRate);
  const [tenureYears, setTenureYears] = useState<number>(initialInput?.tenureYears ?? defaultTenure);
  const [extraMonthly, setExtraMonthly] = useState<number>(initialInput?.extraMonthlyPayment ?? 0);
  const [propertyTax, setPropertyTax] = useState<number>(initialInput?.propertyTaxAnnual ?? 0);
  const [insurance, setInsurance] = useState<number>(initialInput?.insuranceAnnual ?? 0);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const [output, setOutput] = useState<LoanCalculatorOutput>({
    monthlyEmi: 0,
    totalMonthlyPayment: 0,
    totalInterest: 0,
    totalPayment: 0,
    principalPercentage: 50,
    interestPercentage: 50,
    payoffMonths: 0,
    interestSavedWithPrepayment: 0,
    monthsSavedWithPrepayment: 0,
    yearlySchedule: [],
  });

  const [executionTime, setExecutionTime] = useState<number>(0);
  const [, startTransition] = useTransition();

  // Re-run calculator when inputs change
  useEffect(() => {
    startTransition(() => {
      const start = performance.now();
      const res = executeLoanCalculator({
        principal,
        annualInterestRate: rate,
        tenureYears,
        extraMonthlyPayment: extraMonthly,
        propertyTaxAnnual: propertyTax,
        insuranceAnnual: insurance,
      });
      const end = performance.now();
      setExecutionTime(end - start);
      setOutput(res);
    });
  }, [principal, rate, tenureYears, extraMonthly, propertyTax, insurance]);

  // Adjust defaults if region changes and user hasn't heavily customized
  useEffect(() => {
    if (!initialInput) {
      setPrincipal(region === 'IN' ? 5000000 : 400000);
      setRate(region === 'IN' ? 8.75 : 6.85);
      setTenureYears(region === 'IN' ? 20 : 30);
      setPropertyTax(region === 'US' ? 4500 : 0);
      setInsurance(region === 'US' ? 1200 : 0);
    }
  }, [region, initialInput]);

  const maxPrincipal = region === 'IN' ? 20000000 : 1500000;
  const principalStep = region === 'IN' ? 50000 : 5000;

  const documentationNode = (
    <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Loan & Mortgage EMI Complete Guide ({region === 'IN' ? 'India' : 'US'})
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">1. How EMI is Calculated</h4>
        <p className="text-xs text-slate-600">
          Equated Monthly Installment (EMI) is computed using the reducing balance method:
          <code className="p-1 rounded bg-slate-100 font-mono text-slate-900 font-bold block my-1">
            EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
          </code>
          where <strong>P</strong> is Loan Principal, <strong>r</strong> is Monthly Interest Rate (Annual Rate / 12 / 100), and <strong>n</strong> is Total Number of Months.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2">
        <h4 className="font-bold text-indigo-950">2. The Prepayment Advantage</h4>
        <p className="text-xs text-indigo-900">
          In early loan years, up to 70-80% of your EMI goes toward paying interest, not the principal. Making even a small extra monthly payment (e.g. ₹5,000 or $100/mo) reduces the principal balance directly, creating exponential interest savings and shortening your tenure by multiple years.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">3. Tax Deductions on Home Loans</h4>
        <p className="text-xs text-slate-600">
          {region === 'IN'
            ? 'In India (Old Tax Regime), Section 24(b) allows up to ₹2,00,000 deduction on home loan interest for self-occupied properties, and Section 80C allows up to ₹1,50,000 deduction on principal repayment.'
            : 'In the US, homeowners who itemize deductions can deduct mortgage interest on the first $750,000 of indebtedness under the Tax Cuts and Jobs Act.'}
        </p>
      </div>
      <FinancialDisclaimer />
    </div>
  );

  return (
    <ToolShell
      tool={tool}
      onReset={() => {
        setPrincipal(defaultPrincipal);
        setRate(defaultRate);
        setTenureYears(defaultTenure);
        setExtraMonthly(0);
        setPropertyTax(0);
        setInsurance(0);
      }}
      executionTimeMs={executionTime}
      inputData={{ principal, annualInterestRate: rate, tenureYears, extraMonthlyPayment: extraMonthly }}
      documentation={documentationNode}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Inputs & Sliders (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-semibold text-sm sm:text-base text-slate-900">
              Loan Details ({region === 'IN' ? 'India' : 'United States'})
            </h2>
            {/* Quick Loan Type Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {region === 'IN' ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRate(8.75);
                      setTenureYears(20);
                    }}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Home (8.75%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRate(9.2);
                      setTenureYears(7);
                    }}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Car (9.2%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRate(11.5);
                      setTenureYears(5);
                    }}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Personal (11.5%)
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRate(6.85);
                      setTenureYears(30);
                    }}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    30-Yr Fixed (6.85%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRate(6.1);
                      setTenureYears(15);
                    }}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    15-Yr Fixed (6.10%)
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Input 1: Loan Amount */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Loan Amount</label>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold">{region === 'IN' ? '₹' : '$'}</span>
                <input
                  type="number"
                  min="1000"
                  max={maxPrincipal * 2}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-28 sm:w-36 text-right focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min="50000"
              max={maxPrincipal}
              step={principalStep}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatCompact(50000)}</span>
              <span>{formatCompact(maxPrincipal)}</span>
            </div>
          </div>

          {/* Input 2: Interest Rate */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Annual Interest Rate (%)</label>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="30"
                  value={rate}
                  onChange={(e) => setRate(Math.max(0.1, Number(e.target.value)))}
                  className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-16 text-right focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>3.0%</span>
              <span>10.0%</span>
              <span>20.0%</span>
            </div>
          </div>

          {/* Input 3: Tenure in Years */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Loan Term (Tenure)</label>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                  className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-14 text-right focus:outline-none"
                />
                <span className="text-xs text-slate-400">Years</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Optional Prepayment & Country Specific Add-ons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-700">Extra Prepayment per Month</span>
                <span className="text-[11px] text-slate-500">Pay down principal faster & save thousands in interest</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold">{region === 'IN' ? '₹' : '$'}</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={extraMonthly}
                  onChange={(e) => setExtraMonthly(Math.max(0, Number(e.target.value)))}
                  className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-24 text-right focus:outline-none"
                />
              </div>
            </div>

            {region === 'US' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600">Annual Property Tax</span>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value))}
                      className="font-mono text-xs text-slate-800 bg-transparent w-full text-right focus:outline-none"
                      placeholder="e.g. 4500"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-slate-600">Annual Home Insurance</span>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={insurance}
                      onChange={(e) => setInsurance(Number(e.target.value))}
                      className="font-mono text-xs text-slate-800 bg-transparent w-full text-right focus:outline-none"
                      placeholder="e.g. 1200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Metrics & Visuals (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Hero Output Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-md flex flex-col gap-3">
            <span className="text-xs font-medium text-indigo-200 uppercase tracking-wider">
              {extraMonthly > 0 || propertyTax > 0 ? 'Total Monthly Payment' : 'Monthly EMI'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(output.totalMonthlyPayment)}
              </span>
              <span className="text-xs text-indigo-200">/ month</span>
            </div>

            <div className="pt-3 border-t border-indigo-700/60 flex items-center justify-between text-xs text-indigo-200">
              <span>Payoff Time:</span>
              <span className="font-semibold text-white">
                {Math.floor(output.payoffMonths / 12)} yrs {output.payoffMonths % 12} mos
              </span>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Principal Loan</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(principal)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{output.principalPercentage}% of total</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Total Interest</span>
              <span className="text-lg sm:text-xl font-bold text-amber-600 mt-1">
                {formatCurrency(output.totalInterest)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{output.interestPercentage}% of total</span>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-indigo-600">Principal ({output.principalPercentage}%)</span>
              <span className="text-amber-600">Interest ({output.interestPercentage}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${output.principalPercentage}%` }}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${output.interestPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>Total Payment:</span>
              <span className="text-slate-900 font-semibold">{formatCurrency(output.totalPayment)}</span>
            </div>
          </div>

          {/* Prepayment Impact Banner */}
          {output.interestSavedWithPrepayment > 0 && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex flex-col text-xs leading-relaxed">
                <span className="font-bold text-emerald-950">Prepayment Power!</span>
                <p>
                  You will save <strong>{formatCurrency(output.interestSavedWithPrepayment)}</strong> in interest and be debt-free <strong>{Math.floor(output.monthsSavedWithPrepayment / 12)} years and {output.monthsSavedWithPrepayment % 12} months earlier</strong>!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Yearly Amortization Schedule Drawer */}
      <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-sm text-slate-900">
              Year-by-Year Amortization Schedule ({output.yearlySchedule.length} Years)
            </span>
          </div>
          {showSchedule ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showSchedule && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Year</th>
                  <th className="py-2.5 px-4">Principal Paid</th>
                  <th className="py-2.5 px-4">Interest Paid</th>
                  <th className="py-2.5 px-4 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {output.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-4 font-sans font-medium text-slate-900">Year {row.year}</td>
                    <td className="py-2 px-4 text-indigo-600">{formatCurrency(row.principalPaid)}</td>
                    <td className="py-2 px-4 text-amber-600">{formatCurrency(row.interestPaid)}</td>
                    <td className="py-2 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(row.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolShell>
  );
};
