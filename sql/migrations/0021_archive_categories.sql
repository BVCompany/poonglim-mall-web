-- 자료실 카테고리 메타 — library_resources.category 문자열과 name이 일치
CREATE TABLE IF NOT EXISTS "archive_categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "archive_categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"color" text DEFAULT 'sky' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "archive_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "archive_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "archive-categories-anon-select" ON "archive_categories"
  AS PERMISSIVE FOR SELECT TO "anon"
  USING (true);
--> statement-breakpoint
INSERT INTO "archive_categories" ("name", "color", "sort_order") VALUES
  ('카탈로그', 'sky', 0),
  ('회사소개', 'violet', 1),
  ('인증서', 'emerald', 2),
  ('기타', 'amber', 3)
ON CONFLICT ("name") DO NOTHING;
