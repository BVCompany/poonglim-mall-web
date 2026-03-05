/**
 * Inquiry DB Queries (Server-side)
 */
import db from "~/core/db/drizzle-client.server";
import { inquiries } from "../schema";

/** B2B/대량구매 문의 제출 */
export async function createInquiry(
  data: Omit<typeof inquiries.$inferInsert, "inquiry_id" | "status" | "created_at" | "updated_at">,
) {
  const rows = await db
    .insert(inquiries)
    .values(data)
    .returning();
  return rows[0];
}
