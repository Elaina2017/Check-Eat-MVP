# Check-Eat MVP - Claude Code 가이드

## 프로젝트 개요

**Check-Eat**는 식품 라벨 사진을 촬영하면 AI가 성분을 분석하여 유해 성분을 알려주는 모바일 웹 애플리케이션입니다.

- **타겟 사용자**: 어린이 자녀를 둔 부모
- **핵심 기능**: 제품 라벨 OCR → 성분 매칭 → 위험도 평가 (0-100점)
- **배포 상태**: ✅ Production (Vercel)
- **버전**: 2.0.0

## 기술 스택

```
Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
Backend: Next.js API Routes (Serverless)
OCR: Google Cloud Vision API
AI: OpenAI GPT-4 Vision (포장재 분석)
PWA: next-pwa
Hosting: Vercel
```

## 프로젝트 구조

```
check-eat-mvp/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 메인 페이지 (초기/분석/결과 화면)
│   │   ├── layout.tsx               # 루트 레이아웃 (메타데이터, PWA 설정)
│   │   ├── globals.css              # 글로벌 스타일
│   │   └── api/
│   │       └── analyze/
│   │           └── route.ts         # 이미지 분석 API
│   ├── lib/
│   │   ├── googleVision.ts          # Google Vision OCR
│   │   ├── openai.ts                # OpenAI GPT-4 Vision (포장재)
│   │   ├── ingredientMatcher.ts     # 성분 매칭 로직
│   │   ├── scoreCalculator.ts       # 점수 계산 로직
│   │   └── db.ts                    # DB 로드
│   ├── data/
│   │   ├── hazardous-ingredients-db-v2.json  # 위험 성분 DB (43개)
│   │   └── hazardous-ingredients.types.ts    # TypeScript 타입
│   └── types/
│       └── analysis.ts              # API 응답 타입
├── public/
│   ├── manifest.json                # PWA 매니페스트
│   ├── icon-192.png                 # PWA 아이콘
│   └── icon-512.png
├── scripts/
│   ├── json-to-excel.js             # DB → Excel 변환
│   └── generate-icons.html          # 아이콘 생성 도구
├── next.config.js                   # Next.js + PWA 설정
├── PRD.md                          # 상세 프로젝트 문서
└── .env.local                      # 환경 변수
```

## 핵심 파일 설명

### 1. `src/app/page.tsx` (메인 UI)
3단계 화면 구조:
- **초기 화면**: 카메라 촬영 버튼 + 갤러리 선택
- **분석 중**: 로딩 애니메이션 + 5초마다 변경되는 건강 팁
- **결과 화면**: 점수 카드 → 위험 성분 → 주의 성분 → 포장재 경고

파일 선택 시 자동으로 분석이 시작됨 (별도의 "분석하기" 버튼 없음)

### 2. `src/app/api/analyze/route.ts` (분석 엔진)
**처리 흐름**:
```
1. 이미지 수신 (FormData)
2. sharp로 리사이즈 + 최적화
3. 병렬 처리:
   - Google Vision API (OCR)
   - OpenAI GPT-4 Vision (포장재 타입)
4. OCR 결과 전처리:
   - 줄바꿈으로 분리
   - 쉼표로 개별 성분 분리 (,，)
   - 공백/특수문자 정규화
5. 성분 매칭 (hazardous-ingredients-db-v2.json)
6. 점수 계산 및 위험도 결정
7. JSON 응답 반환
```

### 3. `src/data/hazardous-ingredients-db-v2.json` (성분 DB)
**구조**:
```json
{
  "metadata": {
    "version": "3.0.0",
    "totalIngredients": 43
  },
  "ingredients": [
    {
      "id": "bpa_001",
      "name": "비스페놀A",
      "nameEn": "Bisphenol A",
      "synonyms": ["BPA", "Bisphenol-A"],
      "category": "EDC",
      "riskLevel": "RED",
      "whyDangerous": "성 발달을 빠르게 하고...",
      "howToAvoid": "플라스틱 용기 사용 줄이기...",
      ...
    }
  ]
}
```

**카테고리**:
- `EDC`: 내분비계 장애물질 (성조숙증 직접 연관)
- `Phthalates`: 프탈레이트류
- `Preservatives`: 합성 보존료
- `TarColor`: 타르색소
- `NaturalColor`: 천연색소 (논란)
- `ArtificialSweetener`: 인공감미료

**위험도**:
- `RED`: 위험 (성조숙증, 내분비 교란)
- `YELLOW`: 주의 (알레르기, 과잉행동)
- `ORANGE`: 포장재 경고 (추정)

### 4. `src/data/hazardous-ingredients.types.ts` (매칭 로직)
**핵심 함수**: `findIngredientByName(db, searchTerm)`

**매칭 규칙** (중요!):
1. 정규화:
   ```typescript
   // 공백, 하이픈, 괄호, 쉼표 제거
   normalized = text.toLowerCase()
     .replace(/\s+/g, '')
     .replace(/[-.(),，]/g, '');
   ```

2. 매칭 우선순위:
   ```typescript
   // 1. 정확한 매칭 (최우선)
   if (dbName === searchTerm) return true;

   // 2. 부분 매칭 (5글자 이상만!)
   if (searchTerm.length >= 5 && searchTerm.includes(dbName)) {
     return true;
   }

   // 3. 동의어 매칭
   synonyms.some(syn => syn === searchTerm);
   ```

3. 오탐지 방지:
   - 2글자 이하 검색어 무시
   - 양방향 매칭 제거 (검색어가 더 긴 경우만 부분 매칭)

