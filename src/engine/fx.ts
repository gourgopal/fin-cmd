/**
 * @fileoverview Currency exchange module with live rates and static fallback.
 *
 * Live rates: fetched from Frankfurter API (https://api.frankfurter.app)
 *   - Free, no API key required
 *   - ECB reference rates, updated daily
 *
 * Fallback rates: hardcoded approximate rates as of July 2025
 * Cache: 1-hour TTL to avoid excessive API calls
 */

// ─── Types ──────────────────────────────────────────────────────────────

/** Supported currency codes. */
export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP' | 'SGD' | 'THB' | 'CNY' | 'JPY' | 'AUD' | 'CAD';

/** Exchange rate map: currency code → rate relative to base currency. */
export interface ExchangeRateMap {
  base: CurrencyCode;
  date: string;
  rates: Partial<Record<CurrencyCode, number>>;
}

/** Cache entry with TTL. */
interface CacheEntry {
  data: ExchangeRateMap;
  timestamp: number;
}

// ─── Constants ──────────────────────────────────────────────────────────

/** Cache TTL: 1 hour in milliseconds. */
const CACHE_TTL_MS = 60 * 60 * 1000;

/** Frankfurter API base URL. */
const API_BASE = 'https://api.frankfurter.app';

/**
 * Static fallback rates (base: USD) as of approximately July 2025.
 * Used when the API is unavailable.
 */
export const FALLBACK_RATES: ExchangeRateMap = {
  base: 'USD',
  date: '2025-07-01',
  rates: {
    USD: 1.0,
    INR: 83.50,
    EUR: 0.92,
    GBP: 0.79,
    SGD: 1.34,
    THB: 35.50,
    CNY: 7.25,
    JPY: 157.0,
    AUD: 1.53,
    CAD: 1.36,
  },
};

// ─── Cache ──────────────────────────────────────────────────────────────

/** In-memory rate cache. */
let rateCache: CacheEntry | null = null;

/**
 * Check if the cache is still valid.
 * @returns true if cache exists and is within TTL
 */
function isCacheValid(): boolean {
  if (!rateCache) return false;
  return (Date.now() - rateCache.timestamp) < CACHE_TTL_MS;
}

// ─── API Fetch ──────────────────────────────────────────────────────────

/**
 * Fetch latest exchange rates from Frankfurter API.
 *
 * Endpoint: GET https://api.frankfurter.app/latest?from=USD&to=INR,EUR,GBP,SGD,THB,CNY,JPY,AUD,CAD
 *
 * Falls back to static rates if the fetch fails (network error, timeout, etc.).
 *
 * @param base - Base currency (default: 'USD')
 * @returns ExchangeRateMap with rates relative to base
 *
 * @example
 * const rates = await fetchExchangeRates('USD');
 * console.log(rates.rates.INR); // e.g., 83.50
 */
export async function fetchExchangeRates(
  base: CurrencyCode = 'USD',
): Promise<ExchangeRateMap> {
  // Return cached rates if valid
  if (isCacheValid() && rateCache!.data.base === base) {
    return rateCache!.data;
  }

  const targets: CurrencyCode[] = ['USD', 'INR', 'EUR', 'GBP', 'SGD', 'THB', 'CNY', 'JPY', 'AUD', 'CAD'];
  const filteredTargets = targets.filter(c => c !== base);
  const url = `${API_BASE}/latest?from=${base}&to=${filteredTargets.join(',')}`;

  try {
    // Use dynamic fetch (available in Node 18+ and all modern runtimes)
    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json() as {
      base: string;
      date: string;
      rates: Record<string, number>;
    };

    const rateMap: ExchangeRateMap = {
      base: data.base as CurrencyCode,
      date: data.date,
      rates: { [data.base]: 1.0 } as Partial<Record<CurrencyCode, number>>,
    };

    for (const [code, rate] of Object.entries(data.rates)) {
      (rateMap.rates as Record<string, number>)[code] = rate;
    }

    // Update cache
    rateCache = { data: rateMap, timestamp: Date.now() };

    return rateMap;
  } catch {
    // Fallback to static rates
    console.warn('FX API unavailable, using fallback rates');

    // If base is not USD, convert fallback rates
    if (base !== 'USD') {
      return convertFallbackBase(base);
    }

    return FALLBACK_RATES;
  }
}

/**
 * Convert fallback rates to a different base currency.
 * @param newBase - Target base currency
 * @returns ExchangeRateMap rebased to newBase
 */
function convertFallbackBase(newBase: CurrencyCode): ExchangeRateMap {
  const usdRates = FALLBACK_RATES.rates;
  const newBaseInUSD = usdRates[newBase];

  if (!newBaseInUSD) {
    throw new Error(`Unsupported currency: ${newBase}`);
  }

  const rebasedRates: Partial<Record<CurrencyCode, number>> = {};
  for (const [code, rate] of Object.entries(usdRates) as [CurrencyCode, number][]) {
    rebasedRates[code] = Math.round((rate / newBaseInUSD) * 10000) / 10000;
  }

  return {
    base: newBase,
    date: FALLBACK_RATES.date,
    rates: rebasedRates,
  };
}

// ─── Currency Conversion ────────────────────────────────────────────────

/**
 * Convert an amount between two currencies.
 *
 * Uses cached rates if available, otherwise fetches fresh rates.
 * Falls back to static rates if API is unavailable.
 *
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount in target currency
 *
 * @example
 * const inrAmount = await convertCurrency(1000, 'USD', 'INR');
 * // ≈ 83,500
 */
export async function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): Promise<number> {
  if (from === to) return amount;

  const rates = await fetchExchangeRates(from);
  const targetRate = rates.rates[to];

  if (targetRate === undefined) {
    throw new Error(`Exchange rate not available for ${from} → ${to}`);
  }

  return Math.round(amount * targetRate * 100) / 100;
}

/**
 * Synchronous currency conversion using fallback (static) rates only.
 * Use when async is not possible or for quick estimates.
 *
 * @param amount - Amount in source currency
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Converted amount using static fallback rates
 */
export function convertCurrencySync(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return amount;

  const fromRate = FALLBACK_RATES.rates[from];
  const toRate = FALLBACK_RATES.rates[to];

  if (!fromRate || !toRate) {
    throw new Error(`Fallback rate not available for ${from} → ${to}`);
  }

  // Convert via USD as intermediate
  const amountInUSD = amount / fromRate;
  return Math.round(amountInUSD * toRate * 100) / 100;
}

/**
 * Clear the exchange rate cache.
 * Useful for testing or forcing a fresh fetch.
 */
export function clearRateCache(): void {
  rateCache = null;
}
