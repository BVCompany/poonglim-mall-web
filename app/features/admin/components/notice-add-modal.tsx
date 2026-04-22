/**
 * NoticeAddModal — 공지사항 추가/수정 모달
 */
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export interface NoticeFormData {
  locale: "ko" | "en";
  category: "공지" | "안내" | "이벤트";
  title: string;
  content: string;
  author: string;
  tags: string;       // 쉼표 구분 문자열
  is_pinned: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NoticeFormData) => void;
  editId?: number;
  initialData?: NoticeFormData;
}

const EMPTY: NoticeFormData = {
  locale: "ko",
  category: "안내",
  title: "",
  content: "",
  author: "풍림푸드",
  tags: "",
  is_pinned: false,
};

const CATEGORIES: NoticeFormData["category"][] = ["공지", "안내", "이벤트"];

export function NoticeAddModal({ open, onOpenChange, onSubmit, editId, initialData }: Props) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<NoticeFormData>(EMPTY);

  useEffect(() => {
    if (open) {
      setForm(isEditMode && initialData ? initialData : EMPTY);
    }
  }, [open, isEditMode, initialData]);

  const set = <K extends keyof NoticeFormData>(key: K, value: NoticeFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "공지사항 수정" : "새 공지사항 작성"}</DialogTitle>
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
          {/* 구분 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">구분</Label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => set("category", cat)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    form.category === cat
                      ? { backgroundColor: "#003F2B", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B", border: "1px solid #C5BFA8" }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <Label htmlFor="notice-title" className="mb-1.5 block text-sm font-medium">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="notice-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              required
            />
          </div>

          {/* 본문 */}
          <div>
            <Label htmlFor="notice-content" className="mb-1.5 block text-sm font-medium">
              본문 내용
            </Label>
            <textarea
              id="notice-content"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="공지사항 내용을 입력하세요. HTML 태그를 사용할 수 있습니다."
              rows={10}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#003F2B] focus:ring-1 focus:ring-[#003F2B]"
            />
          </div>

          {/* 작성자 (+ 비고정 시 태그) */}
          <div className={`grid gap-4 ${form.is_pinned ? "grid-cols-1" : "grid-cols-2"}`}>
            <div>
              <Label htmlFor="notice-author" className="mb-1.5 block text-sm font-medium">
                작성자
              </Label>
              <Input
                id="notice-author"
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="풍림푸드"
              />
            </div>
            {!form.is_pinned && (
              <div>
                <Label htmlFor="notice-tags" className="mb-1.5 block text-sm font-medium">
                  태그 (쉼표로 구분)
                </Label>
                <Input
                  id="notice-tags"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="예: 공지, 배송, B2B"
                />
              </div>
            )}
          </div>

          {/* 상단 고정 */}
          <div className="space-y-2 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <input
                id="notice-pinned"
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => set("is_pinned", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 accent-[#003F2B]"
              />
              <Label htmlFor="notice-pinned" className="cursor-pointer text-sm font-medium">
                상단 고정 (중요 공지)
              </Label>
            </div>
            {form.is_pinned && (
              <div className="pl-6">
                <Label className="mb-1 block text-xs text-gray-500">
                  고정 태그 텍스트
                  <span className="ml-1 text-gray-400">(목록에서 번호 대신 표시되는 배지)</span>
                </Label>
                <Input
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="예: 공고, 회사소개, B2B (쉼표로 구분, 첫번째가 태그로 표시)"
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              type="submit"
              className="bg-[#204E3A] text-white hover:bg-[#204E3A]/90"
            >
              {isEditMode ? "수정 완료" : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
