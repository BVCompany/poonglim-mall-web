/**
 * 계란이야기 페이지
 * 피그마 시안 기반 — 1920px 기준 clamp() 반응형
 * 계란 구조 섹션: 스크롤 sticky 스태킹 + fade-in 인터랙션
 */
import type { Route } from "./+types/egg-story";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { SectionTitleStar } from "~/core/components/section-title-star";

export function meta(_: Route.MetaArgs) {
  return [{ title: "계란이야기 | 풍림푸드" }];
}

/* ── 공통 clamp 헬퍼 ── */
const px = (base: number, min = base * 0.4) =>
  `clamp(${Math.round(min)}px,calc(${base}*100vw/1920),${base}px)`;

/* ── 데이터 ── */
const nutrients = [
  { letter: "P", name: "단백질", desc: "신체 기능에 필요한 고품질 단백질" },
  { letter: "A", name: "비타민 A", desc: "눈 건강과 면역 기능 지원" },
  { letter: "D", name: "비타민 D", desc: "뼈 건강에 도움" },
  { letter: "C", name: "콜린", desc: "두뇌와 신경 기능에 도움" },
];

const eggParts = [
  {
    title: "난황(노른자)",
    desc: "신선하고 안전한 프리미엄 액상 계란으로 편리한 조리를 경험하세요.",
    bg: "#FBE28A",
    img: "/intro/egg01.png",
  },
  {
    title: "난백 (흰자)",
    desc: "고품질 단백질이 풍부하게 포함되어 있습니다.",
    bg: "#C3C8AE",
    img: "/intro/egg02.png",
  },
  {
    title: "난각 (껍질)",
    desc: "계란을 보호하는 천연 보호막 역할을 합니다.",
    bg: "#FBFBFB",
    img: "/intro/egg03.png",
  },
  {
    title: "난막",
    desc: "계란 내부를 보호하는 얇은 막입니다.",
    bg: "#FDF7DA",
    titleSize: 24,
    img: "/intro/egg04.png",
  },
];

const eggFoods = [
  {
    name: "계란말이",
    sub: "Egg + katsuo bushi",
    bg: "#EAE3C9",
    img1: "/intro/prd01-1.png",
    img2: "/intro/prd01-2.png",
  },
  {
    name: "샌드위치",
    sub: "Egg + Sandwich",
    bg: "#D8E0A5",
    img1: "/intro/prd02-1.png",
    img2: "/intro/prd02-2.png",
  },
  {
    name: "푸딩",
    sub: "Egg + Pudding",
    bg: "#EED4C8",
    img1: "/intro/prd03-1.png",
    img2: "/intro/prd03-2.png",
  },
  {
    name: "샐러드",
    sub: "Egg + Delight",
    bg: "#F4F2E5",
    img1: "/intro/prd04-1.png",
    img2: "/intro/prd04-2.png",
  },
];

const eggPhilosophy = [
  { title: "품질", desc: "엄격한 기준을 통해\n신선한 원료만 사용합니다." },
  {
    title: "안전",
    desc: "위생적인 가공 공정을 통해\n안전한 제품을 생산합니다.",
  },
  {
    title: "연구",
    desc: "계란을 활용한 다양한 식품을\n지속적으로 연구합니다.",
  },
];

const steps = [
  { name: "원료선별", desc: "엄격한 기준을 통해 선별된 원료만 사용합니다." },
  { name: "위생 가공", desc: "식품 안전 기준에 맞춘 시설에서 생산됩니다." },
  { name: "품질 검사", desc: "모든 제품은 품질 검사를 거쳐 출고됩니다." },
  { name: "안전 유통", desc: "신선함을 유지한 상태로 고객에게 전달됩니다." },
];

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
   - 각 카드 앞에 70vh 스페이서(첫 카드 제외)를 두어
     IntersectionObserver가 카드마다 다른 스크롤 위치에서 발화
   - position: sticky + 점진적 top 오프셋으로 카드가 겹쳐 쌓임
   - opacity: 0 → 1, translateY(80px) → 0 fade-slide-in
