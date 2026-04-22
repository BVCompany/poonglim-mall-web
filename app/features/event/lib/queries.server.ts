/**
 * Event DB Queries (Server-side)
 */
import { and, desc, eq } from "drizzle-orm";

import type { ContentLocale } from "~/core/db/content-locale.server";
import { pickBestLocaleRows } from "~/core/db/content-locale.server";
import db from "~/core/db/drizzle-client.server";
import { events } from "../schema";

export type Event = typeof events.$inferSelect;

function sortEventsByCreatedDesc<T extends Event>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** 활성 이벤트/공지 전체 조회 */
export async function getEvents(locale: ContentLocale = "ko") {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.is_active, true));
  return sortEventsByCreatedDesc(pickBestLocaleRows(rows, locale));
}

/** 관리자용: 비활성 포함 전체 */
export async function getAllEventsForAdmin() {
  return db.select().from(events).orderBy(desc(events.created_at));
}

/** 타입별 조회 */
export async function getEventsByType(
  type: "event" | "notice",
  locale: ContentLocale = "ko",
) {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.is_active, true), eq(events.type, type)));
  return sortEventsByCreatedDesc(pickBestLocaleRows(rows, locale));
}

/** 활성 이벤트/공지가 1건이라도 있는지 (상세 목업 여부) */
export async function hasAnyActiveEvents(): Promise<boolean> {
  const rows = await db
    .select({ id: events.event_id })
    .from(events)
    .where(eq(events.is_active, true))
    .limit(1);
  return rows.length > 0;
}

/** 단건 */
export async function getEventById(id: number) {
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.event_id, id));
  return rows[0] ?? null;
}

export async function getEventSiblingByLocale(
  translationGroupId: string,
  locale: ContentLocale,
) {
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.translation_group_id, translationGroupId),
        eq(events.locale, locale),
        eq(events.is_active, true),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

/** type=event 인 활성 이벤트만 조회 */
export async function getEventsOnly(locale: ContentLocale = "ko") {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.is_active, true), eq(events.type, "event")));
  return sortEventsByCreatedDesc(pickBestLocaleRows(rows, locale));
}

/** 이전글 / 다음글 (이벤트 타입, created_at desc 목록과 동일) */
export async function getAdjacentEvents(id: number, locale: ContentLocale = "ko") {
  const all = await getEventsOnly(locale);
  const idx = all.findIndex((e) => e.event_id === id);
  if (idx === -1) return { prev: null, next: null };
  const older = all[idx + 1];
  const newer = all[idx - 1];
  return {
    prev: older ? { event_id: older.event_id, title: older.title } : null,
    next: newer ? { event_id: newer.event_id, title: newer.title } : null,
  };
}
