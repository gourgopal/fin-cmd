/**
 * Central Calculator Configuration Registry.
 * Contains complete configs for all 17 calculators across Global, US, and India locales.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CalculatorField {
  /** URL param key (short: 'amt', 'yr', 'roi') */
  key: string;
  /** Human-readable label */
  label: string;
  /** Input type */
  type: 'currency' | 'percent' | 'number' | 'slider' | 'select' | 'toggle';
  /** Default value */
  default: number | string | boolean;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Options for select fields */
  options?: { value: string; label: string }[];
  /** Display suffix (e.g., '%', 'years') */
  suffix?: string;
  /** Display prefix (e.g., '$', '₹') */
  prefix?: string;
  /** Tooltip / help text */
  helpText?: string;
  /** Whether this field is hidden in the advanced drawer by default */
  advanced?: boolean;
}

export interface CalculatorConfig {
  /** URL slug */
  slug: string;
  /** Which locales this calculator is available in */
  locales: string[];
  /** Full page title */
  title: string;
  /** Short title for navigation / tabs */
  shortTitle: string;
  /** Brief description */
  description: string;
  /** Calculator category */
  category: 'retirement' | 'investment' | 'debt' | 'tax' | 'savings' | 'insurance';
  /** Emoji icon */
  icon: string;
  /** Name of the engine function to call */
  engineFn: string;
  /** Input field definitions */
  fields: CalculatorField[];
  /** SEO metadata */
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  /** If true, feature is gated behind pro subscription */
  proFeature?: boolean;
}

// ─── Global Calculators (6) ─────────────────────────────────────────────────

