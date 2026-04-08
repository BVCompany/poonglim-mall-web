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
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
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

type JobFilter = (typeof FILTER_JOBS)[number];
type ExpFilter = (typeof FILTER_EXP)[number];
type RegionFilter = (typeof FILTER_REGION)[number];
type StatusFilter = (typeof FILTER_STATUS)[number];

/* ── 주요 모집 직무 (public/recruit/ 아이콘) ── */
const KEY_JOBS = [
  {
    icon: "/recruit/prod_icon.png",
    label: "생산·현장직",
    desc: "생산관리, 지게차, SCM 현장",
  },
  {
    icon: "/recruit/manage_icon.png",
    label: "경영지원",
    desc: "인사총무, 기획, 회계",
  },
  {
    icon: "/recruit/dis_icon.png",
    label: "SCM·물류",
    desc: "물류관리, 차재, 구매",
  },
  {
    icon: "/recruit/research_icon.png",
    label: "품질·연구",
    desc: "품질보증, 공정관리, 연구소",
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

/* ── 채용 절차 ── */
const STEPS = [
  { title: "서류 전형", desc: "홈페이지 내 이력서 + 자기소개서 업로드" },
  { title: "1차 면접", desc: "팀장급 직무 면접" },
  { title: "2차 면접", desc: "임원 면접 (직급에 따라 생략 가능)" },
  { title: "최종 합격·입사", desc: "처우 협의 후 입사 일정 확정" },
];

/* ── 복리후생 ── */
const BENEFITS = [
  { icon: "/recruit/fi-rr-utensils.png", title: "식사제공" },
  { icon: "/recruit/fi-rr-school-bus.png", title: "차량유지비" },
  { icon: "/recruit/Vector.png", title: "4대보험" },
  { icon: "/recruit/Vector-1.png", title: "주 5일 근무" },
  { icon: "/recruit/Vector-2.png", title: "연차휴가" },
  { icon: "/recruit/Vector-3.png", title: "명절 상여" },
  { icon: "/recruit/Vector-4.png", title: "경조사 지원" },
  { icon: "/recruit/Vector-5.png", title: "자기개발 지원" },
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
    setCareers((p) => [
      ...p,
      {
        id: Date.now(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      },
    ]);
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
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

      {/* ── 주요 모집 직무 ── */}
      <section>
        <PageContentMax className="py-10 md:py-16">
        <div className="mb-6 flex items-center gap-2">
          <img
            src="/home/product-star.png"
            alt="star"
            className="h-5 w-5 object-contain"
          />
          <h2
            className="text-2xl tracking-[-0.04em] text-gray-900"
            style={{ fontWeight: 800 }}
          >
            주요 모집 직무
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {KEY_JOBS.map(({ icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 rounded-2xl border px-6 py-5"
              style={{ backgroundColor: "#EAE3C9", borderColor: "#D8D0BB" }}
            >
              {/* 아이콘 + 직무명 */}
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                  <img
                    src={icon}
                    alt={label}
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <span
                  className="text-[18px] tracking-[-0.04em] text-gray-900"
                  style={{ fontWeight: 700 }}
                >
                  {label}
                </span>
              </div>
              {/* 설명 */}
              <p className="shrink-0 text-right text-[13px] text-gray-500">
                {desc}
              </p>
            </div>
          ))}
        </div>
        </PageContentMax>
      </section>

      {/* ── 채용 절차 ── */}
      <section>
        <PageContentMax className="pb-10 md:pb-16">
        <div className="mb-6 flex items-center gap-2">
          <img
            src="/home/product-star.png"
            alt="star"
            className="h-5 w-5 object-contain"
          />
          <h2
            className="text-2xl tracking-[-0.04em] text-gray-900"
            style={{ fontWeight: 800 }}
          >
            채용 절차
          </h2>
        </div>

        {/* 모바일: 세로 배치 / 데스크탑: 가로 배치 */}
        <div className="flex flex-col items-center gap-[52px] lg:flex-row lg:flex-nowrap lg:items-stretch lg:gap-[4px]">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={step.title}
                className="relative w-full lg:w-[368px] lg:shrink-0"
              >
                {/* 카드 */}
                <div
                  className="flex h-full flex-col justify-between rounded-2xl p-6"
                  style={{
                    minHeight: "210px",
                    backgroundColor: isLast ? "#02633E" : "#ffffff",
                  }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                    style={
                      isLast
                        ? {
                            backgroundColor: "rgba(255,255,255,0.2)",
                            color: "#fff",
                          }
                        : { backgroundColor: "#1F2121", color: "#fff" }
                    }
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p
                      className="text-base font-bold tracking-[-0.03em]"
                      style={{ color: isLast ? "#fff" : "#111827" }}
                    >
                      {step.title}
                    </p>
                    <p
                      className="mt-1.5 text-xs leading-relaxed"
                      style={{
                        color: isLast ? "rgba(255,255,255,0.7)" : "#6B7280",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>

                {!isLast && (
                  <>
                    {/* 데스크탑: 오른쪽 경계 중앙 absolute */}
                    <div
                      className="absolute top-1/2 z-10 hidden h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full lg:flex"
                      style={{ right: "-24px", backgroundColor: "#F0EEDD" }}
                    >
                      <ChevronRight
                        className="h-5 w-5"
                        style={{ color: "#02633E" }}
                      />
                    </div>

                    {/* 모바일: 하단 경계 중앙 absolute */}
                    <div
                      className="absolute bottom-[-24px] left-1/2 z-10 flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-full lg:hidden"
                      style={{ backgroundColor: "#F0EEDD" }}
                    >
                      <ChevronDown
                        className="h-5 w-5"
                        style={{ color: "#02633E" }}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
        </PageContentMax>
      </section>

      {/* ── 채용공고 섹션 ── */}
      <section ref={jobsSectionRef}>
        <PageContentMax className="pb-10 md:pb-16">
        <div className="mb-6 flex items-center gap-2">
          <img
            src="/home/product-star.png"
            alt="star"
            className="h-5 w-5 object-contain"
          />
          <h2 className="text-lg font-bold tracking-[-0.04em] text-gray-900 md:text-2xl">
            채용공고
          </h2>
        </div>

        {/* ── 통합 탭+필터 바 ── */}
        <div
          className="mb-4 flex flex-wrap items-center gap-1 overflow-visible rounded-full px-2 py-2"
          style={{ backgroundColor: "#02633E" }}
        >
          {/* 기본 탭 3개 */}
          {(["전체공고", "채용공고", "입사지원"] as MainTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setMainTab(tab);
                setOpenDropdown(null);
              }}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors md:px-5 md:text-sm"
              style={
                mainTab === tab
                  ? { backgroundColor: "#fff", color: "#02633E" }
                  : {
                      backgroundColor: "transparent",
                      color: "rgba(255,255,255,0.75)",
                    }
              }
            >
              {tab}
            </button>
          ))}

          {/* 채용공고 탭일 때만: 구분선 + 4개 드롭다운 필터 */}
          {mainTab === "채용공고" && (
            <div ref={dropdownRef} className="flex items-center gap-1">
              <div className="mx-1 h-5 w-px shrink-0 bg-white/40" />

              {/* 전체직무 */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("job")}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors md:px-4 md:text-sm"
                  style={{
                    backgroundColor:
                      jobFilter !== "전체직무"
                        ? "rgba(255,255,255,0.2)"
                        : "transparent",
                  }}
                >
                  {jobFilter}
                  {openDropdown === "job" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {openDropdown === "job" && (
                  <div
                    className="absolute top-full left-0 z-30 mt-1 min-w-[110px] overflow-hidden rounded-xl shadow-xl"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    {FILTER_JOBS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setJobFilter(opt);
                          setOpenDropdown(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                      >
                        {jobFilter === opt && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                        <span
                          className={jobFilter === opt ? "font-semibold" : ""}
                        >
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 전체 경력 */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("exp")}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors md:px-4 md:text-sm"
                  style={{
                    backgroundColor:
                      expFilter !== "전체 경력"
                        ? "rgba(255,255,255,0.2)"
                        : "transparent",
                  }}
                >
                  {expFilter}
                  {openDropdown === "exp" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {openDropdown === "exp" && (
                  <div
                    className="absolute top-full left-0 z-30 mt-1 min-w-[110px] overflow-hidden rounded-xl shadow-xl"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    {FILTER_EXP.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setExpFilter(opt);
                          setOpenDropdown(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                      >
                        {expFilter === opt && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                        <span
                          className={expFilter === opt ? "font-semibold" : ""}
                        >
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 전체 지역 */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("region")}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors md:px-4 md:text-sm"
                  style={{
                    backgroundColor:
                      regionFilter !== "전체 지역"
                        ? "rgba(255,255,255,0.2)"
                        : "transparent",
                  }}
                >
                  {regionFilter}
                  {openDropdown === "region" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {openDropdown === "region" && (
                  <div
                    className="absolute top-full left-0 z-30 mt-1 min-w-[110px] overflow-hidden rounded-xl shadow-xl"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    {FILTER_REGION.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setRegionFilter(opt);
                          setOpenDropdown(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                      >
                        {regionFilter === opt && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                        <span
                          className={
                            regionFilter === opt ? "font-semibold" : ""
                          }
                        >
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 전체 상태 */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown("status")}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-colors md:px-4 md:text-sm"
                  style={{
                    backgroundColor:
                      statusFilter !== "전체 상태"
                        ? "rgba(255,255,255,0.2)"
                        : "transparent",
                  }}
                >
                  {statusFilter}
                  {openDropdown === "status" ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
                {openDropdown === "status" && (
                  <div
                    className="absolute top-full left-0 z-30 mt-1 min-w-[110px] overflow-hidden rounded-xl shadow-xl"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    {FILTER_STATUS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setStatusFilter(opt);
                          setOpenDropdown(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                      >
                        {statusFilter === opt && (
                          <Check className="h-3 w-3 shrink-0" />
                        )}
                        <span
                          className={
                            statusFilter === opt ? "font-semibold" : ""
                          }
                        >
                          {opt}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 공고 목록 (전체공고 / 채용공고 탭) ── */}
        {mainTab !== "입사지원" && (
          <div className="flex flex-col gap-3">
            {filteredJobs.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-400">
                해당 조건의 채용공고가 없습니다.
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isExpanded = expandedId === job.id;
                const statusStyle =
                  job.status === "모집중"
                    ? { backgroundColor: "#02633E", color: "#fff" }
                    : job.status === "마감임박"
                      ? { backgroundColor: "#D97706", color: "#fff" }
                      : { backgroundColor: "#6B7280", color: "#fff" };
                return (
                  <div
                    key={job.id}
                    className="overflow-hidden rounded-2xl transition-all"
                    style={{
                      backgroundColor: "#EAE3C9",
                      border: isExpanded
                        ? "2px solid #02633E"
                        : "2px solid transparent",
                    }}
                  >
                    {/* ── 요약 행 ── */}
                    <div className="flex items-center gap-4 px-5 py-4 md:px-6 md:py-5">
                      {/* 상태 뱃지 */}
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-center text-[11px] font-semibold"
                        style={statusStyle}
                      >
                        {job.status}
                      </span>
                      {/* 직무팀 뱃지 */}
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-center text-[11px] font-semibold"
                        style={{
                          backgroundColor: "rgba(0,63,43,0.12)",
                          color: "#003F2B",
                        }}
                      >
                        {job.dept}
                      </span>

                      {/* 중앙: 제목 + 하위 태그들 */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold tracking-[-0.02em] text-gray-900 md:text-base">
                          {job.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {[job.exp, job.region, job.type, job.createdAt].map(
                            (tag) => (
                              <span
                                key={tag}
                                className="rounded-full border px-2.5 py-0.5 text-[11px] text-gray-500"
                                style={{
                                  borderColor: "#D8D0BB",
                                  backgroundColor: "rgba(0,0,0,0.03)",
                                }}
                              >
                                {tag}
                              </span>
                            ),
                          )}
                        </div>
                      </div>

                      {/* 오른쪽: 아코디언 토글 + 지원하기 버튼 */}
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          onClick={() => toggleExpand(job.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
                          aria-label={isExpanded ? "접기" : "펼치기"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleApply(job.title)}
                          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110 active:scale-95 md:px-4 md:py-2 md:text-sm"
                          style={{ backgroundColor: "#02633E" }}
                        >
                          지원하기
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* ── 아코디언 상세 영역 ── */}
                    {isExpanded && (
                      <div
                        className="border-t px-5 py-5 md:px-6 md:py-6"
                        style={{ borderColor: "#02633E" }}
                      >
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* 담당업무 */}
                          <div>
                            <p className="mb-3 text-sm font-bold text-gray-900">
                              담당업무
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.duties.map((d) => (
                                <span
                                  key={d}
                                  className="rounded-full px-3 py-1 text-xs text-gray-700"
                                  style={{
                                    backgroundColor: "rgba(0,0,0,0.06)",
                                  }}
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* 자격요건 */}
                          <div>
                            <p className="mb-3 text-sm font-bold text-gray-900">
                              자격요건
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.requirements.map((r) => (
                                <span
                                  key={r}
                                  className="rounded-full px-3 py-1 text-xs text-gray-700"
                                  style={{
                                    backgroundColor: "rgba(0,0,0,0.06)",
                                  }}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── 입사지원 탭 콘텐츠 ── */}
        {mainTab === "입사지원" && (
          <div
            className="rounded-2xl px-5 py-8 md:px-8 md:py-10"
            style={{ backgroundColor: "#F5F2EB" }}
          >
            <div className="mx-auto mb-6 w-full max-w-[750px]">
              <h3
                className="text-2xl font-bold tracking-[-0.04em]"
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
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* 폼 카드 */}
                <div
                  className="mx-auto w-full max-w-[750px] space-y-8 rounded-2xl px-6 py-8 md:px-8"
                  style={{ backgroundColor: "#F5F2EB" }}
                >
                  {/* ── 기본정보 ── */}
                  <div>
                    <p className="mb-5 text-base font-bold tracking-[-0.03em] text-gray-900">
                      기본정보
                    </p>
                    <div className="space-y-4">
                      {/* 성별 + 이름 */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-gray-600">
                            성별 *
                          </label>
                          <span className="text-xs text-gray-400">
                            성별 입력해
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {["남성", "여성"].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, gender: g }))
                              }
                              className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-all"
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

                      {/* 이름 */}
                      <div>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((p) => ({ ...p, name: e.target.value }))
                          }
                          placeholder="홍길동"
                          className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                          style={{ borderColor: "#E5E0D4" }}
                        />
                      </div>

                      {/* 연락처 */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                          연락처 *
                        </label>
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
                          placeholder="연락처를 입력해 주세요."
                          className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                          style={{ borderColor: "#E5E0D4" }}
                        />
                      </div>

                      {/* 이메일 */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                          이메일
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.emailLocal}
                            onChange={(e) =>
                              setFormData((p) => ({
                                ...p,
                                emailLocal: e.target.value,
                              }))
                            }
                            placeholder="이메일을 입력해주세요"
                            className="flex-1 rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                            style={{ borderColor: "#E5E0D4" }}
                          />
                          <span className="text-gray-400">@</span>
                          {formData.emailDomain === "직접입력" ? (
                            <input
                              type="text"
                              value={formData.emailDomainCustom}
                              onChange={(e) =>
                                setFormData((p) => ({
                                  ...p,
                                  emailDomainCustom: e.target.value,
                                }))
                              }
                              placeholder="도메인 입력"
                              className="w-32 rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                              style={{ borderColor: "#E5E0D4" }}
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
                              className="w-36 rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:border-[#02633E]"
                              style={{ borderColor: "#E5E0D4" }}
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
                    </div>
                  </div>

                  <hr style={{ borderColor: "#F0EEDD" }} />

                  {/* ── 학력 ── */}
                  <div>
                    <p className="mb-5 text-base font-bold tracking-[-0.03em] text-gray-900">
                      학력
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                          학교명 *
                        </label>
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
                          placeholder="서울 OO초등학교"
                          className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                          style={{ borderColor: "#E5E0D4" }}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                            전공 *
                          </label>
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
                            placeholder="이공계열사"
                            className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                            style={{ borderColor: "#E5E0D4" }}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                            졸업연도 *
                          </label>
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
                            placeholder="2021"
                            className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                            style={{ borderColor: "#E5E0D4" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: "#F0EEDD" }} />

                  {/* ── 경력 ── */}
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <p className="text-base font-bold tracking-[-0.03em] text-gray-900">
                        경력
                      </p>
                      <button
                        type="button"
                        onClick={addCareer}
                        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all hover:brightness-110"
                        style={{ backgroundColor: "#02633E" }}
                      >
                        <span className="text-base leading-none">+</span> 경력
                        사항 추가
                      </button>
                    </div>
                    {careers.length === 0 && (
                      <p className="text-sm text-gray-400">
                        경력이 있으시면 위 버튼을 눌러 추가해 주세요.
                      </p>
                    )}
                    <div className="space-y-4">
                      {careers.map((c) => (
                        <div
                          key={c.id}
                          className="relative space-y-3 rounded-xl p-4"
                          style={{ backgroundColor: "#EAE3C9" }}
                        >
                          <button
                            type="button"
                            onClick={() => removeCareer(c.id)}
                            className="absolute top-3 right-3 text-lg leading-none text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                          {/* 회사명 */}
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              회사명 *
                            </label>
                            <input
                              type="text"
                              required
                              value={c.company}
                              onChange={(e) =>
                                updateCareer(c.id, "company", e.target.value)
                              }
                              placeholder="주식회사"
                              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02633E]"
                              style={{ borderColor: "#E5E0D4" }}
                            />
                          </div>
                          {/* 직무 */}
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              직무 *
                            </label>
                            <input
                              type="text"
                              required
                              value={c.position}
                              onChange={(e) =>
                                updateCareer(c.id, "position", e.target.value)
                              }
                              placeholder="생산관리팀"
                              className="w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02633E]"
                              style={{ borderColor: "#E5E0D4" }}
                            />
                          </div>
                          {/* 기간 */}
                          <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-600">
                              기간 *
                            </label>
                            <div className="flex items-center gap-2">
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
                                className="flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02633E]"
                                style={{ borderColor: "#E5E0D4" }}
                              />
                              <span className="text-sm text-gray-400">~</span>
                              <input
                                type="date"
                                value={c.endDate}
                                onChange={(e) =>
                                  updateCareer(c.id, "endDate", e.target.value)
                                }
                                disabled={c.isCurrent}
                                className="flex-1 rounded-lg border bg-white px-3 py-2.5 text-sm outline-none focus:border-[#02633E] disabled:bg-gray-50"
                                style={{ borderColor: "#E5E0D4" }}
                              />
                            </div>
                            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-gray-600">
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
                                className="accent-[#02633E]"
                              />
                              재직 중
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr style={{ borderColor: "#F0EEDD" }} />

                  {/* ── 자격 이력 ── */}
                  <div>
                    <p className="mb-5 text-base font-bold tracking-[-0.03em] text-gray-900">
                      자격 이력
                    </p>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        관련 자격증 *
                      </label>
                      <input
                        type="text"
                        value={formData.qualifications}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            qualifications: e.target.value,
                          }))
                        }
                        placeholder="자격증 / 기술  HACCP 등"
                        className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>
                  </div>

                  <hr style={{ borderColor: "#F0EEDD" }} />

                  {/* ── 어학 실력 ── */}
                  <div>
                    <p className="mb-5 text-base font-bold tracking-[-0.03em] text-gray-900">
                      어학 실력
                    </p>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        어학 점수 *
                      </label>
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
                        className="w-full rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                        style={{ borderColor: "#E5E0D4" }}
                      />
                    </div>
                  </div>

                  <hr style={{ borderColor: "#F0EEDD" }} />

                  {/* ── 파일 첨부 ── */}
                  <div>
                    <p className="mb-5 text-base font-bold tracking-[-0.03em] text-gray-900">
                      파일 첨부
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                          이력서 *
                        </label>
                        <label
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors hover:bg-gray-50"
                          style={{ borderColor: "#E5E0D4" }}
                        >
                          <span className="text-gray-400">📎</span>
                          <span className="flex-1 text-sm text-gray-400">
                            파일 5MB 이하, 업로드 가능: PDF, JPG, DOCX (최대
                            1개까지)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.docx"
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                          포트폴리오{" "}
                          <span className="font-normal text-gray-400">
                            (선택사항)
                          </span>
                        </label>
                        <label
                          className="flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-colors hover:bg-gray-50"
                          style={{ borderColor: "#E5E0D4" }}
                        >
                          <span className="text-gray-400">📎</span>
                          <span className="flex-1 text-sm text-gray-400">
                            파일 5MB 이하, 업로드 가능: PDF, JPG, DOCX (최대
                            3개까지)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.docx"
                            multiple
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <hr style={{ borderColor: "#F0EEDD" }} />

                  {/* ── 자기소개서 ── */}
                  <div>
                    <p className="mb-5 text-base font-bold tracking-[-0.03em] text-gray-900">
                      자기소개서
                    </p>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                        지원동기 / 직무 적합 *
                      </label>
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
                        placeholder="지원 동기와 직무, 지원한 회사, 해당 동사를 자세하게 작성해주세요."
                        className="w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm outline-none focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]"
                        style={{ borderColor: "#E5E0D4" }}
                      />
                      <div className="mt-1 text-right text-xs text-gray-400">
                        {formData.coverLetter.length}/1000
                      </div>
                    </div>
                  </div>
                </div>

                {/* 안내 문구 */}
                <div className="mx-auto w-full max-w-[750px]">
                  <p className="text-xs text-gray-500">
                    ※ 서류전형 준수 — 최대 심사후 합격여부 고지 (비고 공지)
                  </p>
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    className="rounded-full px-12 py-3.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
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

      {/* ── 복리후생 ── */}
      <section className="w-full bg-white" style={{ minHeight: "637px" }}>
        <PageContentMax className="py-16 md:py-20">
          <div
            className="flex min-h-[637px] flex-col justify-center"
          >
          <div className="mb-8 flex items-center gap-2">
            <img
              src="/home/product-star.png"
              alt="star"
              className="h-5 w-5 object-contain"
            />
            <h2
              className="text-2xl tracking-[-0.04em] text-gray-900"
              style={{ fontWeight: 800 }}
            >
              복리후생
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex flex-col justify-between rounded-2xl border p-6"
                style={{
                  height: "146px",
                  borderColor: "#E5E0D4",
                  backgroundColor: "#ffffff",
                }}
              >
                <img
                  src={b.icon}
                  alt={b.title}
                  className="h-8 w-8 object-contain"
                />
                <p
                  className="font-bold tracking-[-0.04em] text-gray-900"
                  style={{ fontSize: "20px" }}
                >
                  {b.title}
                </p>
              </div>
            ))}
          </div>
          <p
            className="mt-5 text-[14px] font-bold tracking-[-0.04em]"
            style={{ color: "#1F2121" }}
          >
            ※ 상세 복리후생은 입사 시 안내드립니다.
          </p>
          </div>
        </PageContentMax>
      </section>
    </div>
  );
}
