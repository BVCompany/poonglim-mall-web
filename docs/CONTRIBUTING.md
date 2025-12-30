# 기여 가이드 (Contributing Guide)

풍림푸드 웹사이트 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 📋 목차

- [행동 강령](#행동-강령)
- [시작하기](#시작하기)
- [개발 프로세스](#개발-프로세스)
- [커밋 컨벤션](#커밋-컨벤션)
- [Pull Request 프로세스](#pull-request-프로세스)
- [코딩 스타일](#코딩-스타일)
- [테스트](#테스트)

## 행동 강령

이 프로젝트는 모든 기여자가 존중받는 환경을 유지하기 위해 노력합니다. 참여함으로써 귀하는 이 프로젝트의 행동 강령을 준수하는 데 동의합니다.

## 시작하기

### 1. 저장소 Fork

프로젝트를 Fork하여 자신의 GitHub 계정에 복사합니다.

```bash
# Fork한 저장소 클론
git clone https://github.com/YOUR_USERNAME/poonglim-mall-web.git
cd poonglim-mall-web

# 원본 저장소를 upstream으로 추가
git remote add upstream https://github.com/ORIGINAL_OWNER/poonglim-mall-web.git
```

### 2. 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 3. 브랜치 생성

기능 추가나 버그 수정을 위한 새 브랜치를 생성합니다.

```bash
# 기능 추가
git checkout -b feature/amazing-feature

# 버그 수정
git checkout -b fix/bug-description

# 문서 수정
git checkout -b docs/update-readme
```

## 개발 프로세스

### 브랜치 전략

- `main`: 프로덕션 브랜치
- `develop`: 개발 브랜치 (있는 경우)
- `feature/*`: 새로운 기능
- `fix/*`: 버그 수정
- `docs/*`: 문서 수정
- `refactor/*`: 코드 리팩토링
- `style/*`: 코드 포맷팅, 스타일 수정
- `test/*`: 테스트 추가/수정
- `chore/*`: 빌드, 설정 변경

### 업스트림 동기화

정기적으로 원본 저장소의 변경사항을 가져옵니다.

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 커밋 컨벤션

### 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가, 테스트 코드 리팩토링
- `chore`: 빌드 업무, 패키지 매니저 설정 등

### Scope (선택사항)

변경사항의 범위를 명시합니다.

- `brand`: 브랜드 관련
- `products`: 제품 관련
- `recipe`: 레시피 관련
- `careers`: 채용 관련
- `ui`: UI 컴포넌트
- `i18n`: 다국어 관련
- `config`: 설정 파일

### 예시

```bash
feat(products): 제품 필터링 기능 추가

- 카테고리별 필터 구현
- 가격 범위 필터 추가
- URL 쿼리 파라미터 연동

Closes #123
```

```bash
fix(navigation): 모바일 메뉴 닫힘 버그 수정

모바일에서 메뉴 클릭 시 메뉴가 닫히지 않던 문제 해결

Fixes #456
```

## Pull Request 프로세스

### 1. 변경사항 확인

```bash
# 코드 포맷 확인
npm run lint

# 빌드 확인
npm run build

# 타입 체크
npm run typecheck
```

### 2. Pull Request 생성

1. 변경사항을 자신의 Fork에 푸시합니다.

   ```bash
   git push origin feature/amazing-feature
   ```

2. GitHub에서 Pull Request를 생성합니다.

3. PR 템플릿에 따라 내용을 작성합니다:
   - 변경사항 요약
   - 관련 이슈 번호
   - 테스트 방법
   - 스크린샷 (UI 변경 시)

### 3. 코드 리뷰

- 리뷰어의 피드백에 적극적으로 응답합니다.
- 요청된 변경사항을 반영합니다.
- 모든 CI 검사를 통과해야 합니다.

### 4. 머지

- 리뷰 승인 후 프로젝트 관리자가 머지합니다.
- Squash and Merge 또는 Rebase and Merge 사용

## 코딩 스타일

### TypeScript

```typescript
// ✅ 좋은 예
interface User {
  id: string;
  name: string;
  email: string;
}

export function getUserById(id: string): User | null {
  // implementation
}

// ❌ 나쁜 예
function getUserById(id) {
  // implementation
}
```

### React 컴포넌트

```tsx
// ✅ 좋은 예 - 함수형 컴포넌트, 명확한 타입
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// ❌ 나쁜 예
export function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### CSS (Tailwind)

```tsx
// ✅ 좋은 예 - 논리적 순서
<div className="container mx-auto px-4 py-16">
  <h1 className="text-4xl font-bold text-foreground mb-4">
    제목
  </h1>
</div>

// ❌ 나쁜 예 - 무작위 순서
<div className="mb-4 px-4 py-16 text-4xl container mx-auto font-bold">
  제목
</div>
```

### 파일 구조

```
feature/
├── components/        # 기능별 컴포넌트
│   ├── component-a.tsx
│   └── component-b.tsx
├── screens/          # 페이지 컴포넌트
│   ├── main.tsx
│   └── detail.tsx
├── hooks/            # 커스텀 훅 (선택사항)
└── types.ts          # 타입 정의 (선택사항)
```

## 테스트

### 단위 테스트 (권장)

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with label", () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### 수동 테스트

UI 변경사항은 다음 환경에서 테스트해야 합니다:

- ✅ 데스크톱 (Chrome, Firefox, Safari)
- ✅ 모바일 (iOS Safari, Android Chrome)
- ✅ 다크/라이트 모드
- ✅ 다국어 (한국어, 영어, 스페인어)

## 이슈 리포팅

### 버그 리포트

버그를 발견하면 다음 정보와 함께 이슈를 생성해주세요:

1. **버그 설명**: 발생한 문제를 명확하게 설명
2. **재현 방법**: 버그를 재현하는 단계
3. **예상 동작**: 올바른 동작 설명
4. **실제 동작**: 현재 발생하는 동작
5. **환경**: 브라우저, OS, 디바이스 정보
6. **스크린샷**: 가능한 경우 스크린샷 첨부

### 기능 제안

새로운 기능을 제안할 때는:

1. **기능 설명**: 제안하는 기능의 목적과 필요성
2. **사용 사례**: 기능이 사용될 시나리오
3. **대안**: 고려한 다른 방법들
4. **추가 컨텍스트**: 관련 자료나 예시

## 질문 및 도움

- 💬 **토론**: GitHub Discussions 사용
- 🐛 **버그**: GitHub Issues 사용
- 📧 **이메일**: info@poonglim.co.kr

## 라이선스

기여한 코드는 프로젝트의 라이선스를 따릅니다.

---

**다시 한번 감사드립니다!** 🎉

여러분의 기여가 풍림푸드 웹사이트를 더 나은 서비스로 만듭니다.
