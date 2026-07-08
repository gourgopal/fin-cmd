'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../ui';
import { useTheme } from '../../hooks/useLocalStorage';
import { SUPPORTED_LOCALES, type LocaleConfig, getLocaleConfig } from '../../lib/locales';
import { useAuth } from '../../lib/AuthContext';
import { useSharedFinancialState } from '../../hooks/useSharedFinancialState';
import { formatCurrency } from '../../lib/currencies';
import { NlpGatewayModal } from '../nlp/NlpGatewayModal';

/* ============================================================
 * Navbar — Fixed top navigation bar with MegaMenu and Cart
 * ============================================================ */

interface NavbarProps {
  currentLocale: string;
}

export function Navbar({ currentLocale }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNlpOpen, setIsNlpOpen] = useState(false);
  const { user, signIn, signOut } = useAuth();
  
  const { sharedState } = useSharedFinancialState();
  const [netWorth, setNetWorth] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const localeConfig = getLocaleConfig(currentLocale);
  
  useEffect(() => {
    const nw = (sharedState.cash || 0) + 
               (sharedState.investments || 0) + 
               (sharedState.property || 0) + 
               (sharedState.other_assets || 0) + 
               (sharedState.depreciating_assets || 0) - 
               (sharedState.mortgage || 0) - 
               (sharedState.other_loans || 0);
    
    if (nw !== netWorth && netWorth !== 0) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 2000);
    }
    setNetWorth(nw);
  }, [sharedState, netWorth]);

  // Handle Cmd+K global shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsNlpOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#040914]/90 backdrop-blur-md border-b-2 border-[var(--border-glow)] shadow-[0_0_20px_rgba(0,255,255,0.1)]">
      <div className="w-full max-w-[1920px] mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          <div className="flex items-center gap-4">
            <Link href={`/${currentLocale}`} className="flex items-center gap-2 group">
              <span className="text-2xl animate-pulse text-[var(--accent-structural)] drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                &gt;_
              </span>
              <span className="font-mono text-xl font-bold tracking-widest text-white group-hover:text-[var(--accent-structural)] transition-colors uppercase">
                FinCMD
              </span>
            </Link>
          </div>

          {/* Desktop Links (Mega Menu style handled via hover in CSS or just plain links for now) */}
          <nav className="hidden lg:flex items-center gap-6">
            <div className="group relative">
              <button className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-structural)] transition-colors py-2">
                [ MODULES ] <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {/* Mega Menu Dropdown */}
              <div className="absolute top-full left-0 pt-4 hidden group-hover:block z-50">
                <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-glow)] shadow-[0_0_30px_rgba(0,255,255,0.2)] p-6 w-[800px] grid grid-cols-3 gap-8">
                  {calculatorCategories.map(cat => {
                    const items = cat.items.filter(i => i.locales.includes(currentLocale));
                    if (!items.length) return null;
                    return (
                      <div key={cat.name}>
                        <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)] mb-3 uppercase tracking-widest border-b border-[var(--border-subtle)] pb-2">
                          <span className="text-[var(--accent-structural)]">{cat.icon}</span> {cat.name}
                        </h4>
                        <ul className="space-y-2">
                          {items.map(item => (
                            <li key={item.slug}>
                              <Link href={`/${currentLocale}/calculators/${item.slug}`} className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--accent-structural)] hover:pl-2 transition-all block">
                                {'> '} {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <Link href={`/${currentLocale}/calculators`} className="font-mono text-xs uppercase tracking-widest font-semibold text-[var(--text-secondary)] hover:text-[var(--accent-structural)] transition-colors">
              [ DIRECTORY ]
            </Link>
          </nav>

          <div className="flex items-center gap-3 lg:gap-5">
            {/* Search */}
              <button 
                onClick={() => setIsNlpOpen(true)} 
                className="flex items-center gap-2 p-2 md:px-4 bg-black border border-[var(--accent-structural)] text-[var(--accent-structural)] hover:bg-[var(--accent-structural)] hover:text-black transition-all shadow-[0_0_10px_rgba(0,255,255,0.2)] font-mono text-xs tracking-widest"
                title="Open NLP Command Gateway (Cmd+K)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden md:inline">CMD+K</span>
              </button>

            {/* Net Worth Cart (Fleet Value) */}
            <Link href={`/${currentLocale}/calculators/net-worth-tracker`} className={`relative flex items-center gap-3 p-2 px-4 border transition-all duration-300 font-mono ${isFlashing ? 'bg-[var(--accent-positive)]/20 border-[var(--accent-positive)] shadow-[0_0_20px_rgba(57,255,20,0.5)] scale-105' : 'bg-black border-[var(--border-glow)] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]'}`}>
              <span className={`text-lg ${isFlashing ? 'animate-spin' : ''}`}>🛰️</span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-structural)] tracking-widest leading-none mb-1">Fleet Value</span>
                <span className={`text-sm font-bold leading-none ${isFlashing ? 'text-[var(--accent-positive)]' : 'text-[var(--text-primary)]'}`}>
                  {formatCurrency(netWorth, localeConfig.currency, { compact: true })}
                </span>
              </div>
            </Link>

            <LocaleSwitcher currentLocale={currentLocale} />
            
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 bg-black border border-[var(--border-glow)] text-[var(--accent-structural)]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu overlay ... */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-[var(--bg-primary)]/95 backdrop-blur-xl border-b border-[var(--border-subtle)] p-4 shadow-2xl">
          <MobileNav currentLocale={currentLocale} onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </header>
    
    {/* Render the Global NLP Modal here, outside the header stacking context */}
    <NlpGatewayModal 
      isOpen={isNlpOpen} 
      onClose={() => setIsNlpOpen(false)} 
      currentLocale={currentLocale} 
    />
    </>
  );
}

