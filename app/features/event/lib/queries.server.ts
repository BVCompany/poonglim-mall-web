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
