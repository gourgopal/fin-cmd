export interface GrowthPoint {
  year: number;
  balance: number;
  contributions: number;
  interest: number;
  label?: string;
}

export interface AmortizationRow {
  month: number;
  year: number;
  emi: number;
  principalComponent: number;
  interestComponent: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface TaxBreakdown {
  grossReturn: number;
  taxableAmount: number;
  taxPaid: number;
  netReturn: number;
  effectiveTaxRate: number;
}

export interface InstrumentResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  growthSeries: GrowthPoint[];
  taxBreakdown?: TaxBreakdown;
  amortization?: AmortizationRow[];
}
