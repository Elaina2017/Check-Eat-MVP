import { HazardousIngredient, PackagingWarning } from '@/data/hazardous-ingredients.types';

export interface AnalysisRequest {
  image: string; // base64 encoded image
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  foundIngredients: FoundIngredient[];
  packagingWarnings: PackagingWarning[];
  ocrText: string;
  packagingType?: 'Can' | 'Plastic' | 'Paper';
}

export interface FoundIngredient {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  riskLevel: 'RED' | 'YELLOW' | 'ORANGE';
  whyDangerous: string;
  healthConcerns: string[];
  howToAvoid: string;
}

export interface OCRResult {
  text: string;
  detectedIngredients: string[];
}

export interface PackagingAnalysisResult {
  type: 'Can' | 'Plastic' | 'Paper' | 'Unknown';
  confidence: number;
}
