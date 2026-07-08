export interface TaxBracket {
  rate: number;
  min: number;
  max: number; // For Infinity we use JS Infinity instead of null to match india.ts
}

export interface CapitalGainsBracket {
  rate: number;
  min: number;
  max: number;
}

export interface BracketBreakdown {
  rate: number;
  taxableInBracket: number;
  taxFromBracket: number;
}

export interface SurchargeItem {
  name: string;
  amount: number;
  rate?: number;
}

export interface TaxCalcResult {
  grossIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  marginalRate: number;
  bracketBreakdown: BracketBreakdown[];
  surcharges: SurchargeItem[];
  netIncome: number;
}

export interface CapitalGainsTaxResult {
  gainType: 'short_term' | 'long_term';
  totalGain: number;
  exemption: number;
  taxableGain: number;
  taxRate: number;
  taxAmount: number;
  surcharge: number;
  totalTax: number;
  postTaxGain: number;
  notes: string[];
}

export interface DeductionSummary {
  section: string;
  description: string;
  eligible: number;
  limit: number;
  deducted: number;
}

export type IndiaTaxRegime = 'old' | 'new';
export type USFilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
