/**
 * Recipe Schema
 *
 * 레시피 테이블
 *
 * RLS 전략:
 * - anon: is_active = true 인 레시피만 SELECT 가능
 * - 관리자 CRUD: service_role (서버 사이드, RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers.server";

export const recipeCategoryEnum = pgEnum("recipe_category", [
  "easy",       // 가정용
  "dessert",    // 카페/베이커리
  "restaurant", // 레스토랑
]);

export const recipes = pgTable(
  "recipes",
  {
    ...makeIdentityColumn("recipe_id"),
    title: text().notNull(),
    category: recipeCategoryEnum().notNull(),
    description: text(),
    thumbnail_url: text(),
    image_urls: text().array().default([]),
    cooking_time: integer(),
    servings: integer(),
    difficulty: text(),
    // JSON 배열: [{name, amount, unit}]
    ingredients: text(),
    // JSON 배열: [{step, description, image_url}]
    steps: text(),
    // JSON: {calories, protein, fat, carbs}
    nutrition: text(),
    tips: text(),
    tags: text().array().default([]),
    is_active: boolean().notNull().default(true),
    sort_order: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 레시피만 읽기 허용
    pgPolicy("recipes-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);
