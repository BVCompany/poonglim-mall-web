/**
 * 채용안내 통합 페이지
 *
 * 주요 모집 직무 / 채용 절차 / 채용공고(4-드롭다운 필터) / 입사지원 / 복리후생
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
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import { getOpenJobPostings } from "../lib/queries.server";

/* ── 타입 ── */
type MainTab = "전체공고" | "채용공고" | "입사지원";

/* ── 드롭다운 필터 옵션 ── */
const FILTER_JOBS = [
  "전체직무",
  "생산직",
  "사무직",
  "영업직",
  "마케팅",
  "IT개발",
] as const;
const FILTER_EXP = ["전체 경력", "신입", "경력", "신입/경력"] as const;
const FILTER_REGION = ["전체 지역", "서울", "충북", "충남", "전북"] as const;
const FILTER_STATUS = ["전체 상태", "모집중", "마감임박", "상시채용"] as const;

/** 필터 버튼 표기 (시안: 전체 직무 등) */
function formatJobFilterDisplay(v: string) {
  return v === "전체직무" ? "전체 직무" : v;
}

/** 모바일 필터 라벨: Pretendard 12px / 500 (시안) */
const careersFilterDropdownFont =
  "[font-family:Pretendard,system-ui,sans-serif] max-lg:text-xs max-lg:font-medium max-lg:leading-none lg:[font-size:clamp(14px,calc(16*100vw/1920),16px)] lg:[line-height:clamp(20px,calc(24*100vw/1920),24px)]";

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

/** 입사지원 폼 입력 — PC 테두리 / 모바일 시안: 60px·10px·Nanum 16·#003F2B */
const jobApplyInputClass = cn(
  "w-full border border-[#E5E0D4] bg-white outline-none transition-colors",
  "rounded-lg px-4 py-3 text-sm focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]",
  "max-lg:h-[60px] max-lg:rounded-[10px] max-lg:border-0 max-lg:px-4 max-lg:py-[18px]",
  "max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:font-normal max-lg:leading-5 max-lg:text-[#003F2B]",
  "max-lg:placeholder:text-[#003F2B]/55 max-lg:focus:ring-2 max-lg:focus:ring-[#02633E]",
);

const jobApplyLabelDesktop = "mb-1.5 block text-xs font-semibold text-gray-600";
const jobApplyLabelTextMobile =
  "font-[family-name:var(--font-nanum)] text-base font-bold text-black";
const jobApplyStarClass =
  "font-[Pretendard,system-ui,sans-serif] text-base font-medium text-[#F3372C]";
const jobApplySectionBlockMobile =
  "max-lg:flex max-lg:flex-col max-lg:gap-5 max-lg:border-t max-lg:border-black/60 max-lg:pt-10";
const jobApplySubfieldMobile = "max-lg:flex max-lg:flex-col max-lg:gap-5";

/** 열린 필터 패널 — 트리거는 바깥 버튼(위·아래 화살표)에서만 처리, 여기서는 녹색 옵션 목록만 */
function CareersFilterDropdownOpen<T extends string>({
  currentValue,
  options,
  formatLabel = (s: string) => s,
  onPick,
}: {
  currentValue: T;
  options: readonly T[];
  formatLabel?: (v: string) => string;
  onPick: (v: T) => void;
}) {
  const optionRow =
    "flex w-full min-w-0 items-center whitespace-nowrap rounded-none bg-[#32AF32] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] text-left text-white";
  const otherOptions = options.filter((o) => o !== currentValue);
  if (otherOptions.length === 0) return null;
  return (
    <div
      className={cn(
        "flex min-w-full flex-col items-stretch overflow-hidden rounded-[clamp(12px,calc(20*100vw/1920),20px)] bg-[#32AF32] shadow-[0_12px_27.5px_rgba(2,99,62,0.25)]",
        "max-lg:rounded max-lg:shadow-[0_8px_20px_rgba(2,99,62,0.15)]",
      )}
    >
      {otherOptions.map((opt, i) => (
        <button
          key={opt}
          type="button"
          className={cn(
            optionRow,
            careersFilterDropdownFont,
            "font-medium",
            "max-lg:px-3 max-lg:py-2.5",
            i === 0 &&
              "rounded-t-[clamp(12px,calc(20*100vw/1920),20px)] max-lg:rounded-t",
            i === otherOptions.length - 1 &&
              "rounded-b-[clamp(12px,calc(20*100vw/1920),20px)] max-lg:rounded-b",
          )}
          onClick={() => onPick(opt)}
        >
          {formatLabel(opt)}
        </button>
      ))}
    </div>
  );
}

const filterChevronClass =
  "size-[clamp(16px,calc(20*100vw/1920),20px)] shrink-0 max-lg:size-3.5";

type JobFilter = (typeof FILTER_JOBS)[number];
type ExpFilter = (typeof FILTER_EXP)[number];
type RegionFilter = (typeof FILTER_REGION)[number];
type StatusFilter = (typeof FILTER_STATUS)[number];

/* ── 주요 모집 직무 (public/recruit/ 아이콘) ── */
const KEY_JOBS = [
  {
    icon: "/recruit/prod_icon.png",
    label: "생산·현장직",
    desc: "생산관리, 지게차,\nSCM 현장",
  },
  {
    icon: "/recruit/manage_icon.png",
    label: "경영지원",
    desc: "인사총무, 기획, 회계",
  },
  {
    icon: "/recruit/dis_icon.png",
    label: "SCM·물류",
    desc: "물류관리, 자재, 구매",
  },
  {
    icon: "/recruit/research_icon.png",
    label: "품질·연구",
    desc: "품질보증, 공정관리,\n연구소",
  },
  {
    icon: "/recruit/marketing_icon.png",
    label: "마케팅",
    desc: "브랜드, 온라인, 콘텐츠",
  },
  {
    icon: "/recruit/skill_icon.png",
    label: "기술·설비",
    desc: "기계, 전기, 환경안전",
  },
];

/** 주요 모집 직무 섹션 하단 요약 태그 (시안: 12px / -2% / medium) */
const KEY_JOB_SUMMARY_TAGS = [
  "신입·경력 혼합",
  "고졸자~대졸자 다양",
  "충북 진천 중심",
  "서울 일부(연구소)",
] as const;

