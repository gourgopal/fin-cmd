import { InstrumentResult, GrowthPoint } from './types';
import { compoundGrowth, sipFutureValue, lumpSumFV, amortizationSchedule } from '../core';

export function calculateCashSavings(initial: number, monthly: number, rate: number, years: number): InstrumentResult {
  const points = compoundGrowth(initial, monthly, rate, years);
  const final = points[points.length - 1];
  
  return {
    finalBalance: final.balance,
    totalContributions: final.contributions,
    totalInterest: final.interest,
    growthSeries: points
  };
}

export function calculateStockReturns(initial: number, monthly: number, rate: number, years: number): InstrumentResult {
  // Can extend to include capital gains logic later
  return calculateCashSavings(initial, monthly, rate, years);
}

export function calculateCustomLoan(principal: number, rate: number, tenureMonths: number): InstrumentResult {
  const schedule = amortizationSchedule(principal, rate, tenureMonths);
  const final = schedule[schedule.length - 1];
  
  return {
    finalBalance: 0,
    totalContributions: principal,
    totalInterest: final.cumulativeInterest,
    growthSeries: [], // Not applicable in the same way, using schedule instead
    amortization: schedule
  };
}
