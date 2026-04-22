/**
 * Recipe Add/Edit Modal — 시안: 쉼표 재료 · 줄바꿈 조리법 · 이미지 URL
 */
import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

export interface IngredientRow {
  name: string;
  amount: string;
}
export interface StepRow {
  description: string;
}

export interface RecipeFormData {
  locale?: "ko" | "en";
  name: string;
  category: string;
  difficulty: string;
  prepTime: string;
  servings: string;
  description: string;
  ingredientsText: string;
  stepsText: string;
  tags: string;
  image?: string;
}

export function ingredientsRowsToText(rows: IngredientRow[]): string {
  return rows
    .filter((r) => r.name.trim())
    .map((r) => (r.amount.trim() ? `${r.name.trim()} ${r.amount.trim()}` : r.name.trim()))
    .join(", ");
}

export function stepRowsToText(rows: StepRow[]): string {
  return rows
    .filter((r) => r.description.trim())
    .map((r) => r.description.trim())
    .join("\n");
}

export function textToIngredientRows(text: string): IngredientRow[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, amount: "" }));
}

export function textToStepRows(text: string): StepRow[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((description) => ({ description }));
}

interface RecipeAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (recipe: RecipeFormData) => void;
  editId?: number;
  initialData?: RecipeFormData;
  dbCategories?: { slug: string; name: string }[];
}

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard", label: "어려움" },
];

const EMPTY_FORM: RecipeFormData = {
  locale: "ko",
  name: "",
  category: "easy",
  difficulty: "easy",
  prepTime: "",
  servings: "",
  description: "",
  ingredientsText: "",
  stepsText: "",
  tags: "",
  image: "",
};

export function RecipeAddModal({
  open,
  onOpenChange,
  onSubmit,
  editId,
  initialData,
  dbCategories = [],
}: RecipeAddModalProps) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<RecipeFormData>(initialData ?? EMPTY_FORM);

  const categoryOptions =
    dbCategories.length > 0
      ? dbCategories
      : [
          { slug: "easy", name: "가정용" },
          { slug: "dessert", name: "카페 & 베이커리" },
          { slug: "restaurant", name: "외식업체" },
        ];

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm(initialData);
    } else {
      const defaultCategory = categoryOptions[0]?.slug ?? "easy";
      setForm({ ...EMPTY_FORM, locale: "ko", category: defaultCategory });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, dbCategories]);

  const reset = () => {
    const defaultCategory = categoryOptions[0]?.slug ?? "easy";
    setForm({ ...EMPTY_FORM, locale: "ko", category: defaultCategory });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    if (!isEditMode) reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isEditMode) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEditMode ? "레시피 수정" : "새 레시피 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {isEditMode ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              언어:{" "}
              <span className="font-semibold">
                {form.locale === "en" ? "English (en)" : "한국어 (ko)"}
              </span>
            </p>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">언어 *</Label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { v: "ko" as const, label: "한국어 (ko)" },
                    { v: "en" as const, label: "English (en)" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, locale: opt.v }))}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      (form.locale ?? "ko") === opt.v
                        ? "border-[#02633E] bg-[#02633E] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-[#02633E]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipe-name" className="text-sm font-medium text-gray-700">
              레시피명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recipe-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 에그샌드위치"
              required
              className="border-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">카테고리</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="카테고리" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">난이도</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => setForm({ ...form, difficulty: v })}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="난이도" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prepTime" className="text-sm font-medium text-gray-700">
                조리시간
              </Label>
              <Input
                id="prepTime"
                value={form.prepTime}
                onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                placeholder="15분"
                className="border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings" className="text-sm font-medium text-gray-700">
                인분
              </Label>
              <Input
                id="servings"
                value={form.servings}
                onChange={(e) => setForm({ ...form, servings: e.target.value })}
                placeholder="2인분"
                className="border-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              설명 <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="레시피에 대한 간단한 설명"
              rows={3}
              required
              className="resize-y border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-sm font-medium text-gray-700">
              재료
            </Label>
            <Textarea
              id="ingredients"
              value={form.ingredientsText}
              onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })}
              placeholder="재료를 쉼표로 구분하여 입력하세요"
              rows={3}
              className="resize-y border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps" className="text-sm font-medium text-gray-700">
              조리방법
            </Label>
            <Textarea
              id="steps"
              value={form.stepsText}
              onChange={(e) => setForm({ ...form, stepsText: e.target.value })}
              placeholder="각 단계를 줄바꿈으로 구분하여 입력하세요"
              rows={5}
              className="resize-y border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
              태그 (쉼표로 구분)
            </Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="간편, 아침식사, 도시락"
              className="border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium text-gray-700">
              이미지 URL (선택)
            </Label>
            <Input
              id="image"
              value={form.image ?? ""}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="/recipe-image.jpg"
              className="border-gray-200"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!isEditMode) reset();
                onOpenChange(false);
              }}
            >
              취소
            </Button>
            <Button type="submit" className="bg-[#02633E] text-white hover:bg-[#014d30]">
              {isEditMode ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
