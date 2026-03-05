ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "factory_tour_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_applications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "job_postings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "banners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "popups" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "inquiries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "catalogs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "news" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "recipes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "faqs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "admins-anon-no-select" ON "admins" AS RESTRICTIVE FOR SELECT TO "anon";--> statement-breakpoint
CREATE POLICY "admins-authenticated-no-select" ON "admins" AS RESTRICTIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "factory-tour-anon-insert" ON "factory_tour_applications" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "factory-tour-anon-no-select" ON "factory_tour_applications" AS RESTRICTIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "job-applications-anon-insert" ON "job_applications" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "job-applications-anon-no-select" ON "job_applications" AS RESTRICTIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "job-postings-anon-select" ON "job_postings" AS PERMISSIVE FOR SELECT TO "anon" USING ("job_postings"."status" = 'open' AND "job_postings"."is_active" = true);--> statement-breakpoint
CREATE POLICY "events-anon-select" ON "events" AS PERMISSIVE FOR SELECT TO "anon" USING ("events"."is_active" = true);--> statement-breakpoint
CREATE POLICY "banners-anon-select" ON "banners" AS PERMISSIVE FOR SELECT TO "anon" USING (
        "banners"."is_active" = true
        AND ("banners"."started_at" IS NULL OR "banners"."started_at" <= now())
        AND ("banners"."ended_at" IS NULL OR "banners"."ended_at" >= now())
      );--> statement-breakpoint
CREATE POLICY "popups-anon-select" ON "popups" AS PERMISSIVE FOR SELECT TO "anon" USING (
        "popups"."is_active" = true
        AND ("popups"."started_at" IS NULL OR "popups"."started_at" <= now())
        AND ("popups"."ended_at" IS NULL OR "popups"."ended_at" >= now())
      );--> statement-breakpoint
CREATE POLICY "inquiries-anon-insert" ON "inquiries" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "inquiries-anon-no-select" ON "inquiries" AS RESTRICTIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "catalogs-anon-select" ON "catalogs" AS PERMISSIVE FOR SELECT TO "anon" USING ("catalogs"."is_active" = true);--> statement-breakpoint
CREATE POLICY "news-anon-select" ON "news" AS PERMISSIVE FOR SELECT TO "anon" USING ("news"."is_active" = true);--> statement-breakpoint
CREATE POLICY "products-anon-select" ON "products" AS PERMISSIVE FOR SELECT TO "anon" USING ("products"."is_active" = true);--> statement-breakpoint
CREATE POLICY "recipes-anon-select" ON "recipes" AS PERMISSIVE FOR SELECT TO "anon" USING ("recipes"."is_active" = true);--> statement-breakpoint
CREATE POLICY "contacts-anon-insert" ON "contacts" AS PERMISSIVE FOR INSERT TO "anon" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "contacts-anon-no-select" ON "contacts" AS RESTRICTIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "faqs-anon-select" ON "faqs" AS PERMISSIVE FOR SELECT TO "anon" USING ("faqs"."is_active" = true);