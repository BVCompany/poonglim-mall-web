/**
 * Admin Schema
 *
 * 관리자 계정 테이블
 * - 슈퍼관리자(super) / 일반관리자(admin)
 *
 * RLS 전략:
 * - 공개 접근 완전 차단 (anon, authenticated 모두 접근 불가)
 * - 관리자 CRUD는 서버에서 service_role로 처리 (RLS 우회)
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  jsonb,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
} from "drizzle-orm/pg-core";
import { anonRole, authenticatedRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

export const adminRoleEnum = pgEnum("admin_role", ["super", "admin"]);

export const admins = pgTable(
  "admins",
  {
    ...makeIdentityColumn("admin_id"),
    name: text().notNull(),
    email: text().notNull().unique(),
    password_hash: text().notNull(),
    role: adminRoleEnum().notNull().default("admin"),
    // 허용 권한: "products","recipes","events","careers","banners","admins","inquiries"
    permissions: text().array().notNull().default([]),
    is_active: boolean().notNull().default(true),
    ...timestamps,
  },
  () => [
    // anon 차단: SELECT 불가
    pgPolicy("admins-anon-no-select", {
      for: "select",
      to: anonRole,
      as: "restrictive",
      using: sql`false`,
    }),
    pgPolicy("admins-authenticated-no-select", {
      for: "select",
      to: authenticatedRole,
      as: "restrictive",
      using: sql`false`,
    }),
  ],
);

/**
 * 관리자 변경 이력.
 *
 * 애플리케이션에서는 INSERT와 SELECT만 사용하며, DB 트리거가 UPDATE/DELETE를
 * 거부한다. 관리자 계정이 비활성화된 뒤에도 행위자 정보가 보존되도록 이름과
 * 이메일을 함께 스냅샷으로 저장한다.
 */
export const adminAuditLogs = pgTable("admin_audit_logs", {
  ...makeIdentityColumn("audit_log_id"),
  admin_id: text().notNull(),
  admin_name: text().notNull(),
  admin_email: text().notNull(),
  menu: text().notNull(),
  action: text().notNull(),
  request_path: text().notNull(),
  target_id: text(),
  details: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  ip_address: text(),
  user_agent: text(),
  created_at: timestamps.created_at,
});
