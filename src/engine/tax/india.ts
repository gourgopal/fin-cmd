/**
 * @fileoverview India Tax Engine — FY 2025-26 (AY 2026-27) Rules.
 *
 * Sources:
 * - Finance Act 2025 (Union Budget 2025-26)
 * - Section 80C: ₹1,50,000 aggregate limit
 * - Section 80CCD(1B): Additional ₹50,000 for NPS
 * - Section 80CCD(2): Employer NPS contribution (no limit under new regime, 14% of salary for Govt, 10% for others)
 * - Equity LTCG: 12.5% above ₹1.25L exemption (holding > 12 months) — Finance Act 2024 amendment
 * - Equity STCG: 20% (holding ≤ 12 months) — Finance Act 2024 amendment
 * - Debt MF: Taxed at slab rate, no indexation benefit (post April 2023 amendment)
 * - New Tax Regime (default from FY 2023-24): Revised slabs from Budget 2025-26
 */

import type {
  TaxBracket,
  TaxCalcResult,
  BracketBreakdown,
  CapitalGainsTaxResult,
  DeductionSummary,
  IndiaTaxRegime,
} from './types';

// ─── New Tax Regime Slabs — FY 2025-26 (Budget 2025-26) ────────────────

/**
 * New Tax Regime slabs for FY 2025-26 (Union Budget 2025-26).
 * These are the revised slabs announced in Budget 2025.
 * Standard deduction of ₹75,000 for salaried individuals.
 */
export const NEW_REGIME_SLABS_2025: TaxBracket[] = [
  { min: 0,        max: 400000,  rate: 0.00 },
  { min: 400000,   max: 800000,  rate: 0.05 },
  { min: 800000,   max: 1200000, rate: 0.10 },
  { min: 1200000,  max: 1600000, rate: 0.15 },
  { min: 1600000,  max: 2000000, rate: 0.20 },
  { min: 2000000,  max: 2400000, rate: 0.25 },
  { min: 2400000,  max: Infinity, rate: 0.30 },
];

/**
 * Old Tax Regime slabs — FY 2025-26 (unchanged).
 * Basic exemption: ₹2,50,000 for individuals below 60.
 */
export const OLD_REGIME_SLABS_2025: TaxBracket[] = [
  { min: 0,        max: 250000,  rate: 0.00 },
  { min: 250000,   max: 500000,  rate: 0.05 },
  { min: 500000,   max: 1000000, rate: 0.20 },
  { min: 1000000,  max: Infinity, rate: 0.30 },
];

// ─── Cess & Surcharge ──────────────────────────────────────────────────

/** Health & Education Cess: 4% on total tax + surcharge. */
export const CESS_RATE = 0.04;

/**
 * Surcharge slabs on income tax (applicable to both regimes).
 * Applied on income tax amount, not on income.
 */
export const SURCHARGE_SLABS: { minIncome: number; maxIncome: number; rate: number }[] = [
  { minIncome: 5000000,   maxIncome: 10000000,  rate: 0.10 },
  { minIncome: 10000000,  maxIncome: 20000000,  rate: 0.15 },
  { minIncome: 20000000,  maxIncome: 50000000,  rate: 0.25 },
  { minIncome: 50000000,  maxIncome: Infinity,   rate: 0.37 },
];

// ─── Section 80C Deduction Constants ───────────────────────────────────

/** Maximum deduction under Section 80C (PPF, ELSS, LIC, EPF, etc.) */
export const SECTION_80C_LIMIT = 150000;

/** Maximum additional deduction under Section 80CCD(1B) for NPS */
export const SECTION_80CCD_1B_LIMIT = 50000;

/** Standard deduction for salaried employees — New Regime FY 2025-26 */
export const STANDARD_DEDUCTION_NEW_REGIME = 75000;

/** Standard deduction for salaried employees — Old Regime */
export const STANDARD_DEDUCTION_OLD_REGIME = 50000;

// ─── Capital Gains Tax Rates ───────────────────────────────────────────

/** Equity LTCG rate (holding > 12 months) — Finance Act 2024 amendment */
export const EQUITY_LTCG_RATE = 0.125;

/** Equity LTCG exemption threshold per financial year */
export const EQUITY_LTCG_EXEMPTION = 125000;

