# API 키 발급 가이드

## 1. Google Cloud Vision API 키 발급

### 1-1. Google Cloud Console 접속
- URL: https://console.cloud.google.com/
- Google 계정으로 로그인

### 1-2. 프로젝트 생성
1. 상단의 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름: `check-eat-mvp`
4. "만들기" 클릭

### 1-3. Cloud Vision API 활성화
1. 왼쪽 메뉴 → "API 및 서비스" → "라이브러리"
2. 검색: "Cloud Vision API"
3. "Cloud Vision API" 클릭
4. "사용" 버튼 클릭

### 1-4. API 키 생성
1. 왼쪽 메뉴 → "API 및 서비스" → "사용자 인증 정보"
2. 상단 "+ 사용자 인증 정보 만들기" 클릭
3. "API 키" 선택
4. API 키 복사 → `.env.local`에 붙여넣기

### 1-5. 결제 설정 (필수)
- 왼쪽 메뉴 → "결제"
- 신용카드 등록 (무료 평가판 후 필요)
- **무료**: 매월 1,000건까지 무료
- **비용**: $1.50/1,000 images 이후

---

## 2. OpenAI API 키 발급

### 2-1. OpenAI 가입
- URL: https://platform.openai.com/
- "Sign up" 또는 로그인

### 2-2. API 키 생성
1. 오른쪽 상단 프로필 아이콘 클릭
2. "View API keys" 클릭
3. 또는 직접 접속: https://platform.openai.com/api-keys
4. "+ Create new secret key" 클릭
5. 이름 입력: `check-eat-mvp`
6. "Create secret key" 클릭
7. **⚠️ 중요**: API 키 복사 (다시 볼 수 없음!)

### 2-3. 결제 설정 (필수)
1. 왼쪽 메뉴 → "Settings" → "Billing"
2. "Add payment method" 클릭
3. 신용카드 등록
4. 크레딧 충전 (최소 $5 권장)

### 비용
- **GPT-4o-mini**: ~$0.000165/image (현재 코드 사용)
- 이미지당 약 0.2원

---

## 3. .env.local 파일에 입력

발급받은 키를 `.env.local` 파일에 입력:

```
GOOGLE_CLOUD_VISION_API_KEY=AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 4. 테스트

```bash
cd check-eat-mvp
npm run dev
```

브라우저에서 http://localhost:3000 접속 후 이미지 업로드 테스트!

---

## 비용 예상 (월 1,000명 사용 시)

- Google Vision: ~$4.50/month (사용자당 3회 분석)
- OpenAI GPT-4o-mini: ~$0.50/month
- **총 비용**: ~$5/month

## 무료 대안 (테스트용)

### Google Vision 대신:
- Tesseract.js (무료, 정확도 낮음)

### OpenAI 대신:
- 포장재 분석 제거 (ORANGE 경고 없이 사용)
- Google Vision만으로도 기본 기능 작동

---

## 문제 해결

### API 키가 작동하지 않는 경우
1. `.env.local` 파일 위치 확인 (`check-eat-mvp/.env.local`)
2. 개발 서버 재시작 (`npm run dev` 중지 후 재실행)
3. API 키에 따옴표 없이 입력했는지 확인

### 결제 오류
- Google Cloud: 결제 정보 등록 필수 (무료 평가판 후)
- OpenAI: 크레딧 잔액 확인

### API 할당량 초과
- Google Cloud Console → API 할당량 확인
- OpenAI → Usage 페이지에서 사용량 확인
