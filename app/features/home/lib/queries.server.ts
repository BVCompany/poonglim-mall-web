/**
 * Home DB Queries (Server-side)
 */
import { and, asc, eq, gte, lte, or, sql } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { banners, popups } from "../schema";

export type Banner = typeof banners.$inferSelect;
export type Popup = typeof popups.$inferSelect;

/** db.execute(sql\`...\`) 결과를 행 배열로 정규화 (postgres.js RowList 등) */
function rowsFromExecute(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) {
    return result as Record<string, unknown>[];
  }
  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: Record<string, unknown>[] }).rows;
  }
  return [];
}

function toPopupRow(r: Record<string, unknown>): Popup {
  const toDateNull = (v: unknown): Date | null => {
    if (v == null) return null;
    if (v instanceof Date) return v;
    return new Date(String(v));
  };
  const toDate = (v: unknown): Date => {
    const d = toDateNull(v);
    return d ?? new Date(0);
  };
  return {
    popup_id: Number(r.popup_id),
    title: String(r.title),
    image_url: r.image_url == null ? null : String(r.image_url),
    content: r.content == null ? null : String(r.content),
    link_url: r.link_url == null ? null : String(r.link_url),
    width: r.width == null ? null : Number(r.width),
    height: r.height == null ? null : Number(r.height),
    is_active: Boolean(r.is_active),
    sort_order: r.sort_order == null ? 0 : Number(r.sort_order),
    started_at: toDateNull(r.started_at),
    ended_at: toDateNull(r.ended_at),
    updated_at: toDate(r.updated_at),
    created_at: toDate(r.created_at),
  };
}

/** 전체 배너 목록 (관리자용 — 활성/비활성 모두) */
export async function getAllBanners() {
  return db
    .select()
    .from(banners)
    .orderBy(asc(banners.sort_order));
}

/** 현재 노출 중인 배너 목록 */
export async function getActiveBanners() {
  const now = new Date();
  return db
    .select()
    .from(banners)
    .where(
      and(
        eq(banners.is_active, true),
        or(sql`${banners.started_at} IS NULL`, lte(banners.started_at, now)),
        or(sql`${banners.ended_at} IS NULL`, gte(banners.ended_at, now)),
      ),
    )
    .orderBy(asc(banners.sort_order));
}

/**
 * 현재 노출 중인 팝업 목록
 *
 * Drizzle 컬럼 메타데이터가 깨지면 `column "undefined"` 오류가 날 수 있어,
 * 컬럼 객체 없이 SQL 문자열만 사용합니다.
 */
export async function getActivePopups() {
  // postgres.js 바인딩은 Date를 지원하지 않으므로 서버 시각은 SQL now() 사용
  const result = await db.execute(sql`
    SELECT
      popup_id, title, image_url, content, link_url, width, height, is_active, sort_order,
      started_at, ended_at, updated_at, created_at
    FROM popups
    WHERE is_active = true
      AND (started_at IS NULL OR started_at <= now())
      AND (ended_at IS NULL OR ended_at >= now())
    ORDER BY sort_order ASC, popup_id ASC
  `);
  return rowsFromExecute(result).map(toPopupRow);
}

/** 관리자용: 기간·활성 무관 전체 */
export async function getAllPopups() {
  const result = await db.execute(sql`
    SELECT
      popup_id, title, image_url, content, link_url, width, height, is_active, sort_order,
      started_at, ended_at, updated_at, created_at
    FROM popups
    ORDER BY sort_order ASC, popup_id DESC
  `);
  return rowsFromExecute(result).map(toPopupRow);
}
