/**
 * Careers Schema
 *
 * 채용공고(job_postings) + 채용지원서(job_applications) 테이블
 *
 * RLS 전략:
 * - job_postings: anon은 status='open' AND is_active=true 인 공고만 SELECT
 * - job_applications: anon은 INSERT만 가능 (자기 지원서 조회 불가 - 비회원)
 * - 관리자 CRUD: service_role (RLS 우회)
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { anonRole } from "drizzle-orm/supabase";

import { makeIdentityColumn, timestamps } from "~/core/db/helpers";

export const jobStatusEnum = pgEnum("job_status", [
  "open", // 모집중
  "closed", // 마감
  "draft", // 임시저장
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full_time", // 정규직
  "part_time", // 파트타임
  "contract", // 계약직
  "intern", // 인턴
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "entry", // 신입
  "experienced", // 경력
  "senior", // 시니어
  "all", // 신입/경력
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "submitted", // 접수완료
  "reviewing", // 검토중
  "accepted", // 합격
  "rejected", // 불합격
]);

/** 채용 공고 */
export const jobPostings = pgTable(
  "job_postings",
  {
    ...makeIdentityColumn("job_id"),
    title: text().notNull(),
    department: text().notNull(),
    location: text().notNull(),
    job_type: jobTypeEnum().notNull(),
    experience_level: experienceLevelEnum().notNull(),
    description: text().notNull(),
    requirements: text(),
    benefits: text(),
    /** 채용 절차 단계(줄바꿈 구분). null/공백이면 상세 페이지에서 i18n 기본 문구 사용 */
    hiring_process: text("hiring_process"),
    headcount: integer().default(1),
    status: jobStatusEnum().notNull().default("draft"),
    deadline: timestamp(),
    is_active: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    // anon: 모집중(open) + 활성 공고만 읽기 허용
    pgPolicy("job-postings-anon-select", {
      for: "select",
      to: anonRole,
      as: "permissive",
      using: sql`${table.status} = 'open' AND ${table.is_active} = true`,
    }),
  ],
);

/** 채용 지원서 (비회원 - 이메일/전화번호로 식별) */
export const jobApplications = pgTable(
  "job_applications",
  {
    ...makeIdentityColumn("application_id"),
    job_id: integer()
      .notNull()
      .references(() => jobPostings.job_id, {
        onDelete: "cascade",
      }),
    applicant_name: text().notNull(),
    email: text().notNull(),
    phone: text().notNull(),
    birth_date: text(),
    address: text(),
    cover_letter: text(),
    resume_url: text(),
    portfolio_url: text(),
    education_level: text(),
    school_name: text(),
    major: text(),
    graduation_month: text(),
    experience_kind: text(),
    current_company: text(),
    current_position: text(),
    military_service: text(),
    /** 자기소개서 첨부 파일(이력서 본문 텍스트는 cover_letter) */
    self_intro_file_url: text(),
    marketing_opt_in: boolean().notNull().default(false),
    /** 지원서 조회용 비밀번호(문의하기 조회와 동일하게 평문 저장) */
    lookup_password: text(),
    status: applicationStatusEnum().notNull().default("submitted"),
    admin_memo: text(),
    ...timestamps,
  },
  () => [
    // anon: INSERT만 허용 (지원서 제출)
    pgPolicy("job-applications-anon-insert", {
      for: "insert",
      to: anonRole,
      as: "permissive",
      withCheck: sql`true`,
    }),
    // anon: SELECT 차단 (비회원은 제출 후 조회 불가)
    pgPolicy("job-applications-anon-no-select", {
      for: "select",
      to: anonRole,
      as: "restrictive",
      using: sql`false`,
    }),
  ],
);
