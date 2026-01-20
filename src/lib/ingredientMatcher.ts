import { HazardousIngredientsDB, HazardousIngredient, findMultipleIngredients } from '@/data/hazardous-ingredients.types';
import { FoundIngredient } from '@/types/analysis';

export function matchIngredients(
  db: HazardousIngredientsDB,
  detectedTexts: string[]
): FoundIngredient[] {
  const foundIngredients = findMultipleIngredients(db, detectedTexts);

  return foundIngredients.map(ingredient => ({
    id: ingredient.id,
    name: ingredient.name,
    nameEn: ingredient.nameEn,
    category: ingredient.category,
    riskLevel: ingredient.riskLevel,
    whyDangerous: ingredient.whyDangerous,
    healthConcerns: ingredient.healthConcerns,
    howToAvoid: ingredient.howToAvoid,
  }));
}

export function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[^\w\uAC00-\uD7A3]/g, ''); // 특수문자 제거, 한글/영문/숫자만
}
