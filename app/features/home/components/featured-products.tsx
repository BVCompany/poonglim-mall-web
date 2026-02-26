import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

const products = [
  {
    id: 1,
    name: "프리미엄 스퀴즈 에그 샐러드",
    category: "간편식",
    description: "짜먹는 참치 에그샐러드로 간편하게 즐기는 프리미엄 한 끼",
    image: "/home/premium_egg.png",
    fallback:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW"],
  },
  {
    id: 2,
    name: "불장닭 로제 / 오리지널",
    category: "간편식",
    description: "진한 불맛과 부드러운 로제 소스의 조화",
    image: "/home/puding.png",
    fallback:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=700&fit=crop",
    badges: ["BEST"],
  },
  {
    id: 3,
    name: "프리미엄 액란",
    category: "액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    image: "/home/solution.png",
    fallback:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW", "B2B"],
  },
  {
    id: 4,
    name: "B2B 식품 솔루션",
    category: "B2B",
    description: "식품업계 파트너를 위한 맞춤형 OEM/ODM 솔루션",
    image: "/home/b2b.png",
    fallback:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=700&fit=crop",
    badges: ["B2B"],
  },
  {
    id: 5,
    name: "스퀴즈 에그 샐러드 B2B",
    category: "B2B",
    description: "대량 납품 가능한 고품질 에그 샐러드 제품",
    image: "/home/premium_egg.png",
    fallback:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&h=700&fit=crop",
    badges: ["B2B"],
  },
  {
    id: 6,
    name: "프리미엄 액란 2호",
    category: "액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    image: "/home/solution.png",
    fallback:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=700&fit=crop",
    badges: ["BEST"],
  },
  {
    id: 7,
    name: "참치 에그 샐러드",
    category: "간편식",
    description: "고소한 참치와 부드러운 계란의 완벽한 조화",
    image: "/home/premium_egg.png",
    fallback:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW"],
  },
  {
    id: 8,
    name: "카라멜 푸딩",
    category: "간편식",
    description: "달콤하고 부드러운 프리미엄 카라멜 푸딩",
    image: "/home/puding.png",
    fallback:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=700&fit=crop",
    badges: ["NEW"],
  },
  {
    id: 9,
    name: "OEM/ODM 솔루션",
    category: "B2B",
    description: "맞춤형 제품 개발 및 대량 생산 지원",
    image: "/home/b2b.png",
    fallback:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=700&fit=crop",
    badges: ["B2B"],
  },
  {
    id: 10,
    name: "프리미엄 에그 시리즈",
    category: "액란",
    description: "다양한 용도의 프리미엄 액란 제품 라인업",
    image: "/home/solution.png",
    fallback:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW", "B2B"],
  },
];

const badgeStyle: Record<string, string> = {
  BEST: "bg-[#F4F2E5] text-[#4A4A4A]",
  NEW: "bg-[#FFD55D] text-[#4A4A4A]",
  B2B: "bg-[#32AF32] text-white",
};

const CARD_WIDTH = 408;
const CARD_GAP = 16;

export function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollAmount = CARD_WIDTH + CARD_GAP;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });
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
        <div className="mb-5 flex flex-row items-end justify-between gap-4 md:mb-8 md:-ml-20 md:justify-between">
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
              <span className="block md:inline">풍림푸드의</span>
              <span className="block md:inline">
                프리미엄 제품을 만나보세요.
              </span>
            </span>
          </h2>
          <Link
            to="/products/all"
            className="flex flex-shrink-0 items-center text-[#003F2B] transition-colors hover:text-[#2DB96B]"
            aria-label="전체보기"
          >
            <span className="hidden md:inline">전체보기</span>
            <ArrowRight className="h-5 w-5 md:ml-1" />
          </Link>
        </div>

        {/* Product Slider - 모바일: 슬라이드만(네비 없음), 좌우 여백 px-4 */}
        <div className="-mr-4 overflow-hidden sm:-mx-6 md:[margin-right:calc(-50vw+50%)] md:-ml-18">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 sm:px-6 md:pr-0 md:pl-6"
            onScroll={checkScroll}
            style={{ scrollSnapType: "x proximity" }}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group w-[280px] flex-shrink-0 transition-colors duration-300 sm:w-[320px] md:w-[408px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative flex h-[380px] flex-col overflow-hidden rounded-2xl bg-[#EAE3C9] p-4 transition-colors duration-300 group-hover:bg-[#1A4736] sm:h-[420px] sm:p-5 md:h-[530px] md:p-6">
                  {/* Badges - 고정 높이로 제품명 정렬 */}
                  <div className="mb-3 flex h-10 flex-wrap items-center gap-1">
                    {product.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle[badge]}`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  {/* Image - 고정 높이 */}
                  <div className="relative flex h-[160px] flex-shrink-0 items-center justify-center overflow-hidden rounded-lg px-3 py-4 sm:h-[200px] sm:px-4 sm:py-5 md:h-[250px] md:px-4 md:py-6">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain transition-all duration-300 group-hover:brightness-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = product.fallback;
                      }}
                    />
                  </div>
                  {/* Text - 제품명 위쪽, 카드마다 나란히 정렬 */}
                  <div className="min-h-0 flex-1 pt-4">
                    {/* 카테고리(간편식, 액란 등) 임시 제외 */}
                    <h3 className="text-sm leading-snug font-semibold text-[#2D2D2D] transition-colors group-hover:text-white">
                      {product.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#666] transition-colors group-hover:text-[#B4E8AE]">
                      {product.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons - PC에서만 표시, 모바일은 슬라이드만 */}
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
