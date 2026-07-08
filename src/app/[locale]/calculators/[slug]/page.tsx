import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES } from '../../../../lib/locales';
import { generateCalculatorMetadata, generateHreflangAlternates } from '../../../../lib/seo';
import { CalculatorShell } from '../../../../components/calculator/CalculatorShell';

// Dynamic import of the large config file so it's not in the main bundle unnecessarily,
// though in Next App Router Server Components this is less of an issue.
import { getCalculatorConfig, getAllCalculatorSlugs } from './configHelper';

export async function generateStaticParams() {
  const slugs = getAllCalculatorSlugs();
  const params: { locale: string; slug: string }[] = [];
  
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of slugs) {
      params.push({ locale: locale.code, slug });
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const config = getCalculatorConfig(slug);
  if (!config || !config.locales.includes(locale)) return {};
  
  const meta = generateCalculatorMetadata(config, locale);
  meta.alternates = generateHreflangAlternates(slug, config.locales);
  
  return meta;
}

export default async function CalculatorPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const config = getCalculatorConfig(slug);
  
  if (!config || !config.locales.includes(locale)) {
    notFound();
  }

  return (
    <div className="w-full h-full max-w-none flex flex-col items-center">
      <h1 className="sr-only">{config.title}</h1>

      <Suspense fallback={<div className="h-96 w-full animate-pulse bg-[var(--bg-secondary)] rounded-2xl"></div>}>
        <CalculatorShell config={config} locale={locale} />
      </Suspense>
      
      {/* Educational Content / SEO text could go here below the calculator */}
    </div>
  );
}
