# 이메일 서비스 교체 가이드

## 🚫 현재 상태: Resend (해외 서비스) - 임시 비활성화

현재 Resend는 mock 클라이언트로 대체되어 실제 이메일이 발송되지 않습니다.
콘솔에 로그만 출력됩니다.

---

## 📧 국내 이메일/알림 서비스 옵션

### 1. 알리고 (Aligo) ⭐ 추천
- **장점**: 
  - SMS, LMS, 카카오 알림톡 통합 지원
  - 합리적인 가격
  - 간단한 API
  - 한국어 문서 및 고객지원
- **가격**: SMS 건당 약 15~20원
- **웹사이트**: https://smartsms.aligo.in/
- **npm**: `npm install aligo-api`

### 2. 네이버 클라우드 SENS
- **장점**:
  - 대기업 신뢰도
  - SMS, 알림톡, Push 통합
  - 안정적인 인프라
- **가격**: SMS 건당 약 9~12원
- **웹사이트**: https://www.ncloud.com/product/applicationService/sens

### 3. 카카오 비즈니스 (알림톡/친구톡)
- **장점**:
  - 높은 도달률 및 오픈율
  - 브랜딩 효과
  - 템플릿 기반 관리
- **가격**: 건당 약 8~15원
- **웹사이트**: https://business.kakao.com/

### 4. 토스페이먼츠 알림톡
- **장점**:
  - 결제와 알림 통합
  - 간편한 연동
- **웹사이트**: https://www.tosspayments.com/

---

## 🔧 알리고 구현 예시

### 1. 설치
```bash
npm install aligo-api
```

### 2. 환경 변수 설정 (.env)
```env
ALIGO_API_KEY=your_api_key_here
ALIGO_USER_ID=your_user_id_here
ALIGO_SENDER=01012345678  # 발신번호
```

### 3. 클라이언트 구현
`app/core/lib/email-client.server.ts` (resend-client.server.ts 이름 변경)

```typescript
import Aligo from 'aligo-api';

const emailClient = new Aligo({
  key: process.env.ALIGO_API_KEY!,
  user_id: process.env.ALIGO_USER_ID!,
});

// SMS 발송 함수
export async function sendSMS({
  to,
  subject,
  message
}: {
  to: string;
  subject: string;
  message: string;
}) {
  try {
    const result = await emailClient.send({
      sender: process.env.ALIGO_SENDER!,
      receiver: to,
      msg: message,
      msg_type: 'SMS', // or 'LMS' for long message
      title: subject,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('SMS 발송 실패:', error);
    return { success: false, error };
  }
}

// 카카오 알림톡 발송 함수
export async function sendKakaoAlimtalk({
  to,
  templateCode,
  variables
}: {
  to: string;
  templateCode: string;
  variables: Record<string, string>;
}) {
  try {
    const result = await emailClient.sendAlimtalk({
      receiver: to,
      template_code: templateCode,
      variables,
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('알림톡 발송 실패:', error);
    return { success: false, error };
  }
}

export default {
  sendSMS,
  sendKakaoAlimtalk,
};
```

---

## 📝 수정이 필요한 파일들

### 1. Contact Form (문의하기)
**파일**: `app/features/contact/screens/contact-us.tsx` (line 216-225)

**현재**:
```typescript
await resendClient.emails.send({
  from: "Poonglim Mall <hello@poonglim-mall.com>",
  to: [process.env.ADMIN_EMAIL!],
  subject: "New contact from Poonglim Mall",
  html: `...`,
});
```

**변경 후**:
```typescript
await sendSMS({
  to: process.env.ADMIN_PHONE!, // 관리자 휴대폰 번호
  subject: "풍림몰 문의",
  message: `[풍림몰 문의]\n이름: ${name}\n이메일: ${email}\n내용: ${message}`,
});
```

### 2. Welcome Email (환영 메시지)
**파일**: `app/features/cron/api/mailer.tsx` (line 94-100)

**변경 후**:
```typescript
await sendKakaoAlimtalk({
  to: to,
  templateCode: "WELCOME_TEMPLATE", // 카카오 승인 받은 템플릿 코드
  variables: {
    name: emailData.name,
    // 기타 변수들
  },
});
```

---

## 📋 구현 체크리스트

- [ ] 이메일 서비스 선택 (알리고/네이버/카카오)
- [ ] 서비스 가입 및 API 키 발급
- [ ] 발신번호 등록 및 승인
- [ ] (카카오 사용 시) 알림톡 템플릿 작성 및 승인
- [ ] npm 패키지 설치
- [ ] 환경 변수 설정
- [ ] `resend-client.server.ts` 파일 수정
- [ ] Contact Form 수정
- [ ] Welcome Email 수정
- [ ] 테스트 발송 확인
- [ ] 실제 환경에서 최종 테스트

---

## 🧪 테스트 방법

```typescript
// 개발 환경에서 테스트
import { sendSMS } from '~/core/lib/email-client.server';

await sendSMS({
  to: '01012345678', // 테스트 번호
  subject: '테스트',
  message: '이것은 테스트 메시지입니다.',
});
```

---

## 💰 비용 참고

| 서비스 | SMS | LMS | 알림톡 | 비고 |
|--------|-----|-----|--------|------|
| 알리고 | 15원 | 45원 | 8원 | 충전식 |
| 네이버 SENS | 9원 | 30원 | - | 월 과금 |
| 카카오 | - | - | 8-15원 | 템플릿별 차등 |

---

## 📞 지원 문의

각 서비스 고객센터:
- 알리고: 1661-9440
- 네이버 클라우드: 1588-9837
- 카카오 비즈니스: 1544-5664