/** Equity STCG rate (holding ≤ 12 months) — Finance Act 2024 amendment */
export const EQUITY_STCG_RATE = 0.20;

// ─── TDS Rates (common) ──────────────────────────────────────────────

/** Common TDS rate table for reference. */
export const TDS_RATES: Record<string, { section: string; rate: number; description: string }> = {
  salary: {
    section: '192',
    rate: -1, // As per slab
    description: 'Salary — TDS as per applicable slab rates',
  },
  interest_bank: {
    section: '194A',
    rate: 0.10,
    description: 'Interest on bank deposits > ₹40,000/year (₹50,000 for senior citizens)',
  },
  dividend: {
    section: '194',
    rate: 0.10,
    description: 'Dividend income > ₹5,000/year',
  },
  rent_land_building: {
    section: '194I',
    rate: 0.10,
    description: 'Rent on land/building > ₹2,40,000/year',
  },
  professional_fees: {
    section: '194J',
    rate: 0.10,
    description: 'Professional/technical fees > ₹30,000/year',
  },
  epf_premature: {
    section: '192A',
    rate: 0.10,
    description: 'Premature EPF withdrawal (service < 5 years, amount > ₹50,000)',
  },
};

// ─── Progressive Tax Calculation ───────────────────────────────────────

/**
 * Calculate progressive income tax for a given bracket schedule.
 *
 * @param taxableIncome - Income after all deductions
 * @param brackets - Tax bracket array (sorted by min ascending)
 * @returns Tax amount, bracket breakdown, and marginal rate
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): { tax: number; breakdown: BracketBreakdown[]; marginalRate: number } {
  let remaining = Math.max(0, taxableIncome);
  let totalTax = 0;
  let marginalRate = 0;
  const breakdown: BracketBreakdown[] = [];

  for (const bracket of brackets) {
    if (remaining <= 0) break;

    const width = bracket.max - bracket.min;
    const taxableInBracket = Math.min(remaining, width);
    const taxFromBracket = taxableInBracket * bracket.rate;

    breakdown.push({
      rate: bracket.rate,
      taxableInBracket: Math.round(taxableInBracket * 100) / 100,
      taxFromBracket: Math.round(taxFromBracket * 100) / 100,
    });

    totalTax += taxFromBracket;
    marginalRate = bracket.rate;
    remaining -= taxableInBracket;
  }

  return {
    tax: Math.round(totalTax * 100) / 100,
    breakdown,
    marginalRate,
  };
}

/**
 * Calculate surcharge on income tax based on total income.
 * @param incomeTax - Computed income tax
 * @param totalIncome - Total income for surcharge slab determination
 * @returns Surcharge amount
 */
export function calculateSurcharge(incomeTax: number, totalIncome: number): number {
  for (const slab of SURCHARGE_SLABS) {
    if (totalIncome > slab.minIncome && totalIncome <= slab.maxIncome) {
      return Math.round(incomeTax * slab.rate * 100) / 100;
    }
  }
  // Above highest slab
  if (totalIncome > 50000000) {
    return Math.round(incomeTax * 0.37 * 100) / 100;
  }
  return 0;
}

// ─── Full India Income Tax ─────────────────────────────────────────────

/**
 * Calculate India income tax under the specified regime for FY 2025-26.
 *
 * New Regime (default):
 * - Standard deduction ₹75,000
 * - No 80C/80D deductions (except 80CCD(2) employer NPS)
 * - Tax rebate u/s 87A: Full rebate if taxable income ≤ ₹12,00,000
 *   (effective zero tax up to ₹12,75,000 with standard deduction)
 *
 * Old Regime:
 * - Standard deduction ₹50,000
 * - All deductions available (80C, 80D, 80CCD, HRA, etc.)
 *
 * @param grossIncome - Total gross income
 * @param regime - 'old' or 'new'
 * @param deductions80C - Amount invested in 80C instruments (old regime only)
 * @param deductions80CCD1B - Amount invested in NPS u/s 80CCD(1B) (old regime only)
 * @param otherDeductions - Any other Chapter VI-A deductions (old regime only)
 * @returns TaxCalcResult
 */
