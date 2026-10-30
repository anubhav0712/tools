import React, { useEffect, useRef } from 'react';
import {
  X,
  Sliders,
  DollarSign,
  TrendingUp,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useSharedProfile } from '../core/shared-profile-context';
import { useRegion } from '../core/locale-context';
import { Button } from '../design-system/button';

export interface SharedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SharedProfileModal: React.FC<SharedProfileModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { profile, updateProfile, resetProfile } = useSharedProfile();
  const { region, config, formatCurrency } = useRegion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-slate-900/40 backdrop:backdrop-blur-xs p-0 bg-transparent max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200 open:animate-in open:fade-in open:zoom-in-95"
    >
      <div className="bg-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Shared Financial Profile
              </h2>
              <p className="text-xs text-slate-500">
                Shared across all calculators • 100% private on your device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 text-xs text-slate-700">
          {/* Privacy Notice Banner */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Values you set here auto-populate across the Salary, Retirement, SIP, and Loan calculators so you don't have to retype them.
            </span>
          </div>

          {/* Annual Income */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
              Annual Gross Income ({region === 'IN' ? 'CTC in INR' : 'Gross Pay in USD'})
            </label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <span className="font-bold text-slate-500">{config.currencySymbol}</span>
              <input
                type="number"
                min="0"
                step={region === 'IN' ? 50000 : 2500}
                value={profile.annualGrossIncome}
                onChange={(e) => updateProfile({ annualGrossIncome: Math.max(0, Number(e.target.value)) })}
                className="w-full bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              ~ {formatCurrency(Math.round(profile.annualGrossIncome / 12))}/month
            </span>
          </div>

          {/* Monthly Savings & Living Expenses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Monthly Living Expenses</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-bold text-slate-500">{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step={region === 'IN' ? 2000 : 100}
                  value={profile.monthlyExpenses}
                  onChange={(e) => updateProfile({ monthlyExpenses: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-transparent font-mono font-medium text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-800">Monthly Savings Target</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="font-bold text-slate-500">{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  step={region === 'IN' ? 2000 : 100}
                  value={profile.monthlySavings}
                  onChange={(e) => updateProfile({ monthlySavings: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-transparent font-mono font-medium text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Economic Assumptions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Shared Economic Return & Inflation Assumptions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">Inflation %</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.expectedInflationRate}
                  onChange={(e) => updateProfile({ expectedInflationRate: Number(e.target.value) })}
                  className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">Equity Returns %</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.expectedEquityReturn}
                  onChange={(e) => updateProfile({ expectedEquityReturn: Number(e.target.value) })}
                  className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900 font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-600">Debt/FD Returns %</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.expectedDebtReturn}
                  onChange={(e) => updateProfile({ expectedDebtReturn: Number(e.target.value) })}
                  className="bg-white border border-slate-200 rounded-lg p-2 font-mono text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={resetProfile}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <Button variant="primary" size="sm" onClick={onClose} className="gap-1.5">
            <Check className="w-4 h-4" />
            <span>Apply to All Tools</span>
          </Button>
        </div>
      </div>
    </dialog>
  );
};
