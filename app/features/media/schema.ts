/**
 * Media Schema
 *
 * 뉴스, 보도자료, 카탈로그 테이블
 *
 * RLS 전략:
 * - anon: is_active = true 인 항목만 SELECT 가능
 * - 관리자 CRUD: service_role (서버 사이드, RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

export const newsTypeEnum = pgEnum("news_type", [
  "news",          // 뉴스/소식
  "press",         // 보도자료
  "announcement",  // 공지사항
]);

export const news = pgTable(
  "news",
  {
    ...makeIdentityColumn("news_id"),
    type: newsTypeEnum().notNull().default("news"),
    title: text().notNull(),
    content: text().notNull(),
    summary: text(),
    thumbnail_url: text(),
    source: text(),
    is_active: boolean().notNull().default(true),
    published_at: text(),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 뉴스만 읽기 허용
    pgPolicy("news-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

export const catalogs = pgTable(
  "catalogs",
  {
    ...makeIdentityColumn("catalog_id"),
    title: text().notNull(),
    description: text(),
    file_url: text().notNull(),
    thumbnail_url: text(),
    file_size: text(),
    is_active: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 카탈로그만 읽기 허용 (다운로드 접근)
    pgPolicy("catalogs-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);
