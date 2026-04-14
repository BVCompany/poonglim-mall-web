/**
 * 오시는 길 페이지
 */
import { type ReactNode, useState } from "react";
import { Bus, Car, Check } from "lucide-react";
import type { Route } from "./+types/location";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export function meta(_: Route.MetaArgs) {
  return [{ title: "오시는 길 | 풍림푸드" }];
}

export async function loader(_: Route.LoaderArgs) {
  const pageBanner = await getPageBanner("location").catch(() => null);
  return { pageBanner };
}

const TABS = ["서울 사무소", "본사/공장"] as const;
type Tab = (typeof TABS)[number];

interface LocationInfo {
  title: string;
  address: string;
  tel: string;
  fax: string;
  hours: string;
  email: string;
  kakaoUrl: string;
  mapSrc: string;
  transportLabel: string;
  carDesc: ReactNode;
  publicDesc: ReactNode;
}

/** 지하철 노선 뱃지 — PC 시안: min 27px · #BDB193 · 18/27 extrabold */
const SubwayBadge = ({ line }: { line: string }) => (
  <span className="mr-1 inline-flex min-h-[27px] min-w-[27px] shrink-0 items-center justify-center rounded-full bg-[#BDB193] px-1 font-[family-name:var(--font-nanum)] text-lg font-extrabold leading-[27px] text-white">
    {line}
  </span>
);

const navHighlightClass =
  "font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#32AF32]";

const LOCATION_DATA: Record<Tab, LocationInfo> = {
  "서울 사무소": {
    title: "서울 사무소",
    address: "서울특별시 강남구 봉은사로 64길 5",
    tel: "02-538-5617",
    fax: "02-538-5623",
    hours: "평일 09:00 - 18:00",
    email: "poonglim@freshegg.co.kr",
    kakaoUrl: "https://map.kakao.com/link/search/서울특별시 강남구 봉은사로 64길 5",
    mapSrc:
      "https://maps.google.com/maps?q=서울특별시+강남구+봉은사로+64길+5&hl=ko&z=16&output=embed",
    transportLabel: "서울사무소 교통 안내",
    carDesc: (
      <>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
          강남역에서 약 10분 소요. 네비게이션에{" "}
        </span>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
          &apos;
        </span>
        <span className={navHighlightClass}>봉은사로 64길 5</span>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
          &apos;{" "}
        </span>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
          검색
        </span>
      </>
    ),
    publicDesc: (
      <>
        <SubwayBadge line="9" /> 호선 봉은사역 1번 출구 → 도보 5분
      </>
    ),
  },
  "본사/공장": {
    title: "본사/공장",
    address: "충북 진천군 이월면 공동길 51-21",
    tel: "043-533-2285",
    fax: "043-533-2988",
    hours: "평일 09:00 - 18:00",
    email: "poonglim@freshegg.co.kr",
    kakaoUrl: "https://map.kakao.com/link/search/충북 진천군 이월면 공동길 51-21",
    mapSrc:
      "https://maps.google.com/maps?q=충북+진천군+이월면+공동길+51-21&hl=ko&z=16&output=embed",
    transportLabel: "본사/공장 교통 안내",
    carDesc: (
      <>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
          청주 IC에서 약 40분 소요. 네비게이션에{" "}
        </span>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
          &apos;
        </span>
        <span className={navHighlightClass}>진천군 이월면 공동길 51-21</span>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
          &apos;{" "}
        </span>
        <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
          검색
        </span>
      </>
    ),
    publicDesc: <>진천 시외버스터미널 → 이월면행 버스 탑승 → 공동길 하차</>,
  },
};

