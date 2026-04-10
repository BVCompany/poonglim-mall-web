ALTER TABLE "events" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "contact" text;--> statement-breakpoint
ALTER TABLE "news" ADD COLUMN "view_count" text DEFAULT '0' NOT NULL;