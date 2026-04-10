/**
 * 연혁 페이지
 */
import { ChevronDown } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { Route } from "./+types/history";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { pc1920, pcMin } from "~/core/lib/pc-fluid";
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
    id: "period-2006",
    period: "2006 ~ 2010",
    achievements: [
      "사명 변경(풍림식업 → 풍림푸드)",
      "알가열성형제품 국내 최초 축산물 HACCP 획득",
      "영지란/젤리류 사업 시작",
      "자체 항생제 검사(CHRAM-II) 시스템 도입",
      "농림수산식품부 장관상 수상(축산물 HACCP 우수업체 선정)",
      "계란파우더(SD) 설비 도입",
      "축산물 HACCP 운용 우수업체 선정(알가공품/알가열성형제품 부문 수상)",
    ],
    image: null as string | null,
    imageWidth: 0,
    imageHeight: 0,
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
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      isScrollingTo.current = false;
    }, 900);
  }

  return (
    <div className="w-full bg-[#F5F2E8]">
      {/* 배너 */}
      <PageBanner
        imageUrl="/intro/history_banner.png"
        title="연혁"
        subtitle="풍림푸드의 성장 여정을 소개합니다."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "회사소개", href: "/brand" },
          { label: "연혁" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-10 pb-8 md:py-14">
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

        {/* PC: 풍림푸드의 발자취 */}
        <div className="mb-8 hidden items-center gap-1.5 md:mb-10 md:inline-flex">
          <img src="/home/product-star.png" alt="" className="h-4 w-4 object-contain" />
          <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#1F2121] md:text-[clamp(16px,calc(20*100vw/1920),20px)]">
            풍림푸드의 발자취
          </span>
        </div>

        {/* ── 연혁 탭바 (PC만) ── */}
        <div
          ref={tabsRef}
          className="mb-10 hidden items-center overflow-x-auto rounded-xl px-4 py-3 md:mb-14 md:flex md:px-6 md:py-4"
          style={{ backgroundColor: "#F5C842", scrollbarWidth: "none" }}
        >
          {MILESTONES.map(({ id, period }, idx) => {
            const isActive = activePeriod === id;
            return (
              <Fragment key={id}>
                <button
                  data-id={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  className="shrink-0 whitespace-nowrap rounded-full text-sm font-semibold transition-all md:text-[clamp(13px,calc(15*100vw/1920),15px)]"
                  style={
                    isActive
                      ? {
                          backgroundColor: "#fff",
                          color: "#1F2121",
                          padding: "8px 22px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                        }
                      : { color: "#fff", padding: "8px 14px" }
                  }
                >
                  {period}
                </button>
                {/* 탭 사이 가로 연결선 — 흰색 */}
                {idx < MILESTONES.length - 1 && (
                  <div
                    className="mx-1 h-px flex-1 shrink"
                    style={{ backgroundColor: "#fff", minWidth: 12, opacity: 0.6 }}
                  />
                )}
              </Fragment>
            );
          })}
        </div>

        {/* ── 연혁 섹션 목록 ──
            PC 구조: [연도 flex-1 우정렬] [타임라인 w-8 중앙] [업적+이미지 flex-1]
            dot 컬럼이 페이지 정중앙. 섹션 내부 dot → 아래 수직선, 섹션 간 선 없음 */}
        <div>
          {MILESTONES.map(({ id, period, achievements, image, imageWidth, imageHeight }, idx) => (
            <Fragment key={id}>
              <section
                id={id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(id, el);
                  else sectionRefs.current.delete(id);
                }}
              >
                {/* PC 레이아웃 — dot 컬럼이 정중앙 */}
                <div className="hidden md:flex">
                  {/* 연도 — flex-1, 우정렬 */}
                  <div className="flex flex-1 items-start justify-end pr-8 pt-4">
                    <h2
                      className="text-[clamp(26px,calc(36*100vw/1920),36px)] font-bold leading-tight"
                      style={{ color: "#02633E", letterSpacing: "-0.04em" }}
                    >
                      {period}
                    </h2>
                  </div>

                  {/* 타임라인 컬럼 — dot + 섹션 내부 수직선 (섹션 바닥까지) */}
                  <div className="flex w-8 shrink-0 flex-col items-center">
                    <div className="h-4" />
                    {/* 첫 dot만 노란색, 나머지는 #02633E */}
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: idx === 0 ? "#F5C842" : "#02633E" }}
                    />
                    {/* 섹션 내부 수직선 — dot에서 섹션 바닥까지 */}
                    <div className="w-px flex-1" style={{ backgroundColor: "#C8C8C8" }} />
                  </div>

                  {/* 업적 → 이미지 (세로 배치) */}
                  <div className="flex-1 pb-10 pl-8 pt-4">
                    <ul className="space-y-3">
                      {achievements.map((a, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span
                            className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: "#02633E" }}
                          />
                          <span
                            className="text-[clamp(13px,calc(15*100vw/1920),15px)] leading-relaxed"
                            style={{ color: "#02633E" }}
                          >
                            {a}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {image && (
                      <div
                        className="mt-8 overflow-hidden rounded-xl"
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

              {/* PC 섹션 사이 — 선 없이 회색 dot만, dot 컬럼과 수평 위치 일치 */}
              {idx < MILESTONES.length - 1 && (
                <div
                  className="hidden md:flex items-center"
                  style={{ minHeight: pc1920(32, 48) }}
                >
                  <div className="flex-1" />
                  <div className="flex w-8 shrink-0 justify-center">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#C8C8C8" }} />
                  </div>
                  <div className="flex-1" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

      </PageContentMax>
    </div>
  );
}
