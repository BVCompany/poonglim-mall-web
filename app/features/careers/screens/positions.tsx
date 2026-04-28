/**
 * 채용안내 통합 페이지
 *
 * 주요 모집 직무 / 채용 절차 / 채용공고(4-드롭다운 필터·목록) / 복리후생
 *
 * 채용공고·복리후생 등 섹션 타이틀 마크는 `SectionTitleStar` / `SectionPageTitle`의 스파클 PNG(`starVariant`)로 통일.
 * 복리후생은 `brandIntro`(product-star), 모바일 섹션 타이틀 텍스트는 `#1F2121`.
 */
import type {
  JobApplicationLookupRow,
  JobPosting as DbJobPosting,
} from "../lib/queries.server";
import type { Route } from "./+types/positions";

import { format } from "date-fns";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { data, Link, useFetcher } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import {
  SectionPageTitle,
  SectionTitleStar,
} from "~/core/components/section-title-star";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import {
  getOpenJobPostings,
  lookupJobApplicationsByCredentials,
  toJobApplicationLookupRows,
} from "../lib/queries.server";
import i18next from "~/core/lib/i18next.server";

/* ── 타입 ── */
const JOB_FILTER_KEYS = [
  "all",
  "production",
  "office",
  "sales",
  "marketing",
  "it",
] as const;
type JobFilterKey = (typeof JOB_FILTER_KEYS)[number];

const EXP_FILTER_KEYS = ["all", "entry", "experienced", "both"] as const;
type ExpFilterKey = (typeof EXP_FILTER_KEYS)[number];

const REGION_FILTER_KEYS = [
  "all",
  "seoul",
  "chungbuk",
  "chungnam",
  "jeonbuk",
] as const;
type RegionFilterKey = (typeof REGION_FILTER_KEYS)[number];

const STATUS_FILTER_KEYS = ["all", "open", "closing", "always"] as const;
type StatusFilterKey = (typeof STATUS_FILTER_KEYS)[number];

type JobStatusStyleKey = "open" | "closing" | "always";

type DisplayJob = {
  id: number;
  dept: string;
  deptKey: JobFilterKey;
  title: string;
  type: string;
  typeKey: "full_time" | "part_time" | "contract" | "intern";
  exp: string;
  expKey: ExpFilterKey;
  region: string;
  regionKey: RegionFilterKey;
  createdAt: string;
  status: string;
  statusKey: JobStatusStyleKey;
  /** 목록 마감 열 — `~ yyyy-MM-dd` 또는 상시 문구 */
  deadlineLine: string;
  isNew: boolean;
  duties: string[];
  requirements: string[];
};

function inferDeptKey(dept: string): JobFilterKey {
  const s = dept.trim();
  if (/생산|production/i.test(s)) return "production";
  if (/사무|경영|인사|office|admin|support/i.test(s)) return "office";
  if (/영업|sales/i.test(s)) return "sales";
  if (/마케팅|marketing/i.test(s)) return "marketing";
  if (/IT|개발|developer|engineering/i.test(s)) return "it";
  return "all";
}

function inferRegionKey(region: string): RegionFilterKey {
  const s = region.trim();
  if (/서울|seoul/i.test(s)) return "seoul";
  if (/충북|진천|chungbuk|jincheon/i.test(s)) return "chungbuk";
  if (/충남|chungnam/i.test(s)) return "chungnam";
  if (/전북|jeonbuk|jeonju/i.test(s)) return "jeonbuk";
  return "seoul";
}

function expKeyFromDb(level: string): ExpFilterKey {
  if (level === "entry") return "entry";
  if (level === "all") return "both";
  return "experienced";
}

function statusKeyFromDeadline(deadline: Date | null): JobStatusStyleKey {
  if (!deadline) return "always";
  const days = (deadline.getTime() - Date.now()) / 86400000;
  if (days <= 7) return "closing";
  return "open";
}

/**
 * 모바일 채용 필터(body 포털) 세로 위치: 트리거 `getBoundingClientRect().bottom` 기준 추가 오프셋(px).
 * 더 내리려면 값을 키우고, 트리거 상단에 맞추려면 `useLayoutEffect` 안 `measure`에서 `top: r.top + …` 로 바꾸면 됩니다.
 */
type ApplicationLookupFetcherData =
  | { ok: true; rows: JobApplicationLookupRow[] }
  | { ok: false; error: string };

const APPLY_NS = "pages.careers.apply";

function applicationLookupStatusBadgeKey(
  status: JobApplicationLookupRow["status"],
):
  | "badgeStatusSubmitted"
  | "badgeStatusReviewing"
  | "badgeStatusAccepted"
  | "badgeStatusRejected" {
  switch (status) {
    case "submitted":
      return "badgeStatusSubmitted";
    case "reviewing":
      return "badgeStatusReviewing";
    case "accepted":
      return "badgeStatusAccepted";
    case "rejected":
      return "badgeStatusRejected";
    default:
      return "badgeStatusSubmitted";
  }
}

function lookupFormatEducation(t: (key: string) => string, v: string | null) {
  if (!v) return "—";
  const map: Record<string, string> = {
    "high-school": "eduHigh",
    college: "eduCollege",
    university: "eduUniv",
    master: "eduMaster",
    phd: "eduPhd",
  };
  const k = map[v];
  return k ? t(`${APPLY_NS}.${k}`) : v.trim() || "—";
}

function lookupFormatCareer(t: (key: string) => string, v: string | null) {
  if (!v) return "—";
  if (v === "fresh") return t(`${APPLY_NS}.summaryFresh`);
  if (v === "experienced") return t(`${APPLY_NS}.summaryExp`);
  return v;
}

function lookupFormatMilitary(t: (key: string) => string, v: string | null) {
  if (!v) return "—";
  if (v === "completed") return t(`${APPLY_NS}.milDone`);
  if (v === "exempted") return t(`${APPLY_NS}.milExempt`);
  if (v === "not-applicable") return t(`${APPLY_NS}.milNa`);
  return v;
}

function attachmentNameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? decodeURIComponent(last) : url;
  } catch {
    return url;
  }
}

const MOBILE_CAREERS_FILTER_FLOAT_OFFSET_Y = 6;
/** 모바일 채용 필터 플로팅 패널 가로 너비(px) */
const MOBILE_CAREERS_FILTER_PANEL_WIDTH_PX = 100;

/** 모바일 필터 트리거 라벨: Pretendard 12px / 500 (시안) */
const careersFilterDropdownFont =
  "[font-family:Pretendard,system-ui,sans-serif] max-lg:text-[12px] max-lg:font-medium max-lg:leading-none lg:[font-size:clamp(14px,calc(16*100vw/1920),16px)] lg:[line-height:clamp(20px,calc(24*100vw/1920),24px)]";

/** 지원서 조회 목록: 라운드 60px, Pretendard 14/500 — 모바일은 한 줄(동일 너비 flex-1), PC 우측 열은 lg에서 전체 너비 */
const applicationLookupListActionBtn =
  "inline-flex min-w-0 flex-1 items-center justify-center break-words rounded-[60px] bg-[#EAE3C9] px-[20px] py-[8px] text-center text-sm font-medium text-black [font-family:Pretendard,system-ui,sans-serif] leading-normal transition-colors hover:bg-[#dfd6b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#02633E]/30 max-lg:max-w-none max-lg:px-3 max-lg:py-2 max-lg:text-xs lg:box-border lg:max-w-none";

const filterChevronClass =
  "size-[clamp(16px,calc(20*100vw/1920),20px)] shrink-0 max-lg:size-3.5";

/** Tailwind `max-lg`와 동일: <1024px */
function subscribeCareersMaxLg(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(max-width: 1023px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}
function getCareersMaxLgSnapshot() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches
  );
}
function getCareersMaxLgServerSnapshot() {
  return false;
}
function useCareersMaxLg() {
  return useSyncExternalStore(
    subscribeCareersMaxLg,
    getCareersMaxLgSnapshot,
    getCareersMaxLgServerSnapshot,
  );
}

