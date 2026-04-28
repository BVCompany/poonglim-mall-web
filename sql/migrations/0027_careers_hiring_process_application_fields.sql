-- 채용 공고: 상세 페이지 채용 절차(줄바꿈 구분). 비어 있으면 프론트에서 i18n 기본 단계 사용.
ALTER TABLE job_postings
  ADD COLUMN IF NOT EXISTS hiring_process text;

-- 지원서: 학력·경력·병역·첨부 URL 등
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS education_level text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS school_name text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS graduation_month text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS experience_kind text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS current_company text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS current_position text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS military_service text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS self_intro_file_url text;
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false;
