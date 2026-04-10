/**
 * 회사소개 페이지
 * 섹션: 히어로 슬라이더 → CEO 인용 → 경영 철학 → 공식 캐릭터
 */
import type { Route } from "./+types/intro";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { pc1920 } from "~/core/lib/pc-fluid";
import { cn } from "~/core/lib/utils";

const nanum = "font-[family-name:var(--font-nanum)]";

/**
 * 회사소개 장식 스파클(히어로·대표 사진 등). 섹션 타이틀은 `SectionTitleStar variant="brandIntro"`(녹색 product-star).
 */
const INTRO_SPARKLE = {
  star: "/intro/Vector.png",
  sparkle1: "/intro/Vector-1.png",
  sparkle2: "/intro/Vector-2.png",
} as const;

/* ── PC 히어로 슬라이더 스파클 3종 위치 ── */
/** 히어로 스파클: 잘림은 화면(뷰포트) 바깥쪽으로 가도록 objectPosition + 좌표 보정 */
const SPARKLES = [
  {
    src: INTRO_SPARKLE.sparkle1,
    size: 42,
    style: { left: "11%", top: "19%", objectPosition: "left top" },
  },
  {
    src: INTRO_SPARKLE.star,
    size: 30,
    style: { left: "-2%", bottom: "22%", objectPosition: "left center" },
  },
  {
    src: INTRO_SPARKLE.sparkle2,
    size: 18,
    style: { left: "9%", bottom: "12%" },
  },
];

const SLIDES = [
  { num: "30", unit: "년의 전통", sparkles: SPARKLES },
  { num: "500", unit: "거래처", sparkles: SPARKLES },
  { num: "50", unit: "제품 라인업", sparkles: SPARKLES },
];

/* ── 경영 철학 카드 ── */
const PHILOSOPHIES = [
  {
    category: "고객 중심",
    desc: "고객의 건강과 만족을 최우선으로 생각하는 제품 개발과 서비스 제공",
    image: "/intro/intro_img_01.png",
    bg: "#FFFFFF",
    highlight: false,
  },
  {
    category: "품질 신뢰",
    desc: "HACCP, ISO 등 국제 인증을 통한 철저한 품질 관리 시스템 구축",
    image: "/intro/intro_img_02.png",
    bg: "#FFFFFF",
    highlight: false,
  },
  {
    category: "ESG 경영",
    desc: "환경을 생각하는 지속가능한 경영과 사회적 책임 실천",
    image: "/intro/intro_img_03.png",
    bg: "#FFFFFF",
    highlight: false,
  },
  {
    category: "혁신 추구",
    desc: "끊임없는 연구개발을 통한 혁신적인 제품과 기술 개발",
    image: "/intro/intro_img_04.png",
    bg: "#ECC94B",
    highlight: true,
  },
  {
    category: "글로벌 진출",
    desc: "한국의 우수한 식품 기술을 세계에 알리는 글로벌 기업으로 도약",
    image: "/intro/intro_img_05.png",
    bg: "#FFFFFF",
    highlight: false,
  },
  {
    category: "상생 협력",
    desc: "파트너사와의 동반성장을 통한 건전한 생태계 조성",
    image: "/intro/intro_img_06.png",
    bg: "#FFFFFF",
    highlight: false,
  },
];

/* ── 공식 캐릭터 ── */
const CHARACTERS = [
  {
    id: "edi",
    name: "에디",
    nameEn: "Egg + Delight",
    showcaseImage: "/intro/edi01.png",
    sceneImage: "/intro/edi02.png",
    mainBg: "#02633E",
    insetBg: "#F0EEDD",
    greeting: "안녕, 난 에디야.\n기쁨이 넘치는 시간을 선사해줄게!",
    accentText: "일상 속 '기쁨'을 선사하는 계란, 에디를 소개합니다.",
    accentColor: "#F3BC1E",
    body: "언제나 곁에 있어주는 따뜻하고 포근한 친구 '에디'. 하루의 작은 기쁨을 나누고, 든든함과 동시에 사랑스러움까지 겸비한 우리의 단짝친구!",
    bodyColor: "#003F2B",
    greetingColor: "#003F2B",
    nameColor: "#FFFFFF",
    nameEnColor: "#FFFFFF",
    imageLeft: true,
  },
  {
    id: "pudi",
    name: "푸디",
    nameEn: "Pudding + Dessert",
    showcaseImage: "/intro/puding.png",
    sceneImage: "/intro/pudings.png",
    mainBg: "#F3BC1E",
    insetBg: "#1F2121",
    greeting: "반가워, 난 푸디.\n달콤함이 가득한 하루를 만들어줄게!",
    accentText: "일상 속 '달콤함'을 채우는 푸딩,\n푸디를 소개합니다.",
    accentColor: "#F3BC1E",
    body: "한입 베어물면 몽글몽글 퍼지는 달콤한 친구 '푸디'.\n우리의 일상을 소소한 행복으로 가득 채워주는 \n작고 귀여운, 통통튀는 매력을 가진 존재랍니다!",
    bodyColor: "#FFFFFF",
    greetingColor: "#FFFFFF",
    nameColor: "#1F2121",
    nameEnColor: "#1F2121",
    imageLeft: false,
  },
];

