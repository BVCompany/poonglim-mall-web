-- Migration: recipes.cooking_time, servings integer → text
-- 범위 표현 지원 ("15~20분", "2~3인분" 등)

-- cooking_time: 기존 정수값을 "N분" 형식 텍스트로 변환
ALTER TABLE "recipes"
  ALTER COLUMN "cooking_time" DROP DEFAULT;

ALTER TABLE "recipes"
  ALTER COLUMN "cooking_time"
  SET DATA TYPE text
  USING CASE
    WHEN "cooking_time" IS NULL THEN NULL
    ELSE "cooking_time"::text || '분'
  END;

-- servings: 기존 정수값을 "N인분" 형식 텍스트로 변환
ALTER TABLE "recipes"
  ALTER COLUMN "servings" DROP DEFAULT;

ALTER TABLE "recipes"
  ALTER COLUMN "servings"
  SET DATA TYPE text
  USING CASE
    WHEN "servings" IS NULL THEN NULL
    ELSE "servings"::text || '인분'
  END;
