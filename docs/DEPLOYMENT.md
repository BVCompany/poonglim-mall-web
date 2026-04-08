# 🚀 배포 가이드

## 📋 목차

- [배포 환경 구성](#배포-환경-구성)
- [배포 양식 (템플릿)](#배포-양식-템플릿)
- [GitHub 설정](#github-설정)
- [Vercel 설정](#vercel-설정)
- [배포 워크플로우](#배포-워크플로우)
- [환경 변수 설정](#환경-변수-설정)
- [도메인 설정](#도메인-설정)
- [트러블슈팅](#트러블슈팅)

---

## 🌳 배포 환경 구성

### Branch 전략

```
main (운영 브랜치)
  └─ 운영 서버로 배포 (www.poonglim.com)
  └─ PR 머지 후 자동 배포
  └─ 보호된 브랜치 (PR 필수, 리뷰 필수)

develop (개발 브랜치)
  └─ 개발 서버로 배포 (dev.poonglim.com)
  └─ Push 시 자동 배포
  └─ 보호된 브랜치 (PR 필수)

feature/* (기능 개발 브랜치)
  └─ Vercel Preview 배포
  └─ PR 생성 시 임시 URL 생성
  └─ PR 코멘트에 Preview URL 자동 표시
```

### Vercel 프로젝트 구조

```
프로젝트명: poonglim-mall-web
Production Branch: main
Preview Branches: All branches

도메인:
├── Production: www.poonglim.com (main)
├── Development: dev.poonglim.com (develop)
└── PR Preview: preview-xxx-poonglim.vercel.app
```

---

## 📝 배포 양식 (템플릿)

배포 전 로컬에서 아래를 한 번 실행해 두면 Vercel 빌드와 동일한 검증이 됩니다.

```bash
npm run typecheck
npm run build
```

### A. 개발 배포 요약 (`develop` 푸시 / 슬랙·노션용)

아래 블록을 복사해 날짜·담당·커밋만 채워 사용합니다.

```
[개발 배포] 풍림몰 웹 (develop)
- 일시: YYYY-MM-DD HH:mm (KST)
- 담당: 
- 브랜치: develop → origin/develop
- 커밋: <short SHA> (<한 줄 요약>)
- Vercel: develop 연동 배포 완료 후 dev 도메인에서 확인
- 변경 요약:
  - 
- 확인 URL: https://dev.poonglim.com (또는 Vercel 대시보드의 해당 Deployment URL)
- 비고 (마이그레이션·환경변수 변경 시):
  - 
```

### B. Pull Request 설명 템플릿 (`develop` 또는 `main` 대상)

```markdown
## 목적


## 변경 사항


## 테스트
- [ ] 로컬 `npm run build` 통과
- [ ] (해당 시) Preview URL에서 주요 시나리오 확인

## 배포 영향
- [ ] 환경 변수 변경 없음 / 있음 (설명: )
- [ ] DB 마이그레이션 없음 / 있음 (설명: )

## 스크린샷 (선택)


```

### C. 운영 릴리스 노트 (`main` 머지 시)

```markdown
## Release — YYYY-MM-DD

### 포함 브랜치
- develop → main

### 사용자에게 보이는 변화


### 기술·운영


### 롤백 시 참고
- Vercel Deployments에서 이전 성공 배포 Promote, 또는 Git revert 후 재배포

```

### D. `vercel.json` 요약

- **리전**: `icn1` (서울)
- **GitHub 자동 배포**: `main`·`develop` 활성 (`deploymentEnabled`)

---

## 🔧 GitHub 설정

### 1. Branch Protection Rules 설정

#### main 브랜치 보호

1. GitHub 저장소 페이지로 이동

   ```
   https://github.com/BVCompany/poonglim-mall-web
   ```

2. **Settings** > **Branches** > **Add rule** 클릭

3. **Branch name pattern**: `main`

4. 다음 옵션 활성화:

   - [x] **Require a pull request before merging**
     - [x] Require approvals (최소 1명)
     - [x] Dismiss stale pull request approvals when new commits are pushed
   - [x] **Require status checks to pass before merging**
     - [x] Require branches to be up to date before merging
   - [x] **Require conversation resolution before merging**
   - [x] **Include administrators** (선택사항)
   - [x] **Allow force pushes** - **체크 해제** ⚠️
   - [x] **Allow deletions** - **체크 해제** ⚠️

5. **Create** 버튼 클릭

#### develop 브랜치 보호

1. **Settings** > **Branches** > **Add rule** 클릭

2. **Branch name pattern**: `develop`

3. 다음 옵션 활성화:

   - [x] **Require a pull request before merging**
     - [x] Require approvals (최소 1명) - 선택사항
   - [x] **Require status checks to pass before merging**
   - [x] **Include administrators** (선택사항)

4. **Create** 버튼 클릭

### 2. GitHub Actions 설정 (선택사항)

CI/CD 파이프라인을 위한 GitHub Actions 워크플로우는 필요시 추가할 수 있습니다.

---

## 🚀 Vercel 설정

### 1. Vercel 프로젝트 생성

1. **Vercel 대시보드** 접속

   ```
   https://vercel.com/dashboard
   ```

2. **Add New** > **Project** 클릭

3. **Import Git Repository**
   - GitHub 계정 연동 (BVCompany)
   - `poonglim-mall-web` 저장소 선택
   - **Import** 클릭

### 2. 프로젝트 설정

#### Build & Development Settings

```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: build
Install Command: npm install
Development Command: npm run dev
```

#### Root Directory

```
./
```

#### Node.js Version

```
20.x (권장)
```

### 3. Git Integration 설정

**Settings** > **Git** 에서:

- [x] **Production Branch**: `main`
- [x] **Automatic Deployments**: 활성화
- [x] **Preview Deployments**: 모든 브랜치
- [x] **Auto-Cancel Previous Deployments**: 활성화
- [x] **GitHub Comment**: PR에 Preview URL 자동 코멘트

### 4. 환경 변수 설정

#### Production 환경 (main 브랜치)

**Settings** > **Environment Variables** > **Add New**

| Name                       | Value                        | Environment |
| -------------------------- | ---------------------------- | ----------- |
| `VITE_APP_ENV`             | `production`                 | Production  |
| `VITE_API_URL`             | `https://api.poonglim.com`   | Production  |
| `VITE_ORDER_SYSTEM_URL`    | `https://order.poonglim.com` | Production  |
| `VITE_MALL_URL`            | `https://mall.poonglim.com`  | Production  |
| `VITE_ENABLE_ANALYTICS`    | `true`                       | Production  |
| `VITE_GOOGLE_ANALYTICS_ID` | `GA_ID`                      | Production  |

#### Preview 환경 (develop + feature/\*)

| Name                    | Value                            | Environment |
| ----------------------- | -------------------------------- | ----------- |
| `VITE_APP_ENV`          | `development`                    | Preview     |
| `VITE_API_URL`          | `https://dev-api.poonglim.com`   | Preview     |
| `VITE_ORDER_SYSTEM_URL` | `https://dev-order.poonglim.com` | Preview     |
| `VITE_MALL_URL`         | `https://dev-mall.poonglim.com`  | Preview     |
| `VITE_ENABLE_ANALYTICS` | `false`                          | Preview     |
| `VITE_ENABLE_DEBUG`     | `true`                           | Preview     |

**참고**: 환경 변수는 `env.example` 파일을 참고하세요.

### 5. 도메인 설정

#### Production 도메인 (main 브랜치)

**Settings** > **Domains** > **Add Domain**

1. 메인 도메인 추가

   ```
   www.poonglim.com
   ```

2. DNS 설정 (도메인 등록업체에서)

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. Apex 도메인 리다이렉트 (선택사항)
   ```
   poonglim.com → www.poonglim.com
   ```

#### Preview 도메인 (develop 브랜치)

**Settings** > **Domains** > **Add Domain**

1. 개발 도메인 추가

   ```
   dev.poonglim.com
   ```

2. **Git Branch**: `develop` 선택

3. DNS 설정
   ```
   Type: CNAME
   Name: dev
   Value: cname.vercel-dns.com
   ```

---

## 🔄 배포 워크플로우

### 1️⃣ 기능 개발 (Feature Branch)

```bash
# 1. develop 브랜치에서 시작
git checkout develop
git pull origin develop

# 2. feature 브랜치 생성
git checkout -b feature/new-menu

# 3. 개발 작업
# ... 코드 수정 ...

# 4. 커밋
git add .
git commit -m "feat: 새로운 메뉴 추가"

# 5. Push
git push origin feature/new-menu
```

### 2️⃣ Pull Request 생성 및 리뷰

1. **GitHub**에서 PR 생성

   - Base: `develop`
   - Compare: `feature/new-menu`

2. **Vercel이 자동으로 Preview 배포**

   - PR 코멘트에 Preview URL 표시
   - 예: `https://poonglim-mall-web-feature-new-menu-123.vercel.app`

3. **Preview에서 테스트**

   - 기능 확인
   - 디자인 확인
   - 크로스 브라우저 테스트

4. **코드 리뷰 & 승인**
   - 팀원이 코드 리뷰
   - 필요시 수정 후 재푸시

### 3️⃣ 개발 서버 배포 (develop)

```bash
# PR 머지 후 (GitHub 웹에서 Merge 버튼)
# Vercel이 자동으로 dev.poonglim.com 배포

# 로컬에서 develop 업데이트
git checkout develop
git pull origin develop
```

**자동 배포 확인:**

- Vercel 대시보드에서 배포 상태 확인
- `dev.poonglim.com`에서 기능 테스트

### 4️⃣ 운영 서버 배포 (main)

```bash
# 1. develop에서 main으로 PR 생성
GitHub > New Pull Request
  Base: main
  Compare: develop

# 2. 제목 및 설명 작성
예: "Release v1.2.0 - 새로운 메뉴 기능 추가"

# 설명에 포함할 내용:
- 변경 사항 요약
- 주요 기능
- 테스트 완료 여부
- 스크린샷 (선택)
```

**PR 체크리스트:**

- [ ] develop 서버에서 충분히 테스트 완료
- [ ] 모든 기능이 정상 작동
- [ ] 성능 이슈 없음
- [ ] 크로스 브라우저 테스트 완료
- [ ] 모바일 반응형 확인

**승인 및 머지:**

- 팀 리더/시니어 개발자가 리뷰
- 승인 후 **Merge** 버튼 클릭
- Vercel이 자동으로 `www.poonglim.com` 배포

### 5️⃣ 배포 후 확인

```bash
# 운영 사이트 접속 및 확인
https://www.poonglim.com

# 체크리스트:
- [ ] 주요 페이지 로딩 확인
- [ ] 새로운 기능 정상 작동
- [ ] 기존 기능 영향 없음
- [ ] 에러 로그 확인 (Vercel Dashboard)
```

---

## 🔥 긴급 수정 (Hotfix)

운영 환경에 긴급한 버그 수정이 필요한 경우:

```bash
# 1. main 브랜치에서 hotfix 브랜치 생성
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. 버그 수정
# ... 코드 수정 ...

# 3. 커밋 & Push
git add .
git commit -m "fix: 긴급 버그 수정"
git push origin hotfix/critical-bug

# 4. PR 생성 (main으로)
# GitHub > New Pull Request
#   Base: main
#   Compare: hotfix/critical-bug

# 5. 빠른 리뷰 & 머지
# Vercel이 자동으로 운영 배포

# 6. develop에도 반영
git checkout develop
git merge main
git push origin develop
```

---

## 🔄 롤백 (Rollback)

배포 후 문제가 발견된 경우:

### 방법 1: Vercel Dashboard에서 즉시 롤백

1. **Vercel Dashboard** > **Deployments**
2. 이전 성공한 배포 찾기
3. **... (메뉴)** > **Promote to Production**
4. 즉시 이전 버전으로 롤백됨

### 방법 2: Git Revert

```bash
# 1. 문제가 있는 커밋 찾기
git log --oneline

# 2. Revert 커밋 생성
git revert <commit-hash>

# 3. Push
git push origin main

# Vercel이 자동으로 재배포
```

---

## 📊 모니터링

### Vercel Dashboard

- **Analytics**: 페이지 뷰, 성능 지표
- **Logs**: 런타임 로그, 에러 로그
- **Deployments**: 배포 히스토리, 상태

### 체크 포인트

- 배포 후 5분 내: 주요 페이지 확인
- 배포 후 1시간: 에러 로그 확인
- 배포 후 24시간: 트래픽 및 성능 모니터링

---

## 🛠️ 트러블슈팅

### 배포 실패

#### 빌드 에러

```bash
# 로컬에서 빌드 테스트
npm run build

# 의존성 문제 해결
npm install
npm ci

# Vercel 로그 확인
Vercel Dashboard > Deployments > [Failed Deployment] > Build Logs
```

#### 환경 변수 누락

1. Vercel Dashboard > Settings > Environment Variables
2. 필요한 변수가 모두 설정되어 있는지 확인
3. 변수 추가 후 **Redeploy** 클릭

### Preview 배포가 안 됨

1. **GitHub Integration 확인**

   - Vercel > Settings > Git > GitHub App 연동 상태

2. **Branch 설정 확인**
   - Settings > Git > Production Branch = `main`
   - Settings > Git > Preview Deployments = All branches

### 도메인 연결 실패

1. **DNS 전파 대기**

   - DNS 변경 후 최대 48시간 소요
   - 확인: `nslookup www.poonglim.com`

2. **DNS 설정 확인**

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 300 (or Auto)
   ```

3. **Vercel SSL 인증서**
   - Vercel이 자동으로 Let's Encrypt SSL 발급
   - 설정 후 몇 분 소요

---

## 📚 관련 문서

- [Vercel 공식 문서](https://vercel.com/docs)
- [React Router 배포 가이드](https://reactrouter.com/en/main/guides/deployment)
- [프로젝트 README](../README.md)
- [기여 가이드](./CONTRIBUTING.md)

---

## ✅ 체크리스트

### 초기 설정 (1회만)

- [ ] GitHub Branch Protection Rules 설정 (main, develop)
- [ ] Vercel 프로젝트 생성 및 GitHub 연동
- [ ] Vercel Production Branch 설정 (main)
- [ ] Vercel 환경 변수 설정 (Production, Preview)
- [ ] 도메인 설정 및 DNS 연결

### 매 배포 시

- [ ] 로컬에서 빌드 테스트 (`npm run build`)
- [ ] develop 서버에서 충분히 테스트
- [ ] PR 생성 및 코드 리뷰
- [ ] 승인 후 머지
- [ ] 배포 후 운영 사이트 확인
- [ ] 에러 로그 모니터링

---

**마지막 업데이트**: 2026-04-08
