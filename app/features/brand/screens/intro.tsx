/**
 * 회사소개 페이지
 * 섹션: 히어로 슬라이더 → CEO 인용 → 경영 철학 → 공식 캐릭터
 */
import type { Route } from "./+types/intro";

import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

/* ── 슬라이더 데이터 — 이미지 기준 스파클 3개 위치 공통 적용 ── */
const SPARKLES = [
  // 연한 녹색 큰 별 — 숫자 왼쪽 상단
  {
    src: "/home/company-intro-star.png",
    size: 42,
    style: { left: "14%", top: "22%" },
  },
  // 금색 큰 별 — 왼쪽 하단
  {
    src: "/home/intro-star.png",
    size: 30,
    style: { left: "2%", bottom: "24%" },
  },
  // 금색 작은 별 — 하단 조금 더 오른쪽
  {
    src: "/home/star_icon.png",
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
    insetBg: "#F2EBD5",
    greeting: "안녕, 난 에디야.\n기쁨이 넘치는 시간을 선사해줄게!",
    accentText: "일상 속 '기쁨'을 선사하는 계란, 에디를 소개합니다.",
    accentColor: "#C8860A",
    body: "언제나 곁에 있어주는 따뜻하고 포근한 친구 '에디'. 하늘의 작은 기쁨을 나누고,\n든든함과 동시에 사랑스러움까지 겸비한 우리의 단짝친구!",
    bodyColor: "#003F2B",
    greetingColor: "#003F2B",
    nameColor: "#FFFFFF",
    nameEnColor: "rgba(255,255,255,0.5)",
    imageLeft: true,
    showcaseFilter:
      "drop-shadow(2px 0 0 rgba(255,255,255,0.9)) drop-shadow(-2px 0 0 rgba(255,255,255,0.9)) drop-shadow(0 2px 0 rgba(255,255,255,0.9)) drop-shadow(0 -2px 0 rgba(255,255,255,0.9))",
  },
  {
    id: "pudi",
    name: "푸디",
    nameEn: "Pudding + Dessert",
    showcaseImage: "/intro/puding.png",
    sceneImage: "/intro/pudings.png",
    mainBg: "#F5C842",
    insetBg: "#1F2121",
    greeting: "반가워, 난 푸디.\n달콤함이 가득한 하루를 만들어줄게!",
    accentText: "일상 속 '달콤함'을 채우는 푸딩, 푸디를 소개합니다.",
    accentColor: "#F5C842",
    body: "한입 베어물면 풍림푸드 피지는 달콤한 친구 '푸디'. 우리의 일상을 소소한 행복으로\n가득 채워주는 작고 귀여운, 통통히는 매력을 가진 존재랍니다!",
    bodyColor: "rgba(255,255,255,0.65)",
    greetingColor: "#FFFFFF",
    nameColor: "#1F2121",
    nameEnColor: "rgba(31,33,33,0.5)",
    imageLeft: false,
    showcaseFilter:
      "drop-shadow(5px 0 0 white) drop-shadow(-5px 0 0 white) drop-shadow(0 5px 0 white) drop-shadow(0 -5px 0 white) drop-shadow(3.5px 3.5px 0 white) drop-shadow(-3.5px 3.5px 0 white) drop-shadow(3.5px -3.5px 0 white) drop-shadow(-3.5px -3.5px 0 white)",
  },
];

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
const EXT = [SLIDES[N - 1], ...SLIDES, SLIDES[0]]; // length = N + 2

