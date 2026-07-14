import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import type { Banner } from "~/features/home/lib/queries.server";
import { pickLocalizedText } from "~/core/lib/localized-text";

function dbBannerToSlide(b: Banner, isEn: boolean) {
  return {
    image: b.image_url,
    fallback:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&h=1080&fit=crop",
    category: pickLocalizedText(b.title, b.title_en, isEn),
    title1: pickLocalizedText(b.subtitle, b.subtitle_en, isEn),
    title2: pickLocalizedText(b.button_text, b.button_text_en, isEn),
    link: b.link_url ?? undefined,
  };
}

interface HeroSectionProps {
  banners?: Banner[];
}

export function HeroSection({ banners = [] }: HeroSectionProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");

  const slides = useMemo(
    () => banners.map((b) => dbBannerToSlide(b, isEn)),
    [banners, isEn],
  );
  const slideCount = slides.length;

  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (slideCount <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideCount);
    }, 5000);
  };

  /* 배너 개수가 바뀌면 인덱스 보정 + 자동 슬라이드 타이머 재시작 */
  useEffect(() => {
    setCurrent((c) => (c >= slideCount ? 0 : c));
  }, [slideCount]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slideCount]);

  const goTo = (index: number) => {
    setCurrent(index);
    startTimer();
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  if (slides.length === 0) {
    return (
      <section className="flex min-h-[calc(100vw*460/343)] w-full items-center justify-center bg-[var(--brand-cream)] md:min-h-[400px]">
        <p className="text-base text-gray-400">{t("empty.heroBanners")}</p>
      </section>
    );
  }

  return (
    /* 모바일: 343×460 비율 / PC: 1840×800 비율로 가로·세로 함께 스케일 */
    <section className="min-h-[calc(100vw*460/343)] w-full bg-[var(--brand-cream)] px-4 pt-2 md:h-auto md:min-h-0 md:px-8 md:pt-4 lg:px-2.5">
      <div
        className="animate-hero-unfold-main relative mx-auto max-h-[calc(100dvh-var(--header-height)-16px)] w-full md:aspect-[1840/800] md:max-h-[var(--hero-pc-height)] md:max-w-[var(--hero-pc-width)]"
        style={{ aspectRatio: "343/460" }}
      >
        {/* 슬라이드 카드: 모바일 30px, 데스크톱 2rem */}
        <div className="absolute inset-0 overflow-hidden rounded-[30px] bg-gray-100 md:rounded-[2rem]">
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

          {/*
            어두운 배너 대비: 브랜드 그린 텍스트 유지 — 대각/코너 radial 없이
            화면 중심(상반부)은 그대로 두고 하단으로만 세로 그라데이션
          */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,transparent_0%,transparent_46%,rgba(253,253,245,0.22)_62%,rgba(253,253,245,0.78)_88%,rgba(253,253,245,0.88)_100%)]"
            aria-hidden
          />

          {/* 좌측 하단: 텍스트 묶음 + 인디케이터 (모바일/PC 분리) */}
          <div className="absolute bottom-6 left-6 z-10 flex max-w-[85%] flex-col gap-2.5 sm:bottom-6 sm:left-4 sm:max-w-lg md:bottom-8 md:left-8 md:max-w-xl lg:bottom-20 lg:left-30 lg:max-w-2xl">
            {/* 텍스트 묶음: 링크가 있으면 클릭 가능 */}
            {slides[current].link ? (
              <Link
                to={slides[current].link!}
                className="group flex cursor-pointer flex-col gap-2.5"
                viewTransition
              >
                <p
                  className="text-sm font-medium text-[var(--brand-green)] opacity-90 transition-opacity group-hover:opacity-100 md:text-[18px]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].category}
                </p>
                <h1
                  className="text-xl leading-snug font-bold text-pretty text-[var(--brand-green)] underline-offset-4 group-hover:underline md:text-[clamp(28px,2.1vw,40px)] md:leading-[1.2] md:break-keep"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].title1} {slides[current].title2}
                </h1>
              </Link>
            ) : (
              <div className="flex flex-col gap-2.5">
                <p
                  className="text-sm font-medium text-[var(--brand-green)] opacity-90 md:text-[18px]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {slides[current].category}
                </p>
                <h1
                  className="text-xl leading-snug font-bold text-pretty text-[var(--brand-green)] md:text-[clamp(28px,2.1vw,40px)] md:leading-[1.2] md:break-keep"
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
          type="button"
          onClick={prev}
          className="absolute top-1/2 left-4 z-20 flex h-[48px] w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-r-lg border border-black/5 bg-white/90 transition-all hover:bg-white sm:left-2 md:left-6 md:h-[72px] md:w-12"
          aria-label={t("home.hero.slidePrev")}
        >
          <ChevronLeft
            className="h-[26px] w-[26px] text-[#0E5A3A] md:h-8 md:w-8"
            strokeWidth={1.75}
          />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute top-1/2 right-4 z-20 flex h-[48px] w-8 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-l-lg border border-black/5 bg-white/90 transition-all hover:bg-white sm:right-2 md:right-6 md:h-[72px] md:w-12"
          aria-label={t("home.hero.slideNext")}
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
