/**
 * 연혁 페이지
 */
import { ChevronDown } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/history";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { pcMin } from "~/core/lib/pc-fluid";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const pageBanner = await getPageBanner("history").catch(() => null);
  return { pageBanner, metaTitle: t("pages.brand.history.metaTitle") };
}

const MILESTONES = [
  {
    id: "period-1994",
    period: "1994 ~ 2000",
    achievements: [
      "1994년 법인 설립 및 공장 준공",
      "1998년 액란 사업 시작",
      "2000년 現 대표이사 취임",
      "2000년 ISO9002 (액란 부분) 인증",
    ],
    image: "/intro/history01.png",
    imageWidth: 360,
    imageHeight: 450,
  },
  {
    id: "period-2003",
    period: "2003 ~ 2008",
    achievements: [
      "2003년 서울국제식품산업전 참가",
      "2005년 포장란 사업 시작",
      "2006년 액란 제품 축산물 HACCP 지정",
      "2007년 사업 변경 (풍림산업㈜ → ㈜풍림푸드)",
      "2007년 알가열성형제품 국내 최초 축산물 HACCP 지정",
      "2007년 포장란 친환경, LOHAS 인증(풍요한아침 1등급란)",
      "2008년 포장란 무항생제 인증",
      "2008년 염지란, 젤리류 사업 시작",
    ],
    image: "/intro/history02.png",
    imageWidth: 360,
    imageHeight: 450,
  },
  {
    id: "period-2009",
    period: "2009 ~ 2013",
    achievements: [
      "2009년 농림수산식품부 장관상 수상 (축산물 HACCP 우수업체 선정)",
      "2010년 자랑스러운 중소기업인상 수상 (중소기업중앙회)",
      "2010년 축산물 HACCP 운용 우수업체 선정\n(알가공품·알가열성형제품 부분 수상)",
      "2011년 포장란 축산물 HACCP 지정",
      "2011년 등급팩란 사업 시작",
      "2013년 염지란 LOHAS 인증(깐 계란, 깐 메추리알)",
    ],
    image: "/intro/history03.png",
    imageWidth: 350,
    imageHeight: 450,
  },
  {
    id: "period-2015",
    period: "2015 ~ 2017",
    achievements: [
      "2015년 매출 1,000억 달성",
      "2015년 농협중앙회 선정 우수농식품기업 위더스상 수상",
      "2015년 충청북도지사 고용우수기업 선정",
      "2015년 충청북도지사 중소기업 대상 종합대상 수상",
      "2016년 대통령 표창 수상(모범납세자 선정)",
      "2017년 안전 관리 통합인증 획득",
      "2017년 가족친화 우수기업 선정",
    ],
    image: "/intro/history04.png",
    imageWidth: 310,
    imageHeight: 310,
  },
  {
    id: "period-2019",
    period: "2019 ~ 현재",
    achievements: [
      "2019년 FSSC22000인증",
      "2019년 식품안전 경영시스템 인증",
      "2019년 나래 충주 공장 신축",
      "2019년 식용 난각분말 HACCP 획득",
      "2019년 매출 1,500억 돌파",
      "2024년 FHA-Food & Beverage 2024 참가",
      "2024년 정부기관 주관 중견기업 수출 전환 지원단 선정",
    ],
    image: "/intro/history05.png",
    imageWidth: 360,
    imageHeight: 450,
  },
];

type Milestone = (typeof MILESTONES)[number];

const MILESTONES_EN: Milestone[] = [
  {
    id: "period-1994",
    period: "1994 – 2000",
    achievements: [
      "1994 Company incorporated and factory completed",
      "1998 Liquid egg business launched",
      "2000 Current CEO appointed",
      "2000 ISO 9002 certification (liquid egg division)",
    ],
    image: "/intro/history01.png",
    imageWidth: 360,
    imageHeight: 450,
  },
  {
    id: "period-2003",
    period: "2003 – 2008",
    achievements: [
      "2003 Exhibited at Seoul International Food Industry Exhibition",
      "2005 Packaged egg business launched",
      "2006 HACCP designation for liquid egg products",
      "2007 Company name changed from Poonglim Industrial Co., Ltd. to Poonglim Food Co., Ltd.",
      "2007 First HACCP designation in Korea for heat-formed egg products",
      "2007 Eco-friendly and LOHAS certification for packaged eggs (Pungyohan Achim Grade 1 eggs)",
      "2008 Antibiotic-free certification for packaged eggs",
      "2008 Salted egg and jelly businesses launched",
    ],
    image: "/intro/history02.png",
    imageWidth: 360,
    imageHeight: 450,
  },
  {
    id: "period-2009",
    period: "2009 – 2013",
    achievements: [
      "2009 Minister of Agriculture, Food and Rural Affairs Award (selected as an excellent livestock HACCP company)",
      "2010 Proud SME Entrepreneur Award (Korea Federation of SMEs)",
      "2010 Selected as an excellent livestock HACCP operator (egg processed products and heat-formed egg products)",
      "2011 HACCP designation for packaged eggs",
      "2011 Grade-pack egg business launched",
      "2013 LOHAS certification for salted eggs (peeled eggs and peeled quail eggs)",
    ],
    image: "/intro/history03.png",
    imageWidth: 350,
    imageHeight: 450,
  },
  {
    id: "period-2015",
    period: "2015 – 2017",
    achievements: [
      "2015 Sales reached KRW 100 billion",
      "2015 Received NongHyup Withus Award for excellent agri-food company",
      "2015 Selected by the Chungcheongbuk-do Governor as an excellent employment company",
      "2015 Grand Prize at Chungcheongbuk-do SME Awards",
      "2016 Presidential commendation as an exemplary taxpayer",
      "2017 Integrated safety management certification acquired",
      "2017 Selected as a family-friendly excellent company",
    ],
    image: "/intro/history04.png",
    imageWidth: 310,
    imageHeight: 310,
  },
  {
    id: "period-2019",
    period: "2019 – Present",
    achievements: [
      "2019 FSSC 22000 certification",
      "2019 Food safety management system certification",
      "2019 Narae Chungju factory newly built",
      "2019 HACCP acquired for edible eggshell powder",
      "2019 Sales surpassed KRW 150 billion",
      "2024 Participated in FHA-Food & Beverage 2024",
      "2024 Selected for government-led export transition support for mid-sized companies",
    ],
    image: "/intro/history05.png",
    imageWidth: 360,
    imageHeight: 450,
  },
];