/* ── 채용 절차 (모바일 시안: 카드 gap 10 · 내부 gap 20 · 좌 140px 고정, 4단계만 제목 행 유동) ── */
type CareerStep = {
  title: string;
  desc: string;
  /** 2차 면접: 본문 16px + 부가 14px */
  descSmall?: string;
  /** true면 좌측 묶음에 w-[140px] 미적용 (최종 합격·입사) */
  titleRowFluid?: boolean;
};

const STEPS: CareerStep[] = [
  { title: "서류 전형", desc: "홈페이지 내 이력서\n+ 자기소개서 업로드" },
  { title: "1차 면접", desc: "팀장급 직무 면접" },
  {
    title: "2차 면접",
    desc: "임원 면접",
    descSmall: "(직급에 따라 생략 가능)",
  },
  {
    title: "최종 합격·입사",
    desc: "처우 협의 후\n입사 일정 확정",
    titleRowFluid: true,
  },
];

/* ── 복리후생 ── */
const BENEFITS = [
  { icon: "/recruit/fi-rr-utensils.png", title: "식사제공" },
  { icon: "/recruit/Vector-1.png", title: "주 5일 근무" },
  { icon: "/recruit/Vector-2.png", title: "연차휴가" },
  { icon: "/recruit/Vector-3.png", title: "명절 상여" },
  { icon: "/recruit/Vector-4.png", title: "경조사 지원" },
  { icon: "/recruit/Vector-5.png", title: "자기개발 지원" },
  { icon: "/recruit/fi-rr-school-bus.png", title: "차량유지비" },
  { icon: "/recruit/Vector.png", title: "4대보험" },
];

