/**
 * Admin Certifications Management Screen
 * 품질 & 인증 관리 화면 (수상내역 + 인증서 CRUD)
 */
import type { Route } from "./+types/certifications";

import { eq } from "drizzle-orm";
import { Edit, Eye, EyeOff, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import db from "~/core/db/drizzle-client.server";
import { getAllCertItems } from "~/features/brand/lib/queries.server";
import { brandCertItems } from "~/features/brand/schema";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  type CertFormData,
  CertificationAddModal,
} from "../components/certification-add-modal";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.CERTIFICATIONS,
  );
  const items = await getAllCertItems().catch(() => []);
  return { adminUser, items };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.CERTIFICATIONS, "certifications");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    await db.insert(brandCertItems).values({
      type: (fd.get("type") as "award" | "cert") ?? "cert",
      title: fd.get("title") as string,
      year: (fd.get("year") as string) || null,
      description: (fd.get("description") as string) || null,
      image_url: (fd.get("image_url") as string) || null,
      sort_order: Number(fd.get("sort_order") ?? 0),
      is_active: fd.get("is_active") === "true",
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db
        .update(brandCertItems)
        .set({
          type: (fd.get("type") as "award" | "cert") ?? "cert",
          title: fd.get("title") as string,
          year: (fd.get("year") as string) || null,
          description: (fd.get("description") as string) || null,
          image_url: (fd.get("image_url") as string) || null,
          sort_order: Number(fd.get("sort_order") ?? 0),
          is_active: fd.get("is_active") === "true",
          updated_at: new Date(),
        })
        .where(eq(brandCertItems.id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(brandCertItems).where(eq(brandCertItems.id, id));
    return { success: true };
  }

  if (intent === "toggle_active") {
    const id = Number(fd.get("id"));
    const current = fd.get("is_active") === "true";
    if (id) {
      await db
        .update(brandCertItems)
        .set({ is_active: !current, updated_at: new Date() })
        .where(eq(brandCertItems.id, id));
    }
    return { success: true };
  }

  return { success: false };
}

const TYPE_LABEL: Record<string, string> = {
  award: "수상내역",
  cert: "인증서",
};

const TYPE_STYLE: Record<string, string> = {
  award: "bg-[#003F2B] text-white",
  cert: "bg-[#EAE3C9] text-[#003F2B]",
};

export default function AdminCertificationsScreen({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, items } = loaderData;
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "award" | "cert">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>();
  const [editingData, setEditingData] = useState<CertFormData | undefined>();
  const [imagePreview, setImagePreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const filtered = items.filter((item) => {
    const matchesType = filterType === "all" || item.type === filterType;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleOpenEdit = (id: number) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    setEditingData({
      type: item.type as "award" | "cert",
      title: item.title,
      year: item.year ?? "",
      description: item.description ?? "",
      image_url: item.image_url ?? "",
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setEditingId(id);
  };

  const submitItem = (
    data: CertFormData,
    intent: "create" | "update",
    id?: number,
  ) => {
    const fd = new FormData();
    fd.append("intent", intent);
    if (id) fd.append("id", String(id));
    fd.append("type", data.type);
    fd.append("title", data.title);
    fd.append("year", data.year);
    fd.append("description", data.description);
    fd.append("image_url", data.image_url);
    fd.append("sort_order", String(data.sort_order));
    fd.append("is_active", String(data.is_active));
    fetcher.submit(fd, { method: "post" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("해당 항목을 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "post" });
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    const fd = new FormData();
    fd.append("intent", "toggle_active");
    fd.append("id", String(id));
    fd.append("is_active", String(isActive));
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
                품질 & 인증 관리
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                전체 {filtered.length}건
              </p>
            </div>
            <Button
              onClick={() => setAddOpen(true)}
              className="flex shrink-0 items-center gap-2 bg-[#204E3A] text-white hover:bg-[#204E3A]/90"
            >
              <Plus className="h-4 w-4" />새 항목 등록
            </Button>
          </div>

          {/* 필터 + 검색 */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {/* 타입 필터 */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "award", "cert"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors"
                  style={
                    filterType === t
                      ? { backgroundColor: "#003F2B", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#555" }
                  }
                >
                  {t === "all" ? "전체" : t === "award" ? "수상내역" : "인증서"}
                </button>
              ))}
            </div>

            {/* 검색 */}
            <div className="relative w-full min-w-0 sm:max-w-xl sm:flex-1 lg:max-w-2xl">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="제목 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* 테이블 */}
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600">
                  <th className="px-5 py-3 text-left">종류</th>
                  <th className="px-5 py-3 text-left">제목</th>
                  <th className="px-5 py-3 text-center">이미지</th>
                  <th className="px-5 py-3 text-center">순서</th>
                  <th className="px-5 py-3 text-center">공개</th>
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
                      등록된 항목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 text-sm transition-colors hover:bg-gray-50"
                      style={
                        idx === filtered.length - 1
                          ? { borderBottom: "none" }
                          : {}
                      }
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TYPE_STYLE[item.type] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {TYPE_LABEL[item.type] ?? item.type}
                        </span>
                      </td>
                      <td className="max-w-2xl min-w-0 px-5 py-3">
                        <div className="truncate font-medium text-gray-800">
                          {item.title}
                        </div>
                        {item.year && (
                          <div className="text-xs text-gray-400">
                            {item.year}년
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {item.image_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              setImagePreview({
                                url: item.image_url!,
                                title: item.title,
                              })
                            }
                            className="inline-block overflow-hidden rounded-lg border border-gray-200 transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003F2B]/40"
                            aria-label={`${item.title} 이미지 크게 보기`}
                          >
                            <img
                              src={item.image_url}
                              alt=""
                              className="h-10 w-10 object-cover"
                            />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">없음</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center text-gray-500">
                        {item.sort_order}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(item.id, item.is_active)
                          }
                          className={`h-7 w-7 p-0 ${item.is_active ? "text-[#003F2B]" : "text-gray-300"}`}
                        >
                          {item.is_active ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                      <td className="px-5 py-3 text-center text-gray-400">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item.id)}
                            className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
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
      <CertificationAddModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => {
          submitItem(data, "create");
          setAddOpen(false);
        }}
      />

      {/* 수정 모달 */}
      {editingId !== undefined && (
        <CertificationAddModal
          open={editingId !== undefined}
          onOpenChange={(o) => {
            if (!o) setEditingId(undefined);
          }}
          onSubmit={(data) => {
            submitItem(data, "update", editingId);
            setEditingId(undefined);
          }}
          editId={editingId}
          initialData={editingData}
        />
      )}

      <Dialog
        open={imagePreview !== null}
        onOpenChange={(o) => !o && setImagePreview(null)}
      >
        <DialogContent className="max-h-[min(92vh,900px)] max-w-[min(1200px,calc(100vw-2rem))] gap-3 overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-semibold text-gray-900">
              {imagePreview?.title}
            </DialogTitle>
          </DialogHeader>
          {imagePreview?.url ? (
            <div className="flex justify-center rounded-lg bg-gray-50 p-2">
              <img
                src={imagePreview.url}
                alt={imagePreview.title}
                className="max-h-[min(78vh,800px)] w-full object-contain"
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