*/
function EggPartsSection() {
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
   */
  const STRIP_H = 88; /* 이전 카드 제목이 노출되는 영역(px) */
  const BASE_TOP = 80; /* 네비바 여유 */

  const stickyTop = (i: number) => `${BASE_TOP + i * STRIP_H}px`;

  return (
    <div
      style={{
        paddingLeft: px(160),
        paddingRight: px(160),
        paddingTop: px(60),
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
                    fontSize: px(part.titleSize ?? 28, 18),
                    fontFamily: "NanumSquareRound, sans-serif",
                    fontWeight: 800,
                    lineHeight: px((part.titleSize ?? 28) * 1.5, 24),
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
                style={{ height: "70vh" }}
                aria-hidden
              />,
            ];
          }
          return [card];
        })}
        {/* 마지막 카드가 화면에 안착한 뒤 다음 섹션으로 자연스럽게 이어지도록 여유 공간 확보 */}
        <div style={{ height: "40vh" }} aria-hidden />
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

  const STRIP_H = 96; /* 이전 카드 타이틀이 노출되는 높이(px) */
  const BASE_TOP = 80;
  const stickyTop = (i: number) => `${BASE_TOP + i * STRIP_H}px`;

  return (
    <section style={{ background: "#02633E" }}>
      {/* ── 정적 헤더 ── */}
      <div
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
          계란은 다양한 음식에 활용됩니다
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
          Poonglim Characters Story
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
        <div>
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
                  style={{ height: "70vh" }}
                  aria-hidden
                />,
              ];
            }
            return [card];
          })}
          <div style={{ height: "40vh" }} aria-hidden />
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════
   영양소 섹션 — 스크롤 시 항목 순차 페이드인
   ══════════════════════════════════════════════════════
   구조:
   - 전체 섹션 height = (항목 수 × 75vh) + 100vh 로 스크롤 거리 확보
   - 내부 레이아웃은 position:sticky + height:100vh 으로 뷰포트에 고정
   - scroll 이벤트로 섹션 상단에서 얼마나 내려왔는지 계산
   - 75vh 스크롤마다 다음 항목이 페이드인
