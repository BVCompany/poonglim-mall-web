/**
 * 자료실 카테고리 관리 모달
 */
import { useEffect, useState } from "react";
import type { ArchiveCategory } from "~/features/support/schema";
import { newsCategoryBadgeClass, NEWS_CATEGORY_COLOR_OPTIONS } from "~/features/media/lib/news-category-badges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Switch } from "~/core/components/ui/switch";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "~/core/lib/utils";

const PROTECTED_NAME = "기타";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ArchiveCategory[];
  onSubmitCategory: (intent: string, fields: Record<string, string>) => void;
};

export function ArchiveCategoryManageModal({
  open,
  onOpenChange,
  categories,
  onSubmitCategory,
}: Props) {
  const [newName, setNewName] = useState("");
  const [newNameEn, setNewNameEn] = useState("");
  const [newColor, setNewColor] = useState("sky");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editColor, setEditColor] = useState("sky");

  useEffect(() => {
    if (!open) {
      setNewName("");
      setNewNameEn("");
      setNewColor("sky");
      setEditingId(null);
      setEditName("");
      setEditNameEn("");
      setEditColor("sky");
    }
  }, [open]);

  const startEdit = (c: ArchiveCategory) => {
    setEditingId(c.category_id);
    setEditName(c.name);
    setEditNameEn(c.name_en ?? "");
    setEditColor(c.color || "sky");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditNameEn("");
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
    if (!name) return;
    onSubmitCategory("category_update", {
      id: String(editingId),
      name,
      name_en: editNameEn.trim(),
      color: editColor,
    });
    cancelEdit();
  };

  const handleDelete = (c: ArchiveCategory) => {
    if (c.name === PROTECTED_NAME) return;
    if (!confirm(`「${c.name}」 카테고리를 삭제할까요?\n(이 카테고리를 쓰는 자료가 있으면 삭제되지 않습니다.)`)) return;
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
            {categories.map((c) => (
              <li
                key={c.category_id}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5"
              >
                {editingId === c.category_id ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    {c.name === PROTECTED_NAME ? (
                      <span
                        className={cn(
                          "inline-flex w-fit rounded-md border px-2 py-0.5 text-xs font-semibold",
                          newsCategoryBadgeClass(editColor),
                        )}
                      >
                        {PROTECTED_NAME}
                      </span>
                    ) : (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-9 border-gray-200 text-sm"
                        placeholder="국문명"
                      />
                    )}
                    <Input
                      value={editNameEn}
                      onChange={(e) => setEditNameEn(e.target.value)}
                      className="h-9 border-gray-200 text-sm sm:w-[120px] sm:shrink-0"
                      placeholder="영문명"
                      title="영문 사이트 표시명 (선택)"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm"
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
                    <div className="flex shrink-0 flex-col items-center gap-0.5 px-0.5">
                      <span className="text-[10px] font-medium text-gray-500">사이트</span>
                      <Switch
                        checked={c.is_visible_on_site !== false}
                        onCheckedChange={(v) =>
                          onSubmitCategory("category_set_visibility", {
                            id: String(c.category_id),
                            is_visible_on_site: v ? "true" : "false",
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      title="수정"
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
                      disabled={c.name === PROTECTED_NAME}
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> 「{PROTECTED_NAME}」 카테고리는 삭제할 수 없으며, 이름은 변경할 수
            없습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
