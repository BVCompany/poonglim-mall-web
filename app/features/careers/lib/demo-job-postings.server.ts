/**
 * DB에 채용공고가 없을 때 `/careers/:id`·목업 지원 조회 등에서 사용하는 데모 공고.
 * `positions` 화면의 MOCK_JOBS_* 와 동일한 id(1–5)를 유지합니다.
 */
import type { JobPosting } from "./queries.server";

const BENEFITS_KO = `4대보험 완비
기숙사 지원
명절 상여금
연차 15일 + 리프레시 휴가
차량유지비 지원
경조사비 지원`;

const BENEFITS_EN = `Social insurance
Dormitory support
Holiday bonuses
15 days annual leave + refresh leave
Vehicle allowance
Family event support`;

const FIXED_TIME = new Date("2026-02-18T09:00:00Z");

function demoDeadline(
  kind: "open" | "closing" | "always",
): Date | null {
  if (kind === "always") return null;
  if (kind === "closing") return new Date(Date.now() + 5 * 86400000);
  return new Date("2026-06-30T00:00:00Z");
}

function row(
  partial: Omit<
    JobPosting,
    "created_at" | "updated_at" | "hiring_process"
  > & { hiring_process?: string | null },
): JobPosting {
  return {
    ...partial,
    hiring_process: partial.hiring_process ?? null,
    created_at: FIXED_TIME,
    updated_at: FIXED_TIME,
  };
}

const DEMO_KO: Record<number, JobPosting> = {
  1: row({
    job_id: 1,
    title: "생산관리 담당자",
    department: "생산직",
    location: "충북 진천",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "생산 라인 관리 및 공정 최적화 업무 담당",
      "생산 라인 관리 및 공정 개선",
      "생산 계획 수립 및 실적 관리",
      "품질 관리 및 안전 관리",
    ].join("\n"),
    requirements: [
      "관련 분야 경력 3년 이상",
      "식품 제조업 경험 우대",
      "HACCP 관련 자격증 보유자 우대",
    ].join("\n"),
    benefits: BENEFITS_KO,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("open"),
    is_active: true,
  }),
  2: row({
    job_id: 2,
    title: "품질관리 담당자",
    department: "생산직",
    location: "충북 진천",
    job_type: "full_time",
    experience_level: "all",
    description: [
      "원·부자재 및 완제품 품질 검사 업무",
      "원자재·완제품 품질 검사",
      "불량 원인 분석 및 개선",
      "품질 문서 관리",
    ].join("\n"),
    requirements: [
      "식품공학 관련 전공 우대",
      "HACCP 자격증 보유자 우대",
      "엑셀 기본 능력",
    ].join("\n"),
    benefits: BENEFITS_KO,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("open"),
    is_active: true,
  }),
  3: row({
    job_id: 3,
    title: "경영지원 담당자",
    department: "사무직",
    location: "서울",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "경영지원 업무 전반",
      "인사·총무 업무 전반",
      "임직원 복리후생 운영",
      "계약서 및 문서 관리",
    ].join("\n"),
    requirements: [
      "관련 경력 1년 이상",
      "MS Office 능숙자",
      "꼼꼼하고 책임감 있는 분",
    ].join("\n"),
    benefits: BENEFITS_KO,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("always"),
    is_active: true,
  }),
  4: row({
    job_id: 4,
    title: "영업관리 담당자",
    department: "영업직",
    location: "서울",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "B2B 영업 및 고객 관리",
      "B2B 고객사 관리",
      "신규 거래처 개발",
      "영업 실적 분석·보고",
    ].join("\n"),
    requirements: [
      "영업 경력 3년 이상",
      "식품·유통 업계 경험 우대",
      "운전면허 소지자",
    ].join("\n"),
    benefits: BENEFITS_KO,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("closing"),
    is_active: true,
  }),
  5: row({
    job_id: 5,
    title: "마케팅 전문가",
    department: "마케팅",
    location: "충남",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "브랜드·디지털 마케팅",
      "브랜드 마케팅 전략 수립",
      "디지털 캠페인 운영",
      "SNS·콘텐츠 제작 관리",
    ].join("\n"),
    requirements: [
      "마케팅 경력 3년 이상",
      "디지털 마케팅 경험자",
      "포토샵·일러스트 가능자 우대",
    ].join("\n"),
    benefits: BENEFITS_KO,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("open"),
    is_active: true,
  }),
};

const DEMO_EN: Record<number, JobPosting> = {
  1: row({
    job_id: 1,
    title: "Production supervisor",
    department: "Production",
    location: "Jincheon, Chungbuk",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "Production line management and process optimization",
      "Line operations and process improvement",
      "Production planning and KPI tracking",
      "Quality and safety management",
    ].join("\n"),
    requirements: [
      "3+ years in a related field",
      "Food manufacturing experience preferred",
      "HACCP-related certification preferred",
    ].join("\n"),
    benefits: BENEFITS_EN,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("open"),
    is_active: true,
  }),
  2: row({
    job_id: 2,
    title: "Quality control specialist",
    department: "Production",
    location: "Jincheon, Chungbuk",
    job_type: "full_time",
    experience_level: "all",
    description: [
      "Incoming and finished goods quality control",
      "Raw/finished goods inspection",
      "Root-cause analysis for defects",
      "Quality documentation",
    ].join("\n"),
    requirements: [
      "Food engineering major preferred",
      "HACCP certification preferred",
      "Basic Excel skills",
    ].join("\n"),
    benefits: BENEFITS_EN,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("open"),
    is_active: true,
  }),
  3: row({
    job_id: 3,
    title: "Corporate support specialist",
    department: "Office",
    location: "Seoul",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "Corporate support operations",
      "HR and general affairs",
      "Employee benefits programs",
      "Contracts and documentation",
    ].join("\n"),
    requirements: [
      "1+ years of related experience",
      "Proficient in Microsoft Office",
      "Detail-oriented and responsible",
    ].join("\n"),
    benefits: BENEFITS_EN,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("always"),
    is_active: true,
  }),
  4: row({
    job_id: 4,
    title: "Sales operations specialist",
    department: "Sales",
    location: "Seoul",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "B2B sales and account management",
      "B2B account management",
      "New business development",
      "Sales reporting and analysis",
    ].join("\n"),
    requirements: [
      "3+ years in sales",
      "Food or distribution experience preferred",
      "Valid driver’s license",
    ].join("\n"),
    benefits: BENEFITS_EN,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("closing"),
    is_active: true,
  }),
  5: row({
    job_id: 5,
    title: "Marketing specialist",
    department: "Marketing",
    location: "Chungnam",
    job_type: "full_time",
    experience_level: "experienced",
    description: [
      "Brand and digital marketing",
      "Brand marketing strategy",
      "Digital campaign operations",
      "SNS and content production",
    ].join("\n"),
    requirements: [
      "3+ years in marketing",
      "Digital marketing experience",
      "Photoshop / Illustrator skills preferred",
    ].join("\n"),
    benefits: BENEFITS_EN,
    headcount: 1,
    status: "open",
    deadline: demoDeadline("open"),
    is_active: true,
  }),
};

export function getDemoJobPostingById(
  id: number,
  locale: string,
): JobPosting | null {
  const isEn = locale.toLowerCase().startsWith("en");
  const map = isEn ? DEMO_EN : DEMO_KO;
  return map[id] ?? null;
}
