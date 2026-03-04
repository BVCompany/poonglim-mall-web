/**
 * Support DB Queries (Server-side)
 */
import { asc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { contacts, faqs } from "../schema";

export type Faq = typeof faqs.$inferSelect;

/** 활성 FAQ 전체 */
export async function getFaqs() {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.is_active, true))
    .orderBy(asc(faqs.sort_order));
}

/** 카테고리별 FAQ */
export async function getFaqsByCategory(
  category: "product" | "delivery" | "b2b" | "quality" | "general",
) {
  return db
    .select()
    .from(faqs)
    .where(eq(faqs.category, category))
    .orderBy(asc(faqs.sort_order));
}

/** 일반 문의 제출 */
export async function createContact(
  data: Omit<typeof contacts.$inferInsert, "contact_id" | "status" | "created_at" | "updated_at">,
) {
  const rows = await db
    .insert(contacts)
    .values(data)
    .returning();
  return rows[0];
}
