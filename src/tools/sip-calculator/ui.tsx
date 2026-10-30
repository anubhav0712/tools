import React, { useState, useEffect, useTransition } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { ToolShell } from '../../design-system/tool-shell';
import { FinancialDisclaimer } from '../../design-system/financial-disclaimer';
import { Button } from '../../design-system/button';
import { useRegion } from '../../core/locale-context';
import { executeSipCalculator } from './engine';
import type { ToolComponentProps } from '../../core/types';
import type { SipCalculatorInput, SipCalculatorOutput } from './definition';

export const SipCalculatorUI: React.FC<ToolComponentProps<SipCalculatorInput, SipCalculatorOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, formatCurrency, formatCompact } = useRegion();

  const defaultMonthly = region === 'IN' ? 10000 : 500;
  const defaultReturn = region === 'IN' ? 12 : 9.5;
  const defaultYears = region === 'IN' ? 15 : 20;

  const [monthly, setMonthly] = useState<number>(initialInput?.monthlyInvestment ?? defaultMonthly);
  const [expectedReturn, setExpectedReturn] = useState<number>(initialInput?.annualExpectedReturn ?? defaultReturn);
  const [years, setYears] = useState<number>(initialInput?.investmentYears ?? defaultYears);
  const [stepUp, setStepUp] = useState<number>(initialInput?.annualStepUpPercent ?? 0);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const [output, setOutput] = useState<SipCalculatorOutput>({
    totalInvested: 0,
    totalReturns: 0,
    maturityValue: 0,
    investedPercentage: 50,
    returnsPercentage: 50,
    yearlySchedule: [],
  });

  const [executionTime, setExecutionTime] = useState<number>(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const start = performance.now();
      const res = executeSipCalculator({
        monthlyInvestment: monthly,
        annualExpectedReturn: expectedReturn,
        investmentYears: years,
        annualStepUpPercent: stepUp,
      });
      const end = performance.now();
      setExecutionTime(end - start);
      setOutput(res);
    });
  }, [monthly, expectedReturn, years, stepUp]);

  useEffect(() => {
    if (!initialInput) {
      setMonthly(region === 'IN' ? 10000 : 500);
      setExpectedReturn(region === 'IN' ? 12 : 9.5);
      setYears(region === 'IN' ? 15 : 20);
    }
  }, [region, initialInput]);

  const maxMonthly = region === 'IN' ? 100000 : 5000;
  const monthlyStep = region === 'IN' ? 500 : 50;

  const documentationNode = (
    <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Systematic Investment Plan (SIP / DCA) Guide
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">1. How SIP & Dollar-Cost Averaging Works</h4>
        <p className="text-xs text-slate-600">
          A Systematic Investment Plan (SIP) enables you to invest a fixed amount regularly into mutual funds or index ETFs. By investing consistently across market ups and downs, you practice Dollar/Rupee Cost Averaging — purchasing more units when prices are low and fewer units when prices are high.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col gap-2">
        <h4 className="font-bold text-emerald-950">2. The 10% Annual Step-Up Miracle</h4>
        <p className="text-xs text-emerald-900">
          As your salary increases each year, increasing your monthly SIP by just 10% annually can produce more than <strong>double the final wealth</strong> compared to a flat monthly investment over a 15-year horizon!
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">3. Capital Gains Tax Considerations</h4>
        <p className="text-xs text-slate-600">
          {region === 'IN'
            ? 'In India (FY 2024-25 onwards), Long-Term Capital Gains (LTCG) on equity mutual funds held for over 1 year are taxed at 12.5% on profits exceeding ₹1.25 Lakhs per financial year. STCG is taxed at 20%.'
            : 'In the US, investments held in taxable brokerage accounts for over 1 year qualify for preferential Long-Term Capital Gains rates (0%, 15%, or 20% depending on income). Investments in 401(k) / IRA accounts grow tax-deferred or tax-free.'}
        </p>
      </div>
      <FinancialDisclaimer />
    </div>
  );

  return (
    <ToolShell
      tool={tool}
      onReset={() => {
        setMonthly(defaultMonthly);
        setExpectedReturn(defaultReturn);
        setYears(defaultYears);
        setStepUp(0);
      }}
      executionTimeMs={executionTime}
      inputData={{ monthlyInvestment: monthly, annualExpectedReturn: expectedReturn, investmentYears: years, annualStepUpPercent: stepUp }}
      documentation={documentationNode}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sliders & Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5 p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-semibold text-sm sm:text-base text-slate-900">
              {region === 'IN' ? 'Monthly SIP Investment' : 'Monthly Recurring Investment'}
            </h2>
            {/* Quick Benchmark Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {region === 'IN' ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpectedReturn(8)}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Debt (8%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpectedReturn(12)}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Nifty 50 (12%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpectedReturn(15)}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Midcap (15%)
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpectedReturn(6)}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Bonds (6%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpectedReturn(9.5)}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    S&P 500 (9.5%)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpectedReturn(12)}
                    className="text-xs h-7 px-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    Growth (12%)
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Input 1: Monthly Investment Amount */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Monthly Contribution</label>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-400 font-semibold">{region === 'IN' ? '₹' : '$'}</span>
                <input
                  type="number"
                  min="100"
                  max={maxMonthly * 5}
                  value={monthly}
                  onChange={(e) => setMonthly(Math.max(0, Number(e.target.value)))}
                  className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-24 sm:w-28 text-right focus:outline-none"
                />
              </div>
            </div>
            <input
              type="range"
              min={region === 'IN' ? 500 : 50}
              max={maxMonthly}
              step={monthlyStep}
              value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatCompact(region === 'IN' ? 500 : 50)}</span>
              <span>{formatCompact(maxMonthly / 2)}</span>
              <span>{formatCompact(maxMonthly)}</span>
            </div>
          </div>

          {/* Input 2: Expected Return Rate */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Expected Annual Return Rate (CAGR)</label>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="35"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Math.max(0.5, Number(e.target.value)))}
                  className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-16 text-right focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-semibold">%</span>
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="25"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>3% (Conservative)</span>
              <span>12% (Balanced)</span>
              <span>25% (High Risk)</span>
            </div>
          </div>

          {/* Input 3: Duration in Years */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Time Horizon (Duration)</label>
              <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
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
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>35 Years</span>
            </div>
          </div>

          {/* Step-up Option */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-700">Annual Step-Up (% increase / year)</span>
              <span className="text-[11px] text-slate-500">Increase your monthly SIP as your salary increases</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200">
              <input
                type="number"
                min="0"
                max="50"
                step="5"
                value={stepUp}
                onChange={(e) => setStepUp(Math.max(0, Number(e.target.value)))}
                className="font-mono text-sm font-semibold text-slate-900 bg-transparent w-14 text-right focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-semibold">%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Output Metrics & Visuals (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Hero Output Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white shadow-md flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-200 uppercase tracking-wider">
                Expected Future Wealth
              </span>
              <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-300">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span>Compound Growth</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(output.maturityValue)}
              </span>
            </div>

            <div className="pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs text-emerald-200">
              <span>Duration:</span>
              <span className="font-semibold text-white">{years} Years ({years * 12} Months)</span>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Total Invested</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(output.totalInvested)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">{output.investedPercentage}% of total</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Estimated Wealth Gain</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-600 mt-1">
                {formatCurrency(output.totalReturns)}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                +{output.returnsPercentage}% profit
              </span>
            </div>
          </div>

          {/* Visual Percentage Bar */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-600">Invested ({output.investedPercentage}%)</span>
              <span className="text-emerald-600">Wealth Gain ({output.returnsPercentage}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="bg-slate-400 h-full transition-all duration-300"
                style={{ width: `${output.investedPercentage}%` }}
              />
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${output.returnsPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
              <span>Return Multiplier:</span>
              <span className="text-slate-900 font-semibold">
                {output.totalInvested > 0 ? (output.maturityValue / output.totalInvested).toFixed(2) : '1'}x your money
              </span>
            </div>
          </div>

          {/* Insight Callout */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex flex-col text-xs leading-relaxed">
              <span className="font-bold text-indigo-950">Power of Compounding</span>
              <p>
                By consistently investing {formatCurrency(monthly)} per month, your wealth generates{' '}
                <strong>{formatCurrency(output.totalReturns)}</strong> purely from compound interest!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Growth Schedule Drawer */}
      <div className="flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="flex items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-100 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-sm text-slate-900">
              Year-by-Year Wealth Growth Schedule ({output.yearlySchedule.length} Years)
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
                  <th className="py-2.5 px-4">Invested So Far</th>
                  <th className="py-2.5 px-4">Wealth Gained</th>
                  <th className="py-2.5 px-4 text-right">Portfolio Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {output.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-4 font-sans font-medium text-slate-900">Year {row.year}</td>
                    <td className="py-2 px-4 text-slate-600">{formatCurrency(row.totalInvested)}</td>
                    <td className="py-2 px-4 text-emerald-600 font-medium">+{formatCurrency(row.totalReturns)}</td>
                    <td className="py-2 px-4 text-right font-semibold text-slate-900">
                      {formatCurrency(row.futureValue)}
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