/** 푸디 인셋 스토리 카드 — 모바일 피그마 (font: NanumSquareRound = `nanum`) */
const PUDI_INSET_MOBILE = {
  greeting: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: 800,
    lineHeight: "25.2px",
  },
  accent: {
    color: "#F3BC1E",
    fontSize: 16,
    fontWeight: 800,
    lineHeight: "24px",
  },
  body: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    lineHeight: "21px",
  },
} as const;

export function meta(_: Route.MetaArgs) {
  return [{ title: "회사소개 | 풍림푸드" }];
}

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
const N = SLIDES.length;

/**
 * 모바일 경영 철학 — 피그마 2×3 그리드 (행 우선: 좌→우)
 * 1행: 고객 중심(흰) · 품질 신뢰(연베이지)
 * 2행: ESG(연베이지) · 혁신 추구(연노랑)
 * 3행: 글로벌 진출(흰) · 상생 협력(연베이지)
 */
const PHILOSOPHY_MOBILE_GRID = [
  { category: "고객 중심", bg: "#FFFFFF" },
  { category: "품질 신뢰", bg: "#E8EDD4" },
  { category: "ESG 경영", bg: "#E8EDD4" },
  { category: "혁신 추구", bg: "#F5EED0" },
  { category: "글로벌 진출", bg: "#FFFFFF" },
  { category: "상생 협력", bg: "#E8EDD4" },
] as const;

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

