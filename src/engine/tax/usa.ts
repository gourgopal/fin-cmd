/**
 * @fileoverview US Tax Engine — 2025 Federal Income Tax Rules.
 *
 * Sources:
 * - IRS Rev. Proc. 2024-40 (2025 tax brackets & standard deductions)
 * - IRC §1(j) (income tax rates: 10%, 12%, 22%, 24%, 32%, 35%, 37%)
 * - IRC §1(h) (long-term capital gains: 0%, 15%, 20%)
 * - IRC §1411 (Net Investment Income Tax — 3.8% above $200K single / $250K MFJ)
 * - IRC §72(t) (10% early withdrawal penalty before age 59½)
 */

import type {
  TaxBracket,
  TaxCalcResult,
  BracketBreakdown,
  SurchargeItem,
  CapitalGainsTaxResult,
  USFilingStatus,
} from './types';

// ─── 2025 Federal Income Tax Brackets ─────────────────────────────────

/** 2025 federal income tax brackets for Single filers (IRS Rev. Proc. 2024-40). */
export const BRACKETS_SINGLE_2025: TaxBracket[] = [
  { min: 0,       max: 11925,   rate: 0.10 },
  { min: 11925,   max: 48475,   rate: 0.12 },
  { min: 48475,   max: 103350,  rate: 0.22 },
  { min: 103350,  max: 197300,  rate: 0.24 },
  { min: 197300,  max: 250525,  rate: 0.32 },
  { min: 250525,  max: 626350,  rate: 0.35 },
  { min: 626350,  max: Infinity, rate: 0.37 },
];

/** 2025 federal income tax brackets for Married Filing Jointly. */
export const BRACKETS_MFJ_2025: TaxBracket[] = [
  { min: 0,       max: 23850,   rate: 0.10 },
  { min: 23850,   max: 96950,   rate: 0.12 },
  { min: 96950,   max: 206700,  rate: 0.22 },
  { min: 206700,  max: 394600,  rate: 0.24 },
  { min: 394600,  max: 501050,  rate: 0.32 },
  { min: 501050,  max: 751600,  rate: 0.35 },
  { min: 751600,  max: Infinity, rate: 0.37 },
];

/** 2025 federal income tax brackets for Married Filing Separately. */
export const BRACKETS_MFS_2025: TaxBracket[] = [
  { min: 0,       max: 11925,   rate: 0.10 },
  { min: 11925,   max: 48475,   rate: 0.12 },
  { min: 48475,   max: 103350,  rate: 0.22 },
  { min: 103350,  max: 197300,  rate: 0.24 },
  { min: 197300,  max: 250525,  rate: 0.32 },
  { min: 250525,  max: 375800,  rate: 0.35 },
  { min: 375800,  max: Infinity, rate: 0.37 },
];

/** 2025 federal income tax brackets for Head of Household. */
export const BRACKETS_HOH_2025: TaxBracket[] = [
  { min: 0,       max: 17000,   rate: 0.10 },
  { min: 17000,   max: 64850,   rate: 0.12 },
  { min: 64850,   max: 103350,  rate: 0.22 },
  { min: 103350,  max: 197300,  rate: 0.24 },
  { min: 197300,  max: 250500,  rate: 0.32 },
  { min: 250500,  max: 626350,  rate: 0.35 },
  { min: 626350,  max: Infinity, rate: 0.37 },
];

// ─── 2025 Standard Deductions ──────────────────────────────────────────

/** Standard deduction amounts for 2025 by filing status. */
export const STANDARD_DEDUCTION_2025: Record<USFilingStatus, number> = {
  single: 15000,
  married_joint: 30000,
  married_separate: 15000,
  head_of_household: 22500,
};

// ─── Long-Term Capital Gains Brackets ──────────────────────────────────

/**
 * 2025 long-term capital gains brackets for Single filers.
 * Rates: 0%, 15%, 20% based on taxable income thresholds.
 */
