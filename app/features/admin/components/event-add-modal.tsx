/**
 * Event Add Modal Component
 *
 * Modal for adding new events/notices in admin panel.
 */
import type { EventCategory, EventStatus } from "../types/event.types";

import { useEffect, useState } from "react";

import { Button } from "~/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import { Textarea } from "~/core/components/ui/textarea";

interface EventAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (event: EventFormData) => void;
}

export interface EventFormData {
  title: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate?: string;
  description: string;
  content: string;
  image?: string;
}

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "event", label: "이벤트" },
  { value: "notice", label: "공지사항" },
  { value: "promotion", label: "프로모션" },
  { value: "news", label: "뉴스" },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "active", label: "진행중" },
  { value: "scheduled", label: "예정" },
  { value: "ended", label: "종료" },
  { value: "draft", label: "임시저장" },
];

export function EventAddModal({
  open,
  onOpenChange,
  onSubmit,
}: EventAddModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    category: "event",
    status: "active",
    startDate: "",
    endDate: "",
    description: "",
    content: "",
    image: "",
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        category: "event",
        status: "active",
        startDate: "",
        endDate: "",
        description: "",
        content: "",
        image: "",
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData: EventFormData = {
      ...formData,
      endDate: formData.endDate || undefined,
      image: formData.image || undefined,
    };

    onSubmit(eventData);

    // Form will be reset by useEffect when modal closes
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Form will be reset by useEffect when modal closes
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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

          {/* Category & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">유형</Label>
              <Select
                value={formData.category}
                onValueChange={(value: EventCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value: EventStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                onFocus={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch (error) {
                    // showPicker not supported
                  }
                }}
                className="cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                style={{ userSelect: "none" }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">종료일 (선택)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                onFocus={(e) => {
                  try {
                    (e.target as HTMLInputElement).showPicker?.();
                  } catch (error) {
                    // showPicker not supported
                  }
                }}
                className="cursor-pointer [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                style={{ userSelect: "none" }}
              />
            </div>
          </div>

          {/* Brief Description */}
          <div className="space-y-2">
            <Label htmlFor="description">간단 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="간단한 설명을 입력하세요"
              rows={3}
              required
            />
          </div>

          {/* Detailed Content */}
          <div className="space-y-2">
            <Label htmlFor="content">상세 내용</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="상세 내용을 입력하세요"
              rows={5}
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image">이미지 URL (선택)</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="/event-image.jpg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
            >
              추가
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
