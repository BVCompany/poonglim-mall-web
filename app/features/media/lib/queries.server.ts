/**
 * Media DB Queries (Server-side)
 */
import { and, asc, desc, eq, sql } from "drizzle-orm";

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

/** 활성 뉴스가 1건이라도 있는지 (목업 노출 여부 판단용) */
export async function hasAnyActiveNews(): Promise<boolean> {
  const rows = await db
    .select({ id: news.news_id })
    .from(news)
    .where(eq(news.is_active, true))
    .limit(1);
  return rows.length > 0;
}

/** 활성 뉴스 단건 */
export async function getNewsById(id: number) {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.news_id, id), eq(news.is_active, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** 상세 조회 시 조회수 1 증가 후 갱신된 값 반환 */
export async function incrementNewsViewCount(id: number): Promise<string | null> {
  const rows = await db
    .update(news)
    .set({
      view_count: sql`(COALESCE(NULLIF(TRIM(${news.view_count}), ''), '0')::integer + 1)::text`,
    })
    .where(and(eq(news.news_id, id), eq(news.is_active, true)))
    .returning({ view_count: news.view_count });
  return rows[0]?.view_count ?? null;
}

/**
 * 인접 글 (목록 정렬: published_at desc, created_at desc 기준)
 * - 이전글: 더 오래된 글(목록에서 아래)
 * - 다음글: 더 최신 글(목록에서 위)
 */
export async function getAdjacentNews(newsId: number) {
  const rows = await db
    .select({ news_id: news.news_id, title: news.title })
    .from(news)
    .where(eq(news.is_active, true))
    .orderBy(desc(news.published_at), desc(news.created_at));

  const idx = rows.findIndex((r) => r.news_id === newsId);
  if (idx === -1) return { prev: null as { news_id: number; title: string } | null, next: null as { news_id: number; title: string } | null };

  const older = rows[idx + 1];
  const newer = rows[idx - 1];

  return {
    prev: older ? { news_id: older.news_id, title: older.title } : null,
    next: newer ? { news_id: newer.news_id, title: newer.title } : null,
  };
}

/** 활성 카탈로그 전체 */
export async function getCatalogs() {
  return db
    .select()
    .from(catalogs)
    .where(eq(catalogs.is_active, true))
    .orderBy(asc(catalogs.created_at));
}
