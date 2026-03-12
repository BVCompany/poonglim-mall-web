/**
 * Product Add Modal Component
 *
 * 제품 추가 모달: 복수 카테고리, 풍림몰 링크, 배지, 태그, 이미지 업로드
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
import { ImageUpload } from "~/core/components/image-upload";
import { Check } from "lucide-react";

export interface DbCategory {
  slug: string;
  name: string;
}

export interface ProductBadge {
  value: "best" | "new" | "sale" | "b2b";
  label: string;
}

export interface ProductFormData {
  name: string;
  categories: string[];        // 복수 카테고리 슬러그 배열
  price: number;
  originalPrice?: number;
  badge?: string;
  description: string;
  tags: string[];
  image: string;
  shopUrl?: string;            // 풍림몰 구매 링크
}

const BADGE_OPTIONS: ProductBadge[] = [
  { value: "best", label: "BEST" },
  { value: "new",  label: "NEW"  },
  { value: "sale", label: "SALE" },
  { value: "b2b",  label: "B2B"  },
];

interface ProductAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (product: ProductFormData) => void;
  /** DB에서 로드된 카테고리 목록 */
  dbCategories?: DbCategory[];
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  categories: [],
  price: 0,
  originalPrice: undefined,
  badge: undefined,
  description: "",
  tags: [],
  image: "",
  shopUrl: "",
};

export function ProductAddModal({
  open,
  onOpenChange,
  onSubmit,
  dbCategories = [],
}: ProductAddModalProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState("");

  const reset = () => {
    setForm(EMPTY_FORM);
    setTagsInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onSubmit({ ...form, tags });
    reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const toggleCategory = (slug: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(slug)
        ? prev.categories.filter((c) => c !== slug)
        : [...prev.categories, slug],
    }));
  };

  const toggleBadge = (value: string) => {
    setForm((prev) => ({ ...prev, badge: prev.badge === value ? undefined : value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 제품 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* 제품명 */}
          <div className="space-y-1.5">
            <Label>제품명 *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="예: 짜먹는 에그샐러드 1kg"
              required
            />
          </div>

          {/* 카테고리 (복수 선택) */}
          <div className="space-y-1.5">
            <Label>카테고리 (복수 선택 가능)</Label>
            {dbCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {dbCategories.map((cat) => {
                  const selected = form.categories.includes(cat.slug);
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => toggleCategory(cat.slug)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-[#204E3A] bg-[#204E3A] text-white"
                          : "border-gray-300 bg-white text-gray-700 hover:border-[#204E3A]"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Input
                value={form.categories.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categories: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                  })
                }
                placeholder="카테고리 슬러그를 쉼표로 구분하여 입력 (예: liquid_egg, b2b)"
              />
            )}
            {form.categories.length > 0 && (
              <p className="text-xs text-gray-500">
                선택: {form.categories.join(", ")}
              </p>
            )}
          </div>

          {/* 풍림몰 링크 */}
          <div className="space-y-1.5">
            <Label>풍림몰 구매 링크</Label>
            <Input
              type="url"
              value={form.shopUrl ?? ""}
              onChange={(e) => setForm({ ...form, shopUrl: e.target.value })}
              placeholder="https://poonglimmall.com/..."
            />
          </div>

          {/* 판매가 / 정가 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>판매가 *</Label>
              <Input
                type="number"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                placeholder="14800"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>정가 (선택)</Label>
              <Input
                type="number"
                value={form.originalPrice || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    originalPrice: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                placeholder="18000"
              />
            </div>
          </div>

          {/* 배지 (단일 선택) */}
          <div className="space-y-1.5">
            <Label>배지 (선택)</Label>
            <div className="flex gap-2">
              {BADGE_OPTIONS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => toggleBadge(b.value)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                    form.badge === b.value
                      ? "border-[#204E3A] bg-[#204E3A] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[#204E3A]"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* 제품 설명 */}
          <div className="space-y-1.5">
            <Label>제품 설명 *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="제품 설명을 입력하세요"
              rows={3}
              required
            />
          </div>

          {/* 태그 */}
          <div className="space-y-1.5">
            <Label>태그 (쉼표 구분)</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="간편, 간편식사, 직장인, 한끼해결"
            />
            <p className="text-xs text-gray-400">
              # 없이 입력 — 예: 간편, 직장인
            </p>
          </div>

          {/* 제품 이미지 */}
          <div className="space-y-1.5">
            <Label>제품 이미지</Label>
            <ImageUpload
              bucket="products"
              folder="products"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              aspectRatio="1/1"
              hint="JPG, PNG, WebP · 1:1 비율 권장"
            />
            <Input
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="또는 이미지 URL 직접 입력"
              className="text-xs"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]">
              추가
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
              취소
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