### 5. `src/lib/googleVision.ts` (OCR)
**주요 기능**:
- Google Cloud Vision API TEXT_DETECTION
- 언어 힌트: `['ko', 'en']`
- 쉼표 분리 로직 (lines 59-65):
  ```typescript
  const parts = line.split(/[,，]/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
  ingredients.push(...parts);
  ```

### 6. `src/lib/scoreCalculator.ts` (점수 계산)
**점수 공식**:
```typescript
점수 = 100 - (RED점수 + YELLOW점수 + ORANGE점수)

RED점수    = min(RED개수 × 30, 60)    // 최대 -60점
YELLOW점수 = min(YELLOW개수 × 10, 30) // 최대 -30점
ORANGE점수 = min(ORANGE개수 × 20, 40) // 최대 -40점
```

**위험도 결정**:
```typescript
if (RED ≥ 1)    → DANGER
if (YELLOW ≥ 1) → CAUTION  (RED = 0)
else            → SAFE
```

## 주요 구현 결정사항

### 1. 왜 자동 분석인가?
파일 선택 후 즉시 분석을 시작하여 UX를 간소화하고 빠른 피드백을 제공합니다.

### 2. 왜 5글자 이상만 부분 매칭?
"프로필"이 "프로필파라벤"과 매칭되는 오탐지를 방지하기 위함입니다.

### 3. 왜 쉼표 분리가 필요한가?
OCR 결과가 종종 `'렌글리콜,주정,적양배추색소'`처럼 쉼표로 연결된 문자열로 나오기 때문입니다.

### 4. 왜 Teal 색상인가?
신뢰감과 안전 느낌을 주는 색상으로, 부모가 안심하고 사용할 수 있도록 합니다.

### 5. 왜 PWA를 개발 모드에서 비활성화?
Service Worker 경고를 제거하고 개발 속도를 높이기 위함입니다.

## 알려진 문제 및 해결 방법

### 문제 1: "코치닐색소"가 감지 안 됨
**원인**: DB에 "코치닐추출색소"만 있고 "코치닐색소" 동의어 없음
**해결**: `hazardous-ingredients-db-v2.json`에서 synonyms 배열에 추가
```json
"synonyms": ["카민", "코치닐색소", "Carmine", ...]
```

### 문제 2: "프로필"이 "프로필파라벤"과 매칭됨
**원인**: 양방향 부분 매칭
**해결**: 5글자 이상만 부분 매칭 허용 (types.ts:83-87)

### 문제 3: 쉼표로 구분된 성분이 하나로 인식됨
**원인**: OCR이 `'a,b,c'` 형태로 반환
**해결**: `split(/[,，]/)`로 분리 (googleVision.ts:63)

## 환경 변수

```bash
# .env.local
GOOGLE_CLOUD_VISION_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

**Vercel 배포 시**: 프로젝트 설정 → Environment Variables에 동일하게 설정

## 개발 명령어

```bash
# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 확인
npm run start

# DB를 Excel로 변환
node scripts/json-to-excel.js
```

## 테스트 방법

### 1. 로컬 테스트
1. `npm run dev` 실행
2. http://localhost:3000 접속
3. 테스트 이미지 업로드 (예: 왕관젤 라벨)
4. 콘솔에서 디버깅 로그 확인:
   ```
   === OCR 결과 ===
   감지된 성분 개수: 10
   감지된 성분 샘플 (처음 10개):
     [0] 렌글리콜
     [1] 주정
     ...
   ```

### 2. PWA 테스트
1. `npm run build && npm run start`
2. Chrome DevTools → Application → Manifest 확인
3. Service Worker 등록 확인
4. "Add to Home Screen" 테스트

### 3. 실제 제품 테스트
- ✅ 왕관젤: 코치닐추출색소, 적양배추색소 감지 확인
- ⏳ TODO: 다양한 제품 10개 추가 테스트

## 다음 단계 (우선순위)

1. **실제 사용자 테스트**
   - 피드백 수집 및 오탐지/미탐지 케이스 발견
   - DB 동의어 확장

2. **성분 상세 모달** (선택)
   - ⓘ 아이콘 클릭 시 상세 정보 표시
   - whyDangerous, howToAvoid, healthConcerns

3. **공유 기능** (선택)
   - Web Share API
   - 결과 URL 생성 (Vercel KV)

4. **비용 최적화** (선택)
   - Google Vision + GPT-4 Text로 전환
   - 현재: ~$34.50/월 → ~$21/월 (39% 절감)

## 도움이 되는 리소스

- **PRD.md**: 전체 프로젝트 문서 (아키텍처, API 명세, DB 구조)
- **hazardous-ingredients-db-v2.json**: 43개 성분 전체 목록
- **scripts/json-to-excel.js**: DB를 Excel로 보고 싶을 때 사용

## 주의사항

### 코드 수정 시
1. **성분 DB 수정**: 반드시 `metadata.lastUpdated`, `version` 업데이트
2. **매칭 로직 수정**: 오탐지 방지 규칙 유지 (2글자 이하 무시, 5글자 이상 부분 매칭)
3. **점수 계산 수정**: 위험도별 가중치 변경 시 PRD.md 문서도 업데이트

### 배포 시
1. 환경 변수 설정 확인
2. `npm run build` 에러 없는지 확인
3. TypeScript 타입 에러 주의

## 버전 히스토리

- **v2.0.0** (2026-01-21): 배포 준비 완료
  - UI/UX 완성 (3단계 화면)
  - PWA 설정 완료
  - 버그 수정 (코치닐색소, 쉼표 분리, 오탐지 방지)
  - Vercel 배포 완료

- **v1.0.0** (2026-01-20): 초기 MVP
  - OCR + AI 분석 엔진
  - 43개 성분 DB
  - 기본 API 구현

---

**작성일**: 2026-01-21
**다음 업데이트**: 실제 사용자 피드백 수집 후
