# Check-Eat MVP

**성분은 꼼꼼하게, 성장은 바르게**

식품 라벨을 촬영하여 유해 성분을 분석하는 PWA 앱입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **AI APIs**:
  - Google Cloud Vision API (OCR 텍스트 추출)
  - OpenAI GPT-4 Vision API (포장재 분석)
- **PWA**: next-pwa
- **Hosting**: Vercel (권장)

## 프로젝트 구조

```
check-eat-mvp/
├── src/
│   ├── app/
│   │   ├── page.tsx              # 메인 페이지 (이미지 업로드)
│   │   ├── layout.tsx            # 루트 레이아웃
│   │   ├── globals.css           # Tailwind CSS
│   │   └── api/
│   │       └── analyze/route.ts  # 이미지 분석 API
│   ├── lib/
│   │   ├── googleVision.ts       # Google Vision API
│   │   ├── openai.ts             # GPT-4 Vision API
│   │   ├── ingredientMatcher.ts  # DB 매칭 로직
│   │   ├── scoreCalculator.ts    # 점수 계산
│   │   └── db.ts                 # DB 로딩
│   ├── types/
│   │   └── analysis.ts           # 타입 정의
│   └── data/
│       ├── hazardous-ingredients-db-v2.json
│       └── hazardous-ingredients.types.ts
└── public/
    ├── manifest.json             # PWA manifest
    ├── icon-192.png              # PWA 아이콘 (생성 필요)
    └── icon-512.png              # PWA 아이콘 (생성 필요)
```

## 설정 가이드

### 1. API 키 발급

#### Google Cloud Vision API
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. Cloud Vision API 활성화
4. API 키 생성 (Credentials > Create Credentials > API Key)

#### OpenAI API
1. [OpenAI Platform](https://platform.openai.com/) 접속
2. API Keys 메뉴에서 새 키 생성

### 2. 환경변수 설정

`.env.local.example` 파일을 `.env.local`로 복사하고 API 키를 입력하세요:

```bash
cp .env.local.example .env.local
```

`.env.local` 파일 내용:
```
GOOGLE_CLOUD_VISION_API_KEY=your_actual_google_api_key
OPENAI_API_KEY=your_actual_openai_api_key
```

### 3. PWA 아이콘 생성

`public/` 폴더에 다음 아이콘들을 추가하세요:
- `icon-192.png`: 192x192px
- `icon-512.png`: 512x512px

온라인 도구 추천: [Favicon Generator](https://realfavicongenerator.net/)

### 4. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 배포 (Vercel)

### 1. Vercel 프로젝트 생성

```bash
npm install -g vercel
vercel
```

### 2. 환경변수 설정

Vercel Dashboard > Settings > Environment Variables에서 다음 변수 추가:
- `GOOGLE_CLOUD_VISION_API_KEY`
- `OPENAI_API_KEY`

### 3. 배포

```bash
vercel --prod
```

## API 플로우

```
[클라이언트] → FormData로 이미지 전송
    ↓
[/api/analyze]
    ↓
(1) 이미지 리사이즈 (1280px, quality 0.82)
    ↓
(2) Google Vision OCR ──→ 텍스트 추출
    ↓
(3) GPT-4 Vision ──→ 포장재 타입 분석
    ↓
(4) DB 매칭 ──→ 유해 성분 검출
    ↓
(5) 점수 계산 (0-100)
    ↓
[결과 반환] → JSON
```

## 비용 예상

- **Google Vision API**: ~$1.50/1,000 images
- **GPT-4 Vision API**: ~$0.005/image (small image)
- **총 비용**: ~$0.006/image
- **월 1,000명 사용 시**: ~$18/month (사용자당 3회 분석 가정)

## Vercel 제한사항 (무료 플랜)

- Serverless Function 실행 시간: 10초
- Request Body 크기: 4.5MB
- → 클라이언트에서 이미지 리사이즈 처리됨

## 주요 기능

- 📸 식품 라벨 이미지 업로드
- 🔍 Google Vision OCR로 성분 텍스트 추출
- 🤖 GPT-4 Vision으로 포장재 타입 분석 (캔/플라스틱/종이)
- ⚠️ 45개 유해 성분 DB 매칭
- 📊 위험도 점수 계산 (0-100)
- 📱 PWA 지원 (홈 화면에 추가 가능)

## 다음 단계

- [ ] shadcn/ui로 UI 개선
- [ ] 결과 공유 기능 (/result/[id])
- [ ] Google AdSense 통합
- [ ] 성분 상세 정보 모달
- [ ] 최근 분석 기록 저장

## 라이선스

MIT
