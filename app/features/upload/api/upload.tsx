/**
 * POST /api/upload
 *
 * 파일 업로드 전용 API 라우트 (관리자 전용)
 *
 * Request: multipart/form-data
 *   - file   : 업로드할 파일 (필수)
 *   - bucket : "products" | "media" | "documents" (기본값: "media")
 *   - folder : 버킷 내 하위 폴더 (예: "banners", "products/42")
 *
 * Response: { url, path } | { error }
 */
import { data } from "react-router";
import type { Route } from "./+types/upload";
import { requireAdminAuth } from "~/features/admin/utils/auth.server";
import { uploadFromFormData, type StorageBucket } from "~/core/lib/storage.server";

const ALLOWED_BUCKETS: StorageBucket[] = ["products", "media", "documents"];

const MAX_SIZES: Record<StorageBucket, number> = {
  products: 10 * 1024 * 1024,   // 10 MB
  media: 10 * 1024 * 1024,      // 10 MB
  documents: 50 * 1024 * 1024,  // 50 MB
};

export async function action({ request }: Route.ActionArgs) {
  // 관리자 인증 확인
  await requireAdminAuth(request);

  if (request.method !== "POST") {
    return data({ error: "Method not allowed" }, { status: 405 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return data({ error: "Invalid form data" }, { status: 400 });
  }

  const bucket = (formData.get("bucket") as StorageBucket) ?? "media";
  const folder = (formData.get("folder") as string) ?? "";
  const file = formData.get("file");

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return data({ error: `Invalid bucket: ${bucket}` }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return data({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_SIZES[bucket]) {
    const mb = MAX_SIZES[bucket] / 1024 / 1024;
    return data({ error: `파일 크기는 ${mb}MB 이하여야 합니다.` }, { status: 413 });
  }

  try {
    const result = await uploadFromFormData(formData, bucket, folder);
    return data(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return data({ error: message }, { status: 500 });
  }
}
