/**
 * 계란이야기 페이지
 * 피그마 시안 기반 — 1920px 기준 clamp() 반응형
 * 계란 구조 섹션: 스크롤 sticky 스태킹 + fade-in 인터랙션
 */
import type { CSSProperties } from "react";
import type { TFunction } from "i18next";
import type { Route } from "./+types/egg-story";

import { ArrowUpRight } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { useBrandPhilosophyReveal } from "~/features/home/lib/brand-philosophy-reveal";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: (data as { metaTitle?: string } | undefined)?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.products.eggStory.metaTitle") };
}

/* ── 공통 clamp 헬퍼 ── */
const px = (base: number, min = base * 0.4) =>
  `clamp(${Math.round(min)}px,calc(${base}*100vw/1920),${base}px)`;

/**
 * sticky 스택용 세로 스페이서 — 순수 vh만 쓰면 브라우저 축소(줌 아웃) 시 뷰포트가 커지며
 * 빈 여백이 비정상적으로 벌어짐 → vh와 px 상한을 min으로 묶음
 */
const EGG_SCROLL_SPACER_BETWEEN = "min(70vh, 680px)";
const EGG_SCROLL_SPACER_TAIL = "min(40vh, 420px)";

/** 데스크톱 본문 가로 상한 — 축소 줌·초와이드에서 flex 자식·이미지 행이 과도하게 늘어나지 않게 */
const eggDesktopContentInnerClass =
  "mx-auto w-full max-w-[min(100%,var(--content-max-width))]";

/** 영양소 섹션 전체 높이(vh)의 px 상한 — 브라우저 축소로 vh만 비대해질 때만 완화 */
function eggNutrientsSectionHeightCss(itemCount: number): string {
  const vhUnits = itemCount * 75 + 100;
  const pxCap = itemCount * 560 + 5200;
  return `min(${vhUnits}vh, ${pxCap}px)`;
}

/** 네비·sticky 타이틀 등 상단 고정 요소의 top 오프셋(px) — 계란 구조 섹션과 동일 기준 */
const EGG_STORY_NAV_SAFE_TOP = 80;

type NutrientItem = { letter: string; name: string; desc: string };
type EggPartItem = { title: string; desc: string; bg: string; img: string };
type EggFoodItem = {
  name: string;
  sub: string;
  bg: string;
  img1: string;
  img2: string;
};
type PhilosophyItem = { title: string; desc: string };
type StepItem = { name: string; desc: string };

type EggStoryContent = {
  nutrients: NutrientItem[];
  eggParts: EggPartItem[];
  eggFoods: EggFoodItem[];
  eggPhilosophy: PhilosophyItem[];
  steps: StepItem[];
};

function buildEggStoryContent(t: TFunction): EggStoryContent {
  const nt = (k: string) =>
    t(`pages.products.eggStory.nutrients.${k}`, { returnObjects: true }) as {
      name: string;
      desc: string;
    };
  const pt = (k: string) =>
    t(`pages.products.eggStory.parts.${k}`, { returnObjects: true }) as {
      title: string;
      desc: string;
    };
  const ft = (k: string) =>
    t(`pages.products.eggStory.foods.${k}`, { returnObjects: true }) as {
      name: string;
      sub: string;
    };
  const ph = (k: string) =>
    t(`pages.products.eggStory.philosophy.${k}`, { returnObjects: true }) as {
      title: string;
      desc: string;
    };
  const st = (k: string) =>
    t(`pages.products.eggStory.steps.${k}`, { returnObjects: true }) as {
      name: string;
      desc: string;
    };

  return {
    nutrients: [
      { letter: "P", ...nt("p") },
      { letter: "A", ...nt("a") },
      { letter: "D", ...nt("d") },
      { letter: "C", ...nt("c") },
    ],
    eggParts: [
      { ...pt("yolk"), bg: "#FBE28A", img: "/intro/egg01.png" },
      { ...pt("white"), bg: "#C3C8AE", img: "/intro/egg02.png" },
      { ...pt("shell"), bg: "#FBFBFB", img: "/intro/egg03.png" },
      { ...pt("membrane"), bg: "#FDF7DA", img: "/intro/egg04.png" },
    ],
    eggFoods: [
      {
        ...ft("roll"),
        bg: "#EAE3C9",
        img1: "/intro/prd01-1.png",
        img2: "/intro/prd01-2.png",
      },
      {
        ...ft("sandwich"),
        bg: "#D8E0A5",
        img1: "/intro/prd02-1.png",
        img2: "/intro/prd02-2.png",
      },
      {
        ...ft("pudding"),
        bg: "#EED4C8",
        img1: "/intro/prd03-1.png",
        img2: "/intro/prd03-2.png",
      },
      {
        ...ft("salad"),
        bg: "var(--site-chrome-header-bg, #FDFDF5)",
        img1: "/intro/prd04-1.png",
        img2: "/intro/prd04-2.png",
      },
    ],
    eggPhilosophy: [ph("quality"), ph("safety"), ph("research")],
    steps: [st("s1"), st("s2"), st("s3"), st("s4")],
  };
}

const EggStoryContentContext = createContext<EggStoryContent | null>(null);

function useEggStoryContent(): EggStoryContent {
  const ctx = useContext(EggStoryContentContext);
  if (!ctx) {
    throw new Error("useEggStoryContent must be used within EggStoryScreen");
  }
  return ctx;
}

/* ── Placeholder 컬러 박스 ── */
function ImgBox({
  className,
  style,
  color = "#D8D0BB",
}: {
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}) {
  return (
    <div
      className={className}
      style={{ backgroundColor: color, borderRadius: "inherit", ...style }}
    />
  );
}

