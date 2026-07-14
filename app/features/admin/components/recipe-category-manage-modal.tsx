/**
 * 레시피 카테고리 관리 모달 (recipes.category = slug)
 * — 보도자료/자료실 카테고리 모달과 동일한 한 줄 입력 + 목록 레이아웃
 * 신규 추가 시 슬러그는 서버에서 이름으로 자동 생성됩니다.
 */
import { useEffect, useState } from "react";
import type { RecipeCategory } from "~/features/recipe-categories/schema";
import { newsCategoryBadgeClass, NEWS_CATEGORY_COLOR_OPTIONS } from "~/features/media/lib/news-category-badges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "~/core/lib/utils";

const PROTECTED_SLUG = "easy";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: RecipeCategory[];
  onSubmitCategory: (intent: string, fields: Record<string, string>) => void;
  /** true면 `recipe_categories`가 비어 예시 행만 보이는 상태(수정·삭제 불가, 추가는 DB 반영) */
  demoMode?: boolean;
};

export function RecipeCategoryManageModal({
  open,
  onOpenChange,
  categories,
  onSubmitCategory,
  demoMode = false,
}: Props) {
  const [newName, setNewName] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newColor, setNewColor] = useState("sky");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editColor, setEditColor] = useState("sky");

  useEffect(() => {
    if (!open) {
      setNewName("");
      setNewNameEn("");
      setNewColor("sky");
      setEditingId(null);
      setEditName("");
      setEditNameEn("");
      setEditSlug("");
      setEditColor("sky");
    }
  }, [open]);

  const startEdit = (c: RecipeCategory) => {
    setEditingId(c.category_id);
    setEditName(c.name);
    setEditNameEn(c.name_en ?? "");
    setEditSlug(c.slug);
    setEditColor(c.color || "sky");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditNameEn("");
    setEditSlug("");
    setEditColor("sky");
  };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onSubmitCategory("category_create", { name, name_en: newNameEn.trim(), color: newColor });
    setNewName("");
    setNewNameEn("");
    setNewColor("sky");
  };

  const handleSaveEdit = () => {
    if (editingId == null) return;
    const name = editName.trim();
    const slug = editSlug.trim();
    if (!name || !slug) return;
    onSubmitCategory("category_update", {
      id: String(editingId),
      name,
      name_en: editNameEn.trim(),
      slug,
      color: editColor,
    });
    cancelEdit();
  };

  const handleDelete = (c: RecipeCategory) => {
    if (c.slug === PROTECTED_SLUG) return;
    if (!confirm(`「${c.name}」 카테고리를 삭제할까요?\n(이 카테고리를 쓰는 레시피가 있으면 삭제되지 않습니다.)`)) return;
    onSubmitCategory("category_delete", { id: String(c.category_id) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Tag className="h-5 w-5 text-[#02633E]" />
            카테고리 관리
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {demoMode ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-900">
              아래 항목은 DB에 없는 예시입니다. 수정·삭제는 할 수 없고, 상단에서 새로 추가하면 실제로 저장됩니다.
            </p>
          ) : null}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="새 카테고리 이름 (국문)"
                className="border-gray-200"
              />
              <select
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                className="h-10 w-[100px] shrink-0 rounded-md border border-gray-200 bg-white px-2 text-sm"
                aria-label="새 카테고리 색"
              >
                {NEWS_CATEGORY_COLOR_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                className="shrink-0 bg-[#02633E] hover:bg-[#014d30]"
                onClick={handleAdd}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Input
              value={newNameEn}
              onChange={(e) => setNewNameEn(e.target.value)}
              placeholder="영문명 (선택) — 비우면 국문명 표시"
              className="border-gray-200"
            />
          </div>

          <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {categories.map((c) => {
              const isDemoRow = c.category_id < 0;
              return (
              <li
                key={c.category_id}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5"
              >
                {editingId === c.category_id ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    {c.slug === PROTECTED_SLUG ? (
                      <span
                        className={cn(
                          "inline-flex w-fit rounded-md border px-2 py-0.5 text-xs font-semibold",
                          newsCategoryBadgeClass(editColor),
                        )}
                      >
                        {c.name}
                      </span>
                    ) : (
                      <>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-9 min-w-0 flex-1 border-gray-200 text-sm"
                          placeholder="표시 이름"
                        />
                        <Input
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="h-9 w-full border-gray-200 text-sm sm:w-[120px] sm:shrink-0"
                          placeholder="슬러그"
                          title="레시피 연결용 ID"
                        />
                      </>
                    )}
                    <Input
                      value={editNameEn}
                      onChange={(e) => setEditNameEn(e.target.value)}
                      className="h-9 w-full border-gray-200 text-sm sm:w-[120px] sm:shrink-0"
                      placeholder="영문명"
                      title="영문 사이트 표시명 (선택)"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm sm:w-[100px] sm:shrink-0"
                    >
                      {NEWS_CATEGORY_COLOR_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <Button type="button" size="sm" className="bg-[#02633E] hover:bg-[#014d30]" onClick={handleSaveEdit}>
                        저장
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={cancelEdit}>
                        취소
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate rounded-md border px-2.5 py-1 text-xs font-semibold",
                        newsCategoryBadgeClass(c.color || "slate"),
                      )}
                    >
                      {c.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title={isDemoRow ? "예시 데이터는 수정할 수 없습니다" : "수정"}
                      disabled={isDemoRow}
                      onClick={() => startEdit(c)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-red-600 hover:bg-red-50"
                      title="삭제"
                      disabled={isDemoRow || c.slug === PROTECTED_SLUG}
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </li>
            );
            })}
          </ul>

          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> 「가정용」 카테고리는 삭제할 수 없으며, 슬러그는 변경할 수 없습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
