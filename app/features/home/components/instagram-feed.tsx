"use client";

import { ChevronLeft, ChevronRight, Instagram } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { InstagramPost } from "~/features/home/lib/queries.server";

const OFFICIAL_INSTAGRAM_URL = "https://www.instagram.com/poonglim.official";

/** 직접 등록 이미지가 없을 때 노출되는 기본(시안) 이미지 */
const DEFAULT_POSTS: FeedPost[] = [
  { id: "default-1", image: "/home/instar-img-01.png", link: OFFICIAL_INSTAGRAM_URL },
  { id: "default-2", image: "/home/instar-img-02.png", link: OFFICIAL_INSTAGRAM_URL },
  { id: "default-3", image: "/home/instar-img-03.png", link: OFFICIAL_INSTAGRAM_URL },
  { id: "default-4", image: "/home/instar-img-01.png", link: OFFICIAL_INSTAGRAM_URL },
  { id: "default-5", image: "/home/instar-img-02.png", link: OFFICIAL_INSTAGRAM_URL },
  { id: "default-6", image: "/home/instar-img-03.png", link: OFFICIAL_INSTAGRAM_URL },
];

interface FeedPost {
  id: string;
  image: string;
  link: string;
  caption?: string;
}

interface InstagramFeedProps {
  /** 관리자가 직접 등록한 이미지 (있으면 우선 노출) */
  posts?: InstagramPost[];
}

const SLIDE_GROUP_SIZE = 3;
const IMAGE_GAP = 16;
const ASPECT_RATIO = "360/450"; // PC 360x450, 모바일 208x260 동일 비율
const PC_ITEM_WIDTH = 360;
const MOBILE_ITEM_WIDTH = 208;
const PC_FEED_MAX_WIDTH = PC_ITEM_WIDTH * SLIDE_GROUP_SIZE + IMAGE_GAP * (SLIDE_GROUP_SIZE - 1); // 1112px

