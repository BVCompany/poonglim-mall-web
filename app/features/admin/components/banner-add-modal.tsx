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
}

export interface BannerFormData {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
}

export function BannerAddModal({
  open,
  onOpenChange,
  onSubmit,
}: BannerAddModalProps) {
  const [formData, setFormData] = useState<BannerFormData>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    buttonText: "",
    isActive: true,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        title: "",
        subtitle: "",
        imageUrl: "",
        linkUrl: "",
        buttonText: "",
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 배너 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">
            메인 페이지에 표시될 배너 정보를 입력하세요
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
              placeholder="건강하고 풍요로운 일상"
              required
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">부제목</Label>
            <Textarea
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="신뢰할 수 있는 품질과 혁신적인 기술로..."
              rows={3}
              required
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl">배너 이미지 URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="/images/hero-banner.jpg"
              required
            />
            <p className="text-xs text-gray-500">권장 크기: 1920 x 1080px</p>
          </div>

          {/* Link URL & Button Text */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">링크 URL</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkUrl: e.target.value })
                }
                placeholder="/products"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buttonText">버튼 텍스트</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) =>
                  setFormData({ ...formData, buttonText: e.target.value })
                }
                placeholder="제품 둘러보기"
                required
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
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