/** PC: 녹색 패널·1행=현재값+닫기(위 화살표) / 모바일: 동일 녹색 톤·제목 행 없이 옵션만(흰 글자·좌정렬) */
function CareersFilterDropdownFloating<T extends string>({
  currentValue,
  options,
  formatLabel = (s: string) => s,
  onPick,
  onClose,
  layout = "pc",
  listboxAriaLabel = "Filter options",
}: {
  currentValue: T;
  options: readonly T[];
  formatLabel?: (v: string) => string;
  onPick: (v: T) => void;
  onClose: () => void;
  layout?: "pc" | "mobileOptions";
  listboxAriaLabel?: string;
}) {
  const rowPad =
    "px-[clamp(14px,calc(18*100vw/1920),18px)] py-[clamp(12px,calc(16*100vw/1920),16px)] max-lg:px-4 max-lg:py-[14px]";
  const rowFont = cn(
    "text-left text-white",
    "max-lg:[font-family:Pretendard,system-ui,sans-serif] max-lg:text-xs max-lg:font-medium max-lg:leading-[1.35]",
    "lg:font-[family-name:var(--font-nanum)] lg:[font-size:clamp(14px,calc(16*100vw/1920),16px)] lg:[line-height:clamp(22px,calc(24*100vw/1920),24px)] lg:font-semibold",
  );
  const shell = cn(
    "flex min-w-full w-max max-w-[min(calc(100vw-2rem),24rem)] flex-col overflow-hidden rounded-[clamp(16px,calc(20*100vw/1920),20px)] bg-[#32AF32]",
    "shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
    "max-lg:w-full max-lg:rounded-[20px]",
  );

  if (layout === "mobileOptions") {
    const others = options.filter((o) => o !== currentValue);
    const mobileRow = cn(
      "flex w-full min-w-0 items-center justify-start px-[12px] py-[10px] text-left text-white transition-colors",
      "[font-family:Pretendard,system-ui,sans-serif] text-[12px] font-medium leading-[1.35]",
      "hover:bg-white/10 active:bg-white/15",
    );
    return (
      <div
        className={cn(
          "flex w-full min-w-0 flex-col overflow-hidden rounded-[10px] bg-[#32AF32]",
          "shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
        )}
        role="listbox"
        aria-label={listboxAriaLabel}
      >
        {others.map((opt) => (
          <button
            key={String(opt)}
            type="button"
            role="option"
            className={mobileRow}
            onClick={() => onPick(opt)}
          >
            <span className="min-w-0 break-words">
              {formatLabel(String(opt))}
            </span>
          </button>
        ))}
      </div>
    );
  }

  const ordered: T[] = [
    currentValue,
    ...options.filter((o) => o !== currentValue),
  ];

  return (
    <div className={shell}>
      {ordered.map((opt, i) => {
        const isFirst = i === 0;
        const isLast = i === ordered.length - 1;
        const roundT =
          isFirst &&
          "rounded-t-[clamp(16px,calc(20*100vw/1920),20px)] max-lg:rounded-t-[20px]";
        const roundB =
          isLast &&
          "rounded-b-[clamp(16px,calc(20*100vw/1920),20px)] max-lg:rounded-b-[20px]";

        if (opt === currentValue) {
          return (
            <button
              key={opt}
              type="button"
              className={cn(
                "flex w-full shrink-0 items-center justify-between gap-3 bg-[#32AF32] text-white transition-colors hover:bg-white/5",
                rowPad,
                rowFont,
                roundT,
                roundB,
              )}
              onClick={onClose}
              aria-expanded="true"
            >
              <span className="min-w-0 whitespace-nowrap">
                {formatLabel(opt)}
              </span>
              <ChevronUp
                className={cn(filterChevronClass, "text-white")}
                strokeWidth={2}
                aria-hidden
              />
            </button>
          );
        }

        return (
          <button
            key={opt}
            type="button"
            className={cn(
              "flex w-full min-w-0 items-center justify-start bg-[#32AF32] transition-colors hover:bg-white/10",
              rowPad,
              rowFont,
              roundT,
              roundB,
            )}
            onClick={() => onPick(opt)}
          >
            <span className="min-w-0 whitespace-nowrap">
              {formatLabel(opt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── 채용 절차 (모바일 시안: 카드 gap 10 · 내부 gap 20 · 좌 140px 고정, 4단계만 제목 행 유동) ── */
type CareerStep = {
  title: string;
  desc: string;
  /** 2차 면접: 본문 16px + 부가 14px */
  descSmall?: string;
  /** 모바일(lg 미만) 설명만 줄바꿈 — [0] 다음 줄에 [1] */
  descMobileLines?: readonly [string, string];
  /** 모바일 설명 둘째 줄 전용 클래스(예: 2차 면접 부가 문구) */
  descMobileLine2ClassName?: string;
  /** true면 좌측 묶음에 w-[140px] 미적용 (최종 합격·입사) */
  titleRowFluid?: boolean;
};

const MOCK_JOBS_KO: DisplayJob[] = [
  {
    id: 1,
    dept: "생산직",
    deptKey: "production",
    title: "생산관리 담당자",
    type: "정규직",
    typeKey: "full_time",
    exp: "경력 3년 이상",
    expKey: "experienced",
    region: "충북 진천",
    regionKey: "chungbuk",
    createdAt: "2026-02-18",
    status: "모집중",
    statusKey: "open",
    deadlineLine: "~ 2026-02-18",
    isNew: true,
    duties: [
      "생산 라인 관리 및 공정 개선",
      "생산 계획 수립 및 실적 관리",
      "품질 관리 및 안전 관리",
    ],
    requirements: [
      "관련 분야 경력 3년 이상",
      "식품 제조업 경험 우대",
      "HACCP 관련 자격증 보유자 우대",
    ],
  },
  {
    id: 2,
    dept: "생산직",
    deptKey: "production",
    title: "품질관리 담당자",
    type: "정규직",
    typeKey: "full_time",
    exp: "신입/경력",
    expKey: "both",
    region: "충북 진천",
    regionKey: "chungbuk",
    createdAt: "2026-02-18",
    status: "모집중",
    statusKey: "open",
    deadlineLine: "~ 2026-02-18",
    isNew: false,
    duties: [
      "원자재·완제품 품질 검사",
      "불량 원인 분석 및 개선",
      "품질 문서 관리",
    ],
    requirements: [
      "식품공학 관련 전공 우대",
      "HACCP 자격증 보유자 우대",
      "엑셀 기본 능력",
    ],
  },
  {
    id: 3,
    dept: "사무직",
    deptKey: "office",
    title: "경영지원 담당자",
    type: "정규직",
    typeKey: "full_time",
    exp: "경력 1-3년",
    expKey: "experienced",
    region: "서울",
    regionKey: "seoul",
    createdAt: "2026-02-18",
    status: "상시채용",
    statusKey: "always",
    deadlineLine: "상시 모집",
    isNew: false,
    duties: [
      "인사·총무 업무 전반",
      "임직원 복리후생 운영",
      "계약서 및 문서 관리",
    ],
    requirements: [
      "관련 경력 1년 이상",
      "MS Office 능숙자",
      "꼼꼼하고 책임감 있는 분",
    ],
  },
  {
    id: 4,
    dept: "영업직",
    deptKey: "sales",
    title: "영업관리 담당자",
    type: "정규직",
    typeKey: "full_time",
    exp: "경력 3년 이상",
    expKey: "experienced",
    region: "서울",
    regionKey: "seoul",
    createdAt: "2026-02-18",
    status: "마감임박",
    statusKey: "closing",
    deadlineLine: "~ 2026-02-18",
    isNew: true,
    duties: ["B2B 고객사 관리", "신규 거래처 개발", "영업 실적 분석·보고"],
    requirements: [
      "영업 경력 3년 이상",
      "식품·유통 업계 경험 우대",
      "운전면허 소지자",
    ],
  },
  {
    id: 5,
    dept: "마케팅",
    deptKey: "marketing",
    title: "마케팅 전문가",
    type: "정규직",
    typeKey: "full_time",
    exp: "경력 3-5년",
    expKey: "experienced",
    region: "충남",
    regionKey: "chungnam",
    createdAt: "2026-02-18",
    status: "모집중",
    statusKey: "open",
    deadlineLine: "~ 2026-02-18",
    isNew: false,
    duties: [
      "브랜드 마케팅 전략 수립",
      "디지털 캠페인 운영",
      "SNS·콘텐츠 제작 관리",
    ],
    requirements: [
      "마케팅 경력 3년 이상",
      "디지털 마케팅 경험자",
      "포토샵·일러스트 가능자 우대",
    ],
  },
];

const MOCK_JOBS_EN: DisplayJob[] = [
  {
    id: 1,
    dept: "Production",
    deptKey: "production",
    title: "Production supervisor",
    type: "Full-time",
    typeKey: "full_time",
    exp: "3+ years",
    expKey: "experienced",
    region: "Jincheon, Chungbuk",
    regionKey: "chungbuk",
    createdAt: "2026-02-18",
    status: "Open",
    statusKey: "open",
    deadlineLine: "~ 2026-02-18",
    isNew: true,
    duties: [
      "Line operations and process improvement",
      "Production planning and KPI tracking",
      "Quality and safety management",
    ],
    requirements: [
      "3+ years in a related field",
      "Food manufacturing experience preferred",
      "HACCP-related certification preferred",
    ],
  },
  {
    id: 2,
    dept: "Production",
    deptKey: "production",
    title: "Quality control specialist",
    type: "Full-time",
    typeKey: "full_time",
    exp: "Entry / experienced",
    expKey: "both",
    region: "Jincheon, Chungbuk",
    regionKey: "chungbuk",
    createdAt: "2026-02-18",
    status: "Open",
    statusKey: "open",
    deadlineLine: "~ 2026-02-18",
    isNew: false,
    duties: [
      "Raw/finished goods inspection",
      "Root-cause analysis for defects",
      "Quality documentation",
    ],
    requirements: [
      "Food engineering major preferred",
      "HACCP certification preferred",
      "Basic Excel skills",
    ],
  },
  {
    id: 3,
    dept: "Office",
    deptKey: "office",
    title: "Corporate support specialist",
    type: "Full-time",
    typeKey: "full_time",
    exp: "1–3 years",
    expKey: "experienced",
    region: "Seoul",
    regionKey: "seoul",
    createdAt: "2026-02-18",
    status: "Always hiring",
    statusKey: "always",
    deadlineLine: "Open until filled",
    isNew: false,
    duties: [
      "HR and general affairs",
      "Employee benefits programs",
      "Contracts and documentation",
    ],
    requirements: [
      "1+ years of related experience",
      "Proficient in Microsoft Office",
      "Detail-oriented and responsible",
    ],
  },
  {
    id: 4,
    dept: "Sales",
    deptKey: "sales",
    title: "Sales operations specialist",
    type: "Full-time",
    typeKey: "full_time",
    exp: "3+ years",
    expKey: "experienced",
    region: "Seoul",
    regionKey: "seoul",
    createdAt: "2026-02-18",
    status: "Closing soon",
    statusKey: "closing",
    deadlineLine: "~ 2026-02-18",
    isNew: true,
    duties: [
      "B2B account management",
      "New business development",
      "Sales reporting and analysis",
    ],
    requirements: [
      "3+ years in sales",
      "Food or distribution experience preferred",
      "Valid driver’s license",
    ],
  },
  {
    id: 5,
    dept: "Marketing",
    deptKey: "marketing",
    title: "Marketing specialist",
    type: "Full-time",
    typeKey: "full_time",
    exp: "3–5 years",
    expKey: "experienced",
    region: "Chungnam",
    regionKey: "chungnam",
    createdAt: "2026-02-18",
    status: "Open",
    statusKey: "open",
    deadlineLine: "~ 2026-02-18",
    isNew: false,
    duties: [
      "Brand marketing strategy",
      "Digital campaign operations",
      "SNS and content production",
    ],
    requirements: [
      "3+ years in marketing",
      "Digital marketing experience",
      "Photoshop / Illustrator skills preferred",
    ],
  },
];

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const [dbJobs, pageBanner] = await Promise.all([
    getOpenJobPostings().catch(() => [] as DbJobPosting[]),
    getPageBanner("careers").catch(() => null),
  ]);
  return {
    dbJobs,
    pageBanner,
    metaTitle: t("pages.careers.positions.metaTitle"),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const fd = await request.formData();
  if (fd.get("intent") !== "applicationLookup") {
    return data(
      {
        ok: false as const,
        error: t("pages.careers.positions.applicationLookup.lookupError"),
      },
      { status: 400 },
    );
  }
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const password = String(fd.get("password") ?? "").trim();
  if (!name || !phone || !password) {
    return data({
      ok: false as const,
      error: t("pages.careers.positions.applicationLookup.lookupInvalid"),
    });
  }
  try {
    const raw = await lookupJobApplicationsByCredentials({
      applicantName: name,
      phone,
      lookupPassword: password,
    });
    const rows = toJobApplicationLookupRows(raw);
    return data({ ok: true as const, rows });
  } catch {
    return data({
      ok: false as const,
      error: t("pages.careers.positions.applicationLookup.lookupError"),
    });
  }
}

export default function CareersPositionsScreen({
  loaderData,
}: Route.ComponentProps) {
  const { dbJobs, pageBanner } = loaderData;
  const { t, i18n } = useTranslation();

  const labelJobFilter = useCallback(
    (k: JobFilterKey) => t(`pages.careers.positions.filters.job.${k}`),
    [t],
  );
  const labelExpFilter = useCallback(
    (k: ExpFilterKey) => t(`pages.careers.positions.filters.exp.${k}`),
    [t],
  );
  const labelRegionFilter = useCallback(
    (k: RegionFilterKey) => t(`pages.careers.positions.filters.region.${k}`),
    [t],
  );
  const labelStatusFilter = useCallback(
    (k: StatusFilterKey) => t(`pages.careers.positions.filters.status.${k}`),
    [t],
  );

  const keyJobsUi = useMemo(
    () => [
      {
        icon: "/recruit/prod_icon.png",
        label: t("pages.careers.positions.keyJobs.production.label"),
        desc: t("pages.careers.positions.keyJobs.production.desc"),
      },
      {
        icon: "/recruit/manage_icon.png",
        label: t("pages.careers.positions.keyJobs.management.label"),
        desc: t("pages.careers.positions.keyJobs.management.desc"),
      },
      {
        icon: "/recruit/dis_icon.png",
        label: t("pages.careers.positions.keyJobs.scm.label"),
        desc: t("pages.careers.positions.keyJobs.scm.desc"),
      },
      {
        icon: "/recruit/research_icon.png",
        label: t("pages.careers.positions.keyJobs.quality.label"),
        desc: t("pages.careers.positions.keyJobs.quality.desc"),
      },
      {
        icon: "/recruit/marketing_icon.png",
        label: t("pages.careers.positions.keyJobs.marketing.label"),
        desc: t("pages.careers.positions.keyJobs.marketing.desc"),
      },
      {
        icon: "/recruit/skill_icon.png",
        label: t("pages.careers.positions.keyJobs.tech.label"),
        desc: t("pages.careers.positions.keyJobs.tech.desc"),
      },
    ],
    [t],
  );

  const keyJobSummaryTags = useMemo(
    () => [
      t("pages.careers.positions.keyJobTags.t1"),
      t("pages.careers.positions.keyJobTags.t2"),
      t("pages.careers.positions.keyJobTags.t3"),
      t("pages.careers.positions.keyJobTags.t4"),
    ],
    [t],
  );

  const stepsUi = useMemo((): CareerStep[] => {
    const p = (k: string) => `pages.careers.positions.process.${k}`;
    return [
      {
        title: t(`${p("step1")}.title`),
        desc: t(`${p("step1")}.desc`),
        descMobileLines: [t(`${p("step1")}.mobile1`), t(`${p("step1")}.mobile2`)] as const,
      },
      {
        title: t(`${p("step2")}.title`),
        desc: t(`${p("step2")}.desc`),
      },
      {
        title: t(`${p("step3")}.title`),
        desc: t(`${p("step3")}.desc`),
        descMobileLines: [t(`${p("step3")}.mobile1`), t(`${p("step3")}.mobile2`)] as const,
        descMobileLine2ClassName:
          "font-[NanumSquareRound,sans-serif] text-sm font-bold leading-[21px] text-[#1F2121]/60 break-words",
      },
      {
        title: t(`${p("step4")}.title`),
        desc: t(`${p("step4")}.desc`),
        descMobileLines: [t(`${p("step4")}.mobile1`), t(`${p("step4")}.mobile2`)] as const,
        titleRowFluid: true,
      },
    ];
  }, [t]);

  const benefitsStrip = useMemo(
    () => [
      { icon: "/recruit/fi-rr-utensils.png", title: t("pages.careers.positions.benefitsStrip.meal") },
      { icon: "/recruit/fi-rr-school-bus.png", title: t("pages.careers.positions.benefitsStrip.car") },
      { icon: "/recruit/Vector.png", title: t("pages.careers.positions.benefitsStrip.insurance") },
      { icon: "/recruit/Vector-1.png", title: t("pages.careers.positions.benefitsStrip.week5") },
      { icon: "/recruit/Vector-2.png", title: t("pages.careers.positions.benefitsStrip.annual") },
      { icon: "/recruit/Vector-3.png", title: t("pages.careers.positions.benefitsStrip.holiday") },
      { icon: "/recruit/Vector-4.png", title: t("pages.careers.positions.benefitsStrip.family") },
      { icon: "/recruit/Vector-5.png", title: t("pages.careers.positions.benefitsStrip.growth") },
    ],
    [t],
  );

  const [applicationLookupOpen, setApplicationLookupOpen] = useState(false);
  const [applicationLookupStep, setApplicationLookupStep] = useState<
    "form" | "list" | "detail"
  >("form");
  const [applicationLookupDetailRowId, setApplicationLookupDetailRowId] =
    useState<string | null>(null);
  const [lookupName, setLookupName] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupPassword, setLookupPassword] = useState("");
  const [applicationLookupRows, setApplicationLookupRows] = useState<
    JobApplicationLookupRow[] | null
  >(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lookupFetcher = useFetcher<ApplicationLookupFetcherData>();
  const applicationLookupTriggerRef = useRef<HTMLButtonElement>(null);

  const applicationLookupAl = "pages.careers.positions.applicationLookup";
  const applicationLookupDv = `${applicationLookupAl}.detailView`;

  const applicationLookupSelectedRow = useMemo(
    () =>
      applicationLookupDetailRowId && applicationLookupRows
        ? applicationLookupRows.find(
            (r) => r.id === applicationLookupDetailRowId,
          ) ?? null
        : null,
    [applicationLookupDetailRowId, applicationLookupRows],
  );

  useEffect(() => {
    if (!applicationLookupOpen) {
      setApplicationLookupStep("form");
      setApplicationLookupDetailRowId(null);
      setLookupName("");
      setLookupPhone("");
      setLookupPassword("");
      setApplicationLookupRows(null);
      setLookupError(null);
    }
  }, [applicationLookupOpen]);

  useEffect(() => {
    if (lookupFetcher.state !== "idle" || !lookupFetcher.data) return;
    const d = lookupFetcher.data;
    if (d.ok) {
      setApplicationLookupRows(d.rows);
      setApplicationLookupStep("list");
      setLookupError(null);
    } else {
      setLookupError(d.error);
    }
  }, [lookupFetcher.state, lookupFetcher.data]);

  useEffect(() => {
    if (
      applicationLookupOpen &&
      applicationLookupStep === "detail" &&
      !applicationLookupSelectedRow
    ) {
      setApplicationLookupStep("list");
    }
  }, [
    applicationLookupOpen,
    applicationLookupStep,
    applicationLookupSelectedRow,
  ]);

  /* ── 4개 드롭다운 필터 ── */
  const [jobFilter, setJobFilter] = useState<JobFilterKey>("all");
  const [expFilter, setExpFilter] = useState<ExpFilterKey>("all");
  const [regionFilter, setRegionFilter] = useState<RegionFilterKey>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterKey>("all");

  /* 어떤 드롭다운이 열려있는지 */
  const [openDropdown, setOpenDropdown] = useState<
    "job" | "exp" | "region" | "status" | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileFilterPortalRef = useRef<HTMLDivElement>(null);
  const filterRowScrollRef = useRef<HTMLDivElement>(null);
  const jobFilterBtnRef = useRef<HTMLButtonElement>(null);
  const expFilterBtnRef = useRef<HTMLButtonElement>(null);
  const regionFilterBtnRef = useRef<HTMLButtonElement>(null);
  const statusFilterBtnRef = useRef<HTMLButtonElement>(null);

  const isMaxLg = useCareersMaxLg();
  const [filterFloatingPos, setFilterFloatingPos] = useState<{
    top: number;
    left: number;
    minWidth: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!openDropdown || !isMaxLg) {
      setFilterFloatingPos(null);
      return;
    }

    const triggerMap = {
      job: jobFilterBtnRef,
      exp: expFilterBtnRef,
      region: regionFilterBtnRef,
      status: statusFilterBtnRef,
    } as const;

    const measure = () => {
      const el = triggerMap[openDropdown].current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setFilterFloatingPos({
        top: r.bottom + MOBILE_CAREERS_FILTER_FLOAT_OFFSET_Y,
        left: r.left,
        minWidth: r.width,
      });
    };

    measure();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    if (ro) {
      for (const key of ["job", "exp", "region", "status"] as const) {
        const el = triggerMap[key].current;
        if (el) ro.observe(el);
      }
    }

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const sc = filterRowScrollRef.current;
    sc?.addEventListener("scroll", measure);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      sc?.removeEventListener("scroll", measure);
    };
  }, [openDropdown, isMaxLg, jobFilter, expFilter, regionFilter, statusFilter]);

  /* 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (dropdownRef.current?.contains(t)) return;
      if (mobileFilterPortalRef.current?.contains(t)) return;
      setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const jobs = useMemo((): DisplayJob[] => {
    if (loaderData.dbJobs.length === 0) {
      return i18n.language?.startsWith("en") ? MOCK_JOBS_EN : MOCK_JOBS_KO;
    }
    return loaderData.dbJobs.map((j) => {
      const typeKey = (j.job_type ?? "full_time") as DisplayJob["typeKey"];
      const typeUi = t(`pages.careers.shared.jobType.${typeKey}`);
      const expKey = expKeyFromDb(j.experience_level);
      const expLabel = t(`pages.careers.shared.expLevel.${j.experience_level}`);
      const deadlineDate = j.deadline ? new Date(j.deadline) : null;
      const statusKey = statusKeyFromDeadline(deadlineDate);
      const statusUi = t(`pages.careers.positions.jobStatus.${statusKey}`);
      const deadlineLine = deadlineDate
        ? `~ ${format(deadlineDate, "yyyy-MM-dd")}`
        : t("pages.careers.detail.deadlineOpen");
      const createdAt = j.created_at ? new Date(j.created_at) : null;
      const isNew =
        !!createdAt &&
        (Date.now() - createdAt.getTime()) / 86400000 <= 14;
      const lines = (j.description ?? "").split(/\n+/).filter(Boolean);
      return {
        id: j.job_id,
        dept: j.department,
        deptKey: inferDeptKey(j.department),
        title: j.title,
        type: typeUi,
        typeKey,
        exp: expLabel,
        expKey,
        region: j.location ?? "",
        regionKey: inferRegionKey(j.location ?? ""),
        createdAt: j.created_at
          ? new Date(j.created_at).toISOString().slice(0, 10)
          : "",
        status: statusUi,
        statusKey,
        deadlineLine,
        isNew,
        duties: lines.slice(0, 6).length ? lines.slice(0, 6) : [j.description ?? ""],
        requirements: (j.requirements ?? "")
          .split(/\n+/)
          .filter(Boolean)
          .slice(0, 6),
      };
    });
  }, [loaderData.dbJobs, t, i18n.language]);

  const filteredJobs = jobs.filter((j) => {
    const jobOk = jobFilter === "all" || j.deptKey === jobFilter;
    const expOk = expFilter === "all" || j.expKey === expFilter;
    const regionOk = regionFilter === "all" || j.regionKey === regionFilter;
    const statusOk = statusFilter === "all" || j.statusKey === statusFilter;
    return jobOk && expOk && regionOk && statusOk;
  });

  const toggleDropdown = (key: "job" | "exp" | "region" | "status") =>
    setOpenDropdown((prev) => (prev === key ? null : key));

  const handleApplicationLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = lookupName.trim();
    const phone = lookupPhone.trim();
    const password = lookupPassword.trim();
    if (!name || !phone || !password) {
      setLookupError(t(`${applicationLookupAl}.lookupInvalid`));
      return;
    }
    setLookupError(null);
    const fd = new FormData();
    fd.append("intent", "applicationLookup");
    fd.append("name", name);
    fd.append("phone", phone);
    fd.append("password", password);
    lookupFetcher.submit(fd, { method: "post" });
  };

  const lookupSubmitting = lookupFetcher.state !== "idle";

  return (
    <div
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
      )}
    >
      {/* ── 배너 ── */}
      <PageBanner
        imageUrl="/intro/recruit_banner.png"
        title={t("pages.careers.positions.bannerTitle")}
        subtitle={t("pages.careers.positions.bannerSubtitle")}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: t("pages.careers.positions.breadcrumbCareers"), href: "/careers/positions" },
          { label: t("pages.careers.positions.breadcrumbCurrent") },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* ── 주요 모집 직무 (모바일·PC 공통 2×3 그리드 / PC: 카드 좌·아이콘+제목 — 우·설명 space-between) ── */}
      <section>
        <PageContentMax className="py-10 md:py-[clamp(40px,calc(100*100vw/1920),100px)]">
          <div className="flex w-full flex-col gap-5 md:gap-[clamp(16px,calc(30*100vw/1920),30px)]">
            <SectionPageTitle as="h2" preset="responsiveLg" className="mb-0">
              {t("pages.careers.positions.sectionKeyJobs")}
            </SectionPageTitle>
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:gap-3 md:gap-[10px]">
              {keyJobsUi.map(({ icon, label, desc }, index) => (
                <div
                  key={label}
                  className="rounded-[20px] bg-[#EAE3C9] sm:flex sm:items-stretch sm:rounded-2xl md:min-h-[130px] md:overflow-hidden"
                >
                  {/* 모바일: 1번째 카드는 높이 자동·justify-center, 2~6번째는 h 174·justify-start (Figma) */}
                  <div
                    className={cn(
                      "flex w-full flex-col items-center gap-5 p-5 sm:hidden",
                      index === 0
                        ? "min-h-0 justify-center"
                        : "h-[174px] justify-start",
                    )}
                  >
                    <div className="inline-flex items-center justify-center gap-2.5">
                      <div className="relative size-10 shrink-0 overflow-hidden">
                        <img
                          src={icon}
                          alt=""
                          className="h-full max-h-10 w-full max-w-10 object-contain object-center"
                          aria-hidden
                        />
                      </div>
                    </div>
                    <div className="flex w-full flex-col items-center justify-center gap-2.5 self-stretch">
                      <div className="inline-flex w-full items-start justify-start gap-3">
                        <p className="min-w-0 flex-1 text-center font-[family-name:var(--font-nanum)] text-[16px] leading-6 font-extrabold break-words text-[#003F2B]">
                          {label}
                        </p>
                      </div>
                      <p className="text-center font-[family-name:var(--font-nanum)] text-[14px] leading-[21px] font-bold break-words whitespace-pre-line text-[#003F2B] opacity-60">
                        {desc}
                      </p>
                    </div>
                  </div>
                  {/* sm+: 좌(아이콘+제목) · 우(설명) justify-between — PC 레퍼런스 이미지와 동일 */}
                  <div className="hidden w-full min-w-0 flex-1 sm:flex sm:h-full sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-[clamp(20px,calc(40*100vw/1920),40px)] md:gap-[clamp(16px,calc(24*100vw/1920),24px)]">
                    <div className="flex min-w-0 items-center gap-[clamp(12px,calc(20*100vw/1920),20px)] md:gap-[clamp(16px,calc(30*100vw/1920),30px)]">
                      <div className="relative size-[clamp(36px,calc(46*100vw/1920),46px)] shrink-0 overflow-hidden">
                        <img
                          src={icon}
                          alt=""
                          className="h-full w-full object-contain object-center"
                          aria-hidden
                        />
                      </div>
                      <span className="min-w-0 shrink-0 font-[family-name:var(--font-nanum)] text-[clamp(17px,calc(24*100vw/1920),24px)] leading-[clamp(25px,calc(36*100vw/1920),36px)] font-extrabold tracking-[-0.04em] break-words text-[#003F2B] md:break-normal md:whitespace-nowrap">
                        {label}
                      </span>
                    </div>
                    <p className="min-w-0 flex-1 pl-2 text-right font-[family-name:var(--font-nanum)] text-[clamp(13px,calc(18*100vw/1920),18px)] leading-[clamp(19px,calc(27*100vw/1920),27px)] font-bold break-words text-[#003F2B] opacity-60 md:break-normal md:whitespace-nowrap">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <ul
              className="flex w-full list-none flex-wrap items-center justify-start gap-1.5 p-0 md:gap-2"
              aria-label={t("pages.careers.positions.recruitSummaryAria")}
            >
              {keyJobSummaryTags.map((tag) => (
                <li key={tag} className="m-0 p-0">
                  <span className="inline-flex shrink-0 overflow-hidden rounded-full bg-white px-3 py-2 text-center [font-family:Pretendard,system-ui,sans-serif] text-[12px] leading-[12px] font-medium text-[#02633E] shadow-[0_1px_2px_rgba(31,33,33,0.06)] ring-1 ring-[#1F2121]/[0.06] md:py-2 md:leading-[12px] md:tracking-[-0.02em]">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </PageContentMax>
      </section>

      {/* ── 채용 절차: 모바일 세로 / PC 시안 타이틀~카드 간 gap40, 상단 pt60(이전 섹션 pb100과 합산 여백) ── */}
      <section>
        <PageContentMax className="pb-10 md:pt-[clamp(24px,calc(60*100vw/1920),60px)] md:pb-0">
          <div className="flex w-full flex-col gap-5 lg:gap-10">
            <SectionPageTitle
              as="h2"
              preset="responsiveLg"
              className="mb-0 max-lg:pt-5"
            >
              {t("pages.careers.positions.sectionProcess")}
            </SectionPageTitle>

            <div className="grid w-full grid-cols-1 items-stretch gap-y-0 lg:grid-cols-4 lg:gap-x-[min(4px,calc(4*100vw/1920))] lg:gap-y-0">
              {stepsUi.map((step, i) => {
                const isLast = i === stepsUi.length - 1;
                const desktopDesc = step.descSmall
                  ? `${step.desc} ${step.descSmall}`
                  : step.desc;
                return (
                  <div
                    key={step.title}
                    className={cn(
                      "relative min-h-0 w-full lg:h-full",
                      !isLast && "pb-2.5 lg:pb-0",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-full min-h-0 w-full flex-col rounded-[10px] bg-white px-5 py-[30px] lg:min-h-[210px] lg:rounded-[clamp(24px,calc(40*100vw/1920),40px)] lg:py-[clamp(18px,calc(30*100vw/1920),30px)] lg:pr-[clamp(20px,calc(40*100vw/1920),40px)] lg:pl-[clamp(20px,calc(40*100vw/1920),40px)]",
                        isLast && "lg:bg-[#02633E]",
                      )}
                    >
                      {/* 모바일: 가로 4.5 : 1 : 4.5 · 우측 설명 왼쪽 정렬 */}
                      <div className="grid w-full grid-cols-[minmax(0,4.5fr)_minmax(0,1fr)_minmax(0,4.5fr)] items-start gap-x-0 lg:hidden">
                        <div
                          className={cn(
                            "flex min-w-0 items-center gap-2.5",
                            step.titleRowFluid ? "pr-1" : "",
                          )}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#02633E]">
                            <span className="text-center font-[family-name:var(--font-nanum)] text-[14px] leading-[21px] font-bold text-white">
                              {i + 1}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "min-w-0 font-[family-name:var(--font-nanum)] text-[18px] leading-[27px] font-extrabold break-words text-[#02633E]",
                              step.titleRowFluid ? "flex-1" : "",
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                        <div className="min-w-0 shrink-0" aria-hidden />
                        <p className="min-w-0 text-left font-[family-name:var(--font-nanum)] text-[16px] leading-6 font-bold whitespace-normal text-[#1F2121]/60">
                          {step.descMobileLines ? (
                            <>
                              <span className="block text-[#1F2121]/60">
                                {step.descMobileLines[0]}
                              </span>
                              <span
                                className={cn(
                                  "mt-0 block",
                                  step.descMobileLine2ClassName ??
                                    "text-[#1F2121]/60",
                                )}
                              >
                                {step.descMobileLines[1]}
                              </span>
                            </>
                          ) : (
                            <>
                              {step.desc}
                              {step.descSmall ? ` ${step.descSmall}` : ""}
                            </>
                          )}
                        </p>
                      </div>

                      <div className="hidden min-h-0 w-full flex-1 flex-col justify-between gap-0 lg:flex">
                        <div className="flex shrink-0 flex-col gap-3">
                          <div
                            className={cn(
                              "flex size-[clamp(28px,calc(30*100vw/1920),30px)] shrink-0 items-center justify-center rounded-full",
                              isLast ? "bg-white" : "bg-[#02633E]",
                            )}
                          >
                            <span
                              className={cn(
                                "text-center font-[family-name:var(--font-nanum)] text-[16px] leading-6 font-bold break-words",
                                isLast ? "text-[#02633E]" : "text-white",
                              )}
                            >
                              {i + 1}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "font-[family-name:var(--font-nanum)] text-[20px] leading-[30px] font-extrabold break-words",
                              isLast ? "text-white" : "text-[#02633E]",
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "min-w-0 shrink-0 self-stretch font-[family-name:var(--font-nanum)] text-[18px] leading-[27px] font-bold break-words",
                            isLast ? "text-white" : "text-[#1F2121] opacity-60",
                          )}
                        >
                          {desktopDesc}
                        </p>
                      </div>
                    </div>

                    {!isLast && (
                      <>
                        <div
                          className="absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full lg:flex lg:h-[clamp(40px,calc(52*100vw/1920),52px)] lg:w-[clamp(40px,calc(52*100vw/1920),52px)]"
                          style={{
                            right:
                              "calc(-1 * (min(2px, 2 * 100vw / 1920) + clamp(18px, calc(26 * 100vw / 1920), 26px)))",
                            backgroundColor: "#F0EEDD",
                          }}
                        >
                          <ChevronRight
                            className="h-5 w-5 lg:h-[clamp(16px,calc(20*100vw/1920),20px)] lg:w-[clamp(16px,calc(20*100vw/1920),20px)]"
                            style={{ color: "#02633E" }}
                          />
                        </div>

                        <div
                          className="absolute bottom-0 left-1/2 z-10 flex size-[44px] -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-[#EAE3C9] lg:hidden"
                          aria-hidden
                        >
                          <ChevronDown
                            className="size-5 text-[#02633E]"
                            strokeWidth={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ── 채용공고: 시안 — 스파클 마크·제목·지원서 조회/수정 · 아이보리 필터 · 행 링크(/careers/:id) ── */}
      <section>
        <PageContentMax className="pb-10 max-lg:px-0 md:pt-[clamp(40px,calc(100*100vw/1920),100px)] md:pb-[clamp(40px,calc(100*100vw/1920),100px)]">
          <div className="flex w-full flex-col gap-[30px] max-lg:gap-0 lg:gap-[clamp(12px,calc(30*100vw/1920),30px)]">
            {/* 모바일 시안: pt20 px16 gap11 — 제목 18/30 + 우측 pill(12px) 한 줄 / PC는 기존 */}
            <div className="flex w-full items-center gap-[11px] max-lg:pt-5 max-lg:px-4 lg:gap-5 lg:pt-0 lg:px-0">
              <div className="flex shrink-0 items-center lg:h-[42px]">
                <SectionTitleStar
                  variant="brandIntro"
                  className="size-[21px] shrink-0"
                />
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-3">
                <h2 className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121] lg:text-[36px] lg:leading-[54px]">
                  {t("pages.careers.positions.sectionPostings")}
                </h2>
                <button
                  ref={applicationLookupTriggerRef}
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null);
                    setApplicationLookupOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[30.19px] bg-white px-[14px] py-2.5 font-[family-name:var(--font-nanum)] text-xs font-extrabold leading-[15.6px] text-[#1F2121] shadow-sm ring-1 ring-black/[0.06] transition-colors hover:bg-white/90 lg:gap-2.5 lg:rounded-[40px] lg:px-6 lg:py-4 lg:text-base lg:leading-normal"
                >
                  {t("pages.careers.positions.applicationLookup.button")}
                  <FileText
                    className="size-[15px] shrink-0 text-[#1F2121] lg:size-5"
                    aria-hidden
                  />
                </button>
              </div>
            </div>

            <div
              ref={dropdownRef}
              className={cn(
                "flex w-full flex-col overflow-visible",
                openDropdown !== null && "relative z-40",
              )}
            >
              <div
                ref={filterRowScrollRef}
                className={cn(
                  "flex min-h-0 min-w-0 flex-wrap items-center gap-2",
                  "max-lg:w-full max-lg:flex-nowrap max-lg:items-center max-lg:gap-5 max-lg:overflow-x-auto max-lg:px-4 max-lg:py-5 max-lg:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                )}
              >
                <div
                  className={cn(
                    "relative w-fit shrink-0 self-start max-lg:w-auto max-lg:shrink-0 lg:self-center",
                    openDropdown === "job" ? "z-[60]" : "z-30",
                  )}
                >
                  <button
                    ref={jobFilterBtnRef}
                    type="button"
                    onClick={() => toggleDropdown("job")}
                    aria-expanded={openDropdown === "job"}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[40px] bg-[#EAE3C9] px-4 py-2 font-bold text-[#1F2121] transition-colors",
                      careersFilterDropdownFont,
                      "max-lg:gap-0.5 max-lg:rounded-none max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none max-lg:ring-0 max-lg:hover:bg-transparent",
                      "max-lg:[font-family:Pretendard,system-ui,sans-serif] max-lg:text-xs max-lg:font-medium max-lg:leading-none max-lg:text-black",
                      openDropdown === "job" && "max-lg:text-[#32AF32]",
                    )}
                  >
                    {labelJobFilter(jobFilter)}
                    {openDropdown === "job" ? (
                      <ChevronUp
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                  </button>
                  {openDropdown === "job" && !isMaxLg && (
                    <div className="absolute top-0 left-0 z-[80] w-max min-w-full max-lg:w-full">
                      <CareersFilterDropdownFloating
                        currentValue={jobFilter}
                        options={JOB_FILTER_KEYS}
                        formatLabel={(v) => labelJobFilter(v as JobFilterKey)}
                        listboxAriaLabel={t(
                          "pages.careers.positions.filterOptionsAria",
                        )}
                        onPick={(opt) => {
                          setJobFilter(opt);
                          setOpenDropdown(null);
                        }}
                        onClose={() => setOpenDropdown(null)}
                      />
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "relative w-fit shrink-0 self-start max-lg:w-auto max-lg:shrink-0 lg:self-center",
                    openDropdown === "exp" ? "z-[60]" : "z-30",
                  )}
                >
                  <button
                    ref={expFilterBtnRef}
                    type="button"
                    onClick={() => toggleDropdown("exp")}
                    aria-expanded={openDropdown === "exp"}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[40px] bg-[#EAE3C9] px-4 py-2 font-bold text-[#1F2121] transition-colors",
                      careersFilterDropdownFont,
                      "max-lg:gap-0.5 max-lg:rounded-none max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none max-lg:ring-0 max-lg:hover:bg-transparent",
                      "max-lg:[font-family:Pretendard,system-ui,sans-serif] max-lg:text-xs max-lg:font-medium max-lg:leading-none max-lg:text-black",
                      openDropdown === "exp" && "max-lg:text-[#32AF32]",
                    )}
                  >
                    {labelExpFilter(expFilter)}
                    {openDropdown === "exp" ? (
                      <ChevronUp
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                  </button>
                  {openDropdown === "exp" && !isMaxLg && (
                    <div className="absolute top-0 left-0 z-[80] w-max min-w-full max-lg:w-full">
                      <CareersFilterDropdownFloating
                        currentValue={expFilter}
                        options={EXP_FILTER_KEYS}
                        formatLabel={(v) => labelExpFilter(v as ExpFilterKey)}
                        listboxAriaLabel={t(
                          "pages.careers.positions.filterOptionsAria",
                        )}
                        onPick={(opt) => {
                          setExpFilter(opt);
                          setOpenDropdown(null);
                        }}
                        onClose={() => setOpenDropdown(null)}
                      />
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "relative w-fit shrink-0 self-start max-lg:w-auto max-lg:shrink-0 lg:self-center",
                    openDropdown === "region" ? "z-[60]" : "z-30",
                  )}
                >
                  <button
                    ref={regionFilterBtnRef}
                    type="button"
                    onClick={() => toggleDropdown("region")}
                    aria-expanded={openDropdown === "region"}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[40px] bg-[#EAE3C9] px-4 py-2 font-bold text-[#1F2121] transition-colors",
                      careersFilterDropdownFont,
                      "max-lg:gap-0.5 max-lg:rounded-none max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none max-lg:ring-0 max-lg:hover:bg-transparent",
                      "max-lg:[font-family:Pretendard,system-ui,sans-serif] max-lg:text-xs max-lg:font-medium max-lg:leading-none max-lg:text-black",
                      openDropdown === "region" && "max-lg:text-[#32AF32]",
                    )}
                  >
                    {labelRegionFilter(regionFilter)}
                    {openDropdown === "region" ? (
                      <ChevronUp
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                  </button>
                  {openDropdown === "region" && !isMaxLg && (
                    <div className="absolute top-0 left-0 z-[80] w-max min-w-full max-lg:w-full">
                      <CareersFilterDropdownFloating
                        currentValue={regionFilter}
                        options={REGION_FILTER_KEYS}
                        formatLabel={(v) =>
                          labelRegionFilter(v as RegionFilterKey)
                        }
                        listboxAriaLabel={t(
                          "pages.careers.positions.filterOptionsAria",
                        )}
                        onPick={(opt) => {
                          setRegionFilter(opt);
                          setOpenDropdown(null);
                        }}
                        onClose={() => setOpenDropdown(null)}
                      />
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "relative w-fit shrink-0 self-start max-lg:w-auto max-lg:shrink-0 lg:self-center",
                    openDropdown === "status" ? "z-[60]" : "z-30",
                  )}
                >
                  <button
                    ref={statusFilterBtnRef}
                    type="button"
                    onClick={() => toggleDropdown("status")}
                    aria-expanded={openDropdown === "status"}
                    className={cn(
                      "flex items-center gap-2.5 rounded-[40px] bg-[#EAE3C9] px-4 py-2 font-bold text-[#1F2121] transition-colors",
                      careersFilterDropdownFont,
                      "max-lg:gap-0.5 max-lg:rounded-none max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none max-lg:ring-0 max-lg:hover:bg-transparent",
                      "max-lg:[font-family:Pretendard,system-ui,sans-serif] max-lg:text-xs max-lg:font-medium max-lg:leading-none max-lg:text-black",
                      openDropdown === "status" && "max-lg:text-[#32AF32]",
                    )}
                  >
                    {labelStatusFilter(statusFilter)}
                    {openDropdown === "status" ? (
                      <ChevronUp
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    ) : (
                      <ChevronDown
                        className={cn(
                          filterChevronClass,
                          "text-[#1F2121] max-lg:size-3.5 lg:inline",
                        )}
                        strokeWidth={2}
                        aria-hidden
                      />
                    )}
                  </button>
                  {openDropdown === "status" && !isMaxLg && (
                    <div className="absolute top-0 left-0 z-[80] w-max min-w-full max-lg:w-full">
                      <CareersFilterDropdownFloating
                        currentValue={statusFilter}
                        options={STATUS_FILTER_KEYS}
                        formatLabel={(v) =>
                          labelStatusFilter(v as StatusFilterKey)
                        }
                        listboxAriaLabel={t(
                          "pages.careers.positions.filterOptionsAria",
                        )}
                        onPick={(opt) => {
                          setStatusFilter(opt);
                          setOpenDropdown(null);
                        }}
                        onClose={() => setOpenDropdown(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col max-lg:px-4 lg:border-t lg:border-black/20">
              {filteredJobs.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  {t("pages.careers.positions.emptyFiltered")}
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const deadlineMobile = job.deadlineLine.replace(/^~\s*/, "");
                  return (
                    <Link
                      key={job.id}
                      to={`/careers/${job.id}`}
                      className={cn(
                        "group flex w-full bg-transparent transition-colors",
                        "max-lg:hover:bg-[#F4F2E5] lg:hover:bg-[#F0EEDD]",
                        "border-b border-black/20 lg:last:border-b-0",
                        "max-lg:items-center max-lg:justify-between max-lg:gap-3 max-lg:py-3",
                        "lg:flex-row lg:items-center lg:gap-10 lg:p-[30px]",
                      )}
                    >
                      {/* 모바일 시안: 뱃지 행 → 제목·부서 → 메타 한 줄 → 날짜 · 우측 쉐브론 */}
                      <div className="flex min-w-0 flex-1 flex-col gap-2.5 lg:hidden">
                        <div className="flex flex-wrap items-start gap-1.5">
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-3 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3",
                              job.statusKey === "open" &&
                                "bg-[#32AF32] text-white",
                              job.statusKey === "closing" &&
                                "bg-[#F3BC1E] text-[#1F2121]",
                              job.statusKey === "always" &&
                                "bg-[#003F2B] text-white",
                            )}
                          >
                            {job.status}
                          </span>
                          {job.isNew && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-[#FF5D5D] px-3 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3 text-white">
                              {t("pages.careers.positions.newBadge")}
                            </span>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col gap-2.5">
                          <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex min-w-0 flex-wrap items-center gap-1">
                              <span className="font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[27px] text-[#1F2121]">
                                {job.title}
                              </span>
                              <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
                                {job.dept}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]">
                              <span>{job.exp}</span>
                              <span>{job.region}</span>
                              <span>{job.type}</span>
                            </div>
                          </div>
                          <p className="font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]">
                            {deadlineMobile}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className="size-[18px] shrink-0 self-center text-[#02633E] lg:hidden"
                        strokeWidth={2}
                        aria-hidden
                      />

                      {/* PC 행 — 시안: padding 30px·gap 40px는 Link(lg:p) + 본 행 gap-10 */}
                      <div className="hidden min-w-0 flex-1 flex-row items-center gap-10 lg:flex">
                        <div className="flex w-[80px] shrink-0 flex-col items-center justify-center gap-2.5">
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-3 py-2 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-[12px]",
                              job.statusKey === "open" &&
                                "bg-[#32AF32] text-white",
                              job.statusKey === "closing" &&
                                "bg-[#FFD55D] text-[#1F2121]",
                              job.statusKey === "always" &&
                                "bg-[#003F2B] text-white",
                            )}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-3 self-stretch">
                          <p className="font-[family-name:var(--font-nanum)] text-2xl font-extrabold leading-9 text-[#1F2121]">
                            {job.title}
                          </p>
                          <p className="font-[family-name:var(--font-nanum)] text-lg font-bold leading-[27px] text-[#1F2121]">
                            {job.dept}
                          </p>
                          {job.isNew ? (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-[#FF5D5D] px-1.5 py-1 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3 text-white">
                              {t("pages.careers.positions.newBadge")}
                            </span>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-5">
                          {[job.exp, job.region, job.type, job.deadlineLine].map(
                            (cell, mi) => (
                              <p
                                key={`${job.id}-meta-${mi}`}
                                className="w-[100px] shrink-0 text-center font-[family-name:var(--font-nanum)] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]"
                              >
                                {cell}
                              </p>
                            ),
                          )}
                        </div>
                        <span
                          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-[var(--site-chrome-header-bg,#FDFDF5)] text-[#02633E] transition-colors group-hover:bg-[#EAE3C9]"
                          aria-hidden
                        >
                          <ChevronRight
                            className="size-[18px]"
                            strokeWidth={2}
                          />
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </PageContentMax>

        {applicationLookupOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <button
              type="button"
              className="fixed inset-0 z-[200] cursor-default border-0 bg-black/50 p-0"
              aria-label={t(
                "pages.careers.positions.applicationLookup.backdropCloseAria",
              )}
              onClick={() => setApplicationLookupOpen(false)}
            />,
            document.body,
          )}

        {/*
          modal={false}: Radix 기본 오버레이의 RemoveScroll이 html/body h-full 레이아웃과 맞물릴 때
          스크롤이 맨 위로 튀는 Chrome 이슈를 피함. 딤은 위 포털 버튼으로 동일하게 처리.
        */}
        <Dialog
          modal={false}
          open={applicationLookupOpen}
          onOpenChange={setApplicationLookupOpen}
        >
          <DialogContent
            className={cn(
              "z-[210] max-w-[calc(100vw-2rem)] gap-6 rounded-[24px] border-0 bg-white p-6",
              applicationLookupStep === "detail" &&
                "flex max-h-[min(90vh,900px)] flex-col overflow-hidden",
              applicationLookupStep === "form" && "sm:max-w-md",
              (applicationLookupStep === "list" ||
                applicationLookupStep === "detail") &&
                "sm:max-w-lg",
            )}
            onOpenAutoFocus={(e) => {
              if (applicationLookupStep !== "form") {
                e.preventDefault();
                return;
              }
              e.preventDefault();
              requestAnimationFrame(() => {
                document
                  .getElementById("career-lookup-name")
                  ?.focus({ preventScroll: true });
              });
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              applicationLookupTriggerRef.current?.focus({
                preventScroll: true,
              });
            }}
          >
            <DialogHeader
              className={cn(
                "gap-2 text-left",
                applicationLookupStep === "detail" && "shrink-0",
              )}
            >
              <DialogTitle className="font-[family-name:var(--font-nanum)] text-xl font-extrabold text-[#1F2121]">
                {applicationLookupStep === "detail"
                  ? t(`${applicationLookupDv}.title`)
                  : t(`${applicationLookupAl}.title`)}
              </DialogTitle>
              {applicationLookupStep === "form" ? (
                <DialogDescription className="font-[family-name:var(--font-nanum)] text-sm text-[#1F2121]/70">
                  {t(`${applicationLookupAl}.subtitle`)}
                </DialogDescription>
              ) : applicationLookupStep === "list" ? (
                <div
                  className="space-y-1 font-[family-name:var(--font-nanum)] text-sm text-[#1F2121]/70"
                  role="status"
                >
                  <p>
                    {t(`${applicationLookupAl}.listIntro`, {
                      count: applicationLookupRows?.length ?? 0,
                    })}
                  </p>
                  <p className="text-xs leading-relaxed text-[#1F2121]/60">
                    {t(`${applicationLookupAl}.listPrivacyNote`)}
                  </p>
                </div>
              ) : null}
            </DialogHeader>
            {applicationLookupStep === "form" ? (
              <form
                onSubmit={handleApplicationLookupSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="career-lookup-name"
                    className="font-[family-name:var(--font-nanum)] text-sm font-bold text-[#1F2121]"
                  >
                    {t(`${applicationLookupAl}.name`)}
                  </label>
                  <input
                    id="career-lookup-name"
                    autoComplete="name"
                    value={lookupName}
                    onChange={(e) => setLookupName(e.target.value)}
                    placeholder={t("pages.careers.apply.phName")}
                    className="rounded-[10px] border border-[#E5E0D4] bg-white px-4 py-3 font-[family-name:var(--font-nanum)] text-base text-[#1F2121] outline-none focus:border-[#02633E] focus:ring-2 focus:ring-[#02633E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="career-lookup-phone"
                    className="font-[family-name:var(--font-nanum)] text-sm font-bold text-[#1F2121]"
                  >
                    {t(`${applicationLookupAl}.phone`)}
                  </label>
                  <input
                    id="career-lookup-phone"
                    autoComplete="tel"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    placeholder={t(
                      "pages.careers.positions.form.contactPlaceholder",
                    )}
                    className="rounded-[10px] border border-[#E5E0D4] bg-white px-4 py-3 font-[family-name:var(--font-nanum)] text-base text-[#1F2121] outline-none focus:border-[#02633E] focus:ring-2 focus:ring-[#02633E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="career-lookup-password"
                    className="font-[family-name:var(--font-nanum)] text-sm font-bold text-[#1F2121]"
                  >
                    {t(`${applicationLookupAl}.password`)}
                  </label>
                  <input
                    id="career-lookup-password"
                    type="password"
                    autoComplete="current-password"
                    value={lookupPassword}
                    onChange={(e) => setLookupPassword(e.target.value)}
                    placeholder={t(`${applicationLookupAl}.passwordHint`)}
                    className="rounded-[10px] border border-[#E5E0D4] bg-white px-4 py-3 font-[family-name:var(--font-nanum)] text-base text-[#1F2121] outline-none focus:border-[#02633E] focus:ring-2 focus:ring-[#02633E]"
                  />
                </div>
                {lookupError ? (
                  <p
                    className="font-[family-name:var(--font-nanum)] text-sm font-medium text-[#E03E3E]"
                    role="alert"
                  >
                    {lookupError}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={lookupSubmitting}
                  className="mt-2 w-full rounded-[40px] py-4 font-[family-name:var(--font-nanum)] text-base font-extrabold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: "#02633E" }}
                >
                  {lookupSubmitting
                    ? t(`${applicationLookupAl}.lookupSubmitting`)
                    : t(`${applicationLookupAl}.submit`)}
                </button>
              </form>
            ) : applicationLookupStep === "list" ? (
              <div className="flex flex-col gap-4">
                <div className="max-h-[min(420px,60vh)] space-y-3 overflow-y-auto pr-1">
                  {applicationLookupRows?.length === 0 ? (
                    <p className="rounded-[14px] border border-[#E5E0D4] bg-white p-6 text-center font-[family-name:var(--font-nanum)] text-sm text-[#1F2121]/80">
                      {t(`${applicationLookupAl}.lookupNoResults`)}
                    </p>
                  ) : (
                    (applicationLookupRows ?? []).map((row) => {
                      const badgeKey = applicationLookupStatusBadgeKey(
                        row.status,
                      );
                      return (
                        <div
                          key={row.id}
                          className="rounded-[14px] border border-[#E5E0D4] bg-white p-4 shadow-sm lg:flex lg:items-center lg:gap-6 lg:py-5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5 gap-x-2">
                              <span className="inline-flex shrink-0 rounded-full bg-[#E8E8E8] px-2.5 py-1 [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium text-[#1F2121]">
                                {t(`${applicationLookupAl}.${badgeKey}`)}
                              </span>
                              <span className="[font-family:Pretendard,system-ui,sans-serif] text-xs font-medium text-[#1F2121]/80">
                                {row.dept}
                              </span>
                            </div>
                            <p className="mt-3 font-[family-name:var(--font-nanum)] text-base font-extrabold text-[#1F2121]">
                              {row.title}
                            </p>
                            <p className="mt-1 font-[family-name:var(--font-nanum)] text-xs text-[#1F2121]/70">
                              {t(`${applicationLookupAl}.appliedOn`, {
                                date: row.appliedAt,
                              })}
                            </p>
                            {row.showCannotEditHint ? (
                              <p className="mt-2 font-[family-name:var(--font-nanum)] text-xs font-medium text-[#E03E3E]">
                                {t(`${applicationLookupAl}.cannotEditHint`)}
                              </p>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "mt-3 flex w-full min-w-0 shrink-0 gap-2 max-lg:flex-row max-lg:flex-nowrap",
                              "lg:mt-0 lg:w-[min(200px,32%)] lg:min-w-[148px] lg:flex-col lg:items-stretch",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setApplicationLookupDetailRowId(row.id);
                                setApplicationLookupStep("detail");
                              }}
                              className={cn(
                                applicationLookupListActionBtn,
                                "lg:w-full",
                              )}
                            >
                              {t(`${applicationLookupAl}.detail`)}
                            </button>
                            {row.canEdit ? (
                              <Link
                                to={`/careers/${row.detailJobId}/apply`}
                                viewTransition
                                onClick={() => setApplicationLookupOpen(false)}
                                className={cn(
                                  applicationLookupListActionBtn,
                                  "lg:w-full",
                                )}
                              >
                                {t(`${applicationLookupAl}.edit`)}
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className={cn(
                                  applicationLookupListActionBtn,
                                  "lg:w-full cursor-not-allowed opacity-60 hover:bg-[#EAE3C9]",
                                )}
                              >
                                {t(`${applicationLookupAl}.cannotEdit`)}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setApplicationLookupStep("form")}
                  className="w-full rounded-[40px] border border-[#E5E0D4] bg-white py-3 font-[family-name:var(--font-nanum)] text-sm font-extrabold text-[#1F2121] transition-colors hover:bg-black/[0.02]"
                >
                  {t(`${applicationLookupAl}.backToForm`)}
                </button>
              </div>
            ) : applicationLookupSelectedRow ? (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
                <div className="shrink-0 rounded-2xl border border-[#E5E0D4] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-1.5 gap-x-2">
                    <span className="inline-flex shrink-0 rounded-full bg-[#E8E8E8] px-2.5 py-1 [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium text-[#1F2121]">
                      {t(
                        `${applicationLookupAl}.${applicationLookupStatusBadgeKey(
                          applicationLookupSelectedRow.status,
                        )}`,
                      )}
                    </span>
                    <span className="[font-family:Pretendard,system-ui,sans-serif] text-xs font-medium text-[#1F2121]/80">
                      {applicationLookupSelectedRow.dept}
                    </span>
                  </div>
                  <p className="mt-3 font-[family-name:var(--font-nanum)] text-lg font-extrabold text-[#1F2121] max-sm:text-base">
                    {applicationLookupSelectedRow.title}
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-nanum)] text-xs text-[#1F2121]/70">
                    {t(`${applicationLookupAl}.appliedOn`, {
                      date: applicationLookupSelectedRow.appliedAt,
                    })}
                  </p>
                </div>
                <div className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-[#E5E0D4] bg-white p-4 pr-3">
                  <div className="space-y-6 pr-1">
                    <section className="space-y-3">
                      <h3 className="font-[family-name:var(--font-nanum)] text-base font-bold text-[#02633E]">
                        {t(`${applicationLookupDv}.sectionBasic`)}
                      </h3>
                      <ul className="space-y-2">
                        {(
                          [
                            `${t(`${APPLY_NS}.reviewName`)} : ${applicationLookupSelectedRow.detail.applicant_name || "—"}`,
                            `${t(`${APPLY_NS}.reviewEmail`)} : ${applicationLookupSelectedRow.detail.email || "—"}`,
                            `${t(`${APPLY_NS}.reviewBirth`)} : ${applicationLookupSelectedRow.detail.birth_date?.trim() || "—"}`,
                            `${t(`${APPLY_NS}.reviewPhone`)} : ${applicationLookupSelectedRow.detail.phone || "—"}`,
                            `${t(`${APPLY_NS}.reviewAddress`)} : ${applicationLookupSelectedRow.detail.address?.trim() || "—"}`,
                          ] as const
                        ).map((line, i) => (
                          <li
                            key={i}
                            className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121] whitespace-pre-line"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <hr className="border-[#E5E0D4]" />
                    <section className="space-y-3">
                      <h3 className="font-[family-name:var(--font-nanum)] text-base font-bold text-[#02633E]">
                        {t(`${applicationLookupDv}.sectionEducation`)}
                      </h3>
                      <ul className="space-y-2">
                        {(
                          [
                            `${t(`${APPLY_NS}.labelEduLevelPlain`)} : ${lookupFormatEducation(t, applicationLookupSelectedRow.detail.education_level)}`,
                            `${t(`${APPLY_NS}.labelSchool`)} : ${applicationLookupSelectedRow.detail.school_name?.trim() || "—"}`,
                            `${t(`${APPLY_NS}.labelMajor`)} : ${applicationLookupSelectedRow.detail.major?.trim() || "—"}`,
                            `${t(`${APPLY_NS}.labelGradMonth`)} : ${applicationLookupSelectedRow.detail.graduation_month?.trim() || "—"}`,
                          ] as const
                        ).map((line, i) => (
                          <li
                            key={i}
                            className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121] whitespace-pre-line"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <hr className="border-[#E5E0D4]" />
                    <section className="space-y-3">
                      <h3 className="font-[family-name:var(--font-nanum)] text-base font-bold text-[#02633E]">
                        {t(`${applicationLookupDv}.sectionCareer`)}
                      </h3>
                      <ul className="space-y-2">
                        {(
                          [
                            `${t(`${APPLY_NS}.labelCareerTypePlain`)} : ${lookupFormatCareer(t, applicationLookupSelectedRow.detail.experience_kind)}`,
                            `${t(`${APPLY_NS}.military`)} : ${lookupFormatMilitary(t, applicationLookupSelectedRow.detail.military_service)}`,
                            `${t(`${APPLY_NS}.labelCurrentCompany`)} : ${applicationLookupSelectedRow.detail.current_company?.trim() || "—"}`,
                            `${t(`${APPLY_NS}.labelCurrentRole`)} : ${applicationLookupSelectedRow.detail.current_position?.trim() || "—"}`,
                          ] as const
                        ).map((line, i) => (
                          <li
                            key={i}
                            className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121] whitespace-pre-line"
                          >
                            {line}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <hr className="border-[#E5E0D4]" />
                    <section className="space-y-3">
                      <h3 className="font-[family-name:var(--font-nanum)] text-base font-bold text-[#02633E]">
                        {t(`${applicationLookupDv}.sectionMotivation`)}
                      </h3>
                      <p className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121] whitespace-pre-line">
                        {applicationLookupSelectedRow.detail.cover_letter?.trim() ||
                          "—"}
                      </p>
                    </section>
                    <hr className="border-[#E5E0D4]" />
                    <section className="space-y-3">
                      <h3 className="font-[family-name:var(--font-nanum)] text-base font-bold text-[#02633E]">
                        {t(`${applicationLookupDv}.sectionAttachments`)}
                      </h3>
                      {applicationLookupSelectedRow.detail.resume_url ||
                      applicationLookupSelectedRow.detail.self_intro_file_url ||
                      applicationLookupSelectedRow.detail.portfolio_url ? (
                        <ul className="space-y-2">
                          {applicationLookupSelectedRow.detail.resume_url ? (
                            <li className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121]">
                              <span className="font-bold text-[#1F2121]">
                                {t(`${APPLY_NS}.labelResumePlain`)} :{" "}
                              </span>
                              <a
                                href={
                                  applicationLookupSelectedRow.detail
                                    .resume_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="break-all text-[#02633E] underline underline-offset-2"
                              >
                                {attachmentNameFromUrl(
                                  applicationLookupSelectedRow.detail
                                    .resume_url,
                                )}{" "}
                                ({t(`${applicationLookupDv}.attachmentOpen`)})
                              </a>
                            </li>
                          ) : null}
                          {applicationLookupSelectedRow.detail
                            .self_intro_file_url ? (
                            <li className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121]">
                              <span className="font-bold text-[#1F2121]">
                                {t(`${APPLY_NS}.labelClPlain`)} :{" "}
                              </span>
                              <a
                                href={
                                  applicationLookupSelectedRow.detail
                                    .self_intro_file_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="break-all text-[#02633E] underline underline-offset-2"
                              >
                                {attachmentNameFromUrl(
                                  applicationLookupSelectedRow.detail
                                    .self_intro_file_url,
                                )}{" "}
                                ({t(`${applicationLookupDv}.attachmentOpen`)})
                              </a>
                            </li>
                          ) : null}
                          {applicationLookupSelectedRow.detail.portfolio_url ? (
                            <li className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121]">
                              <span className="font-bold text-[#1F2121]">
                                {t(`${APPLY_NS}.labelPortfolioPlain`)} :{" "}
                              </span>
                              <a
                                href={
                                  applicationLookupSelectedRow.detail
                                    .portfolio_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="break-all text-[#02633E] underline underline-offset-2"
                              >
                                {attachmentNameFromUrl(
                                  applicationLookupSelectedRow.detail
                                    .portfolio_url,
                                )}{" "}
                                ({t(`${applicationLookupDv}.attachmentOpen`)})
                              </a>
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p className="font-[family-name:var(--font-nanum)] text-sm leading-relaxed text-[#1F2121]/80">
                          {t(`${applicationLookupDv}.attachmentNone`)}
                        </p>
                      )}
                    </section>
                  </div>
                </div>
                <div className="flex w-full shrink-0 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setApplicationLookupStep("list");
                      setApplicationLookupDetailRowId(null);
                    }}
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#EAE3C9] px-4 py-3 font-[family-name:var(--font-nanum)] text-sm font-extrabold text-[#1F2121] max-lg:text-xs"
                  >
                    {t(`${applicationLookupDv}.backToList`)}
                  </button>
                  {applicationLookupSelectedRow.canEdit ? (
                    <Link
                      to={`/careers/${applicationLookupSelectedRow.detailJobId}/apply`}
                      viewTransition
                      onClick={() => setApplicationLookupOpen(false)}
                      className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-[#02633E] px-4 py-3 font-[family-name:var(--font-nanum)] text-sm font-extrabold text-white max-lg:text-xs"
                    >
                      {t(`${applicationLookupAl}.edit`)}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex min-h-[44px] flex-1 cursor-not-allowed items-center justify-center rounded-full bg-[#02633E]/40 px-4 py-3 font-[family-name:var(--font-nanum)] text-sm font-extrabold text-white/90 max-lg:text-xs"
                    >
                      {t(`${applicationLookupAl}.edit`)}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </section>

      {/* ── 복리후생: 시안/HTML — 흰 배경은 max-w(1920) 밖까지 뷰포트 전폭(줌아웃·초와이드에서 크롬색 안 비치게) */}
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "mb-[clamp(40px,calc(100*100vw/1920),100px)] min-w-0 bg-white",
        )}
      >
        <PageContentMax className="py-10 md:py-[clamp(40px,calc(100*100vw/1920),100px)]">
          <div className="flex w-full flex-col gap-6 md:gap-[clamp(16px,calc(30*100vw/1920),30px)]">
            <SectionPageTitle
              as="h2"
              preset="responsiveLg"
              starVariant="brandIntro"
              className="mb-0 w-full"
              titleClassName="max-lg:text-[#1F2121]"
            >
              {t("pages.careers.positions.sectionBenefits")}
            </SectionPageTitle>

            {/* PC: SectionPageTitle responsiveLg — 마크 21px + lg:gap-5(1.25rem) = 제목 텍스트 시작선; 그만큼 들여 첫 카드 왼쪽 정렬 일치 */}
            <div className="grid w-full grid-cols-3 gap-x-2 gap-y-5 max-lg:gap-y-6 lg:grid-cols-4 lg:gap-x-[clamp(16px,calc(40*100vw/1920),48px)] lg:gap-y-[clamp(28px,calc(48*100vw/1920),56px)] lg:pl-[calc(21px+1.25rem)]">
              {benefitsStrip.map((b) => (
                <div
                  key={b.title}
                  className={cn(
                    "flex w-full min-w-0 flex-col items-center gap-1.5 max-lg:gap-1.5",
                    "lg:items-start lg:gap-3",
                  )}
                >
                  <div
                    className={cn(
                      "flex w-full shrink-0 items-center justify-center bg-transparent",
                      "h-10 max-lg:h-11",
                      "lg:h-[clamp(48px,calc(56*100vw/1920),56px)] lg:justify-start",
                    )}
                    aria-hidden
                  >
                    <img
                      src={b.icon}
                      alt=""
                      className={cn(
                        "w-auto object-contain object-center",
                        "h-[26px] max-lg:h-[26px]",
                        "lg:h-[clamp(40px,calc(48*100vw/1920),52px)] lg:max-w-[min(100%,64px)] lg:object-left",
                      )}
                      aria-hidden
                    />
                  </div>
                  <p
                    className={cn(
                      "w-full text-center font-[family-name:var(--font-nanum)] font-bold text-[#1F2121]",
                      "text-[12px] leading-[16px] tracking-tight max-lg:[word-break:keep-all]",
                      "lg:text-left lg:[font-size:clamp(16px,calc(20*100vw/1920),20px)] lg:[line-height:clamp(24px,calc(30*100vw/1920),30px)]",
                    )}
                  >
                    {b.title}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-left font-[family-name:var(--font-nanum)] text-xs leading-[18px] font-bold text-[#1F2121] opacity-40 max-lg:mt-1 md:mt-0 md:text-[14px] md:leading-[21px] lg:pl-[calc(21px+1.25rem)]">
              {t("pages.careers.positions.benefitsFootnote")}
            </p>
          </div>
        </PageContentMax>
      </section>

      {/* 모바일: 필터 행 `overflow-x-auto` + 형제 공고 목록 때문에 absolute 패널이 잘리거나 가려짐 → body 고정 레이어 */}
      {typeof document !== "undefined" &&
        isMaxLg &&
        openDropdown &&
        filterFloatingPos &&
        createPortal(
          <div
            ref={mobileFilterPortalRef}
            className="pointer-events-auto fixed z-[105]"
            style={{
              top: filterFloatingPos.top,
              left: filterFloatingPos.left,
              width: MOBILE_CAREERS_FILTER_PANEL_WIDTH_PX,
              minWidth: MOBILE_CAREERS_FILTER_PANEL_WIDTH_PX,
              maxWidth: MOBILE_CAREERS_FILTER_PANEL_WIDTH_PX,
            }}
          >
            {openDropdown === "job" && (
              <CareersFilterDropdownFloating
                currentValue={jobFilter}
                options={JOB_FILTER_KEYS}
                formatLabel={(v) => labelJobFilter(v as JobFilterKey)}
                listboxAriaLabel={t("pages.careers.positions.filterOptionsAria")}
                layout="mobileOptions"
                onPick={(opt) => {
                  setJobFilter(opt);
                  setOpenDropdown(null);
                }}
                onClose={() => setOpenDropdown(null)}
              />
            )}
            {openDropdown === "exp" && (
              <CareersFilterDropdownFloating
                currentValue={expFilter}
                options={EXP_FILTER_KEYS}
                formatLabel={(v) => labelExpFilter(v as ExpFilterKey)}
                listboxAriaLabel={t("pages.careers.positions.filterOptionsAria")}
                layout="mobileOptions"
                onPick={(opt) => {
                  setExpFilter(opt);
                  setOpenDropdown(null);
                }}
                onClose={() => setOpenDropdown(null)}
              />
            )}
            {openDropdown === "region" && (
              <CareersFilterDropdownFloating
                currentValue={regionFilter}
                options={REGION_FILTER_KEYS}
                formatLabel={(v) => labelRegionFilter(v as RegionFilterKey)}
                listboxAriaLabel={t("pages.careers.positions.filterOptionsAria")}
                layout="mobileOptions"
                onPick={(opt) => {
                  setRegionFilter(opt);
                  setOpenDropdown(null);
                }}
                onClose={() => setOpenDropdown(null)}
              />
            )}
            {openDropdown === "status" && (
              <CareersFilterDropdownFloating
                currentValue={statusFilter}
                options={STATUS_FILTER_KEYS}
                formatLabel={(v) => labelStatusFilter(v as StatusFilterKey)}
                listboxAriaLabel={t("pages.careers.positions.filterOptionsAria")}
                layout="mobileOptions"
                onPick={(opt) => {
                  setStatusFilter(opt);
                  setOpenDropdown(null);
                }}
                onClose={() => setOpenDropdown(null)}
              />
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
