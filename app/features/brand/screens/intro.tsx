/**
 * 회사소개 페이지
 * 섹션: 히어로 슬라이더 → CEO 인용 → 경영 철학 → 공식 캐릭터
 */
import type { Route } from "./+types/intro";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { pc1920, pcMin } from "~/core/lib/pc-fluid";
import { cn } from "~/core/lib/utils";

const nanum = "font-[family-name:var(--font-nanum)]";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.brand.intro.metaTitle") };
}

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle },
];

/**
 * 회사소개 장식 스파클(히어로·대표 사진 등). 섹션 라벨은 `SectionPageTitle` + `starVariant="brandIntro"`.
 */
const INTRO_SPARKLE = {
  star: "/intro/Vector.png",
  sparkle1: "/intro/Vector-1.png",
  sparkle2: "/intro/Vector-2.png",
  sparkle3: "/intro/Vector-3.png",
} as const;

/* ── PC 히어로 슬라이더: 슬라이드마다 스파클 3종 위치 분리 ── */
/** 히어로 스파클: 잘림은 화면(뷰포트) 바깥쪽으로 가도록 objectPosition + 좌표 보정 (%는 숫자+단위 래퍼 기준) */
type PcHeroSparkle = {
  src: string;
  size: number;
  style: React.CSSProperties;
};

/** ① 30년의 전통 — 기존과 동일 */
const HERO_SPARKLES_30: PcHeroSparkle[] = [
  {
    src: INTRO_SPARKLE.sparkle2,
    size: 75,
    style: { left: "23%", top: "-20%", objectPosition: "left top" },
  },
  {
    src: INTRO_SPARKLE.star,
    size: 40,
    style: { left: "-3%", bottom: "18%", objectPosition: "left center" },
  },
  {
    src: INTRO_SPARKLE.sparkle1,
    size: 24,
    style: { left: "2.5%", bottom: "7.5%" },
  },
];

/** ② 500 거래처 — 시안에 맞게 left/top/bottom/size 조정 */
const HERO_SPARKLES_500: PcHeroSparkle[] = [
  {
    src: INTRO_SPARKLE.sparkle2,
    size: 75,
    style: { left: "45%", top: "-20%", objectPosition: "left top" },
  },
  {
    src: INTRO_SPARKLE.star,
    size: 40,
    style: { left: "-3%", bottom: "18%", objectPosition: "left center" },
  },
  {
    src: INTRO_SPARKLE.sparkle1,
    size: 25,
    style: { left: "2.5%", bottom: "7.5%" },
  },
];

/** ③ 50 제품 라인업 — 시안에 맞게 left/top/bottom/size 조정 */
const HERO_SPARKLES_50: PcHeroSparkle[] = [
  {
    src: INTRO_SPARKLE.sparkle2,
    size: 75,
    style: { left: "23%", top: "-20%", objectPosition: "left top" },
  },
  {
    src: INTRO_SPARKLE.star,
    size: 40,
    style: { left: "-3%", bottom: "18%", objectPosition: "left center" },
  },
  {
    src: INTRO_SPARKLE.sparkle1,
    size: 24,
    style: { left: "2.5%", bottom: "7.5%" },
  },
];

const SLIDE_COUNT = 3;

/** 경영 철학 카드 — 문구는 `useMemo` + i18n */
const PHILOSOPHY_META = [
  {
    id: "customer" as const,
    image: "/intro/intro_img_01.png",
    bg: "#FFFFFF",
    highlight: false,
  },
  {
    id: "quality" as const,
    image: "/intro/intro_img_02.png",
    bg: "#F0EEDD",
    highlight: false,
  },
  {
    id: "esg" as const,
    image: "/intro/intro_img_03.png",
    bg: "#F0EEDD",
    highlight: false,
  },
  {
    id: "innovation" as const,
    image: "/intro/intro_img_04.png",
    bg: "#FBE28A",
    highlight: true,
  },
  {
    id: "global" as const,
    image: "/intro/intro_img_05.png",
    bg: "#FFFFFF",
    highlight: false,
  },
  {
    id: "partner" as const,
    image: "/intro/intro_img_06.png",
    bg: "#F0EEDD",
    highlight: false,
  },
] as const;

/** 경영이념 카드 — 전용 일러스트 */
const IDEAL_META = [
  { image: "/intro/intro01.png", bg: "#F0EEDD" },
  { image: "/intro/intro02.png", bg: "#FBE28A" },
  { image: "/intro/intro03.png", bg: "#F0EEDD" },
] as const;

/** 사훈 카드 — 전용 일러스트 */
const MOTTO_META = [
  { image: "/intro/intro04.png", bg: "#F0EEDD" },
  { image: "/intro/intro05.png", bg: "#FBE28A" },
  { image: "/intro/intro06.png", bg: "#F0EEDD" },
] as const;

const CHARACTER_META = [
  {
    id: "edi" as const,
    showcaseImage: "/intro/edi01.png",
    sceneImage: "/intro/edi02.png",
    mainBg: "#02633E",
    insetBg: "#F0EEDD",
    accentColor: "#F3BC1E",
    bodyColor: "#003F2B",
    greetingColor: "#003F2B",
    nameColor: "#FFFFFF",
    nameEnColor: "#FFFFFF",
    imageLeft: true,
  },
  {
    id: "pudi" as const,
    showcaseImage: "/intro/puding.png",
    sceneImage: "/intro/pudings.png",
    mainBg: "#F3BC1E",
    insetBg: "#1F2121",
    accentColor: "#F3BC1E",
    bodyColor: "#FFFFFF",
    greetingColor: "#FFFFFF",
    nameColor: "#1F2121",
    nameEnColor: "#1F2121",
    imageLeft: false,
  },
] as const;

/**
 * 푸디 인셋 스토리 카드 — 모바일 시안 (NanumSquareRound / word-wrap)
 * greeting 18/800/25.2 · accent 16/800/24 #F3BC1E · body 14/700/21
 */
const PUDI_INSET_MOBILE = {
  greeting: {
    color: "#FFFFFF",
    fontFamily: "var(--font-nanum), NanumSquareRound, system-ui, sans-serif",
    fontSize: "18px",
    fontWeight: 800,
    lineHeight: "25.2px",
    overflowWrap: "break-word",
  },
  accent: {
    color: "#F3BC1E",
    fontFamily: "var(--font-nanum), NanumSquareRound, system-ui, sans-serif",
    fontSize: "16px",
    fontWeight: 800,
    lineHeight: "24px",
    overflowWrap: "break-word",
  },
  body: {
    color: "#FFFFFF",
    fontFamily: "var(--font-nanum), NanumSquareRound, system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: "21px",
    overflowWrap: "break-word",
  },
} as const satisfies Record<string, import("react").CSSProperties>;

function Sparkle({
  src,
  size = 24,
  style,
}: {
  src: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt=""
      style={{
        position: "absolute",
        width: size,
        height: size,
        objectFit: "contain",
        objectPosition: "center center",
        ...style,
      }}
    />
  );
}

/**
 * 무한 루프 슬라이더 — 클론 기법
 *
 * 배열 구성: [clone-last | slide0 | slide1 | slide2 | clone-first]
 *   index:       0          1       2       3          4
 *
 * - 시작: pos = 1 (첫 번째 실제 슬라이드)
 * - pos가 4 (clone-first)에 도달하면 → 트랜지션 후 animation 없이 pos=1 로 텔레포트
 * - pos가 0 (clone-last)에 도달하면  → 트랜지션 후 animation 없이 pos=3 로 텔레포트
 * 두 슬라이드가 동일하게 생겼으므로 시각적 점프가 없음
 */

