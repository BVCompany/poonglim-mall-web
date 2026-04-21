/**
 * 여러 장 이미지 업로드 — 보도자료 본문 통이미지 등
 */
import { useCallback, useRef, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";

import { cn } from "~/core/lib/utils";

type UploadState = "idle" | "uploading" | "error";

interface MultiImageUploadProps {
  bucket?: "products" | "media" | "documents";
  folder?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  /** 드롭존 최소 높이 */
  minHeightClassName?: string;
  /** 메인 힌트 (시안 문구) */
  hint?: string;
  /** 보조 설명 */
  description?: string;
}

export function MultiImageUpload({
  bucket = "media",
  folder = "",
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  className = "",
  disabled = false,
  minHeightClassName = "min-h-[200px]",
  hint = "클릭하여 이미지 업로드 또는 파일을 여기로 드래그하세요. PNG, JPG, GIF (최대 10MB)",
  description,
}: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadOne = useCallback(
    async (file: File): Promise<string> => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      fd.append("folder", folder);

      const res = await fetch("/admin/api/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "업로드에 실패했습니다.");
      }
      return json.url!;
    },
    [bucket, folder],
  );

  const handleFiles = useCallback(
    async (files: FileList | File[] | null | undefined) => {
      if (!files?.length || disabled) return;
      const list = Array.from(files as FileList);
      setUploadState("uploading");
      setErrorMsg("");
      let accumulated = [...value];
      try {
        for (const file of list) {
          const url = await uploadOne(file);
          accumulated = [...accumulated, url];
          onChange(accumulated);
        }
        setUploadState("idle");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "업로드 오류");
        setUploadState("error");
      }
    },
    [disabled, onChange, uploadOne, value],
  );

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    if (inputRef.current) inputRef.current.value = "";
  };

  const isUploading = uploadState === "uploading";

  return (
    <div className={cn("space-y-3", className)}>
      {description ? <p className="text-xs text-gray-500">{description}</p> : null}

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          minHeightClassName,
          isDragOver ? "border-[#02633E] bg-[#02633E]/5" : "border-gray-200 bg-gray-50",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-[#02633E]/60",
        )}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (disabled || isUploading) return;
          void handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex h-full min-h-[inherit] flex-col items-center justify-center gap-2 p-6 text-gray-400">
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#02633E]" />
              <span className="text-sm text-gray-600">업로드 중...</span>
            </>
          ) : (
            <>
              {isDragOver ? (
                <UploadCloud className="h-8 w-8 text-[#02633E]" />
              ) : (
                <UploadCloud className="h-8 w-8" />
              )}
              <p className="text-center text-sm text-gray-600">{hint}</p>
            </>
          )}
        </div>
      </div>

      {uploadState === "error" && errorMsg ? (
        <p className="text-xs text-red-500">{errorMsg}</p>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {value.map((url, i) => (
            <li key={`${url}-${i}`} className="relative aspect-video overflow-hidden rounded-lg border bg-white">
              <img src={url} alt="" className="size-full object-cover" />
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(i);
                  }}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/55 p-1 text-white transition hover:bg-red-600"
                  aria-label={`이미지 ${i + 1} 삭제`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />
    </div>
  );
}
