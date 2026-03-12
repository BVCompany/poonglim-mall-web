/**
 * Recipe Add/Edit Modal Component
 * 재료 동적 추가 + 만드는 법 단계별 추가 지원
 */
import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
import { ImageUpload } from "~/core/components/image-upload";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Plus, Trash2, GripVertical } from "lucide-react";

// ─── 타입 ─────────────────────────────────────────────────────────────────────
export interface IngredientRow { name: string; amount: string; }
export interface StepRow       { description: string; }

export interface RecipeFormData {
  name: string;
  category: string;
  difficulty: string;
  prepTime: string;
  servings: string;
  description: string;
  ingredients: IngredientRow[];
  steps: StepRow[];
  tags: string;
  image?: string;
}

interface RecipeAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (recipe: RecipeFormData) => void;
  /** 수정 모드: 수정할 레시피의 DB id */
  editId?: number;
  /** 수정 모드: 기존 데이터 (미제공 시 등록 모드) */
  initialData?: RecipeFormData;
  /** DB에서 로드된 레시피 카테고리 */
  dbCategories?: { slug: string; name: string }[];
}

const DIFFICULTY_OPTIONS = [
  { value: "easy",   label: "쉬움" },
  { value: "medium", label: "보통" },
  { value: "hard",   label: "어려움" },
];

const EMPTY_FORM: RecipeFormData = {
  name: "", category: "easy", difficulty: "easy",
  prepTime: "", servings: "", description: "",
  ingredients: [{ name: "", amount: "" }],
  steps: [{ description: "" }],
  tags: "", image: "",
};

// ─── 재료 입력 행 ──────────────────────────────────────────────────────────────
function IngredientRows({
  rows, onChange,
}: {
  rows: IngredientRow[];
  onChange: (rows: IngredientRow[]) => void;
}) {
  const update = (i: number, field: keyof IngredientRow, val: string) => {
    const next = rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r);
    onChange(next);
  };
  const add    = () => onChange([...rows, { name: "", amount: "" }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-300" />
          <Input
            value={row.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="재료명 (예: 풍림푸드 액란)"
            className="flex-1"
          />
          <Input
            value={row.amount}
            onChange={(e) => update(i, "amount", e.target.value)}
            placeholder="양 (예: 200ml)"
            className="w-28 flex-shrink-0"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={rows.length === 1}
            className="text-gray-300 hover:text-red-400 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
        <Plus className="h-3.5 w-3.5" />
        재료 추가
      </Button>
    </div>
  );
}

// ─── 만드는 법 입력 행 ─────────────────────────────────────────────────────────
function StepRows({
  rows, onChange,
}: {
  rows: StepRow[];
  onChange: (rows: StepRow[]) => void;
}) {
  const update = (i: number, val: string) => {
    const next = rows.map((r, idx) => idx === i ? { description: val } : r);
    onChange(next);
  };
  const add    = () => onChange([...rows, { description: "" }]);
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2">
          {/* 번호 뱃지 */}
          <span className="mt-2.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#204E3A] text-[10px] font-bold text-white">
            {i + 1}
          </span>
          <Textarea
            value={row.description}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`${i + 1}번째 단계를 입력하세요`}
            rows={2}
            className="flex-1 resize-none text-sm"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={rows.length === 1}
            className="mt-2 text-gray-300 hover:text-red-400 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-full gap-1.5 text-xs">
        <Plus className="h-3.5 w-3.5" />
        단계 추가
      </Button>
    </div>
  );
}

// ─── 모달 ─────────────────────────────────────────────────────────────────────
export function RecipeAddModal({
  open, onOpenChange, onSubmit, editId, initialData, dbCategories = [],
}: RecipeAddModalProps) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<RecipeFormData>(initialData ?? EMPTY_FORM);

  const categoryOptions = dbCategories.length > 0
    ? dbCategories
    : [
        { slug: "easy",       name: "가정용" },
        { slug: "dessert",    name: "카페 & 베이커리" },
        { slug: "restaurant", name: "외식업체" },
      ];

  // 모달이 열릴 때 폼 초기화 — 등록 모드에서는 첫 번째 카테고리를 기본값으로 설정
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm(initialData);
    } else {
      const defaultCategory = categoryOptions[0]?.slug ?? "easy";
      setForm({ ...EMPTY_FORM, category: defaultCategory });
    }
  // categoryOptions 변경 감지 시 slug 배열로 비교 (참조 안정성 보장)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, dbCategories]);

  const reset = () => {
    const defaultCategory = categoryOptions[0]?.slug ?? "easy";
    setForm({ ...EMPTY_FORM, category: defaultCategory });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    if (!isEditMode) reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isEditMode) reset(); onOpenChange(o); }}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "레시피 수정" : "새 레시피 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">

          {/* 레시피명 */}
          <div className="space-y-1.5">
            <Label>레시피명 *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 부드러운 계란찜"
              required
            />
          </div>

          {/* 카테고리 + 난이도 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>카테고리</Label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30"
              >
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>난이도</Label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 조리시간 + 인분 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>조리시간</Label>
              <Input
                value={form.prepTime}
                onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
                placeholder="예: 15분 · 15~20분"
              />
            </div>
            <div className="space-y-1.5">
              <Label>인분</Label>
              <Input
                value={form.servings}
                onChange={(e) => setForm({ ...form, servings: e.target.value })}
                placeholder="예: 2인분 · 2~3인분"
              />
            </div>
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label>설명 *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="레시피에 대한 간단한 설명을 입력하세요"
              rows={3}
              required
            />
          </div>

          {/* 재료 */}
          <div className="space-y-1.5">
            <Label>재료</Label>
            <IngredientRows
              rows={form.ingredients}
              onChange={(rows) => setForm({ ...form, ingredients: rows })}
            />
          </div>

          {/* 만드는 법 */}
          <div className="space-y-1.5">
            <Label>만드는 법</Label>
            <StepRows
              rows={form.steps}
              onChange={(rows) => setForm({ ...form, steps: rows })}
            />
          </div>

          {/* 태그 */}
          <div className="space-y-1.5">
            <Label>태그 (쉼표 구분)</Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="간편, 아침식사, 도시락"
            />
          </div>

          {/* 이미지 */}
          <div className="space-y-1.5">
            <Label>대표 이미지</Label>
            <ImageUpload
              bucket="media"
              folder="recipes"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              aspectRatio="1/1"
              hint="JPG, PNG, WebP · 1:1 비율 권장"
            />
            <Input
              value={form.image ?? ""}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]">
              {isEditMode ? "수정 완료" : "추가"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { if (!isEditMode) reset(); onOpenChange(false); }} className="flex-1">취소</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
