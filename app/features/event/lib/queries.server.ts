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

/** 타입별 조회 */
export async function getEventsByType(type: "event" | "notice") {
  return db
    .select()
    .from(events)
    .where(and(eq(events.is_active, true), eq(events.type, type)))
    .orderBy(desc(events.created_at));
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
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
