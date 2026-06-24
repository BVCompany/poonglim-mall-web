/**
 * Media DB Queries (Server-side)
 */
import { and, asc, desc, eq, sql } from "drizzle-orm";

import type { ContentLocale } from "~/core/db/content-locale.server";
import { pickBestLocaleRows } from "~/core/db/content-locale.server";
import db from "~/core/db/drizzle-client.server";
import { catalogs, news, newsCategories } from "../schema";

export type News = typeof news.$inferSelect;
export type Catalog = typeof catalogs.$inferSelect;

/** 뉴스 카테고리(=news.type) 국문명 → 영문명 매핑 (영문 사이트 라벨용) */
export async function getNewsCategoryNameEnMap() {
  const rows = await db
    .select({ name: newsCategories.name, name_en: newsCategories.name_en })
    .from(newsCategories)
    .catch(() => [] as { name: string; name_en: string | null }[]);
  const map: Record<string, string> = {};
  for (const r of rows) if (r.name_en) map[r.name] = r.name_en;
  return map;
}

function sortNewsRows<T extends News>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const pa = a.published_at ?? "";
    const pb = b.published_at ?? "";
    if (pa !== pb) return pb.localeCompare(pa);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/** 활성 뉴스 전체 (locale 우선, 그룹당 1행) */
export async function getNews(locale: ContentLocale) {
  const rows = await db
    .select()
    .from(news)
    .where(eq(news.is_active, true));
  return sortNewsRows(pickBestLocaleRows(rows, locale));
}

/** 타입별 뉴스 조회 */
export async function getNewsByType(
  type: "news" | "press" | "announcement",
  locale: ContentLocale,
) {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.is_active, true), eq(news.type, type)));
  return sortNewsRows(pickBestLocaleRows(rows, locale));
}

/** 홈 뉴스피드용 최근 N개 (기사 작성일 published_at 최신순 — /media 목록과 동일) */
export async function getRecentNews(limit = 5, locale: ContentLocale = "ko") {
  const rows = await getNews(locale);
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

/**
 * ID로 단건 — 활성만. (locale 불일치 시 상위에서 형제 조회/리다이렉트)
 */
export async function getNewsById(id: number) {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.news_id, id), eq(news.is_active, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** 같은 그룹에서 요청 locale 행 (없으면 null) */
export async function getNewsSiblingByLocale(
  translationGroupId: string,
  locale: ContentLocale,
) {
  const rows = await db
    .select()
    .from(news)
    .where(
      and(
        eq(news.translation_group_id, translationGroupId),
        eq(news.locale, locale),
        eq(news.is_active, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** 상세 조회 시 조회수 1 증가 — 동일 그룹(ko/en) 행에 동일 값 반영 */
export async function incrementNewsViewCount(id: number): Promise<string | null> {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.news_id, id), eq(news.is_active, true)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const current = Number.parseInt(String(row.view_count ?? "0"), 10);
  const next = String(Number.isFinite(current) && current >= 0 ? current + 1 : 1);

  await db
    .update(news)
    .set({ view_count: next })
    .where(eq(news.translation_group_id, row.translation_group_id));

  return next;
}

/**
 * 인접 글 (목록 정렬: published_at desc, created_at desc 기준, locale 반영 목록과 동일)
 */
export async function getAdjacentNews(newsId: number, locale: ContentLocale) {
  const ordered = await getNews(locale);
  const idx = ordered.findIndex((r) => r.news_id === newsId);
  if (idx === -1) return { prev: null as { news_id: number; title: string } | null, next: null as { news_id: number; title: string } | null };

  const older = ordered[idx + 1];
  const newer = ordered[idx - 1];

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
