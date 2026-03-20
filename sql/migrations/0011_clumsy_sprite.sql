ALTER TABLE "contacts" ADD COLUMN "inquiry_type" text DEFAULT '기타' NOT NULL;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "contacts" ADD COLUMN "lookup_password" text DEFAULT '' NOT NULL;