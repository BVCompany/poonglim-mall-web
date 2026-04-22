/**
 * 채용안내 통합 페이지
 *
 * 주요 모집 직무 / 채용 절차 / 채용공고(4-드롭다운 필터) / 입사지원 / 복리후생
 *
 * 섹션 타이틀(PC·모바일): 녹색 네모 장식 없음 — 반드시 `SectionPageTitle` + 스파클 PNG(`starVariant`).
 * 복리후생은 시안과 동일한 녹색 톤 마크 → `introVector`(/intro/Vector.png), 모바일 섹션 타이틀 텍스트는 `#1F2121`.
 */
import type { JobPosting as DbJobPosting } from "../lib/queries.server";
import type { Route } from "./+types/positions";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Paperclip,
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
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import { getOpenJobPostings } from "../lib/queries.server";
import i18next from "~/core/lib/i18next.server";

/* ── 타입 ── */
type MainTab = "all" | "list" | "apply";

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

/** 입사지원·공장견학과 동일한 메일 도메인 프리셋(직접입력은 i18n) */
const JOB_APPLY_EMAIL_DOMAINS = [
  "gmail.com",
  "naver.com",
  "kakao.com",
  "hanmail.net",
  "nate.com",
] as const;

/**
 * 모바일 채용 필터(body 포털) 세로 위치: 트리거 `getBoundingClientRect().bottom` 기준 추가 오프셋(px).
 * 더 내리려면 값을 키우고, 트리거 상단에 맞추려면 `useLayoutEffect` 안 `measure`에서 `top: r.top + …` 로 바꾸면 됩니다.
 */
const MOBILE_CAREERS_FILTER_FLOAT_OFFSET_Y = 6;
/** 모바일 채용 필터 플로팅 패널 가로 너비(px) */
const MOBILE_CAREERS_FILTER_PANEL_WIDTH_PX = 100;

/** 모바일 필터 트리거 라벨: Pretendard 12px / 500 (시안) */
const careersFilterDropdownFont =
  "[font-family:Pretendard,system-ui,sans-serif] max-lg:text-[12px] max-lg:font-medium max-lg:leading-none lg:[font-size:clamp(14px,calc(16*100vw/1920),16px)] lg:[line-height:clamp(20px,calc(24*100vw/1920),24px)]";

const jobApplyButtonFont =
  "[font-family:Pretendard,system-ui,sans-serif] text-[13px] font-bold leading-[19.5px] lg:[font-size:clamp(13px,calc(14*100vw/1920),14px)] lg:[line-height:clamp(19px,calc(21*100vw/1920),21px)]";

/** 공고 카드 요약 행 — 시안(1920) 메타 태그 pill */
const jobCardMetaTagClass =
  "rounded-full bg-[#F0EEDD] px-[clamp(8px,calc(12*100vw/1920),12px)] py-[clamp(6px,calc(8*100vw/1920),8px)] text-center font-normal uppercase text-[#1F2121] [font-size:clamp(11px,calc(12*100vw/1920),12px)] [line-height:clamp(14px,calc(16.8*100vw/1920),16.8px)]";

const jobCardDeptBadgeClass =
  "rounded-full bg-[#F0EEDD] text-center font-medium text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif] max-lg:px-3 max-lg:py-1.5 max-lg:text-xs max-lg:leading-3 px-[clamp(8px,calc(12*100vw/1920),12px)] py-[clamp(6px,calc(8*100vw/1920),8px)] [font-size:clamp(11px,calc(12*100vw/1920),12px)] [line-height:clamp(11px,calc(12*100vw/1920),12px)]";

/** 모바일 시안: 일자·펼침 메타 — 12px Nanum uppercase lh 16.8, 왼쪽 정렬 */
const jobCardMetaPlainMobile =
  "text-left font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]";

/** 모바일 시안: 경력·지역·유형 한 줄 — 14px Nanum uppercase lh 19.6 */
const jobCardMetaRowMobile =
  "text-left font-[family-name:var(--font-nanum)] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]";

/** 아코디언 펼침 — 모바일: Nanum 16/24 · 14/19.6 세로 나열 / PC: clamp */
const jobCardDetailHeadingClass =
  "font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#1F2121] lg:font-sans lg:[font-size:clamp(15px,calc(18*100vw/1920),18px)] lg:[line-height:clamp(22px,calc(27*100vw/1920),27px)]";

const jobCardDetailLineClass =
  "block w-full text-left font-[family-name:var(--font-nanum)] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121] lg:inline lg:font-sans lg:[font-size:clamp(13px,calc(14*100vw/1920),14px)] lg:[line-height:clamp(17px,calc(19.6*100vw/1920),19.6px)]";

/** 입사지원 폼 입력 — PC 시안: 60높이·10r·16px 패딩·Nanum 18·#1F2121 / 모바일: 기존 */
const jobApplyInputClass = cn(
  "w-full border border-[#E5E0D4] bg-white outline-none transition-colors",
  "rounded-lg px-4 py-3 text-sm focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]",
  "max-lg:h-[60px] max-lg:rounded-[10px] max-lg:border-0 max-lg:px-4 max-lg:py-[18px]",
  "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-normal max-lg:leading-5 max-lg:text-[#003F2B]",
  "max-lg:placeholder:text-[#003F2B]/55 max-lg:focus:ring-2 max-lg:focus:ring-[#02633E]",
  "lg:h-[60px] lg:rounded-[10px] lg:border-0 lg:px-4 lg:py-[18px]",
  "lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:font-normal lg:leading-5 lg:text-[#1F2121]",
  "lg:placeholder:text-[#1F2121]/60 lg:focus:ring-2 lg:focus:ring-[#02633E]",
);

const jobApplyLabelDesktop = "mb-1.5 block text-xs font-semibold text-gray-600";
const jobApplyLabelTextMobile =
  "font-[family-name:var(--font-nanum)] text-base font-bold text-black";
const jobApplyStarClass =
  "font-[Pretendard,system-ui,sans-serif] text-base font-medium text-[#F3372C] lg:text-xl lg:font-medium";
/** PC 섹션 소제목(기본정보·학력…) — 상단 구분선·60/10 패딩 */
const jobApplyPcSectionHeading =
  "lg:mb-0 lg:border-t lg:border-black/60 lg:pt-[60px] lg:pb-2.5 lg:font-[family-name:var(--font-nanum)] lg:text-xl lg:font-bold lg:text-black";
const jobApplySectionBlockMobile =
  "max-lg:flex max-lg:flex-col max-lg:gap-5 max-lg:border-t max-lg:border-black/60 max-lg:pt-10 lg:flex lg:flex-col lg:gap-[30px] lg:border-t-0 lg:pt-0";
const jobApplySubfieldMobile =
  "max-lg:flex max-lg:flex-col max-lg:gap-5 lg:flex lg:flex-col lg:gap-5";
