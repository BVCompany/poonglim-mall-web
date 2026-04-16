/**
 * 등급판정서 목록 페이지
 */
import type { Route } from "./+types/grade-certificate";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Paperclip,
  Search,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import {
  SectionPageTitle,
  SectionTitleStar,
} from "~/core/components/section-title-star";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import { getGradeCertificates } from "../lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "등급판정서 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab = (url.searchParams.get("tab") ?? "current") as
    | "current"
    | "archive";
  const rawType = url.searchParams.get("type") ?? "전체";
  const activeType = rawType === "전체보기" ? "전체" : rawType;

  const [dbCerts, pageBanner] = await Promise.all([
    getGradeCertificates(
      tab,
      activeType === "전체" ? undefined : activeType,
    ).catch(() => []),
    getPageBanner("grade-certificate").catch(() => null),
  ]);

  return { dbCerts, pageBanner, activeTab: tab, activeType };
}

/* ── 더미 데이터 (is_new: 모바일 N 뱃지 — DB 연동 시 필드 추가 가능) ── */
const MOCK_CERTS = [
  {
    cert_id: 12,
    tab: "current",
    cert_type: "포장란",
    title: "2026년 2월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02260002.pdf",
    view_count: 246,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2026-02-18",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 11,
    tab: "current",
    cert_type: "액란",
    title: "2026년 1월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02260001.pdf",
    view_count: 312,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2026-01-18",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 10,
    tab: "current",
    cert_type: "포장란",
    title: "2025년 12월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02251202.pdf",
    view_count: 180,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-12-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 9,
    tab: "current",
    cert_type: "액란",
    title: "2025년 11월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02251101.pdf",
    view_count: 215,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-11-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 8,
    tab: "current",
    cert_type: "포장란",
    title: "2026년 10월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02251002.pdf",
    view_count: 423,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-10-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 7,
    tab: "current",
    cert_type: "액란",
    title: "2025년 9월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02250901.pdf",
    view_count: 199,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-09-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 6,
    tab: "current",
    cert_type: "포장란",
    title: "2025년 8월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02250802.pdf",
    view_count: 215,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-08-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 5,
    tab: "current",
    cert_type: "액란",
    title: "2025년 7월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02250701.pdf",
    view_count: 234,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-07-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 4,
    tab: "current",
    cert_type: "포장란",
    title: "2025년 6월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02250602.pdf",
    view_count: 142,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-06-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 3,
    tab: "current",
    cert_type: "액란",
    title: "2025년 5월 계란 안전성 검사결과",
    file_url: "#",
    file_name: "6004-02250501.pdf",
    view_count: 125,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2025-05-15",
    is_pinned: false,
    is_new: true,
  },
  {
    cert_id: 2,
    tab: "archive",
    cert_type: "포장란",
    title: "2022년 11월 등급판정서 (포장란)",
    file_url: "#",
    file_name: "6004-old-0001.pdf",
    view_count: 88,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2022-11-01",
    is_pinned: false,
    is_new: false,
  },
  {
    cert_id: 1,
    tab: "archive",
    cert_type: "액란",
    title: "2022년 10월 등급판정서 (액란)",
    file_url: "#",
    file_name: "6004-old-0002.pdf",
    view_count: 55,
    is_active: true,
    content: "",
    author: "풍림푸드",
    created_at: "2022-10-01",
    is_pinned: false,
    is_new: false,
  },
];

/** URL/필터 값 유지 — 모바일 시안 라벨만 다름 */
const CERT_TYPES = ["전체", "액란", "포장란", "기타"] as const;
const TYPE_FILTER_LABEL: Record<string, string> = {
  전체: "전체보기",
  액란: "액란",
  포장란: "포장란",
  기타: "기타",
};
const ITEMS_PER_PAGE = 10;

