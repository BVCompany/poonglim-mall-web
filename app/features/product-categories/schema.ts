/**
 * Product Categories Schema
 *
 * 제품 카테고리를 관리자에서 자유롭게 추가/수정/삭제할 수 있는 테이블.
 * products.category 컬럼은 이 테이블의 slug를 참조한다.
 *
 * RLS:
 *   - anon: is_active = true SELECT 허용
 *   - 관리자 CRUD: service_role
 */
import { sql } from "drizzle-orm";
import { boolean, integer, pgPolicy, pgTable, text } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";
import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

export const productCategories = pgTable(
  "product_categories",
  {
    ...makeIdentityColumn("category_id"),
    name:       text().notNull(),             // 표시명(국문) (예: "액란가공품")
    name_en:    text(),                       // 표시명(영문, 선택) — 영문 사이트 노출용
    slug:       text().notNull(),             // 식별자 (예: "liquid_egg") — products.category 참조
    sort_order: integer().notNull().default(0),
    is_active:  boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    pgPolicy("product-categories-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);

export type ProductCategory = typeof productCategories.$inferSelect;
