/**
 * Home DB Queries (Server-side)
 */
import { and, asc, eq, gte, lte, or, sql } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { banners, popups } from "../schema";

export type Banner = typeof banners.$inferSelect;
export type Popup = typeof popups.$inferSelect;

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

/** 현재 노출 중인 팝업 목록 */
export async function getActivePopups() {
  const now = new Date();
  return db
    .select()
    .from(popups)
    .where(
      and(
        eq(popups.is_active, true),
        or(sql`${popups.started_at} IS NULL`, lte(popups.started_at, now)),
        or(sql`${popups.ended_at} IS NULL`, gte(popups.ended_at, now)),
      ),
    );
}
