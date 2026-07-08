export interface LocaleConfig {
  code: string;        // 'us', 'in', 'global'
  name: string;        // 'United States', 'India', 'Global'
  currency: string;    // 'USD', 'INR'
  currencySymbol: string;
  flag: string;        // emoji flag
  locale: string;      // 'en-US', 'en-IN'
  inflationRate: number;
  numberFormat: Intl.NumberFormatOptions;
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  {
    code: 'global',
    name: 'Global',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🌍',
    locale: 'en-US',
    inflationRate: 2.5,
    numberFormat: { style: 'currency', currency: 'USD' }
  },
  {
    code: 'us',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
    locale: 'en-US',
    inflationRate: 3.0,
    numberFormat: { style: 'currency', currency: 'USD' }
  },
  {
    code: 'in',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    locale: 'en-IN',
    inflationRate: 5.5,
    numberFormat: { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }
  }
];

export const LOCALE_CONFIGS = SUPPORTED_LOCALES;

export function getLocaleConfig(code: string): LocaleConfig {
  return LOCALE_CONFIGS.find(l => l.code === code) || LOCALE_CONFIGS[0];
}
