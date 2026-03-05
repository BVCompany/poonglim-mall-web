import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import type { Banner } from "~/features/home/lib/queries.server";

function dbBannerToSlide(b: Banner) {
  return {
    image: b.image_url,
    fallback: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&h=1080&fit=crop",
    category: b.title,          // 제목 → 위 작은 글씨
    title1: b.subtitle ?? "",   // 부제목 → 큰 굵은 글씨 첫 줄
    title2: b.button_text ?? "", // 보조 텍스트 → 큰 굵은 글씨 두 번째 줄
    link: b.link_url ?? undefined,
  };
}

interface HeroSectionProps {
  banners?: Banner[];
}

const MOCK_SLIDES = [
  {
    image: "/home/hero_1.jpg",
    fallback: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&h=1080&fit=crop",
    category: "건강하고 풍요로운 일상",
    title1: "신뢰할 수 있는 품질과 혁신적인 기술로",
    title2: "만드는 프리미엄 식품 솔루션",
    link: undefined as string | undefined,
  },
  {
    image: "/home/hero_2.jpg",
    fallback: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1920&h=1080&fit=crop",
    category: "풍림푸드의 프리미엄",
    title1: "30년간 축적된 노하우로",
    title2: "만들어 가는 건강하고 풍요로운 식품 문화",
    link: undefined as string | undefined,
  },
  {
    image: "/home/hero_3.jpg",
    fallback: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1920&h=1080&fit=crop",
    category: "프리미엄 액란 전문",
    title1: "신선하고 안전한 액상 계란으로",
    title2: "편리한 조리를 경험하세요",
    link: undefined as string | undefined,
  },
  {
    image: "/home/hero_4.jpg",
    fallback: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop",
    category: "간편식 라인업",
    title1: "바쁜 일상 속에서도 건강하고 맛있는",
    title2: "한 끼를 완성하세요",
    link: undefined as string | undefined,
  },
  {
    image: "/home/hero_5.jpg",
    fallback: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1920&h=1080&fit=crop",
    category: "B2B 솔루션",
    title1: "식품업계 파트너를 위한",
    title2: "맞춤형 식품 솔루션, 풍림푸드와 함께하세요",
    link: undefined as string | undefined,
  },
];

export function HeroSection({ banners = [] }: HeroSectionProps) {
  const slides = banners.length > 0 ? banners.map(dbBannerToSlide) : MOCK_SLIDES;

  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    startTimer();
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  return (
    /* 모바일: 343×460 비율 / PC: 1840×800 비율로 가로·세로 함께 스케일 */
    <section className="min-h-[calc(100vw*460/343)] w-full bg-[var(--brand-cream)] px-4 pt-2 md:h-auto md:min-h-0 md:px-8 md:pt-4 lg:px-2.5">
      <div
        className="animate-hero-unfold relative mx-auto max-h-[calc(100dvh-var(--header-height)-16px)] w-full md:aspect-[1840/800] md:max-h-[var(--hero-pc-height)] md:max-w-[var(--hero-pc-width)]"
        style={{ aspectRatio: "343/460" }}
      >
        {/* 슬라이드 카드: 모바일 rounded-2xl, 데스크톱 rounded-3xl */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl bg-gray-100 md:rounded-[2rem]">
          {/* 슬라이드 이미지 */}
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === current
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <img
                src={imgErrors[index] ? slide.fallback : slide.image}
                alt={slide.title1}
                className="h-full w-full object-cover"
                onError={() =>
                  setImgErrors((prev) => ({ ...prev, [index]: true }))
                }
              />
            </div>
          ))}

          {/* 좌측 하단: 텍스트 묶음 + 인디케이터 (모바일/PC 분리) */}
          <div className="absolute bottom-6 left-6 z-10 flex max-w-[85%] flex-col gap-2.5 sm:bottom-6 sm:left-4 sm:max-w-lg md:bottom-8 md:left-8 md:max-w-xl lg:bottom-20 lg:left-30 lg:max-w-2xl">
            {/* 텍스트 묶음: 링크가 있으면 클릭 가능 */}
            {slides[current].link ? (
              <Link
                to={slides[current].link!}
                className="flex flex-col gap-2.5 group cursor-pointer"
                viewTransition
              >
                <p
                  className="text-sm font-medium text-[var(--brand-green)] opacity-80 group-hover:opacity-100 transition-opacity md:text-[16px]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].category}
                </p>
                <h1
                  className="text-xl leading-snug font-bold text-pretty text-[var(--brand-green)] underline-offset-4 group-hover:underline md:text-[32px] md:break-keep"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].title1} {slides[current].title2}
                </h1>
              </Link>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p
                  className="text-sm font-medium text-[var(--brand-green)] opacity-80 md:text-[16px]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].category}
                </p>
                <h1
                  className="text-xl leading-snug font-bold text-pretty text-[var(--brand-green)] md:text-[32px] md:break-keep"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].title1} {slides[current].title2}
                </h1>
              </div>
            )}

            {/* 슬라이드 카운터 배지 */}
            <div className="mt-12 w-fit">
              <div className="inline-flex items-baseline gap-0.5 rounded-lg bg-gray-700/65 px-3 py-1 md:px-4 md:py-1.5">
                <span className="text-xs font-semibold text-white md:text-sm">
                  {String(current + 1).padStart(2, "0")}
                </span>
                <span className="ml-0.5 text-xs text-white/40 md:text-sm">
                  / {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/*
         * 네비게이션 버튼
         * wrapper 기준 absolute, 카드 좌/우 엣지에 걸쳐 위치
         * left-0 -translate-x-1/2 → 버튼 중심이 카드 왼쪽 엣지에 정렬
         * right-0 translate-x-1/2 → 버튼 중심이 카드 오른쪽 엣지에 정렬
         *
         * 디자인: 시안 기준 소형 둥근 직사각형
         * w-8 h-9 (32×36px), rounded-lg
         * bg-white, border border-black/5, shadow-sm
         */}
        {/* 좌우 네비 버튼 (모바일: 48px / PC: 72px) */}
        <button
          onClick={prev}
          className="absolute top-1/2 left-4 z-20 flex h-[48px] w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-r-lg border border-black/5 bg-white/90 transition-all hover:bg-white sm:left-2 md:left-6 md:h-[72px] md:w-12"
          aria-label="이전 슬라이드"
        >
          <ChevronLeft
            className="h-[26px] w-[26px] text-[#0E5A3A] md:h-8 md:w-8"
            strokeWidth={1.75}
          />
        </button>
        <button
          onClick={next}
          className="absolute top-1/2 right-4 z-20 flex h-[48px] w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-l-lg border border-black/5 bg-white/90 transition-all hover:bg-white sm:right-2 md:right-6 md:h-[72px] md:w-12"
          aria-label="다음 슬라이드"
        >
          <ChevronRight
            className="h-[26px] w-[26px] text-[#0E5A3A] md:h-8 md:w-8"
            strokeWidth={1.75}
          />
        </button>
      </div>
    </section>
  );
}
