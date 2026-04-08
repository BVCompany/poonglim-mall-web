/**
 * 보도자료 목록 페이지
 * - 주요 보도: breakout 슬라이더 (뷰포트 오른쪽 끝까지 확장)
 * - 전체 보도자료: SearchBar + 카드 목록 + 페이지네이션
 * - 데이터: media.news 테이블 (type = "press" | "news")
 */
import { useState, useRef } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Route } from "./+types/news";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SearchBar } from "~/core/components/search-bar";
import db from "~/core/db/drizzle-client.server";
import { news } from "~/features/media/schema";
import { desc, eq } from "drizzle-orm";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "보도자료 | 풍림푸드" },
];

export async function loader() {
  const [items, pageBanner] = await Promise.all([
    db
      .select()
      .from(news)
      .where(eq(news.is_active, true))
      .orderBy(desc(news.published_at), desc(news.created_at))
      .catch(() => []),
    getPageBanner("news").catch(() => null),
  ]);
  return { items, pageBanner };
}

type NewsItem = {
  news_id: number;
  type: string;
  title: string;
  content: string;
  summary: string | null;
  thumbnail_url: string | null;
  source: string | null;
  is_active: boolean;
  published_at: string | null;
  created_at: Date | string;
};

/* 전체 보도자료: 4개씩 표시 */
const PAGE_SIZE = 4;
/* 주요 보도 카드: 고정 1040×520, 간격 24 */
const CARD_W = 1040;
const CARD_H = 520;
const CARD_GAP = 24;

/* 구버전 enum 값 표시명 (레거시 데이터 대응) */
const LEGACY_LABEL: Record<string, string> = {
  press: "보도자료",
  news: "뉴스",
  announcement: "공지",
};

function getTypeLabel(type: string) {
  return LEGACY_LABEL[type] ?? type;
}

const TYPE_COLOR: Record<string, string> = {
  press: "#02633E",
  news: "#003F2B",
  announcement: "#F3BC1E",
};

function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d)
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, "-")
    .replace(/\.$/, "");
}

/* ── 목업 데이터 (DB 비어있을 때 fallback) ── */
const MOCK_ITEMS: NewsItem[] = [
  {
    news_id: 1,
    type: "press",
    title: "[중부매일] 직원 경영 이상 주부…새심한 배려로 '가족친화 기업' 탄생",
    content: "",
    summary: "풍림푸드는 지난 1년 간 77개의 중 어려운 사원 76가정에게, 회사 후생복리 차원에서 직원들 아이들을 위해 직원들과 아이들이 행복한 회사를 만들어 가기 위한 노력을 아끼지 않는 기업들 중 하나입니다.",
    thumbnail_url: "/home/poonglim-logo-eng.png",
    source: "중부매일",
    is_active: true,
    published_at: "2024-02-19",
    created_at: new Date("2024-02-19"),
  },
  {
    news_id: 2,
    type: "press",
    title: "신제품 '프리미엄 에그' 출시 — 고품질 액란 국내 시장 본격 공략",
    content: "",
    summary: "풍림푸드가 프리미엄 액란 시장에 새로운 강자로 등장했습니다.",
    thumbnail_url: "/home/poonglim-logo-eng.png",
    source: "식품음료신문",
    is_active: true,
    published_at: "2024-02-14",
    created_at: new Date("2024-02-14"),
  },
  {
    news_id: 3,
    type: "news",
    title: "앤 한수산의 고고미미를? 이모파나리아에서 만나는 독별한 방법",
    content: "",
    summary: "최근 각광받고 있는 트로트 요리유튜버와 협업한 레시피 시리즈를 이모파나리아에서 소개합니다.",
    thumbnail_url: "/home/poonglim-logo-eng.png",
    source: "매일경제",
    is_active: true,
    published_at: "2024-02-19",
    created_at: new Date("2024-02-19"),
  },
  {
    news_id: 4,
    type: "news",
    title: "풍림푸드, 간단하게 맞는 집은 신규 신개 '업집 없는 한수관' 출시",
    content: "",
    summary: "풍림푸드는 지난 1년 간 1개 이상의 도입 제품사 전류 고객에 대한 공급 가격 정책을 미래의 다양한 고객 기호에 맞춰 선보입니다.",
    thumbnail_url: "/home/poonglim-logo-eng.png",
    source: "한국경제",
    is_active: true,
    published_at: "2024-02-19",
    created_at: new Date("2024-02-19"),
  },
  {
    news_id: 5,
    type: "press",
    title: "풍림사이즈 수출 대비, 배터날 진출",
    content: "",
    summary: "풍림푸드는 지난 1년 간 아시아 전역으로 수출 시장을 확대하며 글로벌 기업으로 도약하고 있습니다.",
    thumbnail_url: "/home/poonglim-logo-eng.png",
    source: "코리아타임스",
    is_active: true,
    published_at: "2024-01-19",
    created_at: new Date("2024-01-19"),
  },
];

