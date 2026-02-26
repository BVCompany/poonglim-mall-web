import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router";

const categories = [
  {
    id: 1,
    name: "프리미엄 액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    link: "/products/egg",
    highlight: true,
  },
  {
    id: 2,
    name: "프리미엄 액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    link: "/products/egg",
    highlight: false,
  },
  {
    id: 3,
    name: "프리미엄 액란",
    description: "의식업체를 위한 고품질 간편식 제품 라인업",
    link: "/products/b2b",
    highlight: false,
  },
  {
    id: 4,
    name: "프리미엄 액란",
    description: "신선하고 안전한 액상 계란으로 편리한 조리를 경험하세요",
    link: "/products/egg",
    highlight: false,
  },
  {
    id: 5,
    name: "간편식 시리즈",
    description: "바쁜 일상 속 든든한 한 끼를 책임지는 풍림 간편식",
    link: "/products/convenient",
    highlight: false,
  },
  {
    id: 6,
    name: "풍림 시리즈",
    description: "풍림푸드의 대표 브랜드 제품 시리즈",
    link: "/products/poonglim",
    highlight: false,
  },
];

export function ProductCategories() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const SCROLL_AMOUNT = 320;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  return (
    <section className="py-20 bg-[var(--brand-cream)]">
      {/* Category Cards */}
      <div className="relative mx-auto w-full max-w-[var(--content-max-width)] px-6">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          onScroll={checkScroll}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.link}
              className={`flex-shrink-0 w-[260px] md:w-[280px] rounded-2xl p-6 flex flex-col justify-between min-h-[160px] transition-colors ${
                cat.highlight
                  ? "bg-[var(--brand-green)] text-white"
                  : "bg-[oklch(0.91_0.02_90)] text-foreground hover:bg-[oklch(0.88_0.025_90)]"
              }`}
            >
              <h3
                className={`text-lg font-bold leading-snug ${
                  cat.highlight ? "text-white" : "text-foreground"
                }`}
              >
                {cat.name}
              </h3>
              <p
                className={`text-sm leading-relaxed mt-3 ${
                  cat.highlight ? "text-white/80" : "text-foreground/60"
                }`}
              >
                {cat.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="w-9 h-9 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="이전"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="w-9 h-9 rounded-full border border-foreground/20 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="다음"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
