-- category: text → text[] 변환
-- 1. 기존 default 제거 (타입 변환 전 필수)
ALTER TABLE "products" ALTER COLUMN "category" DROP DEFAULT;
-- 2. 타입 변환: 기존 단일 텍스트 값을 배열로, 빈 문자열은 빈 배열로
ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE text[]
  USING CASE
    WHEN "category" IS NULL OR "category" = '' THEN '{}'::text[]
    ELSE ARRAY["category"]
  END;
-- 3. 새 default 설정
ALTER TABLE "products" ALTER COLUMN "category" SET DEFAULT '{}';
