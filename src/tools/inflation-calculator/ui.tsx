import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeInflation,
  type InflationInput,
  type InflationOutput,
} from './engine';
import {
  Percent,
  Calendar,
  DollarSign,
  AlertTriangle,
  Table as TableIcon,
  BookOpen,
} from 'lucide-react';

export const InflationUI: React.FC<ToolComponentProps<InflationInput, InflationOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency, formatCompact } = useRegion();

  const defaultAmount = region === 'IN' ? 1000000 : 50000;
  const defaultRate = region === 'IN' ? 6.0 : 3.2;

  const [amount, setAmount] = useState<number>(initialInput?.amount ?? defaultAmount);
  const [rate, setRate] = useState<number>(initialInput?.annualInflationRate ?? defaultRate);
  const [years, setYears] = useState<number>(initialInput?.years ?? 15);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const input: InflationInput = useMemo(
    () => ({
      amount,
      annualInflationRate: rate,
      years,
    }),
    [amount, rate, years]
  );

  const result = useMemo(() => executeInflation(input), [input]);

  const handleReset = () => {
    setAmount(defaultAmount);
    setRate(defaultRate);
    setYears(15);
    setShowSchedule(false);
  };

  const documentationNode = (
    <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Inflation & Purchasing Power Guide
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">1. How Inflation Destroys Cash</h4>
        <p className="text-xs text-slate-600">
          Inflation represents the rate at which the price of goods and services rises, eroding the buying power of currency. Even low inflation rates compounded over 10 to 20 years cut the real purchasing power of cash savings in half.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-2">
        <h4 className="font-bold text-amber-950">2. The Rule of 72</h4>
        <p className="text-xs text-amber-900">
          The Rule of 72 is an easy mental shortcut: divide 72 by the annual inflation rate to find out how many years it takes for prices to double. At 6% inflation (typical in India), prices double every <strong>12 years</strong>. At 3% inflation (US target), prices double every <strong>24 years</strong>.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">3. Beating Inflation</h4>
        <p className="text-xs text-slate-600">
          To build real wealth, your portfolio must generate returns higher than inflation plus taxes. Equity investments (index funds, broad market equities) have historically been one of the most reliable hedges against long-term inflation.
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
          {/* Amount */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                Current Amount / Price Today
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="1000000000"
                  step={region === 'IN' ? '50000' : '2000'}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max={region === 'IN' ? 10000000 : 500000}
              step={region === 'IN' ? 50000 : 2500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Inflation Rate */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-600" />
                Annual Inflation Rate
              </label>
              <span className="text-sm font-bold text-slate-900">{rate}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRate(3.0)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
              >
                3.0% (US Target)
              </button>
              <button
                type="button"
                onClick={() => setRate(6.0)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
              >
                6.0% (India Average)
              </button>
              <button
                type="button"
                onClick={() => setRate(8.0)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
              >
                8.0% (Education/Health)
              </button>
            </div>
          </div>

          {/* Time Horizon */}
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

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Future Cost of Same Goods
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                +{result.cumulativeInflationPercent}% inflation
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.futureCost)}
              </span>
              <span className="text-xs text-indigo-200">
                What costs {formatCurrency(amount)} today will cost {formatCompact(result.futureCost)} in {years} years.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Purchasing Power Value</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(result.purchasingPowerValue)}
                </span>
                <span className="text-[11px] text-indigo-400">
                  Value of {formatCurrency(amount)} in {years} yrs
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Purchasing Power Lost</span>
                <span className="text-base font-bold text-rose-400">
                  -{result.purchasingPowerLossPercent}%
                </span>
                <span className="text-[11px] text-rose-300">
                  Erosion of wealth
                </span>
              </div>
            </div>
          </div>

          {/* Rule of 72 Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-bold text-amber-950">
                Rule of 72 Doubling Time:
              </span>
              <span className="text-amber-900 leading-relaxed">
                At an annual inflation rate of {rate}%, the cost of living and everyday expenses will{' '}
                <strong className="text-amber-950 font-bold underline">
                  double every {result.doublingYears} years.
                </strong>{' '}
                Any cash savings earning below {rate}% return is losing real purchasing value every single day.
              </span>
            </div>
          </div>

          {/* Timeline schedule */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                {showSchedule ? 'Hide' : 'Inspect'} Year-by-Year Inflation Progression
              </span>
              <span className="text-slate-400 font-mono">{showSchedule ? '▲' : '▼'}</span>
            </button>

            {showSchedule && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs max-h-80 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Future Cost</th>
                      <th className="py-2.5 px-3 text-right">Purchasing Power</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.yearlySchedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">In {row.year} yrs</td>
                        <td className="py-2 px-3 text-slate-900 font-semibold">{formatCurrency(row.equivalentAmount)}</td>
                        <td className="py-2 px-3 text-right font-medium text-slate-600">{row.purchasingPowerPercentage}%</td>
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
