/**
 * Products DB Queries (Server-side)
 */
import { and, asc, eq, sql } from "drizzle-orm";

import type { ContentLocale } from "~/core/db/content-locale.server";
import { pickBestLocaleRows } from "~/core/db/content-locale.server";
import db from "~/core/db/drizzle-client.server";
import { products } from "../schema";

export type Product = typeof products.$inferSelect;

/** 관리자: locale 구분 없이 전체 행 */
export async function getAllProductsForAdmin() {
  return db
    .select()
    .from(products)
    .orderBy(
      asc(products.sort_order),
      sql`CASE WHEN ${products.locale} = 'ko' THEN 0 ELSE 1 END`,
      asc(products.product_id),
    );
}

/** 활성 제품 전체 조회 (요청 locale 우선, 그룹당 1행) */
export async function getProducts(locale: ContentLocale) {
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.is_active, true));
  return pickBestLocaleRows(rows, locale).sort(
    (a, b) => a.sort_order - b.sort_order || a.product_id - b.product_id,
  );
}

/** 카테고리별 활성 제품 (category는 text[] — ArrayContains 사용) */
export async function getProductsByCategory(category: string, locale: ContentLocale) {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.is_active, true),
        sql`${products.category} @> ARRAY[${category}]::text[]`,
      ),
    );
  return pickBestLocaleRows(rows, locale).sort(
    (a, b) => a.sort_order - b.sort_order || a.product_id - b.product_id,
  );
}

/** 홈 제품 슬라이드용 (locale 반영, 상위 정렬 N개) */
export async function getFeaturedProducts(limit = 10, locale: ContentLocale = "ko") {
  const rows = await getProducts(locale);
  return rows.slice(0, limit);
}

/** 활성 제품이 1건이라도 있는지 */
export async function hasAnyActiveProducts(): Promise<boolean> {
  const rows = await db
    .select({ id: products.product_id })
    .from(products)
    .where(eq(products.is_active, true))
    .limit(1);
  return rows.length > 0;
}

/** 제품 단건 (활성만 — 상세에서 locale 불일치 시 형제 조회/리다이렉트) */
export async function getProductById(id: number) {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.product_id, id), eq(products.is_active, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** 같은 그룹에서 요청 locale 행 (활성만) */
export async function getProductSiblingByLocale(
  translationGroupId: string,
  locale: ContentLocale,
) {
  const rows = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.translation_group_id, translationGroupId),
        eq(products.locale, locale),
        eq(products.is_active, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
