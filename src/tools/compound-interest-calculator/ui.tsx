import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import { FinancialDisclaimer } from '../../design-system/financial-disclaimer';
import type { ToolComponentProps } from '../../core/types';
import {
  executeCompoundInterest,
  type CompoundInterestInput,
  type CompoundInterestOutput,
  type CompoundingFrequency,
  type DepositFrequency,
} from './engine';
import {
  TrendingUp,
  Sparkles,
  DollarSign,
  Calendar,
  Percent,
  PlusCircle,
  Table as TableIcon,
  BookOpen,
} from 'lucide-react';

export const CompoundInterestUI: React.FC<ToolComponentProps<CompoundInterestInput, CompoundInterestOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency, formatCompact } = useRegion();

  // Region-aware initial defaults
  const defaultPrincipal = region === 'IN' ? 100000 : 10000;
  const defaultRate = region === 'IN' ? 11 : 8;
  const defaultDeposit = region === 'IN' ? 5000 : 250;

  const [principal, setPrincipal] = useState<number>(initialInput?.initialPrincipal ?? defaultPrincipal);
  const [rate, setRate] = useState<number>(initialInput?.annualInterestRate ?? defaultRate);
  const [years, setYears] = useState<number>(initialInput?.investmentYears ?? 10);
  const [compFreq, setCompFreq] = useState<CompoundingFrequency>(initialInput?.compoundingFrequency ?? 'monthly');
  const [deposit, setDeposit] = useState<number>(initialInput?.regularDeposit ?? defaultDeposit);
  const [depFreq, setDepFreq] = useState<DepositFrequency>(initialInput?.depositFrequency ?? 'monthly');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const input: CompoundInterestInput = useMemo(
    () => ({
      initialPrincipal: principal,
      annualInterestRate: rate,
      investmentYears: years,
      compoundingFrequency: compFreq,
      regularDeposit: deposit,
      depositFrequency: depFreq,
    }),
    [principal, rate, years, compFreq, deposit, depFreq]
  );

  const result = useMemo(() => executeCompoundInterest(input), [input]);

  const handleReset = () => {
    setPrincipal(defaultPrincipal);
    setRate(defaultRate);
    setYears(10);
    setCompFreq('monthly');
    setDeposit(defaultDeposit);
    setDepFreq('monthly');
    setShowSchedule(false);
  };

  const depositPercent = result.finalBalance > 0
    ? Math.round((result.totalContributions / result.finalBalance) * 100)
    : 0;
  const interestPercent = Math.max(0, 100 - depositPercent);

  const documentationNode = (
    <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Compound Interest Explained
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">1. The Compound Formula</h4>
        <p className="text-xs text-slate-600">
          Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods:
          <code className="p-1 rounded bg-slate-100 font-mono text-slate-900 font-bold block my-1">
            A = P × (1 + r/n)^(n×t)
          </code>
          where <strong>P</strong> is Principal, <strong>r</strong> is Annual Interest Rate, <strong>n</strong> is Compounding Frequency per year, and <strong>t</strong> is Years.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2">
        <h4 className="font-bold text-indigo-950">2. Frequency Matters</h4>
        <p className="text-xs text-indigo-900">
          More frequent compounding (e.g. daily or monthly vs annually) means interest starts earning interest faster. Over long investment horizons (10-30 years), the compounding advantage produces massive exponential curves compared to simple linear interest.
        </p>
      </div>
      <FinancialDisclaimer />
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
          {/* Quick Presets */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Quick Presets ({region === 'IN' ? 'India' : 'US'})
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {region === 'IN' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRate(7.1);
                      setCompFreq('quarterly');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition cursor-pointer"
                  >
                    Bank FD (7.1% Quarterly)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRate(12);
                      setCompFreq('monthly');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition cursor-pointer"
                  >
                    Nifty Index (12% Monthly)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRate(8.5);
                      setCompFreq('monthly');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition cursor-pointer"
                  >
                    Corporate Debt (8.5%)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setRate(4.5);
                      setCompFreq('monthly');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition cursor-pointer"
                  >
                    HYSA (4.5% Monthly)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRate(10);
                      setCompFreq('annually');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition cursor-pointer"
                  >
                    S&P 500 (10% Annual)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRate(5.0);
                      setCompFreq('quarterly');
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium transition cursor-pointer"
                  >
                    CD (5.0% Quarterly)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Initial Principal */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                Initial Investment
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step={region === 'IN' ? '10000' : '1000'}
                  value={principal}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={region === 'IN' ? 10000000 : 250000}
              step={region === 'IN' ? 10000 : 1000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Regular Deposit */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Regular Additional Deposit
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step={region === 'IN' ? '1000' : '50'}
                  value={deposit}
                  onChange={(e) => setDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={region === 'IN' ? 200000 : 10000}
                step={region === 'IN' ? 1000 : 50}
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
              <select
                value={depFreq}
                onChange={(e) => setDepFreq(e.target.value as DepositFrequency)}
                className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
              >
                <option value="monthly">/ month</option>
                <option value="annually">/ year</option>
              </select>
            </div>
          </div>

          {/* Rate and Years Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Interest Rate */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-600" />
                  Interest Rate (p.a.)
                </label>
                <span className="text-sm font-bold text-slate-900">{rate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>

            {/* Time Period */}
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Time Horizon
                </label>
                <span className="text-sm font-bold text-slate-900">{years} {years === 1 ? 'Year' : 'Years'}</span>
              </div>
              <input
                type="range"
                min="1"
                max="40"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
              />
            </div>
          </div>

          {/* Compounding Frequency Selection */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <label className="text-xs font-semibold text-slate-700">Compounding Frequency</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(
                [
                  { id: 'daily', label: 'Daily' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'quarterly', label: 'Quarterly' },
                  { id: 'semi-annually', label: 'Semi-Ann.' },
                  { id: 'annually', label: 'Annually' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCompFreq(f.id)}
                  className={`text-xs py-2 px-1 rounded-xl font-medium transition cursor-pointer text-center ${
                    compFreq === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Estimated Future Balance
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                in {years} years
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.finalBalance)}
              </span>
              <span className="text-xs text-indigo-200">
                {formatCompact(result.finalBalance)} total accumulated wealth
              </span>
            </div>

            {/* Split breakdown */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60">
              <div className="flex flex-col">
                <span className="text-xs text-indigo-300">Total Invested</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(result.totalContributions)}
                </span>
                <span className="text-[11px] text-indigo-400">
                  {depositPercent}% of total
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-emerald-300">Interest Earned</span>
                <span className="text-base font-bold text-emerald-400">
                  +{formatCurrency(result.totalInterest)}
                </span>
                <span className="text-[11px] text-emerald-400/80">
                  {interestPercent}% of total
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${depositPercent}%` }}
                className="h-full bg-indigo-400 transition-all duration-300"
                title={`Deposits: ${depositPercent}%`}
              />
              <div
                style={{ width: `${interestPercent}%` }}
                className="h-full bg-emerald-400 transition-all duration-300"
                title={`Interest: ${interestPercent}%`}
              />
            </div>
          </div>

          {/* Compound Advantage Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                The Power of Compounding
              </span>
              <span className="text-xs text-emerald-800 leading-relaxed">
                Compounding earned you an extra{' '}
                <strong className="text-emerald-950 font-bold">
                  {formatCurrency(result.compoundAdvantage)}
                </strong>{' '}
                over simple interest.
              </span>
            </div>
          </div>

          {/* Toggle Year-by-Year Schedule */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                {showSchedule ? 'Hide' : 'View'} Year-by-Year Growth Table
              </span>
              <span className="text-slate-400 font-mono">{showSchedule ? '▲' : '▼'}</span>
            </button>

            {showSchedule && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Deposits</th>
                      <th className="py-2.5 px-3">Year's Interest</th>
                      <th className="py-2.5 px-3">Total Interest</th>
                      <th className="py-2.5 px-3 text-right">End Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.yearlySchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/80 font-mono">
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">Yr {row.year}</td>
                        <td className="py-2 px-3 text-slate-600">{formatCurrency(row.depositsToDate)}</td>
                        <td className="py-2 px-3 text-emerald-600">+{formatCurrency(row.interestEarnedYear)}</td>
                        <td className="py-2 px-3 text-emerald-700 font-medium">{formatCurrency(row.totalInterestToDate)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatCurrency(row.endBalance)}</td>
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
