# 🚀 GitHub 배포 체크리스트

프로젝트를 GitHub에 올리기 전에 확인해야 할 사항들입니다.

## ✅ 필수 사항

### 1. 민감한 정보 확인

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] API 키, 비밀번호 등 민감한 정보가 코드에 없는지 확인
- [ ] 데이터베이스 연결 문자열이 하드코딩되지 않았는지 확인

### 2. 의존성 확인

- [ ] `package.json`의 모든 의존성이 올바른지 확인
- [ ] `package-lock.json` 또는 `yarn.lock` 파일이 최신인지 확인
- [ ] 불필요한 의존성 제거

```bash
npm install
npm run build
```

### 3. 코드 품질

- [ ] 린트 오류 없는지 확인
- [ ] 타입 에러 없는지 확인
- [ ] 빌드가 성공하는지 확인

```bash
npm run typecheck
npm run build
```

### 4. 문서

- [x] `README.md` 작성 완료
- [x] `CONTRIBUTING.md` 작성 완료
- [x] 이슈 템플릿 작성 완료
- [x] PR 템플릿 작성 완료
- [ ] `LICENSE.md` 확인 (있는 경우)

### 5. Git 설정

- [ ] `.gitignore` 파일 확인
- [ ] Git 히스토리에 민감한 정보가 없는지 확인
- [ ] 불필요한 파일이 커밋되지 않았는지 확인

```bash
git status
```

## 📝 권장 사항

### 1. package.json 메타데이터 추가

`package.json` 파일을 열어 다음 정보를 추가하세요:

```json
{
  "name": "poonglim-mall-web",
  "version": "1.0.0",
  "description": "풍림푸드 공식 웹사이트 - React Router v7, TypeScript, Tailwind CSS 기반",
  "author": "Poonglim Food",
  "license": "UNLICENSED",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/poonglim-mall-web.git"
  },
  "keywords": [
    "poonglim",
    "food",
    "react-router",
    "typescript",
    "tailwindcss",
    "corporate-website"
  ],
  "homepage": "https://github.com/YOUR_USERNAME/poonglim-mall-web#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/poonglim-mall-web/issues"
  }
}
```

### 2. 환경 변수 예시 파일

`.env.example` 파일을 수동으로 생성하세요:

```env
# Supabase Configuration (Optional)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Resend Configuration (Optional)
RESEND_API_KEY=re_your_api_key_here

# Application Configuration
NODE_ENV=development
PORT=5173
```

### 3. GitHub Repository 설정

저장소 생성 후 다음 설정을 권장합니다:

- [ ] Repository description 추가
- [ ] Topics/Tags 추가 (react, typescript, tailwindcss, corporate-website 등)
- [ ] About 섹션 업데이트
- [ ] GitHub Pages 설정 (선택사항)
- [ ] Branch protection rules 설정

### 4. 추가 파일

다음 파일들을 추가하면 더 좋습니다:

- [ ] `.nvmrc` - Node 버전 명시
- [ ] `.editorconfig` - 에디터 설정
- [ ] `CHANGELOG.md` - 변경 이력
- [ ] `SECURITY.md` - 보안 정책

## 🚀 GitHub에 올리기

### 1. Git 초기화 (아직 안 했다면)

```bash
git init
git add .
git commit -m "feat: 초기 프로젝트 설정"
```

### 2. GitHub에 Push

```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/poonglim-mall-web.git
git branch -M main
git push -u origin main
```

### 3. 저장소 설정

1. **Repository Settings** → **General**
   - Description 추가
   - Topics 추가
   - Features (Issues, Projects, Wiki 등) 활성화

2. **Repository Settings** → **Branches**
   - Branch protection rules 설정 (main 브랜치)
   - Require pull request reviews
   - Require status checks to pass

3. **Repository Settings** → **Pages** (선택사항)
   - GitHub Pages 설정으로 데모 사이트 호스팅

## 📋 최종 확인

배포 전 마지막 체크:

```bash
# 1. 클린 빌드
rm -rf node_modules package-lock.json
npm install
npm run build

# 2. 개발 서버 테스트
npm run dev
# http://localhost:5173 에서 확인

# 3. 프로덕션 빌드 테스트
npm run preview
# 빌드된 버전 확인

# 4. 타입 체크
npm run typecheck

# 5. Git 상태 확인
git status
```

## 🎉 완료!

모든 체크리스트를 완료했다면 이제 GitHub에 올릴 준비가 되었습니다!

### 다음 단계

1. ✅ GitHub 저장소에 Push
2. ⚙️ CI/CD 설정 (GitHub Actions)
3. 🚀 배포 플랫폼 연결 (Vercel, Netlify 등)
4. 📊 Analytics 설정
5. 🔒 보안 스캔 설정

---

**문의사항이 있으시면 이슈를 생성해주세요!** 🙌

