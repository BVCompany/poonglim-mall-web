/**
 * Brand DB Queries (Server-side)
 */
import { and, asc, eq } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import { brandCertItems, factoryTourApplications } from "../schema";

/** 활성 수상내역 목록 (프론트엔드용 — is_active = true 만) */
export async function getCertAwards() {
  return db
    .select()
    .from(brandCertItems)
    .where(and(eq(brandCertItems.type, "award"), eq(brandCertItems.is_active, true)))
    .orderBy(asc(brandCertItems.sort_order), asc(brandCertItems.id));
}

/** 활성 인증서 목록 (프론트엔드용 — is_active = true 만) */
export async function getCertItems() {
  return db
    .select()
    .from(brandCertItems)
    .where(and(eq(brandCertItems.type, "cert"), eq(brandCertItems.is_active, true)))
    .orderBy(asc(brandCertItems.sort_order), asc(brandCertItems.id));
}

/** 전체 cert items (관리자용) */
export async function getAllCertItems() {
  return db
    .select()
    .from(brandCertItems)
    .orderBy(asc(brandCertItems.type), asc(brandCertItems.sort_order), asc(brandCertItems.id));
}

/** 공장 견학 신청 제출 */
export async function createFactoryTourApplication(
  data: Omit<typeof factoryTourApplications.$inferInsert, "tour_id" | "status" | "created_at" | "updated_at">,
) {
  const rows = await db
    .insert(factoryTourApplications)
    .values(data)
    .returning();
  return rows[0];
}
