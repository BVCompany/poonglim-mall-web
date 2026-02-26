/**
 * Admin Career Mock Data
 * 
 * Temporary job posting and application data for admin panel.
 * TODO: Replace with Supabase queries when DB is configured.
 */

import type { AdminJobPosting, AdminJobApplication } from "../types/career.types";

export const MOCK_JOB_POSTINGS: AdminJobPosting[] = [
  {
    id: "job-001",
    title: "제품 개발 연구원",
    description: "혁신적인 식품 제품 개발을 주도할 연구원을 모집합니다",
    department: "연구개발팀",
    location: "충청북도 진천군",
    experienceLevel: "experienced",
    jobType: "full-time",
    deadline: "2025-02-28",
    status: "open",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "job-002",
    title: "품질관리 담당자",
    description: "제품 품질 관리 및 검사를 담당할 인재를 찾습니다",
    department: "품질관리",
    location: "충청북도 진천군",
    experienceLevel: "all",
    jobType: "full-time",
    deadline: "2025-02-15",
    status: "open",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-07T00:00:00Z",
  },
];

export const MOCK_JOB_APPLICATIONS: AdminJobApplication[] = [
  {
    id: "app-001",
    jobPostingId: "job-001",
    jobTitle: "식품 연구원",
    applicantName: "김민수",
    email: "minsu.kim@email.com",
    phone: "010-1234-5678",
    experienceLevel: "experienced",
    education: {
      level: "bachelor",
      school: "서울대학교",
      major: "식품공학",
      graduationYear: "2020",
    },
    status: "reviewing",
    appliedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "app-002",
    jobPostingId: "job-002",
    jobTitle: "영업 사원",
    applicantName: "이지은",
    email: "jieun.lee@email.com",
    phone: "010-2345-6789",
    experienceLevel: "entry",
    education: {
      level: "bachelor",
      school: "연세대학교",
      major: "경영학",
      graduationYear: "2023",
    },
    status: "accepted",
    appliedAt: "2024-01-14T00:00:00Z",
    reviewedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "app-003",
    jobPostingId: "job-001",
    jobTitle: "품질관리 담당",
    applicantName: "박준호",
    email: "junho.park@email.com",
    phone: "010-3456-7890",
    experienceLevel: "experienced",
    education: {
      level: "bachelor",
      school: "고려대학교",
      major: "화학공학",
      graduationYear: "2019",
    },
    status: "rejected",
    appliedAt: "2024-01-13T00:00:00Z",
    reviewedAt: "2024-01-14T00:00:00Z",
  },
];

