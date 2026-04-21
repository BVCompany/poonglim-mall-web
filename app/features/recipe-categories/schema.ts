/**
 * Recipe Categories Schema
 *
 * 레시피 카테고리를 관리자에서 자유롭게 추가/수정/삭제할 수 있는 테이블.
 * recipes.category 컬럼은 이 테이블의 slug를 참조한다.
 *
 * RLS:
 *   - anon: is_active = true SELECT 허용
 *   - 관리자 CRUD: service_role
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";
import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

export const recipeCategories = pgTable(
  "recipe_categories",
  {
    ...makeIdentityColumn("category_id"),
    name:       text().notNull(),           // 표시명 (예: "가정용")
    slug:       text().notNull().unique(), // 식별자 (예: "easy") — recipes.category 참조
    color:      text().notNull().default("sky"),
    sort_order: integer().notNull().default(0),
    is_active:  boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    pgPolicy("recipe-categories-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

export type RecipeCategory = typeof recipeCategories.$inferSelect;
