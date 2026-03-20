/**
 * 공지사항 목록 페이지
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Search, ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Route } from "./+types/notice";
import { PageBanner } from "~/core/components/page-banner";
import { getNotices } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "공지사항 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "전체";

  const [dbNotices, pageBanner] = await Promise.all([
    getNotices(category === "전체" ? undefined : category).catch(() => []),
    getPageBanner("notice").catch(() => null),
  ]);

  return { dbNotices, pageBanner, activeCategory: category };
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

const CATEGORIES = ["전체", "공지", "안내", "이벤트"];
const ITEMS_PER_PAGE = 9;

export default function NoticeScreen({ loaderData }: Route.ComponentProps) {
  const { dbNotices, pageBanner, activeCategory } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const sourceNotices = (dbNotices.length > 0 ? dbNotices : MOCK_NOTICES) as typeof MOCK_NOTICES;

  useEffect(() => { setPage(1); }, [activeCategory, query]);

  const filtered = sourceNotices.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* 일반글 역순 번호 맵: notice_id → 표시 번호 (전체 기준 역순) */
  const regularItems = filtered.filter((n) => !n.is_pinned);
  const totalRegular = regularItems.length;
  const regularRankMap = new Map(
    regularItems.map((n, i) => [n.notice_id, totalRegular - i]),
  );

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    if (cat === "전체") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  const formatDate = (val: string | Date) => {
    const d = new Date(val);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  /* 좌측: 고정글은 첫번째 태그(없으면 "공고"), 일반글은 null(→ 번호) */
  const getPinLabel = (notice: typeof MOCK_NOTICES[number]) => {
    if (!notice.is_pinned) return null;
    return notice.tags?.[0] || "공고";
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 페이지 배너 ── */}
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
      />

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 lg:px-10">

        {/* ── 필터 탭 + 검색 ── */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* 카테고리 탭 */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className="flex items-center gap-1.5 rounded-full px-5 font-medium transition-colors"
                  style={{
                    fontSize: "18px",
                    letterSpacing: "-0.04em",
                    height: "43px",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B" }),
                  }}
                >
                  {isActive && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* 검색 — 인풋과 버튼이 분리된 디자인, 높이 64px */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어를 입력해주세요."
              className="h-16 w-64 rounded-full border-0 bg-white px-5 text-sm outline-none"
            />
            <button
              onClick={handleSearch}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "#02633E" }}
            >
              <Search className="h-5 w-5" />
            </button>
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
                  className="group grid items-center gap-4 rounded-xl px-5 py-4 transition-all hover:brightness-[0.97]"
                  style={{
                    backgroundColor: "#F0EEDD",
                    gridTemplateColumns: "100px 1fr 100px 120px 56px",
                  }}
                >
                  {/* ① 고정태그 or 넘버링 */}
                  <div className="text-center">
                    {pinLabel ? (
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                      >
                        {pinLabel}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">{displayNum}</span>
                    )}
                  </div>

                  {/* ② 게시물 제목 */}
                  <span className="truncate text-sm font-medium text-gray-800 transition-colors group-hover:text-[#02633E]">
                    {notice.title}
                  </span>

                  {/* ③ 구분 (카테고리) */}
                  <div className="hidden text-center sm:block">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                    >
                      {notice.category}
                    </span>
                  </div>

                  {/* ④ 작성일자 */}
                  <span className="hidden text-center text-xs text-gray-400 md:block">
                    {formatDate(notice.created_at)}
                  </span>

                  {/* ⑤ 조회수 */}
                  <span className="text-right text-xs text-gray-400">
                    {notice.view_count}
                  </span>
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
