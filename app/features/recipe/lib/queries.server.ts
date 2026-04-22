/**
 * Recipe DB Queries (Server-side)
 */
import { and, asc, desc, eq } from "drizzle-orm";

import type { ContentLocale } from "~/core/db/content-locale.server";
import { pickBestLocaleRows } from "~/core/db/content-locale.server";
import db from "~/core/db/drizzle-client.server";
import { recipes } from "../schema";

export type Recipe = typeof recipes.$inferSelect;

function sortRecipeRows<T extends Recipe>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** 활성 레시피 전체 (locale 우선, 그룹당 1행) */
export async function getRecipes(locale: ContentLocale) {
  const rows = await db
    .select()
    .from(recipes)
    .where(eq(recipes.is_active, true));
  return sortRecipeRows(pickBestLocaleRows(rows, locale));
}

/** 관리자용: 비활성 포함 전체 */
export async function getAllRecipesForAdmin() {
  return db
    .select()
    .from(recipes)
    .orderBy(asc(recipes.sort_order), desc(recipes.created_at), asc(recipes.recipe_id));
}

/** 카테고리별 레시피 */
export async function getRecipesByCategory(
  category: "easy" | "dessert" | "restaurant",
  locale: ContentLocale,
) {
  const rows = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.is_active, true), eq(recipes.category, category)));
  return sortRecipeRows(pickBestLocaleRows(rows, locale));
}

/** 활성 레시피가 1건이라도 있는지 */
export async function hasAnyActiveRecipes(): Promise<boolean> {
  const rows = await db
    .select({ id: recipes.recipe_id })
    .from(recipes)
    .where(eq(recipes.is_active, true))
    .limit(1);
  return rows.length > 0;
}

/** 단건 (활성만) */
export async function getRecipeById(id: number) {
  const rows = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.recipe_id, id), eq(recipes.is_active, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** 같은 그룹에서 요청 locale 행 (활성만) */
export async function getRecipeSiblingByLocale(
  translationGroupId: string,
  locale: ContentLocale,
) {
  const rows = await db
    .select()
    .from(recipes)
    .where(
      and(
        eq(recipes.translation_group_id, translationGroupId),
        eq(recipes.locale, locale),
        eq(recipes.is_active, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
