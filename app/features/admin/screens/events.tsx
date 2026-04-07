/**
 * Admin Events Management Screen
 *
 * 이벤트와 공지를 탭으로 분리하여 각각 관리합니다.
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/events";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { EventAddModal, type EventFormData } from "../components/event-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Card } from "~/core/components/ui/card";
import { Plus, Search, Edit, Trash2, CalendarRange, Megaphone } from "lucide-react";
import { getEvents } from "~/features/event/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { events } from "~/features/event/schema";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbEvents = await getEvents().catch(() => []);
  return { adminUser, dbEvents };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const typeRaw = fd.get("type") as string;
    await db.insert(events).values({
      type: typeRaw === "notice" ? "notice" : "event",
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      summary: (fd.get("description") as string) || null,
      thumbnail_url: (fd.get("image") as string) || null,
      is_active: true,
      started_at: fd.get("startDate") ? new Date(fd.get("startDate") as string) : null,
      ended_at: fd.get("endDate") ? new Date(fd.get("endDate") as string) : null,
    });
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(events).where(eq(events.event_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) await db.update(events).set({ is_active: !isActive }).where(eq(events.event_id, id));
    return { success: true };
  }

  return { success: false };
}

function formatDate(val: string | null | undefined): string {
  if (!val) return "-";
  const d = new Date(val);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

type Tab = "event" | "notice";

const TAB_CONFIG: Record<Tab, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  event:  { label: "이벤트",  icon: CalendarRange },
  notice: { label: "공지",    icon: Megaphone },
};

export default function AdminEvents({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbEvents } = loaderData;
  const [activeTab, setActiveTab] = useState<Tab>("event");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fetcher = useFetcher();

  // 탭에 따라 필터링
  const tabFiltered = dbEvents.filter((e) => e.type === activeTab);
  const filtered = tabFiltered.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddEvent = (eventData: EventFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("type", activeTab);
    fd.append("title", eventData.title);
    fd.append("content", eventData.content);
    fd.append("description", eventData.description);
    if (eventData.image) fd.append("image", eventData.image);
    if (eventData.startDate) fd.append("startDate", eventData.startDate);
    if (eventData.endDate) fd.append("endDate", eventData.endDate);
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "POST" });
  };

  const tabLabel = TAB_CONFIG[activeTab].label;

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* 헤더 */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="mb-1 text-3xl font-bold text-gray-900">이벤트/공지 관리</h1>
                <p className="text-gray-600">이벤트와 공지사항을 탭으로 구분하여 관리합니다.</p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {tabLabel} 추가
              </Button>
            </div>

            {/* ── 탭 ── */}
            <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
              {(Object.entries(TAB_CONFIG) as [Tab, typeof TAB_CONFIG[Tab]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isActive = key === activeTab;
                return (
                  <button
                    key={key}
                    onClick={() => { setActiveTab(key); setSearchQuery(""); }}
                    className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: "#02633E", color: "#fff" }
                        : { backgroundColor: "transparent", color: "#666" }
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {cfg.label}
                    <span
                      className="rounded-full px-1.5 py-0.5 text-xs font-semibold"
                      style={
                        isActive
                          ? { backgroundColor: "rgba(255,255,255,0.25)", color: "#fff" }
                          : { backgroundColor: "#EAE3C9", color: "#003F2B" }
                      }
                    >
                      {tabFiltered.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 검색 */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={`${tabLabel} 제목으로 검색...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">
                    {searchQuery ? "검색 결과가 없습니다." : `등록된 ${tabLabel}이 없습니다.`}
                  </p>
                </Card>
              ) : (
                filtered.map((event) => (
                  <Card key={event.event_id} className="p-5 transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-5">
                      {/* 썸네일 */}
                      {event.thumbnail_url && (
                        <div className="shrink-0">
                          <img
                            src={event.thumbnail_url}
                            alt={event.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        </div>
                      )}

                      {/* 정보 */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="truncate text-base font-semibold text-gray-900">
                            {event.title}
                          </h3>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={
                              event.is_active
                                ? { backgroundColor: "#dcfce7", color: "#166534" }
                                : { backgroundColor: "#f1f5f9", color: "#64748b" }
                            }
                          >
                            {event.is_active ? "활성" : "비활성"}
                          </span>
                        </div>
                        {event.summary && (
                          <p className="mb-1.5 line-clamp-1 text-sm text-gray-500">{event.summary}</p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          {(event.started_at || event.ended_at) && (
                            <span>
                              기간: {formatDate(event.started_at?.toISOString())}
                              {event.ended_at && ` ~ ${formatDate(event.ended_at?.toISOString())}`}
                            </span>
                          )}
                          <span>등록일: {formatDate(event.created_at.toISOString())}</span>
                        </div>
                      </div>

                      {/* 액션 */}
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-gray-900"
                          onClick={() => console.log("Edit", event.event_id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(event.event_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {filtered.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-400">
                총 {filtered.length}개의 {tabLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      <EventAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddEvent}
      />
    </div>
  );
}
