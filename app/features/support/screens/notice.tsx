/**
 * 공지사항 목록 페이지
 */
import { Fragment, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Route } from "./+types/notice";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SearchBar } from "~/core/components/search-bar";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { pc1920 } from "~/core/lib/pc-fluid";
import { cn } from "~/core/lib/utils";
import { getNotices } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "공지사항 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "전체보기";
  const normalizedCategory =
    category === "전체"
      ? "전체보기"
      : category === "외식업계"
        ? "이벤트"
        : category;

  const [dbNotices, pageBanner] = await Promise.all([
    getNotices(normalizedCategory === "전체보기" ? undefined : normalizedCategory).catch(() => []),
    getPageBanner("notice").catch(() => null),
  ]);

  return { dbNotices, pageBanner, activeCategory: normalizedCategory };
}

/* ── 더미 데이터 ── */
const MOCK_NOTICES = [
  { notice_id: 12, category: "안내",   title: "2026년 설 연휴 배송 안내",                 tags: ["중요"],              created_at: "2026-02-18", view_count: 245, is_pinned: true,  is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 11, category: "안내",   title: "풍림푸드 홈페이지 리뉴얼 안내",           tags: ["회사소개"],           created_at: "2026-02-16", view_count: 312, is_pinned: true,  is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 10, category: "안내",   title: "2026년 1월 가격 변동 안내",               tags: ["안내"],               created_at: "2026-02-14", view_count: 189, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 9,  category: "안내",   title: "겨울철 배송 지연 안내",                   tags: ["안내"],               created_at: "2026-02-10", view_count: 215, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 8,  category: "이벤트", title: "2025년 연말 이벤트 당첨자 발표",         tags: ["이벤트"],             created_at: "2026-02-09", view_count: 423, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 7,  category: "안내",   title: "신제품 출시 안내 – 프리미엄 구운란",     tags: ["안내"],               created_at: "2026-02-18", view_count: 198, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 6,  category: "안내",   title: "2025년 추석 연휴 배송 안내",             tags: ["안내"],               created_at: "2026-02-18", view_count: 215, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 5,  category: "안내",   title: "여름철 신선 배송 강화 안내",             tags: ["안내"],               created_at: "2026-02-18", view_count: 234, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 4,  category: "공지",   title: "HACCP 인증 갱신 완료 안내",             tags: ["공지"],               created_at: "2026-02-18", view_count: 142, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 3,  category: "안내",   title: "고객센터 운영시간 변경 안내",           tags: ["안내"],               created_at: "2026-02-18", view_count: 125, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 2,  category: "이벤트", title: "2025 여름 특별 이벤트 안내",           tags: ["이벤트"],             created_at: "2026-01-20", view_count: 302, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
  { notice_id: 1,  category: "공지",   title: "풍림푸드 B2B 신규 서비스 런칭 안내", tags: ["B2B"],                created_at: "2026-01-10", view_count: 176, is_pinned: false, is_active: true, content: "", author: "풍림푸드" },
];

const CATEGORIES = ["전체보기", "공지", "안내", "이벤트"] as const;

const CATEGORY_DISPLAY: Record<string, string> = {
  전체보기: "전체보기",
  공지: "공지",
  안내: "안내",
  이벤트: "이벤트",
};

const ITEMS_PER_PAGE = 9;

export default function NoticeScreen({ loaderData }: Route.ComponentProps) {
  const { dbNotices, pageBanner, activeCategory } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const sourceNotices = (dbNotices.length > 0 ? dbNotices : MOCK_NOTICES) as typeof MOCK_NOTICES;

  // DB/더미 필드 차이로 런타임 에러가 나지 않도록 안전 정규화
  const normalizedNotices = sourceNotices.map((n, i) => ({
    notice_id: Number(n.notice_id ?? i + 1),
    category: String(n.category ?? ""),
    title: String(n.title ?? ""),
    tags: Array.isArray(n.tags) ? n.tags : [],
    created_at: n.created_at ?? new Date().toISOString(),
    view_count: Number(n.view_count ?? 0),
    is_pinned: Boolean(n.is_pinned),
  }));

  useEffect(() => { setPage(1); }, [activeCategory, query]);

  const filtered = normalizedNotices.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase()),
  );

  // 고정글 우선 노출(상단), 나머지는 기존 순서 유지
  const pinnedNotices = filtered.filter((n) => n.is_pinned);
  const regularNotices = filtered.filter((n) => !n.is_pinned);
  const orderedNotices = [...pinnedNotices, ...regularNotices];

  const regularOrdered = orderedNotices.filter((n) => !n.is_pinned);
  const regularRankMap = new Map(
    regularOrdered.map((n, i) => [n.notice_id, regularOrdered.length - i]),
  );

  const totalPages = Math.max(1, Math.ceil(orderedNotices.length / ITEMS_PER_PAGE));
  const paginated = orderedNotices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    if (cat === "전체보기") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const formatDate = (val: string | Date) => {
    const d = new Date(val);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const getPinLabel = (notice: { is_pinned: boolean; tags: string[] }) => {
    if (!notice.is_pinned) return null;
    return notice.tags?.[0] || "공지";
  };

  const firstPinnedRowIndexInPage = paginated.findIndex(
    (n) => getPinLabel(n) != null,
  );

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      <PageBanner
        imageUrl="/banner/notice_banner_temp.png"
        title="공지사항"
        subtitle="풍림푸드의 새로운 소식과 안내사항을 확인하세요"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "공지사항" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* 모바일 전용 상단 타이틀 (Figma 375) */}
      <SectionPageTitle
        as="h1"
        preset="default"
        className="px-4 pt-5 md:hidden"
      >
        공지사항
      </SectionPageTitle>

      {/* ── 본문 ── */}
      <PageContentMax className="max-md:pt-0 py-6 md:pb-10 md:pt-[60px]">

        <div className="mb-0 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between md:pb-5">
          <div className="flex w-full flex-col items-start gap-1 max-md:pt-[14px] max-md:pb-5 md:contents">
            <div className="flex w-full flex-wrap items-center gap-[10px] md:max-w-none md:gap-2.5">
              {CATEGORIES.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    type="button"
                    className={cn(
                      "flex items-center rounded-[40px] px-3 py-1.5 font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] transition-colors",
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
                      <Check className="h-3 w-3 shrink-0 text-white md:h-4 md:w-4" strokeWidth={2.5} />
                    )}
                    {CATEGORY_DISPLAY[cat] ?? cat}
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

        {/* ── 목록 ── */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 md:gap-[10px]">
            {paginated.map((notice, rowIndex) => {
              const pinLabel = getPinLabel(notice);
              const displayNum = regularRankMap.get(notice.notice_id) ?? 0;
              const isFirstPinnedOnPage =
                pinLabel != null &&
                firstPinnedRowIndexInPage >= 0 &&
                rowIndex === firstPinnedRowIndexInPage;

              const metaBadgeClass =
                "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0EEDD] px-3 py-2 text-center text-[12px] font-medium leading-3 text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]";

              return (
                <Fragment key={notice.notice_id}>
                  {/* 모바일 카드 — Figma: 카드 #EAE3C9 r10 · 내부 p10 gap10 · 고정 첫 줄만 badge–제목 gap12 · 메타 날짜·조회수 칸 너비 구분 */}
                  <Link
                    to={`/support/notice/${notice.notice_id}`}
                    className="group flex rounded-[10px] bg-[#EAE3C9] transition-all hover:brightness-[0.98] md:hidden"
                  >
                    <div className="flex w-full min-w-0 flex-1 flex-col gap-2.5 p-2.5">
                      {pinLabel ? (
                        <div
                          className={cn(
                            "flex items-center",
                            isFirstPinnedOnPage
                              ? "gap-3"
                              : "w-full min-w-0 self-stretch gap-2.5",
                          )}
                        >
                          <span className={metaBadgeClass}>{pinLabel}</span>
                          <span className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] transition-colors group-hover:text-[#02633E]">
                            {notice.title}
                          </span>
                        </div>
                      ) : (
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex w-[43px] shrink-0 justify-center font-[family-name:var(--font-nanum)] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]">
                            {displayNum}
                          </div>
                          <span className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] transition-colors group-hover:text-[#02633E]">
                            {notice.title}
                          </span>
                        </div>
                      )}
                      <div className="flex w-full min-w-0 items-center gap-2.5">
                        <span className={metaBadgeClass}>{notice.category}</span>
                        <span
                          className={cn(
                            "shrink-0 text-center font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]",
                            isFirstPinnedOnPage ? "w-20" : "w-16",
                          )}
                        >
                          {formatDate(notice.created_at)}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-center font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121] tabular-nums",
                            isFirstPinnedOnPage ? "w-[65px]" : "min-w-[21px]",
                          )}
                        >
                          {notice.view_count}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <Link
                    to={`/support/notice/${notice.notice_id}`}
                    className="group hidden items-center gap-5 rounded-[10px] bg-[#EAE3C9] p-[30px] transition-all hover:brightness-[0.98] md:flex"
                  >
                    <div className="flex w-[65px] shrink-0 justify-center">
                      {pinLabel ? (
                        <span className={metaBadgeClass}>{pinLabel}</span>
                      ) : (
                        <span
                          className="text-center font-[NanumSquareRound,sans-serif] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]"
                        >
                          {displayNum}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-5">
                      <span
                        className="min-w-0 flex-1 font-[NanumSquareRound,sans-serif] font-bold text-[#1F2121] transition-colors group-hover:text-[#02633E]"
                        style={{ fontSize: pc1920(16, 20), lineHeight: pc1920(24, 30) }}
                      >
                        {notice.title}
                      </span>
                      <span className={cn(metaBadgeClass, "w-[65px] min-w-[65px] justify-center")}>
                        {notice.category}
                      </span>
                      <span className="w-20 shrink-0 text-center font-[NanumSquareRound,sans-serif] text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]">
                        {formatDate(notice.created_at)}
                      </span>
                      <span className="w-[65px] shrink-0 text-center font-[NanumSquareRound,sans-serif] text-sm font-normal uppercase leading-[19.6px] tabular-nums text-[#1F2121]">
                        {notice.view_count}
                      </span>
                    </div>
                  </Link>
                </Fragment>
              );
            })}
          </div>
        )}

        {/* ── 페이지네이션 (모바일 시안: pt-40 상당 간격 · gap-30 · 48 흰 원 + 녹색 2px 쉐브론 · 페이지 숫자는 원 없이 #003F2B 16/800) ── */}
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
