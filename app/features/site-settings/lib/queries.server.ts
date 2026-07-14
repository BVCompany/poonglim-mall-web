/**
 * Site Settings DB Queries (Server-side)
 */
import { eq } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import { siteSettings, SETTING_KEYS } from "../schema";

/**
 * 설정값 인메모리 캐시
 *
 * root 로더가 매 요청마다 getAllSettings()를 호출하므로(전 페이지 공통),
 * 동일 서버 인스턴스(웜) 내에서 짧은 TTL 동안 DB 조회를 생략해
 * 함수 CPU·DB 부하를 크게 줄인다. 저장(upsert) 시 즉시 무효화한다.
 */
const SETTINGS_CACHE_TTL_MS = 60_000;
let settingsCache: { data: Record<string, string>; expires: number } | null =
  null;

export function invalidateSettingsCache() {
  settingsCache = null;
}

/** 모든 설정 가져오기 → { key: value } 객체로 반환 (TTL 캐시) */
export async function getAllSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (settingsCache && settingsCache.expires > now) {
    return settingsCache.data;
  }
  try {
    const rows = await db.select().from(siteSettings);
    const data = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
    settingsCache = { data, expires: now + SETTINGS_CACHE_TTL_MS };
    return data;
  } catch {
    // 조회 실패 시 캐시하지 않고 빈 객체 반환(다음 요청에서 재시도)
    return settingsCache?.data ?? {};
  }
}

/** 단건 */
export async function getSetting(key: string): Promise<string | null> {
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return rows[0]?.value ?? null;
}

/** 설정값 저장 (없으면 insert, 있으면 update) */
export async function upsertSetting(key: string, value: string) {
  await db
    .insert(siteSettings)
    .values({ key, value, updated_at: new Date() })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updated_at: new Date() },
    });
  invalidateSettingsCache();
}

/** 회사소개 섹션 설정 일괄 조회 */
export async function getCompanyIntroSettings() {
  const settings = await getAllSettings();
  return {
    image:  settings[SETTING_KEYS.COMPANY_INTRO_IMAGE]  ?? null,
    title:  settings[SETTING_KEYS.COMPANY_INTRO_TITLE]  ?? null,
    link:   settings[SETTING_KEYS.COMPANY_INTRO_LINK]   ?? null,
  };
}

/** 공장 견학 신청 on/off 설정 (값이 없으면 활성으로 간주) */
export async function getFactoryTourSettings() {
  const enabledRaw = await getSetting(SETTING_KEYS.FACTORY_TOUR_ENABLED);
  const message = await getSetting(SETTING_KEYS.FACTORY_TOUR_DISABLED_MESSAGE);
  return {
    enabled: enabledRaw !== "false",
    disabledMessage: message ?? "",
  };
}
