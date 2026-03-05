/**
 * Support Schema
 *
 * FAQ + 일반 고객 문의 테이블
 *
 * RLS 전략:
 * - faqs: anon은 is_active = true 인 항목만 SELECT
 * - contacts: anon은 INSERT만 허용 (문의 제출)
 * - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

export const faqCategoryEnum = pgEnum("faq_category", [
  "product",    // 제품 문의
  "delivery",   // 배송/구매
  "b2b",        // B2B/대량구매
  "quality",    // 품질/위생
  "general",    // 기타
]);

export const contactStatusEnum = pgEnum("contact_status", [
  "pending",    // 대기중
  "completed",  // 처리완료
]);

/** FAQ */
export const faqs = pgTable(
  "faqs",
  {
    ...makeIdentityColumn("faq_id"),
    category: faqCategoryEnum().notNull(),
    question: text().notNull(),
    answer: text().notNull(),
    is_active: boolean().notNull().default(true),
    sort_order: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 FAQ만 읽기 허용
    pgPolicy("faqs-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

/** 일반 고객 문의 */
export const contacts = pgTable(
  "contacts",
  {
    ...makeIdentityColumn("contact_id"),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    title: text().notNull(),
    content: text().notNull(),
    status: contactStatusEnum().notNull().default("pending"),
    admin_memo: text(),
    ...timestamps,
  },
  () => [
    // anon: INSERT만 허용 (문의 제출)
    pgPolicy("contacts-anon-insert", {
      for: "insert",
      to: anonRole,
      as: "permissive",
      withCheck: sql`true`,
    }),
    // anon: SELECT 차단
    pgPolicy("contacts-anon-no-select", {
      for: "select",
      to: anonRole,
      as: "restrictive",
      using: sql`false`,
    }),
  ],
);
