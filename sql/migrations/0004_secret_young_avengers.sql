CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "site-settings-anon-select" ON "site_settings" AS PERMISSIVE FOR SELECT TO "anon" USING (true);--> statement-breakpoint
ALTER POLICY "admins-anon-no-select" ON "admins" TO anon USING (false);--> statement-breakpoint
ALTER POLICY "admins-authenticated-no-select" ON "admins" TO authenticated USING (false);