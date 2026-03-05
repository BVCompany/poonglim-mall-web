CREATE TYPE "public"."admin_role" AS ENUM('super', 'admin');--> statement-breakpoint
CREATE TYPE "public"."factory_tour_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('submitted', 'reviewing', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('entry', 'experienced', 'senior', 'all');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('open', 'closed', 'draft');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full_time', 'part_time', 'contract', 'intern');--> statement-breakpoint
CREATE TYPE "public"."event_badge" AS ENUM('hot', 'new', 'ending_soon', 'important');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('event', 'notice');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."inquiry_type" AS ENUM('b2b', 'bulk', 'franchise', 'export', 'general');--> statement-breakpoint
CREATE TYPE "public"."news_type" AS ENUM('news', 'press', 'announcement');--> statement-breakpoint
CREATE TYPE "public"."product_badge" AS ENUM('best', 'new', 'b2b', 'sale');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('liquid_egg', 'pudding', 'convenience', 'b2b');--> statement-breakpoint
CREATE TYPE "public"."recipe_category" AS ENUM('easy', 'dessert', 'restaurant');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."faq_category" AS ENUM('product', 'delivery', 'b2b', 'quality', 'general');--> statement-breakpoint
CREATE TABLE "admins" (
	"admin_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admins_admin_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "admin_role" DEFAULT 'admin' NOT NULL,
	"permissions" text[] DEFAULT '{}' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "factory_tour_applications" (
	"tour_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "factory_tour_applications_tour_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"applicant_name" text NOT NULL,
	"organization" text,
	"phone" text NOT NULL,
	"email" text,
	"participants" integer NOT NULL,
	"purpose" text NOT NULL,
	"requested_date" timestamp NOT NULL,
	"message" text,
	"status" "factory_tour_status" DEFAULT 'pending' NOT NULL,
	"admin_memo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"application_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_applications_application_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"job_id" integer NOT NULL,
	"applicant_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"birth_date" text,
	"address" text,
	"cover_letter" text,
	"resume_url" text,
	"portfolio_url" text,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"admin_memo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"job_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "job_postings_job_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"department" text NOT NULL,
	"location" text NOT NULL,
	"job_type" "job_type" NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"description" text NOT NULL,
	"requirements" text,
	"benefits" text,
	"headcount" integer DEFAULT 1,
	"status" "job_status" DEFAULT 'draft' NOT NULL,
	"deadline" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"event_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "event_type" DEFAULT 'event' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"thumbnail_url" text,
	"badge" "event_badge",
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"view_count" text DEFAULT '0',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"banner_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "banners_banner_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"subtitle" text,
	"image_url" text NOT NULL,
	"image_mobile_url" text,
	"link_url" text,
	"button_text" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "popups" (
	"popup_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "popups_popup_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"image_url" text,
	"content" text,
	"link_url" text,
	"width" integer DEFAULT 400,
	"height" integer DEFAULT 500,
	"is_active" boolean DEFAULT true NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"inquiry_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "inquiries_inquiry_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "inquiry_type" NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" "inquiry_status" DEFAULT 'pending' NOT NULL,
	"admin_memo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catalogs" (
	"catalog_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "catalogs_catalog_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"file_size" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"news_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "news_news_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "news_type" DEFAULT 'news' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"summary" text,
	"thumbnail_url" text,
	"source" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"published_at" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"detail" text,
	"category" "product_category" NOT NULL,
	"badge" "product_badge",
	"image_url" text,
	"image_urls" text[] DEFAULT '{}',
	"price" integer,
	"original_price" integer,
	"is_b2b" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"tags" text[] DEFAULT '{}',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"recipe_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recipes_recipe_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"category" "recipe_category" NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"image_urls" text[] DEFAULT '{}',
	"cooking_time" integer,
	"servings" integer,
	"difficulty" text,
	"ingredients" text,
	"steps" text,
	"nutrition" text,
	"tips" text,
	"tags" text[] DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"contact_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contacts_contact_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"status" "contact_status" DEFAULT 'pending' NOT NULL,
	"admin_memo" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"faq_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "faqs_faq_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"category" "faq_category" NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_job_postings_job_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;