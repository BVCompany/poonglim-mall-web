/**
 * Popup Add Modal Component
 * 
 * Modal for adding new popups in admin panel.
 */

import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

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
  frequency: "once" | "daily" | "always";
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
    frequency: "once",
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

  useEffect(() => {
    if (!open) {
      setFormData(emptyPopupForm());
      return;
    }
    if (mode === "edit" && initial) {
      setFormData({
        ...emptyPopupForm(),
        ...initial,
        imageUrl: initial.imageUrl ?? "",
        linkUrl: initial.linkUrl ?? "",
      });
      return;
    }
    if (mode === "create") {
      setFormData(emptyPopupForm());
    }
  }, [open, mode, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, popupId: formData.popupId });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getFrequencyLabel = (value: string) => {
    const labels: Record<string, string> = {
      once: "1회만",
      daily: "매일",
      always: "항상",
    };
    return labels[value] || value;
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
            모달 팝업 정보를 입력하세요
          </p>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="제목을 입력하세요"
              required
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">내용</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="팝업 내용을 입력하세요"
              rows={4}
              required
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">표시 빈도</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: "once" | "daily" | "always") =>
                setFormData({ ...formData, frequency: value })
              }
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="빈도 선택">
                  {getFrequencyLabel(formData.frequency)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="once">1회만</SelectItem>
                <SelectItem value="daily">매일</SelectItem>
                <SelectItem value="always">항상</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                style={{ userSelect: 'none' }}
                onFocus={(e) => e.target.showPicker?.()}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일</Label>
              <Input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                style={{ userSelect: 'none' }}
                onFocus={(e) => e.target.showPicker?.()}
                required
              />
            </div>
          </div>

          {/* Image Upload (Optional) */}
          <div className="space-y-2">
            <Label>팝업 이미지 (선택)</Label>
            <ImageUpload
              bucket="media"
              folder="popups"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              aspectRatio="4/5"
              hint="JPG, PNG, WebP 최대 10MB"
            />
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
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
              placeholder="/products"
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