const compoundInterest: CalculatorConfig = {
  slug: 'compound-interest',
  locales: ['global', 'us', 'in'],
  title: 'Compound Interest Calculator',
  shortTitle: 'Compound Interest',
  description: 'Calculate compound interest on your savings or investments with customizable compounding frequency, additional contributions, and inflation adjustment.',
  category: 'investment',
  icon: '📈',
  engineFn: 'calculateCompoundInterest',
  fields: [
    {
      key: 'principal',
      label: 'Initial Investment',
      type: 'currency',
      default: 10000,
      min: 0,
      max: 100000000,
      step: 1000,
      helpText: 'The starting amount you are investing or saving.',
    },
    {
      key: 'rate',
      label: 'Annual Interest Rate',
      type: 'percent',
      default: 8,
      min: 0,
      max: 50,
      step: 0.1,
      suffix: '%',
      helpText: 'The expected annual rate of return or interest rate.',
    },
    {
      key: 'years',
      label: 'Time Period',
      type: 'number',
      default: 10,
      min: 1,
      max: 50,
      step: 1,
      suffix: 'years',
      helpText: 'The number of years you plan to keep the investment.',
    },
    {
      key: 'compound',
      label: 'Compounding Frequency',
      type: 'select',
      default: 'monthly',
      options: [
        { value: 'annually', label: 'Annually' },
        { value: 'semi-annually', label: 'Semi-Annually' },
        { value: 'quarterly', label: 'Quarterly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'daily', label: 'Daily' },
      ],
      helpText: 'How often the interest is compounded.',
    },
    {
      key: 'contribution',
      label: 'Monthly Contribution',
      type: 'currency',
      default: 1000,
      min: 0,
      max: 10000000,
      step: 100,
      helpText: 'Additional amount added every month.',
    },
    {
      key: 'inflation',
      label: 'Expected Inflation Rate',
      type: 'percent',
      default: 3,
      min: 0,
      max: 20,
      step: 0.1,
      suffix: '%',
      helpText: 'Expected annual inflation rate to see inflation-adjusted returns.',
    },
  ],
  seo: {
    title: 'Compound Interest Calculator – Free Online Tool | FinanceCalc Pro',
    description: 'Use our free compound interest calculator to see how your investments grow over time. Customize compounding frequency, monthly contributions, and inflation adjustments.',
    keywords: ['compound interest calculator', 'investment calculator', 'interest calculator', 'compound growth', 'savings calculator', 'compound interest formula', 'investment returns'],
  },
};

const sipCalculator: CalculatorConfig = {
  slug: 'sip-calculator',
  locales: ['global', 'us', 'in'],
  title: 'SIP Calculator – Systematic Investment Plan',
  shortTitle: 'SIP Calculator',
  description: 'Calculate future value of your Systematic Investment Plan (SIP) with step-up option, inflation adjustment, and detailed year-by-year breakdown.',
  category: 'investment',
  icon: '💰',
  engineFn: 'calculateSIP',
  fields: [
    {
      key: 'existing',
      label: 'Existing Lumpsum',
      type: 'currency',
      default: 0,
      min: 0,
      max: 10000000,
      step: 5000,
      helpText: 'Any existing investment amount you want to add to this SIP calculation.',
    },
    {
      key: 'monthly',
      label: 'Monthly SIP Amount',
      type: 'currency',
      default: 5000,
      min: 100,
      max: 10000000,
      step: 500,
      helpText: 'The amount you invest every month through SIP.',
    },
    {
      key: 'rate',
      label: 'Expected Annual Return',
      type: 'percent',
      default: 12,
      min: 1,
      max: 30,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected annual return rate from your SIP investments.',
    },
    {
      key: 'years',
      label: 'Investment Duration',
      type: 'number',
      default: 15,
      min: 1,
      max: 40,
      step: 1,
      suffix: 'years',
      helpText: 'Number of years you plan to continue the SIP.',
    },
    {
      key: 'stepup',
      label: 'Annual Step-Up',
      type: 'percent',
      default: 10,
      min: 0,
      max: 50,
      step: 1,
      suffix: '%',
      helpText: 'Percentage by which you increase your SIP amount every year.',
    },
    {
      key: 'inflation',
      label: 'Inflation Rate',
      type: 'percent',
      default: 6,
      min: 0,
      max: 15,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected inflation rate to calculate real (inflation-adjusted) returns.',
    },
  ],
  seo: {
    title: 'SIP Calculator – Systematic Investment Plan Returns | FinanceCalc Pro',
    description: 'Calculate your SIP returns with step-up, inflation adjustment, and year-wise breakdown. Free SIP calculator for mutual fund investors.',
    keywords: ['SIP calculator', 'systematic investment plan', 'SIP returns', 'mutual fund SIP', 'monthly investment calculator', 'SIP step up calculator'],
  },
};

const loanEmi: CalculatorConfig = {
  slug: 'loan-emi',
  locales: ['global', 'us', 'in'],
  title: 'Loan EMI Calculator',
  shortTitle: 'EMI Calculator',
  description: 'Calculate your monthly EMI, total interest payable, and full amortization schedule for any loan — home, car, personal, or education.',
  category: 'debt',
  icon: '🏦',
  engineFn: 'calculateLoanEMI',
  fields: [
    {
      key: 'principal',
      label: 'Loan Amount',
      type: 'currency',
      default: 5000000,
      min: 1000,
      max: 500000000,
      step: 10000,
      helpText: 'The total loan amount (principal) you wish to borrow.',
    },
    {
      key: 'rate',
      label: 'Annual Interest Rate',
      type: 'percent',
      default: 8.5,
      min: 0.1,
      max: 30,
      step: 0.1,
      suffix: '%',
      helpText: 'The annual interest rate offered by the lender.',
    },
    {
      key: 'years',
      label: 'Loan Tenure',
      type: 'number',
      default: 20,
      min: 1,
      max: 30,
      step: 1,
      suffix: 'years',
      helpText: 'The loan repayment period in years.',
    },
    {
      key: 'prepay',
      label: 'Annual Prepayment',
      type: 'currency',
      default: 0,
      min: 0,
      max: 100000000,
      step: 10000,
      helpText: 'Optional annual extra payment to reduce the loan principal faster.',
    },
    {
      key: 'type',
      label: 'Loan Type',
      type: 'select',
      default: 'reducing',
      options: [
        { value: 'reducing', label: 'Reducing Balance' },
        { value: 'flat', label: 'Flat Rate' },
      ],
      helpText: 'Reducing balance is standard; flat rate is occasionally used for personal loans.',
    },
  ],
  seo: {
    title: 'EMI Calculator – Loan EMI & Amortization | FinanceCalc Pro',
    description: 'Calculate your loan EMI, total interest, and view a complete amortization schedule. Works for home loans, car loans, personal loans, and education loans.',
    keywords: ['EMI calculator', 'loan calculator', 'home loan EMI', 'car loan calculator', 'amortization schedule', 'personal loan EMI', 'loan interest calculator'],
  },
};

const inflationAdjuster: CalculatorConfig = {
  slug: 'inflation-adjuster',
  locales: ['global', 'us', 'in'],
  title: 'Inflation Adjustment Calculator',
  shortTitle: 'Inflation Adjuster',
  description: 'See how inflation erodes the purchasing power of your money over time. Calculate the future value needed to maintain today\'s standard of living.',
  category: 'savings',
  icon: '📉',
  engineFn: 'calculateInflationAdjustment',
  fields: [
    {
      key: 'amount',
      label: 'Current Amount',
      type: 'currency',
      default: 100000,
      min: 1,
      max: 100000000,
      step: 1000,
      helpText: 'The amount in today\'s value that you want to adjust for inflation.',
    },
    {
      key: 'inflation',
      label: 'Expected Inflation Rate',
      type: 'percent',
      default: 5,
      min: 0,
      max: 20,
      step: 0.5,
      suffix: '%',
      helpText: 'The average annual inflation rate you expect.',
    },
    {
      key: 'years',
      label: 'Number of Years',
      type: 'number',
      default: 20,
      min: 1,
      max: 50,
      step: 1,
      suffix: 'years',
      helpText: 'How far into the future you want to project.',
    },
  ],
  seo: {
    title: 'Inflation Calculator – Adjust for Purchasing Power | FinanceCalc Pro',
    description: 'Calculate how inflation reduces your money\'s purchasing power. Find out what today\'s money will be worth in the future with our free inflation calculator.',
    keywords: ['inflation calculator', 'purchasing power calculator', 'inflation adjuster', 'cost of living calculator', 'future value calculator', 'real value of money'],
  },
};

const fireCalculator: CalculatorConfig = {
  slug: 'fire-calculator',
  locales: ['global', 'us', 'in'],
  title: 'FIRE Calculator – Financial Independence, Retire Early',
  shortTitle: 'FIRE Calculator',
  description: 'Plan your path to financial independence and early retirement. Calculate your FIRE number, savings rate, and time to FI based on your income, expenses, and investment returns.',
  category: 'retirement',
  icon: '🔥',
  engineFn: 'calculateFIRE',
  fields: [
    {
      key: 'age',
      label: 'Current Age',
      type: 'number',
      default: 30,
      min: 18,
      max: 70,
      step: 1,
      suffix: 'years',
      helpText: 'Your current age.',
    },
    {
      key: 'income',
      label: 'Annual After-Tax Income',
      type: 'currency',
      default: 1200000,
      min: 0,
      max: 100000000,
      step: 10000,
      helpText: 'Your total annual income after taxes.',
    },
    {
      key: 'expenses',
      label: 'Annual Expenses',
      type: 'currency',
      default: 600000,
      min: 0,
      max: 100000000,
      step: 10000,
      helpText: 'Your total annual living expenses.',
    },
    {
      key: 'saved',
      label: 'Current Savings / Net Worth',
      type: 'currency',
      default: 500000,
      min: 0,
      max: 1000000000,
      step: 50000,
      helpText: 'Your current total invested savings and net worth.',
    },
    {
      key: 'roi',
      label: 'Expected Investment Return',
      type: 'percent',
      default: 8,
      min: 1,
      max: 20,
      step: 0.5,
      suffix: '%',
      helpText: 'Annual return you expect from your investment portfolio.',
    },
    {
      key: 'swr',
      label: 'Safe Withdrawal Rate',
      type: 'percent',
      default: 4,
      min: 2,
      max: 6,
      step: 0.25,
      suffix: '%',
      helpText: 'The percentage you plan to withdraw annually in retirement (4% is the Trinity Study standard).',
    },
    {
      key: 'inflation',
      label: 'Inflation Rate',
      type: 'percent',
      default: 4,
      min: 0,
      max: 15,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected annual inflation rate.',
    },
  ],
  seo: {
    title: 'FIRE Calculator – Financial Independence Retire Early | FinanceCalc Pro',
    description: 'Calculate your FIRE number and find out when you can achieve financial independence. Free FIRE calculator with savings rate, time-to-FI, and inflation adjustments.',
    keywords: ['FIRE calculator', 'financial independence', 'retire early', 'FIRE number', 'savings rate calculator', 'early retirement', 'financial freedom'],
  },
};

const netWorthTracker: CalculatorConfig = {
  slug: 'net-worth-tracker',
  locales: ['global', 'us', 'in'],
  title: 'Net Worth Tracker & Calculator',
  shortTitle: 'Net Worth',
  description: 'Track and calculate your net worth by listing all your assets and liabilities. See your financial health snapshot and growth trajectory.',
  category: 'savings',
  icon: '💎',
  engineFn: 'calculateNetWorth',
  fields: [
    {
      key: 'cash',
      label: 'Cash & Bank Balances',
      type: 'currency',
      default: 200000,
      min: 0,
      max: 1000000000,
      step: 10000,
      helpText: 'Total cash in savings, checking, and fixed deposits.',
    },
    {
      key: 'investments',
      label: 'Investments',
      type: 'currency',
      default: 500000,
      min: 0,
      max: 1000000000,
      step: 10000,
      helpText: 'Total value of stocks, mutual funds, ETFs, bonds, and retirement accounts.',
    },
    {
      key: 'property',
      label: 'Real Estate',
      type: 'currency',
      default: 3000000,
      min: 0,
      max: 5000000000,
      step: 100000,
      helpText: 'Market value of owned real estate (home, land, rental properties).',
    },
    {
      key: 'other_assets',
      label: 'Other Assets',
      type: 'currency',
      default: 100000,
      min: 0,
      max: 1000000000,
      step: 10000,
      helpText: 'Jewelry, crypto, collectibles, and other valuable assets.',
    },
    {
      key: 'depreciating_assets',
      label: 'Depreciating Assets',
      type: 'currency',
      default: 50000,
      min: 0,
      max: 1000000000,
      step: 5000,
      helpText: 'Vehicles, electronics, and other assets that lose value over time.',
    },
    {
      key: 'mortgage',
      label: 'Mortgage / Home Loan',
      type: 'currency',
      default: 2000000,
      min: 0,
      max: 5000000000,
      step: 100000,
      helpText: 'Outstanding balance on your home loan or mortgage.',
    },
    {
      key: 'other_loans',
      label: 'Other Loans & Liabilities',
      type: 'currency',
      default: 100000,
      min: 0,
      max: 1000000000,
      step: 10000,
      helpText: 'Car loans, personal loans, student loans, credit card debt, etc.',
    },
  ],
  seo: {
    title: 'Net Worth Calculator & Tracker – Free Tool | FinanceCalc Pro',
    description: 'Calculate your net worth by adding up assets and subtracting liabilities. Track your financial progress with our free net worth calculator.',
    keywords: ['net worth calculator', 'net worth tracker', 'financial health', 'wealth calculator', 'assets vs liabilities', 'personal finance tracker'],
  },
};

// ─── USA Calculators (5) ────────────────────────────────────────────────────

const calculator401k: CalculatorConfig = {
  slug: '401k-calculator',
  locales: ['us'],
  title: '401(k) Retirement Calculator',
  shortTitle: '401(k)',
  description: 'Estimate your 401(k) balance at retirement with employer match, catch-up contributions, and Roth vs Traditional comparison.',
  category: 'retirement',
  icon: '🏛️',
  engineFn: 'calculate401k',
  fields: [
    {
      key: 'age',
      label: 'Current Age',
      type: 'number',
      default: 30,
      min: 18,
      max: 70,
      step: 1,
      suffix: 'years',
      helpText: 'Your current age.',
    },
    {
      key: 'retire_age',
      label: 'Retirement Age',
      type: 'number',
      default: 65,
      min: 50,
      max: 75,
      step: 1,
      suffix: 'years',
      helpText: 'The age at which you plan to retire.',
    },
    {
      key: 'salary',
      label: 'Annual Salary',
      type: 'currency',
      default: 85000,
      min: 10000,
      max: 10000000,
      step: 1000,
      prefix: '$',
      helpText: 'Your current annual gross salary.',
    },
    {
      key: 'contribution',
      label: 'Your Contribution',
      type: 'percent',
      default: 10,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      helpText: 'Percentage of salary you contribute to your 401(k). The 2024 limit is $23,000 ($30,500 if 50+).',
    },
    {
      key: 'match',
      label: 'Employer Match',
      type: 'percent',
      default: 50,
      min: 0,
      max: 100,
      step: 5,
      suffix: '%',
      helpText: 'Percentage of your contribution that your employer matches.',
    },
    {
      key: 'match_limit',
      label: 'Employer Match Limit',
      type: 'percent',
      default: 6,
      min: 0,
      max: 20,
      step: 1,
      suffix: '%',
      helpText: 'Maximum percentage of salary your employer will match (e.g., up to 6% of salary).',
    },
    {
      key: 'balance',
      label: 'Current 401(k) Balance',
      type: 'currency',
      default: 50000,
      min: 0,
      max: 100000000,
      step: 5000,
      prefix: '$',
      helpText: 'Your existing 401(k) account balance.',
    },
    {
      key: 'roi',
      label: 'Expected Annual Return',
      type: 'percent',
      default: 7,
      min: 1,
      max: 15,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected average annual return on your 401(k) investments.',
    },
    {
      key: 'raise',
      label: 'Annual Salary Increase',
      type: 'percent',
      default: 3,
      min: 0,
      max: 15,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected annual salary increase (to project future contributions).',
    },
  ],
  seo: {
    title: '401(k) Calculator – Retirement Savings Estimator | FinanceCalc Pro',
    description: 'Estimate your 401(k) retirement savings with employer match, catch-up contributions, salary growth, and investment returns. Free 401(k) calculator.',
    keywords: ['401k calculator', '401k retirement', 'retirement calculator', 'employer match calculator', '401k contribution', '401k balance estimator', 'retirement savings'],
  },
};

const iraCalculator: CalculatorConfig = {
  slug: 'ira-calculator',
  locales: ['us'],
  title: 'IRA Calculator – Roth vs Traditional Comparison',
  shortTitle: 'Roth vs Trad IRA',
  description: 'Compare Roth IRA and Traditional IRA side-by-side. See after-tax retirement balances based on your current and future tax brackets.',
  category: 'retirement',
  icon: '⚖️',
  engineFn: 'calculateIRA',
  fields: [
    {
      key: 'age',
      label: 'Current Age',
      type: 'number',
      default: 30,
      min: 18,
      max: 70,
      step: 1,
      suffix: 'years',
      helpText: 'Your current age.',
    },
    {
      key: 'retire_age',
      label: 'Retirement Age',
      type: 'number',
      default: 65,
      min: 50,
      max: 75,
      step: 1,
      suffix: 'years',
      helpText: 'Your planned retirement age.',
    },
    {
      key: 'annual',
      label: 'Annual IRA Contribution',
      type: 'currency',
      default: 7000,
      min: 0,
      max: 8000,
      step: 500,
      prefix: '$',
      helpText: 'Annual contribution amount. 2024 limit: $7,000 ($8,000 if 50+).',
    },
    {
      key: 'balance',
      label: 'Current IRA Balance',
      type: 'currency',
      default: 20000,
      min: 0,
      max: 10000000,
      step: 1000,
      prefix: '$',
      helpText: 'Your existing IRA account balance.',
    },
    {
      key: 'roi',
      label: 'Expected Annual Return',
      type: 'percent',
      default: 7,
      min: 1,
      max: 15,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected average annual return on investments.',
    },
    {
      key: 'tax_now',
      label: 'Current Marginal Tax Rate',
      type: 'percent',
      default: 24,
      min: 0,
      max: 50,
      step: 1,
      suffix: '%',
      helpText: 'Your current federal marginal income tax rate.',
    },
    {
      key: 'tax_retire',
      label: 'Expected Retirement Tax Rate',
      type: 'percent',
      default: 22,
      min: 0,
      max: 50,
      step: 1,
      suffix: '%',
      helpText: 'The marginal tax rate you expect in retirement.',
    },
  ],
  seo: {
    title: 'Roth vs Traditional IRA Calculator – Side-by-Side Comparison | FinanceCalc Pro',
    description: 'Compare Roth and Traditional IRA to find which is better for your retirement. Factor in tax brackets, contribution limits, and growth projections.',
    keywords: ['IRA calculator', 'Roth IRA calculator', 'Traditional IRA', 'Roth vs Traditional', 'IRA comparison', 'retirement account', 'IRA contribution limit'],
  },
};

const mortgageCalculator: CalculatorConfig = {
  slug: 'mortgage-calculator',
  locales: ['us'],
  title: 'Mortgage Calculator – Home Loan Payment Estimator',
  shortTitle: 'Mortgage',
  description: 'Calculate your monthly mortgage payment, total interest, and compare 15-year vs 30-year terms. Includes property tax, insurance, and PMI estimates.',
  category: 'debt',
  icon: '🏠',
  engineFn: 'calculateMortgage',
  fields: [
    {
      key: 'price',
      label: 'Home Price',
      type: 'currency',
      default: 400000,
      min: 10000,
      max: 50000000,
      step: 5000,
      prefix: '$',
      helpText: 'Purchase price of the home.',
    },
    {
      key: 'down',
      label: 'Down Payment',
      type: 'percent',
      default: 20,
      min: 0,
      max: 100,
      step: 1,
      suffix: '%',
      helpText: 'Percentage of home price paid upfront. Below 20% typically requires PMI.',
    },
    {
      key: 'rate',
      label: 'Interest Rate',
      type: 'percent',
      default: 6.87,
      min: 0.5,
      max: 15,
      step: 0.125,
      suffix: '%',
      helpText: 'Annual mortgage interest rate.',
    },
    {
      key: 'term',
      label: 'Loan Term',
      type: 'select',
      default: '30',
      options: [
        { value: '10', label: '10 Years' },
        { value: '15', label: '15 Years' },
        { value: '20', label: '20 Years' },
        { value: '25', label: '25 Years' },
        { value: '30', label: '30 Years' },
      ],
      helpText: 'Length of the mortgage loan.',
    },
    {
      key: 'tax',
      label: 'Annual Property Tax',
      type: 'currency',
      default: 4800,
      min: 0,
      max: 100000,
      step: 100,
      prefix: '$',
      helpText: 'Annual property tax (typically 1-2% of home value).',
    },
    {
      key: 'insurance',
      label: 'Annual Home Insurance',
      type: 'currency',
      default: 1500,
      min: 0,
      max: 50000,
      step: 100,
      prefix: '$',
      helpText: 'Annual homeowner\'s insurance premium.',
    },
    {
      key: 'pmi',
      label: 'PMI Rate',
      type: 'percent',
      default: 0.5,
      min: 0,
      max: 2,
      step: 0.1,
      suffix: '%',
      helpText: 'Private Mortgage Insurance rate (required if down payment < 20%).',
    },
  ],
  seo: {
    title: 'Mortgage Calculator – Monthly Payment & Amortization | FinanceCalc Pro',
    description: 'Calculate your monthly mortgage payment with taxes, insurance, and PMI. Compare 15-year vs 30-year terms and view a full amortization schedule.',
    keywords: ['mortgage calculator', 'home loan calculator', 'monthly mortgage payment', 'mortgage amortization', '30 year mortgage', '15 year mortgage', 'house payment calculator'],
  },
};

const etfExpenseAnalyzer: CalculatorConfig = {
  slug: 'etf-expense-analyzer',
  locales: ['us'],
  title: 'ETF Expense Ratio Analyzer',
  shortTitle: 'ETF Expenses',
  description: 'See how fund expense ratios eat into your returns over time. Compare two funds side-by-side to see the real cost difference.',
  category: 'investment',
  icon: '🔍',
  engineFn: 'analyzeETFExpenses',
  fields: [
    {
      key: 'investment',
      label: 'Investment Amount',
      type: 'currency',
      default: 100000,
      min: 100,
      max: 100000000,
      step: 1000,
      prefix: '$',
      helpText: 'Total amount invested in the fund.',
    },
    {
      key: 'roi',
      label: 'Expected Annual Return',
      type: 'percent',
      default: 10,
      min: 1,
      max: 25,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected gross annual return before fees.',
    },
    {
      key: 'years',
      label: 'Investment Period',
      type: 'number',
      default: 30,
      min: 1,
      max: 50,
      step: 1,
      suffix: 'years',
      helpText: 'How many years you plan to hold the investment.',
    },
    {
      key: 'expense1',
      label: 'Fund A Expense Ratio',
      type: 'percent',
      default: 0.03,
      min: 0,
      max: 3,
      step: 0.01,
      suffix: '%',
      helpText: 'Expense ratio of Fund A (e.g., VOO at 0.03%).',
    },
    {
      key: 'expense2',
      label: 'Fund B Expense Ratio',
      type: 'percent',
      default: 0.75,
      min: 0,
      max: 3,
      step: 0.01,
      suffix: '%',
      helpText: 'Expense ratio of Fund B to compare against.',
    },
    {
      key: 'monthly',
      label: 'Monthly Contribution',
      type: 'currency',
      default: 1000,
      min: 0,
      max: 1000000,
      step: 100,
      prefix: '$',
      helpText: 'Additional monthly investment.',
    },
  ],
  seo: {
    title: 'ETF Expense Ratio Analyzer – Compare Fund Costs | FinanceCalc Pro',
    description: 'See how ETF and mutual fund expense ratios impact your returns over time. Compare two funds side-by-side with our free expense analyzer.',
    keywords: ['ETF expense ratio', 'fund expense analyzer', 'expense ratio calculator', 'ETF cost comparison', 'mutual fund fees', 'index fund expenses', 'investment fees'],
  },
};

const capitalGainsTax: CalculatorConfig = {
  slug: 'capital-gains-tax',
  locales: ['us'],
  title: 'Capital Gains Tax Calculator (US)',
  shortTitle: 'Capital Gains Tax',
  description: 'Estimate your federal capital gains tax on stock sales. Supports short-term and long-term gains with 2024 tax brackets.',
  category: 'tax',
  icon: '🧾',
  engineFn: 'calculateCapitalGainsTax',
  fields: [
    {
      key: 'purchase',
      label: 'Purchase Price (Cost Basis)',
      type: 'currency',
      default: 10000,
      min: 0,
      max: 100000000,
      step: 100,
      prefix: '$',
      helpText: 'The total amount you paid for the investment.',
    },
    {
      key: 'sale',
      label: 'Sale Price',
      type: 'currency',
      default: 15000,
      min: 0,
      max: 100000000,
      step: 100,
      prefix: '$',
      helpText: 'The price at which you sold (or plan to sell) the investment.',
    },
    {
      key: 'holding',
      label: 'Holding Period',
      type: 'select',
      default: 'long',
      options: [
        { value: 'short', label: 'Short-Term (< 1 year)' },
        { value: 'long', label: 'Long-Term (≥ 1 year)' },
      ],
      helpText: 'Short-term gains are taxed as ordinary income; long-term gains get preferential rates.',
    },
    {
      key: 'income',
      label: 'Annual Taxable Income',
      type: 'currency',
      default: 85000,
      min: 0,
      max: 100000000,
      step: 1000,
      prefix: '$',
      helpText: 'Your ordinary taxable income (to determine your LTCG bracket).',
    },
    {
      key: 'filing',
      label: 'Filing Status',
      type: 'select',
      default: 'single',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'mfj', label: 'Married Filing Jointly' },
        { value: 'mfs', label: 'Married Filing Separately' },
        { value: 'hoh', label: 'Head of Household' },
      ],
      helpText: 'Your tax filing status affects your tax brackets.',
    },
    {
      key: 'state_tax',
      label: 'State Tax Rate',
      type: 'percent',
      default: 5,
      min: 0,
      max: 15,
      step: 0.5,
      suffix: '%',
      helpText: 'Your state\'s capital gains tax rate (0% for states with no income tax).',
    },
  ],
  seo: {
    title: 'Capital Gains Tax Calculator – US Federal & State | FinanceCalc Pro',
    description: 'Estimate your capital gains tax on stock, real estate, or crypto sales. Covers short-term and long-term gains with 2024 federal and state tax brackets.',
    keywords: ['capital gains tax calculator', 'stock tax calculator', 'LTCG tax', 'short term capital gains', 'long term capital gains', 'investment tax', 'crypto tax calculator'],
  },
};

