/**
 * Popup Add Modal Component
 * 
 * Modal for adding new popups in admin panel.
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

interface PopupAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (popup: PopupFormData) => void;
}

export interface PopupFormData {
  title: string;
  content: string;
  frequency: "once" | "daily" | "always";
  startDate: string;
  endDate: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
}

export function PopupAddModal({
  open,
  onOpenChange,
  onSubmit,
}: PopupAddModalProps) {
  const [formData, setFormData] = useState<PopupFormData>({
    title: "",
    content: "",
    frequency: "once",
    startDate: "",
    endDate: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        content: "",
        frequency: "once",
        startDate: "",
        endDate: "",
        imageUrl: "",
        linkUrl: "",
        isActive: true,
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          <DialogTitle className="text-xl font-bold">새 팝업 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">이미지 URL (선택)</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
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
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

