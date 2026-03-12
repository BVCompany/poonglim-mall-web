-- recipe_categories 테이블 생성
CREATE TABLE "recipe_categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recipe_categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- recipes.category: enum → text 변환
ALTER TABLE "recipes" ALTER COLUMN "category" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "category" SET DATA TYPE text
  USING "category"::text;
--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "category" SET DEFAULT 'easy';
--> statement-breakpoint

-- RLS 정책
CREATE POLICY "recipe-categories-anon-select" ON "recipe_categories"
  AS PERMISSIVE FOR SELECT TO "anon"
  USING ("recipe_categories"."is_active" = true);
--> statement-breakpoint

-- 기존 enum 타입 제거
DROP TYPE IF EXISTS "public"."recipe_category";
--> statement-breakpoint

-- 기본 카테고리 데이터 삽입
INSERT INTO "recipe_categories" ("name", "slug", "sort_order", "is_active") VALUES
  ('가정용',          'easy',       0, true),
  ('카페 & 베이커리', 'dessert',    1, true),
  ('외식업체',        'restaurant', 2, true);
