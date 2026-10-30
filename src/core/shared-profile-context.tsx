import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRegion } from './locale-context';
import {
  type SharedFinancialProfile,
  type AdvancedCalculatorSettings,
  loadSavedProfile,
  saveSharedProfile,
  getDefaultProfileForRegion,
} from './shared-profile';

interface SharedProfileContextType {
  profile: SharedFinancialProfile;
  updateProfile: (updates: Partial<SharedFinancialProfile>) => void;
  updateAdvancedSettings: (updates: Partial<AdvancedCalculatorSettings>) => void;
  resetProfile: () => void;
}

const SharedProfileContext = createContext<SharedProfileContextType | undefined>(undefined);

export const SharedProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { region } = useRegion();
  const [profile, setProfileState] = useState<SharedFinancialProfile>(() => loadSavedProfile(region));

  // Sync region change if user toggles region in header
  useEffect(() => {
    setProfileState((prev) => {
      if (prev.region === region) return prev;
      const newDefaults = getDefaultProfileForRegion(region);
      const updated: SharedFinancialProfile = {
        ...newDefaults,
        region,
      };
      saveSharedProfile(updated);
      return updated;
    });
  }, [region]);

  const updateProfile = (updates: Partial<SharedFinancialProfile>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...updates };
      saveSharedProfile(next);
      return next;
    });
  };

  const updateAdvancedSettings = (updates: Partial<AdvancedCalculatorSettings>) => {
    setProfileState((prev) => {
      const next: SharedFinancialProfile = {
        ...prev,
        advancedSettings: {
          ...prev.advancedSettings,
          ...updates,
        },
      };
      saveSharedProfile(next);
      return next;
    });
  };

  const resetProfile = () => {
    const defaults = getDefaultProfileForRegion(region);
    setProfileState(defaults);
    saveSharedProfile(defaults);
  };

  return (
    <SharedProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updateAdvancedSettings,
        resetProfile,
      }}
    >
      {children}
    </SharedProfileContext.Provider>
  );
};

export function useSharedProfile(): SharedProfileContextType {
  const ctx = useContext(SharedProfileContext);
  if (!ctx) {
    throw new Error('useSharedProfile must be used within a SharedProfileProvider');
  }
  return ctx;
}
