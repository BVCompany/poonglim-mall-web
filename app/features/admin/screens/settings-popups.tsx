/**
 * Admin Popup Management Page
 *
 * Allows admins to manage modal popups (view, create, edit, delete).
 */

import { useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/settings-popups";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  PopupAddModal,
  type PopupFormData,
} from "../components/popup-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Edit, Trash2, Plus, Search, Eye } from "lucide-react";
import {
  getAllPopups,
  type Popup as PopupRow,
} from "~/features/home/lib/queries.server";
import db from "~/core/db/drizzle-client.server";
import { sql } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const dbPopups = await getAllPopups().catch(() => []);
  return { adminUser, dbPopups };
}

function parseSortOrder(raw: FormDataEntryValue | null): number {
  if (raw == null || raw === "") return 0;
  const s = String(raw).trim();
  if (s === "undefined" || s === "NaN") return 0;
  const n = Number(s);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const title = String(fd.get("title") ?? "");
    const contentRaw = fd.get("content");
    const content =
      contentRaw == null || String(contentRaw).trim() === ""
        ? null
        : String(contentRaw);
    const imageUrl = String(fd.get("imageUrl") ?? "").trim() || null;
    const linkUrl = String(fd.get("linkUrl") ?? "").trim() || null;
    const isActive = fd.get("isActive") !== "false";
    const sortOrder = parseSortOrder(fd.get("sortOrder"));
    const startDateStr = fd.get("startDate")
      ? String(fd.get("startDate")).slice(0, 10)
      : null;
    const endDateStr = fd.get("endDate")
      ? String(fd.get("endDate")).slice(0, 10)
      : null;

    await db.execute(sql`
      INSERT INTO popups (title, content, image_url, link_url, is_active, sort_order, started_at, ended_at)
      VALUES (${title}, ${content}, ${imageUrl}, ${linkUrl}, ${isActive}, ${sortOrder}, ${startDateStr}, ${endDateStr})
    `);
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false };
    const title = String(fd.get("title") ?? "");
    const contentRaw = fd.get("content");
    const content =
      contentRaw == null || String(contentRaw).trim() === ""
        ? null
        : String(contentRaw);
    const imageUrl = String(fd.get("imageUrl") ?? "").trim() || null;
    const linkUrl = String(fd.get("linkUrl") ?? "").trim() || null;
    const isActive = fd.get("isActive") !== "false";
    const sortOrder = parseSortOrder(fd.get("sortOrder"));
    const startDateStr = fd.get("startDate")
      ? String(fd.get("startDate")).slice(0, 10)
      : null;
    const endDateStr = fd.get("endDate")
      ? String(fd.get("endDate")).slice(0, 10)
      : null;

    await db.execute(sql`
      UPDATE popups SET
        title = ${title},
        content = ${content},
        image_url = ${imageUrl},
        link_url = ${linkUrl},
        is_active = ${isActive},
        sort_order = ${sortOrder},
        started_at = ${startDateStr},
        ended_at = ${endDateStr}
      WHERE popup_id = ${id}
    `);
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.execute(sql`DELETE FROM popups WHERE popup_id = ${id}`);
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("isActive") === "true";
    if (id) {
      await db.execute(
        sql`UPDATE popups SET is_active = ${!isActive} WHERE popup_id = ${id}`,
      );
    }
    return { success: true };
  }

  return { success: false };
}

function mapPopupRowToForm(p: PopupRow): PopupFormData {
  return {
    popupId: p.popup_id,
    title: p.title,
    content: p.content ?? "",
    sortOrder: p.sort_order ?? 0,
    startDate: p.started_at
      ? new Date(p.started_at).toISOString().slice(0, 10)
      : "",
    endDate: p.ended_at ? new Date(p.ended_at).toISOString().slice(0, 10) : "",
    imageUrl: p.image_url ?? "",
    linkUrl: p.link_url ?? "",
    isActive: p.is_active,
  };
}

interface Popup {
  id: string;
  title: string;
  content: string;
  sortOrder: number;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: string;
}


export default function AdminPopupsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbPopups } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupRow | null>(null);
  const fetcher = useFetcher();

  const editPopupInitial = useMemo(
    () => (editingPopup ? mapPopupRowToForm(editingPopup) : null),
    [editingPopup],
  );

  const popups: Popup[] = dbPopups.length > 0
    ? dbPopups.map((p) => ({
        id: String(p.popup_id),
        title: p.title,
        content: p.content ?? "",
        sortOrder: p.sort_order ?? 0,
        startDate: p.started_at ? new Date(p.started_at).toISOString().slice(0, 10) : "",
        endDate: p.ended_at ? new Date(p.ended_at).toISOString().slice(0, 10) : "",
        imageUrl: p.image_url ?? "",
        linkUrl: p.link_url ?? "",
        isActive: p.is_active,
        createdAt: p.created_at.toISOString().slice(0, 10),
      }))
    : [];

  const filteredPopups = popups.filter((popup) =>
    popup.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePopupSubmit = (popupData: PopupFormData) => {
    const fd = new FormData();
    if (popupData.popupId != null) {
      fd.append("intent", "update");
      fd.append("id", String(popupData.popupId));
    } else {
      fd.append("intent", "create");
    }
    fd.append("title", popupData.title);
    fd.append("content", popupData.content);
    fd.append("sortOrder", String(popupData.sortOrder ?? 0));
    fd.append("startDate", popupData.startDate);
    fd.append("endDate", popupData.endDate);
    fd.append("imageUrl", popupData.imageUrl ?? "");
    fd.append("linkUrl", popupData.linkUrl ?? "");
    fd.append("isActive", popupData.isActive ? "true" : "false");
    fetcher.submit(fd, { method: "POST" });
  };

  const handleEdit = (id: string) => {
    const row = dbPopups.find((p) => String(p.popup_id) === id);
    if (row) {
      setIsAddModalOpen(false);
      setEditingPopup(row);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminNavbar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  팝업 관리
                </h1>
                <p className="text-gray-600">
                  사이트 모달 팝업을 관리합니다
                </p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => {
                  setEditingPopup(null);
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                팝업 추가
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="팝업 제목 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Popup List Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        기간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPopups.map((popup) => (
                      <tr key={popup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {popup.sortOrder}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {popup.title}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {popup.startDate} ~ {popup.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              popup.isActive
                                ? "bg-[#204E3A] text-white hover:bg-[#1a3f2e]"
                                : "bg-gray-500 text-white hover:bg-gray-600"
                            }
                          >
                            {popup.isActive ? "활성" : "비활성"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(popup.id)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(popup.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {filteredPopups.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {searchQuery ? "검색 결과가 없습니다" : "등록된 팝업이 없습니다"}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "다른 검색어로 시도해보세요"
                      : "새 팝업을 추가하여 사용자에게 알림을 보내세요"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Popup Modal */}
      <PopupAddModal
        open={isAddModalOpen || editingPopup != null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingPopup(null);
          }
        }}
        mode={editingPopup ? "edit" : "create"}
        initial={editPopupInitial}
        onSubmit={handlePopupSubmit}
      />
    </div>
  );
}
