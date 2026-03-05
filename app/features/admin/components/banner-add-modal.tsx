/**
 * Banner Add Modal Component
 * 
 * Modal for adding new banners in admin panel.
 */

import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import { ImageUpload } from "~/core/components/image-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";

interface BannerAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (banner: BannerFormData) => void;
  initialData?: BannerFormData;
  editId?: string;
}

export interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
}

const DEFAULT_FORM: BannerFormData = {
  title: "", subtitle: "", imageUrl: "", linkUrl: "", buttonText: "", isActive: true,
};

export function BannerAddModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  editId,
}: BannerAddModalProps) {
  const isEdit = !!editId;
  const [formData, setFormData] = useState<BannerFormData>(initialData ?? DEFAULT_FORM);

  // Sync form when initialData or open state changes
  useEffect(() => {
    if (open) {
      setFormData(initialData ?? DEFAULT_FORM);
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          {isEdit ? "배너 수정" : "새 배너 추가"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">
            {isEdit ? "배너 정보를 수정하세요" : "메인 페이지에 표시될 배너 정보를 입력하세요"}
          </p>

          {/* Title — 배너 위 작은 글씨 */}
          <div className="space-y-2">
            <Label htmlFor="title">
              제목
              <span className="ml-1.5 text-xs font-normal text-gray-400">(배너 상단 작은 글씨)</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="건강하고 풍요로운 일상"
              required
            />
          </div>

          {/* Subtitle — 배너 큰 굵은 글씨 */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">
              부제목
              <span className="ml-1.5 text-xs font-normal text-gray-400">(배너 메인 큰 글씨)</span>
            </Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="신뢰할 수 있는 품질과 혁신적인 기술로 만드는 프리미엄 식품 솔루션"
              rows={3}
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>배너 이미지 <span className="text-xs text-gray-400">(권장: 1920×1080px)</span></Label>
            <ImageUpload
              bucket="media"
              folder="banners"
              value={formData.imageUrl}
              onChange={(url) => setFormData({ ...formData, imageUrl: url })}
              aspectRatio="16/9"
              hint="JPG, PNG, WebP 최대 10MB"
            />
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
          </div>

          {/* Link URL & Button Text */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">
                링크 URL
                <span className="ml-1.5 text-xs font-normal text-gray-400">(선택 — 제목 클릭 시 이동)</span>
              </Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkUrl: e.target.value })
                }
                placeholder="/products"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">
                보조 텍스트
                <span className="ml-1.5 text-xs font-normal text-gray-400">(선택 — 제목 두 번째 줄)</span>
              </Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                placeholder="만드는 프리미엄 식품 솔루션"
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="isActive" className="cursor-pointer">
              배너 활성화
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
              {isEdit ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

