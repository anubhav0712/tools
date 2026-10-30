import React, { useState, useMemo } from 'react';
import { useRegion } from '../../core/locale-context';
import { useSharedProfile } from '../../core/shared-profile-context';
import { ToolShell } from '../../design-system/tool-shell';
import type { ToolComponentProps } from '../../core/types';
import {
  executeSalaryTax,
  type SalaryTaxInput,
  type SalaryTaxOutput,
  type IndiaTaxRegime,
  type UsFilingStatus,
} from './engine';
import {
  DollarSign,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Table as TableIcon,
  Percent,
  Sliders,
  BookOpen,
} from 'lucide-react';

export const SalaryTaxUI: React.FC<ToolComponentProps<SalaryTaxInput, SalaryTaxOutput>> = ({
  tool,
  initialInput,
}) => {
  const { region, config, formatCurrency } = useRegion();
  const { profile } = useSharedProfile();

  const defaultSalary = initialInput?.annualGrossSalary ?? (profile.annualGrossIncome || (region === 'IN' ? 1200000 : 85000));

  const [grossSalary, setGrossSalary] = useState<number>(defaultSalary);
  // India fields
  const [indiaRegime, setIndiaRegime] = useState<IndiaTaxRegime>(initialInput?.indiaRegime ?? profile.indiaTaxRegime ?? 'new');
  const [ded80c, setDed80c] = useState<number>(initialInput?.indiaDeductions80C ?? 150000);
  const [ded80d, setDed80d] = useState<number>(initialInput?.indiaDeductions80D ?? 25000);
  const [hra, setHra] = useState<number>(initialInput?.indiaHraDeduction ?? 100000);
  const [includeEpf, setIncludeEpf] = useState<boolean>(initialInput?.includeEpf ?? true);

  // US fields
  const [filingStatus, setFilingStatus] = useState<UsFilingStatus>(initialInput?.usFilingStatus ?? profile.usFilingStatus ?? 'single');
  const [stateTaxRate, setStateTaxRate] = useState<number>(initialInput?.usStateTaxRate ?? profile.usStateTaxRate ?? 4.5);
  const [preTaxDeduction, setPreTaxDeduction] = useState<number>(initialInput?.usPreTaxDeductions ?? 6000);

  // Advanced overrides state
  const [customStdDed, setCustomStdDed] = useState<number | undefined>(initialInput?.customStandardDeduction);
  const [customCess, setCustomCess] = useState<number | undefined>(initialInput?.customCessRatePercent);
  const [customRebate87a, setCustomRebate87a] = useState<number | undefined>(initialInput?.customSection87aCeiling);
  const [customEpf, setCustomEpf] = useState<number | undefined>(initialInput?.customEpfAnnual);
  const [customProfTax, setCustomProfTax] = useState<number | undefined>(initialInput?.customProfessionalTaxAnnual);
  const [customSsCap, setCustomSsCap] = useState<number | undefined>(initialInput?.customSocialSecurityCap);

  const [showBrackets, setShowBrackets] = useState<boolean>(false);

  const input: SalaryTaxInput = useMemo(
    () => ({
      region,
      annualGrossSalary: grossSalary,
      indiaRegime,
      indiaDeductions80C: ded80c,
      indiaDeductions80D: ded80d,
      indiaHraDeduction: hra,
      includeEpf,
      usFilingStatus: filingStatus,
      usStateTaxRate: stateTaxRate,
      usPreTaxDeductions: preTaxDeduction,
      customStandardDeduction: customStdDed,
      customCessRatePercent: customCess,
      customSection87aCeiling: customRebate87a,
      customEpfAnnual: customEpf,
      customProfessionalTaxAnnual: customProfTax,
      customSocialSecurityCap: customSsCap,
    }),
    [
      region,
      grossSalary,
      indiaRegime,
      ded80c,
      ded80d,
      hra,
      includeEpf,
      filingStatus,
      stateTaxRate,
      preTaxDeduction,
      customStdDed,
      customCess,
      customRebate87a,
      customEpf,
      customProfTax,
      customSsCap,
    ]
  );

  const result = useMemo(() => executeSalaryTax(input), [input]);

  const handleReset = () => {
    setGrossSalary(defaultSalary);
    setIndiaRegime('new');
    setDed80c(150000);
    setDed80d(25000);
    setHra(100000);
    setIncludeEpf(true);
    setFilingStatus('single');
    setStateTaxRate(4.5);
    setPreTaxDeduction(6000);
    setCustomStdDed(undefined);
    setCustomCess(undefined);
    setCustomRebate87a(undefined);
    setCustomEpf(undefined);
    setCustomProfTax(undefined);
    setCustomSsCap(undefined);
    setShowBrackets(false);
  };

  const takeHomePercent = result.annualGross > 0
    ? Math.round((result.annualTakeHome / result.annualGross) * 100)
    : 100;

  // ---------------- DOCUMENTATION CONTENT ----------------
  const documentationNode = (
    <div className="flex flex-col gap-6 text-slate-800 leading-relaxed text-sm">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Salary & In-Hand Pay Complete Guide ({region === 'IN' ? 'India' : 'United States'})
        </h3>
        <p className="text-slate-600">
          This calculator simulates your exact take-home paycheck by deducting income taxes, statutory social contributions (EPF or FICA), and local levies from your gross package.
        </p>
      </div>

      {region === 'IN' ? (
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col gap-2">
            <h4 className="font-bold text-indigo-950">1. Understanding CTC vs In-Hand Salary in India</h4>
            <p className="text-xs text-indigo-900">
              <strong>Cost to Company (CTC)</strong> is the total expenditure your employer spends on you annually. It includes components you don't receive directly in your bank account, such as Employer PF, Gratuity, Health Insurance, and bonuses.
              <strong> In-Hand (Net) Salary</strong> is what actually lands in your bank account after Income Tax (TDS), Employee PF (12%), and Professional Tax (₹200/mo).
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-slate-900">2. New Tax Regime vs Old Tax Regime (Budget 2024 / FY 2024-25 & 2025-26)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2">
                <span className="font-bold text-indigo-700">New Tax Regime (Default)</span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  <li><strong>Standard Deduction:</strong> ₹75,000 for salaried individuals.</li>
                  <li><strong>Section 87A Rebate:</strong> If your taxable income is up to ₹7,00,000 (meaning gross salary up to <strong>₹7,75,000</strong>), your tax is <strong>₹0 (Zero)</strong>.</li>
                  <li>Lower, concessional slab rates: 3-7L at 5%, 7-10L at 10%, 10-12L at 15%, 12-15L at 20%, above 15L at 30%.</li>
                  <li>No paperwork required; deductions under 80C or 80D are not needed.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col gap-2">
                <span className="font-bold text-slate-700">Old Tax Regime</span>
                <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                  <li><strong>Standard Deduction:</strong> ₹50,000.</li>
                  <li>Allows claiming <strong>Section 80C</strong> (up to ₹1,50,000 for ELSS, PPF, EPF, Life Insurance).</li>
                  <li>Allows <strong>Section 80D</strong> (Health Insurance up to ₹25,000 or ₹50,000).</li>
                  <li>Allows <strong>HRA (House Rent Allowance)</strong> and Home Loan Interest exemption (up to ₹2,00,000).</li>
                  <li>Best suited for individuals with heavy home loans and high rent payments exceeding ₹3-4 Lakhs/yr.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-900">3. statutory Deductions</h4>
            <p className="text-xs text-slate-600">
              - <strong>Employee Provident Fund (EPF):</strong> 12% of basic salary goes into your government-backed EPF retirement account earning ~8.25% tax-free interest.<br />
              - <strong>Health & Education Cess:</strong> 4% added to the calculated income tax.<br />
              - <strong>Professional Tax:</strong> State-level tax, typically capped at ₹2,400/year (₹200/month).
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col gap-2">
            <h4 className="font-bold text-indigo-950">1. Understanding US Paycheck Deductions</h4>
            <p className="text-xs text-indigo-900">
              In the United States, your gross pay is subject to three primary layers of withholdings: <strong>Federal Income Tax</strong>, <strong>FICA (Social Security & Medicare)</strong>, and <strong>State / Local Income Tax</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-slate-900">2. Federal Brackets & Standard Deduction (2024)</h4>
            <div className="text-xs text-slate-600 space-y-2">
              <p>
                - <strong>Standard Deduction:</strong> The IRS automatically excludes <strong>$14,600</strong> for Single filers and <strong>$29,200</strong> for Married Filing Jointly before any income tax is computed.
              </p>
              <p>
                - <strong>Marginal Tax Brackets:</strong> Federal tax uses progressive brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%). Only the dollars within each bracket are taxed at that bracket's rate.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-900">3. FICA Taxes (Mandatory)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              - <strong>Social Security:</strong> 6.2% on wages up to the annual wage base limit of <strong>$168,600</strong> (2024 limit). Wages above this cap are 0% Social Security.<br />
              - <strong>Medicare:</strong> 1.45% on all earnings with no cap. High earners pay an additional 0.9% Medicare surtax on earnings over $200k (Single) or $250k (Married).
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="font-bold text-slate-900">4. Pre-Tax 401(k) and HSA Benefits</h4>
            <p className="text-xs text-slate-600">
              Contributing to a traditional 401(k) (up to $23,000 for 2024) or HSA lowers your taxable income dollar-for-dollar, shielding your top marginal tax bracket and lowering your effective tax rate.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  // ---------------- ADVANCED SETTINGS CONTENT ----------------
  const advancedSettingsNode = (
    <div className="flex flex-col gap-6 text-xs text-slate-700">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          Advanced Salary & Tax Settings Override
        </h3>
        <p className="text-slate-500">
          Modify statutory rules, standard deduction caps, and custom levies to match specific regional changes or your employer's custom salary structure.
        </p>
      </div>

      {region === 'IN' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-800">
              Custom Standard Deduction ({config.currencySymbol})
            </label>
            <input
              type="number"
              placeholder="Default: ₹75,000 (New) / ₹50,000 (Old)"
              value={customStdDed ?? ''}
              onChange={(e) => setCustomStdDed(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500">
              Override standard deduction for future budget announcements.
            </span>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-800">
              Custom Health & Education Cess (%)
            </label>
            <input
              type="number"
              step="0.5"
              placeholder="Default: 4.0%"
              value={customCess ?? ''}
              onChange={(e) => setCustomCess(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500">Standard cess on income tax.</span>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-800">
              Section 87A Tax Rebate Limit ({config.currencySymbol})
            </label>
            <input
              type="number"
              placeholder="Default: ₹7,00,000"
              value={customRebate87a ?? ''}
              onChange={(e) => setCustomRebate87a(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500">
              Zero tax rebate limit (taxable income threshold).
            </span>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-800">
              Annual Professional Tax ({config.currencySymbol})
            </label>
            <input
              type="number"
              placeholder="Default: ₹2,400"
              value={customProfTax ?? ''}
              onChange={(e) => setCustomProfTax(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500">
              Set to ₹0 for states without professional tax.
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-800">
              Custom Standard Deduction ($)
            </label>
            <input
              type="number"
              placeholder="Default: $14,600 Single / $29,200 Married"
              value={customStdDed ?? ''}
              onChange={(e) => setCustomStdDed(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500">Or enter your itemized deductions.</span>
          </div>

          <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="font-semibold text-slate-800">
              Social Security Wage Cap ($)
            </label>
            <input
              type="number"
              placeholder="Default: $168,600"
              value={customSsCap ?? ''}
              onChange={(e) => setCustomSsCap(e.target.value ? Number(e.target.value) : undefined)}
              className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900"
            />
            <span className="text-[10px] text-slate-500">Max salary subject to 6.2% Social Security.</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setCustomStdDed(undefined);
            setCustomCess(undefined);
            setCustomRebate87a(undefined);
            setCustomEpf(undefined);
            setCustomProfTax(undefined);
            setCustomSsCap(undefined);
          }}
          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium underline"
        >
          Reset Advanced Settings to Government Defaults
        </button>

        <span className="text-emerald-700 font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Live calculation updated
        </span>
      </div>
    </div>
  );

  return (
    <ToolShell
      tool={tool}
      onReset={handleReset}
      inputData={input}
      documentation={documentationNode}
      advancedSettings={advancedSettingsNode}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Input Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Annual Gross Salary */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                {region === 'IN' ? 'Annual CTC / Gross Salary' : 'Annual Gross Pay'}
              </label>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>{config.currencySymbol}</span>
                <input
                  type="number"
                  min="0"
                  max="100000000"
                  step={region === 'IN' ? '50000' : '2000'}
                  value={grossSalary}
                  onChange={(e) => setGrossSalary(Math.max(0, Number(e.target.value)))}
                  className="w-28 text-right bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max={region === 'IN' ? 10000000 : 350000}
              step={region === 'IN' ? 50000 : 2500}
              value={grossSalary}
              onChange={(e) => setGrossSalary(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
            />
            <span className="text-[11px] text-slate-500 font-mono">
              Equivalent to {formatCurrency(Math.round(grossSalary / 12))}/month gross
            </span>
          </div>

          {/* Region Specific Controls */}
          {region === 'IN' ? (
            <div className="flex flex-col gap-4">
              {/* Regime Selector */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <label className="text-xs font-semibold text-slate-700">Income Tax Regime</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIndiaRegime('new')}
                    className={`text-xs p-3 rounded-xl border flex flex-col gap-1 text-left transition cursor-pointer ${
                      indiaRegime === 'new'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>New Tax Regime</span>
                      {indiaRegime === 'new' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Default. Standard deduction ₹75k + zero tax up to ₹7.75L
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIndiaRegime('old')}
                    className={`text-xs p-3 rounded-xl border flex flex-col gap-1 text-left transition cursor-pointer ${
                      indiaRegime === 'old'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span>Old Tax Regime</span>
                      {indiaRegime === 'old' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Allows 80C, 80D, and HRA rent deductions
                    </span>
                  </button>
                </div>
              </div>

              {/* Old Regime Exemptions if active */}
              {indiaRegime === 'old' && (
                <div className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-800">
                    Old Regime Deductions & Exemptions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-600">Section 80C (Max 1.5L)</label>
                      <input
                        type="number"
                        value={ded80c}
                        onChange={(e) => setDed80c(Number(e.target.value))}
                        className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-600">Section 80D (Health)</label>
                      <input
                        type="number"
                        value={ded80d}
                        onChange={(e) => setDed80d(Number(e.target.value))}
                        className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] text-slate-600">HRA Exemption</label>
                      <input
                        type="number"
                        value={hra}
                        onChange={(e) => setHra(Number(e.target.value))}
                        className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* EPF checkbox */}
              <label className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeEpf}
                  onChange={(e) => setIncludeEpf(e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                <span>Include Employee Provident Fund (EPF) deduction</span>
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Filing Status */}
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <label className="text-xs font-semibold text-slate-700">Tax Filing Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['single', 'married'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilingStatus(status)}
                      className={`text-xs py-2.5 px-3 rounded-xl border font-medium capitalize transition cursor-pointer ${
                        filingStatus === status
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {status === 'married' ? 'Married (Filing Jointly)' : 'Single'}
                    </button>
                  ))}
                </div>
              </div>

              {/* State Tax Rate & 401(k) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-indigo-600" />
                      State Tax Rate
                    </label>
                    <span className="text-sm font-bold text-slate-900">{stateTaxRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="13"
                    step="0.5"
                    value={stateTaxRate}
                    onChange={(e) => setStateTaxRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setStateTaxRate(0)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      0% (TX/FL/WA)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStateTaxRate(4.5)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      4.5% (Avg)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                    Pre-Tax 401(k) / HSA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30000"
                    step="500"
                    value={preTaxDeduction}
                    onChange={(e) => setPreTaxDeduction(Number(e.target.value))}
                    className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500">2024 max 401(k): $23,000</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
          {/* Main Take Home Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-lg flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">
                Estimated Net In-Hand Salary
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                {takeHomePercent}% Take-Home
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {formatCurrency(result.monthlyTakeHome)}
                </span>
                <span className="text-sm font-medium text-indigo-200">/ month</span>
              </div>
              <span className="text-xs text-indigo-300 font-mono">
                {formatCurrency(result.annualTakeHome)} per year • {formatCurrency(result.biweeklyTakeHome)} bi-weekly
              </span>
            </div>

            {/* Tax Rate Summary */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/60 text-xs">
              <div className="flex flex-col">
                <span className="text-indigo-300">Effective Tax Rate</span>
                <span className="text-base font-bold text-white">
                  {result.effectiveTaxRatePercent}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-indigo-300">Total Taxes & Deductions</span>
                <span className="text-base font-bold text-rose-300">
                  -{formatCurrency(result.totalDeductionsAnnual)}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions Breakdown Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Annual Deductions Breakdown
            </span>
            <div className="flex flex-col divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Standard Deduction</span>
                <span className="font-mono text-emerald-600 font-medium">
                  +{formatCurrency(result.breakdown.standardDeduction)} (tax-free)
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Income / Federal Tax</span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatCurrency(result.breakdown.incomeTax)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">
                  {region === 'IN' ? 'Health & Education Cess (4%)' : 'FICA (SS + Medicare) & State Tax'}
                </span>
                <span className="font-mono text-slate-900 font-medium">
                  {formatCurrency(result.breakdown.additionalTaxOrCess)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">
                  {region === 'IN' ? 'EPF & Professional Tax' : '401(k) / Pre-Tax Retirement'}
                </span>
                <span className="font-mono text-indigo-600 font-medium">
                  {formatCurrency(result.breakdown.retirementOrPf)}
                </span>
              </div>
            </div>
          </div>

          {/* Tax Slabs / Brackets Accordion */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowBrackets(!showBrackets)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600" />
                {showBrackets ? 'Hide' : 'Inspect'} Tax Bracket Breakdown
              </span>
              <span className="text-slate-400 font-mono">{showBrackets ? '▲' : '▼'}</span>
            </button>

            {showBrackets && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Bracket / Slab</th>
                      <th className="py-2.5 px-3">Taxable Chunk</th>
                      <th className="py-2.5 px-3 text-right">Tax Owed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {result.brackets.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{b.label}</td>
                        <td className="py-2 px-3 text-slate-600">{formatCurrency(b.taxableAmount)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-900">{formatCurrency(b.taxOwed)}</td>
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
