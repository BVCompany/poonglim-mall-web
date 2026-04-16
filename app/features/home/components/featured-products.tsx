import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { SectionPageTitle } from "~/core/components/section-title-star";
import type { Product } from "~/features/products/lib/queries.server";

// DB 데이터를 컴포넌트 내부 형식으로 변환
function dbProductToItem(p: Product) {
  const badges: string[] = [];
  if (p.badge === "best") badges.push("BEST");
  if (p.badge === "new") badges.push("NEW");
  if (p.badge === "b2b" || p.is_b2b) badges.push("B2B");
  if (p.badge === "sale") badges.push("SALE");
  return {
    id: p.product_id,
    name: p.name,
    category: p.category,
    description: p.description,
    image: p.image_url ?? "",
    fallback: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=700&fit=crop",
    badges,
  };
}

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "프리미엄 스퀴즈 에그 샐러드",
    category: "간편식",
    description: "짜먹는 참치 에그샐러드로 간편하게 즐기는 프리미엄 한 끼",
    image: "/home/product-squeeze-egg-salad.png",
    fallback:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW"],
  },
  {
    id: 2,
    name: "불장닭 로제 / 오리지널",
    category: "간편식",
    description: "진한 불맛과 부드러운 로제 소스의 조화",
    image: "/home/product-buljangran.png",
    fallback:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&h=700&fit=crop",
    badges: ["BEST"],
  },
  {
    id: 3,
    name: "프리미엄 액란",
    category: "액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    image: "/home/product-egg-white-grilled.png",
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
    image: "/home/product-squeeze-egg-salad.png",
    fallback:
      "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=600&h=700&fit=crop",
    badges: ["B2B"],
  },
  {
    id: 6,
    name: "프리미엄 액란 2호",
    category: "액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    image: "/home/product-egg-white-grilled.png",
    fallback:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=700&fit=crop",
    badges: ["BEST"],
  },
  {
    id: 7,
    name: "참치 에그 샐러드",
    category: "간편식",
    description: "고소한 참치와 부드러운 계란의 완벽한 조화",
    image: "/home/product-squeeze-egg-salad.png",
    fallback:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW"],
  },
  {
    id: 8,
    name: "카라멜 푸딩",
    category: "간편식",
    description: "달콤하고 부드러운 프리미엄 카라멜 푸딩",
    image: "/home/product-caramel-pudding.png",
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
    image: "/home/product-egg-white-grilled.png",
    fallback:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=700&fit=crop",
    badges: ["BEST", "NEW", "B2B"],
  },
];

interface FeaturedProductsProps {
  dbProducts?: Product[];
}

const badgeStyle: Record<string, string> = {
  BEST: "bg-[#f4f2e5] text-[#204E3A]",
  NEW:  "bg-[#ffd55d] text-[#1a1a1a]",
  SALE: "bg-orange-500 text-white",
  B2B:  "bg-[#32af32] text-white",
};

const CARD_WIDTH = 408;
const CARD_GAP = 16;

export function FeaturedProducts({ dbProducts = [] }: FeaturedProductsProps) {
  // DB 데이터가 있으면 사용, 없으면 더미 데이터 폴백
  const products = dbProducts.length > 0
    ? dbProducts.map(dbProductToItem)
    : MOCK_PRODUCTS;

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
    <section className="overflow-x-hidden bg-transparent py-10 md:py-20">
      <div className="mx-auto w-full max-w-[var(--content-max-width)] px-4 sm:px-6">
        {/* Section Header - 모바일: 별 없음, 2줄 타이틀, 화살표만 / PC: 별+타이틀, 전체보기+화살표 */}
        <div className="mb-5 flex flex-row items-end justify-between gap-4 md:mb-8 md:justify-between">
          <SectionPageTitle
            as="h2"
            preset="none"
            starVariant="product"
            className="flex flex-1 flex-col text-[28px] leading-tight font-bold text-black md:flex-row md:items-center md:gap-2 md:text-[clamp(22px,1.5vw,28px)]"
            rootStyle={{ letterSpacing: "-0.04em" }}
            markClassName="hidden h-[21px] w-[21px] flex-shrink-0 md:block"
            wrapTitle={false}
          >
            <span>
              <span className="block md:inline">풍림푸드의 </span>
              <span className="block md:inline">
                프리미엄 제품을 만나보세요.
              </span>
            </span>
          </SectionPageTitle>
          <Link
            to="/products/all"
            className="flex flex-shrink-0 items-center text-[#003F2B]"
            aria-label="전체보기"
          >
            <span className="hidden md:inline">전체보기</span>
            <ArrowRight className="h-5 w-5 md:ml-1" />
          </Link>
        </div>

        {/* Product Slider - 모바일: 슬라이드만(네비 없음), 좌우 여백 px-4 */}
        <div className="-mr-4 sm:-mx-6 md:mx-0 md:[margin-right:calc(-50vw+50%)]">
          <div
            ref={scrollRef}
            className="scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 sm:px-6 md:pl-0 md:pr-4"
            onScroll={checkScroll}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group flex h-[380px] w-[280px] flex-shrink-0 flex-col transition-colors duration-300 sm:h-[420px] sm:w-[320px] md:h-[530px] md:w-[408px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#EAE3C9] p-4 transition-colors duration-300 group-hover:bg-[var(--brand-green)] sm:rounded-[1.25rem] sm:p-5 md:p-6">
                  {/* Badges - 상단 좌측, pill 형태 */}
                  <div className="mb-3 flex flex-shrink-0 flex-wrap items-center gap-2 sm:mb-4 md:mb-4">
                    {product.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${badgeStyle[badge]}`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  {/* Image - 중앙, 고정 높이로 제품명 같은 선상 정렬, object-contain */}
                  <div className="relative flex h-[180px] min-h-0 flex-shrink-0 items-center justify-center overflow-hidden sm:h-[220px] md:h-[298px]">
                    <div className="flex h-full w-full items-center justify-center px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain transition-all duration-300 group-hover:brightness-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = product.fallback;
                        }}
                      />
                    </div>
                  </div>
                  {/* Text - 이미지 바로 아래, 제품명 같은 선상 정렬(하단 고정 아님) */}
                  <div className="mt-12 flex min-h-0 flex-shrink-0 flex-col sm:mt-4 md:mt-4 md:min-h-[120px]">
                    <h3
                      className="line-clamp-2 text-sm leading-tight font-semibold text-[#1a1a1a] transition-colors group-hover:text-white sm:text-base md:text-[20px] md:font-bold"
                      style={{ letterSpacing: "-0.015em" }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className="mt-2 line-clamp-2 text-xs leading-relaxed break-keep text-[#4a4a4a] transition-colors group-hover:text-white/90 md:mt-3 md:text-[16px] md:font-normal"
                      style={{ letterSpacing: "-0.015em" }}
                    >
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
