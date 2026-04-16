import type { CSSProperties } from "react";

import { useBrandPhilosophyReveal } from "../lib/brand-philosophy-reveal";

export function BrandPhilosophy() {
  const { sectionRef, visible, slideStyle, badgeStyle, sparkleStyle } =
    useBrandPhilosophyReveal();

  const sparkle = (
    delay: number,
    size: number,
    green: boolean,
    style: CSSProperties,
  ) => (
    <img
      src="/home/intro-star.png"
      alt=""
      className="pointer-events-none absolute select-none"
      style={sparkleStyle(delay, {
        ...style,
        width: size,
        height: size,
        filter: green
          ? "hue-rotate(88deg) saturate(1.35) brightness(0.68)"
          : "none",
      })}
    />
  );

  const tagBaseClass =
    "absolute rounded-full border border-black bg-white px-3 py-1.5 whitespace-nowrap text-[#111]";
  const tagBaseClassPC =
    "absolute rounded-full border border-black bg-white px-4 py-1.5 whitespace-nowrap text-[#111]";
  const tagClassMobile = `${tagBaseClass} text-[12px]`;
  const tagClassPC = `${tagBaseClassPC} text-[15px]`;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[var(--brand-cream)] py-10 font-[family-name:var(--font-nanum)] md:py-16 lg:py-24"
    >
      {/* ── 모바일 레이아웃 (이미지 시안 기준) ── */}
      <div className="relative md:hidden">
        {/* 별 3개: Enrich 위, Day 위(연두), Food. 아래 */}
        {sparkle(100, 22, false, { top: "2%", left: "8%" })}
        {sparkle(250, 34, true, { top: "16%", right: "10%", left: "auto" })}
        {sparkle(350, 28, false, {
          bottom: "30%",
          right: "22%",
          top: "auto",
          left: "auto",
        })}

        <div className="mx-auto max-w-[360px] px-4">
          {/* 1행: Enrich(왼쪽) + 캐릭터(Enrich 오른쪽) */}
          <div className="relative pt-4" style={slideStyle(300)}>
            <div className="flex items-start">
              <span className="relative inline-block">
                <span
                  className="inline-block leading-none text-[#111]"
                  style={{ fontSize: "56px", fontWeight: 500 }}
                >
                  Enrich
                </span>
                <span
                  className={`top-8 left-6 ${tagClassMobile}`}
                  style={badgeStyle(800)}
                >
                  건강한
                </span>
              </span>
              <img
                src="/home/intro-img.png"
                alt=""
                className="ml-1 inline-block align-top"
                style={{ width: 56, height: 46, objectFit: "contain" }}
              />
            </div>
          </div>

          {/* 2행: Your Day(오른쪽 정렬) */}
          <div className="relative mt-0" style={slideStyle(350)}>
            <div className="flex justify-end">
              <span className="relative inline-block text-right">
                <span
                  className="inline-block leading-none whitespace-nowrap text-[#111]"
                  style={{ fontSize: "56px", fontWeight: 500 }}
                >
                  Your Day
                </span>
                <span
                  className={`-top-2 right-16 left-auto ${tagClassMobile}`}
                  style={badgeStyle(950)}
                >
                  간편한
                </span>
              </span>
            </div>
          </div>

          {/* 3행: with(왼쪽 정렬) */}
          <div className="relative mt-0" style={slideStyle(450)}>
            <span
              className="inline-block text-left leading-none text-[#02633E]"
              style={{ fontSize: "56px", fontWeight: 700 }}
            >
              with
            </span>
          </div>

          {/* 4행: Good Food.(오른쪽 정렬) */}
          <div className="relative mt-0" style={slideStyle(500)}>
            <div className="flex justify-end">
              <span className="relative inline-block text-right">
                <span
                  className="inline-block leading-none whitespace-nowrap text-[#02633E]"
                  style={{ fontSize: "56px", fontWeight: 700 }}
                >
                  Good Fo
                  <span className="relative inline-block">
                    o
                    <img
                      src="/home/intro-heart.png"
                      alt=""
                      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                      style={{ width: 10, height: 10, objectFit: "contain" }}
                    />
                  </span>
                  d.
                </span>
                <span
                  className={`-top-5 right-30 left-auto ${tagClassMobile}`}
                  style={badgeStyle(1100)}
                >
                  믿을 수 있는
                </span>
              </span>
            </div>
          </div>

          {/* 서브타이틀 */}
          <p
            className="text-center text-[13px] text-[#111]"
            style={slideStyle(700)}
          >
            건강하고 풍요한 일상을 만들다.
          </p>
        </div>
      </div>

      {/* ── PC 레이아웃: Enrich 쪽 좌측, with 쪽 우측 ── */}
      <div className="relative hidden md:block">
        {sparkle(100, 36, false, { top: "6%", left: "20%" })}
        {sparkle(250, 46, true, { top: "10%", right: "20%", left: "auto" })}
        {sparkle(350, 40, false, { top: "56%", left: "34%" })}
        {sparkle(450, 28, true, { top: "70%", right: "28%", left: "auto" })}

        <div className="mx-auto w-full max-w-[min(1320px,calc(1320*100vw/1920))] px-6 lg:px-8">
          {/* 1행: Enrich [캐릭터] Your Day — 좌측 정렬 */}
          <div className="flex justify-start pt-6 pb-2" style={slideStyle(500)}>
            <h2
              className="text-left leading-none text-[#111]"
              style={{
                fontSize: "clamp(3rem, 7vw, 6.25rem)",
                fontWeight: 400,
                letterSpacing: "-0.02em",
              }}
            >
              <span className="relative inline-block">
                Enrich
                <span
                  className={`absolute bottom-2 left-10 ${tagClassPC}`}
                  style={badgeStyle(1100)}
                >
                  건강한
                </span>
              </span>{" "}
              <img
                src="/home/intro-img.png"
                alt=""
                className="inline-block align-bottom"
                style={{
                  width: 145,
                  height: 119,
                  objectFit: "contain",
                  ...(visible && {
                    animation: "intro-bounce 2.5s ease-in-out 1s infinite",
                  }),
                }}
              />{" "}
              <span className="relative inline-block">
                Your Day
                <span
                  className={`absolute -top-2 right-36 ${tagClassPC}`}
                  style={badgeStyle(1300)}
                >
                  간편한
                </span>
              </span>
            </h2>
          </div>

          {/* 2행: with Good Food. — 우측 정렬 */}
          <div className="flex justify-end pt-2 pb-6" style={slideStyle(700)}>
            <h2
              className="text-right leading-none"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="relative inline-block">
                <span
                  className="text-[#02633E]"
                  style={{ fontSize: "clamp(3rem, 7vw, 6.25rem)", fontWeight: 800 }}
                >
                  {"with "}
                </span>
                <span
                  className="text-[#02633E]"
                  style={{ fontSize: "clamp(3rem, 7vw, 6.25rem)", fontWeight: 800 }}
                >
                  {"Good Fo"}
                  <span className="relative inline-block">
                    {"o"}
                    <img
                      src="/home/intro-heart.png"
                      alt=""
                      className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
                      style={{ width: 18, height: 18, objectFit: "contain" }}
                    />
                  </span>
                  {"d."}
                </span>
                <span
                  className={`absolute -top-2 right-60 left-auto ${tagClassPC}`}
                  style={badgeStyle(1500)}
                >
                  믿을 수 있는
                </span>
              </span>
            </h2>
          </div>

          <p
            className="mt-3 text-center text-base text-[var(--brand-green)] lg:text-lg"
            style={slideStyle(900)}
          >
            건강하고 풍요한 일상을 만들다.
          </p>
        </div>
      </div>
    </section>
  );
}
