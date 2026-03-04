/**
 * Recipe DB Queries (Server-side)
 */
import { and, asc, desc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { recipes } from "../schema";

export type Recipe = typeof recipes.$inferSelect;

/** 활성 레시피 전체 */
export async function getRecipes() {
  return db
    .select()
    .from(recipes)
    .where(eq(recipes.is_active, true))
    .orderBy(asc(recipes.sort_order), desc(recipes.created_at));
}

/** 카테고리별 레시피 */
export async function getRecipesByCategory(
  category: "easy" | "dessert" | "restaurant",
) {
  return db
    .select()
    .from(recipes)
    .where(and(eq(recipes.is_active, true), eq(recipes.category, category)))
    .orderBy(asc(recipes.sort_order));
}

/** 단건 */
export async function getRecipeById(id: number) {
  const rows = await db
    .select()
    .from(recipes)
    .where(eq(recipes.recipe_id, id));
  return rows[0] ?? null;
}
