import type { RegionCode } from './locale';

export interface AdvancedCalculatorSettings {
  // Salary Tax Advanced
  customStandardDeduction?: number;
  customCessRatePercent?: number;          // Default 4% in India
  customSection87aCeiling?: number;        // Default ₹7,00,000 in India
  customEpfContributionRate?: number;      // Default 12% of basic in India
  customProfessionalTaxAnnual?: number;    // Default ₹2,400 in India
  customSocialSecurityCap?: number;        // Default $168,600 in US
  customMedicareRatePercent?: number;      // Default 1.45% in US

  // Investment & Retirement Advanced
  adjustReturnsForInflation: boolean;      // Real return vs nominal return
  customSafeWithdrawalRatePercent: number; // Default 4% (Trinity Rule)
  mutualFundExpenseRatioPercent: number;   // Default 0.5%
  loanProcessingFeePercent: number;        // Default 0.5%
}

export interface SharedFinancialProfile {
  region: RegionCode;
  annualGrossIncome: number;
  indiaTaxRegime: 'new' | 'old';
  usFilingStatus: 'single' | 'married';
  usStateTaxRate: number;

  monthlySavings: number;
  monthlyExpenses: number;
  emergencyBufferMonths: number;

  expectedInflationRate: number;
  expectedEquityReturn: number;
  expectedDebtReturn: number;

  advancedSettings: AdvancedCalculatorSettings;
}

export function getDefaultProfileForRegion(region: RegionCode): SharedFinancialProfile {
  const isIndia = region === 'IN';

  return {
    region,
    annualGrossIncome: isIndia ? 1500000 : 95000,
    indiaTaxRegime: 'new',
    usFilingStatus: 'single',
    usStateTaxRate: 4.5,

    monthlySavings: isIndia ? 25000 : 1500,
    monthlyExpenses: isIndia ? 50000 : 4000,
    emergencyBufferMonths: 6,

    expectedInflationRate: isIndia ? 6.0 : 3.0,
    expectedEquityReturn: isIndia ? 12.0 : 9.5,
    expectedDebtReturn: isIndia ? 7.1 : 4.5,

    advancedSettings: {
      customStandardDeduction: isIndia ? 75000 : 14600,
      customCessRatePercent: 4.0,
      customSection87aCeiling: 700000,
      customEpfContributionRate: 12.0,
      customProfessionalTaxAnnual: 2400,
      customSocialSecurityCap: 168600,
      customMedicareRatePercent: 1.45,

      adjustReturnsForInflation: false,
      customSafeWithdrawalRatePercent: 4.0,
      mutualFundExpenseRatioPercent: 0.5,
      loanProcessingFeePercent: 0.5,
    },
  };
}

const STORAGE_KEY = 'tools_shared_financial_profile_v1';

export function loadSavedProfile(region: RegionCode): SharedFinancialProfile {
  if (typeof window === 'undefined') {
    return getDefaultProfileForRegion(region);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProfileForRegion(region);

    const parsed = JSON.parse(raw);
    const defaults = getDefaultProfileForRegion(parsed.region || region);
    return {
      ...defaults,
      ...parsed,
      advancedSettings: {
        ...defaults.advancedSettings,
        ...(parsed.advancedSettings || {}),
      },
    };
  } catch {
    return getDefaultProfileForRegion(region);
  }
}

export function saveSharedProfile(profile: SharedFinancialProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors in private modes
  }
}
