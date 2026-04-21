/**
 * GradeCertAddModal — 등급판정서 추가/수정 모달 (파일 업로드 포함)
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Paperclip, UploadCloud, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Textarea } from "~/core/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import { cn } from "~/core/lib/utils";

export interface GradeCertFormData {
  tab: "current" | "archive";
  cert_type: string;
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
  /** 목록에서 선택한 메인 탭 — 신규 등록 시 `tab` 초기값 */
  listTabForCreate?: "current" | "archive";
  /** DB·폴백 순서의 등급판정서 카테고리 이름 */
  certTypeOptions: string[];
}

const EMPTY = (tab: "current" | "archive", defaultCertType: string): GradeCertFormData => ({
  tab,
  cert_type: defaultCertType,
  title: "",
  content: "",
  author: "풍림푸드",
  file_url: "",
  file_name: "",
});

const DOC_KINDS = ["등급판정서", "안전검사결과"] as const;

const UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

export function GradeCertAddModal({
  open,
  onOpenChange,
  onSubmit,
  editId,
  initialData,
  listTabForCreate = "current",
  certTypeOptions,
}: Props) {
  const isEditMode = editId !== undefined;
  const defaultCertType = certTypeOptions[0] ?? "포장란";
  const [form, setForm] = useState<GradeCertFormData>(EMPTY(listTabForCreate, defaultCertType));
  const [docKind, setDocKind] = useState<(typeof DOC_KINDS)[number]>("등급판정서");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setUploadError(null);
    setDrag(false);
    if (isEditMode && initialData) {
      setForm(initialData);
      setDocKind("등급판정서");
    } else {
      setForm(EMPTY(listTabForCreate, certTypeOptions[0] ?? "포장란"));
      setDocKind("등급판정서");
    }
  }, [open, isEditMode, initialData, listTabForCreate, certTypeOptions]);

  const set = <K extends keyof GradeCertFormData>(key: K, value: GradeCertFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const certSelectOptions = useMemo(() => {
    const s = new Set(certTypeOptions);
    if (form.cert_type && !s.has(form.cert_type)) {
      return [...certTypeOptions, form.cert_type];
    }
    return certTypeOptions;
  }, [certTypeOptions, form.cert_type]);

  const uploadFile = useCallback(async (file: File) => {
    if (file.size > UPLOAD_MAX_BYTES) {
      setUploadError("파일 크기는 최대 10MB까지 업로드할 수 있습니다.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "documents");
      fd.append("folder", "grade-certificates");
      const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "업로드에 실패했습니다.");
      setForm((prev) => ({
        ...prev,
        file_url: json.url ?? "",
        file_name: file.name,
      }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "업로드 오류");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const onPick = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void uploadFile(f);
  };

  const clearFile = () => setForm((prev) => ({ ...prev, file_url: "", file_name: "" }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-lg max-h-[90vh] overflow-y-auto sm:!max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {isEditMode ? "등급판정서 수정" : "등급판정서 추가"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <Label htmlFor="cert-title" className="mb-1.5 block text-sm font-medium text-gray-700">
              제목 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cert-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="예: 02/25 등급판정서 (액란용)"
              required
              className="border-gray-200"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700">
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={
                certSelectOptions.includes(form.cert_type)
                  ? form.cert_type
                  : (certSelectOptions[0] ?? form.cert_type)
              }
              onValueChange={(v) => set("cert_type", v)}
            >
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {certSelectOptions.map((ct) => (
                  <SelectItem key={ct} value={ct}>
                    {ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700">구분</Label>
            <Select value={docKind} onValueChange={(v) => setDocKind(v as (typeof DOC_KINDS)[number])}>
              <SelectTrigger className="border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cert-content" className="mb-1.5 block text-sm font-medium text-gray-700">
              내용
            </Label>
            <Textarea
              id="cert-content"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="등급판정서 관련 안내 내용을 입력하세요"
              rows={5}
              className="resize-y border-gray-200"
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-sm font-medium text-gray-700">첨부파일</Label>
            {form.file_name ? (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#02633E]/40 bg-[#02633E]/5 px-4 py-3">
                <Paperclip className="h-4 w-4 shrink-0 text-[#02633E]" />
                <span className="flex-1 truncate text-sm text-gray-800">{form.file_name}</span>
                <button
                  type="button"
                  onClick={clearFile}
                  className="rounded-full p-1 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div
                  className={cn(
                    "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors",
                    drag ? "border-[#02633E] bg-[#02633E]/5" : "border-gray-200 bg-gray-50",
                    uploading ? "pointer-events-none opacity-60" : "hover:border-[#02633E]/40",
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDrag(true);
                  }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDrag(false);
                    if (!uploading) onPick(e.dataTransfer.files);
                  }}
                  onClick={() => {
                    if (!uploading) fileInputRef.current?.click();
                  }}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-[#02633E]" />
                      <span className="text-sm text-gray-600">업로드 중...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-gray-400" />
                      <p className="text-center text-sm font-medium text-gray-700">
                        클릭하여 파일 업로드 또는 파일을 여기로 드래그하세요
                      </p>
                      <p className="text-center text-xs text-gray-500">
                        PDF, JPG, PNG · 최대 10MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={UPLOAD_ACCEPT}
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => onPick(e.target.files)}
                />
                {uploadError ? <p className="text-xs text-red-500">{uploadError}</p> : null}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-[#02633E] text-white hover:bg-[#014d30]"
            >
              {isEditMode ? "저장" : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
