/**
 * 연혁 페이지
 */
import { ChevronDown } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/history";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { pcMin } from "~/core/lib/pc-fluid";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export function meta(_: Route.MetaArgs) {
  return [{ title: "연혁 | 풍림푸드" }];
}

export async function loader(_: Route.LoaderArgs) {
  const pageBanner = await getPageBanner("history").catch(() => null);
  return { pageBanner };
}

const MILESTONES = [
  {
    id: "period-1994",
    period: "1994 ~ 2000",
    achievements: [
      "법인 설립 및 공장 준공",
      "액란 사업 시작",
      "현 대표이사 취임",
      "ISO9002(액란부문) 인증",
      "국내최초 계란구이 사업시작/계란 기공품 제조기술 컨설팅 계약(일본 가나에푸드)",
    ],
    image: "/intro/history01.png",
    imageWidth: 360,
    imageHeight: 450,
  },
  {
    id: "period-2001",
    period: "2001 ~ 2005",
    achievements: [
      "사업 다각화(계란구이/오물렛/계란찜/푸딩/푸딩)",
      "서울국제식품산업전 참가",
      "전 푸딩판 등급제 실행",
    ],
    image: "/intro/history02.png",
    imageWidth: 360,
    imageHeight: 450,
  },
  {
    id: "period-2011",
    period: "2011 ~ 2014",
    achievements: [
      "1동급 팩란 사업 시작",
      "축산물 HACCP 운용 우수업체선정",
      "영지란 LOHAS 인증 획득(껍계란/깐메추리알)",
    ],
    image: "/intro/history03.png",
    imageWidth: 350,
    imageHeight: 450,
  },
  {
    id: "period-2015",
    period: "2015 ~ 2018",
    achievements: [
      "농협중앙회 신장 우수농식품기업 워더스상 수상",
      "충청북도지사 고용우수기업 선정",
      "충청북도지사 중소기업대상 종합대상 수상",
      "풍림푸드 연구소 설립",
      "모범납세자 대통령 표창 수상",
      "가축전화 우수기업 선정",
      "살충제 및 농약 자체 분석기 도입(LC MS/MS 설비)",
      "소비자용(B2C) 사업 시작",
      "식용란 LOHAS 인증 획득",
      "매출 1,000억 돌파",
    ],
    image: "/intro/history04.png",
    imageWidth: 310,
    imageHeight: 310,
  },
  {
    id: "period-2019",
    period: "2019 ~ 현재",
    achievements: [
      "중복청년일자리창출 우수기업 인증",
      "FSSC22000 획득",
      "NH농협은행 친환경 농식품기업 선정",
      "식용 난각 분말 HACCP 획득",
      "매출 1,500억 돌파",
      "신규 액란/디저트 라인 도입",
      "FHA-Food & Beverage 2024 참가",
      "정부기관 추관 중견기업 수출 전환 지원단 선정 (산업통상자원부, KOTRA 등)",
    ],
    image: "/intro/history05.png",
    imageWidth: 360,
    imageHeight: 450,
  },
];

function initialMobileAccordionOpen(): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const m of MILESTONES) next[m.id] = true;
  next["period-2001"] = false;
  return next;
}

