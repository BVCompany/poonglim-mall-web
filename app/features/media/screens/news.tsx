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
import { SectionTitleStar } from "~/core/components/section-title-star";
import { SearchBar } from "~/core/components/search-bar";
import { cn } from "~/core/lib/utils";
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
/* 주요 보도 카드 — PC: 1040×520 / 모바일 시안: 310px 너비·세로 스택·간격 10 */
const CARD_W = 1040;
const CARD_H = 520;
const CARD_GAP = 24;
const MOBILE_FEATURED_W = 310;
const MOBILE_FEATURED_GAP = 10;

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

const nanum = "font-[family-name:var(--font-nanum)]";

function featuredScrollStepPx() {
  if (typeof window === "undefined") return CARD_W + CARD_GAP;
  return window.matchMedia("(max-width: 767px)").matches
    ? MOBILE_FEATURED_W + MOBILE_FEATURED_GAP
    : CARD_W + CARD_GAP;
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
    scrollRef.current?.scrollBy({ left: -featuredScrollStepPx(), behavior: "smooth" });
  const nextSlide = () =>
    scrollRef.current?.scrollBy({ left: featuredScrollStepPx(), behavior: "smooth" });

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
    <div className="min-h-screen bg-[#F4F2E5]">
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
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pb-12 pt-0 md:pt-12">
        <div className="flex flex-col max-md:gap-[50px]">
          {/* ── 주요 보도 — 모바일: 타이틀 행 ↔ 캐러셀 gap 10px (시안) ── */}
          <div className="flex flex-col max-md:gap-2.5">
            <div
              className={cn(
                nanum,
                "flex items-center gap-[11px] px-0 pt-5 md:mb-5 md:gap-2 md:pt-0",
              )}
            >
              <SectionTitleStar variant="product" className="h-[21px] w-[21px] md:h-6 md:w-6" />
              <h2 className="text-[18px] font-extrabold leading-[30px] text-[#1F2121] md:text-2xl md:leading-tight md:text-gray-900">
                주요 보도
              </h2>
            </div>

            {/*
              슬라이더 브레이크아웃 — PC·태블릿: 좌 패딩 상쇄 + 우측 뷰포트 확장
              모바일: 좌는 본문 패딩 유지(ml-0, pl-0), 우만 패딩 상쇄 → 카드가 화면 끝까지 이어져 다음 카드가 잘림
            */}
            <div className="-ml-4 overflow-hidden sm:-ml-6 lg:-ml-10 lg:[margin-right:calc(-50vw+50%)] max-md:!ml-0 max-sm:-mr-4 sm:max-md:-mr-6">
              <div
                ref={scrollRef}
                className="scrollbar-hide flex max-md:min-h-[463px] overflow-x-auto pb-4 pl-4 max-md:pl-0 sm:pl-6 lg:pl-10 max-md:gap-[10px] md:min-h-0 md:gap-6"
                style={{
                  scrollSnapType: "x proximity",
                }}
              >
                {featured.map((item) => (
                  <Link
                    key={item.news_id}
                    to={`/media/news/${item.news_id}`}
                    className={cn(
                      "group flex shrink-0 cursor-pointer overflow-hidden bg-[#EAE3C9]",
                      "w-[310px] flex-col rounded-[30px] max-md:snap-start",
                      "md:h-[520px] md:w-[1040px] md:flex-row md:rounded-2xl",
                    )}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {/* 모바일: 이미지(310) + 시안 중간 여백(약 17px) / PC: 좌 50% */}
                    <div className="flex w-full shrink-0 flex-col max-md:w-[310px] md:h-full md:w-1/2">
                      <div className="relative h-[310px] w-full shrink-0 overflow-hidden rounded-t-[30px] md:h-full md:rounded-none">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#D5CEB4]" />
                        )}
                        <span
                          className={cn(
                            "absolute left-4 top-4 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif] md:hidden",
                          )}
                          style={{ backgroundColor: "#003F2B", lineHeight: "12px" }}
                        >
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                      {/* 시안 카드1: 이미지~본문 사이 스페이서(26.83×16.69) — 모바일만 */}
                      <div
                        className="hidden max-md:block max-md:h-[17px] max-md:w-[27px] max-md:shrink-0"
                        aria-hidden
                      />
                    </div>

                    {/* 텍스트 — 모바일: 하단만 radius 30·내부 gap 20(본문↔날짜)·제목↔요약 gap 10 */}
                    <div
                      className={cn(
                        nanum,
                        "flex flex-1 flex-col justify-between gap-5 p-5 transition-colors duration-300 max-md:rounded-b-[30px]",
                        "md:justify-between md:bg-[#EAE3C9] md:p-8 md:group-hover:bg-[#003F2B]",
                      )}
                    >
                      <div className="flex flex-col gap-2.5 md:gap-4">
                        <span
                          className="hidden w-fit whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold text-white md:inline-flex"
                          style={{ backgroundColor: TYPE_COLOR[item.type] ?? "#02633E" }}
                        >
                          {getTypeLabel(item.type)}
                        </span>

                        <h3
                          className={cn(
                            "min-w-0 font-bold text-[#1F2121]",
                            /* 모바일: 전체 보도자료 카드 제목과 동일 — 한 줄 + 말줄임 */
                            "max-md:truncate max-md:text-base max-md:leading-6",
                            "md:text-2xl md:leading-snug md:text-gray-900 md:line-clamp-4 md:transition-colors md:duration-300 md:group-hover:text-white",
                          )}
                          style={{ letterSpacing: "-0.04em" }}
                        >
                          {item.title}
                        </h3>

                        {item.summary && (
                          <p
                            className={cn(
                              "min-w-0 text-[#1F2121]",
                              /* 모바일: 전체 보도자료 카드 요약과 동일 — 2줄 + 말줄임 */
                              "max-md:line-clamp-2 max-md:text-xs max-md:font-normal max-md:leading-[18px]",
                              "text-sm font-normal leading-[21px] md:leading-relaxed md:text-gray-600 md:line-clamp-3 md:transition-colors md:duration-300 md:group-hover:text-white/75",
                            )}
                            style={{ letterSpacing: "-0.04em" }}
                          >
                            {item.summary}
                          </p>
                        )}
                      </div>

                      <span
                        className={cn(
                          "block text-xs font-normal leading-[16.8px] text-[#1F2121] md:text-sm md:text-gray-400 md:transition-colors md:duration-300 md:group-hover:text-white/50",
                        )}
                      >
                        {formatDate(item.published_at ?? item.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 hidden gap-2 md:flex">
              <button
                type="button"
                onClick={prevSlide}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E]"
                aria-label="이전"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E]"
                aria-label="다음"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── 전체 보도자료 ── */}
          <section className="max-md:pt-0 md:pb-12 md:pt-14">
            <div className="mb-5 flex max-md:mb-2.5 md:mb-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
              <div
                className={cn(
                  nanum,
                  "flex items-center gap-[11px] pt-5 md:gap-2 md:pt-0",
                )}
              >
                <SectionTitleStar variant="product" className="h-[21px] w-[21px] md:h-6 md:w-6" />
                <h2 className="text-[18px] font-extrabold leading-[30px] text-[#1F2121] md:text-2xl md:leading-tight md:text-gray-900">
                  전체 보도자료
                  <span className="ml-2 text-[18px] font-extrabold text-[#1F2121] md:text-lg md:font-normal md:text-gray-400">
                    ({filtered.length})
                  </span>
                </h2>
              </div>

              <div className="hidden min-w-0 md:block">
                <SearchBar
                  value={searchInput}
                  onChange={setSearchInput}
                  onSearch={handleSearch}
                />
              </div>
            </div>

            {currentItems.length === 0 ? (
              <div className="rounded-2xl bg-white py-20 text-center text-gray-400">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div
                key={`${slideDir}-${slideIndex}`}
                className={cn(
                  "flex flex-col max-md:gap-5 md:gap-3",
                  slideDir === "next"
                    ? "animate-[slideInFromRight_280ms_ease-out]"
                    : "animate-[slideInFromLeft_280ms_ease-out]",
                )}
              >
                {currentItems.map((item) => (
                  <Link
                    key={item.news_id}
                    to={`/media/news/${item.news_id}`}
                    className={cn(
                      "group flex w-full cursor-pointer overflow-hidden transition-colors duration-300",
                      /* 모바일 시안: inline-flex 느낌의 가로 카드, 좌우 열 간 별도 gap 없음 */
                      "max-md:items-center max-md:rounded-[20px] max-md:bg-[#EAE3C9]",
                      "md:h-[235px] md:items-center md:rounded-2xl md:bg-white md:hover:bg-[#003F2B]",
                    )}
                  >
                    <div className="flex w-full max-md:items-center md:contents">
                      {/* 시안: 썸네일 열 — stretch, pl/pt/pb 20px, 내부 gap 10px */}
                      <div className="flex shrink-0 max-md:self-stretch max-md:items-start max-md:gap-2.5 max-md:pl-5 max-md:pt-5 max-md:pb-5 md:mx-3 md:self-center md:pl-0 md:pt-0 md:pb-0">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14.88px] md:h-[215px] md:w-[215px] md:rounded-xl">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#EAE3C9] md:group-hover:bg-[#1a3d2b]" />
                          )}
                        </div>
                      </div>

                      {/* 시안: 본문 열 — flex-1, padding 20px, flex-col gap 10px */}
                      <div
                        className={cn(
                          nanum,
                          "flex min-w-0 flex-1 flex-col max-md:gap-2.5 max-md:p-5",
                          "md:justify-center md:gap-2 md:px-6 md:pl-6",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex min-h-[28px] w-fit min-w-[56px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif] md:hidden",
                          )}
                          style={{ backgroundColor: "#003F2B", lineHeight: "12px" }}
                        >
                          {getTypeLabel(item.type)}
                        </span>

                        <span
                          className="hidden w-fit whitespace-nowrap rounded-full px-3 font-bold transition-colors duration-300 md:inline-flex md:h-7 md:items-center md:bg-[#EAE3C9] md:text-[#003F2B] md:group-hover:bg-white/15 md:group-hover:text-[#EAE3C9]"
                          style={{
                            fontSize: "12px",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {getTypeLabel(item.type)}
                        </span>

                        {/* 시안: 뱃지 다음 블록 gap 12px — (제목↔요약 gap 8px) + 날짜 */}
                        <div className="flex flex-col max-md:gap-3 md:gap-0">
                          <div className="flex flex-col gap-2">
                            <p
                              className={cn(
                                "min-w-0 truncate font-bold text-[#1F2121] md:mt-[22px] md:transition-colors md:duration-300 md:group-hover:text-[#EAE3C9]",
                                "text-base leading-6 md:text-xl",
                              )}
                              style={{ letterSpacing: "-0.04em" }}
                            >
                              {item.title}
                            </p>
                            {item.summary && (
                              <p
                                className={cn(
                                  "text-[#1F2121] md:truncate md:transition-colors md:duration-300 md:group-hover:text-[#EAE3C9]",
                                  "line-clamp-2 text-xs font-normal leading-[18px] md:text-sm",
                                )}
                                style={{ letterSpacing: "-0.04em" }}
                              >
                                {item.summary}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-normal leading-[14px] text-[#1F2121] md:mt-[20px] md:text-sm md:text-gray-400 md:transition-colors md:duration-300 md:group-hover:text-[#EAE3C9]/60",
                            )}
                          >
                            {formatDate(item.published_at ?? item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
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

            {totalSlides > 1 && (
              <>
                <div className="mt-6 hidden items-center gap-3 md:flex">
                  <div className="inline-flex overflow-hidden rounded-full bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={goPrevSlide}
                      disabled={slideIndex === 0}
                      className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/70 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="이전 슬라이드"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="w-px shrink-0 bg-[#EAE3C9]" aria-hidden />
                    <button
                      type="button"
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

                <div className="mt-10 flex items-center justify-center gap-[30px] pt-2 md:hidden">
                  <button
                    type="button"
                    onClick={goPrevSlide}
                    disabled={slideIndex === 0}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[40px] bg-white disabled:opacity-30"
                    aria-label="이전 슬라이드"
                  >
                    <ChevronLeft className="h-[18px] w-[18px] text-[#02633E]" strokeWidth={2.5} />
                  </button>
                  <div className="flex items-center gap-[30px]">
                    {Array.from({ length: totalSlides }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setSlideDir(i > slideIndex ? "next" : "prev");
                          setSlideIndex(i);
                        }}
                        className={cn(
                          nanum,
                          "min-w-[1.25rem] text-base font-extrabold leading-[20.8px] transition-opacity",
                          slideIndex === i ? "text-[#003F2B]" : "text-[#003F2B]/35",
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={goNextSlide}
                    disabled={slideIndex === totalSlides - 1}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[40px] bg-white disabled:opacity-30"
                    aria-label="다음 슬라이드"
                  >
                    <ChevronRight className="h-[18px] w-[18px] text-[#02633E]" strokeWidth={2.5} />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </PageContentMax>
    </div>
  );
}
