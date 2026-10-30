import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import { FinancialDisclaimer } from '../../design-system/financial-disclaimer';
import type { ToolComponentProps } from '../../core/types';
import {
  executeEmergencyFund,
  type EmergencyFundInput,
  type EmergencyFundOutput,
} from './engine';
import {
  Home,
  Utensils,
  Zap,
  CreditCard,
  HeartPulse,
  MoreHorizontal,
  PiggyBank,
  BookOpen,
} from 'lucide-react';

export const EmergencyFundUI: React.FC<ToolComponentProps<EmergencyFundInput, EmergencyFundOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency } = useRegion();

  const defaultHousing = region === 'IN' ? 25000 : 1800;
  const defaultFood = region === 'IN' ? 15000 : 700;
  const defaultUtils = region === 'IN' ? 5000 : 350;
  const defaultLoans = region === 'IN' ? 10000 : 450;
  const defaultHealth = region === 'IN' ? 3000 : 350;
  const defaultMisc = region === 'IN' ? 2000 : 200;
  const defaultSavings = region === 'IN' ? 100000 : 8000;
  const defaultContrib = region === 'IN' ? 20000 : 600;

  const [housing, setHousing] = useState<number>(initialInput?.housingExpense ?? defaultHousing);
  const [food, setFood] = useState<number>(initialInput?.foodExpense ?? defaultFood);
  const [utils, setUtils] = useState<number>(initialInput?.utilitiesExpense ?? defaultUtils);
  const [loans, setLoans] = useState<number>(initialInput?.loanEmisExpense ?? defaultLoans);
  const [health, setHealth] = useState<number>(initialInput?.insuranceHealthcareExpense ?? defaultHealth);
  const [misc, setMisc] = useState<number>(initialInput?.miscEssentialsExpense ?? defaultMisc);
  const [buffer, setBuffer] = useState<number>(initialInput?.bufferMonths ?? 6);
  const [savings, setSavings] = useState<number>(initialInput?.currentSavings ?? defaultSavings);
  const [contrib, setContrib] = useState<number>(initialInput?.monthlySavingsContribution ?? defaultContrib);

  const input: EmergencyFundInput = useMemo(
    () => ({
      housingExpense: housing,
      foodExpense: food,
      utilitiesExpense: utils,
      loanEmisExpense: loans,
      insuranceHealthcareExpense: health,
      miscEssentialsExpense: misc,
      bufferMonths: buffer,
      currentSavings: savings,
      monthlySavingsContribution: contrib,
    }),
    [housing, food, utils, loans, health, misc, buffer, savings, contrib]
  );

  const result = useMemo(() => executeEmergencyFund(input), [input]);

  const handleReset = () => {
    setHousing(defaultHousing);
    setFood(defaultFood);
    setUtils(defaultUtils);
    setLoans(defaultLoans);
    setHealth(defaultHealth);
    setMisc(defaultMisc);
    setBuffer(6);
    setSavings(defaultSavings);
    setContrib(defaultContrib);
  };

  const documentationNode = (
    <div className="flex flex-col gap-5 text-sm text-slate-800 leading-relaxed">
      <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        Emergency Safety Net Guide
      </h3>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">1. What is an Emergency Fund?</h4>
        <p className="text-xs text-slate-600">
          An emergency fund is a ring-fenced reserve of highly liquid cash meant exclusively for unforeseen events: medical emergencies, job loss, sudden major home/car repairs. It is insurance against life, not an investment intended for high yields.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col gap-2">
        <h4 className="font-bold text-indigo-950">2. How Many Months of Expenses Do You Need?</h4>
        <ul className="list-disc list-inside text-xs text-indigo-900 space-y-1">
          <li><strong>3 Months:</strong> Dual-income couples with stable corporate or government jobs and zero dependents.</li>
          <li><strong>6 Months (Recommended):</strong> Standard baseline for most single-earner households and families with kids.</li>
          <li><strong>9 to 12 Months:</strong> Freelancers, commission-based sales roles, contract workers, and startup founders.</li>
        </ul>
      </div>
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-slate-900">3. Where to Keep Your Emergency Fund</h4>
        <p className="text-xs text-slate-600">
          {region === 'IN'
            ? 'Never lock emergency funds in illiquid assets or volatile equities. Keep 1-2 months in a savings bank account with sweep-in FD facility, and 4-5 months in an instant-redemption Liquid Mutual Fund.'
            : 'Park your fund in a dedicated High-Yield Savings Account (HYSA) or Money Market Fund paying ~4-5% APY with instantaneous ACH transfers.'}
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
          {/* Buffer Selection */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <label className="text-xs font-semibold text-slate-700">Recommended Runway Buffer</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { months: 3, label: '3 Months', sub: 'Stable dual-income' },
                { months: 6, label: '6 Months', sub: 'Standard rule' },
                { months: 9, label: '9 Months', sub: 'Single earner' },
                { months: 12, label: '12 Months', sub: 'Freelance / Business' },
              ].map((b) => (
                <button
                  key={b.months}
                  type="button"
                  onClick={() => setBuffer(b.months)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition cursor-pointer ${
                    buffer === b.months
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold">{b.label}</span>
                  <span className={`text-[10px] ${buffer === b.months ? 'text-slate-300' : 'text-slate-500'}`}>
                    {b.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Essential Expenses */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">Monthly Essential Expenses</span>
              <span className="text-xs font-bold text-indigo-600 font-mono">
                Total: {formatCurrency(result.totalMonthlyExpense)}/mo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <Home className="w-3 h-3 text-slate-500" /> Housing / Rent
                </label>
                <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-slate-500">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={housing}
                    onChange={(e) => setHousing(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <Utensils className="w-3 h-3 text-slate-500" /> Groceries & Food
                </label>
                <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-slate-500">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={food}
                    onChange={(e) => setFood(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-slate-500" /> Utilities & Internet
                </label>
                <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-slate-500">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={utils}
                    onChange={(e) => setUtils(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-slate-500" /> Loan EMIs & Debt
                </label>
                <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-slate-500">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={loans}
                    onChange={(e) => setLoans(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <HeartPulse className="w-3 h-3 text-slate-500" /> Healthcare & Insurance
                </label>
                <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-slate-500">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={health}
                    onChange={(e) => setHealth(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center gap-1.5">
                  <MoreHorizontal className="w-3 h-3 text-slate-500" /> Other Essentials
                </label>
                <div className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
                  <span className="text-slate-500">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    value={misc}
                    onChange={(e) => setMisc(Number(e.target.value))}
                    className="w-full bg-transparent focus:outline-none font-mono text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Savings & Monthly Savings Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="text-xs font-semibold text-slate-700">Current Cash Cushion</label>
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
              <label className="text-xs font-semibold text-slate-700">Monthly Savings Towards Fund</label>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={contrib}
                  onChange={(e) => setContrib(Math.max(0, Number(e.target.value)))}
                  className="w-full text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Hero Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Target Safety Cushion ({buffer} Months)
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {result.percentFunded}% Funded
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {formatCurrency(result.targetFundAmount)}
              </span>
              <span className="text-xs text-indigo-200">
                Covers {buffer} months of expenses ({formatCurrency(result.totalMonthlyExpense)}/mo)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${Math.min(100, result.percentFunded)}%` }}
                className={`h-full transition-all duration-300 ${
                  result.isFullyFunded ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Saved So Far</span>
                <span className="text-base font-bold text-white">
                  {formatCurrency(result.currentSavings)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Fund Status</span>
                <span className={`text-base font-bold ${result.isFullyFunded ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.isFullyFunded ? 'Fully Funded! 🎉' : `Short by ${formatCurrency(Math.abs(result.shortfallOrSurplus))}`}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Advice */}
          {!result.isFullyFunded && result.monthsToFullFund > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3.5 text-xs text-indigo-950">
              <PiggyBank className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">Savings Roadmap:</span>
                <span>
                  At your current savings rate of <strong>{formatCurrency(contrib)}/month</strong>, you will reach your 100% emergency fund target in{' '}
                  <strong className="underline font-bold text-indigo-900">{result.monthsToFullFund} months</strong>.
                </span>
              </div>
            </div>
          )}

          {/* Expense Breakdown List */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-2.5 text-xs">
            <span className="font-bold text-slate-800">Monthly Expense Breakdown</span>
            <div className="flex flex-col divide-y divide-slate-100">
              {result.expenseBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-slate-600">{item.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-900 font-medium">{formatCurrency(item.amount)}</span>
                    <span className="text-slate-400 text-[10px]">({item.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Recommendation Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex flex-col gap-1">
            <span className="font-semibold text-slate-800">💡 Best place to park your emergency fund:</span>
            <span>
              {region === 'IN'
                ? 'Keep 1-2 months in an auto-sweep bank account or savings account, and 4-5 months in an instant-redemption Liquid Mutual Fund or high-interest Fixed Deposit.'
                : 'Keep 1 month in your primary checking account, and the remaining 5 months in a High-Yield Savings Account (HYSA) or money market account paying ~4-5% APY.'}
            </span>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};
