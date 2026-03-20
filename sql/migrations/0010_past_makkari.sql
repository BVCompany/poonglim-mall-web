CREATE TYPE "public"."cert_tab" AS ENUM('current', 'archive');--> statement-breakpoint
CREATE TYPE "public"."cert_type" AS ENUM('포장란', '액란', '기타');--> statement-breakpoint
CREATE TABLE "grade_certificates" (
	"cert_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "grade_certificates_cert_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"tab" "cert_tab" DEFAULT 'current' NOT NULL,
	"cert_type" "cert_type" DEFAULT '포장란' NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"author" text DEFAULT '풍림푸드' NOT NULL,
	"file_url" text,
	"file_name" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grade_certificates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "grade-certificates-anon-select" ON "grade_certificates" AS PERMISSIVE FOR SELECT TO "anon" USING ("grade_certificates"."is_active" = true);