/**
 * Careers DB Queries (Server-side)
 */
import { format } from "date-fns";
import { and, desc, eq } from "drizzle-orm";

import db from "~/core/db/drizzle-client.server";
import { jobApplications, jobPostings } from "../schema";

export type JobPosting = typeof jobPostings.$inferSelect;
export type JobApplication = typeof jobApplications.$inferSelect;

/** 지원서 조회 모달(클라이언트·액션 응답) — 비밀번호 필드는 포함하지 않음 */
export type JobApplicationLookupRow = {
  id: string;
  applicationId: number;
  detailJobId: number;
  dept: string;
  title: string;
  appliedAt: string;
  status: "submitted" | "reviewing" | "accepted" | "rejected";
  canEdit: boolean;
  showCannotEditHint: boolean;
  detail: {
    applicant_name: string;
    email: string;
    phone: string;
    birth_date: string | null;
    address: string | null;
    cover_letter: string | null;
    education_level: string | null;
    school_name: string | null;
    major: string | null;
    graduation_month: string | null;
    experience_kind: string | null;
    military_service: string | null;
    current_company: string | null;
    current_position: string | null;
    resume_url: string | null;
    self_intro_file_url: string | null;
    portfolio_url: string | null;
  };
};

function formatLookupAppliedAt(createdAt: Date | string | null | undefined) {
  if (!createdAt) return "";
  const d = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "yyyy.MM.dd");
}

/** 서버 액션에서 DB 행 → 클라이언트용 스냅샷 */
export function toJobApplicationLookupRows(
  rows: {
    app: typeof jobApplications.$inferSelect;
    job: typeof jobPostings.$inferSelect;
  }[],
): JobApplicationLookupRow[] {
  return rows.map(({ app, job }) => {
    const status = app.status;
    const canEdit = status === "submitted";
    return {
      id: String(app.application_id),
      applicationId: app.application_id,
      detailJobId: app.job_id,
      dept: job.department,
      title: job.title,
      appliedAt: formatLookupAppliedAt(app.created_at),
      status,
      canEdit,
      showCannotEditHint: !canEdit,
      detail: {
        applicant_name: app.applicant_name,
        email: app.email,
        phone: app.phone,
        birth_date: app.birth_date,
        address: app.address,
        cover_letter: app.cover_letter,
        education_level: app.education_level,
        school_name: app.school_name,
        major: app.major,
        graduation_month: app.graduation_month,
        experience_kind: app.experience_kind,
        military_service: app.military_service,
        current_company: app.current_company,
        current_position: app.current_position,
        resume_url: app.resume_url,
        self_intro_file_url: app.self_intro_file_url,
        portfolio_url: app.portfolio_url,
      },
    };
  });
}

/** 비회원 지원서 조회: 이름 + 연락처 + 지원 시 설정한 비밀번호 */
export async function lookupJobApplicationsByCredentials(params: {
  applicantName: string;
  phone: string;
  lookupPassword: string;
}) {
  const name = params.applicantName.trim();
  const phone = params.phone.trim();
  const pw = params.lookupPassword.trim();
  if (!name || !phone || !pw) return [];

  return db
    .select({
      app: jobApplications,
      job: jobPostings,
    })
    .from(jobApplications)
    .innerJoin(jobPostings, eq(jobApplications.job_id, jobPostings.job_id))
    .where(
      and(
        eq(jobApplications.applicant_name, name),
        eq(jobApplications.phone, phone),
        eq(jobApplications.lookup_password, pw),
      ),
    )
    .orderBy(desc(jobApplications.created_at));
}

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