export default function LocationScreen({ loaderData }: Route.ComponentProps) {
  const pageBanner = loaderData?.pageBanner ?? null;
  const [activeTab, setActiveTab] = useState<Tab>("서울 사무소");
  const loc = LOCATION_DATA[activeTab];

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      <PageBanner
        imageUrl="/banner/support_banner_temp.png"
        title="오시는 길"
        subtitle="풍림푸드를 방문해 주셔서 감사합니다."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "회사소개", href: "/brand" },
          { label: "오시는 길" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* 모바일 전용 타이틀 */}
      <SectionPageTitle
        as="h1"
        preset="none"
        className="inline-flex items-center gap-1.5 px-4 pt-3 md:hidden"
        markClassName="h-3.5 w-3.5"
        titleClassName="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]"
      >
        오시는 길
      </SectionPageTitle>

      <PageContentMax className="py-6 md:pt-[60px] md:pb-10">
        {/* 탭 — PC 시안: Pretendard 18 · px-4 py-2 · r40 · 활성 #02633E + 체크 16 */}
        <div className="mb-5 flex gap-2.5 px-0 py-3.5 max-md:px-0 md:mb-5 md:gap-2.5 md:py-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[40px] px-3 py-1.5 font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] transition-colors",
                  "md:gap-1.5 md:px-4 md:py-2 md:font-[Pretendard,system-ui,sans-serif] md:text-lg md:leading-[27px]",
                  isActive
                    ? "bg-[#02633E] text-white md:font-bold"
                    : "bg-[#EAE3C9] text-[#1F2121] md:font-medium",
                )}
              >
                {isActive && (
                  <Check className="h-3 w-3 shrink-0 text-white md:h-4 md:w-4" strokeWidth={3} />
                )}
                {tab}
              </button>
            );
          })}
        </div>

        {/* 메인 카드 — PC: r40 · px-40 · 좌 600 / 우 지도 flex-1 · 지도 r10 */}
        <div className="overflow-hidden rounded-[10px] bg-white shadow-sm md:rounded-[40px]">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-0 md:py-10">
            {/* 지도 — 모바일 먼저, PC 오른쪽 */}
            <div className="order-1 w-full px-4 pt-5 pb-0 md:order-2 md:min-w-0 md:flex-1 md:px-10 md:py-0 md:pl-0 md:pr-10 md:pt-0">
              <div className="h-[171px] w-full overflow-hidden rounded-[10px] sm:h-[220px] md:h-[511px] md:min-h-[511px]">
                <iframe
                  key={activeTab}
                  src={loc.mapSrc}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${loc.title} 지도`}
                  className="h-full w-full"
                />
              </div>
            </div>

            {/* 정보 — PC 시안: 제목 #003F2B 36/54 · 카카오 #FAE100 r60 · 라벨 180×24/36 · 값 20/30 */}
            <div className="order-2 flex-1 p-5 md:order-1 md:w-[600px] md:max-w-[600px] md:shrink-0 md:p-0 md:pl-10 md:pr-[60px] md:pt-0">
              <div className="mb-5 flex items-center gap-2.5 md:mb-[60px] md:gap-5">
                <h2 className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#1F2121] md:text-[36px] md:leading-[54px] md:font-extrabold md:text-[#003F2B]">
                  {loc.title}
                </h2>
                <a
                  href={loc.kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-1 rounded-[60px] bg-[#FAE100] py-2 pl-5 pr-3 font-[Pretendard,system-ui,sans-serif] text-sm font-medium text-[#1F2121]",
                    "md:gap-1 md:text-base md:font-medium",
                  )}
                >
                  <span>카카오맵</span>
                  <img
                    src="/faq/marker_icon.png"
                    alt=""
                    aria-hidden
                    className="h-5 w-5 shrink-0 object-contain md:h-[27px] md:w-[27px]"
                  />
                </a>
              </div>

              <p className="mb-0 font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121] md:hidden">
                {loc.address}
              </p>

              <div className="my-5 border-t border-[#1F2121]/20 pt-5 md:hidden" />

              <div className="space-y-3 md:space-y-5">
                {(
                  [
                    {
                      label: "주소",
                      value: <span className="text-[#1F2121]">{loc.address}</span>,
                    },
                    {
                      label: "TEL",
                      value: (
                        <a
                          href={`tel:${loc.tel}`}
                          className="text-[#02633E] hover:underline md:text-[#1F2121] md:hover:opacity-80"
                        >
                          {loc.tel}
                        </a>
                      ),
                    },
                    {
                      label: "FAX",
                      value: <span className="text-[#02633E] md:text-[#1F2121]">{loc.fax}</span>,
                    },
                    {
                      label: "운영시간",
                      value: (
                        <span className="text-[#02633E] md:text-[#1F2121]">{loc.hours}</span>
                      ),
                    },
                    {
                      label: "이메일",
                      value: (
                        <a
                          href={`mailto:${loc.email}`}
                          className="text-[#02633E] hover:underline md:text-[#1F2121] md:hover:opacity-80"
                        >
                          {loc.email}
                        </a>
                      ),
                    },
                  ] satisfies { label: string; value: ReactNode }[]
                ).map(({ label, value }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex flex-col gap-2.5 md:flex-row md:items-center md:gap-3",
                      label === "주소" && "hidden md:flex",
                    )}
                  >
                    <span className="w-auto shrink-0 font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#1F2121] md:w-[180px] md:text-2xl md:leading-9 md:font-extrabold">
                      {label}
                    </span>
                    <span className="flex-1 font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#1F2121] md:text-xl md:font-bold md:leading-[30px]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 교통 안내 — PC 시안: 흰 카드 r40 p-40 · 좌 타이틀(#02633E 21px 스퀘어) · gap 92 · 자가용/대중교통 gap 60 */}
        <div className="mt-5 md:mt-5">
          <div className="flex flex-col md:hidden">
            <SectionPageTitle
              as="div"
              preset="default"
              starVariant="brandIntro"
              className="px-4 py-5"
              markClassName="h-[21px] w-[21px] shrink-0"
              titleClassName="font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121]"
            >
              {loc.transportLabel}
            </SectionPageTitle>
            <div className="flex flex-col gap-5 px-4 pb-8">
              <div className="flex gap-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#003F2B]">
                  <Car className="size-[18px] text-white" strokeWidth={2} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="font-[family-name:var(--font-nanum)] text-base font-extrabold uppercase leading-[22.4px] text-[#1F2121]">
                    자가용 이용 시
                  </p>
                  <p className="font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121]">
                    {loc.carDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#003F2B]">
                  <Bus className="size-[18px] text-white" strokeWidth={2} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="font-[family-name:var(--font-nanum)] text-base font-extrabold uppercase leading-[22.4px] text-[#1F2121]">
                    대중교통 이용 시
                  </p>
                  <div className="flex flex-wrap items-start gap-0.5 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121]">
                    {loc.publicDesc}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-[92px] md:rounded-[40px] md:bg-white md:p-10 md:shadow-sm">
            <div className="flex shrink-0 items-center gap-3.5">
              <span
                className="size-[21px] shrink-0 bg-[#02633E]"
                aria-hidden
              />
              <span className="whitespace-nowrap font-[family-name:var(--font-nanum)] text-2xl font-bold leading-9 text-[#1F2121]">
                {loc.transportLabel}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-10 md:flex-row md:gap-[60px]">
              <div className="flex min-w-0 flex-1 items-start gap-5">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#003F2B]">
                  <Car className="size-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="font-[family-name:var(--font-nanum)] text-lg font-extrabold leading-[27px] text-[#1F2121]">
                    자가용 이용 시
                  </p>
                  <div className="text-pretty">{loc.carDesc}</div>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 items-start gap-5">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#003F2B]">
                  <Bus className="size-6 text-white" strokeWidth={2} />
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="font-[family-name:var(--font-nanum)] text-lg font-extrabold leading-[27px] text-[#1F2121]">
                    대중교통 이용 시
                  </p>
                  <div className="flex flex-wrap items-center gap-1 font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
                    {loc.publicDesc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
