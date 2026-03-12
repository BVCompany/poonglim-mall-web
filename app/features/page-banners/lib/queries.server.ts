import { eq } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import { pageBanners } from "../schema";

/** 특정 페이지의 활성 배너 조회 */
export async function getPageBanner(pageKey: string) {
  const rows = await db
    .select()
    .from(pageBanners)
    .where(eq(pageBanners.page_key, pageKey))
    .limit(1);
  return rows[0] ?? null;
}

/** 전체 페이지 배너 목록 (관리자용) */
export async function getAllPageBanners() {
  return db.select().from(pageBanners).orderBy(pageBanners.page_key);
}
