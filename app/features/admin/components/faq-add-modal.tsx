/**
 * FaqAddModal — FAQ 추가/수정 모달
 */
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export interface FaqFormData {
  locale: "ko" | "en";
  category: "product" | "delivery" | "b2b" | "quality" | "general";
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FaqFormData) => void;
  editId?: number;
  initialData?: FaqFormData;
}

const EMPTY: FaqFormData = {
  locale: "ko",
  category: "general",
  question: "",
  answer: "",
  sort_order: 0,
  is_active: true,
};

const CATEGORIES: { key: FaqFormData["category"]; label: string }[] = [
  { key: "product",  label: "제품문의" },
  { key: "delivery", label: "주문/배송" },
  { key: "quality",  label: "품질/안전" },
  { key: "b2b",      label: "B2B/대량구매" },
  { key: "general",  label: "기타" },
];

export function FaqAddModal({ open, onOpenChange, onSubmit, editId, initialData }: Props) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<FaqFormData>(EMPTY);

  useEffect(() => {
    if (open) setForm(isEditMode && initialData ? initialData : EMPTY);
  }, [open, isEditMode, initialData]);

  const set = <K extends keyof FaqFormData>(key: K, value: FaqFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "FAQ 수정" : "새 FAQ 등록"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {!isEditMode ? (
            <div>
              <Label className="mb-1.5 block text-sm font-medium">언어</Label>
              <select
                value={form.locale}
                onChange={(e) => set("locale", e.target.value as "ko" | "en")}
                className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm"
                aria-label="게시 언어"
              >
                <option value="ko">한국어 (ko)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          ) : null}
          {/* 카테고리 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">카테고리</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set("category", key)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    form.category === key
                      ? { backgroundColor: "#003F2B", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B", border: "1px solid #C5BFA8" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 질문 */}
          <div>
            <Label htmlFor="faq-question" className="mb-1.5 block text-sm font-medium">
              질문 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="faq-question"
              value={form.question}
              onChange={(e) => set("question", e.target.value)}
              placeholder="질문을 입력하세요"
              required
            />
          </div>

          {/* 답변 */}
          <div>
            <Label htmlFor="faq-answer" className="mb-1.5 block text-sm font-medium">
              답변 <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="faq-answer"
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              placeholder="답변을 입력하세요."
              rows={8}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#003F2B] focus:ring-1 focus:ring-[#003F2B]"
            />
          </div>

          {/* 정렬 순서 + 활성 여부 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="faq-sort" className="mb-1.5 block text-sm font-medium">
                정렬 순서 <span className="ml-1 text-xs font-normal text-gray-400">(낮을수록 먼저)</span>
              </Label>
              <Input
                id="faq-sort"
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col justify-end pb-0.5">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
                <input
                  id="faq-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => set("is_active", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#003F2B]"
                />
                <Label htmlFor="faq-active" className="cursor-pointer text-sm font-medium">
                  활성화 (공개 표시)
                </Label>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" className="bg-[#204E3A] text-white hover:bg-[#204E3A]/90">
              {isEditMode ? "수정 완료" : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