/** PC 라벨 한 줄 — Nanum 20 bold black */
const jobApplyLabelPc =
  "lg:mb-0 lg:inline lg:font-[family-name:var(--font-nanum)] lg:text-xl lg:font-bold lg:text-black";

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

  const [mainTab, setMainTab] = useState<MainTab>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const jobsSectionRef = useRef<HTMLElement>(null);

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
      const statusKey: JobStatusStyleKey = j.status === "open" ? "open" : "closing";
      const statusUi = t(`pages.careers.positions.jobStatus.${statusKey}`);
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
        region: j.location,
        regionKey: inferRegionKey(j.location ?? ""),
        createdAt: j.created_at
          ? new Date(j.created_at).toISOString().slice(0, 10)
          : "",
        status: statusUi,
        statusKey,
        duties: lines.slice(0, 6).length ? lines.slice(0, 6) : [j.description ?? ""],
        requirements: (j.requirements ?? "")
          .split(/\n+/)
          .filter(Boolean)
          .slice(0, 6),
      };
    });
  }, [loaderData.dbJobs, t, i18n.language]);

  const filteredJobs = jobs.filter((j) => {
    if (mainTab === "apply") return false;
    const jobOk = jobFilter === "all" || j.deptKey === jobFilter;
    const expOk = expFilter === "all" || j.expKey === expFilter;
    const regionOk = regionFilter === "all" || j.regionKey === regionFilter;
    const statusOk = statusFilter === "all" || j.statusKey === statusFilter;
    return jobOk && expOk && regionOk && statusOk;
  });

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  /* 지원하기: 입사지원 탭으로 전환 + 해당 공고 직무 자동 세팅 */
  const handleApply = (jobTitle: string) => {
    setFormData((p) => ({ ...p, position: jobTitle }));
    setMainTab("apply");
    setTimeout(() => {
      jobsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const toggleDropdown = (key: "job" | "exp" | "region" | "status") =>
    setOpenDropdown((prev) => (prev === key ? null : key));

  /* ── 입사지원 폼 상태 ── */
  const [formData, setFormData] = useState({
    position: "",
    /* 기본정보 */
    name: "",
    gender: "",
    phone: "",
    emailLocal: "",
    emailDomain: "",
    emailDomainCustom: "",
    /* 학력 */
    schoolName: "",
    major: "",
    graduationYear: "",
    /* 자격이력 */
    qualifications: "",
    /* 어학실력 */
    languageSkills: "",
    /* 자기소개서 */
    coverLetter: "",
    privacyAgreed: false,
  });

  type CareerEntry = {
    id: number;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
  const [careers, setCareers] = useState<CareerEntry[]>([]);
  const addCareer = () =>
    setCareers((p) =>
      p.length >= 5
        ? p
        : [
            ...p,
            {
              id: Date.now(),
              company: "",
              position: "",
              startDate: "",
              endDate: "",
              isCurrent: false,
            },
          ],
    );
  const removeCareer = (id: number) =>
    setCareers((p) => p.filter((c) => c.id !== id));
  const updateCareer = (
    id: number,
    field: keyof CareerEntry,
    value: string | boolean,
  ) =>
    setCareers((p) =>
      p.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );

  const handleJobApplyEmailDomainChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setFormData((p) => ({
        ...p,
        emailDomain: v,
        ...(v !== "" ? { emailDomainCustom: "" } : {}),
      }));
    },
    [],
  );

  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

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

      {/* ── 채용공고 섹션 (시안: gap·탭바·목록 / 섹션 타이틀은 SectionPageTitle·스파클 PNG) ── */}
      <section ref={jobsSectionRef}>
        <PageContentMax className="pb-10 max-lg:px-0 md:pt-[clamp(40px,calc(100*100vw/1920),100px)] md:pb-[clamp(40px,calc(100*100vw/1920),100px)]">
          <div className="flex w-full flex-col max-lg:gap-0 lg:gap-3">
            <div className="flex w-full flex-col max-lg:gap-3 lg:gap-[clamp(16px,calc(30*100vw/1920),30px)]">
              <div className="flex w-full flex-col max-lg:gap-0 lg:gap-10">
                <SectionPageTitle
                  as="h2"
                  preset="responsiveLg"
                  className="mb-0 max-lg:px-4 max-lg:pt-5"
                >
                  {t("pages.careers.positions.sectionPostings")}
                </SectionPageTitle>

                {/* 모바일: 탭 + 필터(채용공고 탭 시 가로 한 줄·넘치면 가로 스크롤) / lg: 한 줄 — 탭 | 구분선 | 필터 */}
                <div
                  ref={dropdownRef}
                  className={cn(
                    "flex w-full flex-col gap-0 overflow-visible",
                    "max-lg:rounded-2xl max-lg:bg-[var(--site-chrome-header-bg,#FDFDF5)] max-lg:px-0 max-lg:py-2",
                    "lg:flex-row lg:flex-nowrap lg:items-center lg:gap-x-[clamp(16px,calc(60*100vw/1920),60px)] lg:rounded-[clamp(20px,calc(40*100vw/1920),40px)] lg:bg-[#02633E] lg:px-[clamp(16px,calc(60*100vw/1920),60px)] lg:py-[clamp(12px,calc(20*100vw/1920),20px)]",
                    openDropdown !== null && "relative z-40",
                  )}
                >
                  {/* 모바일: 탭 줄 배경=페이지색(흰 카드 제거) · 활성=흰 pill · 비활성=녹색 pill · lg+: 녹색 바 */}
                  <div className="flex w-full shrink-0 flex-col gap-1 py-[14px] max-lg:rounded-none max-lg:bg-transparent max-lg:px-4 lg:w-auto lg:flex-row lg:flex-nowrap lg:items-center lg:gap-[clamp(8px,calc(10*100vw/1920),10px)] lg:px-0 lg:py-0">
                    <div className="flex flex-wrap items-center gap-[10px]">
                      {(["all", "list", "apply"] as MainTab[]).map((tab) => {
                          const label =
                            tab === "all"
                              ? t("pages.careers.positions.tabAll", {
                                  count: jobs.length,
                                })
                              : tab === "list"
                                ? t("pages.careers.positions.tabList")
                                : t("pages.careers.positions.tabApply");
                          const active = mainTab === tab;
                          return (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => {
                                setMainTab(tab);
                                setOpenDropdown(null);
                              }}
                              className={cn(
                                "shrink-0 px-3 py-1.5 font-[family-name:var(--font-nanum)] text-xs leading-[18px] transition-colors",
                                "lg:rounded-[clamp(20px,calc(40*100vw/1920),40px)] lg:px-[clamp(12px,calc(20*100vw/1920),20px)] lg:py-[clamp(6px,calc(10*100vw/1920),10px)] lg:font-sans lg:[font-size:clamp(15px,calc(18*100vw/1920),18px)] lg:[line-height:clamp(22px,calc(27*100vw/1920),27px)]",
                                active
                                  ? "rounded-[40px] bg-white font-extrabold text-[#154725] lg:rounded-[clamp(20px,calc(40*100vw/1920),40px)]"
                                  : "rounded-[40px] bg-[#02633E] font-bold text-white max-lg:ring-0 lg:bg-transparent lg:font-bold lg:text-white",
                              )}
                            >
                              {label}
                            </button>
                          );
                      })}
                    </div>
                  </div>

                  {mainTab === "list" && (
                    <>
                      <div
                        className="hidden h-5 w-px shrink-0 self-center bg-white/35 lg:block"
                        aria-hidden
                      />
                      <div
                        ref={filterRowScrollRef}
                        className={cn(
                          "flex min-h-0 min-w-0 flex-wrap items-center justify-start overflow-visible",
                          "max-lg:w-full max-lg:flex-nowrap max-lg:gap-3 max-lg:overflow-x-auto max-lg:border-t max-lg:border-black/20 max-lg:px-4 max-lg:py-5 max-lg:[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                          "lg:shrink-0 lg:flex-nowrap lg:items-center lg:justify-start lg:gap-[clamp(8px,calc(10*100vw/1920),10px)] lg:border-t-0 lg:px-0 lg:py-0",
                        )}
                      >
                        {/* 전체 직무 — 열림 시 패널은 트리거 너비에 맞춰 바로 아래에 고정(absolute) */}
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
                              "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-bold text-white transition-colors",
                              "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                              careersFilterDropdownFont,
                              "max-lg:w-auto max-lg:justify-start max-lg:gap-1 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:whitespace-nowrap max-lg:text-black",
                              openDropdown === "job" &&
                                "max-lg:font-semibold max-lg:text-[#32AF32]",
                            )}
                          >
                            {labelJobFilter(jobFilter)}
                            {openDropdown === "job" ? (
                              <ChevronUp
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-[#32AF32]",
                                )}
                                strokeWidth={2}
                                aria-hidden
                              />
                            ) : (
                              <ChevronDown
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-black",
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

                        {/* 전체 경력 — 500 */}
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
                              "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-medium text-white transition-colors",
                              "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                              careersFilterDropdownFont,
                              "max-lg:w-auto max-lg:justify-start max-lg:gap-1 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:whitespace-nowrap max-lg:text-black",
                              openDropdown === "exp" &&
                                "max-lg:font-semibold max-lg:text-[#32AF32]",
                            )}
                          >
                            {labelExpFilter(expFilter)}
                            {openDropdown === "exp" ? (
                              <ChevronUp
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-[#32AF32]",
                                )}
                                strokeWidth={2}
                                aria-hidden
                              />
                            ) : (
                              <ChevronDown
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-black",
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

                        {/* 전체 지역 — 500 */}
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
                              "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-medium text-white transition-colors",
                              "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                              careersFilterDropdownFont,
                              "max-lg:w-auto max-lg:justify-start max-lg:gap-1 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:whitespace-nowrap max-lg:text-black",
                              openDropdown === "region" &&
                                "max-lg:font-semibold max-lg:text-[#32AF32]",
                            )}
                          >
                            {labelRegionFilter(regionFilter)}
                            {openDropdown === "region" ? (
                              <ChevronUp
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-[#32AF32]",
                                )}
                                strokeWidth={2}
                                aria-hidden
                              />
                            ) : (
                              <ChevronDown
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-black",
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

                        {/* 전체 상태 — 플로팅 패널 */}
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
                              "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-medium text-white transition-colors",
                              "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                              careersFilterDropdownFont,
                              "max-lg:w-auto max-lg:justify-start max-lg:gap-1 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:whitespace-nowrap max-lg:text-black",
                              openDropdown === "status" &&
                                "max-lg:font-semibold max-lg:text-[#32AF32]",
                            )}
                          >
                            {labelStatusFilter(statusFilter)}
                            {openDropdown === "status" ? (
                              <ChevronUp
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-[#32AF32]",
                                )}
                                strokeWidth={2}
                                aria-hidden
                              />
                            ) : (
                              <ChevronDown
                                className={cn(
                                  filterChevronClass,
                                  "max-lg:text-black",
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
                    </>
                  )}
                </div>
              </div>

              {/* ── 공고 목록 (전체공고 / 채용공고 탭) — 행 간 gap 12px ── */}
              {mainTab !== "apply" && (
                <div className="flex flex-col gap-3 max-lg:px-4">
                  {filteredJobs.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400">
                      {t("pages.careers.positions.emptyFiltered")}
                    </div>
                  ) : (
                    filteredJobs.map((job, index) => {
                      const isExpanded = expandedId === job.id;
                      const isLast = index === filteredJobs.length - 1;
                      const applyBtnClass = cn(
                        "inline-flex shrink-0 items-center justify-center gap-2.5 text-white transition-colors",
                        jobApplyButtonFont,
                        "max-lg:rounded max-lg:px-4 max-lg:py-2",
                        "rounded-[clamp(20px,calc(40*100vw/1920),40px)] px-[clamp(12px,calc(20*100vw/1920),20px)] py-[clamp(6px,calc(8*100vw/1920),8px)] lg:gap-[clamp(10px,calc(20*100vw/1920),20px)]",
                        "bg-[#32AF32] hover:brightness-105",
                        isExpanded && "lg:bg-[#02633E] lg:hover:brightness-105",
                      );

                      const leftSummary = (
                        <div
                          className={cn(
                            "flex min-w-0 flex-1 flex-col gap-2.5",
                            "lg:flex-row lg:flex-wrap lg:items-center",
                            "lg:gap-x-[clamp(16px,calc(64*100vw/1920),64px)] lg:gap-y-3",
                          )}
                        >
                          <div className="flex shrink-0 flex-wrap items-start gap-1.5 lg:gap-3">
                            <span
                              className={cn(
                                "shrink-0 rounded-full px-3 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs leading-3 font-medium",
                                "lg:px-[clamp(8px,calc(12*100vw/1920),12px)] lg:py-[clamp(6px,calc(8*100vw/1920),8px)] lg:[font-size:clamp(11px,calc(12*100vw/1920),12px)] lg:[line-height:clamp(11px,calc(12*100vw/1920),12px)]",
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
                            <span className={jobCardDeptBadgeClass}>
                              {job.dept}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-3">
                            <p
                              className={cn(
                                "font-[family-name:var(--font-nanum)] font-extrabold text-[#1F2121] max-lg:text-lg max-lg:leading-[27px] max-lg:tracking-normal",
                                "font-sans tracking-[-0.02em] lg:[font-size:clamp(1rem,calc(24*100vw/1920),1.5rem)] lg:[line-height:clamp(1.5rem,calc(36*100vw/1920),2.25rem)]",
                              )}
                            >
                              {job.title}
                            </p>
                            <div className="flex w-full min-w-0 flex-col gap-2.5 lg:hidden">
                              <div className="flex w-full flex-wrap items-center justify-start gap-1.5">
                                {[job.exp, job.region, job.type].map((t) => (
                                  <span
                                    key={t}
                                    className={jobCardMetaRowMobile}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                              <span className="block w-full text-left">
                                <span className={jobCardMetaPlainMobile}>
                                  {job.createdAt}
                                </span>
                              </span>
                            </div>
                            <div className="hidden flex-wrap items-center gap-3 lg:flex">
                              {[
                                job.exp,
                                job.region,
                                job.type,
                                job.createdAt,
                              ].map((tag) => (
                                <span
                                  key={tag}
                                  className={cn(
                                    jobCardMetaTagClass,
                                    "font-sans",
                                  )}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );

                      return (
                        <div
                          key={job.id}
                          className={cn(
                            /* 모바일 접힘: 페이지 배경과 동일 · 펼침 시 안쪽 래퍼가 #EAE3C9 유지 */
                            "max-lg:border-b max-lg:border-black/20 max-lg:bg-[var(--site-chrome-header-bg,#FDFDF5)]",
                            "lg:bg-[var(--site-chrome-header-bg,#FDFDF5)]",
                            !isLast && "lg:border-b lg:border-black/20",
                            isExpanded && "lg:border-b-0",
                          )}
                        >
                          <div
                            className={cn(
                              "overflow-hidden transition-all",
                              isExpanded &&
                                "max-lg:rounded-none max-lg:bg-[#EAE3C9] lg:rounded-[10px] lg:border-[3px] lg:border-[#02633E] lg:bg-[#EAE3C9]",
                            )}
                          >
                            <div
                              className={cn(
                                "hidden w-full flex-wrap items-center gap-x-[clamp(16px,calc(40*100vw/1920),40px)] gap-y-4 lg:flex",
                                "p-[clamp(16px,calc(30*100vw/1920),30px)]",
                              )}
                            >
                              {leftSummary}
                              <button
                                type="button"
                                onClick={() => toggleExpand(job.id)}
                                className={cn(
                                  "flex size-[clamp(36px,calc(48*100vw/1920),48px)] shrink-0 items-center justify-center overflow-hidden rounded-[clamp(20px,calc(40*100vw/1920),40px)] transition-colors hover:bg-black/[0.04]",
                                  "lg:bg-[#F0EEDD]",
                                )}
                                aria-label={
                                  isExpanded
                                    ? t("pages.careers.positions.collapse")
                                    : t("pages.careers.positions.expand")
                                }
                              >
                                {isExpanded ? (
                                  <ChevronUp
                                    className="h-[clamp(28px,calc(20*100vw/1920),40px)] w-[clamp(28px,calc(20*100vw/1920),40px)] text-[#02633E]"
                                    strokeWidth={2.25}
                                    aria-hidden
                                  />
                                ) : (
                                  <ChevronDown
                                    className="h-[clamp(28px,calc(20*100vw/1920),40px)] w-[clamp(28px,calc(20*100vw/1920),40px)] text-[#02633E]"
                                    strokeWidth={2.25}
                                    aria-hidden
                                  />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApply(job.title)}
                                className={applyBtnClass}
                              >
                                {t("pages.careers.positions.applyButton")}
                                <ArrowUpRight
                                  className="h-[1.5em] w-[1.5em] shrink-0 text-white"
                                  strokeWidth={2}
                                  aria-hidden
                                />
                              </button>
                            </div>

                            {/* 모바일: 접힘 pt·pb·border 시안 / 펼침 Ivory 헤더 → 본문 → 화살표 */}
                            <div className="flex w-full flex-col lg:hidden">
                              {isExpanded ? (
                                <div className="border-b border-[#1F2121]/20 bg-[#EAE3C9] py-5">
                                  <div className="flex w-full items-center justify-between gap-3">
                                    {leftSummary}
                                    <button
                                      type="button"
                                      onClick={() => handleApply(job.title)}
                                      className={applyBtnClass}
                                    >
                                      {t("pages.careers.positions.applyButton")}
                                      <ArrowUpRight
                                        className="size-[1em] shrink-0 text-white"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex w-full flex-col items-center gap-2.5 pt-5 pb-2.5">
                                  <div className="flex w-full items-center justify-between gap-3 self-stretch">
                                    {leftSummary}
                                    <button
                                      type="button"
                                      onClick={() => handleApply(job.title)}
                                      className={applyBtnClass}
                                    >
                                      {t("pages.careers.positions.applyButton")}
                                      <ArrowUpRight
                                        className="size-[1em] shrink-0 text-white"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                    </button>
                                  </div>
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={() => toggleExpand(job.id)}
                                      className="flex size-[18px] items-center justify-center bg-transparent p-0"
                                      aria-label={t("pages.careers.positions.expand")}
                                    >
                                      <ChevronDown
                                        className="size-[18px] text-[#02633E]"
                                        strokeWidth={2}
                                        aria-hidden
                                      />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ── 아코디언 상세 영역 (시안: py30 pl222 pr30, 2열 gap40, 텍스트만 pill 없음) ── */}
                            {isExpanded && (
                              <div
                                className={cn(
                                  "flex w-full flex-col",
                                  "gap-5 max-lg:gap-5 lg:gap-y-[clamp(24px,calc(40*100vw/1920),40px)]",
                                  "border-t border-[#D8D0BB] max-lg:border-t-0 max-lg:bg-[#EAE3C9] max-lg:px-4 max-lg:py-5",
                                  "py-[clamp(16px,calc(30*100vw/1920),30px)] pr-[clamp(16px,calc(30*100vw/1920),30px)] pl-4",
                                  "lg:flex-row lg:gap-x-[clamp(20px,calc(40*100vw/1920),40px)] lg:gap-y-0 lg:pl-[clamp(24px,calc(222*100vw/1920),222px)]",
                                )}
                              >
                                <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-3">
                                  <p className={jobCardDetailHeadingClass}>
                                    {t("pages.careers.positions.detailsDuties")}
                                  </p>
                                  <div className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-[clamp(8px,calc(12*100vw/1920),12px)]">
                                    {job.duties.map((d) => (
                                      <span
                                        key={d}
                                        className={jobCardDetailLineClass}
                                      >
                                        {d}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-3">
                                  <p className={jobCardDetailHeadingClass}>
                                    {t("pages.careers.positions.detailsRequirements")}
                                  </p>
                                  <div className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-[clamp(8px,calc(12*100vw/1920),12px)]">
                                    {job.requirements.map((r) => (
                                      <span
                                        key={r}
                                        className={jobCardDetailLineClass}
                                      >
                                        {r}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                            {isExpanded && (
                              <div className="flex justify-center pb-2.5 lg:hidden">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(job.id)}
                                  className="flex size-[18px] items-center justify-center bg-transparent p-0"
                                  aria-label={t("pages.careers.positions.collapse")}
                                >
                                  <ChevronUp
                                    className="size-[18px] text-[#02633E]"
                                    strokeWidth={2}
                                    aria-hidden
                                  />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── 입사지원 탭 콘텐츠 ── */}
              {mainTab === "apply" && (
                <div className="rounded-2xl bg-[#EAE3C9] px-5 py-8 max-lg:rounded-none max-lg:bg-transparent max-lg:px-4 max-lg:py-0 md:px-8 md:py-10 lg:bg-[#FDFDF5] lg:p-0">
                  {/* PC 시안: 상하 60px·gap 10px·750×90 타이틀 / 모바일: 기존 */}
                  <div
                    className={cn(
                      "mx-auto mb-6 w-full max-w-[750px] max-lg:mb-0",
                      "lg:mb-0 lg:flex lg:w-full lg:max-w-[750px] lg:flex-col lg:items-start lg:gap-[10px] lg:py-[60px]",
                    )}
                  >
                    <h3
                      className={cn(
                        "text-2xl font-bold tracking-[-0.04em]",
                        "max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-2xl max-lg:leading-9 max-lg:font-extrabold max-lg:tracking-normal",
                        "lg:h-[90px] lg:min-h-[90px] lg:w-full lg:max-w-[750px] lg:py-0 lg:font-[family-name:var(--font-nanum)] lg:text-[60px] lg:leading-[90px] lg:font-extrabold lg:tracking-normal",
                      )}
                      style={{ color: "#1F2121" }}
                    >
                      {t("pages.careers.positions.form.title")}
                    </h3>
                  </div>

                  {submitted ? (
                    <div className="rounded-2xl bg-white py-16 text-center">
                      <div
                        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#02633E" }}
                      >
                        <Check className="h-7 w-7 text-white" />
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {t("pages.careers.positions.form.submittedTitle")}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {t("pages.careers.positions.form.submittedBody")}
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleFormSubmit}
                      className="space-y-4 max-lg:space-y-10 lg:space-y-0"
                    >
                      {/* 폼 카드 — PC: 컬럼 너비 750px(패딩 없음 — 예전 lg:px-[60px] 시 내부 630px). 블록 간 60px */}
                      <div className="mx-auto w-full max-w-[750px] space-y-8 rounded-2xl bg-[#EAE3C9] px-6 py-8 max-lg:max-w-none max-lg:space-y-10 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 md:px-8 lg:max-w-[750px] lg:space-y-[60px] lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
                        {/* ── 기본정보 ── */}
                        <div className={jobApplySectionBlockMobile}>
                          <p
                            className={cn(
                              "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                              jobApplyPcSectionHeading,
                            )}
                          >
                            {t("pages.careers.positions.form.basicInfo")}
                          </p>
                          <div className="space-y-4 max-lg:space-y-5 lg:space-y-5">
                            {/* 성함 */}
                            <div>
                              <div className="mb-1.5 flex items-center justify-between max-lg:mb-0">
                                <div className="flex items-center gap-0.5">
                                  <span
                                    className={cn(
                                      jobApplyLabelDesktop,
                                      jobApplyLabelPc,
                                      "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                    )}
                                  >
                                    {t("pages.careers.positions.form.name")}
                                  </span>
                                  <span className={jobApplyStarClass}>*</span>
                                </div>
                                <span className="shrink-0 text-right font-[family-name:var(--font-nanum)] text-[13px] font-normal text-black max-lg:text-xs">
                                  <span className="text-[#F3372C]">* </span>
                                  {t("pages.careers.positions.form.requiredHint")}
                                </span>
                              </div>
                              <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder={t("pages.careers.apply.phName")}
                                className={jobApplyInputClass}
                              />
                            </div>

                            {/* 연락처 */}
                            <div className={jobApplySubfieldMobile}>
                              <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                <label
                                  className={cn(
                                    jobApplyLabelDesktop,
                                    jobApplyLabelPc,
                                    "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                  )}
                                >
                                  {t("pages.careers.positions.form.phone")}
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder={t(
                                  "pages.careers.positions.form.contactPlaceholder",
                                )}
                                className={jobApplyInputClass}
                              />
                            </div>

                            {/* 이메일 — 모바일: 아이디·도메인 입력·셀렉트(@ 없음) / PC: 견학신청과 동일 */}
                            <div className={jobApplySubfieldMobile}>
                              <label
                                className={cn(
                                  jobApplyLabelDesktop,
                                  jobApplyLabelPc,
                                  "max-lg:mb-0 max-lg:block max-lg:w-full max-lg:max-w-[200px] max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                  "lg:block",
                                )}
                              >
                                {t("pages.careers.positions.form.email")}
                              </label>
                              {/* 모바일 */}
                              <div className="flex w-full flex-col gap-5 lg:hidden">
                                <input
                                  type="text"
                                  value={formData.emailLocal}
                                  onChange={(e) =>
                                    setFormData((p) => ({
                                      ...p,
                                      emailLocal: e.target.value,
                                    }))
                                  }
                                  placeholder={t(
                                    "pages.careers.positions.form.emailLocalPh",
                                  )}
                                  autoComplete="email"
                                  className={jobApplyInputClass}
                                />
                                <input
                                  type="text"
                                  value={formData.emailDomainCustom}
                                  onChange={(e) =>
                                    setFormData((p) => ({
                                      ...p,
                                      emailDomainCustom: e.target.value,
                                    }))
                                  }
                                  placeholder={t(
                                    "pages.careers.positions.form.emailDomainPh",
                                  )}
                                  disabled={formData.emailDomain !== ""}
                                  className={cn(
                                    jobApplyInputClass,
                                    "font-[Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] placeholder:text-[#7B7B7B]/40 disabled:cursor-not-allowed disabled:opacity-60",
                                  )}
                                />
                                <select
                                  value={formData.emailDomain}
                                  onChange={handleJobApplyEmailDomainChange}
                                  className={jobApplyInputClass}
                                >
                                  <option value="">
                                    {t("pages.careers.positions.emailDirectInput")}
                                  </option>
                                  {JOB_APPLY_EMAIL_DOMAINS.map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {/* PC — 견학신청서와 동일 */}
                              <div className="hidden w-full min-w-0 flex-col gap-5 lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-2.5">
                                <input
                                  type="text"
                                  value={formData.emailLocal}
                                  onChange={(e) =>
                                    setFormData((p) => ({
                                      ...p,
                                      emailLocal: e.target.value,
                                    }))
                                  }
                                  placeholder={t(
                                    "pages.careers.positions.form.emailLocalPh",
                                  )}
                                  autoComplete="email"
                                  className={cn(
                                    jobApplyInputClass,
                                    "lg:min-w-0 lg:flex-1",
                                  )}
                                />
                                <span className="shrink-0 font-[family-name:var(--font-nanum)] text-xl font-bold text-black">
                                  @
                                </span>
                                {formData.emailDomain === "" && (
                                  <input
                                    type="text"
                                    value={formData.emailDomainCustom}
                                    onChange={(e) =>
                                      setFormData((p) => ({
                                        ...p,
                                        emailDomainCustom: e.target.value,
                                      }))
                                    }
                                    placeholder={t(
                                      "pages.careers.positions.form.emailDomainPh",
                                    )}
                                    className={cn(
                                      jobApplyInputClass,
                                      "font-[Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] placeholder:text-[#7B7B7B]/40 lg:min-w-0 lg:flex-1 lg:text-[18px] lg:font-light lg:text-[#7B7B7B]",
                                    )}
                                  />
                                )}
                                <select
                                  value={formData.emailDomain}
                                  onChange={handleJobApplyEmailDomainChange}
                                  className={cn(
                                    jobApplyInputClass,
                                    "lg:min-w-0 lg:flex-1",
                                  )}
                                >
                                  <option value="">
                                    {t("pages.careers.positions.emailDirectInput")}
                                  </option>
                                  {JOB_APPLY_EMAIL_DOMAINS.map((d) => (
                                    <option key={d} value={d}>
                                      {d}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* 성별 */}
                            <div className={jobApplySubfieldMobile}>
                              <div className="mb-1.5 flex max-lg:mb-0 max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                <label
                                  className={cn(
                                    jobApplyLabelDesktop,
                                    jobApplyLabelPc,
                                    "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                  )}
                                >
                                  {t("pages.careers.positions.form.gender")}
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <div className="flex gap-2">
                                {(
                                  [
                                    {
                                      k: "male",
                                      label: t(
                                        "pages.careers.positions.form.genderMale",
                                      ),
                                    },
                                    {
                                      k: "female",
                                      label: t(
                                        "pages.careers.positions.form.genderFemale",
                                      ),
                                    },
                                  ] as const
                                ).map(({ k, label }) => (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={() =>
                                      setFormData((p) => ({ ...p, gender: k }))
                                    }
                                    className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-all max-lg:min-h-[48px] max-lg:flex-1 max-lg:rounded-[10px] max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base"
                                    style={
                                      formData.gender === k
                                        ? {
                                            backgroundColor: "#02633E",
                                            color: "#fff",
                                            borderColor: "#02633E",
                                          }
                                        : {
                                            backgroundColor: "#fff",
                                            color: "#555",
                                            borderColor: "#E5E0D4",
                                          }
                                    }
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── 학력 ── */}
                        <div className={jobApplySectionBlockMobile}>
                          <p
                            className={cn(
                              "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                              jobApplyPcSectionHeading,
                            )}
                          >
                            {t("pages.careers.positions.form.education")}
                          </p>
                          <div className="space-y-4 max-lg:space-y-5 lg:space-y-5">
                            <div>
                              <div className="mb-1.5 flex items-center justify-between max-lg:mb-0">
                                <div className="flex items-center gap-0.5">
                                  <label
                                    className={cn(
                                      jobApplyLabelDesktop,
                                      jobApplyLabelPc,
                                      "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                    )}
                                  >
                                    {t("pages.careers.positions.form.schoolName")}
                                  </label>
                                  <span className={jobApplyStarClass}>*</span>
                                </div>
                                <span className="hidden text-right max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-xs max-lg:font-normal max-lg:text-black lg:hidden">
                                  <span className="text-[#F3372C]">* </span>
                                  {t("pages.careers.positions.form.requiredHint")}
                                </span>
                              </div>
                              <input
                                required
                                type="text"
                                value={formData.schoolName}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    schoolName: e.target.value,
                                  }))
                                }
                                placeholder={t(
                                  "pages.careers.positions.form.schoolPlaceholder",
                                )}
                                className={jobApplyInputClass}
                              />
                            </div>
                            <div className="grid gap-4 max-lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 lg:gap-5">
                              <div className={jobApplySubfieldMobile}>
                                <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                  <label
                                    className={cn(
                                      jobApplyLabelDesktop,
                                      jobApplyLabelPc,
                                      "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                    )}
                                  >
                                    {t("pages.careers.positions.form.major")}
                                  </label>
                                  <span className={jobApplyStarClass}>*</span>
                                </div>
                                <input
                                  required
                                  type="text"
                                  value={formData.major}
                                  onChange={(e) =>
                                    setFormData((p) => ({
                                      ...p,
                                      major: e.target.value,
                                    }))
                                  }
                                  placeholder={t(
                                    "pages.careers.positions.form.majorPlaceholder",
                                  )}
                                  className={cn(
                                    jobApplyInputClass,
                                    "max-lg:leading-4",
                                  )}
                                />
                              </div>
                              <div className={jobApplySubfieldMobile}>
                                <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                  <label
                                    className={cn(
                                      jobApplyLabelDesktop,
                                      jobApplyLabelPc,
                                      "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                    )}
                                  >
                                    {t("pages.careers.positions.form.gradYear")}
                                  </label>
                                  <span className={jobApplyStarClass}>*</span>
                                </div>
                                <input
                                  required
                                  type="text"
                                  value={formData.graduationYear}
                                  onChange={(e) =>
                                    setFormData((p) => ({
                                      ...p,
                                      graduationYear: e.target.value,
                                    }))
                                  }
                                  placeholder="2020"
                                  className={cn(
                                    jobApplyInputClass,
                                    "max-lg:leading-4",
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── 경력 ── */}
                        <div className={jobApplySectionBlockMobile}>
                          <div
                            className={cn(
                              "mb-5 flex w-full flex-wrap items-center gap-3 max-lg:mb-0",
                              "lg:mb-0 lg:flex-nowrap lg:items-center lg:gap-3 lg:border-t lg:border-black/60 lg:pt-[60px]",
                            )}
                          >
                            <p
                              className={cn(
                                "shrink-0 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                                "lg:mb-0 lg:font-[family-name:var(--font-nanum)] lg:text-xl lg:font-bold lg:text-black",
                              )}
                            >
                              {t("pages.careers.positions.form.careersSection")}
                            </p>
                            {/* 시안: flex 1 1 0 — 남는 가로를 채워 「추가」를 오른쪽으로 밀음 */}
                            <span
                              className={cn(
                                "min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-xs font-normal text-[#1F2121] max-lg:inline",
                                "lg:text-lg lg:leading-none lg:font-normal",
                              )}
                            >
                              {t("pages.careers.positions.form.careersMaxHint")}
                            </span>
                            <button
                              type="button"
                              onClick={addCareer}
                              disabled={careers.length >= 5}
                              className={cn(
                                "flex shrink-0 items-center gap-2.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
                                "max-lg:rounded-[40px] max-lg:px-4 max-lg:py-2",
                                "bg-[#32AF32] lg:rounded-[40px] lg:px-5 lg:py-2 lg:text-white",
                              )}
                            >
                              <span className="font-[Pretendard,system-ui,sans-serif] text-lg leading-[18px] font-light">
                                +
                              </span>
                              <span className="font-[Pretendard,system-ui,sans-serif] text-sm leading-[21px] font-bold">
                                {t("pages.careers.positions.form.add")}
                              </span>
                            </button>
                          </div>
                          {careers.length === 0 && (
                            <p className="text-sm text-gray-400 max-lg:hidden">
                              {t("pages.careers.positions.form.careersEmptyHint")}
                            </p>
                          )}
                          <div className="space-y-4 max-lg:space-y-5 lg:space-y-5">
                            {careers.map((c) => (
                              <div
                                key={c.id}
                                className={cn(
                                  "relative rounded-xl bg-[#EAE3C9] p-4 max-lg:flex max-lg:flex-col max-lg:gap-[30px] max-lg:rounded-[10px] max-lg:bg-[#EAE7D2] max-lg:p-5",
                                  "space-y-3 lg:flex lg:flex-col lg:gap-[30px] lg:space-y-0 lg:rounded-[20px] lg:bg-[#EAE7D2] lg:p-[30px]",
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => removeCareer(c.id)}
                                  className="absolute top-3 right-3 text-lg leading-none text-gray-400 hover:text-gray-600"
                                >
                                  ×
                                </button>
                                {/* 회사명 */}
                                <div className={jobApplySubfieldMobile}>
                                  <div className="flex max-lg:items-center max-lg:gap-0.5">
                                    <label
                                      className={cn(
                                        jobApplyLabelDesktop,
                                        jobApplyLabelPc,
                                        "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                      )}
                                    >
                                      {t("pages.careers.positions.form.company")}
                                    </label>
                                    <span className={jobApplyStarClass}>*</span>
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    value={c.company}
                                    onChange={(e) =>
                                      updateCareer(
                                        c.id,
                                        "company",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={t(
                                      "pages.careers.positions.form.companyPlaceholder",
                                    )}
                                    className={jobApplyInputClass}
                                  />
                                </div>
                                {/* 직무 */}
                                <div className={jobApplySubfieldMobile}>
                                  <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                    <label
                                      className={cn(
                                        jobApplyLabelDesktop,
                                        jobApplyLabelPc,
                                        "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                      )}
                                    >
                                      {t("pages.careers.positions.form.duty")}
                                    </label>
                                    <span className={jobApplyStarClass}>*</span>
                                  </div>
                                  <input
                                    type="text"
                                    required
                                    value={c.position}
                                    onChange={(e) =>
                                      updateCareer(
                                        c.id,
                                        "position",
                                        e.target.value,
                                      )
                                    }
                                    placeholder={t(
                                      "pages.careers.positions.form.dutyPlaceholder",
                                    )}
                                    className={cn(
                                      jobApplyInputClass,
                                      "max-lg:leading-4",
                                    )}
                                  />
                                </div>
                                {/* 기간 */}
                                <div className={jobApplySubfieldMobile}>
                                  <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                    <label
                                      className={cn(
                                        jobApplyLabelDesktop,
                                        jobApplyLabelPc,
                                        "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                      )}
                                    >
                                      {t("pages.careers.positions.form.period")}
                                    </label>
                                    <span className={jobApplyStarClass}>*</span>
                                  </div>
                                  <div
                                    className={cn(
                                      jobApplyInputClass,
                                      "flex items-center gap-2.5 !py-0 max-lg:h-[60px] lg:!px-4",
                                    )}
                                  >
                                    <input
                                      type="date"
                                      value={c.startDate}
                                      onChange={(e) =>
                                        updateCareer(
                                          c.id,
                                          "startDate",
                                          e.target.value,
                                        )
                                      }
                                      disabled={c.isCurrent}
                                      className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0 disabled:opacity-50 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-[#003F2B] lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:leading-[18px] lg:text-[#1F2121]"
                                    />
                                    <span className="shrink-0 font-[family-name:var(--font-nanum)] text-base font-normal text-[#003F2B] lg:text-[18px] lg:leading-[18px] lg:text-[#1F2121]">
                                      ~
                                    </span>
                                    <input
                                      type="date"
                                      value={c.endDate}
                                      onChange={(e) =>
                                        updateCareer(
                                          c.id,
                                          "endDate",
                                          e.target.value,
                                        )
                                      }
                                      disabled={c.isCurrent}
                                      className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0 disabled:opacity-50 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-[#003F2B] lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:leading-[18px] lg:text-[#1F2121]"
                                    />
                                  </div>
                                  <label
                                    className={cn(
                                      "mt-2 flex cursor-pointer items-center gap-2.5 text-xs text-gray-600",
                                      "max-lg:mt-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-sm max-lg:font-bold max-lg:text-black",
                                      "lg:mt-0 lg:gap-3 lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:font-bold lg:text-black",
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={c.isCurrent}
                                      onChange={(e) =>
                                        updateCareer(
                                          c.id,
                                          "isCurrent",
                                          e.target.checked,
                                        )
                                      }
                                      className="size-[18px] shrink-0 rounded-full border border-[#DDDDDD] accent-[#02633E] max-lg:rounded-full"
                                    />
                                    {t(
                                      "pages.careers.positions.form.currentlyEmployed",
                                    )}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ── 자격·어학 ── */}
                        <div className={jobApplySectionBlockMobile}>
                          <p
                            className={cn(
                              "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                              jobApplyPcSectionHeading,
                            )}
                          >
                            {t("pages.careers.positions.form.qualificationsSection")}
                          </p>
                          <div className="space-y-4 max-lg:space-y-5 lg:space-y-5">
                            <div>
                              <div className="mb-1.5 flex items-center justify-between max-lg:mb-0">
                                <div className="flex items-center gap-0.5">
                                  <label
                                    className={cn(
                                      jobApplyLabelDesktop,
                                      jobApplyLabelPc,
                                      "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                    )}
                                  >
                                    {t("pages.careers.positions.form.certifications")}
                                  </label>
                                  <span className={jobApplyStarClass}>*</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={formData.qualifications}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    qualifications: e.target.value,
                                  }))
                                }
                                placeholder={t(
                                  "pages.careers.positions.form.certificationsPh",
                                )}
                                className={cn(
                                  jobApplyInputClass,
                                  "lg:leading-[18px] lg:placeholder:leading-[18px]",
                                )}
                              />
                            </div>
                            <div className={jobApplySubfieldMobile}>
                              <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                <label
                                  className={cn(
                                    jobApplyLabelDesktop,
                                    jobApplyLabelPc,
                                    "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                  )}
                                >
                                  {t("pages.careers.positions.form.languageScores")}
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <input
                                type="text"
                                value={formData.languageSkills}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    languageSkills: e.target.value,
                                  }))
                                }
                                placeholder={t(
                                  "pages.careers.positions.form.languageScoresPh",
                                )}
                                className={cn(
                                  jobApplyInputClass,
                                  "max-lg:leading-4",
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* ── 파일 첨부 ── */}
                        <div className={jobApplySectionBlockMobile}>
                          <p
                            className={cn(
                              "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                              jobApplyPcSectionHeading,
                            )}
                          >
                            {t("pages.careers.positions.form.attachments")}
                          </p>
                          <div className="space-y-4 max-lg:space-y-5 lg:space-y-5">
                            <div className={jobApplySubfieldMobile}>
                              <div className="flex max-lg:items-center max-lg:gap-0.5">
                                <label
                                  className={cn(
                                    jobApplyLabelDesktop,
                                    jobApplyLabelPc,
                                    "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                  )}
                                >
                                  {t("pages.careers.positions.form.resume")}
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <label
                                className={cn(
                                  jobApplyInputClass,
                                  "flex min-h-[60px] cursor-pointer items-start gap-2.5 transition-colors hover:bg-gray-50/80 max-lg:h-auto max-lg:min-h-[60px] max-lg:items-start max-lg:py-[18px]",
                                )}
                              >
                                <Paperclip
                                  className="mt-0.5 size-4 shrink-0 text-[#003F2B] lg:text-[#1F2121]/60"
                                  aria-hidden
                                />
                                <span className="flex-1 font-[family-name:var(--font-nanum)] text-sm text-gray-400 max-lg:text-base max-lg:leading-5 max-lg:text-[#003F2B] lg:text-[18px] lg:leading-5 lg:text-[#1F2121]/60">
                                  <span className="max-lg:hidden">
                                    {t("pages.careers.positions.form.resumeHintPc")}
                                  </span>
                                  <span className="hidden max-lg:inline">
                                    {t(
                                      "pages.careers.positions.form.resumeHintMobileLine1",
                                    )}
                                    <br />
                                    {t(
                                      "pages.careers.positions.form.resumeHintMobileLine2",
                                    )}
                                  </span>
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <div className={jobApplySubfieldMobile}>
                              <label
                                className={cn(
                                  jobApplyLabelDesktop,
                                  jobApplyLabelPc,
                                  "max-lg:mb-0 max-lg:block max-lg:w-full max-lg:max-w-[200px] max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                  "lg:block",
                                )}
                              >
                                {t("pages.careers.positions.form.portfolio")}
                              </label>
                              <label
                                className={cn(
                                  jobApplyInputClass,
                                  "flex min-h-[60px] cursor-pointer items-start gap-2.5 transition-colors hover:bg-gray-50/80 max-lg:h-auto max-lg:min-h-[60px] max-lg:items-start max-lg:py-[18px]",
                                )}
                              >
                                <Paperclip
                                  className="mt-0.5 size-4 shrink-0 text-[#003F2B] lg:text-[#1F2121]/60"
                                  aria-hidden
                                />
                                <span className="flex-1 font-[family-name:var(--font-nanum)] text-sm text-gray-400 max-lg:text-base max-lg:leading-5 max-lg:text-[#003F2B] lg:text-[18px] lg:leading-5 lg:text-[#1F2121]/60">
                                  <span className="max-lg:hidden">
                                    {t(
                                      "pages.careers.positions.form.portfolioHintPc",
                                    )}
                                  </span>
                                  <span className="hidden max-lg:inline">
                                    {t(
                                      "pages.careers.positions.form.portfolioHintMobileLine1",
                                    )}
                                    <br />
                                    {t(
                                      "pages.careers.positions.form.portfolioHintMobileLine2",
                                    )}
                                  </span>
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.zip,application/pdf,application/zip"
                                  multiple
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* ── 자기소개서 ── */}
                        <div className={jobApplySectionBlockMobile}>
                          <p
                            className={cn(
                              "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                              jobApplyPcSectionHeading,
                            )}
                          >
                            {t("pages.careers.positions.form.coverLetterSection")}
                          </p>
                          <div className="space-y-2.5 max-lg:space-y-2.5 lg:space-y-5">
                            <div className="flex max-lg:items-center max-lg:gap-0.5">
                              <label
                                className={cn(
                                  jobApplyLabelDesktop,
                                  jobApplyLabelPc,
                                  "max-lg:mb-0 max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-bold max-lg:text-black",
                                )}
                              >
                                {t("pages.careers.positions.form.coverLetterLabel")}
                              </label>
                              <span className={jobApplyStarClass}>*</span>
                            </div>
                            <textarea
                              required
                              rows={6}
                              maxLength={1000}
                              value={formData.coverLetter}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  coverLetter: e.target.value,
                                }))
                              }
                              placeholder={t(
                                "pages.careers.positions.form.coverLetterPh",
                              )}
                              className={cn(
                                jobApplyInputClass,
                                "h-auto min-h-[150px] resize-none py-3 max-lg:h-auto max-lg:min-h-[200px] max-lg:py-[18px] max-lg:leading-5 lg:min-h-[200px] lg:py-[18px]",
                              )}
                            />
                            <p className="font-[family-name:var(--font-nanum)] text-sm leading-4 text-[#1F2121] max-lg:text-sm lg:text-lg lg:leading-normal">
                              {t("pages.careers.positions.form.coverLetterLegal")}
                            </p>
                            <div className="mt-1 text-right text-xs text-gray-400 lg:hidden">
                              {formData.coverLetter.length}/1000
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 제출 버튼 */}
                      <div className="mx-auto flex w-full max-w-[750px] justify-center pt-2 max-lg:pt-0 lg:max-w-[750px] lg:px-0 lg:pt-[30px]">
                        <button
                          type="submit"
                          className={cn(
                            "rounded-full px-12 py-3.5 text-sm font-semibold text-white transition-colors hover:brightness-110",
                            "w-full max-lg:rounded-[60px] max-lg:px-10 max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-lg max-lg:leading-[23.4px] max-lg:font-extrabold",
                            "lg:w-auto lg:rounded-[60px] lg:px-10 lg:py-5 lg:font-[family-name:var(--font-nanum)] lg:text-[18px] lg:leading-[23.4px] lg:font-extrabold",
                          )}
                          style={{ backgroundColor: "#02633E" }}
                        >
                          {t("pages.careers.positions.form.submitButton")}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </PageContentMax>
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
        mainTab === "list" &&
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