// ─── India Calculators (6) ──────────────────────────────────────────────────

const ppfCalculator: CalculatorConfig = {
  slug: 'ppf-calculator',
  locales: ['in'],
  title: 'PPF Calculator – Public Provident Fund',
  shortTitle: 'PPF',
  description: 'Calculate your PPF maturity amount, yearly interest, and tax savings under Section 80C. See how your PPF grows over 15 years with yearly breakdowns.',
  category: 'savings',
  icon: '🏦',
  engineFn: 'calculatePPF',
  fields: [
    {
      key: 'annual',
      label: 'Annual Deposit',
      type: 'currency',
      default: 150000,
      min: 500,
      max: 150000,
      step: 500,
      prefix: '₹',
      helpText: 'Annual PPF deposit. Min ₹500, Max ₹1,50,000 per financial year.',
    },
    {
      key: 'rate',
      label: 'PPF Interest Rate',
      type: 'percent',
      default: 7.1,
      min: 5,
      max: 12,
      step: 0.1,
      suffix: '%',
      helpText: 'Current PPF interest rate (set by the government quarterly). Current: 7.1%.',
    },
    {
      key: 'years',
      label: 'Investment Period',
      type: 'number',
      default: 15,
      min: 15,
      max: 50,
      step: 5,
      suffix: 'years',
      helpText: 'PPF has a 15-year lock-in. Can be extended in blocks of 5 years.',
    },
    {
      key: 'existing',
      label: 'Existing PPF Balance',
      type: 'currency',
      default: 0,
      min: 0,
      max: 100000000,
      step: 10000,
      prefix: '₹',
      helpText: 'Current balance in your PPF account (if any).',
    },
  ],
  seo: {
    title: 'PPF Calculator – Public Provident Fund Returns & Maturity | FinanceCalc Pro',
    description: 'Calculate your PPF maturity amount with yearly interest breakdown. See how your Public Provident Fund grows over 15+ years with tax-free returns under Section 80C.',
    keywords: ['PPF calculator', 'public provident fund', 'PPF maturity', 'PPF interest rate', 'PPF returns', 'section 80C', 'PPF investment', 'tax free investment India'],
  },
};