export const LTCG_BRACKETS_SINGLE_2025: TaxBracket[] = [
  { min: 0,       max: 48350,   rate: 0.00 },
  { min: 48350,   max: 533400,  rate: 0.15 },
  { min: 533400,  max: Infinity, rate: 0.20 },
];

/** 2025 LTCG brackets for Married Filing Jointly. */
export const LTCG_BRACKETS_MFJ_2025: TaxBracket[] = [
  { min: 0,       max: 96700,   rate: 0.00 },
  { min: 96700,   max: 600050,  rate: 0.15 },
  { min: 600050,  max: Infinity, rate: 0.20 },
];

// ─── NIIT Thresholds ───────────────────────────────────────────────────

/**
 * Net Investment Income Tax (NIIT) threshold — IRC §1411.
 * 3.8% on net investment income for MAGI above threshold.
 */
export const NIIT_RATE = 0.038;
export const NIIT_THRESHOLDS: Record<USFilingStatus, number> = {
  single: 200000,
  married_joint: 250000,
  married_separate: 125000,
  head_of_household: 200000,
};

// ─── Helper: Get Brackets by Filing Status ─────────────────────────────

/**
 * Retrieve the appropriate income tax brackets for a filing status.
 * @param status - Filing status
 * @returns Tax bracket array for 2025
 */
export function getBrackets(status: USFilingStatus): TaxBracket[] {
  switch (status) {
    case 'single': return BRACKETS_SINGLE_2025;
    case 'married_joint': return BRACKETS_MFJ_2025;
    case 'married_separate': return BRACKETS_MFS_2025;
    case 'head_of_household': return BRACKETS_HOH_2025;
  }
}

// ─── Progressive Tax Calculation ───────────────────────────────────────

/**
 * Calculate progressive (graduated) income tax using a bracket schedule.
 *
 * Applies each marginal rate only to income within that bracket's range.
 *
 * @param taxableIncome - Income after deductions
 * @param brackets - Array of TaxBracket (must be sorted by min ascending)
 * @returns Object with total tax, bracket breakdown, and marginal rate
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): { tax: number; breakdown: BracketBreakdown[]; marginalRate: number } {
  let remainingIncome = Math.max(0, taxableIncome);
  let totalTax = 0;
  let marginalRate = 0;
  const breakdown: BracketBreakdown[] = [];

  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;

    const bracketWidth = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remainingIncome, bracketWidth);
    const taxFromBracket = taxableInBracket * bracket.rate;

    breakdown.push({
      rate: bracket.rate,
      taxableInBracket: Math.round(taxableInBracket * 100) / 100,
      taxFromBracket: Math.round(taxFromBracket * 100) / 100,
    });

    totalTax += taxFromBracket;
    marginalRate = bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return {
    tax: Math.round(totalTax * 100) / 100,
    breakdown,
    marginalRate,
  };
}

// ─── Full Federal Income Tax ───────────────────────────────────────────

/**
 * Calculate full US federal income tax for 2025.
 *
 * Steps:
 * 1. Apply standard deduction (or custom deductions)
 * 2. Compute progressive tax on taxable income
 * 3. Return detailed breakdown
 *
 * @param grossIncome - Total gross income
 * @param filingStatus - Filing status
 * @param deductions - Custom deductions (if undefined, uses standard deduction)
 * @returns Full TaxCalcResult
 */
export function calculateUSIncomeTax(
  grossIncome: number,
  filingStatus: USFilingStatus,
  deductions?: number,
): TaxCalcResult {
  const standardDed = STANDARD_DEDUCTION_2025[filingStatus];
  const totalDeductions = deductions ?? standardDed;
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const brackets = getBrackets(filingStatus);
  const { tax, breakdown, marginalRate } = calculateProgressiveTax(taxableIncome, brackets);

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxAmount: tax,
    effectiveRate: grossIncome > 0 ? Math.round((tax / grossIncome) * 10000) / 10000 : 0,
    marginalRate,
    bracketBreakdown: breakdown,
    surcharges: [],
    netIncome: Math.round((grossIncome - tax) * 100) / 100,
  };
}

