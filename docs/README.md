# 📚 프로젝트 문서

풍림푸드 웹사이트 프로젝트의 모든 문서가 이곳에 정리되어 있습니다.

## 📋 문서 목록

### 🚀 시작하기

#### [배포 가이드 (DEPLOYMENT.md)](./DEPLOYMENT.md)
Vercel을 사용한 개발/운영 환경 분리 및 자동 배포 가이드입니다.

**포함 내용:**
- 🌳 배포 환경 구성 (main, develop, feature 브랜치 전략)
- 🔧 GitHub Branch Protection Rules 설정
- 🚀 Vercel 프로젝트 설정 및 연동
- 🔄 배포 워크플로우 (기능 개발 → PR → 배포)
- 🔥 긴급 수정 (Hotfix) 및 롤백 가이드
- 🛠️ 트러블슈팅

**언제 사용하나요?**
- Vercel 배포를 처음 설정할 때
- 개발/운영 환경을 분리하고 싶을 때
- 배포 프로세스를 이해하고 싶을 때
- 배포 중 문제가 발생했을 때

#### [배포 체크리스트 (CHECKLIST.md)](./CHECKLIST.md)
GitHub에 프로젝트를 올리기 전 확인해야 할 사항들과 단계별 가이드입니다.

**포함 내용:**
- ✅ 필수 확인 사항 (민감한 정보, 의존성, 코드 품질, 문서, Git 설정)
- 📝 권장 사항 (package.json 메타데이터, 환경 변수, GitHub 설정)
- 🚀 GitHub에 올리는 방법
- 📋 최종 확인 체크리스트

**언제 사용하나요?**
- 프로젝트를 처음 GitHub에 올릴 때
- 새로운 배포 전 체크할 때
- 프로덕션 배포 전 확인할 때

---

### 🤝 기여하기

#### [기여 가이드 (CONTRIBUTING.md)](./CONTRIBUTING.md)
프로젝트에 기여하는 방법과 개발 가이드라인입니다.

**포함 내용:**
- 🌿 브랜치 전략
- 💬 커밋 컨벤션
- 🔀 Pull Request 프로세스
- 🎨 코딩 스타일 가이드
- ✅ 테스트 가이드
- 🐛 이슈 리포팅 방법

**언제 사용하나요?**
- 새로운 기능을 추가할 때
- 버그를 수정할 때
- 코드 리뷰를 할 때
- 프로젝트에 처음 기여할 때

---

### 💻 개발

#### [개발 노트 (DEVELOPMENT_NOTES.md)](./DEVELOPMENT_NOTES.md)
개발 과정에서의 주요 결정사항, 문제 해결 방법, 유용한 팁들이 정리되어 있습니다.

**포함 내용:**
- 🔧 개발 환경 설정
- 🐛 일반적인 문제 해결
- 💡 개발 팁과 트릭
- 📝 주요 결정사항과 그 이유

**언제 사용하나요?**
- 개발 중 문제가 발생했을 때
- 특정 기능을 구현하는 방법을 찾을 때
- 프로젝트 구조를 이해하고 싶을 때

#### [이메일 서비스 가이드 (EMAIL_SERVICE_GUIDE.md)](./EMAIL_SERVICE_GUIDE.md)
이메일 서비스 통합 방법과 국내 이메일 서비스 연동 가이드입니다.

**포함 내용:**
- 📧 Resend 대체 방법
- 🇰🇷 국내 이메일 서비스 연동 (STIBEE, Mailgun)
- 🔌 통합 예제 코드
- ⚙️ 설정 방법

**언제 사용하나요?**
- 이메일 기능을 활성화할 때
- 문의 폼에서 이메일 전송이 필요할 때
- 회원가입 인증 메일을 보낼 때

---

## 🗂 문서 구조

```
docs/
├── README.md                    # 📍 이 파일 (문서 인덱스)
├── DEPLOYMENT.md                # 🚀 배포 가이드
├── CHECKLIST.md                 # ✅ 배포 체크리스트
├── CONTRIBUTING.md              # 🤝 기여 가이드
├── DEVELOPMENT_NOTES.md         # 💻 개발 노트
└── EMAIL_SERVICE_GUIDE.md       # 📧 이메일 서비스 가이드
```

## 🔗 관련 링크

### 프로젝트 루트
- **[README.md](../README.md)** - 프로젝트 메인 문서
- **[LICENSE.md](../LICENSE.md)** - 라이선스 정보

### GitHub 템플릿
- **[Pull Request 템플릿](../.github/PULL_REQUEST_TEMPLATE.md)** - PR 작성 가이드
- **[버그 리포트](../.github/ISSUE_TEMPLATE/bug_report.md)** - 버그 제보 템플릿
- **[기능 제안](../.github/ISSUE_TEMPLATE/feature_request.md)** - 기능 제안 템플릿

## 📝 문서 업데이트

문서를 업데이트하거나 새로운 문서를 추가하고 싶으신가요?

1. **수정하고 싶은 문서를 찾아 수정합니다**
2. **변경사항을 커밋합니다**
   ```bash
   git add docs/
   git commit -m "docs: 문서 업데이트"
   ```
3. **Pull Request를 생성합니다**

## 💬 질문이 있으신가요?

- 💬 **토론**: GitHub Discussions 사용
- 🐛 **버그**: GitHub Issues로 제보
- 📧 **이메일**: info@poonglim.co.kr

---

<div align="center">
  <strong>Made with ❤️ by Poonglim Food</strong>
</div>