const epfoCalculator: CalculatorConfig = {
  slug: 'epfo-calculator',
  locales: ['in'],
  title: 'EPFO Calculator – Employee Provident Fund',
  shortTitle: 'EPF/EPFO',
  description: 'Estimate your EPF corpus at retirement. Calculates employee and employer contributions, EPS pension, and projected growth based on salary increments.',
  category: 'retirement',
  icon: '👷',
  engineFn: 'calculateEPFO',
  fields: [
    {
      key: 'lpa',
      label: 'Annual CTC (LPA)',
      type: 'currency',
      default: 1200000,
      min: 100000,
      max: 100000000,
      step: 50000,
      prefix: '₹',
      helpText: 'Your total annual CTC package. We estimate Basic Salary from this.',
    },
    {
      key: 'age',
      label: 'Current Age',
      type: 'number',
      default: 28,
      min: 18,
      max: 58,
      step: 1,
      suffix: 'years',
      helpText: 'Your current age.',
    },
    {
      key: 'retire_age',
      label: 'Retirement Age',
      type: 'number',
      default: 58,
      min: 50,
      max: 60,
      step: 1,
      suffix: 'years',
      helpText: 'EPF retirement age (typically 58).',
    },
    {
      key: 'existing',
      label: 'Existing EPF Balance',
      type: 'currency',
      default: 0,
      min: 0,
      max: 50000000,
      step: 10000,
      prefix: '₹',
      helpText: 'Current balance in your EPF account.',
    },
    {
      key: 'basic_percent',
      label: 'Basic Salary % of CTC',
      type: 'percent',
      default: 50,
      min: 10,
      max: 100,
      step: 1,
      suffix: '%',
      helpText: 'What percentage of your CTC is Basic Salary? Usually 40-50%.',
      advanced: true,
    },
    {
      key: 'rate',
      label: 'EPF Interest Rate',
      type: 'percent',
      default: 8.25,
      min: 5,
      max: 12,
      step: 0.1,
      suffix: '%',
      helpText: 'Current EPF interest rate. FY 2024-25: 8.25%.',
      advanced: true,
    },
    {
      key: 'raise',
      label: 'Annual Salary Increment',
      type: 'percent',
      default: 5,
      min: 0,
      max: 20,
      step: 1,
      suffix: '%',
      helpText: 'Expected annual percentage increase in salary.',
      advanced: true,
    },
    {
      key: 'employee_rate',
      label: 'Employee Contribution Rate',
      type: 'percent',
      default: 12,
      min: 12,
      max: 12,
      step: 0,
      suffix: '%',
      helpText: 'Employee contribution is fixed at 12% of basic + DA.',
    },

  ],
  seo: {
    title: 'EPFO Calculator – EPF Retirement Corpus Estimator | FinanceCalc Pro',
    description: 'Calculate your EPF corpus at retirement with employee & employer contributions, salary growth, and EPS pension estimation. Free EPFO calculator for India.',
    keywords: ['EPF calculator', 'EPFO calculator', 'provident fund calculator', 'EPF retirement', 'employee provident fund', 'EPF interest rate', 'EPS pension calculator'],
  },
};