export default function HistoryScreen({ loaderData }: Route.ComponentProps) {
  const pageBanner = loaderData?.pageBanner ?? null;
  const [activePeriod, setActivePeriod] = useState(MILESTONES[0].id);
  const [mobileOpen, setMobileOpen] = useState(initialMobileAccordionOpen);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const tabsRef = useRef<HTMLDivElement>(null);
  const isScrollingTo = useRef(false);

  // 스크롤 시 뷰포트 중앙에 가장 가까운 섹션 탭 활성화 (PC만)
  useEffect(() => {
    function update() {
      if (typeof window !== "undefined" && window.innerWidth < 768) return;
      if (isScrollingTo.current) return;
      const viewportMid = window.scrollY + window.innerHeight / 2;
      let best = MILESTONES[0].id;
      let bestDist = Infinity;
      for (const { id } of MILESTONES) {
        const el = sectionRefs.current.get(id);
        if (!el) continue;
        const elMid = el.offsetTop + el.offsetHeight / 2;
        const dist = Math.abs(viewportMid - elMid);
        if (dist < bestDist) {
          bestDist = dist;
          best = id;
        }
      }
      setActivePeriod(best);
    }
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  // 활성 탭 버튼을 탭바 컨테이너 내에서만 가로 스크롤 (PC만)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) return;
    const container = tabsRef.current;
    if (!container) return;
    const activeBtn = container.querySelector<HTMLButtonElement>(`[data-id="${activePeriod}"]`);
    if (!activeBtn) return;
    const targetLeft =
      activeBtn.offsetLeft - (container.offsetWidth - activeBtn.offsetWidth) / 2;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [activePeriod]);

  function scrollToSection(id: string) {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    isScrollingTo.current = true;
    setActivePeriod(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isScrollingTo.current = false;
    }, 900);
  }

  return (
    <div className="w-full bg-[var(--site-chrome-header-bg,#FDFDF5)]">
      {/* 배너 */}
      <PageBanner
        imageUrl="/intro/history_banner.png"
        title="연혁"
        subtitle="1994년부터 현재까지, 30년간의 성장 과정"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "회사소개", href: "/brand" },
          { label: "연혁" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-10 pb-8 md:pb-14 md:pt-0">
        {/* ── 모바일: 시안(375) — 히어로 + 타임라인 점 + 아코디언 카드 (#EAE3C9) ── */}
        <div className="md:hidden">
          <div className="flex flex-col gap-3 pb-5">
            <h1
              className="text-[20px] font-extrabold leading-[26px] tracking-[-0.04em] text-[#003F2B]"
            >
              풍림푸드의 발자취
            </h1>
            <p className="whitespace-pre-line text-[14px] font-normal leading-[21px] text-[#003F2B]">
              {`1994년부터 현재까지,\n30년간의 성장 과정과 주요 성과를 소개합니다`}
            </p>
          </div>
          <img
            src="/intro/history.png"
            alt="풍림푸드 연혁"
            className="mb-12 w-full max-w-[343px] rounded-[30px] object-cover"
          />

          <div className="relative">
            <div
              className="pointer-events-none absolute left-[10px] top-6 bottom-6 w-px -translate-x-1/2 bg-[#02633E]/25"
              aria-hidden
            />
            <div className="flex flex-col gap-4">
              {MILESTONES.map(({ id, period, achievements }, idx) => {
                const open = mobileOpen[id] ?? true;
                return (
                  <div key={id} className="relative flex gap-5">
                    <div className="relative z-[1] flex w-[21px] shrink-0 justify-center pt-5">
                      {idx === 0 ? (
                        <div
                          className="box-border h-[21px] w-[21px] shrink-0 rounded-full border-[6px] border-white/40 bg-[#F3BC1E]"
                          aria-hidden
                        />
                      ) : (
                        <div
                          className="h-2 w-2 shrink-0 rounded-full bg-[#02633E]"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="flex flex-col gap-3 rounded-[10px] p-5"
                        style={{ backgroundColor: "#EAE3C9" }}
                      >
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() =>
                            setMobileOpen((prev) => ({ ...prev, [id]: !prev[id] }))
                          }
                          className="flex w-full items-center gap-2.5 text-left"
                        >
                          <span
                            className="min-w-0 flex-1 text-[18px] font-extrabold leading-[23.4px] text-[#003F2B]"
                          >
                            {period}
                          </span>
                          <ChevronDown
                            className={`h-[18px] w-[18px] shrink-0 text-[#02633E] transition-transform duration-200 ${
                              open ? "rotate-180" : ""
                            }`}
                            strokeWidth={2}
                            aria-hidden
                          />
                        </button>
                        {open && (
                          <p className="text-[14px] font-bold leading-[21px] text-[#003F2B]">
                            {achievements.map((line, i) => (
                              <Fragment key={i}>
                                {i > 0 && <br />}
                                {line}
                              </Fragment>
                            ))}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PC: 풍림푸드의 발자취 (시안: 스파클 + 36/54) */}
        <SectionPageTitle
          as="h2"
          preset="large"
          className="hidden pb-[30px] pt-[100px] md:flex"
        >
          풍림푸드의 발자취
        </SectionPageTitle>

        {/* ── 연혁 기간 탭바 (PC) — flex + space-between(양끝 정렬) · 비활성=바와 동색 · pill 뒤 흰 선 — sticky ── */}
        <div className="sticky top-[var(--header-height)] z-40 -mx-4 mb-10 hidden bg-[var(--site-chrome-header-bg,#FDFDF5)] py-2 md:mx-0 md:mb-14 md:block">
          <div className="rounded-[40px] bg-[#F3BC1E] px-4 py-5 md:px-[60px]">
            <div className="relative">
              <div
                className="pointer-events-none absolute top-1/2 right-0 left-0 z-0 h-px -translate-y-1/2 bg-white"
                aria-hidden
              />
              <div
                ref={tabsRef}
                className="relative z-[1] flex w-full min-w-0 items-center justify-between gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {MILESTONES.map(({ id, period }) => {
                  const isActive = activePeriod === id;
                  return (
                    <button
                      key={id}
                      data-id={id}
                      type="button"
                      onClick={() => scrollToSection(id)}
                      className={`relative z-[1] shrink-0 whitespace-nowrap rounded-[40px] px-5 py-2.5 text-center font-[family-name:var(--font-nanum)] text-lg leading-[27px] transition-colors ${
                        isActive
                          ? "bg-white font-extrabold text-[#1F2121]"
                          : "bg-[#F3BC1E] font-bold text-white"
                      }`}
                    >
                      {period}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── 연혁 섹션 목록 (PC: 좌 연도 / 중앙 도트·세로선 / 우 본문·이미지, 구간 간격 100px) ── */}
        <div className="flex flex-col gap-[100px]">
          {MILESTONES.map(({ id, period, achievements, image, imageWidth, imageHeight }) => (
            <section
              key={id}
              id={id}
              ref={(el) => {
                if (el) sectionRefs.current.set(id, el);
                else sectionRefs.current.delete(id);
              }}
              className="scroll-mt-[calc(var(--header-height)+7.5rem)]"
            >
              {/* PC 레이아웃 — 시안: 좌 연도 60/78 #003F2B, 중앙 도트+세로선, 우측 본문 20/30 */}
              <div className="hidden md:flex md:items-stretch md:justify-between md:gap-0">
                <div className="flex min-w-0 max-w-[715px] flex-[1_1_0] flex-col items-end px-[30px] pt-5">
                  <h3 className="text-center font-[family-name:var(--font-nanum)] text-[clamp(36px,calc(60*100vw/1920),60px)] font-extrabold leading-[78px] text-[#003F2B]">
                    {period}
                  </h3>
                </div>

                {/* 타임라인: 세로선 최상단·최하단에 도트 — 선은 그 사이 flex-1 / 활성만 상단 노란 29px(border 6 white/40), 상·하단 끝 녹색 8px */}
                <div className="flex w-[36px] shrink-0 flex-col items-center self-stretch pt-5">
                  <div className="h-4 shrink-0" aria-hidden />
                  <div
                    className="flex h-[29px] shrink-0 items-center justify-center"
                    aria-hidden
                  >
                    {activePeriod === id ? (
                      <div className="box-border size-[29px] shrink-0 rounded-full border-[6px] border-white/40 bg-[#F3BC1E]" />
                    ) : (
                      <div className="size-2 shrink-0 rounded-full bg-[#02633E]" />
                    )}
                  </div>
                  <div
                    className="w-px min-h-[48px] flex-1 bg-[#02633E]/30"
                    aria-hidden
                  />
                  <div
                    className="flex h-[29px] shrink-0 items-center justify-center"
                    aria-hidden
                  >
                    <div className="size-2 shrink-0 rounded-full bg-[#02633E]" />
                  </div>
                </div>

                <div className="min-w-0 flex-[1_1_0] px-[30px] pt-5">
                  <p className="max-w-[655px] whitespace-pre-line font-[family-name:var(--font-nanum)] text-[20px] font-bold leading-[30px] text-[#003F2B]">
                    {achievements.join("\n")}
                  </p>
                  {image && (
                    <div
                      className="mt-5 overflow-hidden rounded-[40px]"
                      style={{
                        width: pcMin(imageWidth),
                        height: pcMin(imageHeight),
                        maxWidth: "100%",
                      }}
                    >
                      <img
                        src={image}
                        alt={`${period} 연혁`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>

      </PageContentMax>
    </div>
  );
}
