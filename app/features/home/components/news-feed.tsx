import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { SectionPageTitle } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";
import type { News } from "~/features/media/lib/queries.server";

type NewsCategory = "공지사항" | "이언론" | "보도자료" | "이벤트";

const tagStyle: Record<NewsCategory, string> = {
  공지사항: "bg-[var(--brand-green)] text-white",
  이언론: "bg-[var(--brand-green)] text-white",
  보도자료: "bg-[var(--brand-green)] text-white",
  이벤트: "bg-[var(--brand-green)] text-white",
};

// DB 데이터를 컴포넌트 내부 형식으로 변환
function dbNewsToItem(n: News) {
  const categoryMap: Record<string, NewsCategory> = {
    news: "이언론",
    press: "보도자료",
    announcement: "공지사항",
  };
  return {
    id: n.news_id,
    category: (categoryMap[n.type] ?? "공지사항") as NewsCategory,
    title: n.title,
    excerpt: n.summary ?? n.content?.slice(0, 100) ?? "",
    date: n.published_at
      ? new Date(n.published_at).toISOString().slice(0, 10)
      : new Date(n.created_at).toISOString().slice(0, 10),
    image: n.thumbnail_url ?? "",
    fallback: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop",
  };
}

interface NewsFeedProps {
  dbNews?: News[];
}

const MOCK_NEWS_ITEMS = [
  {
    id: 1,
    category: "이벤트" as NewsCategory,
    title: "[중부매일] '가족친화 기업' 탄생",
    excerpt:
      "풍림푸드는 전 직원 270명 중 여성이 147명이다. 특히 주부 사원이 절반을 넘는다.",
    date: "2026-02-18",
    image: "/home/news_1.jpg",
    fallback:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    category: "보도자료" as NewsCategory,
    title: "[중부매일] 직원 절반 이상 주부…세심한 배려로 '가족친화 기업' 탄생",
    excerpt:
      "풍림푸드는 전 직원 270명 중 여성이 147명이다. 특히 주부 사원이 절반을 넘는다. 여성직원들을 배려하다 보니 회사 주차장의 가장 노른자 위치에 임산부 주차장이 차지하고 있고...",
    date: "2026-02-18",
    image: "",
    fallback: "",
  },
  {
    id: 3,
    category: "공지사항" as NewsCategory,
    title: "[중부매일] 직원 절반 이상 주부…세심한 배려로 '가족친화 기업' 탄생",
    excerpt:
      "풍림푸드는 전 직원 270명 중 여성이 147명이다. 특히 주부 사원이 절반을 넘는다. 여성직원들을 비롯하여 보는 회사 주차장의 가장 노른자 위치에 임산부 주차장이 지정되고 있고...",
    date: "2026-02-18",
    image: "/home/news_3.jpg",
    fallback:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    category: "이벤트" as NewsCategory,
    title: "냉동 전략액 해동 방법",
    excerpt:
      "풍림푸드는 전 직원 270명 중 여성이 147명이다. 특히 주부 사원이 절반을 넘는다.",
    date: "2026-02-18",
    image: "",
    fallback: "",
  },
  {
    id: 5,
    category: "이벤트" as NewsCategory,
    title: "[중부매일] 직원 절반 이상 주부…세심한 배려로 '가족친화 기업' 탄생",
    excerpt:
      "풍림푸드는 전 직원 270명 중 여성이 147명이다. 특히 주부 사원이 절반을 넘는다.",
    date: "2026-02-18",
    image: "/home/news_4.jpg",
    fallback:
      "https://images.unsplash.com/photo-1585996675264-0c10a19e9ba0?w=600&h=400&fit=crop",
  },
];

/** 카드 너비 + 트랙 gap — PC 시안 408px 카드 + gap 20 */
function newsScrollStepPx() {
  if (typeof window === "undefined") return 320;
  if (window.matchMedia("(min-width: 768px)").matches) return 408 + 20;
  if (window.matchMedia("(min-width: 640px)").matches) return 300 + 20;
  return 300 + 16;
}

