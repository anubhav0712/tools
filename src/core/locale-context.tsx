import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  RegionCode,
  RegionConfig,
  REGIONS,
  detectUserRegion,
  saveUserRegion,
  formatCurrency as baseFormatCurrency,
  formatNumber as baseFormatNumber,
  formatCompactCurrency,
} from './locale';

interface RegionContextType {
  region: RegionCode;
  config: RegionConfig;
  setRegion: (region: RegionCode) => void;
  formatCurrency: (amount: number, maximumFractionDigits?: number) => string;
  formatCompact: (amount: number) => string;
  formatNumber: (amount: number, maximumFractionDigits?: number) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegionState] = useState<RegionCode>(() => detectUserRegion());

  useEffect(() => {
    // Sync client-side detection on mount if needed
    const detected = detectUserRegion();
    setRegionState(detected);
  }, []);

  const handleSetRegion = (newRegion: RegionCode) => {
    setRegionState(newRegion);
    saveUserRegion(newRegion);
  };

  const config = REGIONS[region];

  const formatCurrency = (amount: number, maximumFractionDigits = 0) =>
    baseFormatCurrency(amount, region, maximumFractionDigits);

  const formatCompact = (amount: number) =>
    formatCompactCurrency(amount, region);

  const formatNumber = (amount: number, maximumFractionDigits = 0) =>
    baseFormatNumber(amount, region, maximumFractionDigits);

  return (
    <RegionContext.Provider
      value={{
        region,
        config,
        setRegion: handleSetRegion,
        formatCurrency,
        formatCompact,
        formatNumber,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}
