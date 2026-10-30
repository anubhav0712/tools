import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeAutoLoan,
  type AutoLoanInput,
  type AutoLoanOutput,
} from './engine';
import {
  Car,
  Percent,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const AutoLoanUI: React.FC<ToolComponentProps<AutoLoanInput, AutoLoanOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency } = useRegion();

  const defaultPrice = region === 'IN' ? 1200000 : 34000;
  const defaultDown = region === 'IN' ? 240000 : 5000;
  const defaultTrade = 0;
  const defaultTaxRate = region === 'IN' ? 10 : 6.5;
  const defaultRate = region === 'IN' ? 9.0 : 6.5;

  const [price, setPrice] = useState<number>(initialInput?.vehiclePrice ?? defaultPrice);
  const [down, setDown] = useState<number>(initialInput?.downPayment ?? defaultDown);
  const [trade, setTrade] = useState<number>(initialInput?.tradeInValue ?? defaultTrade);
  const [taxRate, setTaxRate] = useState<number>(initialInput?.salesTaxRatePercent ?? defaultTaxRate);
  const [rollTax, setRollTax] = useState<boolean>(initialInput?.includeTaxInLoan ?? true);
  const [term, setTerm] = useState<number>(initialInput?.loanTermMonths ?? 60);
  const [rate, setRate] = useState<number>(initialInput?.annualInterestRate ?? defaultRate);

  const input: AutoLoanInput = useMemo(
    () => ({
      vehiclePrice: price,
      downPayment: down,
      tradeInValue: trade,
      salesTaxRatePercent: taxRate,
      includeTaxInLoan: rollTax,
      loanTermMonths: term,
      annualInterestRate: rate,
    }),
    [price, down, trade, taxRate, rollTax, term, rate]
  );

  const result = useMemo(() => executeAutoLoan(input), [input]);

  const handleReset = () => {
    setPrice(defaultPrice);
    setDown(defaultDown);
    setTrade(0);
    setTaxRate(defaultTaxRate);
    setRollTax(true);
    setTerm(60);
    setRate(defaultRate);
  };

  return (
    <ToolShell tool={tool} onReset={handleReset}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Vehicle Price */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-indigo-600" />
                Vehicle Purchase Price (MSRP / Sticker)
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step={region === 'IN' ? '25000' : '1000'}
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="2000"
              max={region === 'IN' ? 5000000 : 120000}
              step={region === 'IN' ? 25000 : 1000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Down Payment & Trade-In */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Down Payment</label>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span>{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={down}
                    onChange={(e) => setDown(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-right bg-transparent focus:outline-none font-mono"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={price}
                step={region === 'IN' ? '10000' : '500'}
                value={down}
                onChange={(e) => setDown(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Trade-In Value</label>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span>{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={trade}
                    onChange={(e) => setTrade(Math.max(0, Number(e.target.value)))}
                    className="w-20 text-right bg-transparent focus:outline-none font-mono"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max={price}
                step={region === 'IN' ? '10000' : '500'}
                value={trade}
                onChange={(e) => setTrade(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>
          </div>

          {/* Loan Term Selection */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Loan Term
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[36, 48, 60, 72, 84].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTerm(m)}
                  className={`text-xs py-2 rounded-xl font-medium transition cursor-pointer text-center ${
                    term === m
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {m} mo ({m / 12}y)
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate & Sales Tax */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-600" />
                  Interest Rate (APR)
                </label>
                <span className="text-sm font-bold text-slate-900">{rate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  {region === 'IN' ? 'RTO / Road Tax' : 'Sales Tax Rate'}
                </label>
                <span className="text-sm font-bold text-slate-900">{taxRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>
          </div>

          {/* Roll Tax into Loan Checkbox */}
          <label className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 cursor-pointer text-xs text-slate-700 shadow-2xs">
            <input
              type="checkbox"
              checked={rollTax}
              onChange={(e) => setRollTax(e.target.checked)}
              className="rounded accent-indigo-600"
            />
            <span>Finance sales tax / registration into the monthly loan (no extra cash upfront)</span>
          </label>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Estimated Monthly Car Payment
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {term} months
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.monthlyPayment)}
              </span>
              <span className="text-xs text-indigo-200">
                / month for {term / 12} years
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Loan Amount Financed</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(result.loanAmountFinanced)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Total Interest Cost</span>
                <span className="text-base font-bold text-rose-300">
                  +{formatCurrency(result.totalInterestPaid)}
                </span>
              </div>
            </div>
          </div>

          {/* Upfront Cash & Taxes Breakdown */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              True Cost of Ownership Breakdown
            </span>
            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Upfront Cash Needed</span>
                <span className="font-mono text-slate-900 font-bold">
                  {formatCurrency(result.upfrontCashNeeded)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Sales Tax / RTO Fees ({taxRate}%)</span>
                <span className="font-mono text-slate-700 font-medium">
                  {formatCurrency(result.salesTaxAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Total Loan Payments ({term} mos)</span>
                <span className="font-mono text-slate-700 font-medium">
                  {formatCurrency(result.totalLoanPayment)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5 bg-slate-50/80 px-2 rounded-xl mt-1">
                <span className="font-semibold text-slate-900">True Total Cost (Vehicle + Tax + Interest)</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  {formatCurrency(result.trueTotalCostOfOwnership)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
