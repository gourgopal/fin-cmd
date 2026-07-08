import { GrowthPoint, AmortizationRow } from './instruments/types';

/**
 * Calculates Future Value of a portfolio with variable deposits, fees, and exit loads.
 * V = (1-L) × Σ D_k × (1+r-e)^(t-k)
 */
export function portfolioFV(
  deposits: number[], 
  annualRate: number, 
  expenseRatio: number, 
  exitLoad: number
): number {
  let fv = 0;
  const netRate = (annualRate - expenseRatio) / 100;
  const t = deposits.length;
  
  for (let k = 1; k <= t; k++) {
    const d = deposits[k - 1];
    fv += d * Math.pow(1 + netRate, t - k);
  }
  
  return fv * (1 - exitLoad / 100);
}

/**
 * Calculates Inflation-adjusted real rate of return.
 * r_real = (1+r)/(1+i) - 1
 */
export function realReturn(nominalRate: number, inflationRate: number): number {
  const r = nominalRate / 100;
  const i = inflationRate / 100;
  return ((1 + r) / (1 + i) - 1) * 100;
}

/**
 * Calculates Monthly EMI.
 * EMI = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  const r = (annualRate / 100) / 12;
  const n = tenureMonths;
  if (r === 0) return principal / n;
  return principal * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

/**
 * Generates full amortization schedule month-by-month.
 */
export function amortizationSchedule(principal: number, annualRate: number, tenureMonths: number): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const r = (annualRate / 100) / 12;
  
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  
  for (let month = 1; month <= tenureMonths; month++) {
    const interestComponent = balance * r;
    let principalComponent = emi - interestComponent;
    
    if (balance < principalComponent) {
        principalComponent = balance;
    }
    
    balance -= principalComponent;
    cumulativeInterest += interestComponent;
    cumulativePrincipal += principalComponent;
    
    schedule.push({
      month,
      year: Math.ceil(month / 12),
      emi: principalComponent + interestComponent,
      principalComponent,
      interestComponent,
      balance: Math.max(0, balance),
      cumulativeInterest,
      cumulativePrincipal
    });
  }
  
  return schedule;
}

/**
 * Calculates compound interest with periodic monthly contributions.
 */
export function compoundGrowth(principal: number, monthlyContrib: number, annualRate: number, years: number): GrowthPoint[] {
  const points: GrowthPoint[] = [];
  const r = (annualRate / 100) / 12;
  let balance = principal;
  let totalContributions = principal;
  let totalInterest = 0;
  
  points.push({
    year: 0,
    balance: principal,
    contributions: principal,
    interest: 0
  });

  for (let y = 1; y <= years; y++) {
    let yearInterest = 0;
    for (let m = 1; m <= 12; m++) {
      const interest = balance * r;
      yearInterest += interest;
      balance += interest + monthlyContrib;
      totalContributions += monthlyContrib;
      totalInterest += interest;
    }
    
    points.push({
      year: y,
      balance,
      contributions: totalContributions,
      interest: totalInterest
    });
  }
  
  return points;
}

/**
 * Calculates Future Value of a Systematic Investment Plan (SIP).
 */
export function sipFutureValue(monthlyAmount: number, annualRate: number, years: number): number {
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  if (r === 0) return monthlyAmount * n;
  return monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/**
 * Calculates simple Future Value of a lump sum investment.
 */
export function lumpSumFV(principal: number, annualRate: number, years: number): number {
  return principal * Math.pow(1 + annualRate / 100, years);
}