// ─── Long-Term Capital Gains Tax ───────────────────────────────────────

/**
 * Calculate US long-term capital gains tax.
 *
 * Rules (2025):
 * - 0% for taxable income up to $48,350 (single) / $96,700 (MFJ)
 * - 15% for middle range
 * - 20% for top earners
 * - NIIT: additional 3.8% on net investment income if MAGI > threshold
 *
 * @param gain - Long-term capital gain
 * @param ordinaryTaxableIncome - Taxable ordinary income (to place gain in correct bracket)
 * @param filingStatus - Filing status
 * @param magi - Modified Adjusted Gross Income (for NIIT calculation)
 * @returns CapitalGainsTaxResult
 */
export function calculateUSLTCG(
  gain: number,
  ordinaryTaxableIncome: number,
  filingStatus: USFilingStatus,
  magi: number,
): CapitalGainsTaxResult {
  const notes: string[] = [];
  const brackets = filingStatus === 'married_joint'
    ? LTCG_BRACKETS_MFJ_2025
    : LTCG_BRACKETS_SINGLE_2025;

  // Place the gain on top of ordinary income
  let remainingGain = gain;
  let tax = 0;
  let startingIncome = ordinaryTaxableIncome;

  for (const bracket of brackets) {
    if (remainingGain <= 0) break;

    const bracketCeiling = bracket.max;
    const spaceInBracket = Math.max(0, bracketCeiling - startingIncome);
    const gainInBracket = Math.min(remainingGain, spaceInBracket);

    tax += gainInBracket * bracket.rate;
    remainingGain -= gainInBracket;
    startingIncome += gainInBracket;

    if (gainInBracket > 0) {
      notes.push(`$${Math.round(gainInBracket).toLocaleString()} taxed at ${bracket.rate * 100}%`);
    }
  }

  // NIIT calculation
  let niit = 0;
  const niitThreshold = NIIT_THRESHOLDS[filingStatus];
  if (magi > niitThreshold) {
    const niitableIncome = Math.min(gain, magi - niitThreshold);
    niit = Math.round(niitableIncome * NIIT_RATE * 100) / 100;
    notes.push(`NIIT: 3.8% on $${Math.round(niitableIncome).toLocaleString()} = $${niit.toLocaleString()}`);
  }

  const totalTax = Math.round((tax + niit) * 100) / 100;
  const effectiveRate = gain > 0 ? totalTax / gain : 0;

  return {
    gainType: 'long_term',
    totalGain: gain,
    exemption: 0,
    taxableGain: gain,
    taxRate: effectiveRate,
    taxAmount: Math.round(tax * 100) / 100,
    surcharge: niit,
    totalTax,
    postTaxGain: Math.round((gain - totalTax) * 100) / 100,
    notes,
  };
}

// ─── Early Withdrawal Penalty ──────────────────────────────────────────

/**
 * Calculate the 10% early withdrawal penalty for retirement accounts.
 *
 * IRC §72(t): 10% additional tax on early distributions from
 * qualified retirement plans (401k, IRA) before age 59½.
 *
 * @param amount - Withdrawal amount
 * @param age - Current age at withdrawal
 * @returns Penalty amount (0 if age >= 59.5)
 */
export function earlyWithdrawalPenalty(amount: number, age: number): number {
  if (age >= 59.5) return 0;
  return Math.round(amount * 0.10 * 100) / 100;
}

/**
 * Calculate Required Minimum Distribution (RMD) age threshold.
 *
 * SECURE Act 2.0 (2023): RMD age is 73 for those born 1951-1959,
 * and 75 for those born 1960 or later.
 *
 * @param birthYear - Year of birth
 * @returns RMD starting age
 */
export function rmdStartAge(birthYear: number): number {
  if (birthYear >= 1960) return 75;
  return 73;
}
