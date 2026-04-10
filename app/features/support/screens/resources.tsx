/**
 * 자료실 페이지
 */
import type { Route } from "./+types/resources";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { PageContentMax } from "~/core/components/page-content-max";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import {
  getActiveLibraryResources,
  hasAnyActiveLibraryResources,
} from "~/features/support/lib/queries.server";

/** 모바일 카드 메타 뱃지 — Figma: #F0EEDD · px12 py6 · Pretendard 11/500 · lh 11 */
const RESOURCE_META_BADGE_CLASS =
  "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0EEDD] px-3 py-1.5 text-center text-[11px] font-medium leading-[11px] text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]";

export function meta(_: Route.MetaArgs) {
  return [{ title: "자료실 | 풍림푸드" }];
}

export async function loader(_: Route.LoaderArgs) {
  const [pageBanner, dbResources, hasRealResources] = await Promise.all([
    getPageBanner("resources").catch(() => null),
    getActiveLibraryResources().catch(() => []),
    hasAnyActiveLibraryResources().catch(() => false),
  ]);
  return { pageBanner, dbResources, hasRealResources };
}

const CATEGORIES = ["전체 보기", "카탈로그", "회사소개", "인증서", "기타"];

const MOCK_FILES = [
  {
    id: 10,
    category: "인증서",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 9,
    category: "카탈로그",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 8,
    category: "기타",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 7,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 6,
    category: "인증서",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 5,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 4,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 3,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 2,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
  {
    id: 1,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    size: "312",
    date: "2026-02-16",
    ext: "PDF",
    url: "#",
  },
];

const ITEMS_PER_PAGE = 10;

export default function ResourcesScreen({ loaderData }: Route.ComponentProps) {
  const { pageBanner, dbResources, hasRealResources } = loaderData;
  const sourceFiles =
    hasRealResources && dbResources.length > 0
      ? dbResources.map((r) => ({
          id: r.resource_id,
          category: r.category,
          title: r.title,
          size: r.file_size_label ?? "—",
          date: r.created_at.toISOString().slice(0, 10),
          ext: r.file_ext ?? "PDF",
          url: r.file_url,
        }))
      : MOCK_FILES;
  const [activeCategory, setActiveCategory] = useState("전체 보기");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setPage(1);
  }, [activeCategory, query]);

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const byCategory =
    activeCategory === "전체 보기"
      ? sourceFiles
      : sourceFiles.filter((f) => f.category === activeCategory);

  const filtered = byCategory.filter((f) =>
    f.title.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const totalCount = filtered.length;

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
      <PageBanner
        imageUrl="/banner/report_banner_temp.png"
        title="자료실"
        subtitle="풍림푸드의 브로슈어·인증서 등 자료를 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "자료실" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* 모바일 상단 타이틀 (Figma 375) */}
      <div className="flex items-center gap-[11px] px-4 pt-5 md:hidden">
        <SectionTitleStar className="h-[21px] w-[21px]" />
        <h1 className="font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121]">
          자료실
        </h1>
      </div>

      <PageContentMax className="max-md:pt-0 py-6 md:py-10">
        <div className="mb-0 flex flex-col gap-4 md:mb-5 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-full max-w-full flex-col items-start justify-start gap-1 max-md:pt-[14px] max-md:pb-5 md:contents">
            <div className="inline-flex w-full min-w-0 max-w-full flex-nowrap items-center gap-[10px] overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:flex-wrap md:overflow-visible md:gap-2 [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setInputValue("");
                    setQuery("");
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-[40px] px-3 py-1.5 text-center font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] transition-colors md:h-[43px] md:px-5 md:text-lg md:font-medium",
                    isActive && "gap-2",
                  )}
                  style={
                    isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#1F2121" }
                  }
                >
                  {isActive && (
                    <Check
                      className="h-3 w-3 shrink-0 text-white md:h-3.5 md:w-3.5"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
                  {cat}
                </button>
              );
            })}
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어를 입력해주세요."
              className="h-16 w-64 rounded-full border-0 bg-white px-5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "#02633E" }}
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {query ? "검색 결과가 없습니다." : "등록된 자료가 없습니다."}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 md:gap-2">
            {paginated.map((file, idx) => {
              const displayNum =
                totalCount - ((page - 1) * ITEMS_PER_PAGE + idx);
              return (
                <Fragment key={file.id}>
                  {/* 모바일 카드 — Figma 단일 카드 HTML: p10 col gap10 · 1행 inline-flex gap10 · 2행 self-stretch inline-flex gap10 */}
                  <div className="flex rounded-[10px] bg-[#EAE3C9] md:hidden">
                    <div className="inline-flex w-full min-w-0 max-w-full flex-col items-start justify-center gap-2.5 p-2.5">
                      <Link
                        to={`/support/resources/${file.id}`}
                        className="inline-flex max-w-full items-center gap-2.5 text-left"
                      >
                        <div className="inline-flex flex-col items-center justify-center gap-2.5">
                          <div className="flex w-[43px] flex-col justify-center text-center font-[family-name:var(--font-nanum)] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]">
                            {displayNum}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] [word-wrap:break-word]">
                          {file.title}
                        </div>
                      </Link>
                      <div className="inline-flex w-full min-w-0 max-w-full items-center gap-2.5 self-stretch">
                        <Link
                          to={`/support/resources/${file.id}`}
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5"
                        >
                          <span className={RESOURCE_META_BADGE_CLASS}>
                            {file.category}
                          </span>
                          <div className="flex h-[23px] min-w-[4.75rem] shrink-0 items-center justify-center whitespace-nowrap font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] tabular-nums text-[#1F2121]">
                            {file.date}
                          </div>
                          <div className="flex h-[23px] min-w-[21px] shrink-0 flex-col justify-center text-center font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121] tabular-nums">
                            {file.size}
                          </div>
                        </Link>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#F3BC1E] transition-opacity hover:opacity-80"
                          aria-label={`${file.title} 다운로드`}
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* PC 테이블형 행 */}
                  <div
                    className="group hidden grid-cols-[56px_1fr_100px_120px_56px_40px] items-center gap-4 rounded-xl px-5 py-4 md:grid"
                    style={{ backgroundColor: "#F0EEDD" }}
                  >
                    <div className="text-center text-sm text-gray-600">
                      {displayNum}
                    </div>
                    <Link
                      to={`/support/resources/${file.id}`}
                      className="truncate text-sm font-medium text-gray-800 transition-colors hover:text-[#02633E]"
                    >
                      {file.title}
                    </Link>
                    <div className="text-center">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                      >
                        {file.category}
                      </span>
                    </div>
                    <span className="whitespace-nowrap text-center text-xs tabular-nums text-gray-400">
                      {file.date}
                    </span>
                    <span className="text-right text-xs text-gray-400">
                      {file.size}
                    </span>
                    <div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center text-gray-400 transition-colors hover:text-[#02633E]"
                        aria-label={`${file.title} 다운로드`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 — 모바일: 공지 시안과 동일 (48·흰 원·녹색 쉐브론 · 숫자만 #003F2B 16/800) */}
        <div className="mt-10 flex items-center justify-center max-md:gap-[30px] md:gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="이전 페이지"
            className={cn(
              "flex shrink-0 items-center justify-center bg-white text-[#02633E] transition-colors disabled:opacity-30",
              "h-12 w-12 rounded-[40px] max-md:overflow-hidden",
              "md:h-9 md:w-9 md:rounded-full md:border md:border-gray-300 md:text-gray-500 md:hover:border-[#02633E] md:hover:text-[#02633E]",
            )}
          >
            <ChevronLeft
              className="h-[18px] w-[18px] md:h-4 md:w-4"
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
                "flex items-center justify-center font-[family-name:var(--font-nanum)] transition-colors",
                "max-md:min-h-12 max-md:min-w-10 max-md:bg-transparent max-md:px-2 max-md:text-base max-md:leading-[20.8px] max-md:font-extrabold max-md:text-[#003F2B]",
                "md:h-9 md:w-9 md:rounded-full md:text-sm md:font-medium",
                p === page
                  ? "md:bg-[#02633E] md:text-white"
                  : "md:bg-transparent md:text-[#555]",
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
              "flex shrink-0 items-center justify-center bg-white text-[#02633E] transition-colors disabled:opacity-30",
              "h-12 w-12 rounded-[40px] max-md:overflow-hidden",
              "md:h-9 md:w-9 md:rounded-full md:border md:border-gray-300 md:text-gray-500 md:hover:border-[#02633E] md:hover:text-[#02633E]",
            )}
          >
            <ChevronRight
              className="h-[18px] w-[18px] md:h-4 md:w-4"
              strokeWidth={2}
              aria-hidden
            />
          </button>
        </div>
      </PageContentMax>
    </div>
  );
}
