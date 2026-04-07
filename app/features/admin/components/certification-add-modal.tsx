/**
 * CertificationAddModal — 수상내역/인증서 추가·수정 모달 (이미지 업로드 포함)
 */
import { useEffect, useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export interface CertFormData {
  type: "award" | "cert";
  title: string;
  year: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CertFormData) => void;
  editId?: number;
  initialData?: CertFormData;
}

const EMPTY: CertFormData = {
  type: "cert",
  title: "",
  year: "",
  description: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

export function CertificationAddModal({ open, onOpenChange, onSubmit, editId, initialData }: Props) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<CertFormData>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const data = isEditMode && initialData ? initialData : EMPTY;
      setForm(data);
      setPreview(data.image_url);
      setUploadError(null);
    }
  }, [open, isEditMode, initialData]);

  const set = <K extends keyof CertFormData>(key: K, value: CertFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "media");
      fd.append("folder", "certifications");
      const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "업로드 실패");
      const url = json.url ?? "";
      setForm((prev) => ({ ...prev, image_url: url }));
      setPreview(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image_url: "" }));
    setPreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "수정" : "새 항목 등록"} —{" "}
            {form.type === "award" ? "수상내역" : "인증서"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* 타입 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">종류</Label>
            <div className="flex gap-2">
              {(["award", "cert"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("type", t)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    form.type === t
                      ? { backgroundColor: "#003F2B", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B", border: "1px solid #C5BFA8" }
                  }
                >
                  {t === "award" ? "수상내역" : "인증서"}
                </button>
              ))}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <Label htmlFor="cert-title" className="mb-1.5 block text-sm font-medium">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cert-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="예: 충북지방 중소벤처기업청 표창장"
              required
            />
          </div>

          {/* 연도 (수상내역용) */}
          {form.type === "award" && (
            <div>
              <Label htmlFor="cert-year" className="mb-1.5 block text-sm font-medium">
                수상 연도
              </Label>
              <Input
                id="cert-year"
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                placeholder="예: 2017"
              />
            </div>
          )}

          {/* 설명 (수상내역용) */}
          {form.type === "award" && (
            <div>
              <Label htmlFor="cert-desc" className="mb-1.5 block text-sm font-medium">
                설명
              </Label>
              <textarea
                id="cert-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="수상 내용을 간략히 설명해주세요."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#003F2B] focus:ring-1 focus:ring-[#003F2B]"
              />
            </div>
          )}

          {/* 이미지 업로드 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              이미지{" "}
              <span className="ml-1 text-xs font-normal text-gray-400">(JPG, PNG, WEBP 등)</span>
            </Label>

            {preview ? (
              <div className="relative overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={preview}
                  alt="미리보기"
                  className="h-40 w-full object-contain bg-gray-50"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-gray-500 shadow transition-colors hover:bg-white hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cert-image-input"
                />
                <label
                  htmlFor="cert-image-input"
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-8 text-sm text-gray-500 transition-colors hover:border-[#003F2B] hover:bg-[#F5F2EB] hover:text-[#003F2B]"
                >
                  {uploading ? (
                    <span className="animate-pulse">업로드 중...</span>
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 text-gray-300" />
                      클릭하여 이미지 선택
                    </>
                  )}
                </label>
                {uploadError && (
                  <p className="mt-1 text-xs text-red-500">{uploadError}</p>
                )}
              </div>
            )}
          </div>

          {/* 정렬 순서 */}
          <div>
            <Label htmlFor="cert-sort" className="mb-1.5 block text-sm font-medium">
              정렬 순서 <span className="text-xs font-normal text-gray-400">(숫자가 작을수록 먼저 표시)</span>
            </Label>
            <Input
              id="cert-sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
              className="w-24"
            />
          </div>

          {/* 공개 여부 */}
          <div className="flex items-center gap-3">
            <input
              id="cert-active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#003F2B]"
            />
            <Label htmlFor="cert-active" className="text-sm font-medium cursor-pointer">
              공개
            </Label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-[#204E3A] text-white hover:bg-[#204E3A]/90"
            >
              {isEditMode ? "수정 완료" : "등록"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
