import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeSalaryTax,
  type SalaryTaxInput,
  type SalaryTaxOutput,
  type IndiaTaxRegime,
  type UsFilingStatus,
} from './engine';
import {
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Table as TableIcon,
  Percent,
} from 'lucide-react';

export const SalaryTaxUI: React.FC<ToolComponentProps<SalaryTaxInput, SalaryTaxOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency } = useRegion();

  const defaultSalary = region === 'IN' ? 1200000 : 85000;

  const [grossSalary, setGrossSalary] = useState<number>(initialInput?.annualGrossSalary ?? defaultSalary);
  // India fields
  const [indiaRegime, setIndiaRegime] = useState<IndiaTaxRegime>(initialInput?.indiaRegime ?? 'new');
  const [ded80c, setDed80c] = useState<number>(initialInput?.indiaDeductions80C ?? 150000);
  const [ded80d, setDed80d] = useState<number>(initialInput?.indiaDeductions80D ?? 25000);
  const [hra, setHra] = useState<number>(initialInput?.indiaHraDeduction ?? 100000);
  const [includeEpf, setIncludeEpf] = useState<boolean>(initialInput?.includeEpf ?? true);

  // US fields
  const [filingStatus, setFilingStatus] = useState<UsFilingStatus>(initialInput?.usFilingStatus ?? 'single');
  const [stateTaxRate, setStateTaxRate] = useState<number>(initialInput?.usStateTaxRate ?? 4.5);
  const [preTaxDeduction, setPreTaxDeduction] = useState<number>(initialInput?.usPreTaxDeductions ?? 6000);

  const [showBrackets, setShowBrackets] = useState<boolean>(false);

  const input: SalaryTaxInput = useMemo(
    () => ({
      region,
      annualGrossSalary: grossSalary,
      indiaRegime,
      indiaDeductions80C: ded80c,
      indiaDeductions80D: ded80d,
      indiaHraDeduction: hra,
      includeEpf,
      usFilingStatus: filingStatus,
      usStateTaxRate: stateTaxRate,
      usPreTaxDeductions: preTaxDeduction,
    }),
    [
      region,
      grossSalary,
      indiaRegime,
      ded80c,
      ded80d,
      hra,
      includeEpf,
      filingStatus,
      stateTaxRate,
      preTaxDeduction,
    ]
  );

  const result = useMemo(() => executeSalaryTax(input), [input]);

  const handleReset = () => {
    setGrossSalary(defaultSalary);
    setIndiaRegime('new');
    setDed80c(150000);
    setDed80d(25000);
    setHra(100000);
    setIncludeEpf(true);
    setFilingStatus('single');
    setStateTaxRate(4.5);
    setPreTaxDeduction(6000);
    setShowBrackets(false);
  };

  const takeHomePercent = result.annualGross > 0
    ? Math.round((result.annualTakeHome / result.annualGross) * 100)
    : 100;

  return (
    <ToolShell tool={tool} onReset={handleReset}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Annual Gross Salary */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                {region === 'IN' ? 'Annual CTC / Gross Salary' : 'Annual Gross Pay'}
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step={region === 'IN' ? '50000' : '2000'}
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max={region === 'IN' ? 10000000 : 350000}
              step={region === 'IN' ? 50000 : 2500}
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <span className="text-[11px] text-slate-500 font-mono">
              Equivalent to {formatCurrency(Math.round(grossSalary / 12))}/month gross
            </span>
          </div>

          {/* Region Specific Controls */}
          {region === 'IN' ? (
            <div className="flex flex-col gap-4">
              {/* Regime Selector */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <label className="text-xs font-semibold text-slate-700">Income Tax Regime</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIndiaRegime('new')}
                    className={`text-xs p-3 rounded-xl border flex flex-col gap-1 text-left transition cursor-pointer ${
                      indiaRegime === 'new'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>New Tax Regime</span>
                      {indiaRegime === 'new' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Default. Standard deduction ₹75k + zero tax up to ₹7.75L
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndiaRegime('old')}
                    className={`text-xs p-3 rounded-xl border flex flex-col gap-1 text-left transition cursor-pointer ${
                      indiaRegime === 'old'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>Old Tax Regime</span>
                      {indiaRegime === 'old' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Allows 80C, 80D, and HRA rent deductions
                    </span>
                  </button>
                </div>
              </div>

              {/* Old Regime Exemptions if active */}
              {indiaRegime === 'old' && (
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-800">
                    Old Regime Deductions & Exemptions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-600">Section 80C (Max 1.5L)</label>
                      <input
                        type="number"
                        value={ded80c}
                        onChange={(e) => setDed80c(Number(e.target.value))}
                        className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-600">Section 80D (Health)</label>
                      <input
                        type="number"
                        value={ded80d}
                        onChange={(e) => setDed80d(Number(e.target.value))}
                        className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-600">HRA Exemption</label>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value))}
                        className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EPF checkbox */}
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeEpf}
                  onChange={(e) => setIncludeEpf(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Include Employee Provident Fund (EPF) deduction</span>
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Filing Status */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <label className="text-xs font-semibold text-slate-700">Tax Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['single', 'married'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilingStatus(status)}
                      className={`text-xs py-2.5 px-3 rounded-xl border font-medium capitalize transition cursor-pointer ${
                        filingStatus === status
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'married' ? 'Married (Filing Jointly)' : 'Single'}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Tax Rate & 401(k) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-indigo-600" />
                      State Tax Rate
                    </label>
                    <span className="text-sm font-bold text-slate-900">{stateTaxRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="13"
                    step="0.5"
                    value={stateTaxRate}
                    onChange={(e) => setStateTaxRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setStateTaxRate(0)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      0% (TX/FL/WA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStateTaxRate(4.5)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      4.5% (Avg)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                    Pre-Tax 401(k) / HSA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30000"
                    step="500"
                    value={preTaxDeduction}
                    onChange={(e) => setPreTaxDeduction(Number(e.target.value))}
                    className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500">2024 max 401(k): $23,000</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Take Home Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Estimated Net In-Hand Salary
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {takeHomePercent}% Take-Home
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {formatCurrency(result.monthlyTakeHome)}
                </span>
                <span className="text-sm font-medium text-indigo-200">/ month</span>
              </div>
              <span className="text-xs text-indigo-300 font-mono">
                {formatCurrency(result.annualTakeHome)} per year • {formatCurrency(result.biweeklyTakeHome)} bi-weekly
              </span>
            </div>

            {/* Tax Rate Summary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Effective Tax Rate</span>
                <span className="text-base font-bold text-white">
                  {result.effectiveTaxRatePercent}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Total Taxes & Deductions</span>
                <span className="text-base font-bold text-rose-300">
                  -{formatCurrency(result.totalDeductionsAnnual)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Annual Deductions Breakdown
            </span>
            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Standard Deduction</span>
                <span className="font-mono text-emerald-600 font-medium">
                  +{formatCurrency(result.breakdown.standardDeduction)} (tax-free)
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Income / Federal Tax</span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatCurrency(result.breakdown.incomeTax)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">
                  {region === 'IN' ? 'Health & Education Cess (4%)' : 'FICA (SS + Medicare) & State Tax'}
                </span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatCurrency(result.breakdown.additionalTaxOrCess)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">
                  {region === 'IN' ? 'EPF & Professional Tax' : '401(k) / Pre-Tax Retirement'}
                </span>
                <span className="font-mono text-indigo-600 font-medium">
                  {formatCurrency(result.breakdown.retirementOrPf)}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Slabs / Brackets Accordion */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowBrackets(!showBrackets)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                {showBrackets ? 'Hide' : 'Inspect'} Tax Bracket Breakdown
              </span>
              <span className="text-slate-400 font-mono">{showBrackets ? '▲' : '▼'}</span>
            </button>

            {showBrackets && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Bracket / Slab</th>
                      <th className="py-2.5 px-3">Taxable Chunk</th>
                      <th className="py-2.5 px-3 text-right">Tax Owed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.brackets.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{b.label}</td>
                        <td className="py-2 px-3 text-slate-600">{formatCurrency(b.taxableAmount)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-900">{formatCurrency(b.taxOwed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
