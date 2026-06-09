import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { SectionPageTitle } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";
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

type ProductCard = ReturnType<typeof dbProductToItem>;


interface FeaturedProductsProps {
  dbProducts?: Product[];
}

const badgeStyle: Record<string, string> = {
  BEST: "bg-[#F4F2E5] text-[#1F2121]",
  NEW: "bg-[#FFD55D] text-[#1F2121]",
  SALE: "bg-orange-500 text-white",
  B2B: "bg-[#32AF32] text-white",
};

const CARD_WIDTH = 408;
const CARD_GAP = 16;

export function FeaturedProducts({ dbProducts = [] }: FeaturedProductsProps) {
  const { t } = useTranslation();

  const products = dbProducts.map(dbProductToItem);

  if (products.length === 0) return null;

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
  }, [products.length]);

  return (
    <section className="overflow-x-hidden bg-transparent py-10 md:py-20">
      <div className="mx-auto w-full max-w-[var(--content-max-width)] px-4 sm:px-6">
        {/* Section Header - 모바일: 별 없음, 2줄 타이틀, 화살표만 / PC: 별+타이틀, 전체보기+화살표 */}
        <div className="mb-5 flex flex-row items-end justify-between gap-4 md:mb-8 md:justify-between">
          <SectionPageTitle
            as="h2"
            preset="none"
            starVariant="product"
            className={cn(
              "flex flex-1 flex-col",
              "max-md:font-[family-name:var(--font-nanum)] max-md:text-[18px] max-md:font-bold max-md:leading-[27px] max-md:text-[#1F2121] max-md:uppercase max-md:break-words",
              "text-[28px] leading-tight font-bold text-black md:flex-row md:items-center md:gap-2 md:text-[clamp(22px,1.5vw,28px)] md:normal-case md:tracking-[-0.04em]",
            )}
            markClassName="hidden h-[21px] w-[21px] flex-shrink-0 md:block"
            wrapTitle={false}
          >
            <span>
              <span className="md:hidden">
                {t("home.featuredProducts.subtitle1")}
                <br />
                {t("home.featuredProducts.subtitle2")}.
              </span>
              <span className="hidden md:contents">
                <span className="block md:inline">
                  {t("home.featuredProducts.subtitle1")}{" "}
                </span>
                <span className="block md:inline">
                  {t("home.featuredProducts.subtitle2")}.
                </span>
              </span>
            </span>
          </SectionPageTitle>
          <Link
            to="/products/all"
            className="flex flex-shrink-0 items-center text-[#003F2B]"
            aria-label={t("home.featuredProducts.viewAllAria")}
          >
            <span className="hidden md:inline">
              {t("home.featuredProducts.viewAllLink")}
            </span>
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
                className="group flex w-[310px] flex-shrink-0 flex-col transition-colors duration-300 md:h-[530px] md:w-[408px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[30px] bg-[#EAE3C9] transition-colors duration-300 group-hover:bg-[var(--brand-green)] max-md:p-4 md:h-full md:rounded-3xl md:p-6">
                  {/* 모바일: 배지 이미지 영역 상단 절대 배치 · PC: 상단 플로우 */}
                  <div className="z-10 flex max-md:absolute max-md:left-5 max-md:top-5 max-md:mb-0 max-md:items-center max-md:gap-[5px] mb-3 flex-shrink-0 flex-wrap items-center gap-2 md:relative md:mb-4">
                    {product.badges.map((badge) => (
                      <span
                        key={badge}
                        className={cn(
                          "rounded-full font-medium [font-family:Pretendard,system-ui,sans-serif] max-md:px-[12.58px] max-md:py-[7.19px] max-md:text-[12px] max-md:leading-[12px]",
                          "px-3 py-1.5 text-xs font-semibold md:px-3 md:py-1.5 md:text-xs md:leading-normal",
                          badgeStyle[badge],
                        )}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                  {/* 제품 이미지 — 카드 크기는 유지하고, 배경 유무·비율과 무관하게 이미지가
                      동일한 영역을 꽉 채우도록(object-cover) 처리해 통일감 있게 노출 */}
                  <div className="relative h-[278px] w-full shrink-0 overflow-hidden rounded-2xl bg-white md:h-[298px] md:rounded-2xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = product.fallback;
                      }}
                    />
                  </div>
                  {/* 모바일: px-20 pb-20(20px) · 타이포 시안 */}
                  <div className="flex min-h-0 flex-shrink-0 flex-col max-md:gap-[9px] max-md:px-1 max-md:pb-1 max-md:pt-3 md:mt-4 md:min-h-[120px]">
                    <h3
                      className={cn(
                        "line-clamp-2 transition-colors group-hover:text-white",
                        "max-md:font-[family-name:var(--font-nanum)] max-md:text-[20px] max-md:leading-[26px] max-md:font-extrabold max-md:text-[#1F2121]",
                        "text-sm font-semibold leading-tight text-[#1a1a1a] md:text-[20px] md:font-bold",
                      )}
                      style={{ letterSpacing: "-0.015em" }}
                    >
                      {product.name}
                    </h3>
                    <p
                      className={cn(
                        "line-clamp-2 transition-colors group-hover:text-white/90",
                        "max-md:mt-0 max-md:font-[family-name:var(--font-nanum)] max-md:text-base max-md:font-normal max-md:uppercase max-md:leading-[22.4px] max-md:text-[#1F2121]",
                        "mt-2 break-keep text-xs leading-relaxed text-[#4a4a4a] md:mt-3 md:text-[16px] md:font-normal md:normal-case",
                      )}
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
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t("home.featuredProducts.carouselPrev")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="w-px shrink-0 bg-[#EAE3C9]" aria-hidden />
              <button
                type="button"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t("home.featuredProducts.carouselNext")}
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
