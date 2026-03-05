/**
 * Supabase Storage 유틸리티 (서버 전용)
 *
 * 버킷 구성:
 *   products  - 제품 이미지 (image/*)
 *   media     - 배너 / 이벤트 / 뉴스 / 레시피 / 팝업 이미지 (image/*)
 *   documents - 카탈로그 PDF (application/pdf)
 */
import { getSupabaseAdmin } from "./supabase.server";

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────

export type StorageBucket = "products" | "media" | "documents";

export interface UploadResult {
  url: string;   // 공개 URL
  path: string;  // Storage 내 경로 (삭제 시 사용)
}

// ─────────────────────────────────────────────────────────────
// 내부 헬퍼
// ─────────────────────────────────────────────────────────────

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "bin";
}

function makeFilename(originalName: string) {
  const ext = getExtension(originalName);
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${timestamp}_${rand}.${ext}`;
}

// ─────────────────────────────────────────────────────────────
// 업로드
// ─────────────────────────────────────────────────────────────

/**
 * Buffer / Blob / File 을 Supabase Storage에 업로드합니다.
 *
 * @param bucket  - 대상 버킷
 * @param folder  - 버킷 내 폴더 (예: "banners", "products/42")
 * @param file    - 업로드할 파일 (File | Blob | ArrayBuffer)
 * @param originalName - 원본 파일명 (확장자 추출용)
 * @param contentType  - MIME 타입 (예: "image/webp", "application/pdf")
 */
export async function uploadFile(
  bucket: StorageBucket,
  folder: string,
  file: File | Blob | ArrayBuffer,
  originalName: string,
  contentType: string,
): Promise<UploadResult> {
  const supabase = getSupabaseAdmin();
  const filename = makeFilename(originalName);
  const path = folder ? `${folder}/${filename}` : filename;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/**
 * 웹 Request의 FormData에서 파일을 읽어 업로드합니다.
 * multipart/form-data로 전송된 `file` 필드를 처리합니다.
 */
export async function uploadFromFormData(
  formData: FormData,
  bucket: StorageBucket,
  folder: string,
  fieldName = "file",
): Promise<UploadResult> {
  const file = formData.get(fieldName);

  if (!(file instanceof File)) {
    throw new Error(`Form field "${fieldName}" is not a File`);
  }

  const buffer = await file.arrayBuffer();
  return uploadFile(bucket, folder, buffer, file.name, file.type);
}

// ─────────────────────────────────────────────────────────────
// 삭제
// ─────────────────────────────────────────────────────────────

/**
 * Storage에서 파일을 삭제합니다.
 * path는 uploadFile 반환값의 path 필드를 사용하세요.
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

// ─────────────────────────────────────────────────────────────
// URL 생성
// ─────────────────────────────────────────────────────────────

/** 이미 업로드된 파일의 공개 URL을 반환합니다. */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Supabase Image Transformation API를 통한 리사이즈 URL 생성.
 * (Supabase Pro 플랜 이상에서 지원)
 */
export function getTransformedUrl(
  bucket: StorageBucket,
  path: string,
  options: { width?: number; height?: number; quality?: number } = {},
): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: options.width,
      height: options.height,
      quality: options.quality ?? 80,
    },
  });
  return data.publicUrl;
}
