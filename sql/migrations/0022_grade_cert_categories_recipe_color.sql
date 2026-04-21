-- 등급판정서 카테고리 메타 — grade_certificates.cert_type 문자열과 name 일치
CREATE TABLE IF NOT EXISTS "grade_cert_categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "grade_cert_categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"color" text DEFAULT 'sky' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "grade_cert_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "grade_cert_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "grade-cert-categories-anon-select" ON "grade_cert_categories"
  AS PERMISSIVE FOR SELECT TO "anon"
  USING (true);
--> statement-breakpoint
INSERT INTO "grade_cert_categories" ("name", "color", "sort_order") VALUES
  ('액란', 'sky', 0),
  ('포장란', 'emerald', 1),
  ('기타', 'amber', 2)
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
-- cert_type: enum → text (동적 카테고리 이름 저장)
ALTER TABLE "grade_certificates" ALTER COLUMN "cert_type" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "grade_certificates" ALTER COLUMN "cert_type" SET DATA TYPE text USING "cert_type"::text;
--> statement-breakpoint
ALTER TABLE "grade_certificates" ALTER COLUMN "cert_type" SET DEFAULT '포장란';
--> statement-breakpoint
DROP TYPE IF EXISTS "cert_type";
--> statement-breakpoint
-- 레시피 카테고리 뱃지 색상
ALTER TABLE "recipe_categories" ADD COLUMN IF NOT EXISTS "color" text DEFAULT 'sky' NOT NULL;
--> statement-breakpoint
UPDATE "recipe_categories" SET "color" = 'sky' WHERE "slug" = 'easy';
--> statement-breakpoint
UPDATE "recipe_categories" SET "color" = 'rose' WHERE "slug" = 'dessert';
--> statement-breakpoint
UPDATE "recipe_categories" SET "color" = 'emerald' WHERE "slug" = 'restaurant';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "recipe_categories_slug_unique" ON "recipe_categories" ("slug");
