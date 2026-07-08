/**
 * Currency formatting and parsing utilities.
 * Zero external dependency — uses Intl.NumberFormat.
 */

import { FALLBACK_EXCHANGE_RATES } from './constants';
import { LOCALE_CONFIGS, getLocaleConfig } from './locales';

// ─── Currency Symbol Map ────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  SGD: 'S$',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  HKD: 'HK$',
  MYR: 'RM',
  THB: '฿',
  AED: 'د.إ',
};

/**
 * Get the symbol for a currency code.
 */
export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code.toUpperCase();
}

/**
 * Format a numeric amount as currency string.
 *
 * @param amount - The numeric value to format
 * @param currencyCode - ISO 4217 currency code (default: 'USD')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(150000, 'INR')    // "₹1,50,000"
 * formatCurrency(1500.5, 'USD')    // "$1,500.50"
 * formatCurrency(1000000, 'INR', { compact: true }) // "₹10L"
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  options?: {
    compact?: boolean;
    decimals?: number;
    locale?: string;
  }
): string {
  const code = currencyCode.toUpperCase();

  // Determine the locale string to use
  let localeStr = options?.locale;
  if (!localeStr) {
    // Infer from currency
    if (code === 'INR') localeStr = 'en-IN';
    else if (code === 'JPY') localeStr = 'ja-JP';
    else localeStr = 'en-US';
  }

  // Compact Indian notation (L, Cr)
  if (options?.compact && code === 'INR') {
    const symbol = getCurrencySymbol(code);
    if (Math.abs(amount) >= 10000000) {
      return `${symbol}${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `${symbol}${(amount / 100000).toFixed(2)}L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
  }

  // Compact Western notation (K, M, B)
  if (options?.compact && code !== 'INR') {
    const symbol = getCurrencySymbol(code);
    if (Math.abs(amount) >= 1000000000) {
      return `${symbol}${(amount / 1000000000).toFixed(2)}B`;
    }
    if (Math.abs(amount) >= 1000000) {
      return `${symbol}${(amount / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(amount) >= 1000) {
      return `${symbol}${(amount / 1000).toFixed(1)}K`;
    }
  }

  try {
    const formatter = new Intl.NumberFormat(localeStr, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: options?.decimals ?? (code === 'JPY' ? 0 : 0),
      maximumFractionDigits: options?.decimals ?? (code === 'JPY' ? 0 : 2),
    });
    return formatter.format(amount);
  } catch {
    // Fallback if Intl doesn't support the currency
    const symbol = getCurrencySymbol(code);
    return `${symbol}${amount.toLocaleString()}`;
  }
}

/**
 * Parse a currency input string to a number.
 * Handles symbols, commas (Indian and Western), shorthand (k, lakh, crore).
 *
 * @param input - The string to parse
 * @param currencyCode - Expected currency (used for locale-aware parsing)
 * @returns Parsed numeric value, or null if unparseable
 *
 * @example
 * parseCurrencyInput('$1,500.50', 'USD')   // 1500.5
 * parseCurrencyInput('₹1,50,000', 'INR')   // 150000
 * parseCurrencyInput('1.5 lakh', 'INR')    // 150000
 * parseCurrencyInput('20k', 'USD')         // 20000
 */
export function parseCurrencyInput(input: string, currencyCode: string = 'USD'): number | null {
  let s = input.trim();

  // Remove currency symbols and codes
  s = s.replace(/^[\$₹€£¥]+\s*/, '');
  s = s.replace(/\s*(USD|INR|EUR|GBP|JPY|SGD|AUD|CAD)\s*/gi, '');

  // Handle Indian notation
  const lakhMatch = s.match(/^([\d,.]+)\s*(?:lakh|lakhs|lac|lacs|l)$/i);
  if (lakhMatch) {
    const base = parseFloat(lakhMatch[1].replace(/,/g, ''));
    return isNaN(base) ? null : base * 100000;
  }

  const croreMatch = s.match(/^([\d,.]+)\s*(?:crore|crores|cr)$/i);
  if (croreMatch) {
    const base = parseFloat(croreMatch[1].replace(/,/g, ''));
    return isNaN(base) ? null : base * 10000000;
  }

  // Handle shorthand
  const shorthand = s.match(/^([\d,.]+)\s*([kmbt])$/i);
  if (shorthand) {
    const base = parseFloat(shorthand[1].replace(/,/g, ''));
    if (isNaN(base)) return null;
    const mult: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
    return base * (mult[shorthand[2].toLowerCase()] ?? 1);
  }

  // Strip commas and parse
  const cleaned = s.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Convert an amount from one currency to another using fallback rates.
 * This uses static rates and is NOT suitable for real-time trading.
 *
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount, or null if rate is unknown
 */
export function convertCurrency(amount: number, from: string, to: string): number | null {
  const fromRate = FALLBACK_EXCHANGE_RATES[from.toUpperCase()];
  const toRate = FALLBACK_EXCHANGE_RATES[to.toUpperCase()];
  if (fromRate === undefined || toRate === undefined) return null;
  // Convert to USD first, then to target
  const inUsd = amount / fromRate;
  return inUsd * toRate;
}

/**
 * Get the exchange rate between two currencies (fallback/static).
 */
export function getExchangeRate(from: string, to: string): number | null {
  const fromRate = FALLBACK_EXCHANGE_RATES[from.toUpperCase()];
  const toRate = FALLBACK_EXCHANGE_RATES[to.toUpperCase()];
  if (fromRate === undefined || toRate === undefined) return null;
  return toRate / fromRate;
}

/**
 * Get all supported currency codes.
 */
export function getSupportedCurrencies(): string[] {
  return Object.keys(FALLBACK_EXCHANGE_RATES);
}

/**
 * Format a number with proper grouping for a locale.
 * Unlike formatCurrency, this does NOT add a currency symbol.
 */
export function formatNumber(
  amount: number,
  localeCode: string = 'global',
  decimals: number = 0
): string {
  const config = getLocaleConfig(localeCode);
  try {
    return new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: true,
    }).format(amount);
  } catch {
    return amount.toLocaleString();
  }
}
