-- 폼 제출은 서버(Drizzle, service_role 연결)로 처리되어 RLS를 우회하므로
-- anon 역할용 INSERT 정책(WITH CHECK (true))은 실사용되지 않는 잔재이며,
-- 공개 anon 키를 통한 직접 스팸 insert 위험만 남깁니다.
-- Supabase RLS advisor 경고 해소를 위해 해당 정책들을 제거합니다.
-- (RLS는 계속 활성 상태이며, anon용 PERMISSIVE 정책이 없으므로 insert/select 모두 기본 차단됩니다.)
DROP POLICY IF EXISTS "contacts-anon-insert" ON "contacts";
DROP POLICY IF EXISTS "factory-tour-anon-insert" ON "factory_tour_applications";
DROP POLICY IF EXISTS "job-applications-anon-insert" ON "job_applications";
DROP POLICY IF EXISTS "inquiries-anon-insert" ON "inquiries";