function initialMobileAccordionOpen(milestones: Milestone[]): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  for (const m of milestones) next[m.id] = true;
  return next;
}

export default function HistoryScreen({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const pageBanner = loaderData?.pageBanner ?? null;
  const milestones = i18n.language.startsWith("en") ? MILESTONES_EN : MILESTONES;
  const [activePeriod, setActivePeriod] = useState(milestones[0].id);
  const [mobileOpen, setMobileOpen] = useState(() =>
    initialMobileAccordionOpen(milestones),
  );
  /** 모바일 타임라인: 노란 도트는 항상 1개 — 처음은 0번, i번째 연혁이 헤더 기준선을 지나면 (i+1)번 */
  const [mobileActiveDotIndex, setMobileActiveDotIndex] = useState(0);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const mobileRowRefs = useRef<Map<string, HTMLElement>>(new Map());
  const tabsRef = useRef<HTMLDivElement>(null);
  const isScrollingTo = useRef(false);

  // 모바일: i번 연혁 행이 헤더 기준선 위로 지나가면 노란 도트는 (i+1)번만 (시작은 0번만)
  useEffect(() => {
    function updateMobileDots() {
      if (typeof window === "undefined" || window.innerWidth >= 768) return;
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height",
      );
      const headerPx = Number.parseFloat(raw) || 50;
      const activationY = headerPx + 16;
      let passed = -1;
      milestones.forEach((m, i) => {
        const el = mobileRowRefs.current.get(m.id);
        if (!el) return;
        if (el.getBoundingClientRect().top <= activationY) passed = i;
      });
      const last = milestones.length - 1;
      let next = 0;
      if (passed < 0) next = 0;
      else if (passed >= last) next = last;
      else next = passed + 1;
      setMobileActiveDotIndex((prev) => (prev === next ? prev : next));
    }
    updateMobileDots();
    window.addEventListener("scroll", updateMobileDots, { passive: true });
    window.addEventListener("resize", updateMobileDots);
    return () => {
      window.removeEventListener("scroll", updateMobileDots);
      window.removeEventListener("resize", updateMobileDots);
    };
  }, [milestones]);

  // 스크롤 시 뷰포트 중앙에 가장 가까운 섹션 탭 활성화 (PC만)
  useEffect(() => {
    function update() {
      if (typeof window !== "undefined" && window.innerWidth < 768) return;
      if (isScrollingTo.current) return;
      const viewportMid = window.scrollY + window.innerHeight / 2;
      let best = milestones[0].id;
      let bestDist = Infinity;
      for (const { id } of milestones) {
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
  }, [milestones]);

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
        title={t("pages.brand.history.bannerTitle")}
        subtitle={t("pages.brand.history.bannerSubtitle")}
        breadcrumb={[
          { label: t("common.breadcrumbHome"), href: "/" },
          { label: t("navigation.mega.company"), href: "/brand/intro" },
          { label: t("pages.brand.history.bannerTitle") },
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
              {t("pages.brand.history.mobileH1")}
            </h1>
            <p className="whitespace-pre-line text-[14px] font-normal leading-[21px] text-[#003F2B]">
              {t("pages.brand.history.mobileLead")}
            </p>
          </div>
          <img
            src="/intro/history.png"
            alt={t("pages.brand.history.mobileHeroAlt")}
            className="mb-12 w-full max-w-[343px] rounded-[30px] object-cover"
          />

          <div className="relative pb-1">
            <div
              className="pointer-events-none absolute left-[10px] top-6 bottom-1 w-px -translate-x-1/2 bg-[#02633E]/25"
              aria-hidden
            />
            {/* 타임라인 최하단 종료 도트 */}
            <div
              className="pointer-events-none absolute bottom-0 left-[10px] z-[1] h-2 w-2 -translate-x-1/2 rounded-full bg-[#02633E]"
              aria-hidden
            />
            <div className="flex flex-col gap-4">
              {milestones.map(({ id, period, achievements }, idx) => {
                const open = mobileOpen[id] ?? true;
                const dotActive = mobileActiveDotIndex === idx;
                return (
                  <div
                    key={id}
                    ref={(el) => {
                      if (el) mobileRowRefs.current.set(id, el);
                      else mobileRowRefs.current.delete(id);
                    }}
                    className="relative flex gap-5"
                  >
                    <div className="relative z-[1] flex w-[21px] shrink-0 justify-center pt-5">
                      {dotActive ? (
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
                                {`・ ${line}`}
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
          {t("pages.brand.history.sectionHeading")}
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
                {milestones.map(({ id, period }) => {
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

        {/* ── 연혁 섹션 목록 (PC만 — 모바일에서 숨기지 않으면 빈 section + gap-[100px]만 쌓여 푸터 위 여백이 커짐) ── */}
        <div className="hidden flex-col gap-[100px] md:flex">
          {milestones.map(({ id, period, achievements, image, imageWidth, imageHeight }) => (
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
                    {achievements.map((a) => `・ ${a}`).join("\n")}
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
                        alt={t("pages.brand.history.imageAlt", { period })}
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
