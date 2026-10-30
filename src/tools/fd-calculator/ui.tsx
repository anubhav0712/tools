import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeFd,
  type FdInput,
  type FdOutput,
  type FdCompoundingFrequency,
} from './engine';
import {
  DollarSign,
  Percent,
  Calendar,
  ShieldCheck,
  Table as TableIcon,
  BookOpen,
} from 'lucide-react';

export const FdUI: React.FC<ToolComponentProps<FdInput, FdOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency, formatCompact } = useRegion();

  const defaultDeposit = region === 'IN' ? 500000 : 10000;
  const defaultRate = region === 'IN' ? 7.1 : 5.0;
  const defaultComp = region === 'IN' ? 'quarterly' : 'monthly';

  const [deposit, setDeposit] = useState<number>(initialInput?.depositAmount ?? defaultDeposit);
  const [rate, setRate] = useState<number>(initialInput?.annualInterestRate ?? defaultRate);
  const [years, setYears] = useState<number>(initialInput?.tenureYears ?? 3);
  const [months, setMonths] = useState<number>(initialInput?.tenureMonths ?? 0);
  const [compFreq, setCompFreq] = useState<FdCompoundingFrequency>(initialInput?.compoundingFrequency ?? defaultComp);
  const [isSenior, setIsSenior] = useState<boolean>(initialInput?.isSeniorCitizen ?? false);
  const [calcTds, setCalcTds] = useState<boolean>(initialInput?.estimateTds ?? (region === 'IN'));
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const input: FdInput = useMemo(
    () => ({
      depositAmount: deposit,
      annualInterestRate: rate,
      tenureYears: years,
      tenureMonths: months,
      compoundingFrequency: compFreq,
      isSeniorCitizen: isSenior,
      seniorBonusRatePercent: 0.5,
      estimateTds: calcTds,
    }),
    [deposit, rate, years, months, compFreq, isSenior, calcTds]
  );

  const result = useMemo(() => executeFd(input), [input]);

  const handleReset = () => {
    setDeposit(defaultDeposit);
    setRate(defaultRate);
    setYears(3);
    setMonths(0);
    setCompFreq(defaultComp);
    setIsSenior(false);
    setCalcTds(region === 'IN');
    setShowSchedule(false);
  };

  const documentationNode = (
    <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Fixed Deposit & Certificate of Deposit (CD) Guide
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">1. Compounding Standards</h4>
        <p className="text-xs text-slate-600">
          In India, banks compound Fixed Deposit interest <strong>quarterly (every 3 months)</strong>. In the US, Certificates of Deposit (CD) and High-Yield Savings Accounts usually compound <strong>monthly or daily</strong>.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2">
        <h4 className="font-bold text-indigo-950">2. Senior Citizen Privileges</h4>
        <p className="text-xs text-indigo-900">
          Almost all commercial banks offer an extra <strong>+0.50% p.a. interest rate premium</strong> for senior citizens (age 60+). Over a 3 to 5-year tenure, this bonus can increase total interest earned by 7% to 10%.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">3. Tax Deducted at Source (TDS) Rules</h4>
        <p className="text-xs text-slate-600">
          {region === 'IN'
            ? 'In India, 10% TDS is deducted if interest earned across all your FDs with a bank exceeds ₹40,000 in a year (₹50,000 for senior citizens). If your total income is below the taxable limit, you can submit Form 15G (below age 60) or Form 15H (senior citizens) to prevent TDS deduction.'
            : 'In the US, 1099-INT interest income is taxed as ordinary income at your marginal federal and state tax rates.'}
        </p>
      </div>
    </div>
  );

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      inputData={input}
      documentation={documentationNode}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Deposit Principal */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                Deposit Amount
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step={region === 'IN' ? '10000' : '1000'}
                  value={deposit}
                  onChange={(e) => setDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max={region === 'IN' ? 10000000 : 250000}
              step={region === 'IN' ? 10000 : 1000}
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Interest Rate & Senior Citizen Option */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-600" />
                Interest Rate (p.a.)
              </label>
              <span className="text-sm font-bold text-slate-900">
                {result.effectiveRate}% {isSenior ? '(incl. +0.5% Senior Bonus)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />

            <label className="flex items-center gap-2 pt-1 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isSenior}
                onChange={(e) => setIsSenior(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span className="font-medium">Senior Citizen (adds +0.50% interest bonus)</span>
            </label>
          </div>

          {/* Tenure */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Years
                </label>
                <span className="text-sm font-bold text-slate-900">{years}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Months</label>
                <span className="text-sm font-bold text-slate-900">{months}</span>
              </div>
              <input
                type="range"
                min="0"
                max="11"
                step="1"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>
          </div>

          {/* Compounding Frequency */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <label className="text-xs font-semibold text-slate-700">Compounding Frequency</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'quarterly', label: 'Quarterly', hint: 'India standard' },
                { id: 'monthly', label: 'Monthly', hint: 'US CD standard' },
                { id: 'annually', label: 'Annually', hint: 'Yearly' },
                { id: 'simple', label: 'Simple', hint: 'Payout' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCompFreq(f.id as FdCompoundingFrequency)}
                  className={`p-2 rounded-xl border flex flex-col items-center transition cursor-pointer ${
                    compFreq === f.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold">{f.label}</span>
                  <span className={`text-[10px] ${compFreq === f.id ? 'text-slate-300' : 'text-slate-500'}`}>
                    {f.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TDS Checkbox for India */}
          {region === 'IN' && (
            <label className="flex items-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 cursor-pointer text-xs text-slate-700 shadow-2xs">
              <input
                type="checkbox"
                checked={calcTds}
                onChange={(e) => setCalcTds(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>Estimate 10% TDS (if annual interest &gt; ₹40,000 / ₹50,000)</span>
            </label>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Guaranteed Maturity Value
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                +{result.absoluteReturnPercent}% Return
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.maturityAmount)}
              </span>
              <span className="text-xs text-indigo-200">
                {formatCompact(result.maturityAmount)} total payout on maturity
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Total Interest Earned</span>
                <span className="text-base font-bold text-emerald-400">
                  +{formatCurrency(result.totalInterestEarned)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Initial Principal</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(result.principal)}
                </span>
              </div>
            </div>
          </div>

          {/* TDS Note if applicable */}
          {result.estimatedTdsAmount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-950">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Estimated TDS Deduction:</span>
                <span>
                  Estimated 10% TDS of <strong>{formatCurrency(result.estimatedTdsAmount)}</strong> may be deducted by the bank. Your post-TDS payout would be approx{' '}
                  <strong className="underline text-amber-950 font-bold">{formatCurrency(result.postTaxMaturityAmount)}</strong>.
                  Submit Form 15G / 15H if your total income is below the taxable threshold.
                </span>
              </div>
            </div>
          )}

          {/* Schedule Table */}
          {result.schedule.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  {showSchedule ? 'Hide' : 'Inspect'} Year-by-Year Growth Table
                </span>
                <span className="text-slate-400 font-mono">{showSchedule ? '▲' : '▼'}</span>
              </button>

              {showSchedule && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Timeline</th>
                        <th className="py-2.5 px-3">Interest Accrued</th>
                        <th className="py-2.5 px-3 text-right">Account Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {result.schedule.map((row) => (
                        <tr key={row.period} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-sans font-medium text-slate-800">{row.label}</td>
                          <td className="py-2 px-3 text-emerald-600 font-medium">+{formatCurrency(row.cumulativeInterest)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
};
