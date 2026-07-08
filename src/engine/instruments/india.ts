import { InstrumentResult, GrowthPoint } from './types';

// PPF: 7.1% p.a., max 1.5L/yr, 15yr lock-in, EEE
export function calculatePPF(annualDeposit: number, years: number = 15): InstrumentResult {
  const rate = 7.1 / 100;
  const deposit = Math.min(annualDeposit, 150000);
  
  let balance = 0;
  let totalContributions = 0;
  let totalInterest = 0;
  const points: GrowthPoint[] = [{ year: 0, balance: 0, contributions: 0, interest: 0 }];

  for (let y = 1; y <= years; y++) {
    const interest = (balance + deposit) * rate; // assuming deposit at start of year for simplicity in annual model
    balance += deposit + interest;
    totalContributions += deposit;
    totalInterest += interest;
    
    points.push({
      year: y,
      balance,
      contributions: totalContributions,
      interest: totalInterest
    });
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest,
    growthSeries: points
  };
}

export interface EPFOParams {
  lpa: number;
  basicPercent: number;
  years: number;
  existingBalance: number;
  rate: number;
  raise: number;
  employeeRate: number;
  employerRate: number;
  epsRate: number;
}

export function calculateEPFO(params: EPFOParams): InstrumentResult {
  const { lpa, basicPercent, years, existingBalance, rate, raise, employeeRate, employerRate, epsRate } = params;
  
  const annualRate = rate / 100;
  const annualRaise = raise / 100;
  
  let currentLPA = lpa;
  let balance = existingBalance;
  let totalContributions = existingBalance;
  let totalInterest = 0;
  const points: GrowthPoint[] = [{ year: 0, balance: existingBalance, contributions: existingBalance, interest: 0 }];

  // Monthly compounding approximation for EPF
  const monthlyRate = annualRate / 12;
  
  for (let y = 1; y <= years; y++) {
    const monthlyBasic = (currentLPA * (basicPercent / 100)) / 12;
    const employeeContrib = monthlyBasic * (employeeRate / 100);
    const epsCap = Math.min(monthlyBasic, 15000) * (epsRate / 100);
    const employerContrib = (monthlyBasic * (employerRate / 100)) - epsCap;
    
    // Total monthly going into EPF (not EPS)
    const totalMonthlyEPF = employeeContrib + Math.max(0, employerContrib);
    
    for (let m = 1; m <= 12; m++) {
      const interest = balance * monthlyRate;
      balance += totalMonthlyEPF + interest;
      totalContributions += totalMonthlyEPF;
      totalInterest += interest;
    }
    
    points.push({
      year: y,
      balance,
      contributions: totalContributions,
      interest: totalInterest
    });
    
    // Apply raise at end of year
    currentLPA = currentLPA * (1 + annualRaise);
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest,
    growthSeries: points
  };
}

// NPS: 80CCD(1), 80CCD(1B) 50k extra
export function calculateNPS(monthlyDeposit: number, rate: number, years: number): InstrumentResult {
  const r = (rate / 100) / 12;
  let balance = 0;
  let totalContributions = 0;
  let totalInterest = 0;
  const points: GrowthPoint[] = [{ year: 0, balance: 0, contributions: 0, interest: 0 }];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      const interest = balance * r;
      balance += monthlyDeposit + interest;
      totalContributions += monthlyDeposit;
      totalInterest += interest;
    }
    points.push({
      year: y,
      balance,
      contributions: totalContributions,
      interest: totalInterest
    });
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest,
    growthSeries: points
  };
}

// Mutual Fund: LTCG/STCG logic can be applied in tax engine, this is gross growth
export function calculateMutualFund(initial: number, monthly: number, rate: number, years: number, exitLoadPercent: number = 1): InstrumentResult {
  const r = (rate / 100) / 12;
  let balance = initial;
  let totalContributions = initial;
  let totalInterest = 0;
  const points: GrowthPoint[] = [{ year: 0, balance: initial, contributions: initial, interest: 0 }];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      const interest = balance * r;
      balance += monthly + interest;
      totalContributions += monthly;
      totalInterest += interest;
    }
    points.push({
      year: y,
      balance,
      contributions: totalContributions,
      interest: totalInterest
    });
  }

  // Apply exit load on final balance (simplified)
  let exitLoadAmount = 0;
  if (years <= 1 && exitLoadPercent > 0) {
     exitLoadAmount = balance * (exitLoadPercent / 100);
     balance -= exitLoadAmount;
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest,
    growthSeries: points
  };
}

// SSY: 8.2% p.a., 250-1.5L/yr, 21yr maturity, 15yr deposit period
export function calculateSSY(annualDeposit: number, startAge: number = 0): InstrumentResult {
  const rate = 8.2 / 100;
  const deposit = Math.min(Math.max(annualDeposit, 250), 150000);
  const years = 21;
  
  let balance = 0;
  let totalContributions = 0;
  let totalInterest = 0;
  const points: GrowthPoint[] = [{ year: 0, balance: 0, contributions: 0, interest: 0 }];

  for (let y = 1; y <= years; y++) {
    // Deposits only allowed for first 15 years
    const currentDeposit = y <= 15 ? deposit : 0;
    
    // SSY interest is calculated on lowest balance between 10th and end of month, compounded annually
    // Approximating to annual compounding for simplicity
    const interest = (balance + currentDeposit) * rate; 
    
    balance += currentDeposit + interest;
    totalContributions += currentDeposit;
    totalInterest += interest;
    
    points.push({
      year: y,
      balance,
      contributions: totalContributions,
      interest: totalInterest
    });
  }

  return {
    finalBalance: balance,
    totalContributions,
    totalInterest,
    growthSeries: points
  };
}
