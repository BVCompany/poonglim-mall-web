/**
 * GradeCertAddModal — 등급판정서 추가/수정 모달 (파일 업로드 포함)
 */
import { useEffect, useRef, useState } from "react";
import { Paperclip, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export interface GradeCertFormData {
  tab: "current" | "archive";
  cert_type: "포장란" | "액란" | "기타";
  title: string;
  content: string;
  author: string;
  file_url: string;
  file_name: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GradeCertFormData) => void;
  editId?: number;
  initialData?: GradeCertFormData;
}

const EMPTY: GradeCertFormData = {
  tab: "current",
  cert_type: "포장란",
  title: "",
  content: "",
  author: "풍림푸드",
  file_url: "",
  file_name: "",
};

const CERT_TYPES: GradeCertFormData["cert_type"][] = ["포장란", "액란", "기타"];

export function GradeCertAddModal({ open, onOpenChange, onSubmit, editId, initialData }: Props) {
  const isEditMode = editId !== undefined;
  const [form, setForm] = useState<GradeCertFormData>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(isEditMode && initialData ? initialData : EMPTY);
      setUploadError(null);
    }
  }, [open, isEditMode, initialData]);

  const set = <K extends keyof GradeCertFormData>(key: K, value: GradeCertFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "documents");
      fd.append("folder", "grade-certificates");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json() as { url?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "업로드 실패");
      setForm((prev) => ({ ...prev, file_url: json.url ?? "", file_name: file.name }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearFile = () => setForm((prev) => ({ ...prev, file_url: "", file_name: "" }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "등급판정서 수정" : "새 등급판정서 등록"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* 탭 구분 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">탭 구분</Label>
            <div className="flex gap-2">
              {(["current", "archive"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => set("tab", tab)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    form.tab === tab
                      ? { backgroundColor: "#003F2B", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B", border: "1px solid #C5BFA8" }
                  }
                >
                  {tab === "current" ? "등급판정서" : "등급판정서 (2022.11 이전)"}
                </button>
              ))}
            </div>
          </div>

          {/* 종류 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">종류</Label>
            <div className="flex gap-2">
              {CERT_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => set("cert_type", ct)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
                  style={
                    form.cert_type === ct
                      ? { backgroundColor: "#003F2B", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B", border: "1px solid #C5BFA8" }
                  }
                >
                  {ct}
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
              placeholder="예: 02/25 등급판정서 (액란용)"
              required
            />
          </div>

          {/* 본문 */}
          <div>
            <Label htmlFor="cert-content" className="mb-1.5 block text-sm font-medium">
              본문 내용
            </Label>
            <textarea
              id="cert-content"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="등급판정서 내용을 입력하세요."
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#003F2B] focus:ring-1 focus:ring-[#003F2B]"
            />
          </div>

          {/* 작성자 */}
          <div>
            <Label htmlFor="cert-author" className="mb-1.5 block text-sm font-medium">
              작성자
            </Label>
            <Input
              id="cert-author"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="풍림푸드"
            />
          </div>

          {/* 파일 첨부 */}
          <div>
            <Label className="mb-1.5 block text-sm font-medium">
              파일 첨부 <span className="ml-1 text-xs font-normal text-gray-400">(PDF, Excel, HWP 등 최대 50MB)</span>
            </Label>
            {form.file_name ? (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-[#003F2B] bg-[#EAE3C9] px-4 py-3">
                <Paperclip className="h-4 w-4 shrink-0 text-[#003F2B]" />
                <span className="flex-1 truncate text-sm text-[#003F2B]">{form.file_name}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.xlsx,.xls,.hwp,.hwpx,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cert-file-input"
                />
                <label
                  htmlFor="cert-file-input"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition-colors hover:border-[#003F2B] hover:bg-[#EAE3C9] hover:text-[#003F2B]"
                >
                  {uploading ? (
                    <span className="animate-pulse">업로드 중...</span>
                  ) : (
                    <>
                      <Paperclip className="h-4 w-4" />
                      클릭하여 파일 선택
                    </>
                  )}
                </label>
                {uploadError && (
                  <p className="mt-1 text-xs text-red-500">{uploadError}</p>
                )}
              </div>
            )}
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
