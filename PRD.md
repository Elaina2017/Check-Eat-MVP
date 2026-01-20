# Check-Eat MVP - Product Requirements Document (PRD)

**버전**: 2.0.0
**최종 업데이트**: 2026-01-21
**프로젝트 상태**: ✅ 배포 완료 - 운영 중 (Production)

### 🎉 MVP 완성 현황
- ✅ **OCR + AI 분석 엔진**: Google Vision API + OpenAI GPT-4 Vision 연동 완료
- ✅ **성분 데이터베이스**: 43개 위험 성분 DB 구축 (동의어, 엄격한 매칭 로직)
- ✅ **UI/UX 구현**: 모바일 최적화 완료 (초기 화면/분석 중/결과 화면)
- ✅ **PWA 설정**: manifest + 아이콘 + Service Worker 구성 완료
- ✅ **빌드 성공**: TypeScript 에러 해결, 프로덕션 빌드 완료
- ✅ **Vercel 배포**: 완료 - 프로덕션 환경 운영 중
- 🚀 **다음 단계**: 실제 사용자 피드백 수집 및 개선

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [핵심 기능](#핵심-기능)
5. [API 명세](#api-명세)
6. [데이터베이스 구조](#데이터베이스-구조)
7. [구현 현황](#구현-현황)
8. [다음 단계](#다음-단계)

---

## 프로젝트 개요

### 목적
성분은 꼼꼼하게, 성장은 바르게 - 부모가 자녀에게 안전한 식품을 선택할 수 있도록 돕는 모바일 웹 애플리케이션

### 타겟 사용자
- 어린이 자녀를 둔 부모
- 성조숙증 및 내분비 교란 물질에 대한 걱정이 있는 보호자
- 식품 안전에 관심이 많은 소비자

### 핵심 가치 제안
1. **간편한 분석**: 제품 라벨 사진 촬영만으로 즉시 분석
2. **명확한 결과**: 0-100점 점수 + 신호등 시스템 (안전/주의/위험)
3. **상세 정보**: 각 성분별 위험 이유와 피하는 방법 제공
4. **모바일 최적화**: PWA 지원으로 앱처럼 사용 가능

---

## 기술 스택

### Frontend
```
Framework: Next.js 14.2.35 (App Router)
Language: TypeScript
Styling: Tailwind CSS
PWA: next-pwa (설정 예정)
Image Processing: sharp
```

### Backend (API Routes)
```
Runtime: Node.js (Next.js Serverless Functions)
OCR: Google Cloud Vision API
AI 분석: OpenAI GPT-4 Vision (포장재 분석)
성분 매칭: 로컬 JSON DB
```

### Hosting & Deployment
```
Platform: Vercel
Domain: TBD
Environment: Production / Development
```

### 개발 도구
```
Package Manager: npm
Version Control: Git
Code Editor: VS Code
```

---

## 시스템 아키텍처

### 전체 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자                               │
│                          (모바일)                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 1. 이미지 업로드 (FormData)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│                                                              │
│  - 이미지 리사이즈 (1280px)                                   │
│  - JPEG 압축 (quality 0.82)                                  │
│  - HEIC → JPEG 변환                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ 2. POST /api/analyze
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Route: /api/analyze                      │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │ 1. sharp로 이미지 리사이즈 및 최적화          │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────┐           │
│  │ 2. 병렬 처리                                  │           │
│  │   - Google Vision API (OCR)                  │           │
│  │   - OpenAI GPT-4V (포장재 분석)              │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────┐           │
│  │ 3. OCR 텍스트 전처리                          │           │
│  │   - 줄바꿈으로 분리                           │           │
│  │   - 쉼표로 개별 성분 분리                     │           │
│  │   - 공백/특수문자 정규화                      │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────┐           │
│  │ 4. 성분 매칭 (hazardous-ingredients-db.json) │           │
│  │   - 한글명, 영문명, 동의어 매칭               │           │
│  │   - 정확한 매칭 우선                          │           │
│  │   - 부분 매칭 (5글자 이상만)                  │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────┐           │
│  │ 5. 점수 계산                                  │           │
│  │   - RED: -30점/개 (최대 -60)                 │           │
│  │   - YELLOW: -10점/개 (최대 -30)              │           │
│  │   - ORANGE: -20점/개 (최대 -40)              │           │
│  │   - 총점: 100 - (RED + YELLOW + ORANGE)      │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
│  ┌──────────────────▼───────────────────────────┐           │
│  │ 6. 위험도 결정                                │           │
│  │   - DANGER: RED ≥ 1                          │           │
│  │   - CAUTION: YELLOW ≥ 1 (RED = 0)            │           │
│  │   - SAFE: RED = 0, YELLOW = 0                │           │
│  └──────────────────┬───────────────────────────┘           │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                     │
                     │ 3. JSON Response
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    결과 표시 화면                             │
│                                                              │
│  - 신호등 (SAFE/CAUTION/DANGER)                              │
│  - 점수 (0-100)                                              │
│  - 위험 성분 목록                                             │
│  - 주의 성분 목록                                             │
│  - 포장재 경고                                                │
│  - 재촬영/공유 버튼                                           │
└─────────────────────────────────────────────────────────────┘
```

### 주요 컴포넌트

#### 1. Frontend (Next.js Pages)
- `/` - Landing Page
- `/scan` - 이미지 업로드 페이지
- `/result` - 분석 결과 페이지

#### 2. API Routes
- `POST /api/analyze` - 이미지 분석

#### 3. 라이브러리 모듈
- `lib/googleVision.ts` - Google Cloud Vision OCR
- `lib/openai.ts` - OpenAI GPT-4 Vision (포장재 분석)
- `lib/ingredientMatcher.ts` - 성분 매칭 로직
- `lib/scoreCalculator.ts` - 점수 계산 로직
- `lib/db.ts` - DB 로드

#### 4. 데이터
- `data/hazardous-ingredients-db-v2.json` - 위험 성분 데이터베이스
- `data/hazardous-ingredients.types.ts` - TypeScript 타입 정의

---

## 핵심 기능

### 1. 이미지 분석 (OCR + AI)

#### 입력
- 이미지 파일 (JPEG, PNG, HEIC)
- 최대 크기: 4.5MB (Vercel 무료 플랜 제한)

#### 처리 과정
1. **클라이언트 전처리**
   - 이미지 리사이즈 (최대 1280px)
   - JPEG 압축 (quality 0.82)
   - HEIC → JPEG 변환 (필요 시)

2. **서버 처리**
   - sharp로 추가 최적화
   - Base64 인코딩

3. **OCR (Google Cloud Vision API)**
   - TEXT_DETECTION 모드
   - 언어 힌트: 한글, 영어
   - 결과: 전체 텍스트 + 라인별 분리

4. **포장재 분석 (OpenAI GPT-4 Vision)**
   - 포장재 타입 인식 (캔, 플라스틱, 종이)
   - 시각적 단서 기반 추정

#### 출력
```typescript
{
  success: true,
  data: {
    overallScore: 85,           // 0-100
    riskLevel: "CAUTION",       // SAFE | CAUTION | DANGER
    foundIngredients: [
      {
        id: "cochinal_001",
        name: "코치닐추출색소",
        nameEn: "Carmine",
        category: "NaturalColor",
        riskLevel: "YELLOW",
        whyDangerous: "곤충에서 유래한 색소로 알레르기와 과잉행동을 유발할 수 있어요",
        healthConcerns: ["알레르기 반응", "천식 악화", "과잉행동 가능성"],
        howToAvoid: "천식이 있거나 알레르기가 있는 어린이는 성분표에서 '카민' 표기를 확인하세요"
      }
    ],
    packagingWarnings: [
      {
        id: "can_bpa_001",
        name: "캔 내부 코팅 (BPA 용출)",
        type: "Can",
        riskLevel: "ORANGE",
        whyDangerous: "캔 내부 코팅에서 BPA가 식품으로 이행될 수 있어요"
      }
    ],
    ocrText: "원재료명: ...",
    packagingType: "Plastic"
  }
}
```

### 2. 성분 매칭 로직

#### 전처리
```typescript
// 1. 줄바꿈으로 분리
const lines = fullText.split('\n');

// 2. 쉼표로 개별 성분 분리
const ingredients = [];
for (const line of lines) {
  const parts = line.split(/[,，]/).map(p => p.trim());
  ingredients.push(...parts);
}

// 3. 정규화 (공백, 특수문자 제거)
const normalized = text
  .toLowerCase()
  .replace(/\s+/g, '')           // 공백 제거
  .replace(/[-.(),，]/g, '');    // 특수문자 제거
```

#### 매칭 규칙
1. **정확한 매칭 우선**
   ```typescript
   if (dbName === searchTerm) return true;
   ```

2. **부분 매칭 (5글자 이상만)**
   ```typescript
   if (searchTerm.length >= 5 && searchTerm.includes(dbName)) {
     return true;
   }
   ```

3. **동의어 매칭**
   ```typescript
   synonyms.some(syn => syn === searchTerm);
   ```

4. **오탐지 방지**
   - 2글자 이하 검색어 무시
   - 양방향 매칭 제거 (검색어가 더 긴 경우만)

### 3. 점수 계산 시스템

#### 점수 규칙
```typescript
점수 = 100 - (RED점수 + YELLOW점수 + ORANGE점수)

RED 점수    = min(RED 개수 × 30, 60)    // 최대 -60점
YELLOW 점수 = min(YELLOW 개수 × 10, 30) // 최대 -30점
ORANGE 점수 = min(ORANGE 개수 × 20, 40) // 최대 -40점
```

#### 위험도 결정
```typescript
if (RED ≥ 1)    → DANGER
if (YELLOW ≥ 1) → CAUTION  (RED = 0)
else            → SAFE
```

#### 예시
```
RED 2개, YELLOW 3개 발견:
→ 점수 = 100 - (60 + 30) = 10점
→ 위험도 = DANGER (RED ≥ 1)
```

---

## API 명세

### POST /api/analyze

이미지를 분석하여 위험 성분을 감지합니다.

#### Request
```http
POST /api/analyze
Content-Type: multipart/form-data

{
  image: File  // JPEG, PNG, HEIC
}
```

#### Response (성공)
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "riskLevel": "CAUTION",
    "foundIngredients": [
      {
        "id": "cochinal_001",
        "name": "코치닐추출색소",
        "nameEn": "Carmine",
        "category": "NaturalColor",
        "riskLevel": "YELLOW",
        "whyDangerous": "곤충에서 유래한 색소로 알레르기와 과잉행동을 유발할 수 있어요",
        "healthConcerns": ["알레르기 반응", "천식 악화", "과잉행동 가능성"],
        "howToAvoid": "천식이 있거나 알레르기가 있는 어린이는 성분표에서 '카민' 표기를 확인하세요"
      }
    ],
    "packagingWarnings": [],
    "ocrText": "원재료명: 물엿, 코치닐추출색소...",
    "packagingType": "Plastic"
  }
}
```

#### Response (실패)
```json
{
  "success": false,
  "error": "Google Cloud Vision API key is not configured"
}
```

#### 에러 코드
- `400` - 이미지 파일 누락
- `500` - 서버 오류 (OCR 실패, API 키 오류 등)

---

## 데이터베이스 구조

### hazardous-ingredients-db-v2.json

#### 메타데이터
```json
{
  "metadata": {
    "version": "3.0.0",
    "lastUpdated": "2026-01-20",
    "source": "식약처, 환경부, WHO, KFSRI, 학술 자료",
    "purpose": "Check-Eat MVP - 성조숙증 및 내분비 교란 위험 성분 DB",
    "totalIngredients": 43,
    "breakdown": {
      "EDC": 1,
      "Phthalates": 8,
      "Preservatives": 9,
      "TarColor": 16,
      "FlavorEnhancer": 1,
      "NaturalColor": 2,
      "ArtificialSweetener": 6
    }
  }
}
```

#### 성분 스키마
```typescript
interface HazardousIngredient {
  id: string;                    // 고유 ID (예: "bpa_001")
  name: string;                  // 한글명 (예: "비스페놀A")
  nameEn: string;                // 영문명 (예: "Bisphenol A")
  synonyms: string[];            // 동의어 (예: ["BPA", "Bisphenol-A"])
  category: IngredientCategory;  // 카테고리
  riskLevel: RiskLevel;          // 위험도 (RED | YELLOW | ORANGE)
  healthConcerns: string[];      // 건강 우려사항
  description: string;           // 상세 설명
  whyDangerous: string;          // ⓘ 아이콘용 간결한 설명 (1-2줄)
  howToAvoid: string;            // 피하는 방법
  sources: string[];             // 주로 발견되는 곳
  regulatoryStatus: string;      // 규제 현황
}
```

#### 카테고리
```typescript
type IngredientCategory =
  | 'EDC'                    // 내분비계 장애물질
  | 'Phthalates'             // 프탈레이트류
  | 'Preservatives'          // 합성 보존료
  | 'TarColor'               // 타르색소
  | 'FlavorEnhancer'         // 화학조미료
  | 'NaturalColor'           // 천연색소 (논란 있음)
  | 'ArtificialSweetener';   // 인공감미료
```

#### 위험도
```typescript
type RiskLevel = 'RED' | 'YELLOW' | 'ORANGE';

// RED: 성조숙증, 내분비 교란 직접 연관
// YELLOW: 주의 필요 (알레르기, 과잉행동 등)
// ORANGE: 포장재 경고 (추정)
```

#### 포장재 경고 스키마
```typescript
interface PackagingWarning {
  id: string;
  name: string;
  type: 'Can' | 'Plastic' | 'Paper';
  riskLevel: 'ORANGE';
  concernedIngredient: string | string[] | null;  // 관련 성분 ID
  description: string;
  whyDangerous: string;
  howToAvoid: string;
  visualCues: string[];  // 시각적 단서
}
```

#### DB 통계 (v3.0.0)
```
총 성분: 43개
├─ RED (위험): 11개
│  ├─ BPA
│  ├─ DEHP, DBP, BBP, DIBP
│  ├─ 적색102호, 녹색3호
│  └─ MSG 등
├─ YELLOW (주의): 32개
│  ├─ 프탈레이트 3종
│  ├─ 파라벤 4종
│  ├─ 타르색소 14종
│  ├─ 보존료 7종
│  └─ 인공감미료 4종
└─ 포장재 경고: 3종
   ├─ 캔 (BPA 용출)
   ├─ 플라스틱 (프탈레이트)
   └─ 기름방지 종이 (PFAS)
```

---

## 구현 현황

### ✅ 완료된 기능

#### 1. 프로젝트 초기 설정
- [x] Next.js 14 프로젝트 생성
- [x] TypeScript 설정
- [x] Tailwind CSS 설정
- [x] 환경 변수 설정 (.env.local)

#### 2. 데이터베이스
- [x] hazardous-ingredients-db-v2.json (43개 성분)
- [x] TypeScript 타입 정의 (hazardous-ingredients.types.ts)
- [x] 엑셀 변환 스크립트 (json-to-excel.js)
- [x] 성분별 상세 설명 (whyDangerous, howToAvoid)

#### 3. OCR & AI 연동
- [x] Google Cloud Vision API 연동
- [x] OpenAI GPT-4 Vision API 연동 (포장재 분석)
- [x] 이미지 리사이즈 및 최적화 (sharp)

#### 4. 성분 매칭 로직
- [x] 기본 매칭 (한글명, 영문명, 동의어)
- [x] 쉼표 분리 (OCR 결과 전처리)
- [x] 정규화 (공백, 특수문자 제거)
- [x] 양방향 부분 매칭
- [x] 오탐지 방지 (짧은 단어 필터링, 엄격한 매칭)
- [x] 디버깅 로그

#### 5. 점수 계산
- [x] RED/YELLOW/ORANGE 점수 계산
- [x] 위험도 결정 로직
- [x] scoreCalculator.ts 모듈

#### 6. API 엔드포인트
- [x] POST /api/analyze
- [x] 에러 처리
- [x] JSON 응답 형식

#### 7. 테스트
- [x] 실제 제품 라벨 테스트 (왕관젤)
- [x] 코치닐추출색소 감지 확인
- [x] 적양배추색소 감지 확인
- [x] 오탐지 수정 (프로필파라벤, 비스페놀A)

#### 8. UI/UX 구현 ✅
- [x] Landing Page 완전 재설계
  - [x] 3단계 화면 구조 (초기/분석중/결과)
  - [x] 카메라 촬영 버튼 (메인)
  - [x] 갤러리 선택 옵션 (작은 텍스트 링크)
  - [x] 모바일 최적화 디자인
  - [x] Teal 테마 (#0d9488)
- [x] 분석 중 화면
  - [x] 로딩 애니메이션
  - [x] 랜덤 건강 팁 표시 (5초마다 변경)
  - [x] 촬영 가이드/팁 섹션
- [x] 결과 표시 화면
  - [x] 상단 점수 카드 (0-100점 + 위험도)
  - [x] 색상 코딩된 섹션 (위험/주의/포장재)
  - [x] 성분별 카드 UI
  - [x] 적절한 간격 조정 (mb-6, mb-8)
  - [x] 재촬영 버튼
- [x] 파일 선택 시 자동 분석 시작

#### 9. PWA 설정 ✅
- [x] manifest.json 생성
  - [x] 앱 이름: "체크잇" (Check-Eat)
  - [x] 테마 컬러: #0d9488
  - [x] Standalone 모드
- [x] next-pwa 설정
  - [x] 개발 모드 비활성화
  - [x] 프로덕션 Service Worker 등록
- [x] PWA 아이콘 생성
  - [x] 192x192 아이콘
  - [x] 512x512 아이콘
  - [x] 아이콘 생성 도구 (generate-icons.html)
- [x] Apple Web App 메타데이터 설정

#### 10. 프로덕션 준비 ✅
- [x] TypeScript 빌드 에러 수정
  - [x] googleVision.ts 타입 명시
- [x] Git 저장소 초기화
- [x] 프로덕션 빌드 성공
- [x] 빌드 최적화 (disable: development)

#### 11. 주요 버그 수정 및 개선 ✅
- [x] 코치닐색소 미감지 문제 해결
  - 동의어에 "코치닐색소" 추가 (기존: "코치닐추출색소"만 있었음)
- [x] 적양배추색소 미감지 문제 해결
  - 동의어에 "적양배추" 추가
- [x] 쉼표로 구분된 성분 분리 로직 추가
  - OCR 결과에서 `,` 또는 `，` 기준으로 분리
- [x] 오탐지 방지 로직 강화
  - 2글자 이하 검색어 무시
  - 5글자 이상만 부분 매칭 허용
  - 정확한 매칭 우선 순위 부여
- [x] 공백 및 특수문자 정규화
  - 공백, 하이픈, 괄호, 쉼표 제거 후 매칭
- [x] Apple 메타태그 deprecated 경고 수정
  - `apple-mobile-web-app-capable` → `appleWebApp` 구조로 변경
- [x] UI 간격 조정
  - 섹션 간 여백 증가 (mb-4 → mb-6, mb-6 → mb-8)

#### 12. 배포 완료 ✅
- [x] GitHub 저장소 연동
- [x] Vercel 프로젝트 생성 및 배포
- [x] 환경 변수 설정 (GOOGLE_CLOUD_VISION_API_KEY, OPENAI_API_KEY)
- [x] 프로덕션 빌드 검증
- [x] 배포일: 2026-01-21

### 📝 주요 구현 결정사항

#### UI/UX 디자인
1. **3단계 화면 구조**
   - 초기 화면: 카메라 버튼 (메인) + 갤러리 선택 (서브)
   - 분석 중: 로딩 애니메이션 + 5초마다 변경되는 건강 팁
   - 결과 화면: 점수 카드 → 위험 성분 → 주의 성분 → 포장재 경고

2. **자동 분석 시작**
   - 파일 선택 즉시 분석 시작 (별도의 "분석하기" 버튼 불필요)
   - UX 간소화 및 빠른 피드백 제공

3. **색상 테마**
   - Primary: Teal (#0d9488) - 신뢰감, 안전 느낌
   - 위험도별 색상: RED (#ef4444), YELLOW (#f59e0b), ORANGE (#f97316)

#### 성분 매칭 로직
1. **엄격한 매칭 규칙**
   - 정확한 매칭 최우선
   - 부분 매칭은 5글자 이상만 허용
   - 2글자 이하는 무시 (오탐지 방지)

2. **전처리 강화**
   - 쉼표 분리: `렌글리콜,주정,적양배추색소` → 3개 개별 성분
   - 정규화: 공백/특수문자 제거 후 비교

3. **동의어 확장**
   - 실제 라벨 테스트를 통해 누락된 동의어 추가
   - 예: "코치닐색소", "적양배추" 등

#### PWA 설정
1. **개발 모드 비활성화**
   - Service Worker 경고 제거 (개발 중 불필요)
   - 프로덕션에서만 PWA 활성화

2. **아이콘 전략**
   - 192x192, 512x512 (Android 권장 사이즈)
   - `any maskable` purpose (다양한 디바이스 대응)

### 📋 TODO (배포 및 개선)

#### Phase 1: 배포 및 테스트
1. **Vercel 배포** ✅
   - [x] GitHub 저장소 연결
   - [x] 환경 변수 설정
   - [x] Vercel 배포
   - [ ] 도메인 연결 (선택)

2. **추가 테스트** (선택)
   - [ ] 실제 제품 10개 추가 테스트
   - [ ] 모바일 기기 테스트 (iOS/Android)
   - [ ] 다양한 라벨 형식 테스트

3. **기능 추가** (선택)
   - [ ] 성분 상세 모달 (ⓘ 아이콘)
   - [ ] 공유 기능 (Web Share API + Clipboard)
   - [ ] 에러 처리 UI 개선

#### Phase 2: 최적화 및 기능 확장 (향후)
4. **비용 최적화** (선택)
   - [ ] 하이브리드 API 전환 (Google Vision + GPT-4 Text)
   - [ ] 이미지 캐싱
   - [ ] API 호출 최적화

5. **추가 기능** (선택)
   - [ ] 분석 히스토리 (localStorage)
   - [ ] 공유 URL 생성 (Vercel KV)
   - [ ] Rate Limiting (@upstash/ratelimit)
   - [ ] 피드백 수집 폼
   - [ ] 즐겨찾기 기능

6. **DB 확장 및 개선** (지속적)
   - [ ] 성분 추가 (43개 → 100개)
   - [ ] 동의어 확장 (더 많은 변형 추가)
   - [ ] 정확도 개선 (실제 테스트 기반)
   - [ ] 지역별 성분명 추가 (중국어, 일본어)

---

## 다음 단계

### 즉시 착수 가능한 작업

#### 1. Landing Page 구현 (우선순위: 높음)
**위치**: `src/app/page.tsx`

**필요 요소**:
- 히어로 섹션 (제품명, 캐치프레이즈)
- "사진으로 분석하기" CTA 버튼
- 사용 방법 (3단계)
- 법적 고지 및 면책 조항
- Footer

**디자인 가이드**:
```
컬러:
- Primary (SAFE): #10b981 (Green)
- Warning (CAUTION): #f59e0b (Orange)
- Danger: #ef4444 (Red)
- Background: #ffffff
- Text: #1f2937

폰트:
- Pretendard (한글)
- Inter (영문/숫자)
```

#### 2. 결과 화면 구현 (우선순위: 높음)
**위치**: `src/app/result/page.tsx`

**레이아웃**:
```
┌─────────────────────────────┐
│ Header (신호등)              │
│ ● CAUTION                   │
│ 85점                         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🔴 위험 성분 (2개)           │
│                             │
│ ┌─────────────────────┐     │
│ │ 비스페놀A          ⓘ│     │
│ │ 성 발달을 빠르게... │     │
│ └─────────────────────┘     │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 🟡 주의 성분 (3개)           │
│ ...                         │
└─────────────────────────────┘

┌─────────────────────────────┐
│ [재촬영] [공유]              │
└─────────────────────────────┘
```

#### 3. 성분 상세 모달 (우선순위: 중간)
**참고**: `IngredientDetailModal.example.tsx`

**표시 정보**:
- 성분명 (한글/영문)
- 위험도 배지
- 왜 위험한가요? (whyDangerous)
- 건강에 미치는 영향 (healthConcerns)
- 주로 어디서 발견되나요? (sources)
- 💡 어떻게 피하나요? (howToAvoid)
- 규제 현황 (regulatoryStatus)

---

## 환경 변수

### 필수 환경 변수
```bash
# .env.local

# Google Cloud Vision API
GOOGLE_CLOUD_VISION_API_KEY=your_api_key_here

# OpenAI API
OPENAI_API_KEY=your_api_key_here
```

### 선택적 환경 변수 (Phase 2)
```bash
# Vercel KV (공유 기능)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 비용 예상 (월 1,000명 사용 기준)

### 현재 (Phase 1)
```
사용자당 평균 3회 분석 = 3,000 이미지/월

Google Cloud Vision API:
- 3,000 images × $1.50/1,000 = $4.50/월

OpenAI GPT-4 Vision:
- 3,000 images × $0.01/image = $30/월
  (이미지당 약 $0.01, 1280px 기준)

Vercel Hosting:
- Hobby 플랜: 무료

총 예상 비용: $34.50/월
```

### 최적화 후 (Phase 2)
```
Google Cloud Vision (OCR만):
- 3,000 images × $1.50/1,000 = $4.50/월

OpenAI GPT-4 Text (성분 파싱):
- 3,000 requests × $0.50/1,000 = $1.50/월

OpenAI GPT-4 Vision (포장재만, 50%):
- 1,500 images × $0.01 = $15/월

총 예상 비용: $21/월 (39% 절감)
```

---

## 성능 목표

### Lighthouse Score
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

### 응답 시간
- 이미지 업로드 → OCR 완료: 3-5초
- 전체 분석 완료: 5-8초
- 결과 화면 로드: <1초

### 지원 브라우저
- Chrome 90+
- Safari 14+ (iOS)
- Samsung Internet 15+
- Edge 90+

---

## 보안 고려사항

### API 키 보호
- ✅ 환경 변수에 저장 (.env.local)
- ✅ 서버 사이드에서만 사용
- ✅ .gitignore에 등록
- ⚠️ Vercel 환경 변수 설정 필요

### 이미지 처리
- ✅ 업로드된 이미지는 분석 후 즉시 삭제
- ✅ Base64 인코딩으로 메모리에만 저장
- ✅ 서버에 파일 저장 안 함

### Rate Limiting (Phase 2)
- IP당 시간당 10회 제한
- IP당 일일 30회 제한

---

## 라이선스 및 고지사항

### 데이터 출처
- 식약처 (식품첨가물 데이터베이스)
- 환경부 (내분비계 장애물질 목록)
- WHO (세계보건기구 권고사항)
- KFSRI (한국식품안전연구원)
- 학술 자료 및 연구 논문

### 면책 조항
```
본 서비스는 의료기기가 아니며, 질병의 진단, 치료, 예방을 목적으로 하지 않습니다.

제공되는 정보는 참고용이며, 정확한 건강 상담은 전문의와 상담하시기 바랍니다.

분석 결과의 정확성을 보장하지 않으며, 사용자의 판단과 책임 하에 활용해주세요.
```

### 개인정보 처리방침
```
✅ 업로드된 이미지는 분석 후 즉시 삭제됩니다
✅ 분석 결과는 사용자 기기에만 저장됩니다
✅ 서버에 개인정보를 저장하지 않습니다
✅ 공유 기능 사용 시 24시간 임시 저장 후 자동 삭제 (Phase 2)
```

---

## 연락처 및 피드백

**프로젝트 관리자**: TBD
**개발팀**: TBD
**이슈 트래킹**: GitHub Issues
**고객 지원**: TBD

---

**문서 버전**: 2.0.0
**최종 수정일**: 2026-01-21
**다음 검토 예정일**: 2026-02-15
