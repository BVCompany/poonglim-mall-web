-- 지원서 조회: 지원 시 설정한 비밀번호(문의 조회와 동일하게 평문 저장)
ALTER TABLE job_applications
  ADD COLUMN IF NOT EXISTS lookup_password text;
