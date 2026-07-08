import { CALCULATOR_REGISTRY, getCalculator } from '../../../../lib/calculators';

export function getCalculatorConfig(slug: string) {
  return getCalculator(slug);
}

export function getAllCalculatorSlugs() {
  return CALCULATOR_REGISTRY.map(c => c.slug);
}