export function NewsFeed({ dbNews = [] }: NewsFeedProps) {
  const newsItems = dbNews.length > 0 ? dbNews.map(dbNewsToItem) : MOCK_NEWS_ITEMS;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -newsScrollStepPx(),
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: newsScrollStepPx(),
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  useEffect(() => {
    const timer = setTimeout(checkScroll, 0);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return (
    <section className="overflow-x-hidden bg-[var(--brand-cream)] py-10 md:py-20">
      <div className="mx-auto w-full max-w-[var(--content-max-width)] px-4 sm:px-6">
        {/* Section Header - 모바일: 별 없음, 2줄 타이틀, 화살표만 / PC: 별+타이틀, 전체보기+화살표 */}
        <div className="mb-5 flex flex-row items-end justify-between gap-4 md:mb-10 md:justify-between">
          <SectionPageTitle
            as="h2"
            preset="none"
            starVariant="product"
            className={cn(
              "flex flex-1 flex-col",
              "max-md:font-[family-name:var(--font-nanum)] max-md:text-[18px] max-md:font-bold max-md:leading-[27px] max-md:text-[#1F2121] max-md:uppercase max-md:break-words",
              "text-lg font-bold leading-tight text-black md:flex-row md:items-center md:gap-2 md:text-[clamp(22px,1.5vw,28px)] md:normal-case md:tracking-[-0.04em]",
            )}
            markClassName="hidden h-[21px] w-[21px] flex-shrink-0 md:block"
            wrapTitle={false}
          >
            <span>
              <span className="md:hidden">
                풍림푸드의 새로운 소식을
                <br />
                가장 먼저 만나보세요.
              </span>
              <span className="hidden md:contents">
                <span className="block md:inline">풍림푸드의 새로운 소식을 </span>
                <span className="block md:inline">가장 먼저 만나보세요.</span>
              </span>
            </span>
          </SectionPageTitle>
          <Link
            to="/media"
            className="flex flex-shrink-0 items-center text-[#003F2B]"
            aria-label="전체보기"
          >
            <span className="hidden md:inline">전체보기</span>
            <ArrowRight className="h-5 w-5 md:ml-1" />
          </Link>
        </div>

        {/* News Slider */}
        <div className="-mx-4 sm:-mx-6 md:mx-0 md:[margin-right:calc(-50vw+50%)]">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-proximity scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6 md:scroll-pl-0 md:pl-0 md:pr-4"
            onScroll={checkScroll}
          >
            {newsItems.map((item) => {
              const hasImage = !!(item.image || item.fallback);

              return (
                <Link
                  key={item.id}
                  to={`/media/${item.id}`}
                  className="group flex h-full w-[300px] flex-shrink-0 md:w-[408px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-[30px] bg-[#EAE3C9] transition-colors duration-300 group-hover:bg-[var(--brand-green)] md:rounded-[40px]">
                    {/* 이미지: PC 시안 — 상하좌 10px inset, 244×라운드 30, 배지 30/30 */}
                    {hasImage ? (
                      <div className="relative p-3 md:p-0 md:pt-[10px] md:pr-[10px] md:pl-[10px]">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[25px] md:aspect-auto md:h-[244px] md:w-full">
                          <img
                            src={item.image || item.fallback}
                            alt={item.title}
                            className="h-full w-full object-cover object-center transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                            onError={(e) => {
                              if (item.fallback) {
                                (e.target as HTMLImageElement).src =
                                  item.fallback;
                              }
                            }}
                          />
                          <span
                            className={`absolute top-4 left-4 z-10 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300 group-hover:bg-[#EAE3C9] group-hover:text-brand-green md:left-[30px] md:top-[30px] md:px-[12.58px] md:py-[7.19px] md:text-[12px] md:leading-[12px] md:font-medium md:[font-family:Pretendard,system-ui,sans-serif] ${tagStyle[item.category]}`}
                          >
                            {item.category}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* 본문: PC — 패딩 30, 제목·요약 gap 12, 블록 간 gap 24 / 시안 타이포 */}
                    <div className="flex flex-1 flex-col px-4 pb-5 pt-3 md:gap-6 md:p-[30px]">
                      {!hasImage && (
                        <span
                          className={`mb-3 self-start rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300 group-hover:bg-[#EAE3C9] group-hover:text-brand-green md:mb-0 md:px-[12.58px] md:py-[7.19px] md:text-[12px] md:leading-[12px] md:font-medium md:[font-family:Pretendard,system-ui,sans-serif] ${tagStyle[item.category]}`}
                        >
                          {item.category}
                        </span>
                      )}
                      <div className="flex min-h-0 flex-1 flex-col gap-2 md:gap-3">
                        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#2D2D2D] transition-colors group-hover:text-white md:font-[family-name:var(--font-nanum)] md:text-[20px] md:leading-[30px] md:font-bold md:text-[#1F2121] md:group-hover:text-white">
                          {item.title}
                        </h3>
                        <p className="line-clamp-3 flex-1 text-xs leading-relaxed text-[#666] transition-colors group-hover:text-[#B4E8AE] md:font-[family-name:var(--font-nanum)] md:text-[14px] md:leading-[21px] md:font-normal md:text-[#1F2121] md:group-hover:text-[#B4E8AE]">
                          {item.excerpt}
                        </p>
                      </div>
                      <p className="mt-4 text-xs text-[#666]/80 transition-colors group-hover:text-white/50 md:mt-0 md:font-[family-name:var(--font-nanum)] md:text-[14px] md:leading-[19.6px] md:font-normal md:text-[#1F2121] md:group-hover:text-white/50">
                        {item.date}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Navigation - PC에서만 표시, 모바일은 터치 슬라이드만 */}
          <div className="mt-6 hidden px-0 md:block">
            <div className="inline-flex overflow-hidden rounded-full bg-white">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="이전"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-px shrink-0 bg-[#EAE3C9]" aria-hidden />
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="다음"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
