// @ts-nocheck
import nlp from 'compromise';

export interface NlpParseResult {
  actionType: 'calculate' | 'unknown';
  targetCalculatorSlug?: string;
  params: Record<string, string | number>;
  rawText: string;
  confidence: number;
}

const INSTRUMENT_MAP: Record<string, string[]> = {
  'sip-calculator': ['sip', 'monthly investment', 'mutual fund', 'mf', 'monthly'],
  'lumpsum-calculator': ['lumpsum investment', 'one time investment'],
  'swp-calculator': ['swp', 'systematic withdrawal', 'payout'],
  'step-up-sip': ['step up', 'step-up', 'increasing sip'],
  'income-tax-calculator': ['income tax', 'tax', 'salary tax'],
  'nps-calculator': ['nps', 'pension'],
  'mortgage-calculator': ['mortgage', 'home loan'],
  'loan-emi': ['emi', 'car loan', 'personal loan'],
  'compound-interest': ['compound interest', 'savings', 'wealth', 'fd', 'fixed deposit'],
  'capital-gains-tax': ['capital gains'],
  'ssy-calculator': ['ssy', 'sukanya'],
};

function normalizeFinancialNumbers(text: string): string {
  let cleaned = text.toLowerCase();
  
  // Convert 'k' or 'grand' to thousands
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*(k|grand)\b/gi, (_, num) => (parseFloat(num) * 1000).toString());
  // Convert 'lakh' or 'l' to hundred thousands
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*(lakhs?|l)\b/gi, (_, num) => (parseFloat(num) * 100000).toString());
  // Convert 'cr' or 'crore' to ten millions
  cleaned = cleaned.replace(/(\d+(?:\.\d+)?)\s*(crores?|cr)\b/gi, (_, num) => (parseFloat(num) * 10000000).toString());
  
  return cleaned;
}

export function parseNaturalLanguage(input: string): NlpParseResult {
  const normalizedText = normalizeFinancialNumbers(input);
  const doc = nlp(normalizedText);
  
  let targetSlug: string | undefined;
  
  // 1. Intent Classification: Find the calculator
  // We scan the document and the first match wins.
  for (const [slug, keywords] of Object.entries(INSTRUMENT_MAP)) {
    for (const keyword of keywords) {
      if (doc.has(keyword)) {
        targetSlug = slug;
        break;
      }
    }
    if (targetSlug) break;
  }
  
  const params: Record<string, string | number> = {};
  
  // 2. Extract values based on patterns
  
  // Percentage values -> rate
  let rateMatch = doc.match('#Percent');
  if (!rateMatch.found) rateMatch = doc.match('#Value (percent|percentage)');
  if (rateMatch.found) {
    const rateNumObj = ((rateMatch as any).numbers().json()[0] as any)?.number;
    const rateNum = typeof rateNumObj === 'object' ? rateNumObj.num : rateNumObj;
    if (rateNum !== undefined) params['rate'] = rateNum;
  }
  
  // Years
  let yearsMatch = doc.match('#Value (years|yrs|yr|year)');
  if (yearsMatch.found) {
    const yearsNumObj = (yearsMatch.numbers().json()[0] as any)?.number;
    const yearsNum = typeof yearsNumObj === 'object' ? yearsNumObj.num : yearsNumObj;
    if (yearsNum !== undefined) params['years'] = yearsNum;
  }
  
  // Lumpsum explicitly mentioned
  let lumpsumMatch = doc.match('(lumpsum|lumpsump|initial|upfront) #Value');
  if (!lumpsumMatch.found) lumpsumMatch = doc.match('#Value (lumpsum|lumpsump|initial|upfront)');
  if (lumpsumMatch.found) {
    const lsNumObj = (lumpsumMatch.numbers().json()[0] as any)?.number;
    const lsNum = typeof lsNumObj === 'object' ? lsNumObj.num : lsNumObj;
    if (lsNum !== undefined) {
      params['lumpsum'] = lsNum;
      params['principal'] = lsNum; // Alias just in case the calculator uses principal
      params['existing'] = lsNum; // Alias for SIP calculator
    }
  }
  
  // 3. Extract any remaining unbound values
  const allNumbers = doc.numbers().json().map((n: any) => {
    return typeof n.number === 'object' ? n.number.num : n.number;
  });
  const boundValues = new Set([
    params['rate'], 
    params['years'], 
    params['lumpsum']
  ]);
  
  const unboundNumbers = allNumbers.filter((n: number) => n !== null && !boundValues.has(n));
    
  if (unboundNumbers.length > 0) {
    // Determine the default field based on the calculator
    let defaultField = 'principal';
    if (targetSlug === 'sip-calculator') defaultField = 'monthly';
    if (targetSlug === 'swp-calculator') defaultField = 'withdrawal';
    if (targetSlug === 'nps-calculator') defaultField = 'monthly';
    if (targetSlug === 'income-tax-calculator') defaultField = 'salary';
    
    // If the default field isn't explicitly set yet, assign the first unbound number
    if (params[defaultField] === undefined) {
      params[defaultField] = unboundNumbers.shift();
    }
    
    // If there's another unbound number and no lumpsum, assign it based on heuristics
    if (unboundNumbers.length > 0 && params['lumpsum'] === undefined) {
       if (targetSlug === 'sip-calculator') {
          // SIPs usually have monthly and lumpsum
          const lsNum = unboundNumbers.shift();
          params['lumpsum'] = lsNum;
          params['existing'] = lsNum;
       } else if (params['years'] === undefined && unboundNumbers[0] < 50) {
          // arbitrary heuristic for years if still missing
          params['years'] = unboundNumbers.shift();
       } else if (params['principal'] === undefined) {
          params['principal'] = unboundNumbers.shift();
       }
    }
  }

  // Fallback if no targetSlug but we found numbers
  if (!targetSlug && Object.keys(params).length > 0) {
    targetSlug = 'compound-interest'; // default generic calculator
  }

  return {
    actionType: targetSlug ? 'calculate' : 'unknown',
    targetCalculatorSlug: targetSlug,
    params,
    rawText: input,
    confidence: targetSlug ? 1 : 0
  };
}