/** CEO 무대 시안 (1460×690 기준 픽셀) — 리사이즈 시 동일 비율 유지 */
const CEO_STAGE_W = 1460;
const CEO_STAGE_H = 690;
const CEO_PHOTO_W = 530;
const CEO_PHOTO_H = 650;
const CEO_QUOTE_W = 620;
const CEO_QUOTE_H = 190;
const CEO_BODY_W = 400;
const CEO_BODY_H = 390;
/** 사진 왼쪽으로 겹치는 폭(px @1460) — '다'·닫는 따옴표만 걸치도록 */
const CEO_QUOTE_OVERLAP = 28;
/** 무대(1460) 기준 인용 박스 최소 left — 음수 left로 무대 밖으로 나가는 것 방지, 사진과 겹침 유지 */
const CEO_QUOTE_MIN_LEFT = 70;
/**
 * PC 인용문을 시안 대비 추가로 왼쪽 이동(px @1460 무대 너비, 스케일 동기화).
 * `idealLeft`가 음수라 `qLeft`가 CEO_QUOTE_MIN_LEFT에 붙는 경우가 많은데,
 * 그때는 `max(qLeft - nudge, minLeftStage)`가 항상 minLeftStage가 되어 값 변경이 무시됨 →
 * 계산 시 `relaxedMinLeft = minLeftStage - nudge`로 하한을 같이 낮춤.
 */
const CEO_QUOTE_NUDGE_LEFT_PX = 72;

/**
 * CEO 인사말 — 초상 박스 기준 `absolute` (%·clamp는 사진 영역 기준).
 * PC(`md:block` 섹션) / 모바일 각각 수정.
 */
const CEO_SPARKLES_PC: {
  src: string;
  className: string;
  style: React.CSSProperties;
}[] = [
  {
    src: INTRO_SPARKLE.star,
    className: "pointer-events-none absolute",
    style: {
      left: "-17.5%",
      bottom: "30%",
      width: "clamp(40px, 11.1%, 80px)",
    },
  },
  {
    src: INTRO_SPARKLE.sparkle1,
    className: "pointer-events-none absolute",
    style: {
      left: "-7.5%",
      bottom: "25%",
      width: "clamp(30px, 8.3%, 60px)",
    },
  },
  {
    src: INTRO_SPARKLE.sparkle2,
    className: "pointer-events-none absolute",
    style: {
      top: "0%",
      right: "-10%",
      width: "clamp(60px, 16.6%, 120px)",
    },
  },
];

const CEO_SPARKLES_MOBILE: {
  src: string;
  className: string;
  style: React.CSSProperties;
  ariaHidden?: boolean;
}[] = [
  {
    src: INTRO_SPARKLE.sparkle1,
    className: "pointer-events-none absolute z-20 opacity-90",
    style: {
      left: "-6%",
      bottom: "24%",
      width: "clamp(32px, 10vw, 48px)",
      height: "auto",
    },
    ariaHidden: true,
  },
  {
    src: INTRO_SPARKLE.sparkle2,
    className: "pointer-events-none absolute z-20",
    style: {
      left: "-1%",
      bottom: "9%",
      width: "clamp(18px, 5.5vw, 30px)",
      height: "auto",
    },
    ariaHidden: true,
  },
  {
    src: INTRO_SPARKLE.star,
    className: "pointer-events-none absolute z-20 opacity-90",
    style: {
      top: "0%",
      right: "-10%",
      width: "clamp(44px, 13vw, 76px)",
      height: "auto",
    },
    ariaHidden: true,
  },
];

type CeoLayoutMetrics = {
  photoW: number;
  photoH: number;
  quoteW: number;
  quoteH: number;
  quoteTop: number;
  quoteLeft: number;
  quoteFont: number;
  bodyW: number;
  bodyH: number;
};

