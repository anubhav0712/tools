import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeRetirementPlanner,
  type RetirementInput,
  type RetirementOutput,
} from './engine';
import {
  Flame,
  AlertTriangle,
  Table as TableIcon,
} from 'lucide-react';

export const RetirementUI: React.FC<ToolComponentProps<RetirementInput, RetirementOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency, formatCompact } = useRegion();

  const defaultExpense = region === 'IN' ? 50000 : 4500;
  const defaultSavings = region === 'IN' ? 500000 : 50000;
  const defaultMonthlySave = region === 'IN' ? 20000 : 1200;
  const defaultInflation = region === 'IN' ? 6 : 3;
  const defaultPreReturn = region === 'IN' ? 12 : 8.5;
  const defaultPostReturn = region === 'IN' ? 7 : 5.5;

  const [currentAge, setCurrentAge] = useState<number>(initialInput?.currentAge ?? 30);
  const [retireAge, setRetireAge] = useState<number>(initialInput?.retirementAge ?? 60);
  const [lifeExp, setLifeExp] = useState<number>(initialInput?.lifeExpectancyYears ?? 85);
  const [expense, setExpense] = useState<number>(initialInput?.currentMonthlyExpense ?? defaultExpense);
  const [savings, setSavings] = useState<number>(initialInput?.currentSavings ?? defaultSavings);
  const [monthlySave, setMonthlySave] = useState<number>(initialInput?.monthlyContribution ?? defaultMonthlySave);
  const [inflation, setInflation] = useState<number>(initialInput?.inflationRatePercent ?? defaultInflation);
  const [preReturn, setPreReturn] = useState<number>(initialInput?.preRetirementReturnRate ?? defaultPreReturn);
  const [postReturn, setPostReturn] = useState<number>(initialInput?.postRetirementReturnRate ?? defaultPostReturn);
  const [showMilestones, setShowMilestones] = useState<boolean>(false);

  const input: RetirementInput = useMemo(
    () => ({
      currentAge,
      retirementAge: retireAge,
      lifeExpectancyYears: lifeExp,
      currentMonthlyExpense: expense,
      inflationRatePercent: inflation,
      preRetirementReturnRate: preReturn,
      postRetirementReturnRate: postReturn,
      currentSavings: savings,
      monthlyContribution: monthlySave,
    }),
    [
      currentAge,
      retireAge,
      lifeExp,
      expense,
      inflation,
      preReturn,
      postReturn,
      savings,
      monthlySave,
    ]
  );

  const result = useMemo(() => executeRetirementPlanner(input), [input]);

  const handleReset = () => {
    setCurrentAge(30);
    setRetireAge(60);
    setLifeExp(85);
    setExpense(defaultExpense);
    setSavings(defaultSavings);
    setMonthlySave(defaultMonthlySave);
    setInflation(defaultInflation);
    setPreReturn(defaultPreReturn);
    setPostReturn(defaultPostReturn);
    setShowMilestones(false);
  };

  const readinessPercent = result.requiredCorpus > 0
    ? Math.min(150, Math.round((result.projectedCorpus / result.requiredCorpus) * 100))
    : 100;

  return (
    <ToolShell tool={tool} onReset={handleReset}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Ages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="text-[11px] font-semibold text-slate-700">Current Age</label>
              <input
                type="number"
                min="18"
                max="75"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="text-sm font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="text-[11px] font-semibold text-slate-700">Retirement Age</label>
              <input
                type="number"
                min={currentAge + 1}
                max="90"
                value={retireAge}
                onChange={(e) => setRetireAge(Number(e.target.value))}
                className="text-sm font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="text-[11px] font-semibold text-slate-700">Life Expectancy</label>
              <input
                type="number"
                min={retireAge + 1}
                max="105"
                value={lifeExp}
                onChange={(e) => setLifeExp(Number(e.target.value))}
                className="text-sm font-bold p-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          {/* Current Monthly Expenses */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Current Monthly Expenses</label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="1000"
                  max="5000000"
                  step={region === 'IN' ? '5000' : '200'}
                  value={expense}
                  onChange={(e) => setExpense(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max={region === 'IN' ? 500000 : 25000}
              step={region === 'IN' ? 5000 : 250}
              value={expense}
              onChange={(e) => setExpense(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Current Savings & Monthly Contribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="text-xs font-semibold text-slate-700">Current Saved Corpus</label>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={savings}
                  onChange={(e) => setSavings(Math.max(0, Number(e.target.value)))}
                  className="w-full text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="text-xs font-semibold text-slate-700">Monthly Investment</label>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={monthlySave}
                  onChange={(e) => setMonthlySave(Math.max(0, Number(e.target.value)))}
                  className="w-full text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-700">Inflation %</span>
              <input
                type="number"
                step="0.5"
                value={inflation}
                onChange={(e) => setInflation(Number(e.target.value))}
                className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-700">Pre-Ret. Return %</span>
              <input
                type="number"
                step="0.5"
                value={preReturn}
                onChange={(e) => setPreReturn(Number(e.target.value))}
                className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-700">Post-Ret. Return %</span>
              <input
                type="number"
                step="0.5"
                value={postReturn}
                onChange={(e) => setPostReturn(Number(e.target.value))}
                className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Target Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Required Target Corpus at Age {retireAge}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {result.yearsToRetirement} yrs left
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.requiredCorpus)}
              </span>
              <span className="text-xs text-indigo-200 font-mono">
                {formatCompact(result.requiredCorpus)} needed for {result.yearsInRetirement} years of retirement
              </span>
            </div>

            {/* Projected vs Shortfall */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Projected Corpus</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(result.projectedCorpus)}
                </span>
                <span className="text-[11px] text-indigo-400">
                  {readinessPercent}% funded
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Corpus Status</span>
                <span className={`text-base font-bold ${result.isRetirementReady ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.isRetirementReady ? 'Surplus' : 'Shortfall'}: {formatCurrency(Math.abs(result.shortfallOrSurplus))}
                </span>
                <span className="text-[11px] text-indigo-300">
                  {result.isRetirementReady ? 'On Track 🎉' : 'Needs boost ⚠️'}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly expense inflation alert */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <span className="font-bold">Inflation Reality Check:</span>
              <span>
                Due to {inflation}% annual inflation, your current monthly expense of{' '}
                <strong>{formatCurrency(expense)}</strong> will cost{' '}
                <strong className="text-amber-950 underline">{formatCurrency(result.monthlyExpenseAtRetirement)}/month</strong>{' '}
                by the time you retire at age {retireAge}.
              </span>
              {!result.isRetirementReady && (
                <span className="pt-1 text-indigo-900 font-semibold">
                  👉 Recommended Monthly SIP: {formatCurrency(result.recommendedMonthlySaving)}/mo to close the gap.
                </span>
              )}
            </div>
          </div>

          {/* FIRE Numbers (Trinity Rule) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              FIRE (Financial Independence, Retire Early) Benchmarks
            </span>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-600 font-medium">Standard 4% Rule (25x)</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatCurrency(result.fireNumber25x)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-600 font-medium">Conservative 3% Rule (33x)</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatCurrency(result.fireNumber33x)}
                </div>
              </div>
            </div>
          </div>

          {/* Milestone timeline accordion */}
          {result.timeline.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowMilestones(!showMilestones)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  {showMilestones ? 'Hide' : 'View'} 5-Year Milestone Projections
                </span>
                <span className="text-slate-400 font-mono">{showMilestones ? '▲' : '▼'}</span>
              </button>

              {showMilestones && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Age</th>
                        <th className="py-2.5 px-3">Annual Expenses</th>
                        <th className="py-2.5 px-3 text-right">Projected Corpus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {result.timeline.map((m) => (
                        <tr key={m.age} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-sans font-medium text-slate-800">Age {m.age}</td>
                          <td className="py-2 px-3 text-slate-600">{formatCurrency(m.annualExpense)}</td>
                          <td className="py-2 px-3 text-right font-bold text-indigo-600">
                            {formatCurrency(m.projectedCorpus)}
                          </td>
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
