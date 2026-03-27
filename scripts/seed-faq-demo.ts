/**
 * FAQ 데모 데이터 삽입 스크립트
 *
 * 사용법:
 *   npx tsx scripts/seed-faq-demo.ts
 *
 * FAQ 화면의 MOCK_FAQS 데이터를 그대로 DB에 등록합니다.
 * 동일한 question+answer+sort_order 조합이 있으면 건너뜁니다.
 */

import { config } from "dotenv";
import path from "path";
import postgres from "postgres";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL 환경변수가 설정되어 있지 않습니다.");
  process.exit(1);
}

const DEMO_FAQS = [
  {
    category: "product",
    question: "액란 제품은 어떻게 냉장보관 하나요?",
    answer:
      "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다. 개봉 후에는 가능한 빨리 사용해 주시고, 미개봉 제품은 제조일부터 14일 이내에 사용해 주세요. 직사광선을 피하고 냉내다 강한 식품과 함께 보관하지 않는 것이 좋습니다.",
    sort_order: 0,
    is_active: true,
  },
  {
    category: "product",
    question: "액란 제품은 어떻게 냉장보관 하나요?",
    answer: "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다.",
    sort_order: 1,
    is_active: true,
  },
  {
    category: "product",
    question: "백란이 일반 계란과 다른점은 무엇인가요?",
    answer: "백란은 껍데기 색이 흰색인 계란으로, 영양 성분은 일반 계란과 동일합니다.",
    sort_order: 2,
    is_active: true,
  },
  {
    category: "delivery",
    question: "풍림 제품의 유통기한은 얼마나 되나요?",
    answer: "제품마다 유통기한이 다릅니다. 포장재 표기를 참고해 주세요.",
    sort_order: 3,
    is_active: true,
  },
  {
    category: "delivery",
    question: "풍림몰에서 주문하면 배송은 얼마나 걸리나요?",
    answer: "주문 확인 후 영업일 기준 2~3일 내 배송됩니다.",
    sort_order: 4,
    is_active: true,
  },
  {
    category: "delivery",
    question: "풍림몰에서 주문하면 배송은 얼마나 걸리나요?",
    answer: "주문 확인 후 영업일 기준 2~3일 내 배송됩니다.",
    sort_order: 5,
    is_active: true,
  },
  {
    category: "quality",
    question: "인터 대량 주문은 어떻게 하나요?",
    answer: "B2B 문의 페이지를 통해 연락주시면 담당자가 안내드립니다.",
    sort_order: 6,
    is_active: true,
  },
  {
    category: "general",
    question: "반품 및 교환은 어떻게 하나요?",
    answer: "상품 수령 후 7일 이내 미개봉 상태에서 교환/반품 가능합니다.",
    sort_order: 7,
    is_active: true,
  },
  {
    category: "product",
    question: "풍림푸드 제품은 어떤 인증을 받나요?",
    answer: "HACCP, ISO 22000 등 다양한 품질 인증을 보유하고 있습니다.",
    sort_order: 8,
    is_active: true,
  },
  {
    category: "quality",
    question: "계란 안전성 검사는 얼마나 자주 하나요?",
    answer: "매월 정기적으로 계란 안전성 검사를 실시하고 있습니다.",
    sort_order: 9,
    is_active: true,
  },
  {
    category: "product",
    question: "계란의 등급은 어떻게 나누어지나요?",
    answer: "1+, 1, 2, 3등급으로 구분되며, 1+등급이 가장 신선합니다.",
    sort_order: 10,
    is_active: true,
  },
  {
    category: "b2b",
    question: "공장 견학이 가능한가요?",
    answer: "사전 예약을 통해 공장 견학이 가능합니다. 견학 신청 메뉴를 이용해 주세요.",
    sort_order: 11,
    is_active: true,
  },
  {
    category: "general",
    question: "자료 관련 문의는 어디로 하나요?",
    answer: "고객지원 > 문의하기 메뉴를 통해 문의해 주세요.",
    sort_order: 12,
    is_active: true,
  },
] as const;

async function main() {
  const client = postgres(DATABASE_URL as string, { max: 1 });
  const db = drizzle(client);
  const { faqs } = await import("../app/features/support/schema.js");

  let inserted = 0;
  let skipped = 0;

  for (const item of DEMO_FAQS) {
    const existing = await db
      .select({ faq_id: faqs.faq_id })
      .from(faqs)
      .where(
        and(
          eq(faqs.question, item.question),
          eq(faqs.answer, item.answer),
          eq(faqs.sort_order, item.sort_order),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭  건너뜀: ${item.question.slice(0, 30)}... (sort_order=${item.sort_order})`);
      skipped++;
      continue;
    }

    await db.insert(faqs).values({
      category: item.category,
      question: item.question,
      answer: item.answer,
      is_active: item.is_active,
      sort_order: item.sort_order,
    });

    console.log(`✅ 등록: ${item.question.slice(0, 30)}... (sort_order=${item.sort_order})`);
    inserted++;
  }

  console.log(`\n완료 — 등록: ${inserted}개, 건너뜀: ${skipped}개`);
  await client.end();
}

main().catch((err) => {
  console.error("❌ 오류:", err.message);
  process.exit(1);
});