/* ── 섹션 데코 스파클 이미지 ── */
function StarDeco({
  size = 45.55,
  minSize = 20,
}: {
  size?: number;
  minSize?: number;
}) {
  return (
    <img
      src="/home/intro-star.png"
      alt=""
      aria-hidden
      style={{
        width: px(size, minSize),
        height: px(size, minSize),
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}

/* ══════════════════════════════════════════════════════
   계란 구조 섹션 — 스크롤 sticky 스태킹 + fade-in
   ══════════════════════════════════════════════════════
   구조:
   - 각 카드 앞에 EGG_SCROLL_SPACER_BETWEEN(≈70vh, px 상한) 스페이서를 두어
     IntersectionObserver가 카드마다 다른 스크롤 위치에서 발화
   - position: sticky + 점진적 top 오프셋으로 카드가 겹쳐 쌓임
   - opacity: 0 → 1, translateY(80px) → 0 fade-slide-in
*/
function EggPartsSection() {
  const { eggParts } = useEggStoryContent();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLDivElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10px 0px" },
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  /*
   * sticky 스태킹의 핵심:
   * - 모든 카드와 스페이서가 동일한 부모의 직접 자식이어야 함
   * - 각 카드의 top 오프셋을 점진적으로 늘려 겹쳐 쌓임
   * - 부모 컨테이너가 충분히 길어야 마지막 카드까지 sticky 유지됨
   * - 섹션 타이틀이 sticky로 상단에 고정되므로 카드 sticky top은 그 아래부터 시작
   */
  const STRIP_H = 88; /* 이전 카드 제목이 노출되는 영역(px) */
  /** sticky 타이틀(pt 110 + 60px급 제목 + pb 24) 아래 첫 카드 top — 겹침 방지 */
  const TITLE_STICKY_BAND = 230;
  const BASE_TOP = EGG_STORY_NAV_SAFE_TOP + TITLE_STICKY_BAND;

  const stickyTop = (i: number) => `${BASE_TOP + i * STRIP_H}px`;

  return (
    <div
      style={{
        paddingLeft: px(160),
        paddingRight: px(160),
        paddingTop: px(16),
        paddingBottom: px(100),
      }}
    >
      {/* 단일 컨테이너 — 카드·스페이서 모두 직접 자식으로 배치해야 sticky가 올바르게 동작함 */}
      <div>
        {eggParts.flatMap((part, i) => {
          const card = (
            <div
              key={part.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                position: "sticky",
                top: stickyTop(i),
                zIndex: i + 1,
                opacity: 0,
                transform: "translateY(80px)",
                transition: "opacity 0.75s ease, transform 0.75s ease",
                maxWidth: px(600),
                margin: "0 auto",
                background: part.bg,
                borderRadius: px(40),
                padding: px(40),
                overflow: "hidden",
              }}
            >
              {/* 타이틀 + 설명 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: px(20, 8),
                  marginBottom: px(20, 10),
                }}
              >
                <h3
                  style={{
                    color: "#1F2121",
                    fontSize: px(28, 18),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 800,
                    lineHeight: px(42, 24),
                    alignSelf: "stretch",
                  }}
                >
                  {part.title}
                </h3>
                <p
                  style={{
                    color: "#1F2121",
                    fontSize: px(16, 13),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 700,
                    lineHeight: px(24, 18),
                    alignSelf: "stretch",
                  }}
                >
                  {part.desc}
                </p>
              </div>

              {/* 계란 단면 이미지 */}
              <img
                src={part.img}
                alt={part.title}
                style={{
                  width: px(276, 140),
                  height: px(280, 140),
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </div>
          );

          /* 마지막 카드 이후엔 스페이서 불필요 */
          if (i < eggParts.length - 1) {
            return [
              card,
              <div
                key={`spacer-${i}`}
                style={{ height: EGG_SCROLL_SPACER_BETWEEN }}
                aria-hidden
              />,
            ];
          }
          return [card];
        })}
        {/* 마지막 카드가 화면에 안착한 뒤 다음 섹션으로 자연스럽게 이어지도록 여유 공간 확보 */}
        <div style={{ height: EGG_SCROLL_SPACER_TAIL }} aria-hidden />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   음식 활용 섹션 — 계란 구조 섹션과 동일한 sticky 스태킹
   ══════════════════════════════════════════════════════
   - 각 카드(계란말이·샌드위치·푸딩·샐러드)가 아래서 fade-in 되며 스택
   - EggPartsSection 과 동일한 flatMap 구조: 카드·스페이서 단일 부모
*/
function FoodSection() {
  const { t } = useTranslation();
  const { eggFoods } = useEggStoryContent();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLDivElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10px 0px" },
    );
    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, []);

  /* 클수록 카드별 sticky top 간격이 넓어져 겹침이 줄고, 아래 카드들이 더 많이 드러남 */
  const STRIP_H = 60;
  const BASE_TOP = 80;
  const stickyTop = (i: number) => `${BASE_TOP + i * STRIP_H}px`;

  return (
    <section
      className={cn(SECTION_VIEWPORT_BLEED, "min-w-0")}
      style={{ background: "#02633E" }}
    >
      {/* ── 정적 헤더 ── */}
      <div
        className={eggDesktopContentInnerClass}
        style={{
          paddingTop: px(110),
          paddingLeft: px(160),
          paddingRight: px(160),
          paddingBottom: px(60),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: `clamp(16px,calc(40*100vw/1920),40px)`,
        }}
      >
        <h2
          style={{
            color: "#EAE3C9",
            fontSize: px(60, 24),
            fontFamily: "NanumSquareRound, sans-serif",
            fontWeight: 800,
            lineHeight: px(84, 32),
            textAlign: "center",
          }}
        >
          {t("pages.products.eggStory.foodUsesHeading")}
        </h2>
        <p
          style={{
            color: "#EAE3C9",
            fontSize: px(16, 12),
            fontFamily: "NanumSquareRound, sans-serif",
            fontWeight: 400,
            lineHeight: px(19.2, 16),
            textAlign: "center",
          }}
        >
          {t("pages.products.eggStory.foodUsesTagline")}
        </p>
      </div>

      {/* ── sticky 스태킹 카드 영역 ── */}
      <div
        style={{
          paddingLeft: px(160),
          paddingRight: px(160),
          paddingBottom: px(60),
        }}
      >
        {/* 단일 컨테이너 — 모든 카드·스페이서 직접 자식 */}
        <div className={eggDesktopContentInnerClass}>
          {eggFoods.flatMap((food, i) => {
            const card = (
              <div
                key={food.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                style={{
                  position: "sticky",
                  top: stickyTop(i),
                  zIndex: i + 1,
                  opacity: 0,
                  transform: "translateY(80px)",
                  transition: "opacity 0.75s ease, transform 0.75s ease",
                  height: px(800, 220),
                  display: "flex",
                }}
              >
                {/* ── 왼쪽: flex:1, 수직 중앙, 텍스트+제품 이미지 ── */}
                {/* 피그마: flex:1 1 0, padding 40px, justify-content center, gap 20px */}
                <div
                  style={{
                    flex: "1 1 0",
                    background: food.bg,
                    borderTopLeftRadius: px(40, 16),
                    borderBottomLeftRadius: px(40, 16),
                    padding: px(40, 16),
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: px(20, 8),
                    overflow: "hidden",
                  }}
                >
                  <h3
                    style={{
                      color: "#003F2B",
                      fontSize: px(52, 20),
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 800,
                      lineHeight: px(78, 28),
                      textAlign: "center",
                      alignSelf: "stretch",
                    }}
                  >
                    {food.name}
                  </h3>
                  <p
                    style={{
                      color: "#1F2121",
                      fontSize: px(16, 11),
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 700,
                      lineHeight: px(24, 16),
                      textAlign: "center",
                      alignSelf: "stretch",
                    }}
                  >
                    {food.sub}
                  </p>
                  {/* 피그마: 290×290 제품 이미지 */}
                  <img
                    src={food.img1}
                    alt={food.name}
                    style={{
                      width: px(290, 80),
                      height: px(290, 80),
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* ── 오른쪽: 고정 800px 너비, 씬 사진 ── */}
                {/* 피그마: width 800px, border-radius 48px(우측), 내부 overflow hidden */}
                <div
                  style={{
                    width: px(800, 120),
                    flexShrink: 0,
                    borderTopRightRadius: px(48, 20),
                    borderBottomRightRadius: px(48, 20),
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={food.img2}
                    alt={food.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* 피그마: 하단 50% 검정 그라데이션 */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.50) 100%)",
                    }}
                  />
                </div>
              </div>
            );

            if (i < eggFoods.length - 1) {
              return [
                card,
                <div
                  key={`food-spacer-${i}`}
                  style={{ height: EGG_SCROLL_SPACER_BETWEEN }}
                  aria-hidden
                />,
              ];
            }
            return [card];
          })}
          <div style={{ height: EGG_SCROLL_SPACER_TAIL }} aria-hidden />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   영양소 섹션 — 스크롤 시 항목 순차 페이드인
   ══════════════════════════════════════════════════════
   구조:
   - 전체 섹션 height = min((항목×75+100)vh, pxCap) 로 스크롤 거리 확보(줌 시 vh 폭주 방지)
   - 내부 레이아웃은 position:sticky + height:100vh 으로 뷰포트에 고정
   - scroll: 실제 offsetHeight 대비 진행률로 항목 노출(높이 min()과 동기)
*/
function NutrientsSection() {
  const { t } = useTranslation();
  const { nutrients } = useEggStoryContent();
  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const nutrientsTitleLines = t("pages.products.eggStory.nutrientsHeading").split("\n");

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.top >= vh) return; // 아직 뷰포트 밖

      /* 섹션 상단이 뷰포트 상단을 지나친 거리(px) */
      const scrolledPast = Math.max(0, -rect.top);
      const scrollRange = Math.max(1, el.offsetHeight - vh);
      const progress = Math.min(1, scrolledPast / scrollRange);
      const itemsToShow = Math.min(
        nutrients.length,
        Math.max(1, Math.ceil(progress * nutrients.length)),
      );

      setVisibleCount((prev) =>
        Math.max(prev, Math.min(nutrients.length, itemsToShow)),
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 마운트 시 초기 확인
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(SECTION_VIEWPORT_BLEED, "min-w-0")}
      style={{
        position: "relative",
        background: "#EAE3C9",
        height: eggNutrientsSectionHeightCss(nutrients.length),
      }}
    >
      {/* ── sticky 콘텐츠 패널 ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "#EAE3C9",
          paddingLeft: px(160),
          paddingRight: px(160),
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: px(1430),
            margin: "0 auto",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: `clamp(24px,calc(120*100vw/1920),120px)`,
          }}
        >
          {/* 좌: 타이틀 + 스파클 (항상 표시) */}
          <div
            style={{
              width: px(400, 140),
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: px(12, 6),
            }}
          >
            <h2
              style={{
                color: "#003F2B",
                fontSize: px(60, 24),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 800,
                lineHeight: px(84, 32),
              }}
            >
              {nutrientsTitleLines[0]}
              {nutrientsTitleLines.length > 1 ? (
                <>
                  <br />
                  {nutrientsTitleLines.slice(1).join(" ")}
                </>
              ) : null}
            </h2>
            <div style={{ marginTop: px(22, 8) }}>
              <StarDeco />
            </div>
          </div>

          {/* 우: 영양소 행 — 순차 페이드인 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: `clamp(24px,calc(60*100vw/1920),60px)`,
            }}
          >
            {nutrients.map((n, i) => (
              <div
                key={n.letter}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: `clamp(16px,calc(40*100vw/1920),40px)`,
                  opacity: i < visibleCount ? 1 : 0,
                  transform:
                    i < visibleCount ? "translateY(0)" : "translateY(24px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                }}
              >
                {/* 알파벳 뱃지 */}
                <div
                  style={{
                    background: "#003F2B",
                    borderRadius: px(20, 10),
                    padding: `${px(20, 10)} ${px(30, 14)}`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontSize: px(60, 24),
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 800,
                      lineHeight: px(60, 24),
                    }}
                  >
                    {n.letter}
                  </span>
                </div>

                {/* 영양소 이름 */}
                <span
                  style={{
                    color: "#003F2B",
                    fontSize: px(60, 22),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 800,
                    lineHeight: px(84, 30),
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.name}
                </span>

                {/* 설명 */}
                <span
                  style={{
                    color: "#003F2B",
                    fontSize: px(20, 13),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 700,
                    lineHeight: px(24, 18),
                  }}
                >
                  {n.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function eggJourneyRevealStyle(
  visibleCount: number,
  minStage: number,
): CSSProperties {
  const on = visibleCount >= minStage;
  return {
    opacity: on ? 1 : 0,
    transform: on ? "translateY(0)" : "translateY(20px)",
    transition:
      "opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
    pointerEvents: on ? "auto" : "none",
  };
}

function EggJourneyScrollSection() {
  const { t } = useTranslation();
  const { steps } = useEggStoryContent();
  return (
    <>
      {/* 모바일 — 인터랙션 없음, 기존과 동일 */}
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "w-full min-w-0 bg-white px-4 py-10 md:hidden",
        )}
      >
        <SectionTitleMobile
          omitHorizontalPadding
          title={t("pages.products.eggStory.journeyTitleMobile")}
        />
        <div className="mx-auto flex w-full flex-col">
          {steps.map((step, idx) => (
            <div
              key={step.name}
              className="inline-flex w-full items-center justify-start rounded-[10px] bg-white py-5"
            >
              <div className="inline-flex min-w-0 flex-1 flex-col items-start gap-3">
                <div className="inline-flex items-center gap-2.5">
                  <div
                    className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#003F2B] text-center text-[14px] leading-[21px] font-bold text-white"
                    style={{ fontFamily: "NanumSquareRound, sans-serif" }}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className="text-[18px] leading-[27px] font-extrabold text-[#003F2B]"
                    style={{ fontFamily: "NanumSquareRound, sans-serif" }}
                  >
                    {step.name}
                  </span>
                </div>
                <p
                  className="w-full text-[16px] leading-6 font-bold text-[#1F2121]"
                  style={{ fontFamily: "NanumSquareRound, sans-serif" }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <EggJourneyDesktopScrollSection />
    </>
  );
}

function EggJourneyDesktopScrollSection() {
  const { t } = useTranslation();
  const { steps } = useEggStoryContent();
  const journeyScrollStages = 2 + steps.length;
  const journeySectionHeightVh = (journeyScrollStages + 1) * 44 + 72;
  const journeySectionHeightCss = `min(${journeySectionHeightVh}vh, 7200px)`;

  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.top >= vh) return;

      const scrolledPast = Math.max(0, -rect.top);
      const scrollRange = Math.max(1, el.offsetHeight - vh);
      const progress = Math.min(1, Math.max(0, scrolledPast / scrollRange));
      /* 0 = 타이틀만 … 실제 섹션 높이(min(vh,px))와 동기 */
      const itemsToShow = Math.min(
        journeyScrollStages,
        Math.floor(progress * (journeyScrollStages + 1)),
      );

      setVisibleCount((prev) => Math.max(prev, itemsToShow));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [journeyScrollStages]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "relative hidden w-full min-w-0 bg-white md:block",
      )}
      style={{
        height: journeySectionHeightCss,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "flex-start",
          background: "white",
          overflowY: "auto",
          overflowX: "hidden",
          paddingTop: `clamp(40px,calc(100 * 100vw / 1920),100px)`,
          paddingBottom: `clamp(64px,calc(160 * 100vw / 1920),160px)`,
          paddingLeft: px(160),
          paddingRight: px(160),
        }}
      >
        <div className="mx-auto w-full" style={{ maxWidth: px(1600) }}>
          <div className="mb-[clamp(24px,calc(60*100vw/1920),60px)] flex items-start gap-[clamp(8px,calc(10*100vw/1920),10px)]">
            <h2
              style={{
                color: "#1F2121",
                fontSize: px(60, 24),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 800,
                lineHeight: px(90, 32),
              }}
            >
              {t("pages.products.eggStory.journeyTitleDesktopL1")}
              <br />
              {t("pages.products.eggStory.journeyTitleDesktopL2")}
            </h2>
            <div style={{ marginTop: px(22, 10) }}>
              <StarDeco />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                minWidth: px(412, 60),
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "#1F2121",
                  fontSize: px(100, 36),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 700,
                  lineHeight: px(130, 48),
                  ...eggJourneyRevealStyle(visibleCount, 1),
                }}
              >
                4
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: px(30, 16),
              }}
            >
              {steps.map((step, i) => (
                <div
                  key={step.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: px(40, 16),
                    width: px(716, 300),
                    ...eggJourneyRevealStyle(visibleCount, 3 + i),
                  }}
                >
                  <span
                    style={{
                      color: "#1F2121",
                      fontSize: px(60, 20),
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 800,
                      lineHeight: px(78, 28),
                      flexShrink: 0,
                    }}
                  >
                    {step.name}
                  </span>
                  <p
                    style={{
                      color: "#1F2121",
                      fontSize: px(20, 13),
                      fontFamily: "NanumSquareRound, sans-serif",
                      fontWeight: 700,
                      lineHeight: px(30, 18),
                      whiteSpace: "pre-line",
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                minWidth: px(412, 60),
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p
                style={{
                  color: "#1F2121",
                  fontSize: px(100, 36),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 800,
                  lineHeight: px(130, 48),
                  ...eggJourneyRevealStyle(visibleCount, 2),
                }}
              >
                STEP
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   계란 철학 섹션 — 배경 + 이미지/텍스트 떠오름 + 품질→안전→연구 순차
   ══════════════════════════════════════════════════════
   - 배경: 섹션에 고정(fill + cover), 모바일/PC 각각 objectPosition만 분리
   - 진입 시 배경: 미세 스케일 + 살짝 페이드(선택 블러). 세로 translate 없음 → 프레이밍이 흔들리지 않음
   - 타이틀 → 카드 3장 순차, 카드 안에서는 제목 후 본문이 짧게 이어짐
   - prefers-reduced-motion: 블러·스케일·페이드 최소화
*/
function PhilosophySection() {
  const { t } = useTranslation();
  const { eggPhilosophy } = useEggStoryContent();
  const [visibleCount, setVisibleCount] = useState(0);
  const [bgActive, setBgActive] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setBgActive(true);
          setVisibleCount(1);
          const step = reduceMotion ? 80 : 420;
          setTimeout(() => setVisibleCount(2), step);
          setTimeout(() => setVisibleCount(3), step * 2);
          setTimeout(() => setVisibleCount(4), step * 3);
          observer.disconnect();
        }
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const easeFloat = "cubic-bezier(0.22, 1, 0.36, 1)";
  const risePx = reduceMotion ? 8 : 44;
  const durTitle = reduceMotion ? "0.35s" : "0.85s";
  const durCard = reduceMotion ? "0.35s" : "0.8s";

  const fadeRise = (threshold: number): React.CSSProperties => ({
    opacity: visibleCount >= threshold ? 1 : 0,
    transform:
      visibleCount >= threshold ? "translateY(0)" : `translateY(${risePx}px)`,
    transition: reduceMotion
      ? "opacity 0.35s ease"
      : `opacity ${durCard} ${easeFloat}, transform ${durCard} ${easeFloat}`,
  });

  const fadeTitle: React.CSSProperties = {
    opacity: visibleCount >= 1 ? 1 : 0,
    transform: visibleCount >= 1 ? "translateY(0)" : `translateY(${risePx}px)`,
    transition: reduceMotion
      ? "opacity 0.35s ease"
      : `opacity ${durTitle} ${easeFloat}, transform ${durTitle} ${easeFloat}`,
  };

  const cardLineActive = (i: number) => visibleCount >= i + 2;

  const bgImgMotion: React.CSSProperties = reduceMotion
    ? { opacity: 1, filter: "none", transform: "none", transition: "none" }
    : {
        opacity: bgActive ? 1 : 0.88,
        filter: bgActive ? "blur(6px)" : "blur(0px)",
        transform: bgActive ? "scale(1.045)" : "scale(1)",
        transition: "filter 1.05s ease, opacity 1s ease, transform 1.2s ease",
      };

  return (
    <section
      ref={sectionRef}
      className={cn(SECTION_VIEWPORT_BLEED, "min-w-0")}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* ── 배경 이미지: 섹션 전체에 고정(fill). 모바일/PC는 objectPosition만 분리 ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <img
          src="/intro/back01.png"
          alt=""
          aria-hidden
          className="md:hidden"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 42%",
            ...bgImgMotion,
          }}
        />
        <img
          src="/intro/back01.png"
          alt=""
          aria-hidden
          className="hidden md:block"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "50% 56%",
            ...bgImgMotion,
          }}
        />
      </div>
      {/* 가독성 — 블러 시 살짝 진하게 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: reduceMotion
            ? "rgba(0, 40, 24, 0.72)"
            : bgActive
              ? "rgba(0, 40, 24, 0.78)"
              : "rgba(0, 40, 24, 0.68)",
          transition: reduceMotion ? "none" : "background 1s ease",
        }}
      />

      {/* ── 콘텐츠 ── */}
      <div
        className={cn(
          eggDesktopContentInnerClass,
          "px-4 py-12 md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:py-[clamp(44px,calc(110*100vw/1920),110px)]",
        )}
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            ...fadeTitle,
            color: "white",
            fontSize: px(60, 24),
            fontFamily: "NanumSquareRound, sans-serif",
            fontWeight: 800,
            lineHeight: px(84, 32),
            textAlign: "center",
            marginBottom: `clamp(24px,calc(60*100vw/1920),60px)`,
          }}
        >
          {t("pages.products.eggStory.philosophyHeading")}
        </h2>

        <div className="flex flex-col gap-3 lg:flex-row lg:gap-[clamp(12px,calc(20*100vw/1920),20px)]">
          {eggPhilosophy.map((item, i) => (
            <div
              key={item.title}
              className="min-h-0 w-full lg:w-auto"
              style={{
                ...fadeRise(i + 2),
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: `clamp(10px,calc(40*100vw/1920),40px)`,
                minHeight: "clamp(140px, min(28vw, 22rem), 520px)",
                borderRadius: px(40, 10),
                outline: "1px white solid",
                outlineOffset: "-1px",
                paddingTop: px(80, 20),
                paddingBottom: px(80, 20),
                paddingLeft: px(20),
                paddingRight: px(20),
              }}
            >
              <h3
                style={{
                  color: "white",
                  fontSize: px(52, 18),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 800,
                  lineHeight: px(72.8, 25.2),
                  textAlign: "center",
                  opacity: cardLineActive(i) ? 1 : 0,
                  transform: cardLineActive(i)
                    ? "translateY(0)"
                    : `translateY(${Math.round(risePx * 0.65)}px)`,
                  transition: reduceMotion
                    ? "opacity 0.3s ease"
                    : `opacity 0.55s ${easeFloat} 0s, transform 0.55s ${easeFloat} 0s`,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  color: "white",
                  fontSize: px(20, 14),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 800,
                  lineHeight: px(30, 21),
                  textAlign: "center",
                  whiteSpace: "pre-line",
                  opacity: cardLineActive(i) ? 1 : 0,
                  transform: cardLineActive(i)
                    ? "translateY(0)"
                    : `translateY(${Math.round(risePx * 0.55)}px)`,
                  transition: reduceMotion
                    ? "opacity 0.3s ease"
                    : `opacity 0.55s ${easeFloat} 0.14s, transform 0.55s ${easeFloat} 0.14s`,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   무한 스크롤 컬럼 — requestAnimationFrame 기반
   CSS 키프레임 방식의 루프 리셋 끊김 없이 완벽한 루프
   ══════════════════════════════════════════════════════
   direction "up"  : 콘텐츠가 위로 이동 (pos ↑)
   direction "down": 콘텐츠가 아래로 이동 (pos ↓)
   initialFrac 0~1 : 시작 위치 (한 세트 길이의 분율)
*/
function MarqueeCol({
  items,
  speed = 60,
  direction = "up",
  initialFrac = 0,
  gap,
}: {
  items: { src: string; h: string }[];
  speed?: number;
  direction?: "up" | "down";
  initialFrac?: number;
  gap: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const state = useRef({ pos: 0, lastT: 0, ready: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number;

    const tick = (t: number) => {
      const half = track.scrollHeight / 2;

      /* 이미지가 모두 로드된 뒤 첫 실행에서 초기 위치 설정 */
      if (!state.current.ready && half > 0) {
        state.current.pos = half * initialFrac;
        state.current.ready = true;
      }

      if (state.current.ready && half > 0 && state.current.lastT > 0) {
        const dt = (t - state.current.lastT) / 1000;

        if (direction === "up") {
          state.current.pos += speed * dt;
          if (state.current.pos >= half) state.current.pos -= half;
        } else {
          state.current.pos -= speed * dt;
          if (state.current.pos < 0) state.current.pos += half;
        }

        track.style.transform = `translateY(-${state.current.pos}px)`;
      }

      state.current.lastT = t;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, direction, initialFrac]);

  return (
    <div style={{ flex: 1, overflow: "hidden" }}>
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexDirection: "column",
          willChange: "transform",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{ paddingBottom: gap, flexShrink: 0 }}>
            <img
              src={item.src}
              alt=""
              style={{
                width: "100%",
                height: item.h,
                objectFit: "cover",
                borderRadius: px(20, 10),
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 가로 무한 스크롤 (모바일 CTA 등) — scrollWidth/2 루프, translateX ── */
function MarqueeRow({
  items,
  speed = 55,
  direction = "left",
  initialFrac = 0,
  gap,
}: {
  items: { src: string; w: string; h: string }[];
  speed?: number;
  direction?: "left" | "right";
  initialFrac?: number;
  gap: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const state = useRef({ pos: 0, lastT: 0, ready: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number;

    const tick = (t: number) => {
      const half = track.scrollWidth / 2;

      if (!state.current.ready && half > 0) {
        state.current.pos = half * initialFrac;
        state.current.ready = true;
      }

      if (state.current.ready && half > 0 && state.current.lastT > 0) {
        const dt = (t - state.current.lastT) / 1000;

        if (direction === "left") {
          state.current.pos += speed * dt;
          if (state.current.pos >= half) state.current.pos -= half;
        } else {
          state.current.pos -= speed * dt;
          if (state.current.pos < 0) state.current.pos += half;
        }

        track.style.transform = `translate3d(-${state.current.pos}px,0,0)`;
      }

      state.current.lastT = t;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, direction, initialFrac]);

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={trackRef}
        style={{
          display: "flex",
          flexDirection: "row",
          width: "max-content",
          willChange: "transform",
        }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{ paddingRight: gap, flexShrink: 0 }}>
            <img
              src={item.src}
              alt=""
              style={{
                width: item.w,
                height: item.h,
                objectFit: "cover",
                borderRadius: px(20, 10),
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* CTA 마퀴 — 모바일 가로·데스크톱 세로 모두 m_product01~12 (좌/위 01~06, 우/아래 07~12) */
const ctaMarqueeMobileSetTopSrc = [
  "/intro/m_product01.png",
  "/intro/m_product02.png",
  "/intro/m_product03.png",
  "/intro/m_product04.png",
  "/intro/m_product05.png",
  "/intro/m_product06.png",
] as const;

const ctaMarqueeMobileSetBottomSrc = [
  "/intro/m_product07.png",
  "/intro/m_product08.png",
  "/intro/m_product09.png",
  "/intro/m_product10.png",
  "/intro/m_product11.png",
  "/intro/m_product12.png",
] as const;

/* 데스크톱 세로 마퀴: 좌(↑) m_product01~06, 우(↓) m_product07~12 */
const CTA_DESKTOP_MARQUEE_IMG_H = px(340, 130);
const ctaMarqueeSet1 = ctaMarqueeMobileSetTopSrc.map((src) => ({
  src,
  h: CTA_DESKTOP_MARQUEE_IMG_H,
}));
const ctaMarqueeSet2 = ctaMarqueeMobileSetBottomSrc.map((src) => ({
  src,
  h: CTA_DESKTOP_MARQUEE_IMG_H,
}));

const ctaMarqueeMobileGap = px(20, 10);
const ctaMarqueeMobileRowItem = {
  w: "clamp(104px, 29vw, 132px)",
  h: "112px",
} as const;

function ctaMarqueeMobileRowItems(srcs: readonly string[]) {
  return srcs.map((src) => ({
    src,
    w: ctaMarqueeMobileRowItem.w,
    h: ctaMarqueeMobileRowItem.h,
  }));
}

type EggHeroReveal = Pick<
  ReturnType<typeof useBrandPhilosophyReveal>,
  "slideStyle" | "badgeStyle" | "sparkleStyle"
>;

/* ── 모바일 전용 (Figma 375) — 메인 BrandPhilosophy와 동일 스크롤 등장 인터랙션 ── */
function EggHeroMobile({
  slideStyle,
  badgeStyle,
  sparkleStyle,
}: EggHeroReveal) {
  const { t } = useTranslation();
  return (
    <div className="relative mx-auto mb-8 min-h-[300px] w-full max-w-[375px] pt-5 pb-5 md:hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/intro/Vector-1.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 left-[10.67%] aspect-square w-[5.75%] max-w-[22px] object-contain select-none"
          style={sparkleStyle(100, { top: 0, left: "10.67%" })}
        />
        <img
          src="/intro/Vector-2.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[86.33%] left-[22.93%] aspect-square w-[8.6%] max-w-[33px] object-contain select-none"
          style={sparkleStyle(220, {
            top: "86.33%",
            left: "22.93%",
          })}
        />
        <img
          src="/intro/Vector.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[8.33%] left-[75.73%] aspect-square w-[10.9%] max-w-[41px] object-contain select-none"
          style={sparkleStyle(340, {
            top: "8.33%",
            left: "75.73%",
          })}
        />
        <div
          className="absolute top-[13.67%] left-[35.73%]"
          style={slideStyle(320)}
        >
          <p
            className="text-center text-[56px] leading-[56px] font-extrabold text-[#003F2B]"
            style={{ fontFamily: "NanumSquareRound, sans-serif" }}
          >
            EGG
          </p>
        </div>
        {/* 바깥: 가로만 중앙 정렬 / 안쪽: slide-up-fade(translate Y) — 같은 요소에 translate-x와 두면 애니메이션과 충돌 */}
        <div className="absolute top-[35%] right-0 left-0 z-[1] flex justify-center px-4">
          <div
            className="w-full max-w-[min(100%,343px)]"
            style={slideStyle(400)}
          >
            <p
              className="text-center text-[clamp(40px,12.2vw,56px)] leading-[1.1] font-extrabold text-[#003F2B]"
              style={{ fontFamily: "NanumSquareRound, sans-serif" }}
            >
              {t("pages.products.eggStory.heroTitleMobile")}
            </p>
          </div>
        </div>
        <div className="absolute top-[60.33%] right-0 left-0 flex justify-center px-4">
          <div className="w-full max-w-[300px]" style={slideStyle(520)}>
            <p
              className="text-center text-base leading-[25.6px] font-bold text-[#003F2B]"
              style={{ fontFamily: "NanumSquareRound, sans-serif" }}
            >
              {t("pages.products.eggStory.heroLeadLine1")}
              <br />
              {t("pages.products.eggStory.heroLeadLine2")}
              <br />
              {t("pages.products.eggStory.heroLeadLine3")}
            </p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10">
        <span
          className="absolute top-[7.33%] left-[25.6%] rounded-[23px] border border-[#1F2121] bg-white px-2.5 py-2 text-[12px] font-bold whitespace-nowrap text-[#1F2121]"
          style={{
            fontFamily: "NanumSquareRound, sans-serif",
            lineHeight: "12px",
            ...badgeStyle(780),
          }}
        >
          {t("pages.products.eggStory.badgeHealthy")}
        </span>
        <span
          className="absolute top-[49%] left-[5.87%] rounded-[24px] border border-[#1F2121] bg-white px-2.5 py-2 text-[12px] font-bold whitespace-nowrap text-[#1F2121]"
          style={{
            fontFamily: "NanumSquareRound, sans-serif",
            lineHeight: "12px",
            ...badgeStyle(940),
          }}
        >
          {t("pages.products.eggStory.badgeTrust")}
        </span>
        <span
          className="absolute top-[27%] left-[76.27%] rounded-[23px] border border-[#1F2121] bg-white px-2.5 py-2 text-[12px] font-bold whitespace-nowrap text-[#1F2121]"
          style={{
            fontFamily: "NanumSquareRound, sans-serif",
            lineHeight: "12px",
            ...badgeStyle(1100),
          }}
        >
          {t("pages.products.eggStory.badgeEasy")}
        </span>
      </div>
    </div>
  );
}

/** PC 히어로 — 동일 스크롤 트리거 + 슬라이드/뱃지 애니메이션 */
function EggHeroDesktop({
  slideStyle,
  badgeStyle,
  sparkleStyle,
}: EggHeroReveal) {
  const { t } = useTranslation();
  const badgeList: { text: string; style: { left: string; top: string } }[] = [
    {
      text: t("pages.products.eggStory.badgeHealthy"),
      style: { left: "37.6%", top: "22.3%" },
    },
    {
      text: t("pages.products.eggStory.badgeTrust"),
      style: { left: "23.1%", top: "52%" },
    },
    {
      text: t("pages.products.eggStory.badgeEasy"),
      style: { left: "68.9%", top: "47.1%" },
    },
  ];

  return (
    <div
      className="hidden flex-col items-center md:flex"
      style={{
        paddingTop: px(160),
        paddingBottom: px(100),
        paddingLeft: px(40),
        paddingRight: px(40),
      }}
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          maxWidth: px(1600),
          height: px(350, 140),
          borderRadius: px(40),
        }}
      >
        <div className="absolute inset-0 z-0">
          <img
            src="/intro/Vector-1.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute select-none"
            style={sparkleStyle(100, {
              left: "21.9%",
              top: "5.1%",
              width: px(38, 16),
              height: px(38, 16),
            })}
          />
          <img
            src="/intro/Vector-2.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute select-none"
            style={sparkleStyle(240, {
              left: "81%",
              top: 0,
              width: px(72, 28),
              height: px(72, 28),
            })}
          />
          <img
            src="/intro/Vector.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute select-none"
            style={sparkleStyle(360, {
              left: "64.8%",
              top: "62.6%",
              width: px(53, 22),
              height: px(53, 22),
            })}
          />

          <div
            className="absolute right-0 left-0 flex flex-col items-center"
            style={{
              top: "22.3%",
              gap: px(30, 10),
              paddingLeft: "26%",
              paddingRight: "26%",
            }}
          >
            <div className="w-full" style={slideStyle(420)}>
              <h1
                style={{
                  color: "#003F2B",
                  fontSize: px(100, 28),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 800,
                  lineHeight: px(140, 38),
                  textAlign: "center",
                  width: "100%",
                }}
              >
                {t("pages.products.eggStory.heroTitleDesktop")}
              </h1>
            </div>
            <div className="w-full" style={slideStyle(620)}>
              <p
                style={{
                  color: "#003F2B",
                  fontSize: px(18, 11),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 700,
                  lineHeight: px(21.6, 16),
                  textAlign: "center",
                }}
              >
                {t("pages.products.eggStory.heroLeadDesktopL1")}
                <br />
                {t("pages.products.eggStory.heroLeadDesktopL2")}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-10">
          {badgeList.map(({ text: badgeText, style: pos }, i) => (
            <span
              key={`${badgeText}-${i}`}
              className="pointer-events-none absolute select-none"
              style={{
                ...pos,
                background: "white",
                borderRadius: "9999px",
                outline: "1px #1F2121 solid",
                padding: `${px(8, 4)} ${px(14, 8)}`,
                color: "#1F2121",
                fontSize: px(15, 10),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 700,
                lineHeight: "1",
                whiteSpace: "nowrap",
                ...badgeStyle(820 + i * 140),
              }}
            >
              {badgeText}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EggIntroYellowMobile() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-5 md:hidden">
      <div className="h-[170px] w-full overflow-hidden rounded-[10px]">
        <img
          src="/intro/img05.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <h2
        className="text-[20px] leading-7 font-extrabold text-[#003F2B]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        {t("pages.products.eggStory.introH2")}
      </h2>
      <p
        className="text-sm leading-[21px] font-bold text-[#1F2121]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        {t("pages.products.eggStory.introP1")}
      </p>
      <p
        className="text-sm leading-[21px] font-bold whitespace-pre-line text-[#1F2121]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        {t("pages.products.eggStory.introP2")}
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {(["img01", "img02", "img03", "img04"] as const).map((name) => (
          <div
            key={name}
            className="h-[166px] w-full overflow-hidden rounded-[10px]"
          >
            <img
              src={`/intro/${name}.png`}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EggPartsSectionMobile() {
  const { eggParts } = useEggStoryContent();
  /* Figma 모바일: 섹션 py 50 · 헤더는 SectionTitleMobile · 카드 열 px 16 gap 10 · 카드 p 20 r 20 gap 20 · 아이콘 79 */
  return (
    <div className="flex flex-col gap-[10px] px-4">
      {eggParts.map((part, i) => (
        <div
          key={part.title}
          className={`flex w-full items-center gap-5 rounded-[20px] p-5 ${
            i === 0 ? "justify-start" : "justify-end"
          }`}
          style={{ background: part.bg }}
        >
          <div className="flex h-[79px] w-[79px] shrink-0 items-center justify-center self-stretch overflow-hidden">
            <img
              src={part.img}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[10px]">
            <h3
              className="text-[18px] leading-[27px] font-extrabold text-[#1F2121]"
              style={{ fontFamily: "NanumSquareRound, sans-serif" }}
            >
              {part.title}
            </h3>
            <p
              className="text-sm leading-[21px] font-bold text-[#1F2121]"
              style={{ fontFamily: "NanumSquareRound, sans-serif" }}
            >
              {part.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function NutrientsSectionMobile() {
  const { t } = useTranslation();
  const { nutrients } = useEggStoryContent();
  const nutrientsTitle = t("pages.products.eggStory.nutrientsHeading")
    .split("\n")
    .join(" ");
  return (
    <section
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-w-0 bg-[#EAE3C9] py-10 md:hidden",
      )}
    >
      <SectionPageTitle
        as="h2"
        preset="default"
        starVariant="intro"
        className="mb-5 px-4 pb-5"
        titleClassName="text-[18px] leading-[30px] font-extrabold text-[#003F2B] font-[family-name:var(--font-nanum)]"
      >
        {nutrientsTitle}
      </SectionPageTitle>
      <div className="grid grid-cols-2 gap-0 px-4">
        {nutrients.map((n) => (
          <div
            key={n.letter}
            className="flex flex-col items-center gap-5 rounded-[20px] bg-[#EAE3C9] p-5"
          >
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-[10px] bg-[#003F2B]">
              <span
                className="text-[30px] leading-[30px] font-extrabold text-white"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {n.letter}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span
                className="text-lg leading-[27px] font-extrabold text-[#003F2B]"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {n.name}
              </span>
              <span
                className="text-sm leading-[21px] font-bold whitespace-pre-line text-[#003F2B]"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {n.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FoodSectionMobile() {
  const { t } = useTranslation();
  const { eggFoods } = useEggStoryContent();
  return (
    <section
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-w-0 bg-[#02633E] py-10 md:hidden",
      )}
    >
      <SectionPageTitle
        as="h2"
        preset="default"
        starVariant="intro"
        className="mb-5 px-4"
        titleClassName="text-[18px] leading-[30px] font-extrabold text-[#EAE3C9] font-[family-name:var(--font-nanum)]"
      >
        {t("pages.products.eggStory.foodUsesHeading")}
      </SectionPageTitle>
      <div className="flex gap-2.5 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch]">
        {eggFoods.map((food) => (
          <div
            key={food.name}
            className="w-[210px] shrink-0 overflow-hidden rounded-[10px]"
            style={{ background: food.bg }}
          >
            <div className="relative h-[210px] w-full overflow-hidden bg-[#EAE3C9]">
              <img
                src={food.img2}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 p-5 text-center">
              <h3
                className="text-lg leading-[27px] font-extrabold text-[#003F2B]"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {food.name}
              </h3>
              <p
                className="text-sm leading-[21px] font-bold text-[#1F2121]"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {food.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionTitleMobile({
  title,
  titleColor = "#1F2121",
  omitHorizontalPadding,
}: {
  title: string;
  titleColor?: string;
  /** 부모가 이미 px-16 등을 줄 때 중복 가로 패딩 방지 */
  omitHorizontalPadding?: boolean;
}) {
  return (
    <SectionPageTitle
      as="h2"
      preset="default"
      starVariant="intro"
      className={`pb-5 md:hidden ${omitHorizontalPadding ? "" : "px-4"}`}
      titleStyle={{ color: titleColor }}
      titleClassName="text-[18px] leading-[30px] font-extrabold font-[family-name:var(--font-nanum)]"
    >
      {title}
    </SectionPageTitle>
  );
}

/* ══════════════════════════════════════════════════════
   메인 페이지
   ══════════════════════════════════════════════════════ */
export default function EggStoryScreen() {
  const { t, i18n } = useTranslation();
  const eggContent = useMemo(
    () => buildEggStoryContent(t),
    [t, i18n.language],
  );

  const { sectionRef, slideStyle, badgeStyle, sparkleStyle } =
    useBrandPhilosophyReveal({ minTriggerPx: 0 });

  const heroReveal = { slideStyle, badgeStyle, sparkleStyle };

  return (
    <EggStoryContentContext.Provider value={eggContent}>
    <div
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
      )}
    >
      {/* ── 브레드크럼 (PC: 제품 상세와 동일 productDetail 시안) ── */}
      <Breadcrumb
        variant="productDetail"
        items={[
          { label: t("pages.products.shared.breadcrumbProducts"), href: "/products/all" },
          { label: t("pages.products.eggStory.breadcrumb") },
        ]}
      />

      {/* ══════════════════════════════════════════
          1. HERO — 메인 BrandPhilosophy와 동일 스크롤 등장
      ══════════════════════════════════════════ */}
      <section
        ref={sectionRef}
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "w-full min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
        )}
      >
        <EggHeroMobile {...heroReveal} />
        <EggHeroDesktop {...heroReveal} />
      </section>

      {/* ══════════════════════════════════════════
          2. 자연이 만든 완전식품, 계란 (Yellow)
      ══════════════════════════════════════════ */}
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "w-full min-w-0 overflow-hidden bg-[#F3BC1E]",
        )}
      >
        <div className="px-4 py-10 md:hidden">
          <EggIntroYellowMobile />
        </div>
        <div
          className="hidden md:block"
          style={{
            paddingLeft: px(160),
            paddingRight: px(160),
            paddingTop: px(100),
            paddingBottom: px(100),
          }}
        >
          <div
            className={cn(
              eggDesktopContentInnerClass,
              "flex flex-col items-start gap-[clamp(12px,calc(20*100vw/1920),20px)] lg:flex-row",
            )}
          >
            {/* 좌측 2×2 이미지 그리드 */}
            <div className="flex flex-1 flex-col gap-[clamp(12px,calc(20*100vw/1920),20px)]">
              {["img01", "img02"].map((name) => (
                <div
                  key={name}
                  className="w-full overflow-hidden"
                  style={{ height: px(370), borderRadius: px(40) }}
                >
                  <img
                    src={`/intro/${name}.png`}
                    alt={`${t("pages.products.eggStory.imgGridAlt")} ${name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-[clamp(12px,calc(20*100vw/1920),20px)]">
              {["img03", "img04"].map((name) => (
                <div
                  key={name}
                  className="w-full overflow-hidden"
                  style={{ height: px(370), borderRadius: px(40) }}
                >
                  <img
                    src={`/intro/${name}.png`}
                    alt={`${t("pages.products.eggStory.imgGridAlt")} ${name}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* 우측 대형 이미지 + 오버레이 텍스트 */}
            <div
              className="relative overflow-hidden"
              style={{
                width: px(900, 300),
                height: px(760, 300),
                borderRadius: px(40),
                flexShrink: 0,
              }}
            >
              <img
                src="/intro/img05.png"
                alt={t("pages.products.eggStory.imgCompleteFoodAlt")}
                className="absolute inset-0 z-0 h-full w-full object-cover"
              />
              {/* 텍스트 블록 뒤 가독성 — 중앙 타원 + 상·하 약한 딤 */}
              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  background: [
                    "radial-gradient(ellipse 95% 70% at 50% 42%, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.22) 48%, transparent 72%)",
                    "linear-gradient(180deg, rgba(0,0,0,0.14) 0%, transparent 32%, transparent 58%, rgba(0,0,0,0.2) 100%)",
                  ].join(", "),
                }}
                aria-hidden
              />
              <div
                className="absolute z-[2] flex flex-col items-center gap-[clamp(8px,calc(10*100vw/1920),10px)] text-center"
                style={{ left: "15%", top: "34%", right: "5%" }}
              >
                <p
                  style={{
                    fontSize: px(60, 22),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 800,
                    lineHeight: px(84, 32),
                  }}
                >
                  <span style={{ color: "white" }}>
                    {t("pages.products.eggStory.introOverlayPrefix")}
                  </span>
                  <span style={{ color: "#F3BC1E" }}>
                    {t("pages.products.eggStory.introOverlayAccent")}
                  </span>
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: px(16, 12),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 700,
                    lineHeight: px(19.2, 16),
                    textAlign: "center",
                  }}
                >
                  {t("pages.products.eggStory.introDesktopP1")}
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: px(16, 12),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 700,
                    lineHeight: px(19.2, 16),
                    textAlign: "center",
                    whiteSpace: "pre-line",
                  }}
                >
                  {t("pages.products.eggStory.introDesktopP2")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. 계란은 이렇게 이루어져 있습니다
             (스크롤 sticky 스태킹 인터랙션)
      ══════════════════════════════════════════ */}
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "w-full min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
        )}
      >
        <div className="py-[50px] md:hidden">
          <SectionTitleMobile
            title={t("pages.products.eggStory.sectionStructureTitle")}
            titleColor="#1F2121"
          />
          <EggPartsSectionMobile />
        </div>
        <div className="hidden md:block">
          {/* 스크롤 시 상단에 고정되어 sticky 카드 인터랙션 중에도 타이틀 유지 */}
          <div
            className="flex items-center justify-center gap-[clamp(12px,calc(20*100vw/1920),20px)]"
            style={{
              position: "sticky",
              top: EGG_STORY_NAV_SAFE_TOP,
              zIndex: 45,
              backgroundColor: "var(--site-chrome-header-bg,#FDFDF5)",
              paddingTop: px(110),
              paddingBottom: px(24),
              paddingLeft: px(160),
              paddingRight: px(160),
            }}
          >
            <StarDeco />
            <h2
              style={{
                color: "#003F2B",
                fontSize: px(60, 24),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 800,
                lineHeight: px(84, 32),
                textAlign: "center",
              }}
            >
              {t("pages.products.eggStory.sectionStructureTitle")}
            </h2>
          </div>
          <EggPartsSection />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4. 계란의 주요 영양소 (스크롤 순차 페이드인)
      ══════════════════════════════════════════ */}
      <div className="hidden md:block">
        <NutrientsSection />
      </div>
      <NutrientsSectionMobile />

      {/* ══════════════════════════════════════════
          5. 계란은 다양한 음식에 활용됩니다 (sticky 스태킹)
      ══════════════════════════════════════════ */}
      <div className="hidden md:block">
        <FoodSection />
      </div>
      <FoodSectionMobile />

      {/* ══════════════════════════════════════════
          6. 좋은 계란을 고르는 방법 (White)
      ══════════════════════════════════════════ */}
      <section
        className={cn(SECTION_VIEWPORT_BLEED, "w-full min-w-0 bg-white")}
      >
        <div className={eggDesktopContentInnerClass}>
          <div
            className="hidden items-center justify-center gap-[clamp(12px,calc(20*100vw/1920),20px)] md:flex"
            style={{
              paddingTop: px(100),
              paddingLeft: px(160),
              paddingRight: px(160),
            }}
          >
            <StarDeco />
            <h2
              style={{
                color: "#003F2B",
                fontSize: px(60, 24),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 800,
                lineHeight: px(84, 32),
                textAlign: "center",
              }}
            >
              {t("pages.products.eggStory.pickTitle")}
            </h2>
          </div>

          {/* 모바일: px-16 py-40 · 데스크탑: 좌우 대형 패딩 + 상단 간격 */}
          {/* ── 피그마 모바일: 전폭 유동 열, 행 높이 140, gap 10, radius 10 ── */}
          {/* ── 피그마 데스크탑: gap-20, 좌 풀높이 + 우 2×320 ── */}
          <div className="px-4 pt-10 pb-10 md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:pt-[clamp(24px,calc(60*100vw/1920),60px)] md:pb-[clamp(44px,calc(110*100vw/1920),110px)]">
            <SectionTitleMobile
              omitHorizontalPadding
              title={t("pages.products.eggStory.pickTitle")}
            />
            <div
              className="mt-0 flex flex-col gap-[10px] md:mt-0 md:flex-row md:gap-[clamp(8px,calc(20*100vw/1920),20px)]"
              style={{
                alignItems: "stretch",
              }}
            >
              {/* ── 왼쪽: flex:1 풀하이트 카드 (choice01 / 껍질 상태 확인) ── */}
              <div
                className="flex h-[140px] md:h-auto md:min-h-0"
                style={{ flex: "1 1 0" }}
              >
                <div
                  className="h-full min-h-0 md:h-auto md:min-h-0 md:flex-1"
                  style={{
                    flex: 1,
                    borderRadius: px(40, 10),
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src="/intro/choice01.png"
                    alt={t("pages.products.eggStory.pickShellAlt")}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* 하단 그라데이션 */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.60) 100%)",
                    }}
                  />
                  {/* 텍스트 오버레이 — 모바일 시안: padding 20 근사(px 26.05) */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: px(40, 20),
                      left: px(40, 20),
                      right: px(40, 20),
                      display: "flex",
                      flexDirection: "column",
                      gap: px(12, 10),
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: px(28, 18),
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        lineHeight: px(39.2, 25.2),
                      }}
                    >
                      {t("pages.products.eggStory.pickShellTitle")}
                    </h3>
                    <p
                      style={{
                        color: "white",
                        fontSize: px(20, 14),
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 700,
                        lineHeight: px(30, 21),
                      }}
                    >
                      {t("pages.products.eggStory.pickShellDesc")}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 오른쪽: flex:1 컬럼, 상하 카드 각각 flex:1 ── */}
              <div
                className="flex flex-col gap-[10px] md:gap-[clamp(8px,calc(20*100vw/1920),20px)]"
                style={{
                  flex: "1 1 0",
                }}
              >
                {/* 상단: choice02 / 냉장 보관 제품 선택 — 모바일 높이 140px */}
                <div
                  className="h-[140px] shrink-0 md:h-[clamp(140px,calc(320*100vw/1920),320px)]"
                  style={{
                    borderRadius: px(40, 10),
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src="/intro/choice02.png"
                    alt={t("pages.products.eggStory.pickChillAlt")}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {/* 모바일: 상단에서 아래로 흐려짐 — 시안 linear-gradient 30% → 0 at 60% */}
                  <div
                    className="absolute inset-0 md:hidden"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 60%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 hidden md:block"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.60) 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: px(30, 20),
                      left: px(40, 26),
                      right: px(40, 26),
                      display: "flex",
                      flexDirection: "column",
                      gap: px(12, 10),
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: px(28, 16),
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        lineHeight: px(39.2, 22.4),
                      }}
                    >
                      {t("pages.products.eggStory.pickChillTitle")}
                    </h3>
                    <p
                      style={{
                        color: "white",
                        fontSize: px(20, 13),
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 700,
                        lineHeight: px(30, 19.5),
                      }}
                    >
                      {t("pages.products.eggStory.pickChillDesc")}
                    </p>
                  </div>
                </div>

                {/* 하단: choice03 / 신선도 확인 */}
                <div
                  className="h-[140px] shrink-0 md:h-[clamp(140px,calc(320*100vw/1920),320px)]"
                  style={{
                    borderRadius: px(40, 10),
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src="/intro/choice03.png"
                    alt={t("pages.products.eggStory.pickFreshAlt")}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.60) 100%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: px(30, 20),
                      left: px(40, 20),
                      right: px(40, 20),
                      display: "flex",
                      flexDirection: "column",
                      gap: px(12, 10),
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: px(28, 18),
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 800,
                        lineHeight: px(39.2, 25.2),
                      }}
                    >
                      {t("pages.products.eggStory.pickFreshTitle")}
                    </h3>
                    <p
                      style={{
                        color: "white",
                        fontSize: px(20, 14),
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: 700,
                        lineHeight: px(30, 21),
                      }}
                    >
                      {t("pages.products.eggStory.pickFreshDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. 풍림푸드의 계란 철학 (Green)
      ══════════════════════════════════════════ */}
      <PhilosophySection />

      {/* ══════════════════════════════════════════
          8. 계란이 식탁에 오기까지 (White) — 영양소와 동일 스크롤 순차 페이드
      ══════════════════════════════════════════ */}
      <EggJourneyScrollSection />

      {/* ══════════════════════════════════════════
          9. 풍림푸드의 계란 제품 CTA (Ivory)
      ══════════════════════════════════════════ */}
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "relative z-0 w-full min-w-0 overflow-hidden bg-[#EAE3C9] pt-10 pb-[100px] md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:py-0",
        )}
      >
        <div
          className={cn(
            eggDesktopContentInnerClass,
            "flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-[clamp(32px,calc(120*100vw/1920),120px)]",
          )}
        >
          {/* ── 좌: 텍스트 + CTA — 모바일만 좌우 패딩(무한 스크롤은 풀블리드) ── */}
          <div className="flex w-full max-w-full shrink-0 flex-col items-center gap-5 px-4 text-center md:w-[clamp(260px,calc(758*100vw/1920),758px)] md:items-start md:gap-[clamp(20px,calc(40*100vw/1920),40px)] md:px-0 md:text-left">
            <div className="flex flex-col gap-2.5 md:gap-[clamp(8px,calc(12*100vw/1920),12px)]">
              <h2
                style={{
                  color: "#003F2B",
                  fontSize: px(60, 20),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 800,
                  lineHeight: px(84, 28),
                }}
              >
                {t("pages.products.eggStory.ctaTitle")}
              </h2>
              <p
                style={{
                  color: "#003F2B",
                  fontSize: px(16, 14),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 400,
                  lineHeight: px(19.2, 16.8),
                }}
              >
                {t("pages.products.eggStory.ctaSubtitle")}
              </p>
            </div>

            <Link
              to="/products/all"
              className="mx-auto transition-opacity hover:opacity-80 md:mx-0 md:self-start"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: px(16, 10),
                height: px(74, 44),
                background: "#003F2B",
                borderRadius: px(35, 30),
                paddingLeft: px(40, 30),
                paddingRight: px(40, 30),
                paddingTop: px(20, 6),
                paddingBottom: px(20, 6),
              }}
            >
              <span
                className="uppercase"
                style={{
                  color: "white",
                  fontSize: px(24, 16),
                  fontFamily: "NanumSquareRound, sans-serif",
                  fontWeight: 700,
                  lineHeight: px(33.6, 20),
                }}
              >
                {t("pages.products.eggStory.ctaButton")}
              </span>
              <ArrowUpRight
                aria-hidden
                style={{ width: px(24, 12), height: px(24, 12), flexShrink: 0 }}
                color="#FDFDF5"
                strokeWidth={2}
              />
            </Link>
          </div>

          {/* ── 우: 모바일 가로 2줄 / 데스크탑 세로 2컬럼 무한 스크롤 ── */}
          <div className="w-full min-w-0 flex-1">
            <div className="flex w-full flex-col gap-2 md:hidden">
              <div className="h-[120px] w-full overflow-hidden">
                <MarqueeRow
                  items={ctaMarqueeMobileRowItems(ctaMarqueeMobileSetTopSrc)}
                  speed={55}
                  direction="left"
                  initialFrac={0}
                  gap={ctaMarqueeMobileGap}
                />
              </div>
              <div className="h-[120px] w-full overflow-hidden">
                <MarqueeRow
                  items={ctaMarqueeMobileRowItems(ctaMarqueeMobileSetBottomSrc)}
                  speed={48}
                  direction="right"
                  initialFrac={0.5}
                  gap={ctaMarqueeMobileGap}
                />
              </div>
            </div>
            <div
              className="hidden w-full md:flex md:h-[min(clamp(380px,calc(700*100vw/1920),700px),min(52vh,640px))]"
              style={{
                flex: 1,
                gap: px(20, 8),
                overflow: "hidden",
              }}
            >
              <MarqueeCol
                items={[...ctaMarqueeSet1]}
                speed={60}
                direction="up"
                initialFrac={0}
                gap={px(20, 8)}
              />
              <MarqueeCol
                items={[...ctaMarqueeSet2]}
                speed={50}
                direction="down"
                initialFrac={0.5}
                gap={px(20, 8)}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
    </EggStoryContentContext.Provider>
  );
}
