import { asc, eq } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import { recipeCategories } from "../schema";

/** 활성 카테고리 (사용자 페이지용) */
export async function getActiveRecipeCategories() {
  return db
    .select()
    .from(recipeCategories)
    .where(eq(recipeCategories.is_active, true))
    .orderBy(asc(recipeCategories.sort_order));
}

/** 전체 카테고리 (관리자용) */
export async function getAllRecipeCategories() {
  return db
    .select()
    .from(recipeCategories)
    .orderBy(asc(recipeCategories.sort_order));
}
