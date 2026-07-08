import React from 'react';
import { SUPPORTED_LOCALES } from '../../lib/locales';
import { Navbar, Sidebar, Footer } from '../../components/layout';

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale: locale.code,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] overflow-hidden">
      
      {/* Animated Space Background Elements */}
      <div className="space-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      <Navbar currentLocale={locale} />
      
      <div className="flex-1 flex w-full pt-16 lg:pt-20">
        <Sidebar currentLocale={locale} />
        
        {/* Main Console HUD Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col items-center justify-center relative">
          
          {/* HUD Monitor Wrapper for the Content */}
          <div className="w-full h-full max-w-full lg:px-8 pb-20 relative z-10 flex flex-col">
            {children}
          </div>

        </main>
      </div>
      <Footer currentLocale={locale} />
    </div>
  );
}
