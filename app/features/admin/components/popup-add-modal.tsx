/**
 * Popup Add Modal Component
 *
 * Modal for adding new popups in admin panel.
 */

import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
import { DatePicker } from "~/core/components/ui/date-picker";
import { ImageUpload } from "~/core/components/image-upload";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";

interface PopupAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (popup: PopupFormData) => void;
  mode?: "create" | "edit";
  initial?: PopupFormData | null;
}

export interface PopupFormData {
  popupId?: number;
  title: string;
  content: string;
  sortOrder: number;
  startDate: string;
  endDate: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

function emptyPopupForm(): PopupFormData {
  return {
    title: "",
    content: "",
    sortOrder: 0,
    startDate: "",
    endDate: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
  };
}

export function PopupAddModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  initial = null,
}: PopupAddModalProps) {
  const [formData, setFormData] = useState<PopupFormData>(emptyPopupForm);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!open) {
      setFormData(emptyPopupForm());
      setImageError(false);
      return;
    }
    if (mode === "edit" && initial) {
      setFormData({
        ...emptyPopupForm(),
        ...initial,
        imageUrl: initial.imageUrl ?? "",
        linkUrl: initial.linkUrl ?? "",
        sortOrder: initial.sortOrder ?? 0,
      });
      setImageError(false);
      return;
    }
    if (mode === "create") {
      setFormData(emptyPopupForm());
      setImageError(false);
    }
  }, [open, mode, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      setImageError(true);
      return;
    }
    setImageError(false);
    onSubmit({ ...formData, popupId: formData.popupId });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === "edit" ? "팝업 수정" : "새 팝업 추가"}
          </DialogTitle>
        </DialogHeader>

        <form
          key={mode === "edit" ? formData.popupId ?? "pe" : "pc"}
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
        >
          <p className="text-sm text-gray-600">
            메인에 노출되는 이미지 팝업입니다. 이미지·노출 기간·순서를 설정하세요.
          </p>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 (관리용)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="목록에 표시될 제목"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">노출 순서</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              step={1}
              value={Number.isNaN(formData.sortOrder) ? 0 : formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: Number.parseInt(e.target.value, 10) || 0,
                })
              }
            />
            <p className="text-xs text-gray-500">
              숫자가 작을수록 먼저 노출됩니다.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">메모 (선택)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="내부 참고용 메모"
              rows={3}
            />
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <DatePicker
                value={
                  formData.startDate
                    ? new Date(`${formData.startDate}T12:00:00`)
                    : undefined
                }
                onChange={(d) =>
                  setFormData({
                    ...formData,
                    startDate: d ? format(d, "yyyy-MM-dd") : "",
                  })
                }
                placeholder="시작일"
                className="rounded-md border border-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <DatePicker
                value={
                  formData.endDate
                    ? new Date(`${formData.endDate}T12:00:00`)
                    : undefined
                }
                onChange={(d) =>
                  setFormData({
                    ...formData,
                    endDate: d ? format(d, "yyyy-MM-dd") : "",
                  })
                }
                placeholder="종료일"
                className="rounded-md border border-input"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>팝업 이미지 (필수)</Label>
            <ImageUpload
              bucket="media"
              folder="popups"
              value={formData.imageUrl}
              onChange={(url) => {
                setFormData({ ...formData, imageUrl: url });
                if (url.trim()) setImageError(false);
              }}
              aspectRatio="4/5"
              hint="JPG, PNG, WebP 최대 10MB"
            />
            <Input
              value={formData.imageUrl}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                if (e.target.value.trim()) setImageError(false);
              }}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
            {imageError && (
              <p className="text-sm text-red-600">이미지를 등록해 주세요.</p>
            )}
          </div>

          {/* Link URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">링크 URL (선택)</Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              placeholder="/products 또는 https://..."
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="isActive" className="cursor-pointer">
              활성화
            </Label>
            <button
              type="button"
              id="isActive"
              role="switch"
              aria-checked={formData.isActive}
              onClick={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? "bg-[#204E3A]" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
            >
              {mode === "edit" ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
