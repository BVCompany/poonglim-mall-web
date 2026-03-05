/**
 * Product Add Modal Component
 * 
 * Modal for adding new products in admin panel.
 */

import { useState } from "react";
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
import { ImageUpload } from "~/core/components/image-upload";
import type { ProductCategory, ProductBadge } from "../types/product.types";

interface ProductAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: ProductFormData) => void;
}

export interface ProductFormData {
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  badges: ProductBadge[];
  description: string;
  tags: string[];
  image: string;
}

const BADGE_OPTIONS: { value: ProductBadge; label: string }[] = [
  { value: "best", label: "BEST" },
  { value: "new", label: "NEW" },
  { value: "sale", label: "SALE" },
  { value: "recommended", label: "추천" },
];

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "liquid-eggs", label: "에그샐러드" },
  { value: "puddings", label: "푸딩" },
  { value: "convenience", label: "편의식" },
];

export function ProductAddModal({
  open,
  onOpenChange,
  onSubmit,
}: ProductAddModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "liquid-eggs",
    price: 0,
    originalPrice: undefined,
    badges: [],
    description: "",
    tags: [],
    image: "",
  });

  const [selectedBadges, setSelectedBadges] = useState<ProductBadge[]>([]);
  const [tagsInput, setTagsInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tags from comma-separated string
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const productData: ProductFormData = {
      ...formData,
      badges: selectedBadges,
      tags,
    };

    onSubmit(productData);
    
    // Reset form
    setFormData({
      name: "",
      category: "liquid-eggs",
      price: 0,
      originalPrice: undefined,
      badges: [],
      description: "",
      tags: [],
      image: "",
    });
    setSelectedBadges([]);
    setTagsInput("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: "",
      category: "liquid-eggs",
      price: 0,
      originalPrice: undefined,
      badges: [],
      description: "",
      tags: [],
      image: "",
    });
    setSelectedBadges([]);
    setTagsInput("");
    onOpenChange(false);
  };

  const toggleBadge = (badge: ProductBadge) => {
    setSelectedBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : [...prev, badge]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 제품 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">제품명</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="제품명을 입력하세요"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">카테고리</Label>
            <Select
              value={formData.category}
              onValueChange={(value: ProductCategory) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
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

          {/* Price & Original Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">판매가</Label>
              <Input
                id="price"
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="14,800원"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">정가 (선택)</Label>
              <Input
                id="originalPrice"
                type="number"
                value={formData.originalPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value
                      ? parseInt(e.target.value)
                      : undefined,
                  })
                }
                placeholder="18,000원"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2">
            <Label>배지 (선택)</Label>
            <div className="flex flex-wrap gap-2">
              {BADGE_OPTIONS.map((badge) => (
                <button
                  key={badge.value}
                  type="button"
                  onClick={() => toggleBadge(badge.value)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    selectedBadges.includes(badge.value)
                      ? "bg-[#204E3A] text-white border-[#204E3A]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#204E3A]"
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
            {selectedBadges.length > 0 && (
              <p className="text-sm text-gray-500">
                선택됨: {selectedBadges.map((b) => BADGE_OPTIONS.find((opt) => opt.value === b)?.label).join(", ")}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">제품 설명</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="제품 설명을 입력하세요"
              rows={4}
              required
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="간편, 간편식사, 직장인"
            />
            <p className="text-xs text-gray-500">
              예: 간편, 간편식사, 직장인
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>제품 이미지</Label>
            <ImageUpload
              bucket="products"
              folder="products"
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
              aspectRatio="3/4"
              hint="JPG, PNG, WebP 최대 10MB"
            />
            {/* 직접 URL 입력 (선택) */}
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
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

