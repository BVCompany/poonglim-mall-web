/**
 * Inquiry Schema
 *
 * B2B/대량구매 상담 문의 테이블
 *
 * RLS 전략:
 * - anon: INSERT만 허용 (문의 제출)
 * - anon: SELECT 차단 (비회원은 제출 후 조회 불가)
 * - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import { pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "pending",    // 대기중
  "completed",  // 처리완료
]);

export const inquiryTypeEnum = pgEnum("inquiry_type", [
  "b2b",          // B2B 상담
  "bulk",         // 대량구매
  "franchise",    // 프랜차이즈
  "export",       // 수출문의
  "general",      // 일반 제품 문의
]);

export const inquiries = pgTable(
  "inquiries",
  {
    ...makeIdentityColumn("inquiry_id"),
    type: inquiryTypeEnum().notNull(),
    name: text().notNull(),
    company: text(),
    phone: text().notNull(),
    email: text().notNull(),
    title: text().notNull(),
    content: text().notNull(),
    status: inquiryStatusEnum().notNull().default("pending"),
    admin_memo: text(),
    ...timestamps,
  },
  () => [
    // anon: INSERT만 허용
    pgPolicy("inquiries-anon-insert", {
      for: "insert",
      to: anonRole,
      as: "permissive",
      withCheck: sql`true`,
    }),
    // anon: SELECT 차단
    pgPolicy("inquiries-anon-no-select", {
      for: "select",
      to: anonRole,
      as: "restrictive",
      using: sql`false`,
    }),
  ],
);