export default function BrandIntroScreen(_props: Route.ComponentProps) {
  const { t } = useTranslation();

  const slides = useMemo(
    () => [
      {
        num: "32",
        unit: t("pages.brand.intro.slide30"),
        sparkles: HERO_SPARKLES_30,
      },
      {
        num: "500",
        unit: t("pages.brand.intro.slide500"),
        sparkles: HERO_SPARKLES_500,
      },
      {
        num: "50",
        unit: t("pages.brand.intro.slide50"),
        sparkles: HERO_SPARKLES_50,
      },
    ],
    [t],
  );

  const philosophies = useMemo(() => {
    const copy = (
      id: (typeof PHILOSOPHY_META)[number]["id"],
    ): { category: string; desc: string } => {
      switch (id) {
        case "customer":
          return {
            category: t("pages.brand.intro.phCustomerT"),
            desc: t("pages.brand.intro.phCustomerD"),
          };
        case "quality":
          return {
            category: t("pages.brand.intro.phQualityT"),
            desc: t("pages.brand.intro.phQualityD"),
          };
        case "esg":
          return {
            category: t("pages.brand.intro.phEsgT"),
            desc: t("pages.brand.intro.phEsgD"),
          };
        case "innovation":
          return {
            category: t("pages.brand.intro.phInnovationT"),
            desc: t("pages.brand.intro.phInnovationD"),
          };
        case "global":
          return {
            category: t("pages.brand.intro.phGlobalT"),
            desc: t("pages.brand.intro.phGlobalD"),
          };
        case "partner":
          return {
            category: t("pages.brand.intro.phPartnerT"),
            desc: t("pages.brand.intro.phPartnerD"),
          };
        default: {
          const _x: never = id;
          throw new Error(`unknown philosophy id: ${_x}`);
        }
      }
    };
    return PHILOSOPHY_META.map((row) => ({
      ...row,
      ...copy(row.id),
    }));
  }, [t]);

  const characters = useMemo(
    () =>
      CHARACTER_META.map((c) =>
        c.id === "edi"
          ? {
              ...c,
              name: t("pages.brand.intro.ediName"),
              nameEn: t("pages.brand.intro.ediTagline"),
              greeting: t("pages.brand.intro.ediGreeting"),
              accentText: t("pages.brand.intro.ediAccent"),
              body: t("pages.brand.intro.ediBody"),
            }
          : {
              ...c,
              name: t("pages.brand.intro.pudiName"),
              nameEn: t("pages.brand.intro.pudiTagline"),
              greeting: t("pages.brand.intro.pudiGreeting"),
              accentText: t("pages.brand.intro.pudiAccent"),
              body: t("pages.brand.intro.pudiBody"),
            },
      ),
    [t],
  );

  // ── PC 스크롤 드리븐 서큘러 리빌 상태 ──
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const [gp, setGp] = useState(0); // global progress: 0 to SLIDE_COUNT

  const ceoStageRef = useRef<HTMLDivElement>(null);
  const [ceoLayout, setCeoLayout] = useState<CeoLayoutMetrics | null>(null);

  useLayoutEffect(() => {
    const el = ceoStageRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 80 || h < 80) return;

      const sx = w / CEO_STAGE_W;
      const sy = h / CEO_STAGE_H;
      const photoW = CEO_PHOTO_W * sx;
      const photoH = CEO_PHOTO_H * sy;
      const quoteW = CEO_QUOTE_W * sx;
      const quoteH = CEO_QUOTE_H * sy;
      const bodyW = CEO_BODY_W * sx;
      const bodyH = CEO_BODY_H * sy;
      const quoteTop = 0.06 * h;
      const overlap = CEO_QUOTE_OVERLAP * sx;
      const idealLeft = w / 2 - photoW / 2 - quoteW + overlap;
      const idealRight = idealLeft + quoteW;
      const stageLeft = el.getBoundingClientRect().left;
      const viewportGutter = 12;
      const minLeftFromViewport = viewportGutter - stageLeft;
      const minLeftStage = (CEO_QUOTE_MIN_LEFT / CEO_STAGE_W) * w;

      /* 1) 무대 안 최소 left(시안 70px 스케일) — 음수 left로 1460 영역 밖으로 나가지 않게 */
      let qLeft = Math.max(idealLeft, minLeftStage);
      let qW = quoteW;

      /* 2) 뷰포트 좌측 여백: 필요 시 오른쪽으로 밀되, minLeftStage 미만으로는 내리지 않음 → 너비 축소 */
      if (qLeft < minLeftFromViewport) {
        qLeft = minLeftFromViewport;
        if (qLeft < minLeftStage) {
          qLeft = minLeftStage;
        }
        qW = Math.max(220, idealRight - qLeft);
      }

      const nudgeLeft = (CEO_QUOTE_NUDGE_LEFT_PX / CEO_STAGE_W) * w;
      /* minLeftStage에만 붙어 있을 때는 max(qLeft-nudge, minLeftStage) === minLeftStage라 nudge 무효 → 하한 완화 */
      const relaxedMinLeft = Math.max(0, minLeftStage - nudgeLeft);
      const quoteLeft = Math.max(
        qLeft - nudgeLeft,
        relaxedMinLeft,
        minLeftFromViewport,
      );
      const quoteWFinal = qW;
      const quoteFont = Math.min(72, Math.max(28, quoteWFinal * 0.116));

      setCeoLayout({
        photoW,
        photoH,
        quoteW: quoteWFinal,
        quoteH,
        quoteTop,
        quoteLeft,
        quoteFont,
        bodyW,
        bodyH,
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // PC 스크롤 드리븐 서큘러 리빌
  useEffect(() => {
    const onScroll = () => {
      if (!panelWrapRef.current) return;
      const { top, height } = panelWrapRef.current.getBoundingClientRect();
      const scrolled = -top;
      const totalScrollable = height - window.innerHeight;
      if (scrolled <= 0) {
        setGp(0);
        return;
      }
      if (scrolled >= totalScrollable) {
        setGp(SLIDE_COUNT);
        return;
      }
      setGp((scrolled / totalScrollable) * SLIDE_COUNT);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full bg-[var(--site-chrome-header-bg,#FDFDF5)]">
      <Breadcrumb
        items={[
          { label: t("navigation.mega.company"), href: "/brand/intro" },
          { label: t("navigation.brand.intro") },
        ]}
      />

      {/* ══════════════════════════════════════════
          섹션 1: 스크롤 드리븐 패널 리빌 (PC) / 자동 슬라이더 (모바일)
      ══════════════════════════════════════════ */}

      {/* ── PC: 스크롤 드리븐 서큘러 리빌
          - 오른쪽에서 작게 나타나 → 커지며 중앙으로 이동
          - 이전 아이템은 작아지며 왼쪽으로 밀림
          - 모든 아이템 표시 완료 시 다음 섹션으로
      ── */}
      <div
        ref={panelWrapRef}
        className="hidden md:block"
        style={{ height: `${SLIDE_COUNT * 100}vh` }}
      >
        <section
          className="sticky overflow-hidden"
          style={{
            top: "var(--header-height)",
            height: "calc(100vh - var(--header-height))",
            background: "var(--site-chrome-header-bg, #FDFDF5)",
            display: "flex",
          }}
        >
          {/* 좌: 브랜드 텍스트 — z-index 높여서 퇴장 아이템이 뒤로 사라지게 */}
          <div
            className="relative flex shrink-0 flex-col pl-6 lg:pl-40"
            style={{
              width: "38%",
              height: "100%",

              zIndex: 30,
              paddingTop: "clamp(24px, 4vh, 48px)",
            }}
          >
            <h1
              style={{
                fontSize: pc1920(36, 72),
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#003F2B",
                lineHeight: 1.1,
              }}
            >
              {t("pages.brand.intro.heroBrandLine1")}
              <br />
              {t("pages.brand.intro.heroBrandLine2")}
            </h1>
            <p
              style={{
                marginTop: 20,
                fontSize: pc1920(14, 20),
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "#003F2B",
                lineHeight: 1.65,
                opacity: 0.75,
                whiteSpace: "pre-line",
              }}
            >
              {t("pages.brand.intro.heroSub")}
            </p>
          </div>

          {/* 슬라이드 아이템 — 전체 섹션 기준 absolute, 왼쪽 패널 뒤로 퇴장 가능 */}
          {slides.map((slide, i) => {
            const rel = gp - i;
            const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
            const easeIn3 = (t: number) => t * t * t;
            const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
            const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

            let scale: number;
            let txVw: number;
            let opacity: number;

            // 앵커: left 60% (우측 영역 중앙), txVw=0일 때 활성 위치
            // 오른쪽에서 진입 → 중앙(60vw) → 왼쪽으로 퇴장(Brand Story 패널 뒤)
            const ENTER_FROM = -0.65;
            const ENTER_TX = 65; // 60 + 65 = 125vw (화면 밖 우측)
            const DEPART_TX = -62; // 60 - 62 = -2vw (화면 밖 좌측, 좌 패널 뒤)

            const isLastSlide = i === SLIDE_COUNT - 1;
            // 마지막 슬라이드: 좌측 퇴장 없이 중앙 유지, 스크롤해도 페이드 없음(히어로가 통째로 넘어갈 때까지 표시)
            if (isLastSlide && gp >= SLIDE_COUNT - 1) {
              scale = 1;
              txVw = 0;
              opacity = 1;
            } else if (rel < ENTER_FROM) {
              scale = 0.12;
              txVw = ENTER_TX * 1.3;
              opacity = 0;
            } else if (rel < 0) {
              const t = clamp01((rel - ENTER_FROM) / -ENTER_FROM);
              scale = lerp(0.18, 1.0, easeOut3(t));
              txVw = lerp(ENTER_TX, 0, easeOut3(t));
              opacity = lerp(0.3, 1, t);
            } else if (rel < 1) {
              const t = clamp01(rel);
              scale = lerp(1.0, 0.28, easeIn3(t));
              txVw = lerp(0, DEPART_TX, easeIn3(t));
              // 좌측으로 다 나가기 전에 페이드 완료 (t≈0.88 부근에서 opacity 0)
              const FADE_FROM = 0.38;
              const fadeT = clamp01((t - FADE_FROM) / (0.88 - FADE_FROM));
              opacity = 1 - easeIn3(fadeT);
            } else {
              scale = 0.28;
              txVw = DEPART_TX - (rel - 1) * 8;
              opacity = 0;
            }

            const zIndex = Math.max(1, Math.round(20 - Math.abs(rel) * 8));

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "60%",
                  transform: `translateX(calc(-50% + ${txVw}vw)) translateY(-50%) scale(${scale})`,
                  opacity,
                  zIndex,
                  willChange: "transform, opacity",
                }}
              >
                {/* 스파클 + 숫자+단위 래퍼 (스파클 % 포지션 기준점) */}
                <div style={{ position: "relative", display: "inline-block" }}>
                  {slide.sparkles.map((sp, si) => (
                    <Sparkle
                      key={si}
                      src={sp.src}
                      size={sp.size}
                      style={{ ...sp.style, zIndex: 5 }}
                    />
                  ))}

                  {/* 숫자(좌) + 단위(우) — 가로 배치, baseline 정렬 */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "0.18em",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        position: "relative",
                        fontSize: pc1920(96, 340),
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        color: "#003F2B",
                        lineHeight: 0.9,
                      }}
                    >
                      {slide.num}
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: "-0.52em",
                          fontSize: pc1920(28, 100),
                          fontWeight: 800,
                          letterSpacing: "-0.04em",
                          color: "#003F2B",
                          lineHeight: 1,
                        }}
                      >
                        +
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: pc1920(18, 60),
                        fontWeight: 700,
                        letterSpacing: "-0.03em",
                        color: "#003F2B",
                        lineHeight: 1,
                        paddingBottom: "0.12em",
                        paddingLeft: "0.4em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {slide.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* ── 모바일 히어로: 시안 비율(clamp·vw·%), 좌우 패딩 안에서 전폭 유동 ── */}
      <section className="pb-10 md:hidden md:pb-0">
        <div className="flex w-full items-center justify-start px-3 py-6">
          <div className="flex w-full flex-col items-end gap-[clamp(28px,9vw,44px)]">
            <div className="flex w-full flex-col items-start gap-2.5 self-stretch">
              <h1
                className={cn(
                  nanum,
                  "self-stretch text-[clamp(32px,10.67vw,40px)] leading-[clamp(40px,12.8vw,48px)] font-extrabold text-[#003F2B]",
                )}
              >
                {t("pages.brand.intro.heroBrandLine1")}
                <br />
                {t("pages.brand.intro.heroBrandLine2")}
              </h1>
              <p
                className={cn(
                  nanum,
                  "self-stretch text-[clamp(13px,3.73vw,14px)] leading-[clamp(20px,5.97vw,22.4px)] font-bold whitespace-pre-line text-[#003F2B]",
                )}
              >
                {t("pages.brand.intro.heroSub")}
              </p>
            </div>

            <div className="relative flex w-full flex-col items-start gap-[clamp(28px,9vw,44px)] self-stretch">
              <img
                src={INTRO_SPARKLE.sparkle1}
                alt=""
                className="pointer-events-none absolute top-[clamp(140px,55.47vw,208px)] -left-[min(44px,11.7vw)] h-[min(70px,18.67vw)] w-[min(70px,18.67vw)] object-contain object-left opacity-90 select-none"
                aria-hidden
              />
              <img
                src={INTRO_SPARKLE.star}
                alt=""
                className="pointer-events-none absolute -top-[min(110px,29.3vw)] left-[55.1%] h-[min(225px,60vw)] w-[min(225px,60vw)] max-w-none object-contain object-right object-top opacity-90 select-none"
                aria-hidden
              />
              <img
                src={INTRO_SPARKLE.sparkle2}
                alt=""
                className="pointer-events-none absolute top-[clamp(140px,55.47vw,208px)] left-[67%] h-[min(40px,10.67vw)] w-[min(40px,10.67vw)] object-contain select-none"
                aria-hidden
              />

              {slides.map((slide, i) => (
                <div
                  key={`${slide.num}-${slide.unit}`}
                  className={cn(
                    "inline-flex w-full gap-8 self-stretch",
                    i === 0 && "items-center justify-start",
                    i === 1 && "items-start justify-start",
                    i === 2 && "items-center justify-center",
                  )}
                >
                  <div
                    className={cn(
                      "flex min-w-0 flex-1 flex-col",
                      i === 0 && "items-center",
                      i === 1 && "items-start",
                      i === 2 && "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "inline-flex items-start gap-[4.4px]",
                        i === 2
                          ? "justify-center self-stretch"
                          : "w-full justify-start self-stretch",
                      )}
                    >
                      <span
                        className={cn(
                          nanum,
                          "shrink-0 text-[clamp(64px,26.67vw,100px)] leading-none font-extrabold text-[#003F2B]",
                        )}
                      >
                        {slide.num}
                      </span>
                      <div
                        className={cn(
                          "flex h-[min(100px,26.67vw)] min-h-[3.5rem] shrink-0 flex-col justify-between self-stretch pb-0.5",
                          i === 2
                            ? "min-w-0 flex-1 items-start"
                            : "w-[min(76px,20.27vw)] min-w-[3.25rem] items-start",
                        )}
                      >
                        <span
                          className={cn(
                            nanum,
                            "text-[clamp(28px,10.67vw,40px)] leading-none font-extrabold text-[#003F2B]",
                          )}
                        >
                          +
                        </span>
                        <span
                          className={cn(
                            nanum,
                            "text-[clamp(14px,4.27vw,16px)] leading-tight font-bold text-[#003F2B]",
                          )}
                        >
                          {slide.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 섹션 2: CEO 인사말 (시안: 1600 래퍼 / 1460×690 무대 / 620×190·530×650·400×390) ══ */}
      <section className="hidden py-10 md:block md:py-14">
        <PageContentMax>
          <SectionPageTitle
            as="div"
            preset="brandIntro"
            starVariant="brandIntro"
            className="mb-6 md:mb-7"
            titleStyle={{
              fontSize: pc1920(14, 28),
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "#1F2121",
            }}
          >
            {t("pages.brand.intro.ceoTitle")}
          </SectionPageTitle>

          <div className="relative mx-auto w-full max-w-[var(--pc-stage-max)] overflow-visible">
            <div
              className="relative w-full overflow-visible"
              style={{
                height: 0,
                paddingBottom: `${(690 / 1460) * 100}%`,
              }}
            >
              <div
                ref={ceoStageRef}
                className="absolute inset-0 overflow-visible"
              >
                {/* 대표 530×650 — 무대 중심, 측정 픽셀(1460:690 비율 스케일) */}
                <div
                  className="absolute top-1/2 left-1/2 z-[5] -translate-x-1/2 -translate-y-1/2"
                  style={
                    ceoLayout
                      ? {
                          width: ceoLayout.photoW,
                          height: ceoLayout.photoH,
                        }
                      : {
                          width: `${(CEO_PHOTO_W / CEO_STAGE_W) * 100}%`,
                          height: `${(CEO_PHOTO_H / CEO_STAGE_H) * 100}%`,
                        }
                  }
                >
                  <div className="relative h-full w-full overflow-hidden">
                    <img
                      src="/intro/president_img.png"
                      alt={t("pages.brand.intro.ceoPresidentAlt")}
                      className="block h-full w-full object-cover"
                    />
                  </div>
                  {CEO_SPARKLES_PC.map((sp, i) => (
                    <img
                      key={i}
                      src={sp.src}
                      alt=""
                      className={sp.className}
                      style={sp.style}
                    />
                  ))}
                </div>

                {/* 좌상 620×190 — 이상적 left + 뷰포트( html overflow-x ) 안전 보정 */}
                <div
                  className="pointer-events-none absolute z-10 flex items-center justify-center overflow-visible"
                  style={
                    ceoLayout
                      ? {
                          left: ceoLayout.quoteLeft,
                          top: ceoLayout.quoteTop,
                          width: ceoLayout.quoteW,
                          height: ceoLayout.quoteH,
                        }
                      : {
                          left: `${(CEO_QUOTE_MIN_LEFT / CEO_STAGE_W) * 100}%`,
                          top: "6%",
                          width: `${(CEO_QUOTE_W / CEO_STAGE_W) * 100}%`,
                          height: `${(CEO_QUOTE_H / CEO_STAGE_H) * 100}%`,
                        }
                  }
                >
                  <blockquote
                    style={{
                      margin: 0,
                      width: "100%",
                      fontSize: ceoLayout
                        ? ceoLayout.quoteFont
                        : pc1920(28, 72),
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      lineHeight: ceoLayout
                        ? `${ceoLayout.quoteFont * 1.3}px`
                        : pc1920(36, 93.6),
                      color: "#003F2B",
                      textAlign: "center",
                      wordBreak: "keep-all",
                      overflow: "visible",
                    }}
                  >
                    <>
                      {t("pages.brand.intro.ceoQuote1")}
                      <br />
                      {t("pages.brand.intro.ceoQuote2")}
                    </>
                  </blockquote>
                </div>

                {/* 우측 본문 — 고정 높이/스크롤 제거, 내용 길이에 맞춰 상단 정렬로 표시 */}
                <div
                  className="absolute top-0 right-0 z-[6] flex flex-col gap-3 overflow-visible text-left"
                  style={
                    ceoLayout
                      ? { width: ceoLayout.bodyW }
                      : { width: `${(CEO_BODY_W / CEO_STAGE_W) * 100}%` }
                  }
                >
                  <div
                    className="pt-0.5 pr-0.5"
                    style={{
                      color: "#555555",
                      fontSize: pc1920(11, 16),
                      fontWeight: 500,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.5,
                    }}
                  >
                    <p style={{ fontWeight: 800, color: "#1F2121" }}>
                      {t("pages.brand.intro.ceoBody1")}
                    </p>
                    <p style={{ marginTop: 16 }}>
                      {t("pages.brand.intro.ceoBody2")}
                    </p>
                    <p style={{ marginTop: 16 }}>
                      {t("pages.brand.intro.ceoBody3")}
                    </p>
                    <p style={{ marginTop: 16 }}>
                      {t("pages.brand.intro.ceoBody4")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      style={{
                        fontSize: pc1920(11, 18),
                        fontWeight: 400,
                        letterSpacing: "-0.04em",
                        lineHeight: 1.5,
                        color: "#003F2B",
                      }}
                    >
                      {t("pages.brand.intro.ceoRole")}
                    </span>
                    <img
                      src="/intro/president_sign.png"
                      alt={t("pages.brand.intro.ceoName")}
                      style={{ height: pc1920(52, 80), width: "auto" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* 모바일 CEO — 인용은 초상 상단에 겹침, 스파클은 초상 영역 기준 배치 */}
      <section className="md:hidden">
        <div className="flex w-full flex-col items-start gap-0 px-3 pt-5 pb-6">
          <SectionPageTitle
            as="div"
            preset="none"
            starVariant="brandIntro"
            className="flex w-full items-center gap-[14px] pb-5"
            markClassName="h-[21px] w-[21px]"
            titleClassName={cn(
              nanum,
              "min-w-0 flex-1 text-[18px] leading-[30px] font-extrabold text-[#1F2121]",
            )}
          >
            {t("pages.brand.intro.ceoTitle")}
          </SectionPageTitle>

          {/* 타이틀(아래 가장자리) ↔ 인용문 블록 영역: 시안 40px */}
          <div className="relative mx-auto mt-[60px] w-full max-w-[min(320px,88vw)] overflow-visible pt-[clamp(20px,5.5vw,36px)]">
            <div className="relative mx-auto aspect-[530/650] w-full max-w-[280px] overflow-visible">
              <blockquote
                className={cn(
                  nanum,
                  "absolute bottom-full left-1/2 z-30 w-[min(108%,calc(100%+24px))] max-w-none -translate-x-1/2 translate-y-[min(28%,2.25rem)] text-center text-[clamp(20px,6.4vw,28px)] leading-[1.28] font-extrabold text-[#003F2B]",
                )}
              >
                &quot;{t("pages.brand.intro.ceoQuote1")} <br />
                {t("pages.brand.intro.ceoQuote2")}&quot;
              </blockquote>

              <div className="relative z-[5] h-full w-full overflow-hidden">
                <img
                  src="/intro/president_img.png"
                  alt={t("pages.brand.intro.ceoPresidentAlt")}
                  className="block h-full w-full object-cover"
                />
              </div>

              {CEO_SPARKLES_MOBILE.map((sp, i) => (
                <img
                  key={i}
                  src={sp.src}
                  alt=""
                  className={sp.className}
                  style={sp.style}
                  aria-hidden={sp.ariaHidden}
                />
              ))}
            </div>
          </div>

          <div
            className={cn(
              nanum,
              "mt-[40px] flex w-full flex-col items-start gap-4 self-stretch",
            )}
          >
            <p className="text-[clamp(13px,3.73vw,14px)] leading-[1.5] font-bold whitespace-pre-line text-[#1F2121]">
              {t("pages.brand.intro.ceoBodyMobile")}
            </p>
            <div className="inline-flex items-center gap-3 self-stretch">
              <span className="text-base leading-6 font-normal text-[#003F2B]">
                {t("pages.brand.intro.ceoRole")}
              </span>
              <img
                src="/intro/president_sign.png"
                alt={t("pages.brand.intro.ceoName")}
                className="h-16 w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══ 섹션 2-1: 경영이념 (PC) — 좌 타이틀 / 우 카드 ══ */}
      <section className="hidden md:block" style={{ padding: `${pc1920(40, 90)} 0` }}>
        <PageContentMax>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: pc1920(32, 80),
            }}
          >
            {/* 좌측: 레이블 + 헤드라인 */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>
              <SectionPageTitle
                as="div"
                preset="brandIntro"
                starVariant="brandIntro"
                className="mb-5"
                rootStyle={{ gap: 8 }}
                titleStyle={{
                  fontSize: pc1920(14, 28),
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#1F2121",
                }}
              >
                {t("pages.brand.intro.philTitle")}
              </SectionPageTitle>
              <h2
                style={{
                  fontSize: pc1920(22, 56),
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: pc1920(30, 72.8),
                  color: "#003F2B",
                  whiteSpace: "pre-line",
                }}
              >
                {t("pages.brand.intro.philHeadline")}
              </h2>
            </div>

            {/* 우측: 3카드 (텍스트 + 이미지) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, min(280px, calc(280 * 100vw / 1920))))",
                gap: pc1920(4, 8),
                flexShrink: 0,
              }}
            >
              {[
                {
                  num: "01",
                  text: t("pages.brand.intro.philItem1"),
                  image: IDEAL_META[0].image,
                  bg: IDEAL_META[0].bg,
                },
                {
                  num: "02",
                  text: t("pages.brand.intro.philItem2"),
                  image: IDEAL_META[1].image,
                  bg: IDEAL_META[1].bg,
                },
                {
                  num: "03",
                  text: t("pages.brand.intro.philItem3"),
                  image: IDEAL_META[2].image,
                  bg: IDEAL_META[2].bg,
                },
              ].map(({ num, text, image, bg }) => (
                <div
                  key={num}
                  style={{
                    backgroundColor: bg,
                    width: "100%",
                    height: pc1920(230, 420),
                    borderRadius: pc1920(24, 40),
                    display: "flex",
                    flexDirection: "column",
                    padding: pc1920(20, 36),
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: pc1920(8, 14),
                    }}
                  >
                    <span
                      style={{
                        fontSize: pc1920(12, 18),
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        color: "#1F7A57",
                      }}
                    >
                      {num}
                    </span>
                    <p
                      style={{
                        fontSize: pc1920(15, 26),
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: pc1920(21, 36),
                        color: "#1F2121",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {text}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <img
                      src={image}
                      alt=""
                      style={{
                        width: "100%",
                        height: pc1920(118, 210),
                        objectFit: "contain",
                        mixBlendMode: "darken",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ══ 섹션 2-2: 사훈 (PC) — 좌 카드 / 우 타이틀 ══ */}
      <section className="hidden md:block" style={{ padding: `${pc1920(40, 90)} 0` }}>
        <PageContentMax>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: pc1920(32, 80),
            }}
          >
            {/* 좌측: 3카드 (텍스트 + 이미지) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, min(280px, calc(280 * 100vw / 1920))))",
                gap: pc1920(4, 8),
                flexShrink: 0,
              }}
            >
              {[
                {
                  num: "01",
                  text: t("pages.brand.intro.mottoItem1"),
                  image: MOTTO_META[0].image,
                  bg: MOTTO_META[0].bg,
                },
                {
                  num: "02",
                  text: t("pages.brand.intro.mottoItem2"),
                  image: MOTTO_META[1].image,
                  bg: MOTTO_META[1].bg,
                },
                {
                  num: "03",
                  text: t("pages.brand.intro.mottoItem3"),
                  image: MOTTO_META[2].image,
                  bg: MOTTO_META[2].bg,
                },
              ].map(({ num, text, image, bg }) => (
                <div
                  key={num}
                  style={{
                    backgroundColor: bg,
                    width: "100%",
                    height: pc1920(230, 420),
                    borderRadius: pc1920(24, 40),
                    display: "flex",
                    flexDirection: "column",
                    padding: pc1920(20, 36),
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: pc1920(8, 14),
                    }}
                  >
                    <span
                      style={{
                        fontSize: pc1920(12, 18),
                        fontWeight: 800,
                        letterSpacing: "0.04em",
                        color: "#1F7A57",
                      }}
                    >
                      {num}
                    </span>
                    <p
                      style={{
                        fontSize: pc1920(15, 26),
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        lineHeight: pc1920(21, 36),
                        color: "#1F2121",
                        whiteSpace: "pre-line",
                      }}
                    >
                      {text}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <img
                      src={image}
                      alt=""
                      style={{
                        width: "100%",
                        height: pc1920(118, 210),
                        objectFit: "contain",
                        mixBlendMode: "darken",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 우측: 레이블 + 헤드라인 (우측 정렬) */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                paddingTop: 8,
                textAlign: "right",
              }}
            >
              <SectionPageTitle
                as="div"
                preset="brandIntro"
                starVariant="brandIntro"
                className="mb-5"
                rootStyle={{ gap: 8, justifyContent: "flex-end" }}
                titleStyle={{
                  fontSize: pc1920(14, 28),
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#1F2121",
                }}
              >
                {t("pages.brand.intro.mottoTitle")}
              </SectionPageTitle>
              <h2
                style={{
                  fontSize: pc1920(22, 56),
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: pc1920(30, 72.8),
                  color: "#003F2B",
                  whiteSpace: "pre-line",
                }}
              >
                {t("pages.brand.intro.mottoHeadline")}
              </h2>
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* ══ 섹션 2-1·2-2: 경영이념 · 사훈 (모바일) ══ */}
      <section className="px-3 py-7 md:hidden">
        <div className="flex flex-col gap-8">
          {/* 경영이념 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start gap-2">
              <SectionPageTitle
                as="div"
                preset="none"
                starVariant="brandIntro"
                className="inline-flex w-full items-center gap-[14px]"
                markClassName="h-[21px] w-[21px]"
                titleClassName={cn(
                  nanum,
                  "min-w-0 flex-1 text-[18px] leading-[30px] font-extrabold text-[#1F2121]",
                )}
              >
                {t("pages.brand.intro.philTitle")}
              </SectionPageTitle>
              <h2
                className={cn(
                  nanum,
                  "text-[clamp(18px,5.33vw,20px)] leading-[1.3] font-extrabold whitespace-pre-line text-[#003F2B]",
                )}
              >
                {t("pages.brand.intro.philHeadline")}
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  num: "01",
                  text: t("pages.brand.intro.philItem1"),
                  image: IDEAL_META[0].image,
                  bg: IDEAL_META[0].bg,
                },
                {
                  num: "02",
                  text: t("pages.brand.intro.philItem2"),
                  image: IDEAL_META[1].image,
                  bg: IDEAL_META[1].bg,
                },
                {
                  num: "03",
                  text: t("pages.brand.intro.philItem3"),
                  image: IDEAL_META[2].image,
                  bg: IDEAL_META[2].bg,
                },
              ].map(({ num, text, image, bg }) => (
                <div
                  key={num}
                  className="flex items-center justify-between gap-3 overflow-hidden rounded-[20px] p-5"
                  style={{ backgroundColor: bg }}
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span
                      className={cn(
                        nanum,
                        "text-[13px] font-extrabold tracking-[0.04em] text-[#1F7A57]",
                      )}
                    >
                      {num}
                    </span>
                    <p
                      className={cn(
                        nanum,
                        "text-[16px] leading-[24px] font-extrabold break-words whitespace-pre-line text-[#1F2121]",
                      )}
                    >
                      {text}
                    </p>
                  </div>
                  <img
                    src={image}
                    alt=""
                    className="h-[84px] w-[84px] shrink-0 object-contain mix-blend-darken"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 사훈 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start gap-2">
              <SectionPageTitle
                as="div"
                preset="none"
                starVariant="brandIntro"
                className="inline-flex w-full items-center gap-[14px]"
                markClassName="h-[21px] w-[21px]"
                titleClassName={cn(
                  nanum,
                  "min-w-0 flex-1 text-[18px] leading-[30px] font-extrabold text-[#1F2121]",
                )}
              >
                {t("pages.brand.intro.mottoTitle")}
              </SectionPageTitle>
              <h2
                className={cn(
                  nanum,
                  "text-[clamp(18px,5.33vw,20px)] leading-[1.3] font-extrabold whitespace-pre-line text-[#003F2B]",
                )}
              >
                {t("pages.brand.intro.mottoHeadline")}
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  num: "01",
                  text: t("pages.brand.intro.mottoItem1"),
                  image: MOTTO_META[0].image,
                  bg: MOTTO_META[0].bg,
                },
                {
                  num: "02",
                  text: t("pages.brand.intro.mottoItem2"),
                  image: MOTTO_META[1].image,
                  bg: MOTTO_META[1].bg,
                },
                {
                  num: "03",
                  text: t("pages.brand.intro.mottoItem3"),
                  image: MOTTO_META[2].image,
                  bg: MOTTO_META[2].bg,
                },
              ].map(({ num, text, image, bg }) => (
                <div
                  key={num}
                  className="flex items-center justify-between gap-3 overflow-hidden rounded-[20px] p-5"
                  style={{ backgroundColor: bg }}
                >
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span
                      className={cn(
                        nanum,
                        "text-[13px] font-extrabold tracking-[0.04em] text-[#1F7A57]",
                      )}
                    >
                      {num}
                    </span>
                    <p
                      className={cn(
                        nanum,
                        "text-[16px] leading-[24px] font-extrabold break-words whitespace-pre-line text-[#1F2121]",
                      )}
                    >
                      {text}
                    </p>
                  </div>
                  <img
                    src={image}
                    alt=""
                    className="h-[84px] w-[84px] shrink-0 object-contain mix-blend-darken"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 섹션 3: 경영 철학 ══
          1920px 기준:
            섹션 bg: #EAE3C9, 상단 border-radius 40px
            래퍼: max-w-1680px, px-10(40px 양측) → 내부 1600px
            좌측 텍스트: flex-1(≈608px)
            갭: 80px
            카드 그리드: 452×2+8 = 912px, 카드 높이 520px, 간격 8px
      ══ */}
      <section
        className="hidden md:block"
        style={{
          backgroundColor: "#EAE3C9",
          borderRadius: `${pc1920(32, 60)} ${pc1920(32, 60)} 0 0`,
          marginBottom: 40,
        }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: "var(--pc-w-1680)",
            padding: `${pc1920(40, 80)} ${pc1920(20, 40)}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: pc1920(32, 80),
            }}
          >
            {/* 좌측: 레이블 + 제목 */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>
              <SectionPageTitle
                as="div"
                preset="brandIntro"
                starVariant="brandIntro"
                className="mb-5"
                rootStyle={{ gap: 8 }}
                titleStyle={{
                  fontSize: pc1920(14, 28),
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  color: "#1F2121",
                }}
              >
                {t("pages.brand.intro.philosophyLabel")}
              </SectionPageTitle>
              <h2
                style={{
                  fontSize: pc1920(22, 56),
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: pc1920(30, 72.8),
                  color: "#003F2B",
                  whiteSpace: "pre-line",
                }}
              >
                {t("pages.brand.intro.philosophyHeadline")}
              </h2>
            </div>

            {/* 우측: 2컬럼 × 3행 카드 (452×520 시안, 1920 비율 스케일) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, min(452px, calc(452 * 100vw / 1920))))",
                gap: pc1920(4, 8),
                flexShrink: 0,
              }}
            >
              {philosophies.map(({ id, category, desc, image, bg }) => (
                <div
                  key={id}
                  style={{
                    backgroundColor: bg,
                    width: "100%",
                    height: pc1920(280, 520),
                    borderRadius: pc1920(24, 40),
                    display: "flex",
                    flexDirection: "column",
                    padding: pc1920(20, 40),
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: pc1920(12, 20),
                      alignSelf: "stretch",
                    }}
                  >
                    <span
                      style={{
                        fontSize: pc1920(11, 16),
                        fontWeight: 900,
                        letterSpacing: "-0.04em",
                        lineHeight: pc1920(16, 24),
                        color: "#003F2B",
                      }}
                    >
                      {category}
                    </span>
                    <p
                      style={{
                        fontSize: pc1920(14, 28),
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                        lineHeight: pc1920(21, 42),
                        color: "#1F2121",
                      }}
                    >
                      {desc}
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <img
                      src={image}
                      alt={category}
                      style={{
                        width: pc1920(120, 250),
                        height: pc1920(120, 250),
                        objectFit: "contain",
                        mixBlendMode: "darken",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 경영 철학 — 모바일: 2×3 그리드 · 하단 40px 후 캐릭터 섹션 */}
      <section className="flex flex-col items-center overflow-hidden rounded-t-[24px] bg-[#EAE3C9] px-3 pt-6 pb-[40px] md:hidden">
        <div className="flex w-full flex-col items-stretch gap-4 self-stretch">
          <div className="flex flex-col items-start gap-2 self-stretch">
            <SectionPageTitle
              as="div"
              preset="none"
              starVariant="brandIntro"
              className="inline-flex w-full items-center gap-[14px] self-stretch"
              markClassName="h-[21px] w-[21px]"
              titleClassName={cn(
                nanum,
                "min-w-0 flex-1 text-[18px] leading-[30px] font-extrabold text-[#1F2121]",
              )}
            >
              {t("pages.brand.intro.philosophyLabel")}
            </SectionPageTitle>
            <h2
              className={cn(
                nanum,
                "self-stretch text-[clamp(18px,5.33vw,20px)] leading-[1.3] font-extrabold whitespace-pre-line text-[#003F2B]",
              )}
            >
              {t("pages.brand.intro.philosophyHeadlineMobile")}
            </h2>
          </div>

          <div className="grid w-full grid-cols-2 items-stretch gap-[clamp(6px,2.13vw,8px)] self-stretch">
            {PHILOSOPHY_META.map(({ id, bg }) => {
              const card = philosophies.find((p) => p.id === id);
              if (!card) return null;
              const { category, desc, image } = card;
              return (
                <div
                  key={id}
                  className={cn(
                    nanum,
                    "flex h-full min-h-[200px] w-full flex-col items-end justify-start gap-5 overflow-hidden rounded-[20px] p-5",
                  )}
                  style={{ backgroundColor: bg }}
                >
                  <div className="flex w-full flex-col items-start gap-3 self-stretch">
                    <h3
                      className={cn(
                        nanum,
                        "text-[18px] leading-[27px] font-extrabold break-words text-[#003F2B]",
                      )}
                    >
                      {category}
                    </h3>
                    <p
                      className={cn(
                        nanum,
                        "w-full text-[14px] leading-[21px] font-bold break-words text-[#1F2121]",
                      )}
                    >
                      {desc}
                    </p>
                  </div>
                  <img
                    src={image}
                    alt=""
                    width={90}
                    height={90}
                    className="mt-auto h-[90px] w-[90px] shrink-0 object-contain mix-blend-darken"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ 섹션 4: 공식 캐릭터 (PC) ══ */}
      <section
        className="hidden md:block"
        style={{ padding: `${pc1920(48, 100)} 0` }}
      >
        <div
          style={{
            maxWidth: "var(--pc-w-1680)",
            margin: "0 auto",
            padding: `0 ${pc1920(20, 40)}`,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: pc1920(32, 64) }}>
            <h2
              style={{
                fontSize: pc1920(32, 60),
                fontWeight: 800,
                color: "#003F2B",
                letterSpacing: "-0.04em",
                lineHeight: pc1920(44, 84),
                marginBottom: pc1920(6, 10),
              }}
            >
              {t("pages.brand.intro.charTitle")}
            </h2>
            <p
              style={{
                fontSize: pc1920(12, 16),
                fontWeight: 400,
                color: "#003F2B",
                lineHeight: pc1920(14, 19.2),
                letterSpacing: "-0.02em",
              }}
            >
              {t("pages.brand.intro.charSubtitle")}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: pc1920(16, 30),
            }}
          >
            {characters.map(
              ({
                id,
                name,
                nameEn,
                showcaseImage,
                sceneImage,
                mainBg,
                insetBg,
                greeting,
                accentText,
                accentColor,
                body,
                bodyColor,
                greetingColor,
                nameColor,
                nameEnColor,
                imageLeft,
              }) => (
                <div
                  key={id}
                  style={{
                    backgroundColor: mainBg,
                    borderRadius: pc1920(24, 40),
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: imageLeft ? "row" : "row-reverse",
                    alignItems: "center",
                    gap: pc1920(12, 20),
                    padding: pc1920(20, 40),
                    minHeight: pc1920(380, 680),
                  }}
                >
                  <div
                    style={{
                      flex: "1 1 0",
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: pc1920(10, 20),
                    }}
                  >
                    <img
                      src={showcaseImage}
                      alt={name}
                      style={{
                        height: pc1920(180, 380),
                        width: "auto",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                    <p
                      style={{
                        fontSize: pc1920(18, 32),
                        fontWeight: 800,
                        color: nameColor,
                        letterSpacing: "-0.04em",
                        lineHeight: pc1920(26, 48),
                        textAlign: "center",
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontSize: pc1920(12, 16),
                        fontWeight: 800,
                        color: nameEnColor,
                        lineHeight: pc1920(16, 24),
                        textAlign: "center",
                      }}
                    >
                      {nameEn}
                    </p>
                  </div>

                  <div
                    style={{
                      flex: `0 0 ${pcMin(692)}`,
                      maxWidth: "100%",
                      alignSelf: "stretch",
                      display: "flex",
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: insetBg,
                        borderRadius: pc1920(24, 40),
                        flex: 1,
                        padding: pc1920(20, 40),
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        gap: pc1920(16, 30),
                      }}
                    >
                      <img
                        src={sceneImage}
                        alt={t("pages.brand.intro.charSceneAlt", { name })}
                        style={{
                          height:
                            id === "pudi" ? pc1920(32, 69) : pc1920(48, 126),
                          width: "auto",
                          maxWidth: "100%",
                          objectFit: "contain",
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: pc1920(8, 12),
                          width: "100%",
                          alignItems: "center",
                        }}
                      >
                        <p
                          style={
                            id === "pudi"
                              ? {
                                  fontFamily:
                                    "var(--font-nanum), NanumSquareRound, sans-serif",
                                  fontSize: pc1920(16, 32),
                                  fontWeight: 800,
                                  color: "#FFFFFF",
                                  lineHeight: pc1920(22, 44.8),
                                  whiteSpace: "pre-line",
                                  overflowWrap: "break-word",
                                }
                              : {
                                  fontSize: pc1920(16, 32),
                                  fontWeight: 800,
                                  color: greetingColor,
                                  letterSpacing: "-0.04em",
                                  lineHeight: pc1920(22, 44.8),
                                  whiteSpace: "pre-line",
                                }
                          }
                        >
                          {greeting}
                        </p>
                        <p
                          style={
                            id === "pudi"
                              ? {
                                  fontFamily:
                                    "var(--font-nanum), NanumSquareRound, sans-serif",
                                  fontSize: pc1920(12, 18),
                                  fontWeight: 800,
                                  color: "#F3BC1E",
                                  lineHeight: pc1920(16, 27),
                                  whiteSpace: "pre-line",
                                  overflowWrap: "break-word",
                                }
                              : {
                                  fontSize: pc1920(12, 18),
                                  fontWeight: 800,
                                  color: accentColor,
                                  letterSpacing: "-0.04em",
                                  lineHeight: pc1920(16, 27),
                                }
                          }
                        >
                          {accentText}
                        </p>
                        <p
                          style={
                            id === "pudi"
                              ? {
                                  fontFamily:
                                    "var(--font-nanum), NanumSquareRound, sans-serif",
                                  fontSize: pc1920(11, 14),
                                  fontWeight: 700,
                                  color: "#FFFFFF",
                                  lineHeight: pc1920(16, 21),
                                  whiteSpace: "pre-line",
                                  overflowWrap: "break-word",
                                  maxWidth: pcMin(422),
                                }
                              : {
                                  fontSize: pc1920(11, 14),
                                  fontWeight: 700,
                                  letterSpacing: "-0.04em",
                                  color: bodyColor,
                                  lineHeight: pc1920(16, 21),
                                  whiteSpace: "pre-line",
                                  maxWidth: pcMin(422),
                                }
                          }
                        >
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ══ 섹션 4: 공식 캐릭터 (모바일) — 경영철학과 간격 40px(철학 pb) · 전폭 유동 ══ */}
      <section className="pt-10 md:hidden">
        <div className="flex w-full flex-col px-3 pt-0 pb-6">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col items-start gap-1">
              <h2
                className={cn(
                  nanum,
                  "w-full text-[20px] leading-[26px] font-extrabold text-[#003F2B]",
                )}
              >
                {t("pages.brand.intro.charTitle")}
              </h2>
              <p
                className={cn(
                  nanum,
                  "w-full text-[14px] leading-[18.2px] font-normal text-[#003F2B]",
                )}
              >
                {t("pages.brand.intro.charSubtitle")}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              {characters.map(
                ({
                  id,
                  name,
                  nameEn,
                  showcaseImage,
                  sceneImage,
                  mainBg,
                  insetBg,
                  greeting,
                  accentText,
                  accentColor,
                  body,
                  bodyColor,
                  greetingColor,
                  nameColor,
                  nameEnColor,
                }) => (
                  <div
                    key={id}
                    className="flex flex-col items-center overflow-hidden rounded-[20px] px-3 pt-4 pb-3"
                    style={{ backgroundColor: mainBg }}
                  >
                    <div className="flex w-full flex-col items-center gap-3">
                      <div className="flex h-[min(200px,54vw)] w-full items-center justify-center px-0.5">
                        <img
                          src={showcaseImage}
                          alt={name}
                          className="max-h-full w-auto max-w-[min(240px,88%)] object-contain"
                        />
                      </div>
                      <div className="flex w-full flex-col items-center gap-0.5">
                        <p
                          className={cn(
                            nanum,
                            "text-center text-[20px] leading-[30px] font-extrabold",
                          )}
                          style={{ color: nameColor }}
                        >
                          {name}
                        </p>
                        <p
                          className={cn(
                            nanum,
                            "text-center text-[14px] leading-[21px] font-extrabold",
                          )}
                          style={{ color: nameEnColor }}
                        >
                          {nameEn}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-2 flex w-full flex-col items-center gap-3 rounded-2xl px-3 py-12"
                      style={{ backgroundColor: insetBg }}
                    >
                      <img
                        src={sceneImage}
                        alt=""
                        className={cn(
                          "h-auto w-auto max-w-full object-contain",
                          /* 푸디 3캐릭터 행 — 모바일 시안 높이 ≈40px 스케일 (과대 시 이 값만 조절) */
                          id === "pudi"
                            ? "max-h-[min(42px,11.2vw)]"
                            : "max-h-[min(112px,30vw)]",
                        )}
                        aria-hidden
                      />
                      <div className="flex w-full flex-col items-center gap-2.5">
                        <p
                          className={cn(
                            nanum,
                            "text-center break-words whitespace-pre-line",
                            id !== "pudi" &&
                              "text-[20px] leading-[1.35] font-extrabold",
                          )}
                          style={
                            id === "pudi"
                              ? PUDI_INSET_MOBILE.greeting
                              : { color: greetingColor }
                          }
                        >
                          {greeting}
                        </p>
                        <p
                          className={cn(
                            nanum,
                            "text-center break-words whitespace-pre-line",
                            id !== "pudi" &&
                              "text-base leading-6 font-extrabold",
                          )}
                          style={
                            id === "pudi"
                              ? PUDI_INSET_MOBILE.accent
                              : { color: accentColor }
                          }
                        >
                          {accentText}
                        </p>
                        <p
                          className={cn(
                            nanum,
                            "text-center break-words whitespace-pre-line",
                            id !== "pudi" &&
                              "text-[14px] leading-[1.55] font-bold",
                          )}
                          style={
                            id === "pudi"
                              ? PUDI_INSET_MOBILE.body
                              : { color: bodyColor }
                          }
                        >
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 섹션 5: 회사소개서 다운로드 (PC) — 가로 1줄 유지: 텍스트 shrink(280~655) + 카드 flex로 비율 축소 ══ */}
      <section className="hidden md:block">
        <PageContentMax
          className="py-12 pb-28 md:py-14 md:pb-32 lg:pb-40"
          innerClassName="flex w-full flex-nowrap items-center gap-x-[clamp(16px,1.375vw,22px)]"
        >
          <div className="max-w-[min(655px,calc(655*100vw/1920))] min-w-[min(280px,calc(280*100vw/1920))] shrink grow-0 basis-[min(655px,calc(655*100vw/1920))]">
            <p
              style={{
                fontSize: pc1920(14, 18),
                fontWeight: 700,
                color: "#1F2121",
                marginBottom: 16,
                letterSpacing: "-0.04em",
                lineHeight: pc1920(20, 23.4),
              }}
            >
              {t("pages.brand.intro.downloadLead")}
            </p>
            <h2
              className="max-w-full whitespace-pre-line"
              style={{
                fontSize: pc1920(22, 32),
                fontWeight: 800,
                color: "#003F2B",
                letterSpacing: "-0.04em",
                lineHeight: pc1920(30, 44.8),
                wordBreak: "keep-all",
                overflowWrap: "break-word",
              }}
            >
              {t("pages.brand.intro.downloadHeadline")}
            </h2>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center justify-end gap-2">
            {[
              {
                label: t("pages.brand.intro.downloadKoLabel"),
                size: t("pages.brand.intro.downloadSize"),
                href: "/files/poonglim_catalog_kor.pdf",
              },
              {
                label: t("pages.brand.intro.downloadEnLabel"),
                size: t("pages.brand.intro.downloadSize"),
                href: "/files/poonglim-catalog_eng.pdf",
              },
            ].map(({ label, size, href }) => (
              <a
                key={label}
                href={href}
                download
                className="box-border flex max-w-[min(457.5px,calc(457.5*100vw/1920))] min-w-0 flex-1 basis-0 cursor-pointer items-center gap-3 border border-[#E6E1D4] bg-white no-underline shadow-sm transition-shadow hover:shadow"
                style={{
                  borderRadius: pc1920(16, 24),
                  minHeight: pc1920(96, 120),
                  padding: `${pc1920(16, 30)} ${pc1920(16, 30)}`,
                }}
              >
                <div
                  className="flex shrink-0 items-center justify-center bg-[#003F2B]"
                  style={{
                    borderRadius: pc1920(12, 20),
                    width: pc1920(40, 52.67),
                    height: pc1920(40, 52.67),
                  }}
                >
                  <svg
                    className="h-[55%] w-[55%]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2v6h6"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="break-words"
                    style={{
                      fontSize: pc1920(14, 18),
                      fontWeight: 800,
                      color: "#1F2121",
                      letterSpacing: "-0.03em",
                      lineHeight: pc1920(20, 25.2),
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: pc1920(12, 16),
                      fontWeight: 700,
                      color: "#1F2121",
                      marginTop: 4,
                      lineHeight: pc1920(18, 24),
                    }}
                  >
                    {size}
                  </p>
                </div>
                <img
                  src="/intro/download_icon.png"
                  alt=""
                  className="shrink-0 object-contain"
                  style={{ width: "54.5px", height: "53px" }}
                  aria-hidden
                />
              </a>
            ))}
          </div>
        </PageContentMax>
      </section>

      {/* ══ 섹션 5: 회사소개서 다운로드 (모바일) — 전폭 유동 ══ */}
      <section className="block px-3 py-6 md:hidden">
        <div className="mx-auto flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col gap-2 text-left">
            <p
              className={cn(
                nanum,
                "text-[14px] leading-[18.2px] font-bold text-[#1F2121]",
              )}
            >
              {t("pages.brand.intro.downloadLead")}
            </p>
            <h2
              className={cn(
                nanum,
                "text-[18px] leading-[23.4px] font-extrabold whitespace-pre-line text-[#003F2B]",
              )}
            >
              {t("pages.brand.intro.downloadHeadline")}
            </h2>
          </div>
          <div className="flex w-full flex-col gap-2">
            {[
              {
                label: t("pages.brand.intro.downloadKoLabel"),
                size: t("pages.brand.intro.downloadSize"),
                href: "/files/poonglim_catalog_kor.pdf",
                upper: true,
              },
              {
                label: t("pages.brand.intro.downloadEnLabel"),
                size: t("pages.brand.intro.downloadSize"),
                href: "/files/poonglim-catalog_eng.pdf",
                upper: false,
              },
            ].map(({ label, size, href, upper }) => (
              <a
                key={label}
                href={href}
                download
                className="flex items-center justify-between gap-3 rounded-[16px] border border-[#E6E1D4] bg-white p-4 no-underline shadow-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#003F2B]">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2v6h6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        nanum,
                        "text-base leading-[22.4px] font-extrabold text-[#1F2121]",
                        upper && "uppercase",
                      )}
                    >
                      {label}
                    </p>
                    <p
                      className={cn(
                        nanum,
                        "mt-1 text-[14px] leading-[21px] font-bold text-[#1F2121]",
                      )}
                    >
                      {size}
                    </p>
                  </div>
                </div>
                <img
                  src="/intro/download_icon.png"
                  alt=""
                  className="shrink-0 object-contain"
                  style={{ width: "54.5px", height: "53px" }}
                  aria-hidden
                />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
