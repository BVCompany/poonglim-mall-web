import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
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

const CARD_GAP = 20;
const SCROLL_AMOUNT = 320; /* 한 카드 너비 + gap (모바일~데스크톱) */

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
      left: -SCROLL_AMOUNT,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: SCROLL_AMOUNT,
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
          <h2
            className="flex flex-1 flex-col text-lg font-bold leading-tight text-black md:flex-row md:items-center md:gap-2 md:text-2xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            <img
              src="/home/product-star.png"
              alt=""
              className="hidden flex-shrink-0 md:block"
              width={21}
              height={21}
            />
            <span>
              <span className="block md:inline">풍림푸드 새로운소식을</span>
              <span className="block md:inline">가장 먼저 만나보세요</span>
            </span>
          </h2>
          <Link
            to="/media"
            className="flex flex-shrink-0 items-center text-[#003F2B] transition-colors hover:text-[#2DB96B]"
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
            className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 sm:gap-5 sm:px-6 md:pr-4"
            onScroll={checkScroll}
            style={{
              scrollSnapType: "x proximity",
              scrollPaddingLeft: "1rem",
            }}
          >
            {newsItems.map((item) => {
              const hasImage = !!(item.image || item.fallback);

              return (
                <Link
                  key={item.id}
                  to={`/media/${item.id}`}
                  className="group flex h-full w-[300px] flex-shrink-0 md:w-[385px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#EAE3C9] transition-colors duration-300 group-hover:bg-[#1A4736]">
                    {/* 이미지 카드: 상단 이미지 + 여백(inset) + 태그 오버레이 */}
                    {hasImage ? (
                      <div className="relative p-3 md:p-4">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                          <img
                            src={item.image || item.fallback}
                            alt={item.title}
                            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                            onError={(e) => {
                              if (item.fallback) {
                                (e.target as HTMLImageElement).src =
                                  item.fallback;
                              }
                            }}
                          />
                        </div>
                        <span
                          className={`absolute top-4 left-4 md:top-5 md:left-5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300 group-hover:bg-[#EAE3C9] group-hover:text-brand-green ${tagStyle[item.category]}`}
                        >
                          {item.category}
                        </span>
                      </div>
                    ) : null}

                    {/* 콘텐츠: 하단 텍스트 영역, 좌우하단 여백 적용 */}
                    <div className="flex flex-1 flex-col px-4 pb-5 pt-3 md:px-5 md:pb-6 md:pt-4">
                      {!hasImage && (
                        <span
                          className={`mb-3 self-start rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-300 group-hover:bg-[#EAE3C9] group-hover:text-brand-green ${tagStyle[item.category]}`}
                        >
                          {item.category}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-sm leading-snug font-bold text-[#2D2D2D] transition-colors group-hover:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 flex-1 text-xs leading-relaxed text-[#666] transition-colors group-hover:text-[#B4E8AE]">
                        {item.excerpt}
                      </p>
                      <p className="mt-4 text-xs text-[#666]/80 transition-colors group-hover:text-white/50">
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
                className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="이전"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-px shrink-0 bg-[#EAE3C9]" aria-hidden />
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#F4F2E5]/50 disabled:cursor-not-allowed disabled:opacity-30"
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
