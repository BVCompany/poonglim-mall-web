-- 제품 카테고리 영문 표시명 컬럼 추가 (선택 입력, 영문 사이트 노출용)
ALTER TABLE "product_categories" ADD COLUMN IF NOT EXISTS "name_en" text;