export default function NewsScreen({ loaderData }: Route.ComponentProps) {
  const { pageBanner } = loaderData;
  const rawItems = loaderData.items as NewsItem[];
  const items: NewsItem[] = rawItems.length > 0 ? rawItems : MOCK_ITEMS;

  /* ── 주요 보도 슬라이더 (CSS 스크롤 기반) ── */
  const scrollRef = useRef<HTMLDivElement>(null);
  const featured = items.slice(0, Math.min(items.length, 6));

  const prevSlide = () =>
    scrollRef.current?.scrollBy({ left: -(CARD_W + CARD_GAP), behavior: "smooth" });
  const nextSlide = () =>
    scrollRef.current?.scrollBy({ left: CARD_W + CARD_GAP, behavior: "smooth" });

  /* ── 검색 + 페이지네이션 ── */
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");

  const filtered = items.filter(
    (item) =>
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.summary ?? "").toLowerCase().includes(search.toLowerCase()),
  );
  const totalSlides = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const grouped = Array.from({ length: totalSlides }, (_, i) =>
    filtered.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
  );
  const currentItems = grouped[slideIndex] ?? [];

  const handleSearch = () => {
    setSearch(searchInput);
    setSlideIndex(0);
  };

  const goPrevSlide = () => {
    if (slideIndex <= 0) return;
    setSlideDir("prev");
    setSlideIndex((prev) => Math.max(0, prev - 1));
  };

  const goNextSlide = () => {
    if (slideIndex >= totalSlides - 1) return;
    setSlideDir("next");
    setSlideIndex((prev) => Math.min(totalSlides - 1, prev + 1));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 배너 ── */}
      <PageBanner
        imageUrl="/banner/report_banner_temp.png"
        title="보도자료"
        subtitle="풍림푸드의 최신 뉴스와 미디어 자료를 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "홍보센터" },
          { label: "보도자료" },
        ]}
        dbBanner={pageBanner}
      />

      {/* ── 주요 보도 ── */}
      <PageContentMax className="pt-12">
        {/* 섹션 헤더 */}
        <div className="mb-5 flex items-center gap-2">
          <img src="/home/product-star.png" alt="" className="h-6 w-6 object-contain" />
          <h2
            className="text-2xl font-bold text-gray-900"
            style={{ letterSpacing: "-0.03em" }}
          >
            주요 보도
          </h2>
        </div>
      </PageContentMax>

      {/*
        ── 슬라이더 브레이크아웃 영역 ──
        왼쪽은 content 좌측 가장자리에 맞추고, 오른쪽은 뷰포트 끝까지 확장
        - -ml-4/-ml-6/-ml-10: content 패딩 취소 (left)
        - [margin-right:calc(-50vw+50%)]: max-width 컨테이너 기준 우측 뷰포트 끝까지 확장
      */}
      <PageContentMax>
        <div className="-ml-4 overflow-hidden sm:-ml-6 lg:-ml-10 lg:[margin-right:calc(-50vw+50%)]">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex overflow-x-auto pb-4 pl-4 sm:pl-6 lg:pl-10"
            style={{
              gap: CARD_GAP,
              scrollSnapType: "x proximity",
            }}
          >
            {featured.map((item) => (
              <div
                key={item.news_id}
                className="group flex shrink-0 cursor-pointer overflow-hidden rounded-2xl"
                style={{ width: CARD_W, height: CARD_H, scrollSnapAlign: "start" }}
              >
                {/* 왼쪽: 이미지 50% */}
                <div className="relative shrink-0 overflow-hidden" style={{ width: "50%" }}>
                  {item.thumbnail_url ? (
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#D5CEB4]" />
                  )}
                </div>

                {/* 오른쪽: 텍스트 패널 50% — 기본 #EAE3C9 → 호버 #003F2B */}
                <div
                  className="flex flex-1 flex-col justify-between p-8 transition-colors duration-300 bg-[#EAE3C9] group-hover:bg-[#003F2B]"
                >
                  <div className="flex flex-col gap-4">
                    {/* 배지 */}
                    <span
                      className="w-fit rounded-full px-3 py-1 text-xs font-bold text-white"
                      style={{ backgroundColor: TYPE_COLOR[item.type] ?? "#02633E" }}
                    >
                      {getTypeLabel(item.type)}
                    </span>

                    {/* 제목 */}
                    <h3
                      className="font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-white"
                      style={{
                        fontSize: "24px",
                        letterSpacing: "-0.04em",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.title}
                    </h3>

                    {/* 요약 — 최대 3줄 */}
                    {item.summary && (
                      <p
                        className="leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-white/75"
                        style={{
                          fontSize: "16px",
                          letterSpacing: "-0.04em",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.summary}
                      </p>
                    )}
                  </div>

                  {/* 날짜 */}
                  <span
                    className="block text-sm text-gray-400 transition-colors duration-300 group-hover:text-white/50"
                  >
                    {formatDate(item.published_at ?? item.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 화살표 */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={prevSlide}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E]"
            aria-label="이전"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextSlide}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E]"
            aria-label="다음"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* ════════════════════════════════════
            전체 보도자료
        ════════════════════════════════════ */}
        <section className="pb-12 pt-14">
          {/* 헤더 + 검색 */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/home/product-star.png" alt="" className="h-6 w-6 object-contain" />
              <h2
                className="text-2xl font-bold text-gray-900"
                style={{ letterSpacing: "-0.03em" }}
              >
                전체 보도자료
                <span className="ml-2 text-lg font-normal text-gray-400">
                  ({filtered.length})
                </span>
              </h2>
            </div>

            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
            />
          </div>

          {/* 목록 — 4개 묶음 슬라이드, 카드 1600×235 */}
          {currentItems.length === 0 ? (
            <div className="rounded-2xl bg-white py-20 text-center text-gray-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div
              key={`${slideDir}-${slideIndex}`}
              className={`flex flex-col gap-3 ${
                slideDir === "next" ? "animate-[slideInFromRight_280ms_ease-out]" : "animate-[slideInFromLeft_280ms_ease-out]"
              }`}
            >
              {currentItems.map((item) => (
                <div
                  key={item.news_id}
                  className="group flex w-full cursor-pointer items-center overflow-hidden rounded-2xl bg-white transition-colors duration-300 hover:bg-[#003F2B]"
                  style={{ height: 235 }}
                >
                  {/* 이미지 215×215 — 수직 중앙 정렬 */}
                  <div
                    className="mx-3 shrink-0 self-center overflow-hidden rounded-xl"
                    style={{ width: 215, height: 215 }}
                  >
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-[#EAE3C9] group-hover:bg-[#1a3d2b]" />
                    )}
                  </div>

                  {/* 텍스트 영역 */}
                  <div className="flex flex-1 flex-col justify-center gap-2 px-6">
                    {/* 배지 */}
                    <span
                      className="w-fit rounded-full px-3 font-bold transition-colors duration-300 bg-[#EAE3C9] text-[#003F2B] group-hover:bg-white/15 group-hover:text-[#EAE3C9]"
                      style={{
                        height: 28,
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: "12px",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {getTypeLabel(item.type)}
                    </span>

                    {/* 제목 */}
                    <p
                      className="line-clamp-2 font-bold text-[#1F2121] transition-colors duration-300 group-hover:text-[#EAE3C9] mt-[22px]"
                      style={{ fontSize: "20px", letterSpacing: "-0.04em" }}
                    >
                      {item.title}
                    </p>

                    {/* 요약 — 1줄 */}
                    {item.summary && (
                      <p
                        className="truncate text-[#1F2121] transition-colors duration-300 group-hover:text-[#EAE3C9]"
                        style={{ fontSize: "14px", letterSpacing: "-0.04em" }}
                      >
                        {item.summary}
                      </p>
                    )}

                    {/* 날짜 — 제목/요약 아래 20px 간격 */}
                    <span className="mt-[20px] text-sm text-gray-400 transition-colors duration-300 group-hover:text-[#EAE3C9]/60">
                      {formatDate(item.published_at ?? item.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <style>{`
            @keyframes slideInFromRight {
              from { opacity: 0; transform: translateX(56px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideInFromLeft {
              from { opacity: 0; transform: translateX(-56px); }
              to { opacity: 1; transform: translateX(0); }
            }
          `}</style>

          {/* 슬라이드 네비게이션 */}
          {totalSlides > 1 && (
            <div className="mt-6 flex items-center gap-3">
              <div className="inline-flex overflow-hidden rounded-full bg-white shadow-sm">
                <button
                  onClick={goPrevSlide}
                  disabled={slideIndex === 0}
                  className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/70 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="이전 슬라이드"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="w-px shrink-0 bg-[#EAE3C9]" aria-hidden />
                <button
                  onClick={goNextSlide}
                  disabled={slideIndex === totalSlides - 1}
                  className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/70 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="다음 슬라이드"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                <span className="font-bold text-[#003F2B]">{slideIndex + 1}</span>
                {" / "}
                {totalSlides}
              </span>
            </div>
          )}
          {/* 기존 페이지네이션 제거 */}
          {/* 
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E] disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: totalPages }, (_, k) => k + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors"
                  style={
                    p === page
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#fff", color: "#555", border: "1px solid #d1d5db" }
                  }
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E] disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div> 
          */}
          
        </section>
      </PageContentMax>
    </div>
  );
}
