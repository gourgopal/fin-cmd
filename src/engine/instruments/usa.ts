import { InstrumentResult, GrowthPoint } from './types';
import { compoundGrowth, amortizationSchedule } from '../core';

export interface USA401kInput {
  currentBalance: number;
  salary: number;
  contributionPercent: number;
  employerMatchPercent: number; // e.g. 50%
  employerMatchLimit: number; // e.g. up to 6% of salary
  annualReturn: number;
  yearsToRetirement: number;
  age: number;
}

export function calculate401k(input: USA401kInput): InstrumentResult {
  const { currentBalance, salary, contributionPercent, employerMatchPercent, employerMatchLimit, annualReturn, yearsToRetirement, age } = input;
  
  // 2025 Limits
  let maxContribution = 23500;
  if (age >= 50) maxContribution += 7500; // Catch-up
  if (age >= 60 && age <= 63) maxContribution = 23500 + 11250; // Super catch-up (2025 rule approximate)

  let employeeAnnual = (salary * contributionPercent) / 100;
  if (employeeAnnual > maxContribution) employeeAnnual = maxContribution;

  const matchablePercent = Math.min(contributionPercent, employerMatchLimit);
  const employerAnnual = (salary * matchablePercent * (employerMatchPercent / 100)) / 100;

  const totalMonthly = (employeeAnnual + employerAnnual) / 12;

  const points = compoundGrowth(currentBalance, totalMonthly, annualReturn, yearsToRetirement);
  const final = points[points.length - 1];

  return {
    finalBalance: final.balance,
    totalContributions: final.contributions, // includes employer
    totalInterest: final.interest,
    growthSeries: points
  };
}

export interface USAIRAInput {
  currentBalance: number;
  annualContribution: number;
  annualReturn: number;
  years: number;
  age: number;
  isRoth: boolean;
}

export function calculateIRA(input: USAIRAInput): InstrumentResult {
  const { currentBalance, annualContribution, annualReturn, years, age } = input;
  let maxContribution = 7000;
  if (age >= 50) maxContribution += 1000;
  
  const contribution = Math.min(annualContribution, maxContribution);
  const points = compoundGrowth(currentBalance, contribution / 12, annualReturn, years);
  const final = points[points.length - 1];

  return {
    finalBalance: final.balance,
    totalContributions: final.contributions,
    totalInterest: final.interest,
    growthSeries: points
  };
}

export function calculateMortgage(principal: number, rate: number, years: number, propertyTaxAnnual: number = 0, insuranceAnnual: number = 0): InstrumentResult {
  const schedule = amortizationSchedule(principal, rate, years * 12);
  const final = schedule[schedule.length - 1];
  
  // Add property tax and insurance to EMI representation if needed, 
  // but standard amortization doesn't compound them into balance.
  
  return {
    finalBalance: 0,
    totalContributions: principal,
    totalInterest: final.cumulativeInterest,
    growthSeries: [],
    amortization: schedule
  };
}

export function calculateETFReturns(initial: number, monthly: number, grossRate: number, expenseRatio: number, years: number): InstrumentResult {
  const netRate = grossRate - expenseRatio;
  const points = compoundGrowth(initial, monthly, netRate, years);
  const final = points[points.length - 1];

  // We can calculate gross to show fees lost, but standard return is net.
  return {
    finalBalance: final.balance,
    totalContributions: final.contributions,
    totalInterest: final.interest,
    growthSeries: points
  };
}
