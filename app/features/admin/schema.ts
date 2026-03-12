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
import { boolean, pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
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