const npsCalculator: CalculatorConfig = {
  slug: 'nps-calculator',
  locales: ['in'],
  title: 'NPS Calculator – National Pension System',
  shortTitle: 'NPS',
  description: 'Estimate your NPS corpus and monthly pension at retirement. Compare asset allocation strategies (equity, corporate bonds, government securities).',
  category: 'retirement',
  icon: '🧓',
  engineFn: 'calculateNPS',
  fields: [
    {
      key: 'monthly',
      label: 'Monthly Contribution',
      type: 'currency',
      default: 5000,
      min: 500,
      max: 10000000,
      step: 500,
      prefix: '₹',
      helpText: 'Amount you contribute to NPS every month.',
    },
    {
      key: 'age',
      label: 'Current Age',
      type: 'number',
      default: 30,
      min: 18,
      max: 65,
      step: 1,
      suffix: 'years',
      helpText: 'Your current age.',
    },
    {
      key: 'retire_age',
      label: 'Retirement Age',
      type: 'number',
      default: 60,
      min: 55,
      max: 70,
      step: 1,
      suffix: 'years',
      helpText: 'Your expected retirement age.',
    },
    {
      key: 'equity',
      label: 'Equity Allocation',
      type: 'percent',
      default: 50,
      min: 0,
      max: 75,
      step: 5,
      suffix: '%',
      helpText: 'Percentage allocated to equities (max 75% under Active Choice).',
    },
    {
      key: 'equity_return',
      label: 'Expected Equity Return',
      type: 'percent',
      default: 12,
      min: 5,
      max: 20,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected annual return from the equity (E) fund.',
    },
    {
      key: 'debt_return',
      label: 'Expected Debt Return',
      type: 'percent',
      default: 8,
      min: 4,
      max: 12,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected annual return from corporate bonds (C) and govt securities (G).',
    },
    {
      key: 'annuity',
      label: 'Annuity Percentage',
      type: 'percent',
      default: 40,
      min: 40,
      max: 100,
      step: 5,
      suffix: '%',
      helpText: 'Minimum 40% of corpus must be used to buy annuity for monthly pension.',
    },
    {
      key: 'annuity_rate',
      label: 'Annuity Rate',
      type: 'percent',
      default: 6,
      min: 3,
      max: 10,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected annual annuity rate from the insurance provider.',
    },
  ],
  seo: {
    title: 'NPS Calculator – National Pension System Returns | FinanceCalc Pro',
    description: 'Calculate your NPS corpus and monthly pension at retirement. Compare equity and debt allocations. Includes 80CCD(1B) tax benefit calculations.',
    keywords: ['NPS calculator', 'National Pension System', 'NPS returns', 'NPS pension calculator', 'NPS investment', '80CCD', 'NPS equity', 'pension scheme India'],
  },
};

