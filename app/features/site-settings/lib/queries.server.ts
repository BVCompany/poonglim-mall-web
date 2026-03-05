/**
 * Site Settings DB Queries (Server-side)
 */
import { eq } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import { siteSettings, SETTING_KEYS } from "../schema";

/** 모든 설정 가져오기 → { key: value } 객체로 반환 */
export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await db.select().from(siteSettings).catch(() => []);
  return Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
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
