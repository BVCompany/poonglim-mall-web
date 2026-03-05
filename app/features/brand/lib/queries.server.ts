/**
 * Brand DB Queries (Server-side)
 */
import db from "~/core/db/drizzle-client.server";
import { factoryTourApplications } from "../schema";

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
