/**
 * Supabase Server Client (service_role)
 *
 * 서버 사이드 전용 Supabase 클라이언트.
 * service_role 키를 사용하므로 RLS를 우회합니다.
 * 반드시 server-side (loader / action) 에서만 사용하세요.
 */
import { createClient } from "@supabase/supabase-js";

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}
