/**
 * Instagram Post Add/Edit Modal
 *
 * 인스타그램 섹션에 직접 노출할 이미지를 등록/수정하는 모달.
 */

import { useEffect, useState } from "react";

import { ImageUpload } from "~/core/components/image-upload";
import { Button } from "~/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export interface InstagramPostFormData {
  imageUrl: string;
  linkUrl: string;
  caption: string;
  isActive: boolean;
}

interface InstagramPostAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InstagramPostFormData) => void;
  initialData?: InstagramPostFormData;
  editId?: string;
}

const DEFAULT_FORM: InstagramPostFormData = {
  imageUrl: "",
  linkUrl: "",
  caption: "",
  isActive: true,
};

export function InstagramPostAddModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  editId,
}: InstagramPostAddModalProps) {
  const isEdit = !!editId;
  const [formData, setFormData] = useState<InstagramPostFormData>(
    initialData ?? DEFAULT_FORM,
  );

  useEffect(() => {
    if (open) setFormData(initialData ?? DEFAULT_FORM);
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) return;
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "인스타 이미지 수정" : "새 인스타 이미지 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-gray-600">
            메인 인스타그램 섹션에 노출할 이미지를 등록하세요. (권장 비율 4:5,
            세로형)
          </p>

          {/* 이미지 업로드 */}
          <div className="space-y-2">
            <Label>
              이미지 <span className="text-xs text-gray-400">(권장: 720×900px)</span>
            </Label>
            <ImageUpload
              bucket="media"
              folder="instagram"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              aspectRatio="4/5"
              hint="JPG, PNG, WebP 최대 10MB"
            />
            <Input
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
          </div>

          {/* 링크 URL */}
          <div className="space-y-2">
            <Label htmlFor="linkUrl">
              링크 URL
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (선택 — 비우면 공식 인스타 계정으로 이동)
              </span>
            </Label>
            <Input
              id="linkUrl"
              value={formData.linkUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkUrl: e.target.value })
              }
              placeholder="https://www.instagram.com/p/..."
            />
          </div>

          {/* 메모/대체텍스트 */}
          <div className="space-y-2">
            <Label htmlFor="caption">
              메모
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                (선택 — 관리용/대체텍스트)
              </span>
            </Label>
            <Input
              id="caption"
              value={formData.caption}
              onChange={(e) =>
                setFormData({ ...formData, caption: e.target.value })
              }
              placeholder="예: 신제품 출시 이벤트"
            />
          </div>

          {/* 활성 토글 */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="isActive" className="cursor-pointer">
              노출 활성화
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

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!formData.imageUrl}
              className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
            >
              {isEdit ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
