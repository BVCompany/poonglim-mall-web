/**
 * 보도자료 목록 페이지
 * - 주요 보도: PC 좌열 이미지(클립 좌30·내부15·D9·하단 그라데이션 78%+50%·태그 30px)·딥그린은 호버
 * - 전체 보도자료: PC 검색(360px 필+그린 보더·분리 검색 버튼) · 목록 카드도 호버 시 딥그린
 * - 데이터: media.news 테이블
 */
import { useState, useRef } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Route } from "./+types/news";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
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
/** PC 시안: 카드 간격 20px */
const CARD_GAP = 20;
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

/** 모바일 보도 카드용 임시 이미지 (PC는 thumbnail_url 유지) */
const MOBILE_PRESS_PLACEHOLDER_IMAGES = [
  "/home/product-star.png",
  "/home/product-buljangran.png",
  "/home/product-egg-white-grilled.png",
  "/home/product-caramel-pudding.png",
  "/home/product-squeeze-egg-salad.png",
  "/intro/egg01.png",
  "/intro/egg03.png",
  "/recipe/recipe01.png",
] as const;

function pressMobilePlaceholderSrc(newsId: number) {
  const i = Math.abs(newsId) % MOBILE_PRESS_PLACEHOLDER_IMAGES.length;
  return MOBILE_PRESS_PLACEHOLDER_IMAGES[i]!;
}

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
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      {/* ── 배너 ── */}
      <PageBanner
        imageUrl="/banner/report_banner_temp.png"
        title="보도자료"
        subtitle="풍림푸드의 최신 소식과 보도자료를 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "홍보센터" },
          { label: "보도자료" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pb-12 pt-0 md:pt-12 lg:pt-[100px]">
        <div className="flex flex-col max-md:gap-[50px] lg:gap-0">
          {/* ── 주요 보도 — 모바일: 타이틀 행 ↔ 캐러셀 gap 10px (시안) ── */}
          <div className="flex flex-col max-md:gap-2.5 lg:gap-[30px]">
            <SectionPageTitle
              as="h2"
              preset="none"
              starVariant="product"
              className={cn(
                nanum,
                "flex items-center gap-[11px] px-0 pt-5 md:mb-5 md:gap-2 md:pt-0 lg:mb-0 lg:gap-5 lg:pt-0",
              )}
              markClassName="h-[21px] w-[21px] shrink-0 object-contain md:h-6 md:w-6 lg:h-[21px] lg:w-[21px]"
              titleClassName="text-[18px] font-extrabold leading-[30px] text-[#1F2121] md:text-2xl md:leading-tight md:text-gray-900 lg:text-[36px] lg:font-extrabold lg:leading-[54px] lg:text-[#1F2121]"
            >
              주요 보도
            </SectionPageTitle>

            {/*
              슬라이더 — 좌측은 본문(타이틀·별)과 동일 선상(PageContentMax 내부 시작선).
              우측만 margin으로 뷰포트까지 확장해 다음 카드가 잘림.
            */}
            <div className="overflow-hidden lg:[margin-right:calc(-50vw+50%)] max-sm:-mr-4 sm:max-md:-mr-6">
              <div
                ref={scrollRef}
                className="scrollbar-hide flex max-md:min-h-[463px] overflow-x-auto pb-4 pl-0 max-md:gap-[10px] md:min-h-0 md:gap-6 lg:gap-5"
                style={{
                  scrollSnapType: "x proximity",
                }}
              >
                {featured.map((item) => (
                  <Link
                    key={item.news_id}
                    to={`/media/news/${item.news_id}`}
                    className={cn(
                      "group flex shrink-0 cursor-pointer overflow-hidden rounded-[30px] bg-[#EAE3C9] transition-colors duration-300",
                      "w-[310px] flex-col max-md:snap-start",
                      "md:h-[520px] md:w-[1040px] md:flex-row md:rounded-2xl",
                      /* PC: 캡슐 60px — 딥그린 프레임은 호버 시(시안 첫 카드) */
                      "lg:h-auto lg:min-h-[520px] lg:w-[1040px] lg:items-start lg:rounded-[60px] lg:bg-[#EAE3C9] lg:hover:bg-[#003F2B]",
                    )}
                    style={{ scrollSnapAlign: "start" }}
                  >
                    {/* 이미지: PC 시안 — 클립(좌 30px 라운드) · 내부 15px · #D9D9D9 · 이중 하단 그라데이션 · 태그 좌상단 ~30px */}
                    <div
                      className={cn(
                        "relative flex w-full shrink-0 flex-col max-md:w-[310px] md:h-full md:w-1/2",
                        "lg:w-[520px] lg:shrink-0 lg:bg-[#EAE3C9] lg:rounded-tl-[40px] lg:rounded-bl-[40px]",
                      )}
                    >
                      <div
                        className={cn(
                          "relative w-full shrink-0",
                          "h-[310px] rounded-t-[30px]",
                          "md:h-full md:min-h-0 md:rounded-none",
                          "lg:h-[520px] lg:w-[520px]",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 overflow-hidden",
                            "rounded-t-[30px] md:rounded-none",
                            "lg:rounded-bl-[30px] lg:rounded-tl-[30px]",
                          )}
                        >
                          <div
                            className="absolute inset-0 rounded-t-[20px] bg-[#D9D9D9] md:rounded-none lg:rounded-[15px]"
                            aria-hidden
                          />
                          <img
                            src={pressMobilePlaceholderSrc(item.news_id)}
                            alt=""
                            aria-hidden
                            className={cn(
                              "absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 lg:group-hover:scale-100",
                              "rounded-t-[20px] md:rounded-none lg:rounded-[15px]",
                              "md:hidden",
                            )}
                          />
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className={cn(
                                "absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 lg:group-hover:scale-100",
                                "rounded-t-[20px] md:rounded-none lg:rounded-[15px]",
                                "hidden md:block",
                              )}
                            />
                          ) : (
                            <div
                              className={cn(
                                "absolute inset-0 bg-[#D9D9D9] md:rounded-none lg:rounded-[15px]",
                                "hidden rounded-t-[20px] md:block",
                              )}
                            />
                          )}
                          <div
                            className="pointer-events-none absolute inset-0 rounded-t-[20px] bg-gradient-to-t from-[rgba(0,0,0,0.78)] to-transparent md:rounded-none lg:rounded-[15px]"
                            aria-hidden
                          />
                          <div
                            className="pointer-events-none absolute inset-0 rounded-t-[20px] bg-gradient-to-t from-black/50 to-transparent md:rounded-none lg:rounded-[15px]"
                            aria-hidden
                          />
                        </div>
                        <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 lg:left-[30px] lg:top-[30px]">
                          <span className="inline-flex whitespace-nowrap rounded-full bg-[#003F2B] px-3 py-2 text-xs font-medium leading-3 text-white [font-family:Pretendard,system-ui,sans-serif]">
                            {getTypeLabel(item.type)}
                          </span>
                        </div>
                      </div>
                      <div
                        className="hidden max-md:block max-md:h-[17px] max-md:w-[27px] max-md:shrink-0"
                        aria-hidden
                      />
                    </div>

                    <div
                      className={cn(
                        nanum,
                        "flex flex-1 flex-col justify-between gap-5 p-5 max-md:rounded-b-[30px]",
                        "transition-colors duration-300",
                        "md:justify-between md:bg-[#EAE3C9] md:p-8 md:group-hover:bg-[#003F2B]",
                        "lg:h-[520px] lg:w-[520px] lg:flex-none lg:shrink-0 lg:justify-between lg:gap-0 lg:rounded-br-[40px] lg:rounded-tr-[40px] lg:bg-[#EAE3C9] lg:p-[56.5px] lg:group-hover:bg-[#003F2B]",
                      )}
                    >
                      <div className="flex min-h-0 flex-1 flex-col gap-2.5 md:gap-4 lg:justify-start lg:gap-[22px]">
                        <h3
                          className={cn(
                            "min-w-0 font-bold text-[#1F2121]",
                            "max-md:truncate max-md:text-base max-md:leading-6",
                            "md:text-2xl md:leading-snug md:text-gray-900 md:line-clamp-4 md:transition-colors md:duration-300 md:group-hover:text-white",
                            "lg:line-clamp-4 lg:text-2xl lg:font-bold lg:leading-9 lg:text-[#1F2121] lg:group-hover:text-white",
                          )}
                          style={{ letterSpacing: "-0.04em" }}
                        >
                          {item.title}
                        </h3>

                        {item.summary && (
                          <p
                            className={cn(
                              "min-w-0 text-[#1F2121]",
                              "max-md:line-clamp-2 max-md:text-xs max-md:font-normal max-md:leading-[18px]",
                              "text-sm font-normal leading-[21px] md:leading-relaxed md:text-gray-600 md:line-clamp-3 md:transition-colors md:duration-300 md:group-hover:text-white/75",
                              "lg:line-clamp-4 lg:text-base lg:font-normal lg:leading-6 lg:group-hover:text-white/90",
                            )}
                            style={{ letterSpacing: "-0.04em" }}
                          >
                            {item.summary}
                          </p>
                        )}
                      </div>

                      <span
                        className={cn(
                          "block shrink-0 text-xs font-normal leading-[16.8px] text-[#1F2121]",
                          "md:text-sm md:text-gray-400 md:transition-colors md:duration-300 md:group-hover:text-white/50",
                          "lg:text-sm lg:leading-[19.6px] lg:text-[#1F2121] lg:group-hover:text-white/80",
                        )}
                      >
                        {formatDate(item.published_at ?? item.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-4 hidden overflow-hidden rounded-[40px] md:inline-flex">
              <button
                type="button"
                onClick={prevSlide}
                className="flex h-[52px] w-[52px] items-center justify-center bg-white text-[#02633E] transition-colors hover:bg-[#EAE3C9]/80"
                aria-label="이전"
              >
                <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </button>
              <div className="h-[52px] w-px shrink-0 bg-[#E2E0D0]" aria-hidden />
              <button
                type="button"
                onClick={nextSlide}
                className="flex h-[52px] w-[52px] items-center justify-center bg-white text-[#02633E] transition-colors hover:bg-[#EAE3C9]/80"
                aria-label="다음"
              >
                <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </button>
            </div>
          </div>

          {/* ── 전체 보도자료 ── */}
          <section className="max-md:pt-0 md:pb-12 md:pt-14 lg:pt-[100px]">
            <div className="mb-5 flex max-md:mb-2.5 md:mb-5 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 lg:mb-10 lg:items-center lg:gap-10">
              <SectionPageTitle
                as="h2"
                preset="none"
                starVariant="product"
                className={cn(
                  nanum,
                  "flex items-center gap-[11px] pt-5 md:gap-2 md:pt-0 lg:gap-5 lg:pt-0",
                )}
                markClassName="h-[21px] w-[21px] shrink-0 object-contain md:h-6 md:w-6 lg:h-[21px] lg:w-[21px]"
                wrapTitle={false}
              >
                <span className="text-[18px] font-extrabold leading-[30px] text-[#1F2121] md:text-2xl md:leading-tight md:text-gray-900 lg:text-[36px] lg:font-extrabold lg:leading-[54px] lg:text-[#1F2121]">
                  전체 보도자료
                  <span className="ml-2 text-[18px] font-extrabold text-[#1F2121] md:text-lg md:font-normal md:text-gray-400 lg:text-[36px] lg:font-extrabold lg:leading-[54px] lg:text-[#1F2121]">
                    ({filtered.length})
                  </span>
                </span>
              </SectionPageTitle>

              <div className="hidden min-w-0 md:block lg:hidden">
                <SearchBar
                  value={searchInput}
                  onChange={setSearchInput}
                  onSearch={handleSearch}
                />
              </div>

              {/* PC 시안: 360px 흰 필 + 1px 그린 보더, 원형 검색 버튼 분리 */}
              <div className="hidden shrink-0 items-center gap-1.5 lg:flex">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="검색어를 입력해주세요."
                  className={cn(
                    nanum,
                    "h-auto w-[360px] shrink-0 rounded-[60px] border border-[#02633E] bg-white px-10 py-5 text-base font-bold leading-6 text-[#02633E] outline-none placeholder:text-[#02633E] placeholder:opacity-90",
                  )}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex shrink-0 items-center justify-center rounded-[60px] bg-[#02633E] p-5 text-white transition-all hover:brightness-110 active:scale-[0.99]"
                  aria-label="검색"
                >
                  <Search className="h-6 w-6" strokeWidth={2} />
                </button>
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
                  "flex flex-col max-md:gap-5 md:gap-3 lg:gap-5",
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
                      "max-md:items-center max-md:rounded-[20px] max-md:bg-[#EAE3C9]",
                      "md:h-[235px] md:rounded-2xl md:bg-white md:hover:bg-[#003F2B]",
                      "lg:h-[235px] lg:rounded-[40px] lg:bg-[#EAE3C9] lg:hover:bg-[#003F2B]",
                    )}
                  >
                    <div className="flex w-full flex-1 flex-row items-center max-md:min-h-0 md:h-full md:min-h-0 md:items-stretch">
                      <div
                        className={cn(
                          "flex shrink-0 max-md:self-stretch max-md:items-start max-md:gap-2.5 max-md:pl-5 max-md:pt-5 max-md:pb-5",
                          "md:mx-3 md:items-center md:self-stretch md:pl-0 md:pt-0 md:pb-0",
                          "lg:mx-0 lg:items-center lg:px-2.5 lg:py-0",
                        )}
                      >
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[14.88px] md:h-[215px] md:w-[215px] md:rounded-xl lg:rounded-[40px]">
                          <img
                            src={pressMobilePlaceholderSrc(item.news_id)}
                            alt=""
                            aria-hidden
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 md:hidden lg:group-hover:scale-100"
                          />
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="hidden h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 md:block lg:group-hover:scale-100"
                            />
                          ) : (
                            <div className="hidden h-full w-full bg-[#EAE3C9] md:block" />
                          )}
                        </div>
                      </div>

                      <div
                        className={cn(
                          nanum,
                          "flex min-w-0 flex-1 flex-col max-md:gap-2.5 max-md:p-5",
                          "md:justify-center md:gap-2 md:px-6 md:pl-6",
                          "lg:gap-10 lg:p-[30px]",
                        )}
                      >
                        <span className="inline-flex min-h-[28px] w-fit min-w-[56px] shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#003F2B] px-3 py-1.5 text-xs font-medium leading-3 text-white [font-family:Pretendard,system-ui,sans-serif] md:hidden">
                          {getTypeLabel(item.type)}
                        </span>

                        <span
                          className={cn(
                            "hidden w-fit whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium leading-3 transition-colors duration-300 [font-family:Pretendard,system-ui,sans-serif] md:inline-flex md:items-center",
                            "md:bg-[#EAE3C9] md:text-[#003F2B] md:group-hover:bg-white/15 md:group-hover:text-[#EAE3C9]",
                            "lg:bg-[#003F2B] lg:text-white lg:group-hover:bg-white/15 lg:group-hover:text-white",
                          )}
                        >
                          {getTypeLabel(item.type)}
                        </span>

                        <div className="flex flex-col max-md:gap-3 md:gap-0 lg:gap-6">
                          <div className="flex flex-col gap-2 lg:gap-3">
                            <p
                              className={cn(
                                "min-w-0 truncate font-bold text-[#1F2121]",
                                "text-base leading-6 md:mt-[22px] md:text-xl md:transition-colors md:duration-300 md:group-hover:text-[#EAE3C9]",
                                "lg:mt-0 lg:text-xl lg:font-bold lg:leading-[30px] lg:transition-colors lg:duration-300 lg:group-hover:text-white",
                              )}
                              style={{ letterSpacing: "-0.04em" }}
                            >
                              {item.title}
                            </p>
                            {item.summary && (
                              <p
                                className={cn(
                                  "line-clamp-2 text-xs font-normal leading-[18px] text-[#1F2121] md:text-sm md:truncate md:transition-colors md:duration-300 md:group-hover:text-[#EAE3C9]",
                                  "lg:text-sm lg:leading-[21px] lg:transition-colors lg:duration-300 lg:group-hover:text-white/90",
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
                              "lg:text-sm lg:leading-[19.6px] lg:text-[#1F2121] lg:transition-colors lg:duration-300 lg:group-hover:text-white/80",
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
                  <div className="inline-flex overflow-hidden rounded-[40px] bg-white">
                    <button
                      type="button"
                      onClick={goPrevSlide}
                      disabled={slideIndex === 0}
                      className="flex h-[52px] w-[52px] items-center justify-center text-[#02633E] transition-colors hover:bg-[#EAE3C9]/80 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="이전 슬라이드"
                    >
                      <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2.25} />
                    </button>
                    <div className="h-[52px] w-px shrink-0 bg-[#E2E0D0]" aria-hidden />
                    <button
                      type="button"
                      onClick={goNextSlide}
                      disabled={slideIndex === totalSlides - 1}
                      className="flex h-[52px] w-[52px] items-center justify-center text-[#02633E] transition-colors hover:bg-[#EAE3C9]/80 disabled:cursor-not-allowed disabled:opacity-30"
                      aria-label="다음 슬라이드"
                    >
                      <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2.25} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500 lg:hidden">
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
