/**
 * Products Schema
 *
 * 제품 카테고리 + 제품 테이블
 *
 * RLS 전략:
 * - anon: is_active = true 인 제품만 SELECT 가능
 * - 관리자 CRUD: service_role (서버 사이드, RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

export const productBadgeEnum = pgEnum("product_badge", [
  "best",
  "new",
  "b2b",
  "sale",
]);

export const products = pgTable(
  "products",
  {
    ...makeIdentityColumn("product_id"),
    name: text().notNull(),
    description: text().notNull(),
    detail: text(),                         // 상세 설명
    category: text().notNull().default(""), // product_categories.slug 참조
    badge: productBadgeEnum(),              // BEST / NEW / B2B / SALE
    image_url: text(),
    image_urls: text().array().default([]),
    price: integer(),
    original_price: integer(),
    is_b2b: boolean().notNull().default(false),
    is_active: boolean().notNull().default(true),
    sort_order: integer().notNull().default(0),
    tags: text().array().default([]),
    // 상세 페이지 전용 필드
    shop_url:       text(),                    // 풍림몰 구매 링크
    volume:         text(),                    // 용량 (예: "1L")
    storage_method: text(),                    // 보관방법 (예: "냉장보관 0~10℃")
    expiry_info:    text(),                    // 유통기한 (예: "제조일로부터 14일")
    origin:         text(),                    // 원산지 (예: "국산")
    ingredients:    text(),                    // 성분/원재료 (예: "계란 100%")
    certifications: text().array().default([]), // 인증 (예: ["HACCP 인증", "무항생제"])
    ...timestamps,
  },
  (table) => [
    // anon: 활성 제품만 읽기 허용
    pgPolicy("products-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);
