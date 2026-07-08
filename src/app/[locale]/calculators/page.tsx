import { getLocaleConfig, SUPPORTED_LOCALES } from "../../../lib/locales";
import { CALCULATOR_REGISTRY, getCategories } from "../../../lib/calculators";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale: locale.code }));
}

export default async function CalculatorsDirectoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const config = getLocaleConfig(locale);

  if (!config) {
    notFound();
  }

  const categories = getCategories();

  return (
    <div className="pt-24 pb-12 px-4 lg:px-8 max-w-[1920px] mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-3xl lg:text-4xl font-mono font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-4">
          <span className="text-[var(--accent-structural)] animate-pulse">&gt;_</span>
          SYSTEM MODULES
        </h1>
        <p className="text-[var(--text-secondary)] font-mono text-sm max-w-2xl">
          SYSTEM ONLINE. ALL MODULES ARE CALIBRATED FOR {config.name.toUpperCase()} FINANCIAL REGULATIONS.
        </p>
      </div>

      <div className="space-y-12">
        {categories.map((category) => {
          const availableItems = CALCULATOR_REGISTRY.filter(
            (item) => item.category === category && (item.locales.includes(locale) || item.locales.includes('global'))
          );

          if (availableItems.length === 0) return null;

          return (
            <div key={category}>
              <h2 className="text-xl font-mono font-bold text-[var(--accent-structural)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2 mb-6 shadow-[0_4px_10px_-5px_var(--accent-structural)]">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${locale}/calculators/${item.slug}`}
                    className="group block p-6 neu-raised hover:border-[var(--accent-structural)] transition-all hover:-translate-y-1 relative overflow-hidden"
                  >
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent-structural)] transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-[var(--text-secondary)] line-clamp-2">
                      Initialize the {item.title.toLowerCase()} engine to calculate projections, growth, and returns.
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-mono font-bold text-[var(--text-secondary)] group-hover:text-[var(--accent-structural)] transition-colors uppercase tracking-widest">
                      <span>BOOT MODULE</span>
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
