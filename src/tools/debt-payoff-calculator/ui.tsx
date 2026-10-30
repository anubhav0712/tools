import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeDebtPayoff,
  type DebtPayoffInput,
  type DebtPayoffOutput,
} from './engine';
import {
  CreditCard,
  Percent,
  PlusCircle,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Table as TableIcon,
} from 'lucide-react';

export const DebtPayoffUI: React.FC<ToolComponentProps<DebtPayoffInput, DebtPayoffOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency } = useRegion();

  const defaultBalance = region === 'IN' ? 150000 : 6000;
  const defaultApr = region === 'IN' ? 36 : 22;
  const defaultPayment = region === 'IN' ? 7000 : 250;
  const defaultExtra = region === 'IN' ? 1500 : 50;

  const [balance, setBalance] = useState<number>(initialInput?.balance ?? defaultBalance);
  const [apr, setApr] = useState<number>(initialInput?.annualInterestRate ?? defaultApr);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(initialInput?.monthlyPayment ?? defaultPayment);
  const [extraPayment, setExtraPayment] = useState<number>(initialInput?.extraMonthlyPayment ?? defaultExtra);
  const [useMinPay] = useState<boolean>(initialInput?.useMinimumPayment ?? false);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const input: DebtPayoffInput = useMemo(
    () => ({
      balance,
      annualInterestRate: apr,
      monthlyPayment,
      extraMonthlyPayment: extraPayment,
      useMinimumPayment: useMinPay,
    }),
    [balance, apr, monthlyPayment, extraPayment, useMinPay]
  );

  const result = useMemo(() => executeDebtPayoff(input), [input]);

  const handleReset = () => {
    setBalance(defaultBalance);
    setApr(defaultApr);
    setMonthlyPayment(defaultPayment);
    setExtraPayment(defaultExtra);
    setShowSchedule(false);
  };

  const yearsPart = Math.floor(result.monthsToPayoff / 12);
  const monthsPart = result.monthsToPayoff % 12;

  return (
    <ToolShell tool={tool} onReset={handleReset}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Card Balance */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                Current Outstanding Debt / Balance
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step={region === 'IN' ? '5000' : '200'}
                  value={balance}
                  onChange={(e) => setBalance(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="500"
              max={region === 'IN' ? 1000000 : 50000}
              step={region === 'IN' ? 5000 : 250}
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* APR % */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-600" />
                Interest Rate (APR %)
              </label>
              <span className="text-sm font-bold text-slate-900">{apr}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="45"
              step="0.5"
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <span className="text-[11px] text-slate-500">
              Typical credit cards charge {region === 'IN' ? '36% to 42%' : '18% to 26%'} APR.
            </span>
          </div>

          {/* Monthly Payment */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Monthly Planned Payment
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(Math.max(0, Number(e.target.value)))}
                  className="w-24 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min={Math.round(balance * 0.02)}
              max={region === 'IN' ? 100000 : 5000}
              step={region === 'IN' ? 1000 : 50}
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
          </div>

          {/* Extra Snowball Payment */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-emerald-950 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Extra Snowball Payment / Month
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-300">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                  className="w-20 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={region === 'IN' ? 25000 : 1000}
              step={region === 'IN' ? 500 : 25}
              value={extraPayment}
              onChange={(e) => setExtraPayment(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-emerald-100 rounded-lg"
            />
            <span className="text-[11px] text-emerald-800">
              Even a small extra payment dramatically crushes compounding interest!
            </span>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Status Hero */}
          {result.isPayable ? (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                  Debt-Free Target
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  Active Payoff Plan
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {yearsPart > 0 ? `${yearsPart} yr ` : ''}
                  {monthsPart > 0 ? `${monthsPart} mos` : ''}
                  {yearsPart === 0 && monthsPart === 0 ? 'Less than 1 month' : ''}
                </span>
                <span className="text-xs text-indigo-200">
                  {result.monthsToPayoff} monthly payments of {formatCurrency(result.monthlyPaymentUsed)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
                <div className="flex flex-col">
                  <span className="text-indigo-300">Total Interest Charged</span>
                  <span className="text-base font-bold text-rose-300">
                    +{formatCurrency(result.totalInterestPaid)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-indigo-300">Total Out of Pocket</span>
                  <span className="text-base font-bold text-white">
                    {formatCurrency(result.totalAmountPaid)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-rose-950 text-white shadow-lg flex flex-col gap-4 border border-rose-800">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <AlertOctagon className="w-5 h-5 text-rose-400" />
                Debt Balloon Warning: Payment Too Low!
              </div>
              <p className="text-xs text-rose-200 leading-relaxed">
                Your monthly payment of {formatCurrency(result.monthlyPaymentUsed)} is less than the monthly interest accrued ({formatCurrency(Math.round(balance * (apr / 100 / 12)))}). Under this payment, the debt will grow forever and will never be paid off.
              </p>
              <div className="text-xs text-white bg-rose-900/60 p-3 rounded-xl border border-rose-700">
                👉 Increase your monthly payment to at least{' '}
                <strong>{formatCurrency(Math.round(balance * (apr / 100 / 12) + 500))}</strong> to start paying down the principal.
              </div>
            </div>
          )}

          {/* Snowball Savings Card */}
          {result.savingsWithExtra && result.savingsWithExtra.interestSaved > 0 && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-xs">
                <span className="font-bold text-emerald-950">
                  🎉 Extra Payment Superpower:
                </span>
                <span className="text-emerald-900 leading-relaxed">
                  By adding an extra {formatCurrency(extraPayment)}/month, you save{' '}
                  <strong className="text-emerald-950 font-bold underline">
                    {formatCurrency(result.savingsWithExtra.interestSaved)}
                  </strong>{' '}
                  in interest and become completely debt-free{' '}
                  <strong className="text-emerald-950 font-bold">
                    {result.savingsWithExtra.monthsSaved} months sooner!
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Payoff Schedule Accordion */}
          {result.schedule.length > 0 && (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                <span className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  {showSchedule ? 'Hide' : 'Inspect'} Debt Payoff Schedule
                </span>
                <span className="text-slate-400 font-mono">{showSchedule ? '▲' : '▼'}</span>
              </button>

              {showSchedule && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs max-h-80 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Month</th>
                        <th className="py-2 px-3">Payment</th>
                        <th className="py-2 px-3">Principal</th>
                        <th className="py-2 px-3">Interest</th>
                        <th className="py-2 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {result.schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-50/80">
                          <td className="py-1.5 px-3 font-sans font-medium text-slate-800">Mo {row.month}</td>
                          <td className="py-1.5 px-3 text-slate-700">{formatCurrency(row.payment)}</td>
                          <td className="py-1.5 px-3 text-emerald-600 font-medium">{formatCurrency(row.principal)}</td>
                          <td className="py-1.5 px-3 text-rose-500">{formatCurrency(row.interest)}</td>
                          <td className="py-1.5 px-3 text-right font-bold text-slate-900">{formatCurrency(row.remainingBalance)}</td>
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