const mutualFundReturns: CalculatorConfig = {
  slug: 'mutual-fund-returns',
  locales: ['in'],
  title: 'Mutual Fund Returns Calculator',
  shortTitle: 'MF Returns',
  description: 'Calculate lump sum and SIP returns for mutual fund investments. Compare CAGR, XIRR, and absolute returns with LTCG/STCG tax estimation.',
  category: 'investment',
  icon: '📊',
  engineFn: 'calculateMutualFundReturns',
  fields: [
    {
      key: 'type',
      label: 'Investment Type',
      type: 'select',
      default: 'sip',
      options: [
        { value: 'sip', label: 'SIP (Monthly)' },
        { value: 'lumpsum', label: 'Lump Sum' },
        { value: 'both', label: 'SIP + Lump Sum' },
      ],
      helpText: 'Choose between SIP, lump sum, or a combination of both.',
    },
    {
      key: 'sip_amount',
      label: 'Monthly SIP Amount',
      type: 'currency',
      default: 10000,
      min: 500,
      max: 10000000,
      step: 500,
      prefix: '₹',
      helpText: 'Monthly SIP investment amount.',
    },
    {
      key: 'lumpsum',
      label: 'Lump Sum Amount',
      type: 'currency',
      default: 100000,
      min: 0,
      max: 100000000,
      step: 5000,
      prefix: '₹',
      helpText: 'One-time lump sum investment amount.',
    },
    {
      key: 'rate',
      label: 'Expected Annual Return',
      type: 'percent',
      default: 12,
      min: 1,
      max: 30,
      step: 0.5,
      suffix: '%',
      helpText: 'Expected CAGR of the mutual fund (historical average for equity MFs: 12-15%).',
    },
    {
      key: 'years',
      label: 'Investment Period',
      type: 'number',
      default: 10,
      min: 1,
      max: 40,
      step: 1,
      suffix: 'years',
      helpText: 'Number of years you plan to stay invested.',
    },
    {
      key: 'expense',
      label: 'Expense Ratio',
      type: 'percent',
      default: 0.5,
      min: 0,
      max: 3,
      step: 0.1,
      suffix: '%',
      helpText: 'Annual fund management fee (direct plans: 0.1-0.5%, regular: 1-2.5%).',
    },
    {
      key: 'category',
      label: 'Fund Category',
      type: 'select',
      default: 'equity',
      options: [
        { value: 'equity', label: 'Equity Fund' },
        { value: 'debt', label: 'Debt Fund' },
        { value: 'hybrid', label: 'Hybrid Fund' },
        { value: 'elss', label: 'ELSS (Tax Saver)' },
      ],
      helpText: 'Fund category affects taxation (equity vs debt LTCG/STCG rates differ).',
    },
  ],
  seo: {
    title: 'Mutual Fund Returns Calculator – SIP & Lump Sum | FinanceCalc Pro',
    description: 'Calculate mutual fund SIP and lump sum returns with CAGR, XIRR, expense ratio impact, and LTCG/STCG tax estimation. Free mutual fund calculator for India.',
    keywords: ['mutual fund calculator', 'SIP calculator India', 'mutual fund returns', 'CAGR calculator', 'lump sum calculator', 'ELSS calculator', 'mutual fund investment'],
  },
};

