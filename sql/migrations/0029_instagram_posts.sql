-- 인스타그램 섹션 직접 등록 이미지 테이블
-- 메타(인스타) 연동을 대비한 섹션이지만, 연동 전에는 관리자가 직접 올린 이미지를 노출

CREATE TABLE IF NOT EXISTS "instagram_posts" (
  "instagram_post_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "image_url" text NOT NULL,
  "link_url" text,
  "caption" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE "instagram_posts" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

DROP POLICY IF EXISTS "instagram-posts-anon-select" ON "instagram_posts";
--> statement-breakpoint

CREATE POLICY "instagram-posts-anon-select" ON "instagram_posts"
  AS PERMISSIVE FOR SELECT TO "anon"
  USING ("instagram_posts"."is_active" = true);
