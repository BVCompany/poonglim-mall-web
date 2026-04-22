/**
 * Product Add Modal Component
 *
 * 제품 추가 모달: 복수 카테고리, 풍림몰 링크, 배지, 태그, 이미지 업로드
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
  /** 신규 등록 시에만 사용 (ko | en) */
  locale?: "ko" | "en";
  name: string;
  categories: string[];        // 복수 카테고리 슬러그 배열
  price: number;
  originalPrice?: number;
  badge?: string;
  description: string;
  detail?: string;             // 상세 설명 (HTML or 텍스트)
  tags: string[];
  image: string;
  shopUrl?: string;            // 풍림몰 구매 링크
  // 제품 정보 스펙
  volume?: string;             // 용량
  storageMethod?: string;      // 보관방법
  expiryInfo?: string;         // 유통기한
  origin?: string;             // 원산지
  ingredients?: string;        // 성분/원재료
  certifications?: string;     // 인증 (쉼표 구분)
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
  /** 수정 모드: 수정할 제품의 DB id */
  editId?: number;
  /** 수정 모드: 기존 데이터 (미제공 시 등록 모드) */
  initialData?: ProductFormData;
  /** DB에서 로드된 카테고리 목록 */
  dbCategories?: DbCategory[];
}

const EMPTY_FORM: ProductFormData = {
  locale: "ko",
  name: "",
  categories: [],
  price: 0,
  originalPrice: undefined,
  badge: undefined,
  description: "",
  detail: "",
  tags: [],
  image: "",
  shopUrl: "",
  volume: "",
  storageMethod: "",
  expiryInfo: "",
  origin: "",
  ingredients: "",
  certifications: "",
};

export function ProductAddModal({
  open,
  onOpenChange,
  onSubmit,
  editId,
  initialData,
  dbCategories = [],
}: ProductAddModalProps) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<ProductFormData>(initialData ?? EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState(initialData?.tags.join(", ") ?? "");

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm(initialData);
      setTagsInput(initialData.tags.join(", "));
    } else {
      setForm(EMPTY_FORM);
      setTagsInput("");
    }
  }, [open, initialData]);

  const reset = () => {
    setForm(EMPTY_FORM);
    setTagsInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    onSubmit({ ...form, locale: isEditMode ? form.locale : (form.locale ?? "ko"), tags });
    if (!isEditMode) reset();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (!isEditMode) reset();
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
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? "제품 수정" : "새 제품 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {isEditMode ? (
            <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              언어:{" "}
              <span className="font-semibold">
                {form.locale === "en" ? "English (en)" : "한국어 (ko)"}
              </span>
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label>언어 *</Label>
              <div className="flex gap-2">
                {(
                  [
                    { v: "ko" as const, label: "한국어 (ko)" },
                    { v: "en" as const, label: "English (en)" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, locale: opt.v }))}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      (form.locale ?? "ko") === opt.v
                        ? "border-[#204E3A] bg-[#204E3A] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:border-[#204E3A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

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
              placeholder="한 줄 요약 설명 (목록 카드에 표시)"
              rows={3}
              required
            />
          </div>

          {/* 인증 */}
          <div className="space-y-1.5">
            <Label>인증 (쉼표 구분)</Label>
            <Input
              value={form.certifications ?? ""}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              placeholder="예: HACCP 인증, 무항생제, 국산 100%"
            />
          </div>

          {/* 제품 정보 스펙 */}
          <div className="space-y-3 rounded-xl border border-dashed border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700">제품 정보 (상세 페이지 표시)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">용량</Label>
                <Input
                  value={form.volume ?? ""}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  placeholder="예: 1kg, 1L, 12구"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">원산지</Label>
                <Input
                  value={form.origin ?? ""}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  placeholder="예: 국산"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">보관방법</Label>
                <Input
                  value={form.storageMethod ?? ""}
                  onChange={(e) => setForm({ ...form, storageMethod: e.target.value })}
                  placeholder="예: 냉장보관 (0~10℃)"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">유통기한</Label>
                <Input
                  value={form.expiryInfo ?? ""}
                  onChange={(e) => setForm({ ...form, expiryInfo: e.target.value })}
                  placeholder="예: 제조일로부터 14일"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">성분/원재료</Label>
              <Input
                value={form.ingredients ?? ""}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                placeholder="예: 계란 100%"
              />
            </div>
          </div>

          {/* 상세 설명 (HTML) */}
          <div className="space-y-1.5">
            <Label>상세 설명 (선택)</Label>
            <Textarea
              value={form.detail ?? ""}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              placeholder="상세 페이지 하단에 표시되는 긴 설명입니다. HTML 입력 가능."
              rows={4}
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
              {isEditMode ? "수정 완료" : "추가"}
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
