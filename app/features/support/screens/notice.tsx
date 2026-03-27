/**
 * 공지사항 목록 페이지
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Route } from "./+types/notice";
import { PageBanner } from "~/core/components/page-banner";
import { SearchBar } from "~/core/components/search-bar";
import { getNotices } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "공지사항 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "전체보기";
  const normalizedCategory = category === "전체" ? "전체보기" : category;

  const [dbNotices, pageBanner] = await Promise.all([
    getNotices(normalizedCategory === "전체보기" ? undefined : normalizedCategory).catch(() => []),
    getPageBanner("notice").catch(() => null),
  ]);

  return { dbNotices, pageBanner, activeCategory: normalizedCategory };
}

/* ── 더미 데이터 ── */
const MOCK_NOTICES = [
  { notice_id: 12, category: "공지",   title: "2026년 설 연휴 배송 안내",                 tags: ["공고"],              created_at: "2026-02-18", view_count: 245, is_pinned: true,  is_active: true, content: "", author: "풍림푸드" },
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

const CATEGORIES = ["전체보기", "공지", "안내", "외식업계"];
const ITEMS_PER_PAGE = 9;
const showBanner = false;

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 페이지 배너 ── */}
      {showBanner && (
        <PageBanner
          imageUrl="/banner/notice_banner_temp.png"
          title="공지사항"
          subtitle="풍림푸드의 새로운 소식과 안내사항을 확인하세요."
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "고객지원", href: "/support" },
            { label: "공지사항" },
          ]}
          dbBanner={pageBanner}
          hideBreadcrumbOnMobile
        />
      )}

      {/* ── 상단 타이틀 (별 아이콘) ── */}
      <div className="px-4 pt-3">
        <div className="inline-flex items-center gap-1.5">
          <img
            src="/home/product-star.png"
            alt=""
            className="h-3.5 w-3.5 object-contain"
          />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121] md:text-[32px]">
            공지사항
          </h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-6 lg:px-10">

        {/* ── 필터 탭 + 검색 ── */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className="flex items-center gap-1.5 rounded-full px-3 font-medium transition-colors md:px-5"
                  style={{
                    fontSize: "clamp(13px, 2.5vw, 18px)",
                    letterSpacing: "-0.04em",
                    height: "clamp(34px, 5vw, 43px)",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B" }),
                  }}
                >
                  {isActive && <Check className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.5} />}
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="hidden md:block">
            <SearchBar value={inputValue} onChange={setInputValue} onSearch={handleSearch} />
          </div>
        </div>

        {/* ── 목록 ── */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginated.map((notice) => {
              const pinLabel = getPinLabel(notice);
              const displayNum = regularRankMap.get(notice.notice_id) ?? 0;
              return (
                <Link
                  key={notice.notice_id}
                  to={`/support/notice/${notice.notice_id}`}
                  className="group grid grid-cols-[58px_1fr] items-start gap-x-3 gap-y-1 rounded-xl px-4 py-3 transition-all hover:brightness-[0.97] md:px-5 md:py-4"
                  style={{ backgroundColor: "#F0EEDD" }}
                >
                  {/* 왼쪽: 번호(or 고정태그) + 카테고리 태그 */}
                  <div className="row-span-2 flex flex-col items-center gap-1.5 pt-0.5">
                    {pinLabel ? (
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold md:px-2.5 md:text-[11px]"
                        style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                      >
                        {pinLabel}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 md:text-sm">{displayNum}</span>
                    )}
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold md:px-2.5 md:text-[11px]"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {notice.category}
                    </span>
                  </div>

                  {/* 오른쪽: 제목 */}
                  <span className="truncate text-[13px] font-medium text-gray-800 transition-colors group-hover:text-[#02633E] md:text-sm">
                    {notice.title}
                  </span>

                  {/* 오른쪽 하단: 메타 */}
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 md:text-xs">
                    <span>{formatDate(notice.created_at)}</span>
                    <span>{notice.view_count}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── 페이지네이션 ── */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors"
              style={
                p === page
                  ? { backgroundColor: "#02633E", color: "#fff" }
                  : { backgroundColor: "transparent", color: "#555" }
              }
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