const ssyCalculator: CalculatorConfig = {
  slug: 'ssy-calculator',
  locales: ['in'],
  title: 'SSY Calculator – Sukanya Samriddhi Yojana',
  shortTitle: 'SSY',
  description: 'Calculate Sukanya Samriddhi Yojana maturity amount. Tax-free returns under EEE status with Section 80C deduction. For girl child investments.',
  category: 'savings',
  icon: '👧',
  engineFn: 'calculateSSY',
  fields: [
    {
      key: 'annual',
      label: 'Annual Deposit',
      type: 'currency',
      default: 150000,
      min: 250,
      max: 150000,
      step: 250,
      prefix: '₹',
      helpText: 'Annual deposit amount. Min ₹250, Max ₹1,50,000 per year.',
    },
    {
      key: 'rate',
      label: 'SSY Interest Rate',
      type: 'percent',
      default: 8.2,
      min: 5,
      max: 12,
      step: 0.1,
      suffix: '%',
      helpText: 'Current SSY interest rate (government-set, quarterly). Current: 8.2%.',
    },
    {
      key: 'girl_age',
      label: 'Girl Child\'s Current Age',
      type: 'number',
      default: 5,
      min: 0,
      max: 10,
      step: 1,
      suffix: 'years',
      helpText: 'Account can be opened for a girl child up to age 10.',
    },
  ],
  seo: {
    title: 'SSY Calculator – Sukanya Samriddhi Yojana Maturity | FinanceCalc Pro',
    description: 'Calculate Sukanya Samriddhi Yojana (SSY) maturity amount and interest earned. Tax-free returns with Section 80C benefits for your girl child\'s future.',
    keywords: ['SSY calculator', 'Sukanya Samriddhi Yojana', 'SSY maturity', 'SSY interest rate', 'girl child investment', 'SSY scheme', 'section 80C SSY'],
  },
};

