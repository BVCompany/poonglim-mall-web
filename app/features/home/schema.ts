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

import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

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

/**
 * 인스타그램 섹션 직접 등록 이미지
 *
 * 메타(인스타) API 연동을 대비한 섹션이지만, 연동 전에는 관리자가 직접 올린
 * 이미지를 노출하기 위한 테이블. (연동은 그대로 유지하고 직접 등록을 보조 수단으로 사용)
 */
export const instagramPosts = pgTable(
  "instagram_posts",
  {
    ...makeIdentityColumn("instagram_post_id"),
    image_url: text().notNull(),
    /** 클릭 시 이동 링크 (비우면 공식 인스타 계정으로 이동) */
    link_url: text(),
    /** 관리용 메모/대체텍스트 */
    caption: text(),
    is_active: boolean().notNull().default(true),
    sort_order: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 이미지만 읽기 허용
    pgPolicy("instagram-posts-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
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
    sort_order: integer().notNull().default(0),
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
