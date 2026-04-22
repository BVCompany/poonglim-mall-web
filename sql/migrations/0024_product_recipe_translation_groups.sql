-- 제품·레시피 다국어: translation_group_id + locale (ko | en)

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "translation_group_id" uuid;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'ko';

UPDATE "products" SET "translation_group_id" = gen_random_uuid() WHERE "translation_group_id" IS NULL;
UPDATE "products" SET "locale" = 'ko' WHERE "locale" IS NULL;

ALTER TABLE "products" ALTER COLUMN "translation_group_id" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "locale" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "locale" SET DEFAULT 'ko';

CREATE UNIQUE INDEX IF NOT EXISTS "products_translation_group_locale" ON "products" ("translation_group_id", "locale");

ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "translation_group_id" uuid;
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "locale" text DEFAULT 'ko';

UPDATE "recipes" SET "translation_group_id" = gen_random_uuid() WHERE "translation_group_id" IS NULL;
UPDATE "recipes" SET "locale" = 'ko' WHERE "locale" IS NULL;

ALTER TABLE "recipes" ALTER COLUMN "translation_group_id" SET NOT NULL;
ALTER TABLE "recipes" ALTER COLUMN "locale" SET NOT NULL;
ALTER TABLE "recipes" ALTER COLUMN "locale" SET DEFAULT 'ko';

CREATE UNIQUE INDEX IF NOT EXISTS "recipes_translation_group_locale" ON "recipes" ("translation_group_id", "locale");
