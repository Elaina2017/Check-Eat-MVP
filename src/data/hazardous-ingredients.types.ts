/**
 * Check-Eat MVP - 위험 성분 DB 타입 정의
 *
 * 이 타입 정의는 hazardous-ingredients-db.json과 매핑됩니다.
 */

export type RiskLevel = 'RED' | 'YELLOW' | 'ORANGE';

export type IngredientCategory =
  | 'EDC'              // 내분비계 장애물질
  | 'Phthalates'       // 프탈레이트류
  | 'Preservatives'    // 합성 보존료
  | 'TarColor'         // 타르색소
  | 'FlavorEnhancer';  // 화학조미료

export type PackagingType = 'Can' | 'Plastic' | 'Paper';

export interface HazardousIngredient {
  id: string;
  name: string;                    // 한글명
  nameEn: string;                  // 영문명
  synonyms: string[];              // 동의어 (다양한 표기)
  category: IngredientCategory;
  riskLevel: RiskLevel;
  healthConcerns: string[];        // 건강 우려사항
  description: string;             // 상세 설명
  whyDangerous: string;            // ⓘ 아이콘용 간결한 설명 (1-2줄)
  howToAvoid: string;              // 피하는 방법
  sources: string[];               // 주로 발견되는 곳
  regulatoryStatus: string;        // 규제 현황
}

export interface PackagingWarning {
  id: string;
  name: string;
  type: PackagingType;
  riskLevel: 'ORANGE';
  concernedIngredient: string | string[] | null;  // 관련 성분 ID
  description: string;
  whyDangerous: string;            // ⓘ 아이콘용 간결한 설명
  howToAvoid: string;              // 피하는 방법
  visualCues: string[];            // 시각적 단서
}

export interface RiskLevelInfo {
  label: string;
  description: string;
  score: number;
}

export interface HazardousIngredientsDB {
  metadata: {
    version: string;
    lastUpdated: string;
    source: string;
    purpose: string;
  };
  ingredients: HazardousIngredient[];
  packaging: PackagingWarning[];
  categories: Record<IngredientCategory, string>;
  riskLevels: Record<RiskLevel, RiskLevelInfo>;
}

// ===== 유틸리티 함수 =====

/**
 * 성분 이름으로 DB에서 검색 (대소문자 무시, 동의어 포함)
 */
export function findIngredientByName(
  db: HazardousIngredientsDB,
  searchTerm: string
): HazardousIngredient | undefined {
  // 공백, 특수문자 제거 및 소문자 변환
  const normalized = searchTerm
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')           // 공백 제거
    .replace(/[-.(),，]/g, '');    // 하이픈, 점, 괄호, 쉼표 제거

  // 너무 짧은 검색어는 무시 (2글자 이하)
  if (normalized.length <= 2) {
    return undefined;
  }

  return db.ingredients.find(ingredient => {
    const nameLower = ingredient.name.toLowerCase().replace(/\s+/g, '').replace(/[-.(),，]/g, '');
    const nameEnLower = ingredient.nameEn.toLowerCase().replace(/\s+/g, '').replace(/[-.(),，]/g, '');

    // 정확한 매칭 우선
    if (nameLower === normalized || nameEnLower === normalized) return true;

    // 긴 검색어(5글자 이상)만 부분 매칭 허용
    if (normalized.length >= 5) {
      // DB 항목이 검색어에 포함되는 경우만 허용 (검색어가 더 긴 경우)
      if (normalized.includes(nameLower) || normalized.includes(nameEnLower)) return true;
    }

    // 동의어 매칭
    return ingredient.synonyms.some(syn => {
      const synLower = syn.toLowerCase().replace(/\s+/g, '').replace(/[-.(),，]/g, '');

      // 정확한 매칭
      if (synLower === normalized) return true;

      // 긴 검색어만 부분 매칭
      if (normalized.length >= 5) {
        return normalized.includes(synLower);
      }

      return false;
    });
  });
}

/**
 * 여러 성분명을 일괄 검색
 */
export function findMultipleIngredients(
  db: HazardousIngredientsDB,
  ingredientNames: string[]
): HazardousIngredient[] {
  const found: HazardousIngredient[] = [];
  const foundIds = new Set<string>();

  for (const name of ingredientNames) {
    const ingredient = findIngredientByName(db, name);
    if (ingredient && !foundIds.has(ingredient.id)) {
      found.push(ingredient);
      foundIds.add(ingredient.id);
    }
  }

  return found;
}

/**
 * 위험도별로 성분 분류
 */
export function categorizeByRiskLevel(
  ingredients: HazardousIngredient[]
): {
  red: HazardousIngredient[];
  yellow: HazardousIngredient[];
} {
  return {
    red: ingredients.filter(i => i.riskLevel === 'RED'),
    yellow: ingredients.filter(i => i.riskLevel === 'YELLOW'),
  };
}

/**
 * 점수 계산 (PRD의 점수 규칙 적용)
 */
export function calculateScore(
  db: HazardousIngredientsDB,
  redCount: number,
  yellowCount: number,
  orangeCount: number
): number {
  const redScore = Math.min(redCount * 30, 60);     // 최대 -60
  const yellowScore = Math.min(yellowCount * 10, 30); // 최대 -30
  const orangeScore = Math.min(orangeCount * 20, 40); // 최대 -40

  const finalScore = 100 - redScore - yellowScore - orangeScore;

  return Math.max(0, Math.min(100, finalScore)); // 0-100 범위로 clamp
}

/**
 * 전체 위험도 결정 (PRD 규칙: RED/YELLOW만 사용, ORANGE 제외)
 */
export function determineOverallRisk(
  redCount: number,
  yellowCount: number
): 'DANGER' | 'CAUTION' | 'SAFE' {
  if (redCount > 0) return 'DANGER';
  if (yellowCount > 0) return 'CAUTION';
  return 'SAFE';
}

// ===== API 응답 인터페이스 (PRD와 일치) =====

export interface AnalysisResult {
  overallScore: number;           // 0-100
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  foundIngredients: Array<{
    name: string;
    category: string;
    risk: 'RED' | 'YELLOW' | 'ORANGE';
    reason: string;
    sources?: string[];
  }>;
  analyzedText?: string;          // OCR로 추출한 전체 텍스트
}

export interface Product {
  name?: string;
  category?: string;
  manufacturer?: string;
  imageUrl?: string;
}
