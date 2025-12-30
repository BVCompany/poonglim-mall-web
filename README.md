# 🌾 풍림푸드 공식 웹사이트 (Poonglim Food Web)

풍림푸드의 공식 기업 웹사이트입니다. React Router v7, TypeScript, Tailwind CSS를 기반으로 구축된 현대적이고 반응형인 웹 애플리케이션입니다.

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [페이지 구조](#-페이지-구조)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)
- [문서](#-문서)
- [라이선스](#-라이선스)

## 🎯 프로젝트 개요

풍림푸드는 1994년 설립 이래 30년간 축적된 노하우와 혁신적인 기술로 고객의 건강하고 풍요로운 일상을 만들어가고 있는 식품 제조 전문 기업입니다. 이 웹사이트는 풍림푸드의 브랜드 가치, 제품, 레시피, 채용 정보 등을 제공합니다.

### 주요 특징

- ✅ **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- ✅ **다국어 지원**: 한국어, 영어, 스페인어
- ✅ **다크/라이트 모드**: 사용자 선호도에 따른 테마 전환
- ✅ **SEO 최적화**: 검색 엔진 최적화
- ✅ **접근성**: WCAG 2.1 가이드라인 준수
- ✅ **현대적 UI/UX**: Shadcn/ui 기반 컴포넌트

## ✨ 주요 기능

### 🏢 브랜드 섹션

- **회사소개**: 히어로 섹션, CEO 메시지, 경영 철학, 성장 단계, 품질 인증
- **연혁**: 타임라인 형식의 회사 발자취
- **인증현황**: 품질 인증서 및 통계
- **공장 견학**: 신청 폼 및 프로그램 안내

### 🥚 제품 섹션

- **전체 제품**: 필터링 및 검색 기능
- **액란 제품**: 프리미엄 액란 라인업
- **푸딩 제품**: 다양한 푸딩 제품
- **편의식 제품**: 간편식 제품군
- 제품 상세 페이지 (개발 중)

### 👨‍🍳 레시피 섹션

- **전체 레시피**: 카테고리별 필터링
- **가정용**: 가정에서 쉽게 만들 수 있는 레시피
- **카페/베이커리**: 카페 및 베이커리 레시피
- **레스토랑**: 외식업체용 레시피
- 레시피 상세 페이지 (재료, 조리법, 팁, 영양정보)

### 🎉 이벤트 & 뉴스

- **이벤트**: 진행 중/예정/종료된 이벤트
- **뉴스 & 소식**: 회사 소식 및 수상 내역
- 탭 형식의 콘텐츠 구성

### 💼 구매문의

- **일반구매**: B2C 고객을 위한 온라인몰 연결
- **B2B 문의**: 대량 구매 및 정기 배송 문의

### 🤝 고객지원

- **연락 방법**: 전화, 이메일, 실시간 채팅
- **FAQ**: 카테고리별 자주 묻는 질문
- **문의하기**: 온라인 문의 폼
- **자료 다운로드**: 카탈로그, 매뉴얼, 인증서

### 👥 채용

- **채용공고**: 포지션별 채용 정보
- **복리후생**: 직원 복지 및 근무환경
- **인재상**: 회사가 추구하는 인재상
- **지원하기**: 4단계 온라인 지원 시스템

## 🛠 기술 스택

### Frontend

- **Framework**: React 19 + React Router v7
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **Build Tool**: Vite

### Backend & Database (Optional)

- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Supabase Auth
- **Email**: Resend (현재 비활성화)

### Development Tools

- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Prettier (권장)
- **Version Control**: Git

### Deployment

- **Platform**: Vercel / Netlify / Cloudflare Pages
- **CI/CD**: GitHub Actions (권장)

## 📁 프로젝트 구조

```
poonglim-mall-web/
├── app/
│   ├── core/                      # 핵심 기능
│   │   ├── components/            # 공통 컴포넌트
│   │   │   ├── ui/               # UI 컴포넌트 (Shadcn/ui)
│   │   │   ├── navigation-bar.tsx # 글로벌 네비게이션
│   │   │   └── footer.tsx        # 글로벌 푸터
│   │   ├── layouts/              # 레이아웃 컴포넌트
│   │   ├── lib/                  # 유틸리티 함수
│   │   └── screens/              # 공통 스크린
│   ├── features/                 # 기능별 모듈
│   │   ├── auth/                 # 인증
│   │   ├── brand/                # 브랜드 (회사소개, 연혁, 인증, 공장견학)
│   │   ├── products/             # 제품
│   │   ├── recipe/               # 레시피
│   │   ├── event/                # 이벤트
│   │   ├── inquiry/              # 구매문의
│   │   ├── support/              # 고객지원
│   │   ├── careers/              # 채용
│   │   └── home/                 # 홈페이지
│   ├── locales/                  # 다국어 번역 파일
│   │   ├── ko.ts                # 한국어
│   │   ├── en.ts                # 영어
│   │   ├── es.ts                # 스페인어
│   │   └── types.ts             # 타입 정의
│   ├── routes.ts                 # 라우팅 설정
│   └── root.tsx                  # 루트 컴포넌트
├── public/                       # 정적 파일
│   ├── home/                    # 홈페이지 이미지
│   ├── intro/                   # 회사소개 이미지
│   └── images/                  # 기타 이미지
├── drizzle/                      # 데이터베이스 마이그레이션
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 시작하기

### 필수 요구사항

- Node.js 20.x 이상
- npm 또는 yarn 또는 pnpm

### 설치

1. **저장소 클론**

   ```bash
   git clone https://github.com/your-username/poonglim-mall-web.git
   cd poonglim-mall-web
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **환경 변수 설정** (선택사항)

   ```bash
   cp .env.example .env
   ```

   `.env` 파일에서 필요한 환경 변수를 설정합니다:

   ```env
   # Supabase (선택사항)
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Resend (선택사항)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **개발 서버 실행**

   ```bash
   npm run dev
   ```

   브라우저에서 `http://localhost:5173` 접속

### 빌드

**프로덕션 빌드**

```bash
npm run build
```

**빌드 미리보기**

```bash
npm run preview
```

## 📄 페이지 구조

### 메인 페이지

- `/` - 홈페이지

### 브랜드

- `/brand/intro` - 회사소개
- `/brand/history` - 연혁
- `/brand/certifications` - 인증현황
- `/brand/factory-tour` - 공장 견학

### 제품

- `/products/all` - 전체 제품
- `/products/liquid-eggs` - 액란 제품
- `/products/puddings` - 푸딩 제품
- `/products/convenience` - 편의식 제품

### 레시피

- `/recipe/main` - 전체 레시피
- `/recipe/easy` - 가정용
- `/recipe/dessert` - 카페/베이커리
- `/recipe/restaurant` - 레스토랑
- `/recipe/:id` - 레시피 상세

### 이벤트

- `/event` - 이벤트 & 뉴스

### 구매문의

- `/inquiry/online` - 일반구매
- `/inquiry/bulk` - B2B 문의

### 고객지원

- `/support` - 고객지원

### 채용

- `/careers/positions` - 채용공고
- `/careers/benefits` - 복리후생
- `/careers/talent` - 인재상
- `/careers/:id` - 채용 상세
- `/careers/:id/apply` - 지원하기

## 💻 개발 가이드

### 새로운 페이지 추가

1. **페이지 컴포넌트 생성**

   ```tsx
   // app/features/example/screens/example.tsx
   export default function ExampleScreen() {
     return <div>Example Page</div>;
   }
   ```

2. **라우트 추가**

   ```typescript
   // app/routes.ts
   route("/example", "features/example/screens/example.tsx"),
   ```

3. **다국어 추가** (선택사항)
   ```typescript
   // app/locales/ko.ts
   example: {
     title: "예제",
     description: "예제 페이지입니다"
   }
   ```

### 컴포넌트 스타일링

Tailwind CSS를 사용합니다:

```tsx
<div className="container mx-auto px-4 py-16">
  <h1 className="text-foreground mb-4 text-4xl font-bold">제목</h1>
</div>
```

### 테마 사용

다크/라이트 모드는 자동으로 지원됩니다:

- `bg-background` - 배경색
- `text-foreground` - 텍스트 색상
- `bg-primary` - 주요 색상
- `text-muted-foreground` - 보조 텍스트 색상

### 다국어 사용

```tsx
import { useTranslation } from "react-i18next";

export default function Component() {
  const { t } = useTranslation();

  return <h1>{t("navigation.brand.intro")}</h1>;
}
```

## 🌐 배포

### 배포 환경

이 프로젝트는 **Vercel**을 통해 개발/운영 환경을 분리하여 자동 배포됩니다:

- **운영 환경** (Production): `main` 브랜치 → `www.poonglim.com`
- **개발 환경** (Preview): `develop` 브랜치 → `dev.poonglim.com`
- **PR Preview**: `feature/*` 브랜치 → 자동 생성된 임시 URL

### 빠른 시작

```bash
# 1. develop 브랜치에서 작업
git checkout develop

# 2. 기능 브랜치 생성
git checkout -b feature/new-feature

# 3. 개발 및 커밋
git add .
git commit -m "feat: 새로운 기능 추가"

# 4. Push (Vercel이 자동으로 Preview 배포)
git push origin feature/new-feature

# 5. GitHub에서 PR 생성 (feature → develop)
# 6. 리뷰 후 머지 (자동으로 dev.poonglim.com 배포)
# 7. 테스트 완료 후 develop → main PR 생성 및 머지 (운영 배포)
```

### 상세 가이드

배포 프로세스, GitHub/Vercel 설정, 환경 변수 구성 등 상세한 내용은 [배포 가이드](./docs/DEPLOYMENT.md)를 참고하세요:

- 🌳 **Branch 전략** - main, develop, feature 브랜치 관리
- 🔧 **GitHub 설정** - Branch Protection Rules
- 🚀 **Vercel 설정** - 프로젝트 생성 및 연동
- 🔄 **배포 워크플로우** - 기능 개발부터 운영 배포까지
- 🔥 **긴급 수정** - Hotfix 및 Rollback
- 🛠️ **트러블슈팅** - 일반적인 문제 해결

### 기타 플랫폼 배포

#### Netlify

```bash
Build Command: npm run build
Publish Directory: build
```

#### Cloudflare Pages

```bash
Build Command: npm run build
Build Output Directory: build
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 커밋 컨벤션

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드
- `chore`: 빌드 업무, 패키지 매니저 설정 등

예시:

```bash
git commit -m "feat: 제품 상세 페이지 추가"
git commit -m "fix: 네비게이션 바 모바일 뷰 수정"
```

## 🐛 알려진 이슈

- Supabase와 Resend는 현재 비활성화되어 있습니다 (환경 변수 미설정 시)
- 제품 상세 페이지는 개발 중입니다
- 일부 이미지는 플레이스홀더를 사용하고 있습니다

## 📚 문서

프로젝트 관련 상세 문서는 `docs` 폴더에서 확인하실 수 있습니다:

### 배포 & 운영

- **[배포 가이드](./docs/DEPLOYMENT.md)** - Vercel 배포, 개발/운영 환경 분리, 배포 워크플로우
- **[배포 체크리스트](./docs/CHECKLIST.md)** - GitHub 배포 전 확인사항, 단계별 가이드

### 개발 가이드

- **[기여 가이드](./docs/CONTRIBUTING.md)** - 프로젝트 기여 방법, 커밋 컨벤션, 코딩 스타일
- **[개발 노트](./docs/DEVELOPMENT_NOTES.md)** - 개발 과정 중 주요 사항 및 팁
- **[이메일 서비스 가이드](./docs/EMAIL_SERVICE_GUIDE.md)** - 이메일 서비스 통합 가이드

### GitHub 템플릿

- **[Pull Request 템플릿](./.github/PULL_REQUEST_TEMPLATE.md)** - PR 작성 가이드
- **[버그 리포트](./.github/ISSUE_TEMPLATE/bug_report.md)** - 버그 제보 템플릿
- **[기능 제안](./.github/ISSUE_TEMPLATE/feature_request.md)** - 기능 제안 템플릿

## 📞 문의

- **회사 웹사이트**: [https://poonglimfood.co.kr](https://poonglimfood.co.kr)
- **이메일**: info@poonglim.co.kr
- **전화**: 043-878-7800

## 📄 라이선스

이 프로젝트는 [LICENSE.md](./LICENSE.md)에 명시된 라이선스를 따릅니다.

---

<div align="center">
  <strong>Made with ❤️ by Poonglim Food</strong>
  <br />
  <sub>© 2024 Poonglim Food. All rights reserved.</sub>
</div>
