import { asc, eq } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import { productCategories } from "../schema";

/** 활성 카테고리 전체 (사용자 페이지용) */
export async function getActiveCategories() {
  return db
    .select()
    .from(productCategories)
    .where(eq(productCategories.is_active, true))
    .orderBy(asc(productCategories.sort_order));
}

/** 전체 카테고리 (관리자용) */
export async function getAllCategories() {
  return db
    .select()
    .from(productCategories)
    .orderBy(asc(productCategories.sort_order));
}