export function InstagramFeed({ posts: dbPosts = [] }: InstagramFeedProps) {
  const { t } = useTranslation();
  // 직접 등록 이미지가 있으면 우선 사용, 없으면 기본(시안) 이미지로 폴백
  const posts: FeedPost[] = useMemo(() => {
    if (dbPosts.length === 0) return DEFAULT_POSTS;
    return dbPosts.map((p) => ({
      id: String(p.instagram_post_id),
      image: p.image_url,
      link: p.link_url || OFFICIAL_INSTAGRAM_URL,
      caption: p.caption ?? undefined,
    }));
  }, [dbPosts]);
  const [current, setCurrent] = useState(0);
  const [imageWidth, setImageWidth] = useState(PC_ITEM_WIDTH);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const maxSlide = Math.max(0, Math.ceil(posts.length / SLIDE_GROUP_SIZE) - 1);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let triggered = false;
    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setInView(true);
      window.removeEventListener("scroll", onScroll);
    };

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) trigger();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = () => {
      setImageWidth(mq.matches ? PC_ITEM_WIDTH : MOBILE_ITEM_WIDTH);
    };
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // PC: 컨테이너 너비에 맞춰 3개가 온전히 보이도록 아이템 너비 동적 계산
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;
    const el = containerRef.current;
    if (!el) return;
    const updateWidth = () => {
      const w = el.offsetWidth;
      const totalGap = IMAGE_GAP * (SLIDE_GROUP_SIZE - 1);
      const itemWidth = Math.floor((w - totalGap) / SLIDE_GROUP_SIZE);
      setImageWidth(Math.min(PC_ITEM_WIDTH, Math.max(MOBILE_ITEM_WIDTH, itemWidth)));
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(Math.max(0, Math.min(index, maxSlide)));
    },
    [maxSlide],
  );

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const slideOffset =
    imageWidth * SLIDE_GROUP_SIZE + IMAGE_GAP * (SLIDE_GROUP_SIZE - 1);

  const officialButton = (
    <a
      href={OFFICIAL_INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center justify-between gap-4 overflow-hidden rounded-full bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 px-4 py-3 transition-opacity hover:opacity-95 md:w-fit"
    >
      <span className="text-[14px] font-medium text-white">
        @poonglim.official
      </span>
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white">
        <ChevronRight className="h-4 w-4 text-[#1e463a]" strokeWidth={2} />
      </span>
    </a>
  );

  return (
    <section
      ref={sectionRef}
      className="bg-[var(--brand-cream)] py-10 md:py-16 lg:py-20"
    >
      {/* ── 모바일 레이아웃 (이미지 시안 기준) ── */}
      <div className="mx-auto flex w-full max-w-[var(--pc-w-1680)] flex-col gap-5 px-4 md:hidden">
        {/* 헤더: 카테고리(14px) + 타이틀(18px) */}
        <div className={`${inView ? "animate-insta-left-in" : "opacity-0"}`}>
          <p
            className="mb-2 flex items-center gap-2 text-[14px] font-semibold text-black"
            style={{ letterSpacing: "-0.04em" }}
          >
            <Instagram className="h-4 w-4" />
            {t("home.instagram.title")}
          </p>
          <p className="font-[family-name:var(--font-nanum)] text-[18px] font-bold leading-[27px] uppercase break-words text-[#1F2121]">
            {t("home.instagram.subtitle1")}
            <br />
            {t("home.instagram.subtitle2")}
          </p>
        </div>

        {/* 피드: 터치 슬라이드 - 좌측 여백 유지, scroll-padding으로 스냅 시에도 여백 보존 */}
        <div
          className={`scrollbar-hide -mx-4 overflow-x-auto px-4 ${inView ? "animate-insta-left-in" : "opacity-0"}`}
          style={{
            scrollSnapType: "x proximity",
            scrollPaddingLeft: "1rem",
          }}
        >
          <div className="flex gap-3">
            {posts.map((post, idx) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-shrink-0 overflow-hidden rounded-[30px] bg-gray-100"
                style={{
                  width: MOBILE_ITEM_WIDTH,
                  aspectRatio: ASPECT_RATIO,
                  scrollSnapAlign: "start",
                }}
              >
                <img
                  src={post.image}
                  alt={post.caption || t("home.instagram.postAlt", { id: idx + 1 })}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </a>
            ))}
          </div>
        </div>

        {/* 오피셜 버튼: 피드 아래 */}
        {officialButton}
      </div>

      {/* ── PC 레이아웃 (피그마 프로토타입과 맞추어 가로 확장) ── */}
      <div className="mx-auto hidden w-full max-w-[var(--pc-w-1640)] flex-col gap-8 px-4 sm:px-6 md:flex md:flex-row md:items-stretch md:gap-12 lg:gap-16">
        <div
          className={`flex flex-shrink-0 flex-col justify-between md:w-[35%] lg:w-[320px] ${inView ? "animate-insta-left-in" : "opacity-0"}`}
        >
          <div className="flex flex-col gap-4">
            <p
              className="flex items-center gap-2 text-[14px] font-semibold text-black"
              style={{ letterSpacing: "-0.04em" }}
            >
              <Instagram className="h-4 w-4" />
              {t("home.instagram.title")}
            </p>
            <div className="flex flex-col gap-8">
              <p
                className="text-black"
                style={{
                  fontSize: 28,
                  lineHeight: "150%",
                  letterSpacing: "-0.04em",
                }}
              >
                {t("home.instagram.subtitle1")}
                <br />
                {t("home.instagram.subtitle2")}
              </p>
              {officialButton}
            </div>
          </div>
          <div className="flex">
            <div className="flex overflow-hidden rounded-full border border-black/10 bg-white">
              <button
                type="button"
                onClick={prev}
                disabled={current === 0}
                aria-label={t("home.instagram.carouselPrev")}
                className="flex h-11 w-11 items-center justify-center border-r border-black/10 text-[var(--brand-green)] transition-colors hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--brand-green)]"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={current === maxSlide}
                aria-label={t("home.instagram.carouselNext")}
                className="flex h-11 w-11 items-center justify-center text-[var(--brand-green)] transition-colors hover:bg-black/5 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--brand-green)]"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className={`relative ml-auto min-w-0 flex-1 overflow-hidden ${inView ? "animate-insta-right-in" : "opacity-0"}`}
          style={{ maxWidth: PC_FEED_MAX_WIDTH }}
        >
          <div
            className="flex gap-4"
            style={{
              transform: `translateX(-${current * slideOffset}px)`,
              transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {posts.map((post, idx) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100"
                style={{
                  width: imageWidth,
                  aspectRatio: ASPECT_RATIO,
                }}
              >
                <img
                  src={post.image}
                  alt={post.caption || t("home.instagram.postAlt", { id: idx + 1 })}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
