const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, '../src/data/hazardous-ingredients-db-v2.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// 워크북 생성
const workbook = XLSX.utils.book_new();

// 1. 성분 목록 시트
const ingredientsData = data.ingredients.map(item => ({
  'ID': item.id,
  '한글명': item.name,
  '영문명': item.nameEn,
  '동의어': item.synonyms.join(', '),
  '카테고리': item.category,
  '위험도': item.riskLevel,
  '건강 우려사항': item.healthConcerns.join(', '),
  '왜 위험한가요': item.whyDangerous,
  '어떻게 피하나요': item.howToAvoid,
  '주로 발견되는 곳': item.sources.join(', '),
  '규제 현황': item.regulatoryStatus,
  '상세 설명': item.description
}));

const ingredientsSheet = XLSX.utils.json_to_sheet(ingredientsData);
XLSX.utils.book_append_sheet(workbook, ingredientsSheet, '성분 목록');

// 2. 포장재 경고 시트
if (data.packaging && data.packaging.length > 0) {
  const packagingData = data.packaging.map(item => ({
    'ID': item.id,
    '이름': item.name,
    '포장재 타입': item.type,
    '위험도': item.riskLevel,
    '관련 성분': Array.isArray(item.concernedIngredient)
      ? item.concernedIngredient.join(', ')
      : item.concernedIngredient || '없음',
    '왜 위험한가요': item.whyDangerous,
    '어떻게 피하나요': item.howToAvoid,
    '시각적 단서': item.visualCues.join(', '),
    '상세 설명': item.description
  }));

  const packagingSheet = XLSX.utils.json_to_sheet(packagingData);
  XLSX.utils.book_append_sheet(workbook, packagingSheet, '포장재 경고');
}

// 3. 메타데이터 시트
const metadataData = [
  { '항목': '버전', '값': data.metadata.version },
  { '항목': '최종 업데이트', '값': data.metadata.lastUpdated },
  { '항목': '출처', '값': data.metadata.source },
  { '항목': '목적', '값': data.metadata.purpose },
  { '항목': '변경 이력', '값': data.metadata.changelog },
  { '항목': '총 성분 수', '값': data.metadata.totalIngredients },
  { '항목': '', '값': '' },
  { '항목': '카테고리별 분류', '값': '' },
  { '항목': 'EDC', '값': data.metadata.breakdown.EDC },
  { '항목': 'Phthalates', '값': data.metadata.breakdown.Phthalates },
  { '항목': 'Preservatives', '값': data.metadata.breakdown.Preservatives },
  { '항목': 'TarColor', '값': data.metadata.breakdown.TarColor },
  { '항목': 'FlavorEnhancer', '값': data.metadata.breakdown.FlavorEnhancer },
  { '항목': 'NaturalColor', '값': data.metadata.breakdown.NaturalColor },
  { '항목': 'ArtificialSweetener', '값': data.metadata.breakdown.ArtificialSweetener },
];

const metadataSheet = XLSX.utils.json_to_sheet(metadataData);
XLSX.utils.book_append_sheet(workbook, metadataSheet, '메타데이터');

// 4. 카테고리 설명 시트
if (data.categories) {
  const categoriesData = Object.entries(data.categories).map(([key, value]) => ({
    '카테고리 코드': key,
    '설명': value
  }));

  const categoriesSheet = XLSX.utils.json_to_sheet(categoriesData);
  XLSX.utils.book_append_sheet(workbook, categoriesSheet, '카테고리 설명');
}

// 5. 위험도 설명 시트
if (data.riskLevels) {
  const riskLevelsData = Object.entries(data.riskLevels).map(([key, value]) => ({
    '위험도': key,
    '라벨': value.label,
    '설명': value.description,
    '점수': value.score
  }));

  const riskLevelsSheet = XLSX.utils.json_to_sheet(riskLevelsData);
  XLSX.utils.book_append_sheet(workbook, riskLevelsSheet, '위험도 설명');
}

// 엑셀 파일 저장
const outputPath = path.join(__dirname, '../../hazardous-ingredients-db.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ 엑셀 파일이 생성되었습니다!');
console.log(`📁 위치: ${outputPath}`);
console.log(`📊 총 ${data.ingredients.length}개 성분`);
console.log(`📋 시트: 성분 목록, 포장재 경고, 메타데이터, 카테고리 설명, 위험도 설명`);
