CREATE TABLE "library_resources" (
	"resource_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "library_resources_resource_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"category" text NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"author" text DEFAULT '풍림푸드' NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size_label" text,
	"file_ext" text DEFAULT 'PDF',
	"view_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_resources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "library-resources-anon-select" ON "library_resources" AS PERMISSIVE FOR SELECT TO "anon" USING ("library_resources"."is_active" = true);