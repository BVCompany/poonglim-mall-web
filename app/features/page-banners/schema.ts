/**
 * Page Banners Schema
 *
 * 각 페이지 상단 배너를 관리하는 테이블
 * page_key: "products" | "brand" | "recipe" | "event" | "careers" | "support" | "inquiry"
 *
 * RLS:
 *   - anon: is_active = true SELECT 허용
 *   - 관리자 CRUD: service_role
 */
import { sql } from "drizzle-orm";
import { boolean, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";
import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

export const pageBanners = pgTable(
  "page_banners",
  {
    ...makeIdentityColumn("page_banner_id"),
    page_key:   text().notNull(),       // "products", "brand", etc.
    title:      text().notNull(),
    subtitle:   text(),
    image_url:  text(),
    link_url:   text(),
    link_text:  text(),                 // CTA 버튼 텍스트
    is_active:  boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    pgPolicy("page-banners-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

export type PageBanner = typeof pageBanners.$inferSelect;

/** 페이지별 배너 레이블 */
export const PAGE_KEY_LABELS: Record<string, string> = {
  products: "제품 소개",
  brand:    "브랜드",
  recipe:   "레시피",
  event:    "이벤트/공지",
  careers:  "채용",
  support:  "고객지원",
  inquiry:  "구매문의",
};
