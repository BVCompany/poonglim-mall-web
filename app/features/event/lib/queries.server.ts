/**
 * Event DB Queries (Server-side)
 */
import { and, asc, desc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { events } from "../schema";

export type Event = typeof events.$inferSelect;

/** 활성 이벤트/공지 전체 조회 */
export async function getEvents() {
  return db
    .select()
    .from(events)
    .where(eq(events.is_active, true))
    .orderBy(desc(events.created_at));
}

/** 관리자용: 비활성 포함 전체 */
export async function getAllEventsForAdmin() {
  return db.select().from(events).orderBy(desc(events.created_at));
}

/** 타입별 조회 */
export async function getEventsByType(type: "event" | "notice") {
  return db
    .select()
    .from(events)
    .where(and(eq(events.is_active, true), eq(events.type, type)))
    .orderBy(desc(events.created_at));
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

/** type=event 인 활성 이벤트만 조회 */
export async function getEventsOnly() {
  return db
    .select()
    .from(events)
    .where(and(eq(events.is_active, true), eq(events.type, "event")))
    .orderBy(desc(events.created_at));
}

/** 이전글 / 다음글 */
export async function getAdjacentEvents(id: number) {
  const all = await db
    .select({ event_id: events.event_id, title: events.title })
    .from(events)
    .where(and(eq(events.is_active, true), eq(events.type, "event")))
    .orderBy(desc(events.created_at));

  const idx = all.findIndex((e) => e.event_id === id);
  if (idx === -1) return { prev: null, next: null };
  /* created_at desc: 이전글 = 더 오래된 글, 다음글 = 더 최신 글 */
  const older = all[idx + 1];
  const newer = all[idx - 1];
  return {
    prev: older ? { event_id: older.event_id, title: older.title } : null,
    next: newer ? { event_id: newer.event_id, title: newer.title } : null,
  };
}
