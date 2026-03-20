CREATE TYPE "public"."notice_category" AS ENUM('공지', '안내', '이벤트');--> statement-breakpoint
CREATE TABLE "notices" (
	"notice_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notices_notice_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"category" "notice_category" DEFAULT '안내' NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"author" text DEFAULT '풍림푸드' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "notices-anon-select" ON "notices" AS PERMISSIVE FOR SELECT TO "anon" USING ("notices"."is_active" = true);