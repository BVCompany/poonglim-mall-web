/**
 * Products DB Queries (Server-side)
 */
import { and, asc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { products } from "../schema";

export type Product = typeof products.$inferSelect;

/** 활성 제품 전체 조회 */
export async function getProducts() {
  return db
    .select()
    .from(products)
    .where(eq(products.is_active, true))
    .orderBy(asc(products.sort_order));
}

/** 카테고리별 활성 제품 조회 (category는 text[] — ArrayContains 사용) */
export async function getProductsByCategory(category: string) {
  const { sql } = await import("drizzle-orm");
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.is_active, true),
        sql`${products.category} @> ARRAY[${category}]::text[]`,
      ),
    )
    .orderBy(asc(products.sort_order));
}

/** 홈 제품 슬라이드용 (BEST 배지 or 상위 정렬 N개) */
export async function getFeaturedProducts(limit = 10) {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.is_active, true))
    .orderBy(asc(products.sort_order));
  return rows.slice(0, limit);
}

/** 제품 단건 */
export async function getProductById(id: number) {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.product_id, id));
  return rows[0] ?? null;
}
