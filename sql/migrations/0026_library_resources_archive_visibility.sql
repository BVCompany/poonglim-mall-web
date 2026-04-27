-- 자료실: 목록 썸네일, 게시 일시(예약/소급), 카테고리 사이트 노출

ALTER TABLE "archive_categories"
  ADD COLUMN IF NOT EXISTS "is_visible_on_site" boolean NOT NULL DEFAULT true;

ALTER TABLE "library_resources"
  ADD COLUMN IF NOT EXISTS "cover_image_url" text;

ALTER TABLE "library_resources"
  ADD COLUMN IF NOT EXISTS "published_at" timestamp;

UPDATE "library_resources"
SET "published_at" = "created_at"
WHERE "published_at" IS NULL;

ALTER TABLE "library_resources"
  ALTER COLUMN "published_at" SET NOT NULL;

ALTER TABLE "library_resources"
  ALTER COLUMN "published_at" SET DEFAULT now();

DROP POLICY IF EXISTS "library-resources-anon-select" ON "library_resources";
CREATE POLICY "library-resources-anon-select" ON "library_resources" AS PERMISSIVE FOR SELECT TO "anon" USING (
  "library_resources"."is_active" = true
  AND "library_resources"."published_at" <= now()
);
