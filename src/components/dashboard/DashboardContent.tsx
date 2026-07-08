"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSharedFinancialState } from '../../hooks/useSharedFinancialState';
import { CALCULATOR_REGISTRY } from '../../lib/calculators';
import { AskAiButton } from '../ui/AskAiButton';

export function DashboardContent({ locale }: { locale: string }) {
  const { sharedState } = useSharedFinancialState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalAssets = (sharedState.investments || 0) + (sharedState.cash || 0) + (sharedState.property || 0) + (sharedState.other_assets || 0) + (sharedState.depreciating_assets || 0);
  const totalLiabilities = (sharedState.mortgage || 0) + (sharedState.other_loans || 0);
  const fleetValue = totalAssets - totalLiabilities;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(locale === 'in' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: locale === 'in' ? 'INR' : 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto px-4 pb-20 mt-8">
      
      {/* Fleet Value Banner */}
      <div className="w-full relative group">
        <div className="absolute inset-0 bg-[var(--accent-structural)]/10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="relative neu-raised p-8 md:p-12 flex flex-col items-center justify-center text-center">
          <p className="text-[var(--text-secondary)] font-mono text-sm tracking-widest uppercase mb-4">[ Current Fleet Value ]</p>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--accent-structural)]">
            {mounted ? formatCurrency(fleetValue) : '...'}
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link 
              href={`/${locale}/calculators/net-worth-tracker`}
              className="px-6 py-3 neu-inset text-[var(--text-primary)] font-medium hover:border-[var(--accent-structural)] transition-all font-mono text-sm uppercase tracking-wider"
            >
              Update Fleet
            </Link>
            <AskAiButton />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-[var(--accent-structural)] to-transparent flex-1"></div>
          <h3 className="font-mono uppercase tracking-widest text-lg text-[var(--text-secondary)]">[ Available Modules ]</h3>
          <div className="h-px bg-gradient-to-l from-[var(--accent-structural)] to-transparent flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CALCULATOR_REGISTRY
            .filter(c => c.locales.includes('global') || c.locales.includes(locale))
            .map(calc => (
            <Link key={calc.slug} href={`/${locale}/calculators/${calc.slug}`}>
              <div className="h-full group relative neu-raised p-6 overflow-hidden hover:border-[var(--accent-structural)] transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-structural)]/5 rounded-full blur-3xl group-hover:bg-[var(--accent-structural)]/20 transition-all duration-500 -mr-10 -mt-10"></div>
                <div className="text-3xl mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform origin-left">{calc.icon}</div>
                <h4 className="font-bold text-lg mb-2 text-white group-hover:text-[var(--accent-structural)] transition-colors">{calc.shortTitle || calc.title}</h4>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{calc.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
