/**
 * Event Schema
 *
 * 이벤트 / 공지사항 테이블
 *
 * RLS 전략:
 * - anon: is_active = true 인 항목만 SELECT 가능
 * - 관리자 CRUD: service_role (서버 사이드, RLS 우회)
 */
import { sql } from "drizzle-orm";
import { boolean, pgEnum, pgPolicy, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

export const eventBadgeEnum = pgEnum("event_badge", [
  "hot",
  "new",
  "ending_soon",
  "important",
]);

export const eventTypeEnum = pgEnum("event_type", [
  "event",   // 이벤트
  "notice",  // 공지사항
]);

export const events = pgTable(
  "events",
  {
    ...makeIdentityColumn("event_id"),
    type: eventTypeEnum().notNull().default("event"),
    title: text().notNull(),
    content: text().notNull(),
    summary: text(),
    thumbnail_url: text(),
    badge: eventBadgeEnum(),
    is_active: boolean().notNull().default(true),
    started_at: timestamp(),
    ended_at: timestamp(),
    view_count: text().default("0"),
    ...timestamps,
  },
  (table) => [
    // anon: 활성 이벤트/공지만 읽기 허용
    pgPolicy("events-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.is_active} = true`,
    }),
  ],
);
