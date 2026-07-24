/**
 * Admin Notices Management Screen
 * 공지사항 관리 화면
 */
import type { NoticeFormData } from "../components/notice-add-modal";
import type { Route } from "./+types/notices";

import { eq, sql } from "drizzle-orm";
import { Edit, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { randomUUID } from "node:crypto";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import db from "~/core/db/drizzle-client.server";
import { getAllNotices } from "~/features/support/lib/queries.server";
import { notices } from "~/features/support/schema";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  type ListSortOrder,
  ListSortSelect,
  sortByCreatedDesc,
  toTimestamp,
} from "../components/list-sort-control";
import { NoticeAddModal } from "../components/notice-add-modal";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.NOTICES,
  );
  const dbNotices = await getAllNotices().catch(() => []);
  return { adminUser, dbNotices };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.NOTICES, "notices");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const tagsRaw = fd.get("tags") as string;
    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const localeRaw = ((fd.get("locale") as string) || "ko").toLowerCase();
    const locale = localeRaw === "en" ? "en" : "ko";
    await db.insert(notices).values({
      translation_group_id: randomUUID(),
      locale,
      category: (fd.get("category") as "공지" | "안내" | "이벤트") ?? "안내",
      title: fd.get("title") as string,
      content: (fd.get("content") as string) ?? "",
      author: (fd.get("author") as string) || "풍림푸드",
      tags: sql`${JSON.stringify(tags)}::text[]`,
      is_pinned: fd.get("is_pinned") === "true",
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    const tagsRaw = fd.get("tags") as string;
    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    if (id) {
      await db
        .update(notices)
        .set({
          category:
            (fd.get("category") as "공지" | "안내" | "이벤트") ?? "안내",
          title: fd.get("title") as string,
          content: (fd.get("content") as string) ?? "",
          author: (fd.get("author") as string) || "풍림푸드",
          tags: sql`${JSON.stringify(tags)}::text[]`,
          is_pinned: fd.get("is_pinned") === "true",
          updated_at: new Date(),
        })
        .where(eq(notices.notice_id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) {
      const [row] = await db
        .select()
        .from(notices)
        .where(eq(notices.notice_id, id))
        .limit(1);
      if (row) {
        await db
          .delete(notices)
          .where(eq(notices.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  if (intent === "toggle_pin") {
    const id = Number(fd.get("id"));
    const current = fd.get("is_pinned") === "true";
    if (id) {
      const [row] = await db
        .select()
        .from(notices)
        .where(eq(notices.notice_id, id))
        .limit(1);
      if (row) {
        await db
          .update(notices)
          .set({ is_pinned: !current })
          .where(eq(notices.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  if (intent === "toggle_active") {
    const id = Number(fd.get("id"));
    const current = fd.get("is_active") === "true";
    if (id) {
      const [row] = await db
        .select()
        .from(notices)
        .where(eq(notices.notice_id, id))
        .limit(1);
      if (row) {
        await db
          .update(notices)
          .set({ is_active: !current })
          .where(eq(notices.translation_group_id, row.translation_group_id));
      }
    }
    return { success: true };
  }

  return { success: false };
}

/* ── 카테고리 배지 색상 ── */
const CATEGORY_STYLE: Record<string, string> = {
  공지: "bg-[#003F2B] text-white",
  안내: "bg-[#EAE3C9] text-[#003F2B]",
  이벤트: "bg-[#ffd55d] text-gray-800",
};

/* ── 더미 데이터 ── */

export default function AdminNoticesScreen({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, dbNotices } = loaderData;
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<ListSortOrder>("newest");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [editingData, setEditingData] = useState<NoticeFormData | undefined>();

  const sourceNotices = dbNotices;

  const filtered = sortByCreatedDesc(
    sourceNotices.filter((n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
    sortOrder,
    (n) => n.translation_group_id ?? n.notice_id,
    (n) => toTimestamp(n.created_at),
    (n) => n.notice_id,
    // 고정(상단 고정) 공지는 정렬과 무관하게 항상 위로 노출
  ).sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned));

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleOpenEdit = (id: number) => {
    const n = sourceNotices.find((x) => x.notice_id === id);
    if (!n) return;
    setEditingData({
      locale: (n as { locale?: string }).locale === "en" ? "en" : "ko",
      category: n.category as "공지" | "안내" | "이벤트",
      title: n.title,
      content: n.content,
      author: n.author,
      tags: (n.tags ?? []).join(", "),
      is_pinned: n.is_pinned,
    });
    setEditingId(id);
  };

  const handleAddNotice = (data: NoticeFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("locale", data.locale);
    fd.append("category", data.category);
    fd.append("title", data.title);
    fd.append("content", data.content);
    fd.append("author", data.author);
    fd.append("tags", data.tags);
    fd.append("is_pinned", String(data.is_pinned));
    fetcher.submit(fd, { method: "post" });
    setAddOpen(false);
  };

  const handleEditNotice = (data: NoticeFormData) => {
    const fd = new FormData();
    fd.append("intent", "update");
    fd.append("id", String(editingId));
    fd.append("category", data.category);
    fd.append("title", data.title);
    fd.append("content", data.content);
    fd.append("author", data.author);
    fd.append("tags", data.tags);
    fd.append("is_pinned", String(data.is_pinned));
    fetcher.submit(fd, { method: "post" });
    setEditingId(undefined);
  };

  const handleDelete = (id: number) => {
    if (!confirm("공지사항을 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "post" });
  };

  const handleTogglePin = (id: number, current: boolean) => {
    const fd = new FormData();
    fd.append("intent", "toggle_pin");
    fd.append("id", String(id));
    fd.append("is_pinned", String(current));
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* 헤더 */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                공지사항 관리
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                전체 {filtered.length}건
              </p>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="flex shrink-0 items-center gap-2 bg-[#204E3A] text-white hover:bg-[#204E3A]/90"
            >
              <Plus className="h-4 w-4" />새 공지사항 작성
            </Button>
          </div>

          {/* 검색 */}
          <div className="mb-4 flex w-full max-w-xl items-center gap-2 lg:max-w-2xl">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="공지사항 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <ListSortSelect value={sortOrder} onChange={setSortOrder} />
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="px-5 py-3 text-left">구분</th>
                  <th className="px-5 py-3 text-left">제목</th>
                  <th className="px-5 py-3 text-left">태그</th>
                  <th className="px-5 py-3 text-center">고정</th>
                  <th className="px-5 py-3 text-center">조회</th>
                  <th className="px-5 py-3 text-center">등록일</th>
                  <th className="px-5 py-3 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      등록된 공지사항이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((notice, idx) => (
                    <tr
                      key={notice.notice_id}
                      className="border-b border-gray-50 text-sm transition-colors hover:bg-gray-50"
                      style={
                        idx === filtered.length - 1
                          ? { borderBottom: "none" }
                          : {}
                      }
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CATEGORY_STYLE[notice.category] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {notice.category}
                        </span>
                      </td>
                      <td className="max-w-2xl min-w-0 px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {notice.is_pinned && (
                            <Pin className="h-3.5 w-3.5 shrink-0 text-red-500" />
                          )}
                          <span className="truncate font-medium text-gray-800">
                            {notice.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(notice.tags ?? []).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="rounded-full border-gray-300 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() =>
                            handleTogglePin(notice.notice_id, notice.is_pinned)
                          }
                          className="text-gray-400 transition-colors hover:text-red-500"
                          title={notice.is_pinned ? "고정 해제" : "상단 고정"}
                        >
                          {notice.is_pinned ? (
                            <Pin className="h-4 w-4 text-red-500" />
                          ) : (
                            <PinOff className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">
                        {notice.view_count}
                      </td>
                      <td className="px-5 py-3 text-center text-gray-400">
                        {formatDate(notice.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(notice.notice_id)}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notice.notice_id)}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* 추가 모달 */}
      <NoticeAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAddNotice}
      />

      {/* 수정 모달 */}
      {editingId !== undefined && (
        <NoticeAddModal
          open={editingId !== undefined}
          onOpenChange={(o) => {
            if (!o) setEditingId(undefined);
          }}
          onSubmit={handleEditNotice}
          editId={editingId}
          initialData={editingData}
        />
      )}
    </div>
  );
}
