import { calculateScore as calcScore, determineOverallRisk as determineRisk } from '@/data/hazardous-ingredients.types';
import { FoundIngredient } from '@/types/analysis';
import { PackagingWarning } from '@/data/hazardous-ingredients.types';

export interface ScoreResult {
  overallScore: number;
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  redCount: number;
  yellowCount: number;
  orangeCount: number;
}

export function calculateIngredientScore(
  foundIngredients: FoundIngredient[],
  packagingWarnings: PackagingWarning[]
): ScoreResult {
  const redCount = foundIngredients.filter(i => i.riskLevel === 'RED').length;
  const yellowCount = foundIngredients.filter(i => i.riskLevel === 'YELLOW').length;
  const orangeCount = packagingWarnings.length;

  const overallScore = calcScore(
    {} as any, // DB is not used in calcScore, just for signature
    redCount,
    yellowCount,
    orangeCount
  );

  const riskLevel = determineRisk(redCount, yellowCount);

  return {
    overallScore,
    riskLevel,
    redCount,
    yellowCount,
    orangeCount,
  };
}
