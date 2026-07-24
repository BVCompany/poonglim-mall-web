/**
 * Admin Events Management Screen
 *
 * 이벤트·공지 통합 목록 관리 (DB 비어 있을 때 예시 더미 표시)
 */
import type { EventCategory } from "../types/event.types";
import type { Route } from "./+types/events";

import { eq } from "drizzle-orm";
import {
  CalendarDays,
  ImageIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { randomUUID } from "node:crypto";
import { useMemo, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import db from "~/core/db/drizzle-client.server";
import { cn } from "~/core/lib/utils";
import {
  type Event,
  getAllEventsForAdmin,
} from "~/features/event/lib/queries.server";
import { events } from "~/features/event/schema";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  EventAddModal,
  type EventFormData,
} from "../components/event-add-modal";
import {
  type ListSortOrder,
  ListSortSelect,
  sortByCreatedDesc,
  toTimestamp,
} from "../components/list-sort-control";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

function parseEventBadge(
  raw: FormDataEntryValue | null,
): "hot" | "new" | "ending_soon" | "important" | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (s === "hot" || s === "new" || s === "ending_soon" || s === "important")
    return s;
  return null;
}

function toInputDate(v: Date | null | undefined): string {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function mapEventToForm(e: Event): EventFormData {
  const category: EventCategory = e.type === "notice" ? "notice" : "event";
  return {
    eventId: e.event_id,
    locale: e.locale === "en" ? "en" : "ko",
    title: e.title,
    category,
    status: e.is_active ? "active" : "ended",
    startDate: toInputDate(e.started_at ?? undefined),
    endDate: toInputDate(e.ended_at ?? undefined),
    description: e.summary ?? "",
    content: e.content,
    image: e.thumbnail_url ?? "",
    location: e.location ?? "",
    contact: e.contact ?? "",
    badge: e.badge ?? "",
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.EVENTS,
  );
  const dbEvents = await getAllEventsForAdmin().catch(() => []);
  return { adminUser, dbEvents };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.EVENTS, "events");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const typeRaw = fd.get("type") as string;
    const locale =
      ((fd.get("locale") as string) || "ko").toLowerCase() === "en"
        ? "en"
        : "ko";
    await db.insert(events).values({
      translation_group_id: randomUUID(),
      locale,
      type: typeRaw === "notice" ? "notice" : "event",
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      summary: (fd.get("description") as string) || null,
      thumbnail_url: (fd.get("image") as string) || null,
      badge: parseEventBadge(fd.get("badge")),
      location: (fd.get("location") as string)?.trim() || null,
      contact: (fd.get("contact") as string)?.trim() || null,
      is_active: fd.get("isActive") === "true",
      started_at: fd.get("startDate")
        ? new Date(fd.get("startDate") as string)
        : null,
      ended_at: fd.get("endDate")
        ? new Date(fd.get("endDate") as string)
        : null,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false };
    const typeRaw = fd.get("type") as string;
    await db
      .update(events)
      .set({
        type: typeRaw === "notice" ? "notice" : "event",
        title: fd.get("title") as string,
        content: fd.get("content") as string,
        summary: (fd.get("description") as string) || null,
        thumbnail_url: (fd.get("image") as string) || null,
        badge: parseEventBadge(fd.get("badge")),
        location: (fd.get("location") as string)?.trim() || null,
        contact: (fd.get("contact") as string)?.trim() || null,
        is_active: fd.get("isActive") === "true",
        started_at: fd.get("startDate")
          ? new Date(fd.get("startDate") as string)
          : null,
        ended_at: fd.get("endDate")
          ? new Date(fd.get("endDate") as string)
          : null,
      })
      .where(eq(events.event_id, id));
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) {
      const [row] = await db
        .select()
        .from(events)
        .where(eq(events.event_id, id))
        .limit(1);
      if (row) {
        await db
          .delete(events)
          .where(eq(events.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) {
      const [row] = await db
        .select()
        .from(events)
        .where(eq(events.event_id, id))
        .limit(1);
      if (row) {
        await db
          .update(events)
          .set({ is_active: !isActive })
          .where(eq(events.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  return { success: false };
}

function formatYmd(d: Date | null | undefined): string {
  if (!d) return "";
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

function formatPeriodRow(event: Event): string {
  const s = formatYmd(event.started_at ?? undefined);
  const e = formatYmd(event.ended_at ?? undefined);
  if (s && e) return `${s} ~ ${e}`;
  if (s) return s;
  if (e) return e;
  return "";
}

function isDemoEventRow(id: number) {
  return id < 0;
}

/** DB에 행이 없을 때만 노출 (음수 ID — 수정·삭제 불가) */

export default function AdminEvents({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbEvents } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<ListSortOrder>("newest");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const fetcher = useFetcher();

  const editInitial = useMemo(
    () => (editingEvent ? mapEventToForm(editingEvent) : null),
    [editingEvent],
  );

  const closeEventModal = () => {
    setIsAddModalOpen(false);
    setEditingEvent(null);
  };

  const sourceEvents = useMemo(() => dbEvents, [dbEvents]);

  const filtered = sortByCreatedDesc(
    sourceEvents.filter((e) =>
      e.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    ),
    sortOrder,
    (e) => e.translation_group_id ?? e.event_id,
    (e) => toTimestamp(e.created_at),
    (e) => e.event_id,
  );

  const handleSubmitEvent = (eventData: EventFormData) => {
    const fd = new FormData();
    const typeVal = eventData.category === "notice" ? "notice" : "event";
    const isActive =
      eventData.status === "active" || eventData.status === "scheduled";
    if (eventData.eventId != null) {
      fd.append("intent", "update");
      fd.append("id", String(eventData.eventId));
      fd.append("type", typeVal);
    } else {
      fd.append("intent", "create");
      fd.append("type", typeVal);
      fd.append("locale", eventData.locale ?? "ko");
    }
    fd.append("isActive", isActive ? "true" : "false");
    fd.append("title", eventData.title);
    fd.append("content", eventData.content);
    fd.append("description", eventData.description);
    fd.append("image", eventData.image ?? "");
    fd.append("startDate", eventData.startDate ?? "");
    fd.append("endDate", eventData.endDate ?? "");
    fd.append("location", eventData.location ?? "");
    fd.append("contact", eventData.contact ?? "");
    fd.append("badge", eventData.badge ?? "");
    fetcher.submit(fd, { method: "POST" });
  };

  const handleDelete = (id: number) => {
    if (isDemoEventRow(id)) {
      window.alert(
        "예시 더미 데이터는 삭제할 수 없습니다. 실제 데이터를 등록하면 더미 목록은 표시되지 않습니다.",
      );
      return;
    }
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "POST" });
  };

  const handleStartEdit = (event: Event) => {
    if (isDemoEventRow(event.event_id)) {
      window.alert(
        "예시 더미 데이터는 수정할 수 없습니다. 실제 데이터를 등록하면 더미 목록은 표시되지 않습니다.",
      );
      return;
    }
    setIsAddModalOpen(false);
    setEditingEvent(event);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar adminUser={adminUser} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                이벤트/공지 관리
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
                이벤트와 공지사항을 추가, 수정, 삭제할 수 있습니다
              </p>
              {dbEvents.length === 0 ? (
                <p className="mt-2 text-xs text-amber-800/90">
                  등록된 데이터가 없을 때는 예시 더미 목록이 표시됩니다. 항목을
                  추가하면 실제 데이터만 보입니다.
                </p>
              ) : null}
            </div>
            <Button
              className="shrink-0 gap-2 bg-[#02633E] text-white hover:bg-[#014d30]"
              onClick={() => {
                setEditingEvent(null);
                setIsAddModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              이벤트/공지 추가
            </Button>
          </div>

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="제목으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-[#02633E]/25 pl-9"
              />
            </div>
            <ListSortSelect value={sortOrder} onChange={setSortOrder} />
          </div>

          <div className="flex flex-col gap-4">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-sm text-gray-500 shadow-sm">
                {searchQuery.trim()
                  ? "검색 결과가 없습니다."
                  : "표시할 이벤트·공지가 없습니다."}
              </div>
            ) : (
              filtered.map((event) => {
                const period = formatPeriodRow(event);
                const isNotice = event.type === "notice";
                return (
                  <div
                    key={event.event_id}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:items-center md:gap-5 md:p-5"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4 md:items-center">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 md:h-24 md:w-24">
                        {event.thumbnail_url ? (
                          <img
                            src={event.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <ImageIcon className="h-8 w-8" aria-hidden />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                              isNotice
                                ? "bg-gray-200 text-gray-900"
                                : "bg-gray-900 text-white",
                            )}
                          >
                            {isNotice ? "공지사항" : "이벤트"}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold text-white",
                              event.is_active ? "bg-[#02633E]" : "bg-gray-400",
                            )}
                          >
                            {event.is_active ? "진행중" : "종료"}
                          </span>
                        </div>
                        {event.summary ? (
                          <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                            {event.summary}
                          </p>
                        ) : null}
                        {period ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span>{period}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-end gap-1.5 self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-[#02633E]"
                        onClick={() => handleStartEdit(event)}
                        title="수정"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-200 text-gray-600 shadow-sm hover:bg-white hover:text-red-600"
                        onClick={() => handleDelete(event.event_id)}
                        title="삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      <EventAddModal
        open={isAddModalOpen || editingEvent != null}
        onOpenChange={(open) => {
          if (!open) closeEventModal();
        }}
        mode={editingEvent ? "edit" : "create"}
        defaultType="event"
        initial={editInitial}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
}