*/
function NutrientsSection() {
  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.top >= vh) return; // 아직 뷰포트 밖

      /* 섹션 상단이 뷰포트 상단을 지나친 거리(px) */
      const scrolledPast = Math.max(0, -rect.top);
      /* 75vh 스크롤마다 항목 하나씩 추가 */
      const itemsToShow = 1 + Math.floor(scrolledPast / (vh * 0.75));

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
      style={{
        position: "relative",
        background: "#EAE3C9",
        /* 충분한 스크롤 거리: 항목당 75vh + 초기 100vh */
        height: `${nutrients.length * 75 + 100}vh`,
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
              계란의 <br />
              주요 영양소
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

/* ══════════════════════════════════════════════════════
   계란 철학 섹션 — 배경 이미지 + 스크롤 순차 페이드인
   ══════════════════════════════════════════════════════
   순서: 타이틀(1) → 품질 카드(2) → 안전 카드(3) → 연구 카드(4)
   IntersectionObserver 로 섹션이 뷰포트에 들어오는 순간 한 번만 트리거
*/
function PhilosophySection() {
  const [visibleCount, setVisibleCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          setVisibleCount(1); // 타이틀
          setTimeout(() => setVisibleCount(2), 350); // 품질
          setTimeout(() => setVisibleCount(3), 650); // 안전
          setTimeout(() => setVisibleCount(4), 950); // 연구
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fade = (threshold: number): React.CSSProperties => ({
    opacity: visibleCount >= threshold ? 1 : 0,
    transform: visibleCount >= threshold ? "translateY(0)" : "translateY(28px)",
    transition: "opacity 0.7s ease, transform 0.7s ease",
  });

  return (
    <section
      ref={sectionRef}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* ── 배경 이미지 ── */}
      <img
        src="/intro/back01.png"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      {/* 가독성을 위한 어두운 녹색 오버레이 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 40, 24, 0.72)",
        }}
      />

      {/* ── 콘텐츠 ── */}
      <div
        className="px-4 py-12 md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:py-[clamp(44px,calc(110*100vw/1920),110px)]"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* 타이틀 페이드인 */}
        <h2
          style={{
            ...fade(1),
            color: "white",
            fontSize: px(60, 24),
            fontFamily: "NanumSquareRound, sans-serif",
            fontWeight: 800,
            lineHeight: px(84, 32),
            textAlign: "center",
            marginBottom: `clamp(24px,calc(60*100vw/1920),60px)`,
          }}
        >
          풍림푸드의 계란 철학
        </h2>

        {/* 카드 3장 순차 페이드인 */}
        <div className="flex flex-col gap-3 lg:flex-row lg:gap-[clamp(12px,calc(20*100vw/1920),20px)]">
          {eggPhilosophy.map((item, i) => (
            <div
              key={item.title}
              className="min-h-0 w-full lg:w-auto"
              style={{
                ...fade(i + 2),
                flex: "1 1 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: `clamp(10px,calc(40*100vw/1920),40px)`,
                minHeight: "clamp(140px, 28vw, 520px)",
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

/* CTA 마퀴 — 모바일 가로: m_product01~06(위) / 07~12(아래), 데스크탑 세로: 기존 제품 컷 */
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

const ctaMarqueeSet1 = [
  { src: "/intro/product03.png", h: px(420, 160) },
  { src: "/intro/product01.png", h: px(340, 130) },
  { src: "/intro/product05.jpg", h: px(380, 140) },
  { src: "/intro/product02.jpg", h: px(280, 110) },
  { src: "/intro/product04.png", h: px(310, 120) },
  { src: "/intro/product06.jpg", h: px(360, 140) },
] as const;

const ctaMarqueeSet2 = [
  { src: "/intro/product06.jpg", h: px(360, 140) },
  { src: "/intro/product02.jpg", h: px(420, 160) },
  { src: "/intro/product04.png", h: px(300, 110) },
  { src: "/intro/product01.png", h: px(380, 140) },
  { src: "/intro/product05.jpg", h: px(250, 100) },
  { src: "/intro/product03.png", h: px(340, 130) },
] as const;

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

/* ── 모바일 전용 (Figma 375) — 데스크탑은 md 이상에서 기존 섹션 유지 ── */
function EggHeroMobile() {
  /* Figma 375×300 히어로 — 좌표·크기를 컨테이너 비율로 환산 (데스크탑과 동일 public 스파클 사용) */
  return (
    <div className="relative mx-auto min-h-[300px] w-full max-w-[375px] pt-5 pb-5 md:hidden">
      <img
        src="/home/product-star.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 left-[10.67%] aspect-square w-[5.75%] max-w-[22px] object-contain select-none"
      />
      <img
        src="/home/intro-star.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-[86.33%] left-[22.93%] aspect-square w-[8.6%] max-w-[33px] object-contain select-none"
      />
      <img
        src="/home/company-intro-star.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-[8.33%] left-[75.73%] aspect-square w-[10.9%] max-w-[41px] object-contain select-none"
      />
      <span
        className="absolute top-[7.33%] left-[25.6%] z-10 rounded-[23px] border border-[#1F2121] bg-white px-2.5 py-2 text-[12px] font-bold whitespace-nowrap text-[#1F2121]"
        style={{
          fontFamily: "NanumSquareRound, sans-serif",
          lineHeight: "12px",
        }}
      >
        건강한
      </span>
      <span
        className="absolute top-[49%] left-[5.87%] z-10 rounded-[24px] border border-[#1F2121] bg-white px-2.5 py-2 text-[12px] font-bold whitespace-nowrap text-[#1F2121]"
        style={{
          fontFamily: "NanumSquareRound, sans-serif",
          lineHeight: "12px",
        }}
      >
        믿을 수 있는
      </span>
      <span
        className="absolute top-[27%] left-[76.27%] z-10 rounded-[23px] border border-[#1F2121] bg-white px-2.5 py-2 text-[12px] font-bold whitespace-nowrap text-[#1F2121]"
        style={{
          fontFamily: "NanumSquareRound, sans-serif",
          lineHeight: "12px",
        }}
      >
        간편한
      </span>
      <p
        className="absolute top-[13.67%] left-[35.73%] z-1 text-center text-[56px] leading-[56px] font-extrabold text-[#003F2B]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        EGG
      </p>
      <p
        className="absolute top-[35%] left-[14.93%] z-1 text-right text-[56px] leading-[56px] font-extrabold text-[#003F2B]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        계란 이야기
      </p>
      <p
        className="absolute top-[60.33%] left-1/2 w-[70.4%] max-w-[264px] -translate-x-1/2 text-center text-base leading-[25.6px] font-bold text-[#003F2B]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        작은 알 하나에 담긴 건강한 가치
        <br />
        풍림푸드는 매일 식탁에 오르는 계란의
        <br />
        가치를 연구합니다.
      </p>
    </div>
  );
}

function EggIntroYellowMobile() {
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
        자연이 만든 완전식품, 계란
      </h2>
      <p
        className="text-sm leading-[21px] font-bold text-[#1F2121]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        계란은 단백질, 비타민, 미네랄 등 우리 몸에 필요한 영양소를 고루 담고
        있는 대표적인 완전식품입니다.
      </p>
      <p
        className="text-sm leading-[21px] font-bold text-[#1F2121]"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        특히 계란 단백질은 인체에 이상적인 아미노산 구조를 가지고 있어
        영양학적으로 매우 높은 가치를 인정받고 있습니다.
        <br />
        <br />전 세계 식탁에서 사랑받는 식재료이며 다양한 요리에 활용됩니다.
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
  return (
    <section className="bg-[#EAE3C9] py-10 md:hidden">
      <div className="mb-5 flex items-center gap-[11px] px-4 pb-5">
        <SectionTitleStar variant="intro" className="h-[21px] w-[21px]" />
        <h2
          className="text-[18px] leading-[30px] font-extrabold text-[#003F2B]"
          style={{ fontFamily: "NanumSquareRound, sans-serif" }}
        >
          계란의 주요 영양소
        </h2>
      </div>
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
                {n.letter === "P"
                  ? "신체 기능에 필요한\n고품질 단백질"
                  : n.letter === "A"
                    ? "눈 건강과\n면역 기능 지원"
                    : n.letter === "C"
                      ? "두뇌와\n신경 기능에 도움"
                      : n.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FoodSectionMobile() {
  return (
    <section className="bg-[#02633E] py-10 md:hidden">
      <div className="mb-5 flex items-center gap-[11px] px-4">
        <SectionTitleStar variant="intro" className="h-[21px] w-[21px]" />
        <h2
          className="text-[18px] leading-[30px] font-extrabold text-[#EAE3C9]"
          style={{ fontFamily: "NanumSquareRound, sans-serif" }}
        >
          계란은 다양한 음식에 활용됩니다
        </h2>
      </div>
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
    <div
      className={`flex items-center gap-[11px] pb-5 md:hidden ${omitHorizontalPadding ? "" : "px-4"}`}
    >
      <SectionTitleStar variant="intro" className="h-[21px] w-[21px]" />
      <h2
        className="text-[18px] leading-[30px] font-extrabold"
        style={{
          fontFamily: "NanumSquareRound, sans-serif",
          color: titleColor,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   메인 페이지
   ══════════════════════════════════════════════════════ */
export default function EggStoryScreen() {
  return (
    <div className="min-h-screen bg-[#F4F2E5]">
      {/* ── 브레드크럼 ── */}
      <Breadcrumb
        items={[
          { label: "제품소개", href: "/products/all" },
          { label: "계란이야기" },
        ]}
      />

      {/* ══════════════════════════════════════════
          1. HERO
          피그마: pt-160 pb-100 px-40, 내부 1600×350 박스
      ══════════════════════════════════════════ */}
      <section className="w-full bg-[#F4F2E5]">
        <EggHeroMobile />
        {/* 외부 여백 래퍼 — pt:160 pb:100 px:40 */}
        <div
          className="hidden flex-col items-center md:flex"
          style={{
            paddingTop: px(160),
            paddingBottom: px(100),
            paddingLeft: px(40),
            paddingRight: px(40),
          }}
        >
          {/* 내부 1600×350 박스 — overflow hidden, border-radius 40 */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              maxWidth: px(1600),
              height: px(350, 140),
              borderRadius: px(40),
            }}
          >
            {/* ── 장식 스파클 (1600×350 기준 % 좌표) ── */}
            {/* product-star: left 351/1600=21.9%, top 18/350=5.1% */}
            <img
              src="/home/product-star.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute select-none"
              style={{
                left: "21.9%",
                top: "5.1%",
                width: px(38, 16),
                height: px(38, 16),
              }}
            />
            {/* company-intro-star: left 1296/1600=81%, top 0 */}
            <img
              src="/home/company-intro-star.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute select-none"
              style={{
                left: "81%",
                top: 0,
                width: px(72, 28),
                height: px(72, 28),
              }}
            />
            {/* intro-star: left 1037/1600=64.8%, top 219/350=62.6% */}
            <img
              src="/home/intro-star.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute select-none"
              style={{
                left: "64.8%",
                top: "62.6%",
                width: px(53, 22),
                height: px(53, 22),
              }}
            />

            {/* ── 플로팅 뱃지 (1600×350 기준 % 좌표) ── */}
            {/* 건강한: left 602/1600=37.6%, top 78/350=22.3% */}
            {/* 믿을 수 있는: left 369/1600=23.1%, top 182/350=52% */}
            {/* 간편한: left 1103/1600=68.9%, top 165/350=47.1% */}
            {(
              [
                { text: "건강한", style: { left: "37.6%", top: "22.3%" } },
                { text: "믿을 수 있는", style: { left: "23.1%", top: "52%" } },
                { text: "간편한", style: { left: "68.9%", top: "47.1%" } },
              ] as const
            ).map(({ text, style: pos }) => (
              <span
                key={text}
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
                }}
              >
                {text}
              </span>
            ))}

            {/* ── 텍스트 블록: 수평 중앙, top 78/350 = 22.3% ── */}
            {/* 피그마: gap 30px between title and subtitle */}
            <div
              className="absolute right-0 left-0 flex flex-col items-center"
              style={{
                top: "22.3%",
                gap: px(30, 10),
                paddingLeft: "26%",
                paddingRight: "26%",
              }}
            >
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
                EGG 계란 이야기
              </h1>
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
                작은 알 하나에 담긴 건강한 가치&nbsp;&nbsp;&nbsp; 풍림푸드는
                매일 식탁에 오르는 계란의 가치를 연구합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. 자연이 만든 완전식품, 계란 (Yellow)
      ══════════════════════════════════════════ */}
      <section
        className="w-full overflow-hidden"
        style={{ background: "#F3BC1E" }}
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
          <div className="flex flex-col items-start gap-[clamp(12px,calc(20*100vw/1920),20px)] lg:flex-row">
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
                    alt={`계란 이미지 ${name}`}
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
                    alt={`계란 이미지 ${name}`}
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
                alt="자연이 만든 완전식품 계란"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(179deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0) 70%)",
                }}
              />
              <div
                className="absolute flex flex-col items-center gap-[clamp(8px,calc(10*100vw/1920),10px)] text-center"
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
                  <span style={{ color: "white" }}>자연이 만든 완전식품, </span>
                  <span style={{ color: "#F3BC1E" }}>계란</span>
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
                  계란은 단백질, 비타민, 미네랄 등 우리 몸에 필요한 영양소를
                  고루 담고 있는 대표적인 완전식품입니다.
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
                  특히 계란 단백질은 인체에 이상적인 아미노산 구조를 가지고 있어
                  영양학적으로 매우 높은 가치를 인정받고 있습니다.
                  <br />
                  <br />전 세계 식탁에서 사랑받는 식재료이며 다양한 요리에
                  활용됩니다.
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
      <section className="w-full bg-[#F4F2E5]">
        <div className="py-[50px] md:hidden">
          <SectionTitleMobile
            title="계란은 이렇게 이루어져 있습니다"
            titleColor="#1F2121"
          />
          <EggPartsSectionMobile />
        </div>
        <div className="hidden md:block">
          {/* 섹션 헤더 */}
          <div
            className="flex items-center justify-center gap-[clamp(12px,calc(20*100vw/1920),20px)]"
            style={{
              paddingTop: px(110),
              paddingBottom: px(60),
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
              계란은 이렇게 이루어져 있습니다
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
      <section className="w-full bg-white">
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
            좋은 계란을 고르는 방법
          </h2>
        </div>

        {/* 모바일: px-16 py-40 · 데스크탑: 좌우 대형 패딩 + 상단 간격 */}
        {/* ── 피그마 모바일: 전폭 유동 열, 행 높이 140, gap 10, radius 10 ── */}
        {/* ── 피그마 데스크탑: gap-20, 좌 풀높이 + 우 2×320 ── */}
        <div className="px-4 pt-10 pb-10 md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:pt-[clamp(24px,calc(60*100vw/1920),60px)] md:pb-[clamp(44px,calc(110*100vw/1920),110px)]">
          <SectionTitleMobile
            omitHorizontalPadding
            title="좋은 계란을 고르는 방법"
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
                  alt="껍질 상태 확인"
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
                    껍질 상태 확인
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
                    껍질이 깨지지 않고 깨끗한 계란을 선택하세요.
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
                  alt="냉장 보관 제품 선택"
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
                    냉장 보관 제품 선택
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
                    계란은 냉장 상태로 보관된 제품이 좋습니다.
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
                  alt="신선도 확인"
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
                    신선도 확인
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
                    구입 후 가능한 빠르게 섭취하는 것이 좋습니다.
                  </p>
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
          8. 계란이 식탁에 오기까지 (White)
      ══════════════════════════════════════════ */}
      <section className="w-full bg-white px-4 py-10 md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:py-0 md:pt-[clamp(40px,calc(100*100vw/1920),100px)] md:pb-[clamp(64px,calc(160*100vw/1920),160px)]">
        <div className="md:hidden">
          <SectionTitleMobile
            omitHorizontalPadding
            title="계란이 식탁에 오기까지"
          />
          {/* 모바일: px-4 패딩 안에서 전폭 유동 (375 시안 343열 비율 고정 제거) */}
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
        </div>

        <div className="hidden md:block">
          {/* 헤더 */}
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
              계란이 <br />
              식탁에 오기까지
            </h2>
            <div style={{ marginTop: px(22, 10) }}>
              <StarDeco />
            </div>
          </div>

          {/* STEP 리스트 — 피그마: justify-between, align-items center */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p
              className="hidden lg:block"
              style={{
                color: "#1F2121",
                fontSize: px(100, 36),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 700,
                lineHeight: px(130, 48),
                minWidth: px(412, 60),
              }}
            >
              4
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: px(30, 16),
              }}
            >
              {steps.map((step) => (
                <div
                  key={step.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: px(40, 16),
                    width: px(716, 300),
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

            <p
              className="hidden lg:block"
              style={{
                color: "#1F2121",
                fontSize: px(100, 36),
                fontFamily: "NanumSquareRound, sans-serif",
                fontWeight: 800,
                lineHeight: px(130, 48),
              }}
            >
              STEP
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. 풍림푸드의 계란 제품 CTA (Ivory)
      ══════════════════════════════════════════ */}
      <section className="relative z-0 w-full overflow-hidden bg-[#EAE3C9] px-4 pt-10 pb-[100px] md:px-[clamp(64px,calc(160*100vw/1920),160px)] md:py-[clamp(40px,calc(80*100vw/1920),80px)]">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-[clamp(32px,calc(120*100vw/1920),120px)]">
          {/* ── 좌: 텍스트 + CTA (피그마: width 758px, gap 40px) ── */}
          <div className="flex w-full max-w-full shrink-0 flex-col items-center gap-5 text-center md:w-[clamp(260px,calc(758*100vw/1920),758px)] md:items-start md:gap-[clamp(20px,calc(40*100vw/1920),40px)] md:text-left">
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
                풍림푸드의 계란 제품
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
                풍림푸드의 다양한 식품을 확인해 보세요.
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
                제품 보러가기
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
              className="hidden h-[min(380px,55vh)] w-full md:flex md:h-[clamp(380px,calc(700*100vw/1920),700px)]"
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
  );
}
