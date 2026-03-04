/**
 * Media DB Queries (Server-side)
 */
import { and, asc, desc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { catalogs, news } from "../schema";

export type News = typeof news.$inferSelect;
export type Catalog = typeof catalogs.$inferSelect;


/** 활성 뉴스 전체 */
export async function getNews() {
  return db
    .select()
    .from(news)
    .where(eq(news.is_active, true))
    .orderBy(desc(news.created_at));
}

/** 타입별 뉴스 조회 */
export async function getNewsByType(type: "news" | "press" | "announcement") {
  return db
    .select()
    .from(news)
    .where(and(eq(news.is_active, true), eq(news.type, type)))
    .orderBy(desc(news.created_at));
}

/** 홈 뉴스피드용 최근 N개 */
export async function getRecentNews(limit = 5) {
  const rows = await db
    .select()
    .from(news)
    .where(eq(news.is_active, true))
    .orderBy(desc(news.created_at));
  return rows.slice(0, limit);
}

/** 활성 카탈로그 전체 */
export async function getCatalogs() {
  return db
    .select()
    .from(catalogs)
    .where(eq(catalogs.is_active, true))
    .orderBy(asc(catalogs.created_at));
}
