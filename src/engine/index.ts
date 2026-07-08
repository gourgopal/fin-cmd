import { calculateCashSavings, calculateStockReturns, calculateCustomLoan } from './instruments/global';
import { calculate401k, calculateIRA, calculateMortgage, calculateETFReturns } from './instruments/usa';
import { calculatePPF, calculateEPFO, calculateNPS, calculateMutualFund, calculateSSY } from './instruments/india';
import { InstrumentResult } from './instruments/types';
import { calculateIndiaIncomeTax, aggregate80C } from './tax/india';

// Additional stubs for unimplemented calculator engine functions based on lib/calculators.ts config
const calculateSIP = (state: any) => calculateMutualFund(0, state.monthly || 0, state.rate || 12, state.years || 10, 0);
const calculateLoanEMI = (state: any) => calculateCustomLoan(state.principal || 100000, state.rate || 8, (state.years || 10) * 12);
const calculateInflationAdjustment = (state: any) => calculateCashSavings(state.amount || 10000, 0, (state.inflation || 3) * -1, state.years || 10);
const calculateFIRE = (state: any) => calculateCashSavings(state.currentSavings || 10000, state.monthlySavings || 1000, state.expectedReturn || 7, state.yearsToRetire || 20);
const calculateNetWorth = (state: any) => calculateCashSavings(state.assets || 100000, 0, 0, 1); // Mock
const calculateCapitalGainsTax = (state: any) => ({ finalBalance: 0, totalContributions: 0, totalInterest: 0, growthSeries: [] });

const optimizeSection80C = (state: any) => {
  const income = state.income || 1200000;
  const regime = state.regime || 'old';
  const epf = state.epf || 0;
  const ppf = state.ppf || 0;
  const elss = state.elss || 0;
  const insurance = state.insurance || 0;
  const nps1 = state.nps_80ccd1 || 0;
  const others = state.others || 0;
  const nps1b = state.nps_80ccd1b || 0;

  const aggregated80C = aggregate80C({ epf, ppf, elss, insurance, nps1, others });
  
  const taxResult = calculateIndiaIncomeTax(income, regime, aggregated80C.deducted, nps1b, 0);

  return {
    totalContributions: taxResult.grossIncome,
    totalInterest: taxResult.taxAmount,
    finalBalance: taxResult.netIncome,
    growthSeries: [
      { year: 1, contributions: taxResult.grossIncome, interest: taxResult.taxAmount, balance: taxResult.netIncome }
    ]
  };
};


export type EngineFunction = (state: any) => InstrumentResult | any;

export const engineMap: Record<string, EngineFunction> = {
  calculateCompoundInterest: (state: any) => calculateCashSavings(state.principal || 0, state.contribution || 0, state.rate || 7, state.years || 10),
  calculateSIP: (state: any) => calculateMutualFund(state.existing || 0, state.monthly || 0, state.rate || 12, state.years || 10, 0),
  calculateLoanEMI: (state: any) => calculateCustomLoan(state.principal || 100000, state.rate || 8, (state.years || 10) * 12),
  calculateInflationAdjustment: (state: any) => calculateCashSavings(state.amount || 10000, 0, (state.inflation || 3) * -1, state.years || 10),
  calculateFIRE: (state: any) => calculateCashSavings(state.saved || 10000, 0, state.roi || 7, Math.max(1, 65 - (state.age || 30))),
  calculateNetWorth: (state: any) => {
    const assets = (state.cash || 0) + (state.investments || 0) + (state.property || 0) + (state.other_assets || 0) + (state.depreciating_assets || 0);
    const liabilities = (state.mortgage || 0) + (state.other_loans || 0);
    return {
      finalBalance: assets - liabilities,
      totalContributions: assets,
      totalInterest: liabilities,
      growthSeries: [
        { year: 0, balance: assets - liabilities, contributions: assets, interest: liabilities },
        { year: 1, balance: assets - liabilities, contributions: assets, interest: liabilities } // dummy points for bar chart
      ]
    };
  },
  calculate401k: (state: any) => calculate401k({
    currentBalance: state.balance || 0,
    salary: state.salary || 85000,
    contributionPercent: state.contribution || 10,
    employerMatchPercent: state.match || 50,
    employerMatchLimit: state.match_limit || 6,
    annualReturn: state.roi || 7,
    yearsToRetirement: Math.max(1, (state.retire_age || 65) - (state.age || 30)),
    age: state.age || 30
  }),
  calculateIRA: (state: any) => calculateIRA({
    isRoth: false, 
    currentBalance: state.balance || 0,
    annualContribution: state.annual || 7000,
    annualReturn: state.roi || 7,
    years: Math.max(1, (state.retire_age || 65) - (state.age || 30)),
    age: state.age || 30
  }),
  calculateMortgage: (state: any) => calculateMortgage(state.price || 400000, state.rate || 6.87, parseInt(state.term) || 30, state.tax || 4800, state.insurance || 1500),
  analyzeETFExpenses: (state: any) => calculateETFReturns(state.investment || 100000, state.monthly || 1000, state.roi || 10, state.expense1 || 0.03, state.years || 30),
  calculateCapitalGainsTax,
  calculatePPF: (state: any) => calculatePPF(state.annual || 150000, state.years || 15),
  calculateEPFO: (state: any) => calculateEPFO({
    lpa: state.lpa || 1200000,
    basicPercent: state.basic_percent || 50,
    years: Math.max(1, (state.retire_age || 58) - (state.age || 28)),
    existingBalance: state.existing || 0,
    rate: state.rate || 8.25,
    raise: state.raise || 5,
    employeeRate: state.employee_rate || 12,
    employerRate: state.employer_rate || 3.67,
    epsRate: state.eps_rate || 8.33
  }),
  calculateNPS: (state: any) => calculateNPS(state.monthly || 5000, state.equity_return || 12, Math.max(1, (state.retire_age || 60) - (state.age || 30))),
  calculateMutualFundReturns: (state: any) => calculateMutualFund(state.lumpsum || 100000, state.sip_amount || 10000, state.rate || 12, state.years || 10, 1),
  calculateSSY: (state: any) => calculateSSY(state.annual || 150000, state.girl_age || 5),
  optimizeSection80C,
};