export default function BrandIntroScreen() {
  const [pos, setPos] = useState(1); // extended 배열 index (1 = 첫 실제 슬라이드)
  const [animated, setAnimated] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // pos 변경 후 경계(clone) 도달 시 순간이동
  useEffect(() => {
    if (pos === EXT.length - 1) {
      // clone-first 에 도달 → 트랜지션 완료 후 pos=1 텔레포트
      const t = setTimeout(() => {
        setAnimated(false);
        setPos(1);
      }, 760);
      return () => clearTimeout(t);
    }
    if (pos === 0) {
      // clone-last 에 도달 → 트랜지션 완료 후 pos=N 텔레포트
      const t = setTimeout(() => {
        setAnimated(false);
        setPos(N);
      }, 760);
      return () => clearTimeout(t);
    }
  }, [pos]);

  // 텔레포트 직후 animation 재활성화 (React 렌더링 완료 후)
  useEffect(() => {
    if (!animated) {
      const t = setTimeout(() => setAnimated(true), 30);
      return () => clearTimeout(t);
    }
  }, [animated]);

  // 자동 진행
  useEffect(() => {
    timerRef.current = setInterval(() => setPos((p) => p + 1), 3500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full bg-[#F5F2E8]">
      {/* ── 브레드크럼 — PC만 표시 (PageBanner 와 동일하게 모바일 hidden) ── */}
      <div className="mx-40 hidden border-b border-gray-200 py-3 md:block">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#003F2B]">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <span>회사소개</span>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <span className="font-medium text-[#003F2B]">회사소개</span>
        </nav>
      </div>

      {/* ══════════════════════════════════════════
          섹션 1: 히어로 슬라이더
          - 섹션 높이: 640px (30 520px + 년의전통 68px + 여백을 수용)
          - 숫자 패널: 58vw → 다음 슬라이드 7vw peek (overflow:hidden으로 클립)
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: "#F5F2E8", height: 795 }}
      >
        {/* 좌: 고정 텍스트 — px-3 sm:px-4 md:px-6 lg:px-10 (헤더 nav 내부와 동일) */}
        <div
          className="absolute top-0 bottom-0 left-0 z-10 hidden flex-col justify-start md:flex md:pl-6 lg:pl-40"
          style={{ width: "35%", paddingTop: 100, background: "#F5F2E8" }}
        >
          <h1
            style={{
              fontSize: 72,
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
              fontSize: 20,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#003F2B",
              lineHeight: 1.65,
            }}
          >
            1994년 설립 이래 30년간 축적된 노하우와
            <br />
            혁신적인 기술로 고객의 건강하고
            <br />
            풍요로운 일상을 만들어가고 있습니다.
          </p>
        </div>

        {/* 우: 숫자 슬라이드 트랙 — 섹션 full width 기준, left:35% right:0 → peek 발생
              스파클은 각 슬라이드 패널 내부에 position:absolute 로 배치 */}
        <div
          className="absolute inset-y-0 hidden md:block"
          style={{ left: "35%", right: 0 }}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translateX(calc(-${pos} * 58vw))`,
              transition: animated
                ? "transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)"
                : "none",
              willChange: "transform",
            }}
          >
            {EXT.map((slide, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  width: "58vw",
                  flexShrink: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  paddingTop: 250,
                  alignItems: "flex-start",
                }}
              >
                {/* 슬라이드별 별 이미지 스파클 — 패널 기준 absolute */}
                {slide.sparkles.map((sp, si) => (
                  <Sparkle
                    key={si}
                    src={sp.src}
                    size={sp.size}
                    style={{ ...sp.style, zIndex: 5 }}
                  />
                ))}

                {/* "30" + "년의 전통" 하단 정렬, "+" 는 "30" 좌상단에 absolute */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    lineHeight: 1,
                  }}
                >
                  {/* 숫자 — relative 로 "+" absolute 기준점 */}
                  <span
                    style={{
                      position: "relative",
                      fontSize: "clamp(120px, 27vw, 390px)",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      color: "#003F2B",
                      lineHeight: 1,
                    }}
                  >
                    {slide.num}
                    {/* "+" — 숫자 우상단에 absolute */}
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        right: "-0.6em",
                        fontSize: "clamp(42px, 7.5vw, 108px)",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        color: "#003F2B",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </span>
                  {/* 단위 — 숫자와 하단 정렬 */}
                  <span
                    style={{
                      fontSize: "clamp(18px, 3.5vw, 51px)",
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "#003F2B",
                      lineHeight: 1,
                      marginLeft: "0.3em",
                    }}
                  >
                    {slide.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 모바일: 텍스트 상단 + peek 슬라이더 */}
        <div className="flex h-full flex-col justify-start px-4 pt-12 md:hidden">
          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#003F2B",
              lineHeight: 1.15,
              marginBottom: 14,
            }}
          >
            Poonglim,
            <br />
            Brand Story
          </h1>
          <p
            style={{
              fontSize: 15,
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#666",
              lineHeight: 1.65,
              marginBottom: 28,
            }}
          >
            1994년 설립 이래 30년간 축적된 노하우와
            <br />
            혁신적인 기술로 고객의 건강하고
            <br />
            풍요로운 일상을 만들어가고 있습니다.
          </p>

          {/* 모바일 peek 슬라이더: 패널 80vw → 20vw peek */}
          <div className="-mx-4 overflow-hidden">
            <div
              className="flex"
              style={{
                transform: `translateX(calc(-${pos} * 80vw))`,
                transition: animated
                  ? "transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)"
                  : "none",
              }}
            >
              {EXT.map((slide, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 pl-3"
                  style={{ width: "80vw" }}
                >
                  {/* 모바일도 동일: 한 줄 [숫자][+ 상단][단위 하단] */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      lineHeight: 1,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "clamp(72px, 18vw, 120px)",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        color: "#003F2B",
                        lineHeight: 1,
                      }}
                    >
                      {slide.num}
                    </span>
                    <span
                      style={{
                        alignSelf: "flex-start",
                        fontSize: "clamp(28px, 7vw, 48px)",
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        color: "#003F2B",
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(14px, 3.5vw, 22px)",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: "#003F2B",
                        lineHeight: 1,
                        paddingBottom: "0.1em",
                      }}
                    >
                      {slide.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 섹션 2: CEO 인사말 ══
          헤더와 동일한 max-w-[1680px] mx-auto 컨테이너 사용
          → 1920px 기준: 컨테이너 margin 120px + px-10(40px) = 로고 left 160px
          레이블·인용문: left:40px (컨테이너 내부 = 헤더 로고 정렬)
          사진+텍스트:  left:24% of 1680px = 403px + 120px margin = 523px from viewport
                        → 사진 중심 523+265=788px ≈ 41%
          섹션 높이: 57vw → 1920px에서 1094px
      ══ */}
      <section
        className="relative hidden bg-[#F5F2E8] md:block"
        style={{ height: "clamp(700px, 57vw, 1095px)" }}
      >
        <div
          className="relative mx-auto"
          style={{ maxWidth: 1680, height: "100%" }}
        >
          {/* 상단 레이블 — 헤더 로고(40px) 기준 */}
          <div
            style={{
              position: "absolute",
              top: "clamp(32px, 2.5vw, 48px)",
              left: 40,
              display: "flex",
              alignItems: "center",
              gap: 8,
              zIndex: 20,
            }}
          >
            <img
              src="/home/product-star.png"
              alt=""
              style={{ width: 16, height: 16 }}
            />
            <span
              style={{
                fontSize: "clamp(14px, 1.46vw, 28px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                color: "#003F2B",
              }}
            >
              CEO 인사말
            </span>
          </div>

          {/* 인용문 — 40px 시작, z-10으로 사진 위에 걸쳐짐 */}
          <div
            style={{
              position: "absolute",
              left: 100,
              top: "clamp(90px, 7vw, 134px)",
              width: "clamp(300px, 52%, 1000px)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <blockquote
              style={{
                fontSize: "clamp(36px, 3.75vw, 72px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
                color: "#003F2B",
              }}
            >
              "고객의 건강이
              <br />곧 우리의 사명입니다"
            </blockquote>
          </div>

          {/* 사진 + 우측 텍스트 — flex row, 수직 중앙 정렬
               left:25% of 1680px = 420px → 1920px viewport 기준 420+120=540px
               사진 중심: 540+265=805px ≈ 42% = 레퍼런스 기준 정렬
               인용문 우측 끝(1033px)이 사진(540~1070px) 내에 걸쳐 "다" 오버랩 */}
          <div
            style={{
              position: "absolute",
              left: "30%",
              right: 40,
              top: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* CEO 사진 530×650 */}
            <div style={{ position: "relative", flexShrink: 0, zIndex: 5 }}>
              <img
                src="/intro/president_img.png"
                alt="풍림푸드 대표이사 정언현"
                style={{
                  width: "clamp(280px, 27.6vw, 530px)",
                  height: "clamp(344px, 33.9vw, 650px)",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              {/* 스파클 — 사진 좌하단 2개 */}
              <img
                src="/home/intro-star.png"
                alt=""
                style={{
                  position: "absolute",
                  left: "-10%",
                  bottom: "28%",
                  width: "clamp(20px, 1.7vw, 32px)",
                }}
              />
              <img
                src="/home/star_icon.png"
                alt=""
                style={{
                  position: "absolute",
                  left: "-4%",
                  bottom: "14%",
                  width: "clamp(12px, 1vw, 20px)",
                }}
              />
              {/* 스파클 — 사진 우상단 큰 별 */}
              <img
                src="/home/company-intro-star.png"
                alt=""
                style={{
                  position: "absolute",
                  top: "8%",
                  right: "-12%",
                  width: "clamp(40px, 3.5vw, 68px)",
                }}
              />
            </div>

            {/* 우측 CEO 인사말 텍스트 */}
            <div
              style={{
                marginLeft: "clamp(32px, 3vw, 58px)",
                maxWidth: "clamp(260px, 25vw, 480px)",
                flexShrink: 0,
              }}
            >
              {/* CEO 인사말 레이블 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <img
                  src="/home/product-star.png"
                  alt=""
                  style={{ width: 16, height: 16 }}
                />
                <span
                  style={{
                    fontSize: "clamp(16px, 1.46vw, 28px)",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#003F2B",
                  }}
                >
                  CEO 인사말
                </span>
              </div>

              {/* 본문 단락 */}
              <div
                style={{
                  color: "#003F2B",
                  fontSize: "clamp(13px, 0.83vw, 16px)",
                  fontWeight: 700,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.8,
                }}
              >
                <p>
                  풍림푸드는 1994년 작은 식품 제조업체로 시작하여, 오늘날
                  대한민국을 대표하는 프리미엄 식품 전문기업으로 성장했습니다.
                </p>
                <p style={{ marginTop: 16 }}>
                  우리는 단순히 제품을 만드는 것이 아니라, 고객의 건강하고
                  풍요로운 일상을 만들어가는 파트너가 되고자 합니다. 엄선된
                  원료와 첨단 기술, 그리고 30년간 축적된 노하우를 바탕으로 최고
                  품질의 제품을 선보이고 있습니다.
                </p>
                <p style={{ marginTop: 16 }}>
                  앞으로도 풍림푸드는 지속가능한 경영과 사회적 책임을 다하며,
                  고객과 함께 성장하는 기업이 되겠습니다.
                </p>
              </div>

              {/* 서명 */}
              <p
                style={{
                  marginTop: 32,
                  fontSize: "clamp(14px, 0.94vw, 18px)",
                  fontWeight: 400,
                  letterSpacing: "-0.04em",
                  color: "#003F2B",
                }}
              >
                풍림푸드 대표이사 <span style={{ marginLeft: 16 }}>정언현</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 모바일 CEO 섹션 */}
      <section className="bg-[#F5F2E8] px-4 py-12 md:hidden">
        <div className="mb-3 flex items-center gap-2">
          <img src="/home/star_icon.png" alt="" className="h-4 w-4" />
          <span className="text-xs font-semibold tracking-widest text-[#003F2B] uppercase">
            CEO 인사말
          </span>
        </div>
        <div
          className="mx-auto mb-6 overflow-hidden rounded-full"
          style={{ width: 200, height: 250 }}
        >
          <img
            src="/intro/president_img.png"
            alt="풍림푸드 대표이사 정언현"
            className="h-full w-full object-cover"
          />
        </div>
        <blockquote
          className="mb-6 leading-tight font-extrabold text-[#003F2B]"
          style={{ fontSize: 28, letterSpacing: "-0.04em" }}
        >
          "고객의 건강이
          <br />곧 우리의 사명입니다"
        </blockquote>
        <div className="space-y-3 text-sm leading-relaxed text-[#003F2B]">
          <p>
            풍림푸드는 1994년 작은 식품 제조업체로 시작하여, 오늘날 대한민국을
            대표하는 프리미엄 식품 전문기업으로 성장했습니다.
          </p>
          <p>
            우리는 단순히 제품을 만드는 것이 아니라, 고객의 건강하고 풍요로운
            일상을 만들어가는 파트너가 되고자 합니다.
          </p>
        </div>
        <p className="mt-6 text-sm font-semibold text-[#003F2B]">
          풍림푸드 대표이사 <span className="ml-2">정언현</span>
        </p>
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
        style={{ backgroundColor: "#EAE3C9", borderRadius: "40px 40px 0 0" }}
      >
        <div
          className="mx-auto"
          style={{ maxWidth: 1680, padding: "80px 40px 80px" }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 80 }}>
            {/* 좌측: 레이블 + 제목 */}
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <img
                  src="/home/product-star.png"
                  alt=""
                  style={{ width: 16, height: 16 }}
                />
                <span
                  style={{
                    fontSize: "clamp(14px, 1.46vw, 28px)",
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
                  fontSize: "clamp(28px, 2.92vw, 56px)",
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

            {/* 우측: 2컬럼 × 3행 카드 (452×520, gap 8px) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "452px 452px",
                gap: 8,
                flexShrink: 0,
              }}
            >
              {PHILOSOPHIES.map(({ category, desc, image, bg, highlight }) => (
                <div
                  key={category}
                  style={{
                    backgroundColor: bg,
                    width: 452,
                    height: 520,
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    padding: 28,
                    overflow: "hidden",
                  }}
                >
                  {/* 뱃지 — 16px -4% 800 */}
                  <span
                    style={{
                      display: "inline-block",
                      borderRadius: 100,
                      padding: "4px 12px",
                      fontSize: "clamp(11px, 0.83vw, 16px)",
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
                      fontSize: "clamp(16px, 1.46vw, 28px)",
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
                      style={{ width: 160, height: 160, objectFit: "contain" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 경영 철학 — 모바일 */}
      <section
        className="md:hidden"
        style={{ backgroundColor: "#EAE3C9", padding: "48px 16px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <img
            src="/home/product-star.png"
            alt=""
            style={{ width: 14, height: 14 }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#003F2B",
              letterSpacing: "0.1em",
            }}
          >
            경영 철학
          </span>
        </div>
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.25,
            color: "#003F2B",
            marginBottom: 24,
          }}
        >
          6가지 핵심 가치로
          <br />더 나은 미래를
          <br />
          만들어갑니다.
        </h2>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {PHILOSOPHIES.map(({ category, desc, image, bg, highlight }) => (
            <div
              key={category}
              style={{
                backgroundColor: bg,
                borderRadius: 16,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                minHeight: 200,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  borderRadius: 100,
                  padding: "2px 8px",
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: highlight
                    ? "rgba(0,0,0,0.08)"
                    : "rgba(0,63,43,0.07)",
                  color: "#003F2B",
                  marginBottom: 8,
                  alignSelf: "flex-start",
                }}
              >
                {category}
              </span>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#003F2B",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.4,
                }}
              >
                {desc}
              </p>
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
                  style={{ width: 70, height: 70, objectFit: "contain" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 섹션 4: 공식 캐릭터 (PC) ══ */}
      <section
        className="hidden md:block"
        style={{ backgroundColor: "#F5F2E8", padding: "100px 0" }}
      >
        <div style={{ maxWidth: 1680, margin: "0 auto", padding: "0 40px" }}>
          {/* 헤더 */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              style={{
                fontSize: "clamp(36px, 3.65vw, 70px)",
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
                fontSize: "clamp(12px, 0.73vw, 14px)",
                color: "#C9A84C",
                letterSpacing: "0.08em",
              }}
            >
              Poonglim Characters Story
            </p>
          </div>

          {/* 캐릭터 카드 목록 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                showcaseFilter,
              }) => (
                <div
                  key={id}
                  style={{
                    backgroundColor: mainBg,
                    borderRadius: 24,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: imageLeft ? "row" : "row-reverse",
                    height: "clamp(400px, 26vw, 500px)",
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
                        height: "clamp(200px, 16vw, 300px)",
                        objectFit: "contain",
                        ...(showcaseFilter ? { filter: showcaseFilter } : {}),
                      }}
                    />
                    <p
                      style={{
                        fontSize: "clamp(18px, 1.25vw, 24px)",
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
                        fontSize: "clamp(11px, 0.73vw, 14px)",
                        color: nameEnColor,
                      }}
                    >
                      {nameEn}
                    </p>
                  </div>

                  {/* 스토리 서브카드 */}
                  <div style={{ flex: 1, padding: 16, display: "flex" }}>
                    <div
                      style={{
                        backgroundColor: insetBg,
                        borderRadius: 16,
                        flex: 1,
                        padding: "clamp(24px, 2.6vw, 48px)",
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
                          height: "clamp(60px, 5.2vw, 100px)",
                          objectFit: "contain",
                          marginBottom: "clamp(12px, 1.25vw, 24px)",
                        }}
                      />
                      <p
                        style={{
                          fontSize: "clamp(18px, 1.67vw, 32px)",
                          fontWeight: 800,
                          color: greetingColor,
                          letterSpacing: "-0.04em",
                          lineHeight: 1.25,
                          whiteSpace: "pre-line",
                          marginBottom: "clamp(8px, 0.73vw, 14px)",
                        }}
                      >
                        {greeting}
                      </p>
                      <p
                        style={{
                          fontSize: "clamp(13px, 0.94vw, 18px)",
                          fontWeight: 800,
                          color: accentColor,
                          letterSpacing: "-0.04em",
                          marginBottom: "clamp(8px, 0.73vw, 14px)",
                        }}
                      >
                        {accentText}
                      </p>
                      <p
                        style={{
                          fontSize: "clamp(11px, 0.73vw, 14px)",
                          fontWeight: 700,
                          letterSpacing: "-0.04em",
                          color: bodyColor,
                          lineHeight: 1.75,
                          whiteSpace: "pre-line",
                        }}
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

      {/* ══ 섹션 4: 공식 캐릭터 (모바일) ══ */}
      <section
        className="block md:hidden"
        style={{ backgroundColor: "#F5F2E8", padding: "60px 16px" }}
      >
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#003F2B",
              letterSpacing: "-0.04em",
              marginBottom: 8,
            }}
          >
            풍림푸드 공식 캐릭터
          </h2>
          <p
            style={{ fontSize: 11, color: "#C9A84C", letterSpacing: "0.08em" }}
          >
            Poonglim Characters Story
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                style={{
                  backgroundColor: mainBg,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 32,
                    paddingBottom: 8,
                  }}
                >
                  <img
                    src={showcaseImage}
                    alt={name}
                    style={{ height: 180, objectFit: "contain" }}
                  />
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: nameColor,
                      letterSpacing: "-0.04em",
                      marginTop: 12,
                    }}
                  >
                    {name}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: nameEnColor,
                      marginTop: 4,
                      marginBottom: 16,
                    }}
                  >
                    {nameEn}
                  </p>
                </div>
                <div
                  style={{
                    margin: "0 12px 12px",
                    backgroundColor: insetBg,
                    borderRadius: 12,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={sceneImage}
                    alt={`${name} scene`}
                    style={{
                      height: 60,
                      objectFit: "contain",
                      marginBottom: 16,
                    }}
                  />
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: greetingColor,
                      letterSpacing: "-0.04em",
                      lineHeight: 1.3,
                      whiteSpace: "pre-line",
                      marginBottom: 10,
                    }}
                  >
                    {greeting}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: accentColor,
                      marginBottom: 10,
                    }}
                  >
                    {accentText}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: bodyColor,
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* ══ 섹션 5: 회사소개서 다운로드 (PC) ══ */}
      <section className="hidden md:block" style={{ backgroundColor: "#F5F2E8", padding: "72px 0 200px" }}>
        <div
          style={{
            maxWidth: 1600,
            margin: "0 auto",
            padding: "0",
            display: "flex",
            alignItems: "center",
            gap: 80,
          }}
        >
          {/* 좌: 텍스트 */}
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: "clamp(12px, 0.73vw, 14px)",
                color: "#222",
                marginBottom: 16,
                letterSpacing: "-0.02em",
              }}
            >
              풍림푸드를 더 자세히 알아보세요!
            </p>
            <h2
              style={{
                fontSize: "clamp(22px, 1.87vw, 32px)",
                fontWeight: 800,
                color: "#003F2B",
                letterSpacing: "-0.04em",
                lineHeight: 1.3,
              }}
            >
              풍림푸드의 기업 철학, 사업 영역,
              <br />
              주요 제품 라인업을 확인하실 수 있습니다.
            </h2>
          </div>

          {/* 우: 다운로드 카드 */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {[
              { label: "회사소개서", size: "PDF, 12.5MB", href: "#" },
              { label: "Company Brochure", size: "PDF, 12.5MB", href: "#" },
            ].map(({ label, size, href }) => (
              <a
                key={label}
                href={href}
                download
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: "0 24px",
                  border: "1px solid #E0D9C8",
                  textDecoration: "none",
                  width: 457,
                  height: 133,
                  flexShrink: 0,
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                {/* 문서 아이콘 */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    backgroundColor: "#003F2B",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
                {/* 텍스트 */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "clamp(13px, 0.83vw, 16px)",
                      fontWeight: 700,
                      color: "#1A1A1A",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      fontSize: "clamp(11px, 0.63vw, 12px)",
                      color: "#999",
                      marginTop: 3,
                    }}
                  >
                    {size}
                  </p>
                </div>
                {/* 다운로드 아이콘 */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ flexShrink: 0 }}
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

      {/* ══ 섹션 5: 회사소개서 다운로드 (모바일) ══ */}
      <section
        className="block md:hidden"
        style={{ backgroundColor: "#F5F2E8", borderTop: "1px solid #DDD8C8", padding: "48px 20px 60px" }}
      >
        {/* 상단: 텍스트 */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 12, color: "#777", marginBottom: 10, letterSpacing: "-0.02em" }}>
            풍림푸드를 더 자세히 알아보세요!
          </p>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#003F2B",
              letterSpacing: "-0.04em",
              lineHeight: 1.35,
            }}
          >
            풍림푸드의 기업 철학, 사업 영역,<br />
            주요 제품 라인업을 확인하실 수 있습니다.
          </h2>
        </div>

        {/* 하단: 다운로드 버튼 (세로 스택) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "회사소개서", size: "PDF, 12.5MB", href: "#" },
            { label: "Company Brochure", size: "PDF, 12.5MB", href: "#" },
          ].map(({ label, size, href }) => (
            <a
              key={label}
              href={href}
              download
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: "0 20px",
                border: "1px solid #E0D9C8",
                textDecoration: "none",
                height: 76,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#003F2B",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 2v6h6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.03em" }}>{label}</p>
                <p style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{size}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <path d="M12 15l-4-4h3V4h2v7h3l-4 4z" fill="#AAAAAA" />
                <path d="M5 18h14" stroke="#AAAAAA" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
