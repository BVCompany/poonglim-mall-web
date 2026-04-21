import { asc, desc, eq, and, inArray, sql } from "drizzle-orm";
import db from "~/core/db/drizzle-client.server";
import {
  notices,
  faqs,
  contacts,
  gradeCertificates,
  gradeCertCategories,
  archiveCategories,
  libraryResources,
} from "../schema";

/* ─────────────────────────── FAQ ───────────────────────────── */
export type Faq = typeof faqs.$inferSelect;

export async function getFaqs(category?: string) {
  const conditions = [eq(faqs.is_active, true)];
  if (category && category !== "all") {
    if (category === "general") {
      conditions.push(inArray(faqs.category, ["general", "b2b"]));
    } else {
      conditions.push(eq(faqs.category, category as Faq["category"]));
    }
  }
  return db
    .select()
    .from(faqs)
    .where(and(...conditions))
    .orderBy(faqs.sort_order, faqs.faq_id);
}

/** 관리자용: 전체 FAQ (비활성 포함) */
export async function getAllFaqs() {
  return db.select().from(faqs).orderBy(faqs.sort_order, desc(faqs.faq_id));
}

/* ─────────────────────────── CONTACT ───────────────────────── */
export async function createContact(data: {
  inquiry_type: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  title: string;
  content: string;
  lookup_password: string;
}) {
  await db.insert(contacts).values({
    inquiry_type: data.inquiry_type,
    name: data.name,
    email: data.email ?? "",
    phone: data.phone ?? null,
    company: data.company ?? null,
    title: data.title,
    content: data.content,
    lookup_password: data.lookup_password,
  });
}

/** 관리자용: 전체 문의 목록 */
export async function getAllContacts() {
  return db.select().from(contacts).orderBy(desc(contacts.created_at));
}

/** 문의 상태 변경 */
export async function updateContactStatus(id: number, status: "pending" | "completed") {
  await db.update(contacts).set({ status }).where(eq(contacts.contact_id, id));
}

/** 문의 삭제 */
export async function deleteContact(id: number) {
  await db.delete(contacts).where(eq(contacts.contact_id, id));
}

/** 문의내역 조회 (이름 + 연락처 + 비밀번호) */
export async function lookupContacts(data: {
  name: string;
  phone: string;
  lookup_password: string;
}) {
  return db
    .select()
    .from(contacts)
    .where(
      and(
        eq(contacts.name, data.name),
        eq(contacts.phone, data.phone),
        eq(contacts.lookup_password, data.lookup_password),
      ),
    )
    .orderBy(desc(contacts.created_at));
}

export type Notice = typeof notices.$inferSelect;

/** 공개된 공지사항 목록 조회 (최신순, 고정글 우선) */
export async function getNotices(category?: string) {
  const conditions = [eq(notices.is_active, true)];
  if (category && category !== "전체") {
    conditions.push(eq(notices.category, category as Notice["category"]));
  }
  return db
    .select()
    .from(notices)
    .where(and(...conditions))
    .orderBy(desc(notices.is_pinned), desc(notices.created_at));
}

/** 단일 공지사항 조회 (조회수 증가 포함) */
export async function getNoticeById(id: number) {
  const rows = await db.select().from(notices).where(eq(notices.notice_id, id));
  return rows[0] ?? null;
}

/** 조회수 증가 */
export async function incrementNoticeViewCount(id: number) {
  await db
    .update(notices)
    .set({ view_count: sql`${notices.view_count} + 1` })
    .where(eq(notices.notice_id, id));
}

/** 이전/다음 공지사항 id 조회 */
export async function getAdjacentNotices(id: number) {
  const [prev, next] = await Promise.all([
    db
      .select({ notice_id: notices.notice_id, title: notices.title })
      .from(notices)
      .where(and(eq(notices.is_active, true), sql`${notices.notice_id} < ${id}`))
      .orderBy(desc(notices.notice_id))
      .limit(1),
    db
      .select({ notice_id: notices.notice_id, title: notices.title })
      .from(notices)
      .where(and(eq(notices.is_active, true), sql`${notices.notice_id} > ${id}`))
      .orderBy(notices.notice_id)
      .limit(1),
  ]);
  return { prev: prev[0] ?? null, next: next[0] ?? null };
}

/** 활성 공지가 1건이라도 있는지 (상세 목업 여부) */
export async function hasAnyActiveNotices(): Promise<boolean> {
  const rows = await db
    .select({ id: notices.notice_id })
    .from(notices)
    .where(eq(notices.is_active, true))
    .limit(1);
  return rows.length > 0;
}

/** 관리자용: 전체 공지사항 조회 */
export async function getAllNotices() {
  return db
    .select()
    .from(notices)
    .orderBy(desc(notices.is_pinned), desc(notices.created_at));
}

/* ─────────────────── 등급판정서 ─────────────────────── */
export type GradeCertificate = typeof gradeCertificates.$inferSelect;

export async function getGradeCertCategoriesOrdered() {
  return db
    .select()
    .from(gradeCertCategories)
    .orderBy(asc(gradeCertCategories.sort_order))
    .catch(() => []);
}

