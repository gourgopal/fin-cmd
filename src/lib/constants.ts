export const APP_NAME = 'FinCalc';
export const APP_DESCRIPTION = 'Global Financial Super-App for Hyper-Localized Calculations';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
export const DEFAULT_LOCALE = 'global';
export const FALLBACK_EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.2,
  CNY: 7.23,
  SGD: 1.35,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.90,
  HKD: 7.82,
  MYR: 4.74,
  THB: 36.6,
  AED: 3.67,
};