/* ── 더미 채용공고 ── */
const MOCK_JOBS = [
  {
    id: 1,
    dept: "생산직",
    title: "생산관리 담당자",
    type: "정규직",
    exp: "경력 3년 이상",
    region: "충북 진천",
    createdAt: "2026-02-18",
    status: "모집중" as const,
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
    title: "품질관리 담당자",
    type: "정규직",
    exp: "신입/경력",
    region: "충북 진천",
    createdAt: "2026-02-18",
    status: "모집중" as const,
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
    title: "경영지원 담당자",
    type: "정규직",
    exp: "경력 1-3년",
    region: "서울",
    createdAt: "2026-02-18",
    status: "상시채용" as const,
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
    title: "영업관리 담당자",
    type: "정규직",
    exp: "경력 3년 이상",
    region: "서울",
    createdAt: "2026-02-18",
    status: "마감임박" as const,
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
    title: "마케팅 전문가",
    type: "정규직",
    exp: "경력 3-5년",
    region: "충남",
    createdAt: "2026-02-18",
    status: "모집중" as const,
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

export const meta: Route.MetaFunction = () => [
  { title: "채용안내 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [dbJobs, pageBanner] = await Promise.all([
    getOpenJobPostings().catch(() => [] as DbJobPosting[]),
    getPageBanner("careers").catch(() => null),
  ]);
  return { dbJobs, pageBanner };
}

export default function CareersPositionsScreen({
  loaderData,
}: Route.ComponentProps) {
  const { dbJobs, pageBanner } = loaderData;

  const [mainTab, setMainTab] = useState<MainTab>("전체공고");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const jobsSectionRef = useRef<HTMLElement>(null);

  /* ── 4개 드롭다운 필터 ── */
  const [jobFilter, setJobFilter] = useState<JobFilter>("전체직무");
  const [expFilter, setExpFilter] = useState<ExpFilter>("전체 경력");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("전체 지역");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("전체 상태");

  /* 어떤 드롭다운이 열려있는지 */
  const [openDropdown, setOpenDropdown] = useState<
    "job" | "exp" | "region" | "status" | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const jobs = MOCK_JOBS; // DB 연결 후 교체

  const filteredJobs = jobs.filter((j) => {
    if (mainTab === "입사지원") return false;
    const jobOk = jobFilter === "전체직무" || j.dept === jobFilter;
    const expOk = expFilter === "전체 경력" || j.exp === expFilter;
    const regionOk = regionFilter === "전체 지역" || j.region === regionFilter;
    const statusOk = statusFilter === "전체 상태" || j.status === statusFilter;
    return jobOk && expOk && regionOk && statusOk;
  });

  const toggleExpand = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  /* 지원하기: 입사지원 탭으로 전환 + 해당 공고 직무 자동 세팅 */
  const handleApply = (jobTitle: string) => {
    setFormData((p) => ({ ...p, position: jobTitle }));
    setMainTab("입사지원");
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

  const EMAIL_DOMAINS = [
    "직접입력",
    "gmail.com",
    "naver.com",
    "kakao.com",
    "hanmail.net",
    "nate.com",
  ];

  const [submitted, setSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  /** 모바일(375 시안) 섹션 타이틀 — NanumSquareRound 18/800/30, 별 21px, 간격 11px */
  const sectionTitleRowClass =
    "mb-5 flex items-center gap-[11px] md:mb-6 md:gap-2";
  const sectionTitleH2Class =
    "min-w-0 font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] tracking-[-0.04em] text-[#1F2121] md:text-2xl md:leading-none lg:text-[clamp(1.25rem,calc(24*100vw/1920),1.5rem)] lg:leading-normal";

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
      {/* ── 배너 ── */}
      <PageBanner
        imageUrl="/intro/recruit_banner.png"
        title="채용안내"
        subtitle="풍림푸드와 함께 성장할 인재를 찾습니다."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "채용", href: "/careers/positions" },
          { label: "채용안내" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* ── 주요 모집 직무 (모바일: 시안 세로 카드·중앙 정렬 / md+: 가로 2열·1920 비율) ── */}
      <section>
        <PageContentMax className="py-10 md:py-16">
          <div className={sectionTitleRowClass}>
            <SectionTitleStar className="h-[21px] w-[21px] md:h-5 md:w-5" />
            <h2 className={sectionTitleH2Class}>주요 모집 직무</h2>
          </div>
          {/* 모바일: 시안 — 카드 열(gap 20) + 태그 행(gap 6) 사이 gap 20 / sm+: 2열 그리드 */}
          <div className="flex w-full flex-col gap-5 md:gap-8">
            <div className="grid w-full grid-cols-2 gap-x-3 gap-y-5 sm:gap-3">
              {KEY_JOBS.map(({ icon, label, desc }, index) => (
                <div
                  key={label}
                  className="rounded-[20px] bg-[#EAE3C9] sm:flex sm:items-center sm:justify-between sm:gap-4 sm:rounded-2xl sm:p-[clamp(20px,calc(40*100vw/1920),40px)]"
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
                  {/* sm+: 가로 카드 (1920 비율) */}
                  <div className="hidden w-full min-w-0 flex-1 flex-col items-center gap-5 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex min-w-0 flex-1 items-center gap-[clamp(16px,calc(30*100vw/1920),30px)]">
                      <div className="flex h-[clamp(40px,calc(50*100vw/1920),50px)] w-[clamp(36px,calc(46*100vw/1920),46px)] shrink-0 items-center justify-center">
                        <img
                          src={icon}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                          aria-hidden
                        />
                      </div>
                      <span className="min-w-0 font-[family-name:var(--font-nanum)] text-[clamp(17px,calc(24*100vw/1920),24px)] leading-[clamp(25px,calc(36*100vw/1920),36px)] font-extrabold tracking-[-0.04em] break-words text-[#003F2B]">
                        {label}
                      </span>
                    </div>
                    <p className="max-w-[48%] min-w-0 shrink-0 text-right font-[family-name:var(--font-nanum)] text-[clamp(14px,calc(18*100vw/1920),18px)] leading-[clamp(21px,calc(27*100vw/1920),27px)] font-bold break-words whitespace-pre-line text-[#003F2B]">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <ul
              className="flex w-full list-none flex-wrap items-center justify-start gap-1.5 p-0 md:gap-2"
              aria-label="모집 요약"
            >
              {KEY_JOB_SUMMARY_TAGS.map((tag) => (
                <li key={tag} className="m-0 p-0">
                  <span className="inline-flex shrink-0 overflow-hidden rounded-full bg-white px-3 py-2 text-center [font-family:Pretendard,system-ui,sans-serif] text-[12px] leading-[12px] font-medium text-[#02633E] md:py-1.5 md:leading-none md:tracking-[-0.02em]">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </PageContentMax>
      </section>

      {/* ── 채용 절차: 모바일은 행 gap 제거 + 화살표용 pb만(총 여백 이전 대비 ~1/3) / lg+: 4열 ── */}
      <section>
        <PageContentMax className="pb-10 md:pb-16">
          <div className="flex w-full flex-col gap-5 lg:gap-0">
            <div className={cn(sectionTitleRowClass, "max-lg:pt-5")}>
              <SectionTitleStar className="h-[21px] w-[21px] md:h-5 md:w-5" />
              <h2 className={sectionTitleH2Class}>채용 절차</h2>
            </div>

            <div className="grid w-full grid-cols-1 items-stretch gap-y-0 lg:grid-cols-4 lg:gap-x-[min(4px,calc(4*100vw/1920))] lg:gap-y-0">
              {STEPS.map((step, i) => {
                const isLast = i === STEPS.length - 1;
                const desktopDesc = step.descSmall
                  ? `${step.desc}\n${step.descSmall}`
                  : step.desc;
                return (
                  <div
                    key={step.title}
                    className={cn(
                      "relative w-full min-w-0",
                      !isLast && "pb-2.5 lg:pb-0",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-full w-full flex-col rounded-[10px] bg-white px-5 py-[30px] lg:rounded-[clamp(24px,calc(40*100vw/1920),40px)] lg:py-[clamp(18px,calc(30*100vw/1920),30px)] lg:pr-[clamp(20px,calc(40*100vw/1920),40px)] lg:pl-[clamp(20px,calc(40*100vw/1920),40px)]",
                        isLast && "lg:bg-[#003F2B]",
                      )}
                    >
                      {/* 모바일: 좌 140px(번호+제목, gap 10) | 우 설명 · 내부 행 gap 20 */}
                      <div className="flex w-full flex-row items-start gap-5 lg:hidden">
                        <div
                          className={cn(
                            "flex shrink-0 items-center gap-2.5",
                            step.titleRowFluid
                              ? "max-w-[min(100%,calc(100%-8rem))] min-w-0"
                              : "w-[140px]",
                          )}
                        >
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#003F2B]">
                            <span className="text-center font-[family-name:var(--font-nanum)] text-[14px] leading-[21px] font-bold text-white">
                              {i + 1}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "font-[family-name:var(--font-nanum)] text-[18px] leading-[27px] font-extrabold break-words text-[#003F2B]",
                              step.titleRowFluid
                                ? "min-w-0 flex-1"
                                : "w-[100px] min-w-0",
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                        {step.descSmall ? (
                          <div className="min-w-0 flex-1 text-center text-[#1F2121]/60">
                            <span className="block font-[family-name:var(--font-nanum)] text-[16px] leading-6 font-bold">
                              {step.desc}
                            </span>
                            <span className="block font-[family-name:var(--font-nanum)] text-[14px] leading-[21px] font-bold">
                              {step.descSmall}
                            </span>
                          </div>
                        ) : (
                          <p className="min-w-0 flex-1 text-center font-[family-name:var(--font-nanum)] text-[16px] leading-6 font-bold whitespace-pre-line text-[#1F2121]/60">
                            {step.desc}
                          </p>
                        )}
                      </div>

                      <div className="hidden w-full flex-col gap-[clamp(16px,calc(20*100vw/1920),20px)] lg:flex">
                        <div className="flex flex-col gap-3">
                          <div
                            className={cn(
                              "flex size-[clamp(28px,calc(30*100vw/1920),30px)] shrink-0 items-center justify-center rounded-full",
                              isLast ? "bg-white" : "bg-[#003F2B]",
                            )}
                          >
                            <span
                              className={cn(
                                "font-sans [font-size:clamp(14px,calc(16*100vw/1920),16px)] leading-none [line-height:clamp(20px,calc(24*100vw/1920),24px)] font-bold",
                                isLast ? "text-[#003F2B]" : "text-white",
                              )}
                            >
                              {i + 1}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "font-sans [font-size:clamp(17px,calc(20*100vw/1920),20px)] [line-height:clamp(26px,calc(30*100vw/1920),30px)] font-extrabold tracking-[-0.03em] break-words",
                              isLast ? "text-white" : "text-[#003F2B]",
                            )}
                          >
                            {step.title}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "font-sans [font-size:clamp(15px,calc(18*100vw/1920),18px)] [line-height:clamp(22px,calc(27*100vw/1920),27px)] font-bold break-words whitespace-pre-line",
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

      {/* ── 채용공고 섹션 ── */}
      <section ref={jobsSectionRef}>
        <PageContentMax className="pb-10 md:pb-16">
          <div className={cn(sectionTitleRowClass, "max-lg:pt-5")}>
            <SectionTitleStar className="h-[21px] w-[21px] md:h-5 md:w-5" />
            <h2 className={sectionTitleH2Class}>채용공고</h2>
          </div>

          {/* 모바일: 탭 + 필터 세로 / lg: 한 줄 — 탭 | 세로 구분선 | 필터(입사지원 탭 오른쪽 정렬) */}
          <div
            ref={dropdownRef}
            className={cn(
              "mb-4 flex w-full flex-col gap-0 overflow-visible",
              "lg:flex-row lg:flex-nowrap lg:items-center lg:gap-x-3 lg:rounded-[clamp(20px,calc(40*100vw/1920),40px)] lg:bg-[#02633E] lg:px-[clamp(16px,calc(60*100vw/1920),60px)] lg:py-[clamp(12px,calc(20*100vw/1920),20px)]",
            )}
          >
            {/* 모바일: 탭 줄 배경=페이지색 · 활성=흰 pill(#154725) · 비활성=녹색 pill · lg+: 녹색 바 */}
            <div className="flex w-full shrink-0 flex-col gap-1 py-[14px] max-lg:rounded-none max-lg:bg-transparent lg:w-auto lg:flex-row lg:flex-nowrap lg:items-center lg:gap-[clamp(8px,calc(10*100vw/1920),10px)] lg:px-0 lg:py-0">
              <div className="flex flex-wrap items-center gap-[10px]">
                {(["전체공고", "채용공고", "입사지원"] as MainTab[]).map(
                  (tab) => {
                    const label =
                      tab === "전체공고"
                        ? `전체 공고 (${jobs.length})`
                        : tab === "채용공고"
                          ? "채용공고"
                          : "입사지원";
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
                            : "rounded-[40px] bg-[#02633E] font-bold text-white max-lg:ring-0 lg:bg-transparent lg:font-bold lg:text-white lg:ring-1 lg:ring-white/25 lg:ring-inset",
                        )}
                      >
                        {label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {mainTab === "채용공고" && (
              <>
                <div
                  className="hidden h-5 w-px shrink-0 self-center bg-white/35 lg:block"
                  aria-hidden
                />
                <div
                  className={cn(
                    "flex min-h-0 min-w-0 flex-1 flex-wrap items-center justify-end overflow-visible",
                    "max-lg:w-full max-lg:gap-[20px] max-lg:border-t max-lg:border-black/20 max-lg:px-4 max-lg:py-5",
                    "lg:gap-[clamp(8px,calc(10*100vw/1920),10px)] lg:border-t-0 lg:px-0 lg:py-0",
                  )}
                >
                  {/* 전체 직무 — 열림 시 패널은 트리거 너비에 맞춰 바로 아래에 고정(absolute) */}
                  <div
                    className={cn(
                      "relative w-fit shrink-0 self-start",
                      openDropdown === "job" ? "z-[60]" : "z-30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown("job")}
                      aria-expanded={openDropdown === "job"}
                      className={cn(
                        "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-bold text-white transition-colors",
                        "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                        careersFilterDropdownFont,
                        "max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:text-black",
                        openDropdown === "job" &&
                          "max-lg:text-[#32AF32] lg:bg-[#32AF32] lg:text-white",
                      )}
                    >
                      {formatJobFilterDisplay(jobFilter)}
                      {openDropdown === "job" ? (
                        <ChevronUp className={filterChevronClass} aria-hidden />
                      ) : (
                        <ChevronDown
                          className={filterChevronClass}
                          aria-hidden
                        />
                      )}
                    </button>
                    {openDropdown === "job" && (
                      <div className="absolute top-full left-0 z-[70] mt-[clamp(2px,calc(4*100vw/1920),4px)] max-w-[min(calc(100vw-2rem),24rem)] min-w-full">
                        <CareersFilterDropdownOpen
                          currentValue={jobFilter}
                          options={FILTER_JOBS}
                          formatLabel={formatJobFilterDisplay}
                          onPick={(opt) => {
                            setJobFilter(opt);
                            setOpenDropdown(null);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 전체 경력 — 500 */}
                  <div
                    className={cn(
                      "relative w-fit shrink-0 self-start",
                      openDropdown === "exp" ? "z-[60]" : "z-30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown("exp")}
                      aria-expanded={openDropdown === "exp"}
                      className={cn(
                        "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-medium text-white transition-colors",
                        "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                        careersFilterDropdownFont,
                        "max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:text-black",
                        openDropdown === "exp" &&
                          "max-lg:text-[#32AF32] lg:bg-[#32AF32] lg:text-white",
                      )}
                    >
                      {expFilter}
                      {openDropdown === "exp" ? (
                        <ChevronUp className={filterChevronClass} aria-hidden />
                      ) : (
                        <ChevronDown
                          className={filterChevronClass}
                          aria-hidden
                        />
                      )}
                    </button>
                    {openDropdown === "exp" && (
                      <div className="absolute top-full left-0 z-[70] mt-[clamp(2px,calc(4*100vw/1920),4px)] max-w-[min(calc(100vw-2rem),24rem)] min-w-full">
                        <CareersFilterDropdownOpen
                          currentValue={expFilter}
                          options={FILTER_EXP}
                          onPick={(opt) => {
                            setExpFilter(opt);
                            setOpenDropdown(null);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 전체 지역 — 500 */}
                  <div
                    className={cn(
                      "relative w-fit shrink-0 self-start",
                      openDropdown === "region" ? "z-[60]" : "z-30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown("region")}
                      aria-expanded={openDropdown === "region"}
                      className={cn(
                        "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-medium text-white transition-colors",
                        "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                        careersFilterDropdownFont,
                        "max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:text-black",
                        openDropdown === "region" &&
                          "max-lg:text-[#32AF32] lg:bg-[#32AF32] lg:text-white",
                      )}
                    >
                      {regionFilter}
                      {openDropdown === "region" ? (
                        <ChevronUp className={filterChevronClass} aria-hidden />
                      ) : (
                        <ChevronDown
                          className={filterChevronClass}
                          aria-hidden
                        />
                      )}
                    </button>
                    {openDropdown === "region" && (
                      <div className="absolute top-full left-0 z-[70] mt-[clamp(2px,calc(4*100vw/1920),4px)] max-w-[min(calc(100vw-2rem),24rem)] min-w-full">
                        <CareersFilterDropdownOpen
                          currentValue={regionFilter}
                          options={FILTER_REGION}
                          onPick={(opt) => {
                            setRegionFilter(opt);
                            setOpenDropdown(null);
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* 전체 상태 — 플로팅 패널 */}
                  <div
                    className={cn(
                      "relative w-fit shrink-0 self-start",
                      openDropdown === "status" ? "z-[60]" : "z-30",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDropdown("status")}
                      aria-expanded={openDropdown === "status"}
                      className={cn(
                        "flex items-center rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(16*100vw/1920),16px)] py-[clamp(6px,calc(8*100vw/1920),8px)] font-medium text-white transition-colors",
                        "gap-0.5 lg:gap-[clamp(4px,calc(6*100vw/1920),6px)]",
                        careersFilterDropdownFont,
                        "max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 max-lg:font-medium max-lg:text-black",
                        openDropdown === "status" &&
                          "max-lg:text-[#32AF32] lg:bg-[#32AF32] lg:text-white",
                      )}
                    >
                      {statusFilter}
                      {openDropdown === "status" ? (
                        <ChevronUp className={filterChevronClass} aria-hidden />
                      ) : (
                        <ChevronDown
                          className={filterChevronClass}
                          aria-hidden
                        />
                      )}
                    </button>
                    {openDropdown === "status" && (
                      <div className="absolute top-full left-0 z-[70] mt-[clamp(2px,calc(4*100vw/1920),4px)] max-w-[min(calc(100vw-2rem),24rem)] min-w-full">
                        <CareersFilterDropdownOpen
                          currentValue={statusFilter}
                          options={FILTER_STATUS}
                          onPick={(opt) => {
                            setStatusFilter(opt);
                            setOpenDropdown(null);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── 공고 목록 (전체공고 / 채용공고 탭) ── */}
          {mainTab !== "입사지원" && (
            <div className="flex flex-col">
              {filteredJobs.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  해당 조건의 채용공고가 없습니다.
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
                        "lg:gap-x-[clamp(16px,calc(60*100vw/1920),60px)] lg:gap-y-3",
                      )}
                    >
                      <div className="flex shrink-0 flex-wrap items-start gap-1.5 lg:gap-3">
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-3 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs leading-3 font-medium",
                            "lg:px-[clamp(8px,calc(12*100vw/1920),12px)] lg:py-[clamp(6px,calc(8*100vw/1920),8px)] lg:[font-size:clamp(11px,calc(12*100vw/1920),12px)] lg:[line-height:clamp(11px,calc(12*100vw/1920),12px)]",
                            job.status === "모집중" &&
                              "bg-[#32AF32] text-white",
                            job.status === "마감임박" &&
                              "bg-[#F3BC1E] text-[#1F2121]",
                            job.status === "상시채용" &&
                              "bg-[#003F2B] text-white",
                          )}
                        >
                          {job.status}
                        </span>
                        {job.status === "마감임박" && (
                          <span className={jobCardDeptBadgeClass}>안내</span>
                        )}
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
                              <span key={t} className={jobCardMetaRowMobile}>
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
                          {[job.exp, job.region, job.type, job.createdAt].map(
                            (tag) => (
                              <span
                                key={tag}
                                className={cn(jobCardMetaTagClass, "font-sans")}
                              >
                                {tag}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={job.id}
                      className={cn(
                        "bg-[#F4F2E5]",
                        isExpanded && "bg-[#EAE3C9]",
                        "max-lg:border-b max-lg:border-black/20",
                        !isLast && "lg:border-0",
                      )}
                    >
                      <div
                        className={cn(
                          "overflow-hidden transition-all",
                          isExpanded &&
                            "max-lg:rounded-none max-lg:bg-[#EAE3C9] lg:rounded-2xl lg:border-2 lg:border-[#02633E] lg:bg-[#EAE3C9]",
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
                            )}
                            aria-label={isExpanded ? "접기" : "펼치기"}
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
                            지원하기
                            <ArrowUpRight
                              className="h-[1.5em] w-[1.5em] shrink-0 text-white"
                              strokeWidth={2}
                              aria-hidden
                            />
                          </button>
                        </div>

                        {/* 모바일: 접힘 pt·pb·border 시안 / 펼침 F4F2E5 헤더 → 본문 → 화살표 */}
                        <div className="flex w-full flex-col lg:hidden">
                          {isExpanded ? (
                            <div className="border-b border-[#1F2121]/20 bg-[#F4F2E5] py-5">
                              <div className="flex w-full items-center justify-between gap-3">
                                {leftSummary}
                                <button
                                  type="button"
                                  onClick={() => handleApply(job.title)}
                                  className={applyBtnClass}
                                >
                                  지원하기
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
                                  지원하기
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
                                  aria-label="펼치기"
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
                                담당업무
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
                                자격요건
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
                              aria-label="접기"
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
                      {!isLast && (
                        <div
                          className="hidden h-px w-full shrink-0 bg-[#D8D0BB] lg:block"
                          aria-hidden
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── 입사지원 탭 콘텐츠 ── */}
          {mainTab === "입사지원" && (
            <div className="rounded-2xl bg-[#F4F2E5] px-5 py-8 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 md:px-8 md:py-10">
              <div className="mx-auto mb-6 w-full max-w-[750px] max-lg:mb-0 lg:max-w-[min(750px,calc(750*100vw/1920))]">
                <h3
                  className={cn(
                    "text-2xl font-bold tracking-[-0.04em] lg:text-[clamp(1.125rem,calc(24*100vw/1920),1.5rem)]",
                    "max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-2xl max-lg:font-extrabold max-lg:leading-9 max-lg:tracking-normal",
                  )}
                  style={{ color: "#1F2121" }}
                >
                  입사지원서
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
                    지원서가 제출되었습니다!
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    서류 검토 후 1주일 내에 개별 연락드리겠습니다.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleFormSubmit}
                  className="space-y-4 max-lg:space-y-10"
                >
                  {/* 폼 카드 */}
                  <div className="mx-auto w-full max-w-[750px] space-y-8 rounded-2xl bg-[#F4F2E5] px-6 py-8 max-lg:max-w-none max-lg:space-y-10 max-lg:rounded-none max-lg:bg-transparent max-lg:px-0 max-lg:py-0 md:px-8 lg:max-w-[min(750px,calc(750*100vw/1920))]">
                    {/* ── 기본정보 ── */}
                    <div className={jobApplySectionBlockMobile}>
                      <p
                        className={cn(
                          "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                        )}
                      >
                        기본정보
                      </p>
                      <div className="space-y-4 max-lg:space-y-5">
                        {/* 성함 */}
                        <div>
                          <div className="mb-1.5 flex items-center justify-between max-lg:mb-0">
                            <div className="flex items-center gap-0.5">
                              <span
                                className={cn(
                                  jobApplyLabelDesktop,
                                  "max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                )}
                              >
                                성함
                              </span>
                              <span className={jobApplyStarClass}>*</span>
                            </div>
                            <span className="hidden text-right max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-xs max-lg:font-normal max-lg:text-black">
                              <span className="text-[#F3372C]">* </span>
                              필수 입력사항
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
                            placeholder="홍길동"
                            className={jobApplyInputClass}
                          />
                        </div>

                        {/* 연락처 */}
                        <div className={jobApplySubfieldMobile}>
                          <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                            <label
                              className={cn(
                                jobApplyLabelDesktop,
                                "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                              )}
                            >
                              연락처
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
                            placeholder="연락처를 입력해주세요."
                            className={jobApplyInputClass}
                          />
                        </div>

                        {/* 이메일 */}
                        <div className={jobApplySubfieldMobile}>
                          <label
                            className={cn(
                              jobApplyLabelDesktop,
                              "max-lg:mb-0 max-lg:block max-lg:w-full max-lg:max-w-[200px] max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                            )}
                          >
                            이메일
                          </label>
                          <div className="flex w-full flex-col gap-5 lg:flex-row lg:items-center lg:gap-2">
                            <input
                              type="text"
                              value={formData.emailLocal}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  emailLocal: e.target.value,
                                }))
                              }
                              placeholder="이메일을 입력해주세요."
                              className={cn(jobApplyInputClass, "lg:flex-1")}
                            />
                            <span className="hidden font-[Pretendard,system-ui,sans-serif] text-lg font-light leading-5 text-[#7B7B7B] max-lg:inline lg:hidden">
                              @
                            </span>
                            <span className="hidden text-gray-400 lg:inline">
                              @
                            </span>
                            {formData.emailDomain === "" ||
                            formData.emailDomain === "직접입력" ? (
                              <input
                                type="text"
                                value={formData.emailDomainCustom}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    emailDomainCustom: e.target.value,
                                  }))
                                }
                                placeholder=" "
                                className={cn(
                                  jobApplyInputClass,
                                  "font-[Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] placeholder:text-[#7B7B7B]/40 lg:w-32 lg:text-sm lg:font-normal lg:text-inherit",
                                )}
                              />
                            ) : (
                              <select
                                value={formData.emailDomain}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    emailDomain: e.target.value,
                                  }))
                                }
                                className={cn(
                                  jobApplyInputClass,
                                  "lg:w-36",
                                )}
                              >
                                <option value="">직접입력</option>
                                {EMAIL_DOMAINS.slice(1).map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 성별 */}
                        <div className={jobApplySubfieldMobile}>
                          <div className="mb-1.5 flex max-lg:mb-0 max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                            <label
                              className={cn(
                                jobApplyLabelDesktop,
                                "max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                              )}
                            >
                              성별
                            </label>
                            <span className={jobApplyStarClass}>*</span>
                          </div>
                          <div className="flex gap-2">
                            {["남성", "여성"].map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() =>
                                  setFormData((p) => ({ ...p, gender: g }))
                                }
                                className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-all max-lg:min-h-[48px] max-lg:flex-1 max-lg:rounded-[10px] max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base"
                                style={
                                  formData.gender === g
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
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr
                      className="max-lg:hidden"
                      style={{ borderColor: "#F0EEDD" }}
                    />

                    {/* ── 학력 ── */}
                    <div className={jobApplySectionBlockMobile}>
                      <p
                        className={cn(
                          "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                        )}
                      >
                        학력
                      </p>
                      <div className="space-y-4 max-lg:space-y-5">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between max-lg:mb-0">
                            <div className="flex items-center gap-0.5">
                              <label
                                className={cn(
                                  jobApplyLabelDesktop,
                                  "max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                )}
                              >
                                학교명
                              </label>
                              <span className={jobApplyStarClass}>*</span>
                            </div>
                            <span className="hidden text-right max-lg:inline max-lg:font-[family-name:var(--font-nanum)] max-lg:text-xs max-lg:font-normal max-lg:text-black">
                              <span className="text-[#F3372C]">* </span>
                              필수 입력사항
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
                            placeholder="예 : 00초등학교"
                            className={jobApplyInputClass}
                          />
                        </div>
                        <div className="grid gap-4 max-lg:grid-cols-1 md:grid-cols-2">
                          <div className={jobApplySubfieldMobile}>
                            <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                              <label
                                className={cn(
                                  jobApplyLabelDesktop,
                                  "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                )}
                              >
                                전공
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
                              placeholder="식품공학과"
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
                                  "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                )}
                              >
                                졸업연도
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

                    <hr
                      className="max-lg:hidden"
                      style={{ borderColor: "#F0EEDD" }}
                    />

                    {/* ── 경력 ── */}
                    <div className={jobApplySectionBlockMobile}>
                      <div className="mb-5 flex flex-wrap items-center gap-2.5 max-lg:mb-0">
                        <p
                          className={cn(
                            "text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                          )}
                        >
                          경력
                        </p>
                        <span className="font-[family-name:var(--font-nanum)] text-xs font-normal text-[#1F2121] max-lg:inline lg:hidden">
                          *최대 5개 추가
                        </span>
                        <div className="min-w-[1rem] flex-1 max-lg:min-w-0" />
                        <button
                          type="button"
                          onClick={addCareer}
                          disabled={careers.length >= 5}
                          className={cn(
                            "flex shrink-0 items-center gap-2.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
                            "max-lg:rounded-[40px] max-lg:px-4 max-lg:py-2",
                            "bg-[#32AF32] lg:bg-[#02633E]",
                          )}
                        >
                          <span className="font-[Pretendard,system-ui,sans-serif] text-lg font-light leading-[18px] max-lg:inline lg:hidden">
                            +
                          </span>
                          <span className="hidden max-lg:inline max-lg:font-[Pretendard,system-ui,sans-serif] max-lg:text-sm max-lg:font-bold max-lg:leading-[21px]">
                            추가
                          </span>
                          <span className="max-lg:hidden">
                            <span className="text-base leading-none">+</span>{" "}
                            경력 사항 추가
                          </span>
                        </button>
                      </div>
                      {careers.length === 0 && (
                        <p className="text-sm text-gray-400 max-lg:hidden">
                          경력이 있으시면 위 버튼을 눌러 추가해 주세요.
                        </p>
                      )}
                      <div className="space-y-4 max-lg:space-y-5">
                        {careers.map((c) => (
                          <div
                            key={c.id}
                            className={cn(
                              "relative rounded-xl bg-[#EAE3C9] p-4 max-lg:flex max-lg:flex-col max-lg:gap-[30px] max-lg:rounded-[10px] max-lg:bg-[#EAE7D2] max-lg:p-5",
                              "space-y-3",
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
                                    "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                  )}
                                >
                                  회사명
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <input
                                type="text"
                                required
                                value={c.company}
                                onChange={(e) =>
                                  updateCareer(c.id, "company", e.target.value)
                                }
                                placeholder="00식품"
                                className={jobApplyInputClass}
                              />
                            </div>
                            {/* 직무 */}
                            <div className={jobApplySubfieldMobile}>
                              <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                                <label
                                  className={cn(
                                    jobApplyLabelDesktop,
                                    "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                  )}
                                >
                                  직무
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <input
                                type="text"
                                required
                                value={c.position}
                                onChange={(e) =>
                                  updateCareer(c.id, "position", e.target.value)
                                }
                                placeholder="생산관리"
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
                                    "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                  )}
                                >
                                  기간
                                </label>
                                <span className={jobApplyStarClass}>*</span>
                              </div>
                              <div
                                className={cn(
                                  jobApplyInputClass,
                                  "flex items-center gap-2.5 !py-0 max-lg:h-[60px]",
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
                                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-[#003F2B] disabled:opacity-50"
                                />
                                <span className="shrink-0 font-[family-name:var(--font-nanum)] text-base font-normal text-[#003F2B]">
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
                                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-[#003F2B] disabled:opacity-50"
                                />
                              </div>
                              <label
                                className={cn(
                                  "mt-2 flex cursor-pointer items-center gap-2.5 text-xs text-gray-600",
                                  "max-lg:mt-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-sm max-lg:font-bold max-lg:text-black",
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
                                재직 중
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr
                      className="max-lg:hidden"
                      style={{ borderColor: "#F0EEDD" }}
                    />

                    {/* ── 자격·어학 ── */}
                    <div className={jobApplySectionBlockMobile}>
                      <p
                        className={cn(
                          "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                        )}
                      >
                        자격 어학
                      </p>
                      <div className="space-y-4 max-lg:space-y-5">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between max-lg:mb-0">
                            <div className="flex items-center gap-0.5">
                              <label
                                className={cn(
                                  jobApplyLabelDesktop,
                                  "max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                                )}
                              >
                                관련 자격증
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
                            placeholder="식품기사, HACCP 등"
                            className={jobApplyInputClass}
                          />
                        </div>
                        <div className={jobApplySubfieldMobile}>
                          <div className="flex max-lg:w-full max-lg:max-w-[200px] max-lg:items-center max-lg:gap-0.5">
                            <label
                              className={cn(
                                jobApplyLabelDesktop,
                                "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                              )}
                            >
                              어학 점수
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
                            placeholder="TOEIC 800점"
                            className={cn(
                              jobApplyInputClass,
                              "max-lg:leading-4",
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <hr
                      className="max-lg:hidden"
                      style={{ borderColor: "#F0EEDD" }}
                    />

                    {/* ── 파일 첨부 ── */}
                    <div className={jobApplySectionBlockMobile}>
                      <p
                        className={cn(
                          "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                        )}
                      >
                        파일 첨부
                      </p>
                      <div className="space-y-4 max-lg:space-y-5">
                        <div className={jobApplySubfieldMobile}>
                          <div className="flex max-lg:items-center max-lg:gap-0.5">
                            <label
                              className={cn(
                                jobApplyLabelDesktop,
                                "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                              )}
                            >
                              이력서
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
                              className="mt-0.5 size-4 shrink-0 text-[#003F2B]"
                              aria-hidden
                            />
                            <span className="flex-1 font-[family-name:var(--font-nanum)] text-sm text-gray-400 max-lg:text-base max-lg:leading-5 max-lg:text-[#003F2B]">
                              <span className="max-lg:hidden">
                                파일 10MB 이하, 업로드 가능: PDF, DOC, DOCX (최대
                                1개까지)
                              </span>
                              <span className="hidden max-lg:inline">
                                클릭하여 파일 업로드 PDF, DOC, DOCX
                                <br />
                                (최대 10MB)
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
                              "max-lg:mb-0 max-lg:block max-lg:w-full max-lg:max-w-[200px] max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                            )}
                          >
                            포트폴리오(선택사항)
                          </label>
                          <label
                            className={cn(
                              jobApplyInputClass,
                              "flex min-h-[60px] cursor-pointer items-start gap-2.5 transition-colors hover:bg-gray-50/80 max-lg:h-auto max-lg:min-h-[60px] max-lg:items-start max-lg:py-[18px]",
                            )}
                          >
                            <Paperclip
                              className="mt-0.5 size-4 shrink-0 text-[#003F2B]"
                              aria-hidden
                            />
                            <span className="flex-1 font-[family-name:var(--font-nanum)] text-sm text-gray-400 max-lg:text-base max-lg:leading-5 max-lg:text-[#003F2B]">
                              <span className="max-lg:hidden">
                                파일 50MB 이하, 업로드 가능: PDF, ZIP (최대 3개까지)
                              </span>
                              <span className="hidden max-lg:inline">
                                클릭하여 파일 업로드 PDF, ZIP
                                <br />
                                (최대 50MB)
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

                    <hr
                      className="max-lg:hidden"
                      style={{ borderColor: "#F0EEDD" }}
                    />

                    {/* ── 자기소개서 ── */}
                    <div className={jobApplySectionBlockMobile}>
                      <p
                        className={cn(
                          "mb-5 text-base font-bold tracking-[-0.03em] text-gray-900 max-lg:mb-0 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-base max-lg:text-black",
                        )}
                      >
                        자기소개서
                      </p>
                      <div className="space-y-2.5 max-lg:space-y-2.5">
                        <div className="flex max-lg:items-center max-lg:gap-0.5">
                          <label
                            className={cn(
                              jobApplyLabelDesktop,
                              "max-lg:mb-0 max-lg:inline max-lg:text-base max-lg:font-bold max-lg:text-black max-lg:font-[family-name:var(--font-nanum)]",
                            )}
                          >
                            지원동기 / 직무 역량
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
                          placeholder="지원 동기와 본인의 강점, 직무 관련 역량 등을 자유롭게 작성해주세요."
                          className={cn(
                            jobApplyInputClass,
                            "h-auto min-h-[150px] resize-none py-3 max-lg:h-auto max-lg:min-h-[200px] max-lg:py-[18px] max-lg:leading-5",
                          )}
                        />
                        <p className="font-[family-name:var(--font-nanum)] text-sm leading-4 text-[#1F2121] lg:hidden">
                          ※ 채용절차법 준수 — 외모·신체조건·출신지 수집 금지
                        </p>
                        <div className="mt-1 text-right text-xs text-gray-400 max-lg:hidden">
                          {formData.coverLetter.length}/1000
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 안내 문구 */}
                  <div className="mx-auto hidden w-full max-w-[750px] lg:block lg:max-w-[min(750px,calc(750*100vw/1920))]">
                    <p className="text-xs text-gray-500">
                      ※ 채용절차법 준수 — 외모·신체조건·출신지 수집 금지
                    </p>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex justify-center pt-2 max-lg:pt-0">
                    <button
                      type="submit"
                      className={cn(
                        "rounded-full px-12 py-3.5 text-sm font-semibold text-white transition-colors hover:brightness-110",
                        "w-full max-lg:rounded-[60px] max-lg:px-10 max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-lg max-lg:font-extrabold max-lg:leading-[23.4px]",
                      )}
                      style={{ backgroundColor: "#02633E" }}
                    >
                      입사지원서 제출
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </PageContentMax>
      </section>

      {/* ── 복리후생: max-lg 3열(3×3에 8장) / lg~ 4열 */}
      <section className="mb-[clamp(40px,calc(100*100vw/1920),100px)] w-full bg-white">
        <PageContentMax
          className="px-0"
          innerClassName="w-full px-4 py-10 md:px-[clamp(16px,calc(160*100vw/1920),160px)] md:py-[clamp(32px,calc(100*100vw/1920),100px)]"
        >
          <div className="flex w-full flex-col items-stretch gap-5 md:gap-[clamp(16px,calc(30*100vw/1920),30px)]">
            <div className={cn(sectionTitleRowClass, "mb-0")}>
              <SectionTitleStar className="h-[21px] w-[21px] md:h-5 md:w-5" />
              <h2 className={cn(sectionTitleH2Class, "flex-1")}>복리후생</h2>
            </div>

            <div className="grid w-full grid-cols-3 gap-2 gap-y-3 lg:grid-cols-4 lg:gap-x-[clamp(16px,calc(32*100vw/1920),40px)] lg:gap-y-[clamp(20px,calc(32*100vw/1920),40px)]">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className={cn(
                    "flex w-full min-w-0 flex-col items-center gap-2 rounded-[14px] bg-white p-2.5",
                    "lg:gap-3 lg:rounded-[clamp(12px,calc(20*100vw/1920),20px)] lg:p-[clamp(20px,calc(40*100vw/1920),40px)]",
                  )}
                >
                  <div className="relative size-8 shrink-0 overflow-hidden lg:size-10">
                    <img
                      src={b.icon}
                      alt=""
                      className="h-full w-full object-contain object-center"
                      aria-hidden
                    />
                  </div>
                  <p
                    className={cn(
                      "w-full text-center font-[family-name:var(--font-nanum)] font-bold text-[#1F2121]",
                      "text-xs leading-[16px] tracking-tight max-lg:[word-break:keep-all]",
                      "lg:text-base lg:leading-6 lg:tracking-[-0.02em] lg:[font-size:clamp(16px,calc(20*100vw/1920),20px)] lg:[line-height:clamp(24px,calc(30*100vw/1920),30px)]",
                    )}
                  >
                    {b.title}
                  </p>
                </div>
              ))}
            </div>

            <p className="font-[family-name:var(--font-nanum)] text-xs leading-[18px] font-bold text-[#1F2121] opacity-40 md:[font-size:clamp(13px,calc(14*100vw/1920),14px)] md:[line-height:clamp(19px,calc(21*100vw/1920),21px)]">
              ※ 상세 복리후생은 입사 시 안내드립니다.
            </p>
          </div>
        </PageContentMax>
      </section>
    </div>
  );
}
