-- 보도자료(뉴스) 카테고리 메타 — news.type 문자열과 name이 일치
CREATE TABLE IF NOT EXISTS "news_categories" (
	"category_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "news_categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"color" text DEFAULT 'sky' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "news_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "news-categories-anon-select" ON "news_categories"
  AS PERMISSIVE FOR SELECT TO "anon"
  USING (true);
--> statement-breakpoint
INSERT INTO "news_categories" ("name", "color", "sort_order") VALUES
  ('보도자료', 'sky', 0),
  ('사회공헌', 'violet', 1),
  ('수상', 'emerald', 2),
  ('신제품', 'amber', 3),
  ('사업확장', 'orange', 4)
ON CONFLICT ("name") DO NOTHING;
