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

export const productCategoryEnum = pgEnum("product_category", [
  "liquid_egg",  // 액란
  "pudding",     // 푸딩
  "convenience", // 간편식
  "b2b",         // B2B 전용
]);

export const products = pgTable(
  "products",
  {
    ...makeIdentityColumn("product_id"),
    name: text().notNull(),
    description: text().notNull(),
    detail: text(),                         // 상세 설명
    category: productCategoryEnum().notNull(),
    badge: productBadgeEnum(),              // BEST / NEW / B2B / SALE
    image_url: text(),
    image_urls: text().array().default([]),
    price: integer(),
    original_price: integer(),
    is_b2b: boolean().notNull().default(false),
    is_active: boolean().notNull().default(true),
    sort_order: integer().notNull().default(0),
    tags: text().array().default([]),
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
