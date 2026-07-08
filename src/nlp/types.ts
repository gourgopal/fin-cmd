export interface NLPInstruction {
  actionType: 'navigate' | 'calculate' | 'unknown';
  targetCalculatorSlug?: string;
  params: Record<string, number | string>;
  rawText: string;
  confidence: number;
}

export interface Token {
  type: 'number' | 'currency' | 'instrument' | 'action' | 'field' | 'percent' | 'word' | 'unknown';
  value: string;
  normalized: string;
}
