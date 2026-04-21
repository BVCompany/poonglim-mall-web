/**
 * 자료실 페이지
 */
import type { Route } from "./+types/resources";

import { Check, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SearchBar } from "~/core/components/search-bar";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { pc1920 } from "~/core/lib/pc-fluid";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveLibraryResources } from "~/features/support/lib/queries.server";
import { getLibraryDemoPublicList } from "~/features/support/lib/library-resources-demo";

/** 모바일 카드 메타 뱃지 — Figma: #F0EEDD · px12 py6 · Pretendard 11/500 · lh 11 */
const RESOURCE_META_BADGE_CLASS =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#F0EEDD] px-3 py-1.5 text-center text-[11px] font-medium leading-[11px] text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]";

/** PC 목록 행 — 공지사항 목록과 동일 톤 (카테고리명 한 줄 유지) */
const PC_META_BADGE_CLASS =
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#F0EEDD] px-3 py-2 text-center text-[12px] font-medium leading-3 text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]";

export function meta(_: Route.MetaArgs) {
  return [{ title: "자료실 | 풍림푸드" }];
}

export async function loader(_: Route.LoaderArgs) {
  const [pageBanner, dbResources] = await Promise.all([
    getPageBanner("resources").catch(() => null),
    getActiveLibraryResources().catch(() => []),
  ]);
  return { pageBanner, dbResources };
}

const CATEGORIES = ["전체 보기", "카탈로그", "회사소개", "인증서", "기타"];

const LIBRARY_DEMO_PUBLIC = getLibraryDemoPublicList();

const ITEMS_PER_PAGE = 10;

export default function ResourcesScreen({ loaderData }: Route.ComponentProps) {
  const { pageBanner, dbResources } = loaderData;
  const sourceFiles =
    dbResources.length > 0
      ? dbResources.map((r) => ({
          id: r.resource_id,
          category: r.category,
          title: r.title,
          size: r.file_size_label ?? "—",
          date: r.created_at.toISOString().slice(0, 10),
          ext: r.file_ext ?? "PDF",
          url: r.file_url,
        }))
      : LIBRARY_DEMO_PUBLIC;
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
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
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
      <SectionPageTitle
        as="h1"
        preset="default"
        className="px-4 pt-5 md:hidden"
      >
        자료실
      </SectionPageTitle>

      <PageContentMax className="max-md:pt-0 py-6 md:pb-10 md:pt-[60px]">
        <div className="mb-0 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between md:pb-5">
          <div className="flex w-full flex-col items-start gap-1 max-md:pt-[14px] max-md:pb-5 md:contents">
            <div className="flex w-full flex-wrap items-center gap-[10px] max-md:flex-nowrap max-md:overflow-x-auto max-md:overscroll-x-contain max-md:[scrollbar-width:none] md:max-w-none md:gap-2.5 [&::-webkit-scrollbar]:hidden">
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
                      "flex shrink-0 items-center rounded-[40px] px-3 py-1.5 font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] transition-colors",
                      "md:px-4 md:py-2 md:font-[Pretendard,system-ui,sans-serif] md:text-lg md:leading-[27px]",
                      isActive && "gap-2 md:gap-1.5",
                      isActive ? "md:font-bold" : "md:font-medium",
                    )}
                    style={{
                      letterSpacing: "-0.04em",
                      ...(isActive
                        ? { backgroundColor: "#02633E", color: "#fff" }
                        : {
                            backgroundColor: "#EAE3C9",
                            color: "#1F2121",
                          }),
                    }}
                  >
                    {isActive && (
                      <Check
                        className="h-3 w-3 shrink-0 text-white md:h-4 md:w-4"
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

          <div className="hidden md:flex md:shrink-0">
            <SearchBar
              className="md:gap-[min(6px,calc(6*100vw/1920))]"
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
              inputClassName="border-0 py-5 font-bold text-[#1F2121] placeholder:font-bold placeholder:text-[#1F2121] md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(360px,calc(360*100vw/1920))] md:px-10 md:font-[NanumSquareRound,sans-serif] md:text-base md:leading-6"
              buttonClassName="md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(64px,calc(64*100vw/1920))] md:p-5"
            />
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            {query ? "검색 결과가 없습니다." : "등록된 자료가 없습니다."}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 md:gap-[10px]">
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
                      {/* flex-1 제거: 다운로드가 날짜·용량 메타 바로 옆에 붙도록 */}
                      <div className="inline-flex w-full min-w-0 max-w-full flex-wrap items-center gap-2.5 self-stretch">
                        <Link
                          to={`/support/resources/${file.id}`}
                          className="inline-flex min-w-0 flex-wrap items-center gap-2.5"
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
                          className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center text-[#F3BC1E] transition-opacity hover:opacity-80"
                          aria-label={`${file.title} 다운로드`}
                        >
                          <Download className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* PC 행 — 공지사항 목록과 동일 레이아웃(다운로드는 Link 밖 형제 요소) */}
                  <div className="group hidden items-center gap-5 rounded-[10px] bg-[#EAE3C9] p-[30px] transition-all hover:brightness-[0.98] md:flex">
                    <Link
                      to={`/support/resources/${file.id}`}
                      className="flex min-w-0 flex-1 items-center gap-5 no-underline"
                    >
                      <div className="flex w-[65px] shrink-0 justify-center">
                        <span className="text-center font-[NanumSquareRound,sans-serif] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]">
                          {displayNum}
                        </span>
                      </div>
                      <div className="flex min-w-0 flex-1 items-center gap-5">
                        <span
                          className="min-w-0 flex-1 font-[NanumSquareRound,sans-serif] font-bold text-[#1F2121] transition-colors group-hover:text-[#02633E]"
                          style={{
                            fontSize: pc1920(16, 20),
                            lineHeight: pc1920(24, 30),
                          }}
                        >
                          {file.title}
                        </span>
                        <span className={PC_META_BADGE_CLASS}>
                          {file.category}
                        </span>
                        <span className="w-20 shrink-0 text-center font-[NanumSquareRound,sans-serif] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]">
                          {file.date}
                        </span>
                        <span className="w-[65px] shrink-0 text-center font-[NanumSquareRound,sans-serif] text-sm font-normal uppercase leading-[19.6px] tabular-nums text-[#1F2121]">
                          {file.size}
                        </span>
                      </div>
                    </Link>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 shrink-0 items-center justify-center text-[#F3BC1E] transition-opacity hover:opacity-80"
                      aria-label={`${file.title} 다운로드`}
                    >
                      <Download className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                    </a>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 — 공지사항 목록과 동일 */}
        <div className="mt-10 flex items-center justify-center gap-[30px] md:pt-10">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="이전 페이지"
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30"
          >
            <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-label={`${p}페이지`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "min-h-12 min-w-10 bg-transparent px-2 font-[NanumSquareRound,sans-serif] text-lg font-extrabold leading-[23.4px] text-[#003F2B] transition-opacity",
                p === page ? "opacity-100" : "opacity-50 hover:opacity-80",
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
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30"
          >
            <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </PageContentMax>
    </div>
  );
}
