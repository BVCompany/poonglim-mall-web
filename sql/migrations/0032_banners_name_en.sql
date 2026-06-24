-- 메인 배너·페이지 배너 영문 텍스트 컬럼 추가 (선택 입력, 영문 사이트 노출용)
ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "title_en" text;
ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "subtitle_en" text;
ALTER TABLE "banners" ADD COLUMN IF NOT EXISTS "button_text_en" text;

ALTER TABLE "page_banners" ADD COLUMN IF NOT EXISTS "title_en" text;
ALTER TABLE "page_banners" ADD COLUMN IF NOT EXISTS "subtitle_en" text;
ALTER TABLE "page_banners" ADD COLUMN IF NOT EXISTS "link_text_en" text;
