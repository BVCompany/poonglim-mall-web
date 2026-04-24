-- 메인 팝업 노출 순서 (낮을수록 먼저)

ALTER TABLE "popups" ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0;
