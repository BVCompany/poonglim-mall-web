/**
 * Event Add Modal Component — 이벤트/공지 추가·수정 (관리자)
 */
import type { EventCategory, EventStatus } from "../types/event.types";

import { useEffect, useState } from "react";

import { Button } from "~/core/components/ui/button";
import { RichTextEditor } from "~/core/components/rich-text-editor";
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
  mode?: "create" | "edit";
  defaultType?: "event" | "notice";
  initial?: EventFormData | null;
}

export interface EventFormData {
  eventId?: number;
  title: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate?: string;
  description: string;
  content: string;
  image?: string;
  location?: string;
  contact?: string;
  badge?: string;
}

const CATEGORY_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: "event", label: "이벤트" },
  { value: "notice", label: "공지사항" },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "active", label: "진행중" },
  { value: "ended", label: "종료" },
];

function emptyForm(category: EventCategory = "event"): EventFormData {
  return {
    title: "",
    category,
    status: "active",
    startDate: "",
    endDate: "",
    description: "",
    content: "",
    image: "",
    location: "",
    contact: "",
    badge: "",
  };
}

/** 편집 시 DB에 없던 상태값은 진행중/종료로 맞춤 */
function normalizeStatus(s: EventStatus): EventStatus {
  if (s === "ended" || s === "inactive") return "ended";
  return "active";
}

export function EventAddModal({
  open,
  onOpenChange,
  onSubmit,
  mode = "create",
  defaultType = "event",
  initial = null,
}: EventAddModalProps) {
  const [formData, setFormData] = useState<EventFormData>(() =>
    emptyForm(defaultType === "notice" ? "notice" : "event"),
  );

  useEffect(() => {
    if (!open) {
      setFormData(emptyForm(defaultType === "notice" ? "notice" : "event"));
      return;
    }
    if (mode === "edit" && initial) {
      const cat: EventCategory =
        initial.category === "notice" ? "notice" : "event";
      setFormData({
        ...emptyForm(cat),
        ...initial,
        category: cat,
        status: normalizeStatus(initial.status),
        endDate: initial.endDate ?? "",
        image: initial.image ?? "",
        location: initial.location ?? "",
        contact: initial.contact ?? "",
        badge: initial.badge ?? "",
      });
      return;
    }
    if (mode === "create") {
      setFormData(emptyForm(defaultType === "notice" ? "notice" : "event"));
    }
  }, [open, mode, initial, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventData: EventFormData = {
      ...formData,
      eventId: formData.eventId,
      category: formData.category === "notice" ? "notice" : "event",
      endDate: formData.endDate || undefined,
      image: formData.image?.trim() || undefined,
      location: formData.location?.trim() || "",
      contact: formData.contact?.trim() || "",
      badge: formData.badge?.trim() || "",
    };

    onSubmit(eventData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {mode === "edit" ? "수정" : "추가"}
          </DialogTitle>
        </DialogHeader>

        <form
          key={mode === "edit" ? formData.eventId ?? "edit" : "create"}
          onSubmit={handleSubmit}
          className="space-y-4 pt-1"
        >
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              제목
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="제목을 입력하세요"
              required
              className="border-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">유형</Label>
              <Select
                value={formData.category === "notice" ? "notice" : "event"}
                onValueChange={(value: EventCategory) =>
                  setFormData({
                    ...formData,
                    category: value === "notice" ? "notice" : "event",
                  })
                }
              >
                <SelectTrigger className="border-gray-200">
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
              <Label className="text-sm font-medium text-gray-700">상태</Label>
              <Select
                value={normalizeStatus(formData.status)}
                onValueChange={(value: EventStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="border-gray-200">
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                시작일
              </Label>
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
                  } catch {
                    /* showPicker 미지원 */
                  }
                }}
                className="cursor-pointer border-gray-200 [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                종료일 (선택)
              </Label>
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
                  } catch {
                    /* showPicker 미지원 */
                  }
                }}
                className="cursor-pointer border-gray-200 [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              간단 설명
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="목록에 표시되는 짧은 설명을 입력하세요"
              rows={3}
              className="resize-y border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700">
              상세 내용
            </Label>
            <RichTextEditor
              value={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
              placeholder="상세 내용을 입력하세요"
              bucket="media"
              folder="events"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">
              이미지 URL (선택)
            </Label>
            <Input
              id="imageUrl"
              value={formData.image ?? ""}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="/event-image.jpg"
              className="border-gray-200"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              취소
            </Button>
            <Button type="submit" className="bg-[#02633E] text-white hover:bg-[#014d30]">
              {mode === "edit" ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
