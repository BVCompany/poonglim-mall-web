/**
 * Admin Product Categories Management
 * 제품 카테고리를 추가/수정/삭제/순서변경하는 관리자 화면
 */
import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/product-categories";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { getAllCategories } from "~/features/product-categories/lib/queries.server";
import { productCategories } from "~/features/product-categories/schema";
import db from "~/core/db/drizzle-client.server";
import { eq } from "drizzle-orm";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const categories = await getAllCategories().catch(() => []);
  return { adminUser, categories };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const maxOrder = await db.select({ sort_order: productCategories.sort_order })
      .from(productCategories)
      .orderBy(productCategories.sort_order);
    const nextOrder = maxOrder.length > 0
      ? (maxOrder[maxOrder.length - 1].sort_order ?? 0) + 1
      : 0;
    await db.insert(productCategories).values({
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      sort_order: nextOrder,
      is_active: fd.get("is_active") !== "false",
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (id) {
      await db.update(productCategories).set({
        name: fd.get("name") as string,
        slug: fd.get("slug") as string,
        is_active: fd.get("is_active") !== "false",
      }).where(eq(productCategories.category_id, id));
    }
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(productCategories).where(eq(productCategories.category_id, id));
    return { success: true };
  }

  if (intent === "toggle") {
    const id = Number(fd.get("id"));
    const isActive = fd.get("is_active") === "true";
    if (id) await db.update(productCategories).set({ is_active: !isActive })
      .where(eq(productCategories.category_id, id));
    return { success: true };
  }

  if (intent === "reorder") {
    const id = Number(fd.get("id"));
    const direction = fd.get("direction") as "up" | "down";
    const all = await db.select().from(productCategories).orderBy(productCategories.sort_order);
    const idx = all.findIndex((c) => c.category_id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx >= 0 && swapIdx >= 0 && swapIdx < all.length) {
      const a = all[idx];
      const b = all[swapIdx];
      const aOrder = a.sort_order ?? idx;
      const bOrder = b.sort_order ?? swapIdx;
      await db.update(productCategories).set({ sort_order: bOrder }).where(eq(productCategories.category_id, a.category_id));
      await db.update(productCategories).set({ sort_order: aOrder }).where(eq(productCategories.category_id, b.category_id));
    }
    return { success: true };
  }

  return { success: false };
}

type Category = {
  category_id: number;
  name: string;
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
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit) setSlug(toSlug(v));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
        </DialogHeader>
        <fetcher.Form
          method="POST"
          onSubmit={() => setTimeout(onClose, 100)}
          className="space-y-4 pt-2"
        >
          <input type="hidden" name="intent" value={isEdit ? "update" : "create"} />
          {isEdit && <input type="hidden" name="id" value={initialData.category_id} />}

          <div className="space-y-1.5">
            <Label>카테고리 이름 *</Label>
            <Input
              name="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="예: 액란가공품"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>슬러그 (영문/숫자/언더스코어) *</Label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="예: liquid_egg"
              required
            />
            <p className="text-xs text-gray-400">제품 카테고리 필터에 사용되는 고유 식별자입니다.</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
              disabled={fetcher.state === "submitting"}
            >
              {isEdit ? "저장" : "추가"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProductCategoriesPage({ loaderData }: Route.ComponentProps) {
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
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminNavbar />
        <div className="flex-1 overflow-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">제품 카테고리 관리</h1>
              <p className="mt-1 text-sm text-gray-500">
                제품 소개 페이지에 표시되는 카테고리 탭을 관리합니다.
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

          <div className="bg-white rounded-lg shadow overflow-hidden max-w-2xl">
            <div className="px-6 py-4 border-b">
              <p className="text-sm text-gray-600">총 {categories.length}개 카테고리</p>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>등록된 카테고리가 없습니다.</p>
                <p className="text-sm mt-1">카테고리를 추가하면 제품 소개 페이지 탭에 표시됩니다.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">순서</th>
                    <th className="px-4 py-3 text-left">카테고리명</th>
                    <th className="px-4 py-3 text-left">슬러그</th>
                    <th className="px-4 py-3 text-left w-20">상태</th>
                    <th className="px-4 py-3 text-left w-28">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat, idx) => (
                    <tr key={cat.category_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5 items-center">
                          <button
                            disabled={idx === 0}
                            onClick={() => submitFetcher({ intent: "reorder", id: String(cat.category_id), direction: "up" })}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <GripVertical className="h-3.5 w-3.5 text-gray-300" />
                          <button
                            disabled={idx === categories.length - 1}
                            onClick={() => submitFetcher({ intent: "reorder", id: String(cat.category_id), direction: "down" })}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => submitFetcher({ intent: "toggle", id: String(cat.category_id), is_active: String(cat.is_active) })}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${cat.is_active ? "bg-[#204E3A]" : "bg-gray-300"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${cat.is_active ? "translate-x-4" : "translate-x-1"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7"
                            onClick={() => setEditTarget(cat as Category)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-600"
                            onClick={() => {
                              if (!confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?\n해당 카테고리의 제품이 있다면 카테고리 미분류 상태가 됩니다.`)) return;
                              submitFetcher({ intent: "delete", id: String(cat.category_id) });
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

          {/* 안내 메시지 */}
          <div className="mt-4 max-w-2xl rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            ⚠️ 카테고리 삭제 시, 해당 카테고리로 등록된 제품의 카테고리가 미분류 상태가 됩니다. 삭제 전 제품의 카테고리를 먼저 변경해 주세요.
          </div>
        </div>
      </div>

      <CategoryFormModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />
      <CategoryFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initialData={editTarget ?? undefined}
      />
    </div>
  );
}