export default function BrandIntroScreen() {
  // ── PC 스크롤 드리븐 서큘러 리빌 상태 ──
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const [gp, setGp] = useState(0); // global progress: 0 to SLIDES.length

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

      const quoteLeft = qLeft;
      const quoteWFinal = qW;
      const quoteFont = Math.min(56, Math.max(22, quoteWFinal * 0.084));

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
        setGp(SLIDES.length);
        return;
      }
      setGp((scrolled / totalScrollable) * SLIDES.length);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full bg-[#F4F2E5] md:bg-[#F5F2E8]">
      <Breadcrumb items={[{ label: "회사소개" }]} />

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
        style={{ height: `${SLIDES.length * 100}vh` }}
      >
        <section
          className="sticky overflow-hidden"
          style={{
            top: "var(--header-height)",
            height: "calc(100vh - var(--header-height))",
            background: "#F5F2E8",
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
              Poonglim,
              <br />
              Brand Story
            </h1>
            <p
              style={{
                marginTop: 20,
                fontSize: pc1920(14, 20),
                fontWeight: 400,
                letterSpacing: "-0.02em",
                color: "#003F2B",
                lineHeight: 1.65,
                opacity: 0.75,
              }}
            >
              1994년 설립 이래 30년간 축적된 노하우와
              <br />
              혁신적인 기술로 고객의 건강하고
              <br />
              풍요로운 일상을 만들어가고 있습니다.
            </p>
          </div>

          {/* 슬라이드 아이템 — 전체 섹션 기준 absolute, 왼쪽 패널 뒤로 퇴장 가능 */}
          {SLIDES.map((slide, i) => {
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

            const isLastSlide = i === N - 1;
            // 마지막 슬라이드: 좌측 퇴장 없이 중앙 유지, 스크롤해도 페이드 없음(히어로가 통째로 넘어갈 때까지 표시)
            if (isLastSlide && gp >= N - 1) {
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
      <section className="md:hidden">
        <div className="flex w-full items-center justify-start px-3 py-6">
          <div className="flex w-full flex-col items-end gap-[clamp(28px,9vw,44px)]">
            <div className="flex w-full flex-col items-start gap-2.5 self-stretch">
              <h1
                className={cn(
                  nanum,
                  "self-stretch text-[clamp(32px,10.67vw,40px)] leading-[clamp(40px,12.8vw,48px)] font-extrabold text-[#003F2B]",
                )}
              >
                Poonglim,
                <br />
                Brand Story
              </h1>
              <p
                className={cn(
                  nanum,
                  "self-stretch text-[clamp(13px,3.73vw,14px)] leading-[clamp(20px,5.97vw,22.4px)] font-normal text-[#003F2B]",
                )}
              >
                1994년 설립 이래 30년간 축적된 노하우와
                <br />
                혁신적인 기술로 고객의 건강하고 풍요로운 일상을
                <br />
                만들어가고 있습니다.
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

              {SLIDES.map((slide, i) => (
                <div
                  key={slide.unit}
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
      <section
        className="hidden py-10 md:block md:py-14"
        style={{ backgroundColor: "#F2F0E4" }}
      >
        <PageContentMax>
          <div className="mb-6 flex items-center gap-2 md:mb-7">
            <SectionTitleStar variant="brandIntro" className="h-4 w-4" />
            <span
              style={{
                fontSize: pc1920(14, 28),
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#003F2B",
              }}
            >
              CEO 인사말
            </span>
          </div>

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
                      alt="풍림푸드 대표이사 정연현"
                      className="block h-full w-full object-cover"
                    />
                  </div>
                  <img
                    src={INTRO_SPARKLE.sparkle1}
                    alt=""
                    className="pointer-events-none absolute"
                    style={{
                      left: "-8%",
                      bottom: "26%",
                      width: "clamp(18px, 4.2%, 32px)",
                    }}
                  />
                  <img
                    src={INTRO_SPARKLE.sparkle2}
                    alt=""
                    className="pointer-events-none absolute"
                    style={{
                      left: "-3%",
                      bottom: "12%",
                      width: "clamp(10px, 2.6%, 20px)",
                    }}
                  />
                  <img
                    src={INTRO_SPARKLE.star}
                    alt=""
                    className="pointer-events-none absolute"
                    style={{
                      top: "6%",
                      right: "-10%",
                      width: "clamp(32px, 8.8%, 68px)",
                    }}
                  />
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
                        : pc1920(22, 56),
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.14,
                      color: "#003F2B",
                      textAlign: "center",
                      wordBreak: "keep-all",
                      overflow: "visible",
                    }}
                  >
                    "고객의 건강이
                    <br />곧 우리의 사명입니다"
                  </blockquote>
                </div>

                {/* 우하 400×390 */}
                <div
                  className="absolute right-0 bottom-0 z-[6] flex min-h-0 flex-col overflow-hidden text-left"
                  style={
                    ceoLayout
                      ? {
                          width: ceoLayout.bodyW,
                          height: ceoLayout.bodyH,
                        }
                      : {
                          width: `${(CEO_BODY_W / CEO_STAGE_W) * 100}%`,
                          height: `${(CEO_BODY_H / CEO_STAGE_H) * 100}%`,
                        }
                  }
                >
                  <div className="mb-2.5 flex shrink-0 items-center gap-2">
                    <SectionTitleStar
                      variant="brandIntro"
                      className="h-4 w-4"
                    />
                    <span
                      style={{
                        fontSize: pc1920(14, 28),
                        fontWeight: 700,
                        letterSpacing: "-0.04em",
                        color: "#003F2B",
                      }}
                    >
                      CEO 인사말
                    </span>
                  </div>
                  <div
                    className="min-h-0 flex-1 overflow-y-auto pr-0.5"
                    style={{
                      color: "#1a2e28",
                      fontSize: pc1920(11, 16),
                      fontWeight: 500,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.65,
                    }}
                  >
                    <p>
                      풍림푸드는 1994년 작은 식품 제조업체로 시작하여, 오늘날
                      대한민국을 대표하는 프리미엄 식품 전문기업으로
                      성장했습니다.
                    </p>
                    <p style={{ marginTop: 10 }}>
                      우리는 단순히 제품을 만드는 것이 아니라, 고객의 건강하고
                      풍요로운 일상을 만들어가는 파트너가 되고자 합니다. 엄선된
                      원료와 첨단 기술, 그리고 30년간 축적된 노하우를 바탕으로
                      최고 품질의 제품을 선보이고 있습니다.
                    </p>
                    <p style={{ marginTop: 10 }}>
                      앞으로도 풍림푸드는 지속가능한 경영과 사회적 책임을
                      다하며, 고객과 함께 성장하는 기업이 되겠습니다.
                    </p>
                  </div>
                  <p
                    className="mt-2.5 shrink-0"
                    style={{
                      fontSize: pc1920(11, 18),
                      fontWeight: 400,
                      letterSpacing: "-0.04em",
                      color: "#003F2B",
                    }}
                  >
                    풍림푸드 대표이사{" "}
                    <span style={{ marginLeft: 10 }}>정연현</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageContentMax>
      </section>

      {/* 모바일 CEO — 인용은 초상 상단에 겹침, 스파클은 초상 영역 기준 배치 */}
      <section className="bg-[#F2F0E4] md:hidden">
        <div className="flex w-full flex-col items-start gap-0 px-3 pt-5 pb-6">
          <div className="flex w-full items-center gap-[14px]">
            <SectionTitleStar
              variant="brandIntro"
              className="h-[21px] w-[21px]"
            />
            <div
              className={cn(
                nanum,
                "min-w-0 flex-1 text-[18px] leading-[30px] font-extrabold text-[#1F2121]",
              )}
            >
              CEO 인사말
            </div>
          </div>

          {/* 타이틀(아래 가장자리) ↔ 인용문 블록 영역: 시안 40px */}
          <div className="relative mx-auto mt-[40px] w-full max-w-[min(320px,88vw)] overflow-visible pt-[clamp(20px,5.5vw,36px)]">
            <div className="relative mx-auto aspect-[530/650] w-full max-w-[280px] overflow-visible">
              <blockquote
                className={cn(
                  nanum,
                  "absolute bottom-full left-1/2 z-30 w-[min(108%,calc(100%+24px))] max-w-none -translate-x-1/2 translate-y-[min(28%,2.25rem)] text-center text-[clamp(20px,6.4vw,28px)] leading-[1.28] font-extrabold text-[#003F2B]",
                )}
              >
                &quot;고객의 건강이 <br />곧 우리의 사명입니다&quot;
              </blockquote>

              <div className="relative z-[5] h-full w-full overflow-hidden">
                <img
                  src="/intro/president_img.png"
                  alt="풍림푸드 대표이사 정연현"
                  className="block h-full w-full object-cover"
                />
              </div>

              <img
                src={INTRO_SPARKLE.sparkle1}
                alt=""
                className="pointer-events-none absolute z-20 opacity-90"
                style={{
                  left: "-6%",
                  bottom: "24%",
                  width: "clamp(32px, 10vw, 48px)",
                  height: "auto",
                }}
                aria-hidden
              />
              <img
                src={INTRO_SPARKLE.sparkle2}
                alt=""
                className="pointer-events-none absolute z-20"
                style={{
                  left: "-1%",
                  bottom: "9%",
                  width: "clamp(18px, 5.5vw, 30px)",
                  height: "auto",
                }}
                aria-hidden
              />
              <img
                src={INTRO_SPARKLE.star}
                alt=""
                className="pointer-events-none absolute z-20 opacity-90"
                style={{
                  top: "0%",
                  right: "-10%",
                  width: "clamp(44px, 13vw, 76px)",
                  height: "auto",
                }}
                aria-hidden
              />
            </div>
          </div>

          <div
            className={cn(
              nanum,
              "mt-[40px] flex w-full flex-col items-start gap-4 self-stretch",
            )}
          >
            <p className="text-[clamp(13px,3.73vw,14px)] leading-[1.5] font-bold text-[#1F2121]">
              풍림푸드는 1994년 작은 식품 제조업체로 시작하여, 오늘날 대한민국을
              대표하는 프리미엄 식품 전문기업으로 성장했습니다.
              <br />
              <br />
              우리는 단순히 제품을 만드는 것이 아니라, 고객의 건강하고 풍요로운
              일상을 만들어가는 파트너가 되고자 합니다.&nbsp;&nbsp;엄선된 원료와
              첨단 기술, 그리고 30년간 축적된 노하우를 바탕으로 최고 품질의
              제품을 선보이고 있습니다.
              <br />
              <br />
              앞으로도 풍림푸드는 지속가능한 경영과 사회적 책임을 다하며, 고객과
              함께 성장하는 기업이 되겠습니다.
            </p>
            <div className="inline-flex items-center gap-3 self-stretch">
              <span className="text-base leading-6 font-normal text-[#003F2B]">
                풍림푸드 대표이사
              </span>
              <span className="text-base leading-6 font-bold text-[#003F2B]">
                정연현
              </span>
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
          borderRadius: `${pc1920(20, 40)} ${pc1920(20, 40)} 0 0`,
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <SectionTitleStar variant="brandIntro" className="h-4 w-4" />
                <span
                  style={{
                    fontSize: pc1920(14, 28),
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#003F2B",
                  }}
                >
                  경영 철학
                </span>
              </div>
              <h2
                style={{
                  fontSize: pc1920(22, 56),
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.2,
                  color: "#003F2B",
                }}
              >
                6가지 핵심 가치로
                <br />더 나은 미래를
                <br />
                만들어갑니다.
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
              {PHILOSOPHIES.map(({ category, desc, image, bg, highlight }) => (
                <div
                  key={category}
                  style={{
                    backgroundColor: bg,
                    width: "100%",
                    height: pc1920(280, 520),
                    borderRadius: pc1920(12, 20),
                    display: "flex",
                    flexDirection: "column",
                    padding: pc1920(16, 28),
                    overflow: "hidden",
                  }}
                >
                  {/* 뱃지 — 16px -4% 800 */}
                  <span
                    style={{
                      display: "inline-block",
                      borderRadius: 100,
                      padding: `${pc1920(2, 4)} ${pc1920(8, 12)}`,
                      fontSize: pc1920(11, 16),
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      backgroundColor: highlight
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(0,63,43,0.07)",
                      color: "#003F2B",
                      marginBottom: 16,
                      alignSelf: "flex-start",
                    }}
                  >
                    {category}
                  </span>
                  {/* 설명 — 28px -4% 700 */}
                  <p
                    style={{
                      fontSize: pc1920(14, 28),
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.35,
                      color: "#003F2B",
                    }}
                  >
                    {desc}
                  </p>
                  {/* 아이콘 우하단 */}
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
                        width: pc1920(72, 160),
                        height: pc1920(72, 160),
                        objectFit: "contain",
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
            <div className="inline-flex w-full items-center gap-[14px] self-stretch">
              <SectionTitleStar
                variant="brandIntro"
                className="h-[21px] w-[21px]"
              />
              <div
                className={cn(
                  nanum,
                  "min-w-0 flex-1 text-[18px] leading-[30px] font-extrabold text-[#1F2121]",
                )}
              >
                경영 철학
              </div>
            </div>
            <h2
              className={cn(
                nanum,
                "self-stretch text-[clamp(18px,5.33vw,20px)] leading-[1.3] font-extrabold text-[#003F2B]",
              )}
            >
              6가지 핵심 가치로
              <br />더 나은 미래를 만들어갑니다.
            </h2>
          </div>

          <div className="grid w-full grid-cols-2 items-stretch gap-[clamp(6px,2.13vw,8px)] self-stretch">
            {PHILOSOPHY_MOBILE_GRID.map(({ category, bg }) => {
              const card = PHILOSOPHIES.find((p) => p.category === category);
              if (!card) return null;
              const { desc, image } = card;
              return (
                <div
                  key={category}
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
                        "text-[18px] leading-[27px] font-extrabold break-words text-[#02633E]",
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
        style={{ backgroundColor: "#F5F2E8", padding: `${pc1920(48, 100)} 0` }}
      >
        <div
          style={{
            maxWidth: "var(--pc-w-1680)",
            margin: "0 auto",
            padding: `0 ${pc1920(20, 40)}`,
          }}
        >
          {/* 헤더 */}
          <div style={{ textAlign: "center", marginBottom: pc1920(32, 64) }}>
            <h2
              style={{
                fontSize: pc1920(28, 70),
                fontWeight: 800,
                color: "#003F2B",
                letterSpacing: "-0.04em",
                marginBottom: 12,
              }}
            >
              풍림푸드 공식 캐릭터
            </h2>
            <p
              style={{
                fontSize: pc1920(11, 14),
                color: "#C9A84C",
                letterSpacing: "0.08em",
              }}
            >
              Poonglim Characters Story
            </p>
          </div>

          {/* 캐릭터 카드 목록 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: pc1920(10, 16),
            }}
          >
            {CHARACTERS.map(
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
                    borderRadius: pc1920(16, 24),
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: imageLeft ? "row" : "row-reverse",
                    minHeight: pc1920(320, 500),
                  }}
                >
                  {/* 캐릭터 쇼케이스 영역 */}
                  <div
                    style={{
                      flex: "0 0 42%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <img
                      src={showcaseImage}
                      alt={name}
                      style={{
                        height: pc1920(160, 300),
                        objectFit: "contain",
                      }}
                    />
                    <p
                      style={{
                        fontSize: pc1920(15, 24),
                        fontWeight: 700,
                        color: nameColor,
                        letterSpacing: "-0.04em",
                        marginTop: 8,
                      }}
                    >
                      {name}
                    </p>
                    <p
                      style={{
                        fontSize: pc1920(11, 14),
                        color: nameEnColor,
                      }}
                    >
                      {nameEn}
                    </p>
                  </div>

                  {/* 스토리 서브카드 */}
                  <div
                    style={{
                      flex: 1,
                      padding: pc1920(10, 16),
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: insetBg,
                        borderRadius: pc1920(12, 16),
                        flex: 1,
                        padding: pc1920(20, 48),
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={sceneImage}
                        alt={`${name} scene`}
                        style={{
                          height:
                            id === "pudi" ? pc1920(28, 58) : pc1920(44, 100),
                          objectFit: "contain",
                          marginBottom:
                            id === "pudi" ? pc1920(6, 14) : pc1920(10, 24),
                        }}
                      />
                      <p
                        style={
                          id === "pudi"
                            ? {
                                fontFamily:
                                  "var(--font-nanum), NanumSquareRound, sans-serif",
                                fontSize: pc1920(16, 32),
                                fontWeight: 800,
                                color: "#FFFFFF",
                                lineHeight: pc1920(22, 45),
                                whiteSpace: "pre-line",
                                marginBottom: pc1920(6, 14),
                                overflowWrap: "break-word",
                              }
                            : {
                                fontSize: pc1920(16, 32),
                                fontWeight: 800,
                                color: greetingColor,
                                letterSpacing: "-0.04em",
                                lineHeight: 1.25,
                                whiteSpace: "pre-line",
                                marginBottom: pc1920(6, 14),
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
                                fontSize: pc1920(14, 28),
                                fontWeight: 800,
                                color: "#F3BC1E",
                                lineHeight: pc1920(20, 38),
                                whiteSpace: "pre-line",
                                marginBottom: pc1920(6, 14),
                                overflowWrap: "break-word",
                              }
                            : {
                                fontSize: pc1920(12, 18),
                                fontWeight: 800,
                                color: accentColor,
                                letterSpacing: "-0.04em",
                                marginBottom: pc1920(6, 14),
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
                                fontSize: pc1920(12, 18),
                                fontWeight: 700,
                                color: "#FFFFFF",
                                lineHeight: pc1920(18, 27),
                                whiteSpace: "pre-line",
                                overflowWrap: "break-word",
                              }
                            : {
                                fontSize: pc1920(11, 14),
                                fontWeight: 700,
                                letterSpacing: "-0.04em",
                                color: bodyColor,
                                lineHeight: 1.75,
                                whiteSpace: "pre-line",
                              }
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
      </section>

      {/* ══ 섹션 4: 공식 캐릭터 (모바일) — 경영철학과 간격 40px(철학 pb) · 전폭 유동 ══ */}
      <section className="bg-[#F4F2E5] pt-10 md:hidden">
        <div className="flex w-full flex-col px-3 pt-0 pb-6">
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col items-start gap-1">
              <h2
                className={cn(
                  nanum,
                  "w-full text-[20px] leading-[26px] font-extrabold text-[#003F2B]",
                )}
              >
                풍림푸드 공식 캐릭터
              </h2>
              <p
                className={cn(
                  nanum,
                  "w-full text-[14px] leading-[18.2px] font-normal text-[#003F2B]",
                )}
              >
                Poonglim Characters Story
              </p>
            </div>

            <div className="flex w-full flex-col gap-3">
              {CHARACTERS.map(
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
                      className="mt-2 flex w-full flex-col items-center gap-3 rounded-2xl px-3 py-4"
                      style={{ backgroundColor: insetBg }}
                    >
                      <img
                        src={sceneImage}
                        alt=""
                        className={cn(
                          "h-auto w-auto max-w-full object-contain",
                          id === "pudi"
                            ? "max-h-[min(70px,18.5vw)]"
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
      <section
        className="hidden md:block"
        style={{ backgroundColor: "#F5F2E8" }}
      >
        <PageContentMax
          className="py-12 pb-28 md:py-14 md:pb-32 lg:pb-40"
          innerClassName="flex w-full flex-nowrap items-center gap-x-[clamp(16px,1.375vw,22px)]"
        >
          <div className="max-w-[min(655px,calc(655*100vw/1920))] min-w-[min(280px,calc(280*100vw/1920))] shrink grow-0 basis-[min(655px,calc(655*100vw/1920))]">
            <p
              style={{
                fontSize: pc1920(14, 18),
                fontWeight: 700,
                color: "#222",
                marginBottom: 16,
                letterSpacing: "-0.04em",
              }}
            >
              풍림푸드를 더 자세히 알아보세요!
            </p>
            <h2
              className="max-w-full"
              style={{
                fontSize: pc1920(22, 32),
                fontWeight: 800,
                color: "#003F2B",
                letterSpacing: "-0.04em",
                lineHeight: 1.35,
                wordBreak: "keep-all",
                overflowWrap: "break-word",
              }}
            >
              풍림푸드의 기업 철학, 사업 영역,
              <br />
              주요 제품 라인업을 확인하실 수 있습니다.
            </h2>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-nowrap items-center justify-end gap-2">
            {[
              { label: "회사소개서", size: "PDF, 12.5MB", href: "#" },
              { label: "Company Brochure", size: "PDF, 12.5MB", href: "#" },
            ].map(({ label, size, href }) => (
              <a
                key={label}
                href={href}
                download
                className="box-border flex max-w-[min(457.5px,calc(457.5*100vw/1920))] min-w-0 flex-1 basis-0 cursor-pointer items-center gap-3 rounded-xl border border-[#E0D9C8] bg-white no-underline"
                style={{
                  minHeight: pc1920(96, 133),
                  padding: `${pc1920(12, 24)} ${pc1920(14, 24)}`,
                }}
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg bg-[#003F2B]"
                  style={{
                    width: pc1920(32, 44),
                    height: pc1920(32, 44),
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
                      fontSize: pc1920(12, 16),
                      fontWeight: 700,
                      color: "#1A1A1A",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: pc1920(10, 12),
                      color: "#999",
                      marginTop: 3,
                    }}
                  >
                    {size}
                  </p>
                </div>
                <svg
                  className="h-[18px] w-[18px] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M12 15l-4-4h3V4h2v7h3l-4 4z" fill="#AAAAAA" />
                  <path
                    d="M5 18h14"
                    stroke="#AAAAAA"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            ))}
          </div>
        </PageContentMax>
      </section>

      {/* ══ 섹션 5: 회사소개서 다운로드 (모바일) — 전폭 유동 ══ */}
      <section className="block bg-[#F4F2E5] px-3 py-6 md:hidden">
        <div className="mx-auto flex w-full flex-col items-center gap-5">
          <div className="flex w-full flex-col gap-2 text-left">
            <p
              className={cn(
                nanum,
                "text-[14px] leading-[18.2px] font-bold text-[#1F2121]",
              )}
            >
              풍림푸드를 더 자세히 알아보세요!
            </p>
            <h2
              className={cn(
                nanum,
                "text-[18px] leading-[23.4px] font-extrabold text-[#003F2B]",
              )}
            >
              풍림푸드의 기업 철학, 사업 영역,
              <br />
              주요 제품 라인업을 확인하실 수 있습니다.
            </h2>
          </div>
          <div className="flex w-full flex-col gap-2">
            {[
              {
                label: "회사소개서",
                size: "PDF, 12.5MB",
                href: "#",
                upper: true,
              },
              {
                label: "Company Brochure",
                size: "PDF, 12.5MB",
                href: "#",
                upper: false,
              },
            ].map(({ label, size, href, upper }) => (
              <a
                key={label}
                href={href}
                download
                className="flex items-center justify-between gap-3 rounded-[10px] bg-white p-4 no-underline"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#003F2B]">
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
                <svg
                  className="h-10 w-10 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path d="M12 15l-4-4h3V4h2v7h3l-4 4z" fill="#AAAAAA" />
                  <path
                    d="M5 18h14"
                    stroke="#AAAAAA"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