const section80cOptimizer: CalculatorConfig = {
  slug: 'section-80c-optimizer',
  locales: ['in'],
  title: 'Section 80C Tax Optimizer',
  shortTitle: '80C Optimizer',
  description: 'Optimize your Section 80C investments (₹1.5L limit). Compare PPF, ELSS, NPS, insurance, and other 80C instruments for maximum tax savings and returns.',
  category: 'tax',
  icon: '🧮',
  engineFn: 'optimizeSection80C',
  proFeature: true,
  fields: [
    {
      key: 'income',
      label: 'Gross Annual Income',
      type: 'currency',
      default: 1200000,
      min: 250000,
      max: 100000000,
      step: 50000,
      prefix: '₹',
      helpText: 'Your gross annual taxable income.',
    },
    {
      key: 'regime',
      label: 'Tax Regime',
      type: 'select',
      default: 'old',
      options: [
        { value: 'old', label: 'Old Regime (with deductions)' },
        { value: 'new', label: 'New Regime (lower rates, no deductions)' },
      ],
      helpText: 'Section 80C is only applicable under the Old Tax Regime.',
    },
    {
      key: 'epf',
      label: 'EPF Contribution (yearly)',
      type: 'currency',
      default: 21600,
      min: 0,
      max: 150000,
      step: 1000,
      prefix: '₹',
      helpText: 'Your annual employee EPF contribution (counted under 80C).',
    },
    {
      key: 'ppf',
      label: 'PPF Deposit',
      type: 'currency',
      default: 50000,
      min: 0,
      max: 150000,
      step: 5000,
      prefix: '₹',
      helpText: 'Annual PPF deposit. Tax-free returns (EEE). Lock-in: 15 years.',
    },
    {
      key: 'elss',
      label: 'ELSS Mutual Fund',
      type: 'currency',
      default: 50000,
      min: 0,
      max: 150000,
      step: 5000,
      prefix: '₹',
      helpText: 'ELSS investments. Shortest lock-in (3 years) among 80C options. Market-linked.',
    },
    {
      key: 'insurance',
      label: 'Life Insurance Premium',
      type: 'currency',
      default: 15000,
      min: 0,
      max: 150000,
      step: 1000,
      prefix: '₹',
      helpText: 'Annual life insurance premium (term or endowment).',
    },
    {
      key: 'nps_80ccd1',
      label: 'NPS (80CCD1 within 80C)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 150000,
      step: 5000,
      prefix: '₹',
      helpText: 'NPS contribution under 80CCD(1) counted within 80C limit.',
    },
    {
      key: 'nps_80ccd1b',
      label: 'NPS Additional (80CCD1B)',
      type: 'currency',
      default: 50000,
      min: 0,
      max: 50000,
      step: 5000,
      prefix: '₹',
      helpText: 'Additional ₹50,000 deduction for NPS under 80CCD(1B) — over and above 80C.',
    },
    {
      key: 'others',
      label: 'Other 80C (Tuition, NSC, etc.)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 150000,
      step: 5000,
      prefix: '₹',
      helpText: 'Tuition fees, NSC, SCSS, 5-year FD, stamp duty, etc.',
    },
  ],
  seo: {
    title: 'Section 80C Tax Optimizer – Maximize Deductions | FinanceCalc Pro',
    description: 'Optimize your Section 80C investments for maximum tax savings. Compare PPF, ELSS, NPS, insurance, and EPF. Includes 80CCD(1B) additional deduction.',
    keywords: ['Section 80C', '80C tax saving', 'tax optimizer India', 'ELSS vs PPF', '80C deduction', '80CCD1B', 'tax planning India', 'income tax India'],
  },
};

// ─── Registry ───────────────────────────────────────────────────────────────

/** All calculator configs in a flat array */
export const CALCULATOR_REGISTRY: CalculatorConfig[] = [
  // Global (6)
  compoundInterest,
  sipCalculator,
  loanEmi,
  inflationAdjuster,
  fireCalculator,
  netWorthTracker,
  // USA (5)
  calculator401k,
  iraCalculator,
  mortgageCalculator,
  etfExpenseAnalyzer,
  capitalGainsTax,
  // India (6)
  ppfCalculator,
  epfoCalculator,
  npsCalculator,
  mutualFundReturns,
  ssyCalculator,
  section80cOptimizer,
];

/** Lookup map by slug */
export const CALCULATOR_BY_SLUG: Record<string, CalculatorConfig> = {};
for (const calc of CALCULATOR_REGISTRY) {
  CALCULATOR_BY_SLUG[calc.slug] = calc;
}

/**
 * Get calculator config by slug.
 */
export function getCalculator(slug: string): CalculatorConfig | undefined {
  return CALCULATOR_BY_SLUG[slug];
}

/**
 * Get all calculators available for a given locale.
 */
export function getCalculatorsForLocale(locale: string): CalculatorConfig[] {
  return CALCULATOR_REGISTRY.filter((c) => c.locales.includes(locale));
}

/**
 * Get all calculators in a category.
 */
export function getCalculatorsByCategory(
  category: CalculatorConfig['category']
): CalculatorConfig[] {
  return CALCULATOR_REGISTRY.filter((c) => c.category === category);
}

/**
 * Get all unique categories from the registry.
 */
export function getCategories(): CalculatorConfig['category'][] {
  return [...new Set(CALCULATOR_REGISTRY.map((c) => c.category))];
}

/**
 * Get the default values for a calculator as a key-value map.
 */
export function getCalculatorDefaults(slug: string): Record<string, number | string | boolean> {
  const calc = getCalculator(slug);
  if (!calc) return {};
  const defaults: Record<string, number | string | boolean> = {};
  for (const field of calc.fields) {
    defaults[field.key] = field.default;
  }
  return defaults;
}
