CREATE TYPE "public"."cert_item_type" AS ENUM('award', 'cert');--> statement-breakpoint
CREATE TABLE "brand_cert_items" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "brand_cert_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "cert_item_type" DEFAULT 'cert' NOT NULL,
	"title" text NOT NULL,
	"year" text,
	"description" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
