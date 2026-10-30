import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface FinancialDisclaimerProps {
  className?: string;
  variant?: 'panel' | 'footer';
}

export const FinancialDisclaimer: React.FC<FinancialDisclaimerProps> = ({
  className = '',
  variant = 'panel',
}) => {
  if (variant === 'footer') {
    return (
      <div className={`text-[11px] text-slate-500 leading-relaxed ${className}`}>
        <p>
          <strong className="text-slate-700 font-semibold">Financial & Legal Disclaimer:</strong> All calculators, tax models, and financial projection utilities on this site are provided strictly for educational and informational purposes. They do not constitute financial, investment, tax, legal, or accounting advice. While calculations follow standard formulas and published statutory brackets, tax regulations and bank lending rules change frequently. Consult a certified financial planner (CFP), chartered accountant (CA/CPA), or qualified legal advisor before making financial decisions.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-3 ${className}`}
    >
      <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-slate-800">
          Financial, Tax & Legal Notice
        </span>
        <p>
          Calculations, estimates, and tax projections provided by this tool are for informational and educational purposes only. They do not constitute financial, investment, tax, legal, or accounting advice. Statutory brackets, deduction rules, bank compounding schedules, and interest rates are subject to change and vary by jurisdiction. You should consult a licensed financial advisor, certified tax professional, or legal counsel before executing financial commitments.
        </p>
      </div>
    </div>
  );
};
