/**
 * Admin Recipe Categories Management
 * 레시피 카테고리를 추가/수정/삭제/순서변경하는 관리자 화면
 */
import type { Route } from "./+types/recipe-categories";

import { eq } from "drizzle-orm";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import db from "~/core/db/drizzle-client.server";
import { getAllRecipeCategories } from "~/features/recipe-categories/lib/queries.server";
import { recipeCategories } from "~/features/recipe-categories/schema";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.RECIPE_CATEGORIES,
  );
  const categories = await getAllRecipeCategories().catch(() => []);
  return { adminUser, categories };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.RECIPE_CATEGORIES, "recipe_categories");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const maxOrder = await db
      .select({ sort_order: recipeCategories.sort_order })
      .from(recipeCategories)
      .orderBy(recipeCategories.sort_order);
    const nextOrder =
      maxOrder.length > 0
        ? (maxOrder[maxOrder.length - 1].sort_order ?? 0) + 1
        : 0;
    await db.insert(recipeCategories).values({
      name: fd.get("name") as string,
      name_en: ((fd.get("name_en") as string) || "").trim() || null,
      slug: fd.get("slug") as string,
      sort_order: nextOrder,
      is_active: fd.get("is_active") !== "false",
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db
        .update(recipeCategories)
        .set({
          name: fd.get("name") as string,
          name_en: ((fd.get("name_en") as string) || "").trim() || null,
          slug: fd.get("slug") as string,
          is_active: fd.get("is_active") !== "false",
        })
        .where(eq(recipeCategories.category_id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id)
      await db
        .delete(recipeCategories)
        .where(eq(recipeCategories.category_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("is_active") === "true";
    if (id)
      await db
        .update(recipeCategories)
        .set({ is_active: !isActive })
        .where(eq(recipeCategories.category_id, id));
    return { success: true };
  }

  if (intent === "reorder") {
    const id = Number(fd.get("id"));
    const direction = fd.get("direction") as "up" | "down";
    const all = await db
      .select()
      .from(recipeCategories)
      .orderBy(recipeCategories.sort_order);
    const idx = all.findIndex((c) => c.category_id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx >= 0 && swapIdx >= 0 && swapIdx < all.length) {
      const a = all[idx];
      const b = all[swapIdx];
      const aOrder = a.sort_order ?? idx;
      const bOrder = b.sort_order ?? swapIdx;
      await db
        .update(recipeCategories)
        .set({ sort_order: bOrder })
        .where(eq(recipeCategories.category_id, a.category_id));
      await db
        .update(recipeCategories)
        .set({ sort_order: aOrder })
        .where(eq(recipeCategories.category_id, b.category_id));
    }
    return { success: true };
  }

  return { success: false };
}

type Category = {
  category_id: number;
  name: string;
  name_en: string | null;
  slug: string;
  sort_order: number | null;
  is_active: boolean;
};

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_가-힣]/g, "");
}

function CategoryFormModal({
  open,
  onClose,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  initialData?: Category;
}) {
  const fetcher = useFetcher();
  const isEdit = !!initialData;
  const [name, setName] = useState(initialData?.name ?? "");
  const [nameEn, setNameEn] = useState(initialData?.name_en ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  useEffect(() => {
    if (!open) return;
    setName(initialData?.name ?? "");
    setNameEn(initialData?.name_en ?? "");
    setSlug(initialData?.slug ?? "");
  }, [open, initialData]);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(toSlug(v));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "카테고리 수정" : "카테고리 추가"}
          </DialogTitle>
        </DialogHeader>
        <fetcher.Form
          method="POST"
          onSubmit={() => setTimeout(onClose, 100)}
          className="space-y-4 pt-2"
        >
          <input
            type="hidden"
            name="intent"
            value={isEdit ? "update" : "create"}
          />
          {isEdit && (
            <input type="hidden" name="id" value={initialData.category_id} />
          )}

          <div className="space-y-1.5">
            <Label>카테고리 이름 (국문) *</Label>
            <Input
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 가정용"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>카테고리 이름 (영문)</Label>
            <Input
              name="name_en"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="예: Home Cooking"
            />
            <p className="text-xs text-gray-400">
              영문 사이트에서 표시됩니다. 비워두면 국문 이름이 그대로
              표시됩니다.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>슬러그 (영문/숫자/언더스코어) *</Label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="예: easy"
              required
            />
            <p className="text-xs text-gray-400">
              레시피 카테고리 필터에 사용되는 고유 식별자입니다.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
              disabled={fetcher.state === "submitting"}
            >
              {isEdit ? "저장" : "추가"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminRecipeCategoriesPage({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, categories } = loaderData;
  const fetcher = useFetcher();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  const submitFetcher = (data: Record<string, string>) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                레시피 카테고리 관리
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                레시피 페이지에 표시되는 카테고리 탭을 관리합니다.
              </p>
            </div>
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
            >
              <Plus className="h-4 w-4" />
              카테고리 추가
            </Button>
          </div>

          <div className="max-w-2xl overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b px-6 py-4">
              <p className="text-sm text-gray-600">
                총 {categories.length}개 카테고리
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <p>등록된 카테고리가 없습니다.</p>
                <p className="mt-1 text-sm">
                  카테고리를 추가하면 레시피 페이지 탭에 표시됩니다.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b bg-gray-50 text-xs font-medium tracking-wider text-gray-500 uppercase">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">순서</th>
                    <th className="px-4 py-3 text-left">카테고리명</th>
                    <th className="px-4 py-3 text-left">영문명</th>
                    <th className="px-4 py-3 text-left">슬러그</th>
                    <th className="w-20 px-4 py-3 text-left">상태</th>
                    <th className="w-28 px-4 py-3 text-left">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat, idx) => (
                    <tr key={cat.category_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-0.5">
                          <button
                            disabled={idx === 0}
                            onClick={() =>
                              submitFetcher({
                                intent: "reorder",
                                id: String(cat.category_id),
                                direction: "up",
                              })
                            }
                            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                          <button
                            disabled={idx === categories.length - 1}
                            onClick={() =>
                              submitFetcher({
                                intent: "reorder",
                                id: String(cat.category_id),
                                direction: "down",
                              })
                            }
                            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {cat.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {cat.name_en || (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gray-500">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            submitFetcher({
                              intent: "toggle",
                              id: String(cat.category_id),
                              is_active: String(cat.is_active),
                            })
                          }
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.is_active ? "bg-[#204E3A]" : "bg-gray-300"}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cat.is_active ? "translate-x-4" : "translate-x-1"}`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditTarget(cat as Category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => {
                              if (
                                !confirm(
                                  `"${cat.name}" 카테고리를 삭제하시겠습니까?`,
                                )
                              )
                                return;
                              submitFetcher({
                                intent: "delete",
                                id: String(cat.category_id),
                              });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            ⚠️ 카테고리 삭제 시, 해당 카테고리로 등록된 레시피가 미분류 상태가
            됩니다. 삭제 전 레시피의 카테고리를 먼저 변경해 주세요.
          </div>
        </div>
      </div>

      <CategoryFormModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <CategoryFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initialData={editTarget ?? undefined}
      />
    </div>
  );
}