/* ============================================================
 * LocaleSwitcher — Dropdown to switch locale
 * ============================================================ */

function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const current = SUPPORTED_LOCALES.find((l) => l.code === currentLocale) || SUPPORTED_LOCALES[0];

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-structural)]/50 text-sm"
      >
        <span className="text-base">{current.flag}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-48 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {SUPPORTED_LOCALES.map((locale) => (
              <Link key={locale.code} href={`/${locale.code}`} onClick={() => setIsOpen(false)} className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${locale.code === currentLocale ? 'bg-[var(--accent-structural)]/10 text-[var(--accent-structural)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}>
                <span className="text-lg">{locale.flag}</span>
                <span>{locale.name}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
 * Sidebar & Categories
 * ============================================================ */

const calculatorCategories = [
  {
    name: 'Savings & Investments',
    icon: '📈',
    items: [
      { slug: 'compound-interest', label: 'Compound Interest', locales: ['global', 'us', 'in'] },
      { slug: 'sip-calculator', label: 'SIP Calculator', locales: ['global', 'in'] },
      { slug: 'fire-calculator', label: 'FIRE Calculator', locales: ['global', 'us', 'in'] },
      { slug: 'net-worth-tracker', label: 'Net Worth Tracker', locales: ['global', 'us', 'in'] },
    ],
  },
  {
    name: 'Retirement',
    icon: '🏖️',
    items: [
      { slug: '401k-calculator', label: '401(k) Calculator', locales: ['us'] },
      { slug: 'ira-calculator', label: 'IRA Calculator', locales: ['us'] },
      { slug: 'ppf-calculator', label: 'PPF Calculator', locales: ['in'] },
      { slug: 'epfo-calculator', label: 'EPFO Calculator', locales: ['in'] },
      { slug: 'nps-calculator', label: 'NPS Calculator', locales: ['in'] },
      { slug: 'ssy-calculator', label: 'SSY Calculator', locales: ['in'] },
    ],
  },
  {
    name: 'Debt & Loans',
    icon: '🏠',
    items: [
      { slug: 'loan-emi', label: 'Loan EMI', locales: ['global', 'us', 'in'] },
      { slug: 'mortgage-calculator', label: 'Mortgage Calculator', locales: ['us'] },
    ],
  },
  {
    name: 'Tax & Planning',
    icon: '📋',
    items: [
      { slug: 'inflation-adjuster', label: 'Inflation Adjuster', locales: ['global', 'us', 'in'] },
      { slug: 'capital-gains-tax', label: 'Capital Gains Tax', locales: ['us'] },
      { slug: 'mutual-fund-returns', label: 'Mutual Fund Returns', locales: ['in'] },
      { slug: 'section-80c-optimizer', label: '80C Optimizer', locales: ['in'] },
      { slug: 'etf-expense-analyzer', label: 'ETF Expense Analyzer', locales: ['us'] },
    ],
  },
];

interface SidebarProps {
  currentLocale: string;
  currentSlug?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentLocale, currentSlug, isOpen = false, onClose = () => {} }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar - strictly hidden on desktop now */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 w-72 z-40
          bg-[var(--bg-primary)] border-r border-[var(--border-subtle)]
          transform transition-transform duration-300 ease-out
          lg:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          overflow-y-auto scrollbar-thin
        `}
      >
        <nav className="p-4 space-y-6">
          {calculatorCategories.map((category) => {
            const filteredItems = category.items.filter((item) =>
              item.locales.includes(currentLocale)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={category.name}>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2 px-3">
                  <span>{category.icon}</span>
                  {category.name}
                </h3>
                <ul className="space-y-0.5">
                  {filteredItems.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/${currentLocale}/calculators/${item.slug}`}
                        onClick={onClose}
                        className={`
                          block px-3 py-2 rounded-lg text-sm transition-all duration-150
                          ${
                            currentSlug === item.slug
                              ? 'bg-[var(--accent-structural)]/10 text-[var(--accent-structural)] font-medium border-l-2 border-[var(--accent-structural)]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                          }
                        `}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

/* ============================================================
 * MobileNav — Mobile navigation for hamburger menu
 * ============================================================ */

function MobileNav({
  currentLocale,
  onClose,
}: {
  currentLocale: string;
  onClose: () => void;
}) {
  const quickLinks = [
    { href: `/${currentLocale}`, label: 'Dashboard', icon: '🏠' },
    { href: `/${currentLocale}/calculators`, label: 'All Calculators', icon: '🧮' },
  ];

  return (
    <nav className="space-y-2">
      {quickLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-3 rounded-xl
            text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]
            transition-colors text-sm font-medium"
        >
          <span className="text-lg">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

/* ============================================================
 * Footer — SEO-rich footer
 * ============================================================ */

interface FooterProps {
  currentLocale: string;
}

export function Footer({ currentLocale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl neu-raised flex items-center justify-center text-[var(--accent-structural)] font-bold text-sm">
                &gt;
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)] tracking-widest uppercase">
                FINCMD
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Free, privacy-first financial calculators for global investors. 
              Your data never leaves your browser.
            </p>
          </div>

          {/* Calculators */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Calculators
            </h4>
            <ul className="space-y-2">
              {[
                { href: `/${currentLocale}/calculators/compound-interest`, label: 'Compound Interest' },
                { href: `/${currentLocale}/calculators/sip-calculator`, label: 'SIP Calculator' },
                { href: `/${currentLocale}/calculators/loan-emi`, label: 'Loan EMI' },
                { href: `/${currentLocale}/calculators/fire-calculator`, label: 'FIRE Calculator' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-structural)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regional */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Regional Tools
            </h4>
            <ul className="space-y-2">
              {(currentLocale === 'in'
                ? [
                    { href: '/in/calculators/ppf-calculator', label: 'PPF Calculator' },
                    { href: '/in/calculators/nps-calculator', label: 'NPS Calculator' },
                    { href: '/in/calculators/epfo-calculator', label: 'EPFO Calculator' },
                    { href: '/in/calculators/section-80c-optimizer', label: '80C Optimizer' },
                  ]
                : [
                    { href: '/us/calculators/401k-calculator', label: '401(k) Calculator' },
                    { href: '/us/calculators/ira-calculator', label: 'IRA Calculator' },
                    { href: '/us/calculators/mortgage-calculator', label: 'Mortgage Calculator' },
                    { href: '/us/calculators/capital-gains-tax', label: 'Capital Gains' },
                  ]
              ).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-structural)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                { href: '#', label: 'Privacy Policy' },
                { href: '#', label: 'About' },
                { href: '#', label: 'GitHub' },
                { href: '#', label: 'Feedback' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-structural)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            © {currentYear} FINCMD. All calculations are for informational purposes only. 
            Not financial advice.
          </p>
          <div className="flex items-center gap-4">
            {SUPPORTED_LOCALES.map((locale) => (
              <Link
                key={locale.code}
                href={`/${locale.code}`}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-structural)] transition-colors"
              >
                {locale.flag} {locale.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
