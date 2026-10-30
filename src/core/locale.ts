export type RegionCode = 'IN' | 'US';

export interface RegionConfig {
  code: RegionCode;
  name: string;
  currency: 'INR' | 'USD';
  currencySymbol: '₹' | '$';
  locale: 'en-IN' | 'en-US';
  flag: string;
  numberingSystem: 'indian' | 'western';
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  IN: {
    code: 'IN',
    name: 'India (₹ INR)',
    currency: 'INR',
    currencySymbol: '₹',
    locale: 'en-IN',
    flag: '🇮🇳',
    numberingSystem: 'indian',
  },
  US: {
    code: 'US',
    name: 'United States ($ USD)',
    currency: 'USD',
    currencySymbol: '$',
    locale: 'en-US',
    flag: '🇺🇸',
    numberingSystem: 'western',
  },
};

/**
 * 100% Client-Side Private Detection of user's region:
 * 1. Checks user saved preference in localStorage
 * 2. Checks browser timezone (Asia/Kolkata -> IN)
 * 3. Checks browser language (en-IN -> IN)
 * 4. Defaults to US
 */
export function detectUserRegion(): RegionCode {
  if (typeof window === 'undefined') return 'US';

  // 1. Saved preference
  const saved = localStorage.getItem('tools_user_region');
  if (saved === 'IN' || saved === 'US') {
    return saved;
  }

  try {
    // 2. Timezone detection
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kolkata') || tz.includes('Calcutta')) {
      return 'IN';
    }

    // 3. Language preference
    const langs = navigator.languages || [navigator.language || ''];
    for (const lang of langs) {
      if (lang.toLowerCase().includes('-in') || lang.toLowerCase() === 'hi') {
        return 'IN';
      }
    }
  } catch {
    // Fallback if APIs are restricted
  }

  // 4. Default to US for any other region
  return 'US';
}

export function saveUserRegion(region: RegionCode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tools_user_region', region);
  }
}

/**
 * Format currency with full locale rules (Lakhs/Crores for India, Thousands/Millions for US)
 */
export function formatCurrency(amount: number, region: RegionCode, maximumFractionDigits = 0): string {
  const config = REGIONS[region] || REGIONS.US;
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format plain number with region-specific grouping
 */
export function formatNumber(amount: number, region: RegionCode, maximumFractionDigits = 0): string {
  const config = REGIONS[region] || REGIONS.US;
  return new Intl.NumberFormat(config.locale, {
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Compact readable financial format (e.g. ₹50 Lakhs / ₹1.5 Cr vs $500K / $1.5M)
 */
export function formatCompactCurrency(amount: number, region: RegionCode): string {
  const symbol = REGIONS[region].currencySymbol;
  const abs = Math.abs(amount);

  if (region === 'IN') {
    if (abs >= 10000000) {
      return `${symbol}${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (abs >= 100000) {
      return `${symbol}${(amount / 100000).toFixed(2).replace(/\.00$/, '')} L`;
    }
    if (abs >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1).replace(/\.0$/, '')} k`;
    }
    return `${symbol}${Math.round(amount)}`;
  } else {
    if (abs >= 1000000000) {
      return `${symbol}${(amount / 1000000000).toFixed(2).replace(/\.00$/, '')}B`;
    }
    if (abs >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
    }
    if (abs >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return `${symbol}${Math.round(amount)}`;
  }
}
