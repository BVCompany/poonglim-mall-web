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
ALTER TABLE "recipe_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "category" SET DEFAULT 'easy';--> statement-breakpoint
CREATE POLICY "recipe-categories-anon-select" ON "recipe_categories" AS PERMISSIVE FOR SELECT TO "anon" USING ("recipe_categories"."is_active" = true);--> statement-breakpoint
DROP TYPE "public"."recipe_category";