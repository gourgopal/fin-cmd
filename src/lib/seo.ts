import { Metadata } from 'next';
import { CalculatorConfig } from './calculators';
import { BASE_URL } from './constants';

export function generateCalculatorMetadata(config: CalculatorConfig, locale: string): Metadata {
  return {
    title: config.seo.title,
    description: config.seo.description,
    keywords: config.seo.keywords,
    openGraph: {
      title: config.seo.title,
      description: config.seo.description,
      type: 'website',
      url: `${BASE_URL}/${locale}/calculators/${config.slug}`
    }
  };
}

export function generateHreflangAlternates(slug: string, availableLocales: string[]) {
  const languages: Record<string, string> = {};
  for (const loc of availableLocales) {
    // Map internal locale code to standard hreflang code
    const langCode = loc === 'in' ? 'en-IN' : loc === 'us' ? 'en-US' : 'x-default';
    languages[langCode] = `${BASE_URL}/${loc}/calculators/${slug}`;
  }
  return { languages };
}

export function generateJsonLd(config: CalculatorConfig, locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: config.title,
    description: config.seo.description,
    url: `${BASE_URL}/${locale}/calculators/${config.slug}`
  };
}
