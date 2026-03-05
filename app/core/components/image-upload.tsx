/**
 * ImageUpload 컴포넌트
 *
 * 드래그&드롭 또는 클릭으로 이미지를 선택하고,
 * /api/upload 에 업로드한 뒤 URL을 부모에게 전달합니다.
 *
 * 사용 예시:
 *   <ImageUpload
 *     bucket="products"
 *     folder="products/42"
 *     value={imageUrl}
 *     onChange={(url) => setImageUrl(url)}
 *   />
 */
import { useCallback, useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";

interface ImageUploadProps {
  /** 저장할 버킷 */
  bucket?: "products" | "media" | "documents";
  /** 버킷 내 폴더 (예: "banners", "products/42") */
  folder?: string;
  /** 현재 이미지 URL (외부 상태) */
  value?: string;
  /** 업로드 완료 또는 삭제 후 호출 */
  onChange: (url: string) => void;
  /** accept 속성 기본값은 "image/*" */
  accept?: string;
  /** 미리보기 영역 비율 (기본 4/3) */
  aspectRatio?: string;
  className?: string;
  disabled?: boolean;
  /** 힌트 텍스트 */
  hint?: string;
}

type UploadState = "idle" | "uploading" | "error";

export function ImageUpload({
  bucket = "media",
  folder = "",
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif",
  aspectRatio = "4/3",
  className = "",
  disabled = false,
  hint,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setUploadState("uploading");
      setErrorMsg("");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", bucket);
      fd.append("folder", folder);

      try {
        const res = await fetch("/admin/api/upload", {
          method: "POST",
          body: fd,
        });
        const json = (await res.json()) as { url?: string; error?: string };

        if (!res.ok || json.error) {
          throw new Error(json.error ?? "업로드에 실패했습니다.");
        }
        onChange(json.url!);
        setUploadState("idle");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "업로드 오류");
        setUploadState("error");
      }
    },
    [bucket, folder, onChange],
  );

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (!file) return;
      upload(file);
    },
    [upload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      handleFile(e.dataTransfer.files[0]);
    },
    [disabled, handleFile],
  );

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isUploading = uploadState === "uploading";

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        style={{ aspectRatio }}
        className={[
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          isDragOver ? "border-brand-green bg-brand-green/5" : "border-gray-200 bg-gray-50",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-brand-green hover:bg-brand-green/5",
        ].join(" ")}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* 미리보기 */}
        {value && !isUploading ? (
          <>
            <img
              src={value}
              alt="미리보기"
              className="h-full w-full object-cover"
            />
            {/* 삭제 버튼 */}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="absolute right-2 top-2 rounded-lg bg-black/50 p-1.5 text-white transition hover:bg-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-gray-400">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
                <span className="text-sm">업로드 중...</span>
              </>
            ) : (
              <>
                {isDragOver ? (
                  <UploadCloud className="h-8 w-8 text-brand-green" />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
                <div className="text-center text-sm">
                  <span className="font-semibold text-brand-green">파일 선택</span>
                  {" 또는 드래그&드롭"}
                </div>
                {hint && <p className="text-xs">{hint}</p>}
              </>
            )}
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {uploadState === "error" && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