export function calculateIndiaIncomeTax(
  grossIncome: number,
  regime: IndiaTaxRegime = 'new',
  deductions80C: number = 0,
  deductions80CCD1B: number = 0,
  otherDeductions: number = 0,
): TaxCalcResult {
  let totalDeductions = 0;
  const surcharges: { name: string; amount: number; rate?: number }[] = [];

  if (regime === 'new') {
    // New regime: only standard deduction for salaried
    totalDeductions = STANDARD_DEDUCTION_NEW_REGIME;
  } else {
    // Old regime: standard deduction + Chapter VI-A deductions
    const claimed80C = Math.min(deductions80C, SECTION_80C_LIMIT);
    const claimed80CCD1B = Math.min(deductions80CCD1B, SECTION_80CCD_1B_LIMIT);
    totalDeductions = STANDARD_DEDUCTION_OLD_REGIME + claimed80C + claimed80CCD1B + otherDeductions;
  }

  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const slabs = regime === 'new' ? NEW_REGIME_SLABS_2025 : OLD_REGIME_SLABS_2025;
  const { tax: baseTax, breakdown, marginalRate } = calculateProgressiveTax(taxableIncome, slabs);

  let finalTax = baseTax;

  // New Regime Rebate u/s 87A: If taxable income ≤ ₹12,00,000, full tax rebate
  if (regime === 'new' && taxableIncome <= 1200000) {
    // Marginal relief: tax should not exceed income above ₹12L
    finalTax = 0;
    surcharges.push({ name: 'Rebate u/s 87A', amount: -baseTax });
  }

  // Old Regime Rebate u/s 87A: If taxable income ≤ ₹5,00,000
  if (regime === 'old' && taxableIncome <= 500000) {
    const rebate = Math.min(baseTax, 12500);
    finalTax = baseTax - rebate;
    surcharges.push({ name: 'Rebate u/s 87A', amount: -rebate });
  }

  // Surcharge (on tax, not income) for high earners
  if (taxableIncome > 5000000) {
    const surcharge = calculateSurcharge(finalTax, taxableIncome);
    finalTax += surcharge;
    surcharges.push({ name: 'Surcharge', amount: surcharge });
  }

  // Health & Education Cess: 4% on tax + surcharge
  const cess = Math.round(finalTax * CESS_RATE * 100) / 100;
  finalTax = Math.round((finalTax + cess) * 100) / 100;
  surcharges.push({ name: 'Health & Education Cess (4%)', amount: cess });

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    taxAmount: finalTax,
    effectiveRate: grossIncome > 0 ? Math.round((finalTax / grossIncome) * 10000) / 10000 : 0,
    marginalRate,
    bracketBreakdown: breakdown,
    surcharges,
    netIncome: Math.round((grossIncome - finalTax) * 100) / 100,
  };
}

// ─── Section 80C Aggregation ───────────────────────────────────────────

/**
 * Aggregate Section 80C deductions from multiple instruments.
 * Total capped at ₹1,50,000.
 *
 * Eligible instruments: PPF, ELSS, EPF, LIC, NSC, SSY, 5-yr FD, etc.
 *
 * @param contributions - Map of instrument name to amount contributed
 * @returns DeductionSummary with total eligible, limit, and deducted amounts
 */
export function aggregate80C(
  contributions: Record<string, number>,
): DeductionSummary {
  let total = 0;
  for (const key of Object.keys(contributions)) {
    total += contributions[key];
  }

  return {
    section: '80C',
    description: 'Aggregate deduction for PPF, ELSS, EPF, LIC, NSC, SSY, 5-yr FD, etc.',
    eligible: total,
    limit: SECTION_80C_LIMIT,
    deducted: Math.min(total, SECTION_80C_LIMIT),
  };
}

// ─── Equity Capital Gains Tax ──────────────────────────────────────────

/**
 * Calculate equity LTCG tax for India — FY 2025-26 rules.
 *
 * Rules (Finance Act 2024 amendment, applicable from FY 2024-25 onwards):
 * - Rate: 12.5% on gains exceeding ₹1,25,000 exemption per FY
 * - Holding period: > 12 months qualifies as long-term
 * - No indexation benefit for equity
 *
 * @param totalGain - Total long-term capital gain from equity/equity MF
 * @returns CapitalGainsTaxResult
 */
