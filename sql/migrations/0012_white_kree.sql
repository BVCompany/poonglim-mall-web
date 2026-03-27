ALTER TABLE "news" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "news" ALTER COLUMN "type" SET DEFAULT '보도자료';--> statement-breakpoint
DROP TYPE "public"."news_type";