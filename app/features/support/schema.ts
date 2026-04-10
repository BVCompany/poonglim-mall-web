/**
 * Support Schema
 *
 * FAQ + 일반 고객 문의 + 공지사항 테이블
 *
 * RLS 전략:
 * - faqs: anon은 is_active = true 인 항목만 SELECT
 * - contacts: anon은 INSERT만 허용 (문의 제출)
 * - notices: anon은 is_active = true 인 항목만 SELECT
 * - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

/* ─── 공지사항 ─────────────────────────────────────── */
export const noticeCategoryEnum = pgEnum("notice_category", [
  "공지",   // 필수 공지
  "안내",   // 일반 안내
  "이벤트", // 이벤트 관련
]);

/** 공지사항 */
export const notices = pgTable(
  "notices",
  {
    ...makeIdentityColumn("notice_id"),
    category: noticeCategoryEnum().notNull().default("안내"),
    title: text().notNull(),
    content: text().notNull().default(""),
    author: text().notNull().default("풍림푸드"),
    tags: text().array().notNull().default(sql`'{}'::text[]`),
    view_count: integer().notNull().default(0),
    is_pinned: boolean().notNull().default(false),
    is_active: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    pgPolicy("notices-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

/* ─── 등급판정서 ────────────────────────────────────── */
export const certTabEnum = pgEnum("cert_tab", [
  "current", // 등급판정서 (최신)
  "archive", // 등급판정서 (2022.11 이전)
]);

export const certTypeEnum = pgEnum("cert_type", [
  "포장란", // 포장란용
  "액란",   // 액란용
  "기타",   // 기타
]);

/** 등급판정서 */
export const gradeCertificates = pgTable(
  "grade_certificates",
  {
    ...makeIdentityColumn("cert_id"),
    tab: certTabEnum().notNull().default("current"),
    cert_type: certTypeEnum().notNull().default("포장란"),
    title: text().notNull(),
    content: text().notNull().default(""),
    author: text().notNull().default("풍림푸드"),
    file_url: text(),    // 첨부 파일 URL
    file_name: text(),   // 첨부 파일 표시명
    view_count: integer().notNull().default(0),
    is_active: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    pgPolicy("grade-certificates-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

/* ─── FAQ ──────────────────────────────────────────── */
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
    inquiry_type: text().notNull().default("기타"),  // 문의유형
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    company: text(),                                  // 회사/기관명 (선택)
    title: text().notNull(),
    content: text().notNull(),
    lookup_password: text().notNull().default(""),    // 문의내역 조회용 비밀번호
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

/** 고객지원 자료실 (파일·본문) */
export const libraryResources = pgTable(
  "library_resources",
  {
    ...makeIdentityColumn("resource_id"),
    category: text().notNull(),
    title: text().notNull(),
    content: text().notNull().default(""),
    author: text().notNull().default("풍림푸드"),
    file_name: text().notNull(),
    file_url: text().notNull(),
    file_size_label: text(),
    file_ext: text().default("PDF"),
    view_count: integer().notNull().default(0),
    is_active: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    pgPolicy("library-resources-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);