export function calculateEquityLTCG(totalGain: number): CapitalGainsTaxResult {
  const notes: string[] = [];
  const taxableGain = Math.max(0, totalGain - EQUITY_LTCG_EXEMPTION);
  const taxAmount = Math.round(taxableGain * EQUITY_LTCG_RATE * 100) / 100;

  if (totalGain <= EQUITY_LTCG_EXEMPTION) {
    notes.push(`Gain of ₹${totalGain.toLocaleString('en-IN')} is within ₹1,25,000 exemption — no tax`);
  } else {
    notes.push(`₹${EQUITY_LTCG_EXEMPTION.toLocaleString('en-IN')} exempted under Sec 112A`);
    notes.push(`₹${taxableGain.toLocaleString('en-IN')} taxed at 12.5%`);
  }

  // Cess on LTCG
  const cess = Math.round(taxAmount * CESS_RATE * 100) / 100;
  notes.push(`Health & Education Cess (4%): ₹${cess.toLocaleString('en-IN')}`);

  const totalTax = Math.round((taxAmount + cess) * 100) / 100;

  return {
    gainType: 'long_term',
    totalGain,
    exemption: EQUITY_LTCG_EXEMPTION,
    taxableGain,
    taxRate: EQUITY_LTCG_RATE,
    taxAmount,
    surcharge: cess,
    totalTax,
    postTaxGain: Math.round((totalGain - totalTax) * 100) / 100,
    notes,
  };
}

/**
 * Calculate equity STCG tax for India — FY 2025-26 rules.
 *
 * Rules (Finance Act 2024 amendment):
 * - Rate: 20% flat on short-term gains
 * - Holding period: ≤ 12 months
 * - No exemption threshold
 *
 * @param totalGain - Total short-term capital gain from equity
 * @returns CapitalGainsTaxResult
 */
export function calculateEquitySTCG(totalGain: number): CapitalGainsTaxResult {
  const notes: string[] = [];
  const taxAmount = Math.round(totalGain * EQUITY_STCG_RATE * 100) / 100;
  notes.push(`Full gain of ₹${totalGain.toLocaleString('en-IN')} taxed at 20% (Sec 111A)`);

  const cess = Math.round(taxAmount * CESS_RATE * 100) / 100;
  notes.push(`Health & Education Cess (4%): ₹${cess.toLocaleString('en-IN')}`);
  const totalTax = Math.round((taxAmount + cess) * 100) / 100;

  return {
    gainType: 'short_term',
    totalGain,
    exemption: 0,
    taxableGain: totalGain,
    taxRate: EQUITY_STCG_RATE,
    taxAmount,
    surcharge: cess,
    totalTax,
    postTaxGain: Math.round((totalGain - totalTax) * 100) / 100,
    notes,
  };
}

/**
 * Calculate debt mutual fund tax for India — post April 2023.
 *
 * Rules (Finance Act 2023 amendment):
 * - No distinction between STCG/LTCG — always taxed at slab rate
 * - No indexation benefit
 * - Treated as short-term capital gain regardless of holding period
 *
 * @param totalGain - Capital gain from debt mutual fund
 * @param marginalSlabRate - Investor's marginal income tax slab rate (decimal)
 * @returns CapitalGainsTaxResult
 */
export function calculateDebtMFTax(
  totalGain: number,
  marginalSlabRate: number,
): CapitalGainsTaxResult {
  const notes: string[] = [];
  const taxAmount = Math.round(totalGain * marginalSlabRate * 100) / 100;
  notes.push(`Debt MF gains taxed at slab rate: ${(marginalSlabRate * 100).toFixed(1)}%`);
  notes.push('No indexation benefit post April 2023');

  const cess = Math.round(taxAmount * CESS_RATE * 100) / 100;
  const totalTax = Math.round((taxAmount + cess) * 100) / 100;

  return {
    gainType: 'short_term', // treated as STCG post-2023
    totalGain,
    exemption: 0,
    taxableGain: totalGain,
    taxRate: marginalSlabRate,
    taxAmount,
    surcharge: cess,
    totalTax,
    postTaxGain: Math.round((totalGain - totalTax) * 100) / 100,
    notes,
  };
}
