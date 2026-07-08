'use client';

import { useState, useEffect, useCallback } from 'react';

// Financial categories for Net Worth tracking
export type FinancialCategory = 'investments' | 'cash' | 'property' | 'other_assets' | 'mortgage' | 'other_loans' | 'depreciating_assets';

interface SharedState {
  [category: string]: number;
}

export function useSharedFinancialState() {
  const [sharedState, setSharedState] = useState<SharedState>({});

  // Load initial state
  useEffect(() => {
    const loaded: SharedState = {};
    const categories: FinancialCategory[] = ['investments', 'cash', 'property', 'other_assets', 'mortgage', 'other_loans', 'depreciating_assets'];
    
    categories.forEach(cat => {
      const val = localStorage.getItem(`finance_app_shared_${cat}`);
      if (val) {
        loaded[cat] = parseFloat(val);
      } else {
        loaded[cat] = 0;
      }
    });
    
    setSharedState(loaded);
  }, []);

  const saveToCategory = useCallback((category: FinancialCategory, value: number) => {
    localStorage.setItem(`finance_app_shared_${category}`, value.toString());
    setSharedState(prev => ({ ...prev, [category]: value }));
  }, []);

  return { sharedState, saveToCategory };
}

// Helper to determine which category a calculator updates
export function getCategoryForCalculator(calculatorId: string): FinancialCategory | null {
  const map: Record<string, FinancialCategory> = {
    'compound-interest': 'investments',
    'sip-calculator': 'investments',
    '401k-calculator': 'investments',
    'ira-calculator': 'investments',
    'ppf-calculator': 'investments',
    'epfo-calculator': 'investments',
    'nps-calculator': 'investments',
    'mutual-fund-returns': 'investments',
    'ssy-calculator': 'investments',
    'cash-savings': 'cash',
    'mortgage-calculator': 'mortgage',
    'loan-emi': 'other_loans',
  };
  
  return map[calculatorId] || null;
}
