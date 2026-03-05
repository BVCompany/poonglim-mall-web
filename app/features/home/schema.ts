/**
 * Home Schema
 *
 * 메인 화면 배너 + 팝업 테이블
 *
 * RLS 전략:
 * - anon: is_active = true 이고 노출 기간 내 항목만 SELECT
 *   (started_at IS NULL OR started_at <= now()) AND (ended_at IS NULL OR ended_at >= now())
 * - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgPolicy, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

/** 히어로 배너 */
export const banners = pgTable(
  "banners",
  {
    ...makeIdentityColumn("banner_id"),
    title: text().notNull(),
    subtitle: text(),
    image_url: text().notNull(),
    image_mobile_url: text(),
    link_url: text(),
    button_text: text(),
    is_active: boolean().notNull().default(true),
    sort_order: integer().notNull().default(0),
    started_at: timestamp(),
    ended_at: timestamp(),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 + 노출 기간 내 배너만 읽기 허용
    pgPolicy("banners-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`
        ${table.is_active} = true
        AND (${table.started_at} IS NULL OR ${table.started_at} <= now())
        AND (${table.ended_at} IS NULL OR ${table.ended_at} >= now())
      `,
    }),
  ],
);

/** 팝업 */
export const popups = pgTable(
  "popups",
  {
    ...makeIdentityColumn("popup_id"),
    title: text().notNull(),
    image_url: text(),
    content: text(),
    link_url: text(),
    width: integer().default(400),
    height: integer().default(500),
    is_active: boolean().notNull().default(true),
    started_at: timestamp(),
    ended_at: timestamp(),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 + 노출 기간 내 팝업만 읽기 허용
    pgPolicy("popups-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`
        ${table.is_active} = true
        AND (${table.started_at} IS NULL OR ${table.started_at} <= now())
        AND (${table.ended_at} IS NULL OR ${table.ended_at} >= now())
      `,
    }),
  ],
);
