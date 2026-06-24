-- 레시피/뉴스/등급판정서/자료실 카테고리 영문 표시명 컬럼 추가 (선택 입력, 영문 사이트 노출용)
ALTER TABLE "recipe_categories" ADD COLUMN IF NOT EXISTS "name_en" text;
ALTER TABLE "news_categories" ADD COLUMN IF NOT EXISTS "name_en" text;
ALTER TABLE "grade_cert_categories" ADD COLUMN IF NOT EXISTS "name_en" text;
ALTER TABLE "archive_categories" ADD COLUMN IF NOT EXISTS "name_en" text;
