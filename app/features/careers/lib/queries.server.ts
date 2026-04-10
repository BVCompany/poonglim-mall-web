/**
 * Careers DB Queries (Server-side)
 */
import { and, desc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { jobApplications, jobPostings } from "../schema";

export type JobPosting = typeof jobPostings.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;

/** 모집중 채용공고 전체 */
export async function getOpenJobPostings() {
  return db
    .select()
    .from(jobPostings)
    .where(and(eq(jobPostings.status, "open"), eq(jobPostings.is_active, true)))
    .orderBy(desc(jobPostings.created_at));
}

/** 관리자용: 상태 무관 전체 */
export async function getAllJobPostingsForAdmin() {
  return db.select().from(jobPostings).orderBy(desc(jobPostings.created_at));
}

/** 단건 */
export async function getJobPostingById(id: number) {
  const rows = await db
    .select()
    .from(jobPostings)
    .where(eq(jobPostings.job_id, id));
  return rows[0] ?? null;
}

/** 채용 지원서 제출 */
export async function createJobApplication(
  data: Omit<typeof jobApplications.$inferInsert, "application_id" | "status" | "created_at" | "updated_at">,
) {
  const rows = await db
    .insert(jobApplications)
    .values(data)
    .returning();
  return rows[0];
}