/** 공개 등급판정서 목록 (탭 + 타입 필터) */
export async function getGradeCertificates(
  tab: "current" | "archive" = "current",
  certType?: string,
) {
  const conditions = [
    eq(gradeCertificates.is_active, true),
    eq(gradeCertificates.tab, tab),
  ];
  if (certType && certType !== "전체") {
    conditions.push(eq(gradeCertificates.cert_type, certType));
  }
  return db
    .select()
    .from(gradeCertificates)
    .where(and(...conditions))
    .orderBy(desc(gradeCertificates.created_at));
}

/** 단일 등급판정서 조회 + 조회수 증가 */
export async function getGradeCertById(id: number) {
  const rows = await db
    .select()
    .from(gradeCertificates)
    .where(eq(gradeCertificates.cert_id, id));
  return rows[0] ?? null;
}

/** 조회수 증가 */
export async function incrementCertViewCount(id: number) {
  await db
    .update(gradeCertificates)
    .set({ view_count: sql`${gradeCertificates.view_count} + 1` })
    .where(eq(gradeCertificates.cert_id, id));
}

/** 이전/다음 등급판정서 */
export async function getAdjacentCerts(id: number, tab: "current" | "archive") {
  const [prev, next] = await Promise.all([
    db
      .select({ cert_id: gradeCertificates.cert_id, title: gradeCertificates.title })
      .from(gradeCertificates)
      .where(
        and(
          eq(gradeCertificates.is_active, true),
          eq(gradeCertificates.tab, tab),
          sql`${gradeCertificates.cert_id} < ${id}`,
        ),
      )
      .orderBy(desc(gradeCertificates.cert_id))
      .limit(1),
    db
      .select({ cert_id: gradeCertificates.cert_id, title: gradeCertificates.title })
      .from(gradeCertificates)
      .where(
        and(
          eq(gradeCertificates.is_active, true),
          eq(gradeCertificates.tab, tab),
          sql`${gradeCertificates.cert_id} > ${id}`,
        ),
      )
      .orderBy(gradeCertificates.cert_id)
      .limit(1),
  ]);
  return { prev: prev[0] ?? null, next: next[0] ?? null };
}

/** 활성 등급판정서가 1건이라도 있는지 (상세 목업 여부) */
export async function hasAnyActiveGradeCertificates(): Promise<boolean> {
  const rows = await db
    .select({ id: gradeCertificates.cert_id })
    .from(gradeCertificates)
    .where(eq(gradeCertificates.is_active, true))
    .limit(1);
  return rows.length > 0;
}

/** 관리자용: 전체 등급판정서 */
export async function getAllGradeCerts() {
  return db
    .select()
    .from(gradeCertificates)
    .orderBy(desc(gradeCertificates.created_at));
}

/* ─────────────────────── 자료실 (library_resources) ─────────────────────── */
export async function getArchiveCategoriesOrdered() {
  return db
    .select()
    .from(archiveCategories)
    .orderBy(asc(archiveCategories.sort_order))
    .catch(() => []);
}

export type LibraryResource = typeof libraryResources.$inferSelect;

export async function getActiveLibraryResources() {
  return db
    .select()
    .from(libraryResources)
    .where(eq(libraryResources.is_active, true))
    .orderBy(desc(libraryResources.created_at));
}

export async function getLibraryResourceById(id: number) {
  const rows = await db
    .select()
    .from(libraryResources)
    .where(
      and(eq(libraryResources.resource_id, id), eq(libraryResources.is_active, true)),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function hasAnyActiveLibraryResources(): Promise<boolean> {
  const rows = await db
    .select({ id: libraryResources.resource_id })
    .from(libraryResources)
    .where(eq(libraryResources.is_active, true))
    .limit(1);
  return rows.length > 0;
}

export async function incrementLibraryResourceViewCount(id: number) {
  await db
    .update(libraryResources)
    .set({ view_count: sql`${libraryResources.view_count} + 1` })
    .where(
      and(eq(libraryResources.resource_id, id), eq(libraryResources.is_active, true)),
    );
}

export async function getAllLibraryResourcesForAdmin() {
  return db
    .select()
    .from(libraryResources)
    .orderBy(desc(libraryResources.created_at));
}

/** 목록 정렬(최신순) 기준 이전/다음 글 링크 */
export async function getAdjacentLibraryResources(resourceId: number) {
  const all = await db
    .select({
      resource_id: libraryResources.resource_id,
      title: libraryResources.title,
    })
    .from(libraryResources)
    .where(eq(libraryResources.is_active, true))
    .orderBy(desc(libraryResources.created_at));

  const idx = all.findIndex((r) => r.resource_id === resourceId);
  if (idx === -1) {
    return {
      prev: null as { resource_id: number; title: string } | null,
      next: null as { resource_id: number; title: string } | null,
    };
  }
  const older = all[idx + 1];
  const newer = all[idx - 1];
  return {
    prev: older ? { resource_id: older.resource_id, title: older.title } : null,
    next: newer ? { resource_id: newer.resource_id, title: newer.title } : null,
  };
}
