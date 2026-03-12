CREATE TABLE "page_banners" (
	"page_banner_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "page_banners_page_banner_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"page_key" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"image_url" text,
	"link_url" text,
	"link_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "page_banners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "product_categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "shop_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "volume" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "storage_method" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "expiry_info" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "origin" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ingredients" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "certifications" text[] DEFAULT '{}';--> statement-breakpoint
CREATE POLICY "page-banners-anon-select" ON "page_banners" AS PERMISSIVE FOR SELECT TO "anon" USING ("page_banners"."is_active" = true);--> statement-breakpoint
CREATE POLICY "product-categories-anon-select" ON "product_categories" AS PERMISSIVE FOR SELECT TO "anon" USING ("product_categories"."is_active" = true);--> statement-breakpoint
DROP TYPE "public"."product_category";