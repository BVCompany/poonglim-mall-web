-- 다국어 콘텐츠: translation_group_id + locale (ko | en), 동일 그룹은 같은 UUID

-- news
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "translation_group_id" uuid;
ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "locale" text NOT NULL DEFAULT 'ko';
UPDATE "news" SET "translation_group_id" = gen_random_uuid() WHERE "translation_group_id" IS NULL;
ALTER TABLE "news" ALTER COLUMN "translation_group_id" SET NOT NULL;
ALTER TABLE "news" DROP CONSTRAINT IF EXISTS "news_locale_check";
ALTER TABLE "news" ADD CONSTRAINT "news_locale_check" CHECK ("locale" IN ('ko', 'en'));
DROP INDEX IF EXISTS "news_translation_group_locale";
CREATE UNIQUE INDEX "news_translation_group_locale" ON "news" ("translation_group_id", "locale");

-- notices
ALTER TABLE "notices" ADD COLUMN IF NOT EXISTS "translation_group_id" uuid;
ALTER TABLE "notices" ADD COLUMN IF NOT EXISTS "locale" text NOT NULL DEFAULT 'ko';
UPDATE "notices" SET "translation_group_id" = gen_random_uuid() WHERE "translation_group_id" IS NULL;
ALTER TABLE "notices" ALTER COLUMN "translation_group_id" SET NOT NULL;
ALTER TABLE "notices" DROP CONSTRAINT IF EXISTS "notices_locale_check";
ALTER TABLE "notices" ADD CONSTRAINT "notices_locale_check" CHECK ("locale" IN ('ko', 'en'));
DROP INDEX IF EXISTS "notices_translation_group_locale";
CREATE UNIQUE INDEX "notices_translation_group_locale" ON "notices" ("translation_group_id", "locale");

-- events
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "translation_group_id" uuid;
ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "locale" text NOT NULL DEFAULT 'ko';
UPDATE "events" SET "translation_group_id" = gen_random_uuid() WHERE "translation_group_id" IS NULL;
ALTER TABLE "events" ALTER COLUMN "translation_group_id" SET NOT NULL;
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_locale_check";
ALTER TABLE "events" ADD CONSTRAINT "events_locale_check" CHECK ("locale" IN ('ko', 'en'));
DROP INDEX IF EXISTS "events_translation_group_locale";
CREATE UNIQUE INDEX "events_translation_group_locale" ON "events" ("translation_group_id", "locale");

-- faqs
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "translation_group_id" uuid;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "locale" text NOT NULL DEFAULT 'ko';
UPDATE "faqs" SET "translation_group_id" = gen_random_uuid() WHERE "translation_group_id" IS NULL;
ALTER TABLE "faqs" ALTER COLUMN "translation_group_id" SET NOT NULL;
ALTER TABLE "faqs" DROP CONSTRAINT IF EXISTS "faqs_locale_check";
ALTER TABLE "faqs" ADD CONSTRAINT "faqs_locale_check" CHECK ("locale" IN ('ko', 'en'));
DROP INDEX IF EXISTS "faqs_translation_group_locale";
CREATE UNIQUE INDEX "faqs_translation_group_locale" ON "faqs" ("translation_group_id", "locale");
