import { describe, it, expect, afterEach } from 'vitest';
import {
  formatCompactCurrency,
  detectUserRegion,
  saveUserRegion,
} from './locale';

describe('Locale Engine', () => {
  describe('formatCompactCurrency', () => {
    it('formats positive compact currency correctly in US', () => {
      expect(formatCompactCurrency(1500000, 'US')).toBe('$1.5M');
      expect(formatCompactCurrency(50000, 'US')).toBe('$50K');
      expect(formatCompactCurrency(2500000000, 'US')).toBe('$2.5B');
    });

    it('formats negative compact currency with minus before currency symbol in US', () => {
      expect(formatCompactCurrency(-50000, 'US')).toBe('-$50K');
      expect(formatCompactCurrency(-1500000, 'US')).toBe('-$1.5M');
    });

    it('formats positive compact currency correctly in India', () => {
      expect(formatCompactCurrency(15000000, 'IN')).toBe('₹1.5 Cr');
      expect(formatCompactCurrency(150000, 'IN')).toBe('₹1.5 L');
      expect(formatCompactCurrency(50000, 'IN')).toBe('₹50 k');
    });

    it('formats negative compact currency with minus before currency symbol in India', () => {
      expect(formatCompactCurrency(-150000, 'IN')).toBe('-₹1.5 L');
      expect(formatCompactCurrency(-15000000, 'IN')).toBe('-₹1.5 Cr');
    });

    it('falls back to US config when unknown region is passed', () => {
      expect(formatCompactCurrency(50000, 'UNKNOWN' as any)).toBe('$50K');
    });
  });

  describe('Storage resilience', () => {
    const originalLocalStorage = globalThis.localStorage;

    afterEach(() => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('detectUserRegion handles localStorage errors gracefully', () => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('SecurityError: access denied');
          },
          setItem: () => {},
        },
        writable: true,
      });

      expect(() => detectUserRegion()).not.toThrow();
    });

    it('saveUserRegion handles localStorage errors gracefully', () => {
      Object.defineProperty(globalThis, 'localStorage', {
        value: {
          getItem: () => null,
          setItem: () => {
            throw new Error('SecurityError: access denied');
          },
        },
        writable: true,
      });

      expect(() => saveUserRegion('IN')).not.toThrow();
    });
  });
});
