/**
 * Brand Schema
 *
 * 공장 견학 신청 테이블
 *
 * RLS 전략:
 * - anon: INSERT만 허용 (견학 신청 제출)
 * - anon: SELECT 차단 (본인 신청 조회 불가 - 비회원)
 * - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgPolicy, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

/** 품질 인증 아이템 타입 (수상내역 | 인증서) */
export const certItemTypeEnum = pgEnum("cert_item_type", ["award", "cert"]);

/** 품질 & 인증 관리 테이블 */
export const brandCertItems = pgTable(
  "brand_cert_items",
  {
    ...makeIdentityColumn("id"),
    type: certItemTypeEnum().notNull().default("cert"),
    title: text().notNull(),
    year: text(),
    description: text(),
    image_url: text(),
    sort_order: integer().default(0).notNull(),
    is_active: boolean().default(true).notNull(),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 항목만 읽기 허용
    pgPolicy("brand-cert-items-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

export const factoryTourStatusEnum = pgEnum("factory_tour_status", [
  "pending",   // 승인대기
  "approved",  // 승인완료
  "rejected",  // 거절
]);

export const factoryTourApplications = pgTable(
  "factory_tour_applications",
  {
    ...makeIdentityColumn("tour_id"),
    applicant_name: text().notNull(),
    organization: text(),
    phone: text().notNull(),
    email: text(),
    participants: integer().notNull(),
    purpose: text().notNull(),
    requested_date: timestamp().notNull(),
    message: text(),
    status: factoryTourStatusEnum().notNull().default("pending"),
    admin_memo: text(),
    ...timestamps,
  },
  () => [
    // anon: INSERT만 허용 (견학 신청)
    pgPolicy("factory-tour-anon-insert", {
      for: "insert",
      to: anonRole,
      as: "permissive",
      withCheck: sql`true`,
    }),
    // anon: SELECT 차단
    pgPolicy("factory-tour-anon-no-select", {
      for: "select",
      to: anonRole,
      as: "restrictive",
      using: sql`false`,
    }),
  ],
);