const GRADE_CERT_NOTICE_CURRENT =
  "아래의 게시판의 등급판정서는 당사에 공급된 계란 중에 당사 내에 위치한 축산물품질평가원 지원사무소 축산물품질평가사로부터 1+등급 또는 1등급 판정 받은 계란에 한하여 판정서를 게시하고 있으며, 해당 계란을 공급받으신 곳에 한하여 열람이 가능합니다.";

export default function GradeCertificateScreen({
  loaderData,
}: Route.ComponentProps) {
  const { dbCerts, pageBanner, activeTab, activeType } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const allCerts = (
    dbCerts.length > 0 ? dbCerts : MOCK_CERTS
  ) as typeof MOCK_CERTS;
  const sourceCerts = allCerts
    .filter((c) => c.tab === activeTab)
    .filter((c) => activeType === "전체" || c.cert_type === activeType);

  useEffect(() => {
    setPage(1);
  }, [activeTab, activeType, query]);

  const filtered = sourceCerts.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const totalCount = filtered.length;

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const handleTabChange = (tab: "current" | "archive") => {
    setInputValue("");
    setQuery("");
    setPage(1);
    setSearchParams((p) => {
      p.set("tab", tab);
      p.delete("type");
      return p;
    });
  };

  const handleTypeChange = (type: string) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    setSearchParams((p) => {
      if (type === "전체") p.delete("type");
      else p.set("type", type);
      return p;
    });
  };

  const formatDate = (val: string | Date) => {
    const d = new Date(val);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const nanum = "font-[family-name:var(--font-nanum)]";
  const pretendard = "font-[Pretendard,system-ui,sans-serif]";

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/rating_banner_temp.png"
        title="등급판정서"
        subtitle="계란 등급판정 결과를 공개하여 품질 신뢰를 높이고 있습니다"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "등급판정서" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <SectionPageTitle
        as="h1"
        preset="default"
        starVariant="brandIntro"
        className="px-4 py-5 md:hidden"
      >
        등급판정서
      </SectionPageTitle>

      <PageContentMax className="py-6 max-md:pt-0 md:py-0 md:pt-[60px] md:pb-[100px]">
        {/* 모바일: 탭 + 안내 — 하단 border #EAE3C9 */}
        <div className="border-b border-[#EAE3C9] pb-5 md:mb-0 md:border-0 md:pb-0">
          <div className="flex w-full min-w-0 md:hidden">
            <button
              type="button"
              onClick={() => handleTabChange("current")}
              className={cn(
                "flex min-h-16 flex-1 items-center justify-center gap-2.5 rounded-tl-[40px] rounded-bl-[40px] px-5 py-5 font-[family-name:var(--font-nanum)] text-base leading-6 font-extrabold transition-colors",
                activeTab === "current"
                  ? "bg-[#32AF32] text-white"
                  : "bg-[#EAE3C9] text-[#1F2121]",
              )}
            >
              {activeTab === "current" && (
                <SectionTitleStar
                  variant="brandIntro"
                  className="h-3.5 w-3.5 shrink-0 brightness-0 invert"
                />
              )}
              등급판정서
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("archive")}
              className={cn(
                "flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center rounded-tr-[40px] rounded-br-[40px] px-5 py-5 text-center transition-colors",
                activeTab === "archive"
                  ? "bg-[#32AF32] text-white"
                  : "bg-[#EAE3C9] text-[#1F2121]",
              )}
            >
              <span className="font-[family-name:var(--font-nanum)] text-base leading-6 font-extrabold">
                등급판정서
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-nanum)] text-xs leading-[18px]",
                  activeTab === "archive"
                    ? "font-normal text-white"
                    : "font-normal text-[#1F2121]",
                )}
              >
                (2022.11 이전)
              </span>
            </button>
          </div>

          {activeTab === "current" && (
            <p className="pt-5 font-[family-name:var(--font-nanum)] text-xs leading-[19.2px] font-bold text-[#1F2121]/50 md:hidden">
              {GRADE_CERT_NOTICE_CURRENT}
            </p>
          )}
        </div>

        {/* PC: 시안 — 하단 보더 #EAE3C9 · 탭 #32AF32 / #EAE3C9 · 안내 14px bold 50% */}
        <div className="mb-0 hidden border-b border-[#EAE3C9] pb-[60px] md:mb-[60px] md:block">
          <div className="flex w-full min-w-0">
            <button
              type="button"
              onClick={() => handleTabChange("current")}
              className={cn(
                nanum,
                "flex min-h-0 flex-1 items-center justify-center gap-2.5 rounded-tl-[40px] rounded-bl-[40px] px-[30px] py-5 text-xl leading-[30px] font-extrabold transition-colors",
                activeTab === "current"
                  ? "bg-[#32AF32] text-white"
                  : "bg-[#EAE3C9] text-[#1F2121]",
              )}
            >
              {activeTab === "current" && (
                <SectionTitleStar
                  variant="introVector"
                  className="h-[21px] w-[21px] brightness-0 invert"
                />
              )}
              등급판정서
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("archive")}
              className={cn(
                nanum,
                "flex min-h-0 min-w-0 flex-1 flex-wrap items-center justify-center gap-x-1 rounded-tr-[40px] rounded-br-[40px] px-[30px] py-5 text-center text-xl leading-[30px] transition-colors",
                activeTab === "archive"
                  ? "bg-[#32AF32] text-white"
                  : "bg-[#EAE3C9] text-[#1F2121]",
              )}
            >
              <span className="font-extrabold">등급판정서</span>
              <span
                className={cn(
                  "font-normal",
                  activeTab === "archive" ? "text-white" : "text-[#1F2121]",
                )}
              >
                (2022.11 이전)
              </span>
            </button>
          </div>
          {activeTab === "current" && (
            <p
              className={cn(
                nanum,
                "pt-5 text-center text-sm leading-[22.4px] font-bold text-[#1F2121]/50",
              )}
            >
              아래의 게시판의 등급판정서는 당사에 공급된 계란 중에 당사 내에
              위치한 축산물품질평가원 지원사무소 축산물품질평가사로부터
              <br />
              1+등급 또는 1등급 판정 받은 계란에 한하여 판정서를 게시하고
              있으며, 해당 계란을 공급받으신 곳에 한하여 열람이 가능합니다.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-4 pb-5 max-md:pt-5 md:flex-row md:items-end md:justify-between">
            <div className="inline-flex w-full max-w-full min-w-0 flex-nowrap items-center gap-[10px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden">
              {CERT_TYPES.map((type) => {
                const isActive = type === activeType;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeChange(type)}
                    className={cn(
                      pretendard,
                      "inline-flex shrink-0 items-center justify-center rounded-[40px] px-3 py-1.5 text-center text-xs leading-[18px] font-bold transition-colors",
                      "md:px-4 md:py-2 md:text-lg md:leading-[27px] md:font-bold",
                      isActive && "gap-1.5",
                      isActive
                        ? "bg-[#02633E] text-white"
                        : "bg-[#EAE3C9] text-[#1F2121]",
                    )}
                  >
                    {isActive && (
                      <Check
                        className="h-3 w-3 shrink-0 text-white md:h-4 md:w-4"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    )}
                    {TYPE_FILTER_LABEL[type] ?? type}
                  </button>
                );
              })}
            </div>

            <div className="hidden shrink-0 items-center gap-1.5 md:flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="검색어를 입력해주세요."
                className={cn(
                  nanum,
                  "h-auto w-[360px] max-w-[min(360px,calc(100vw-12rem))] rounded-[60px] border-0 bg-white px-10 py-5 text-base leading-6 font-bold text-[#1F2121] outline-none placeholder:text-[#1F2121]",
                )}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="flex shrink-0 items-center justify-center rounded-[60px] bg-[#02633E] p-5 text-white transition-all hover:brightness-110 active:scale-[0.98]"
                aria-label="검색"
              >
                <Search className="h-6 w-6" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 md:gap-[10px]">
                {paginated.map((cert, idx) => {
                  const displayNum =
                    totalCount - ((page - 1) * ITEMS_PER_PAGE + idx);
                  const ext = cert as typeof cert & { is_new?: boolean };
                  const showNew = Boolean(ext.is_new);
                  const hasRealFileUrl = Boolean(
                    cert.file_url && cert.file_url !== "#",
                  );
                  const hasFileMeta =
                    hasRealFileUrl || Boolean(cert.file_name?.trim());
                  const fileHref = hasRealFileUrl ? cert.file_url! : null;

                  return (
                    <Fragment key={cert.cert_id}>
                      <div className="flex rounded-[10px] bg-[#EAE3C9] p-2.5 md:hidden">
                        <div className="inline-flex w-full min-w-0 items-start gap-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex w-[43px] flex-col justify-center text-center font-[family-name:var(--font-nanum)] text-sm leading-[19.6px] font-normal text-[#1F2121] uppercase">
                              {displayNum}
                            </div>
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                            <div className="flex w-full min-w-0 items-start gap-2.5">
                              <Link
                                to={`/support/grade-certificate/${cert.cert_id}`}
                                className="group/link max-w-[calc(100%-3.75rem)] min-w-0 font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] transition-colors [word-wrap:break-word] group-hover/link:text-[#02633E]"
                              >
                                {cert.title}
                              </Link>
                              {showNew && (
                                <span className="inline-flex h-5 shrink-0 flex-col items-center justify-center rounded-[38px] bg-[#32AF32] px-1.5 py-0.5 font-[family-name:var(--font-nanum)] text-[11px] leading-[16.5px] font-bold text-white">
                                  N
                                </span>
                              )}
                              {hasFileMeta ? (
                                fileHref ? (
                                  <a
                                    href={fileHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative h-5 w-5 shrink-0 text-[#02633E] transition-opacity hover:opacity-80"
                                    aria-label="첨부파일"
                                  >
                                    <Paperclip
                                      className="h-5 w-5"
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  </a>
                                ) : (
                                  <Link
                                    to={`/support/grade-certificate/${cert.cert_id}`}
                                    className="relative h-5 w-5 shrink-0 text-[#02633E] transition-opacity hover:opacity-80"
                                    aria-label="첨부파일"
                                  >
                                    <Paperclip
                                      className="h-5 w-5"
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  </Link>
                                )
                              ) : (
                                <span className="relative h-5 w-5 shrink-0 text-[#1F2121]/25">
                                  <Paperclip
                                    className="h-5 w-5"
                                    strokeWidth={2}
                                    aria-hidden
                                  />
                                </span>
                              )}
                            </div>
                            <div className="flex h-[23px] w-16 flex-col justify-center font-[family-name:var(--font-nanum)] text-xs leading-[16.8px] font-normal whitespace-nowrap text-[#1F2121] uppercase tabular-nums">
                              {formatDate(cert.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="group hidden rounded-[10px] bg-[#EAE3C9] md:block">
                        <div className="flex flex-1 items-center gap-5 p-[30px]">
                          <div
                            className={cn(
                              nanum,
                              "flex w-[65px] shrink-0 flex-col justify-center text-center text-sm leading-[19.6px] font-normal text-[#1F2121] uppercase",
                            )}
                          >
                            {displayNum}
                          </div>
                          <div className="flex min-w-0 flex-1 items-center gap-5">
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                              <Link
                                to={`/support/grade-certificate/${cert.cert_id}`}
                                className={cn(
                                  nanum,
                                  "min-w-0 truncate text-xl leading-[30px] font-bold text-[#1F2121] transition-colors group-hover:text-[#02633E]",
                                )}
                              >
                                {cert.title}
                              </Link>
                              {showNew && (
                                <span
                                  className={cn(
                                    nanum,
                                    "inline-flex shrink-0 flex-col items-center justify-center rounded-[40px] bg-[#32AF32] px-1.5 py-0.5 text-xs leading-[18px] font-bold text-white",
                                  )}
                                >
                                  N
                                </span>
                              )}
                              {hasFileMeta ? (
                                fileHref ? (
                                  <a
                                    href={fileHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative h-5 w-5 shrink-0 text-[#32AF32] transition-opacity hover:opacity-80"
                                    aria-label="첨부파일"
                                  >
                                    <Paperclip
                                      className="h-5 w-5"
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  </a>
                                ) : (
                                  <Link
                                    to={`/support/grade-certificate/${cert.cert_id}`}
                                    className="relative h-5 w-5 shrink-0 text-[#32AF32] transition-opacity hover:opacity-80"
                                    aria-label="첨부파일"
                                  >
                                    <Paperclip
                                      className="h-5 w-5"
                                      strokeWidth={2}
                                      aria-hidden
                                    />
                                  </Link>
                                )
                              ) : (
                                <span className="relative h-5 w-5 shrink-0 text-[#32AF32]/35">
                                  <Paperclip
                                    className="h-5 w-5"
                                    strokeWidth={2}
                                    aria-hidden
                                  />
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                pretendard,
                                "inline-flex shrink-0 items-center justify-center rounded-[100px] bg-[#003F2B] px-3 py-2 text-center text-xs leading-3 font-medium text-white",
                              )}
                            >
                              적합
                            </span>
                            <div
                              className={cn(
                                nanum,
                                "w-20 shrink-0 text-center text-sm leading-[19.6px] font-normal text-[#1F2121] uppercase",
                              )}
                            >
                              {formatDate(cert.created_at)}
                            </div>
                            <div
                              className={cn(
                                nanum,
                                "w-[65px] shrink-0 text-center text-sm leading-[19.6px] font-normal text-[#1F2121] uppercase",
                              )}
                            >
                              {cert.view_count}
                            </div>
                            <div className="flex w-[65px] shrink-0 items-center justify-center gap-1.5">
                              <span
                                className={cn(
                                  nanum,
                                  "text-center text-sm leading-[19.6px] font-normal text-[#1F2121] uppercase",
                                )}
                              >
                                {hasFileMeta ? 1 : 0}
                              </span>
                              {fileHref ? (
                                <a
                                  href={fileHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#F3BC1E] transition-opacity hover:opacity-80"
                                  aria-label="다운로드"
                                >
                                  <Download
                                    className="h-3.5 w-3.5"
                                    aria-hidden
                                  />
                                </a>
                              ) : hasFileMeta ? (
                                <Link
                                  to={`/support/grade-certificate/${cert.cert_id}`}
                                  className="text-[#F3BC1E] transition-opacity hover:opacity-80"
                                  aria-label="다운로드"
                                >
                                  <Download
                                    className="h-3.5 w-3.5"
                                    aria-hidden
                                  />
                                </Link>
                              ) : (
                                <Download
                                  className="h-3.5 w-3.5 text-[#1F2121]/25"
                                  aria-hidden
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            )}

            <div
              className={cn(
                "mt-10 flex items-center justify-center max-md:gap-[30px]",
                "md:mt-0 md:gap-[30px] md:pt-10",
              )}
            >
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="이전 페이지"
                className={cn(
                  "flex shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30",
                  "h-12 w-12 max-md:overflow-hidden",
                  "md:h-12 md:w-12 md:shadow-none",
                )}
              >
                <ChevronLeft
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-label={`${p}페이지`}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    nanum,
                    "flex items-center justify-center transition-colors",
                    "max-md:min-h-12 max-md:min-w-10 max-md:bg-transparent max-md:px-2 max-md:text-base max-md:leading-[20.8px] max-md:font-extrabold max-md:text-[#003F2B]",
                    "md:text-lg md:leading-[23.4px] md:font-extrabold md:text-[#003F2B]",
                    p === page ? "md:opacity-100" : "md:opacity-70",
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="다음 페이지"
                className={cn(
                  "flex shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30",
                  "h-12 w-12 max-md:overflow-hidden",
                  "md:h-12 md:w-12",
                )}
              >
                <ChevronRight
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
