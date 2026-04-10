/**
 * 오시는 길 페이지
 */
import { type ReactNode, useState } from "react";
import { MapPin, Bus, Car, Check } from "lucide-react";
import type { Route } from "./+types/location";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
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

/** 네비 검색어 강조 — 시안: #32AF32 · Nanum 800 */
const HL = ({ children }: { children: ReactNode }) => (
  <strong className="font-[family-name:var(--font-nanum)] font-extrabold text-[#32AF32]">
    {children}
  </strong>
);

const SubwayBadge = ({ line }: { line: string }) => (
  <span className="mr-0.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-0.5 font-[family-name:var(--font-nanum)] text-[13px] font-extrabold leading-[19.5px] text-white [background-color:#BDB193]">
    {line}
  </span>
);

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
        강남역에서 약 10분 소요. 네비게이션에 <HL>'봉은사로 64길 5'</HL> 검색
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
        청주 IC에서 약 40분 소요. 네비게이션에 <HL>'진천군 이월면 공동길 51-21'</HL> 검색
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
    <div className="min-h-screen bg-[#F4F2E5]">
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
      <div className="px-4 pt-3 md:hidden">
        <div className="inline-flex items-center gap-1.5">
          <SectionTitleStar className="h-3.5 w-3.5" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]">오시는 길</h1>
        </div>
      </div>

      <PageContentMax className="py-6 md:py-10">
        {/* ── 탭: 모바일 시안 px-4 py-3.5 · pill 12px/700 · 활성 #02633E + 체크 ── */}
        <div className="mb-5 flex gap-2.5 px-0 py-3.5 max-md:px-0 md:mb-8 md:py-0">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[40px] px-3 py-1.5 font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] transition-colors",
                  isActive
                    ? "bg-[#02633E] text-white"
                    : "bg-[#EAE3C9] text-[#1F2121]",
                )}
              >
                {isActive && (
                  <Check className="h-3 w-3 shrink-0 text-white" strokeWidth={3} />
                )}
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── 메인 카드: 모바일 지도 상단·rounded 10px / md 기존 가로 ── */}
        <div className="overflow-hidden rounded-[10px] bg-white shadow-sm md:rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-start">
            {/* 지도 — 모바일 먼저, md에서는 오른쪽 */}
            <div className="order-1 w-full px-4 pt-5 pb-0 md:order-2 md:px-8 md:py-8 md:pb-8 md:pl-0 md:pt-8">
              <div className="h-[171px] w-full overflow-hidden rounded-[10px] sm:h-[220px] md:h-[510px] md:w-[920px] md:rounded-xl">
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

            {/* 정보 — 모바일: 제목·카카오·주소·구분선·연락 세로 */}
            <div className="order-2 flex-1 p-5 md:order-1 md:px-8 md:py-8">
              <div className="mb-5 flex items-center gap-2.5 md:mb-5 md:gap-3">
                <h2
                  className={cn(
                    "min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#1F2121] md:flex-none md:text-xl md:tracking-[-0.04em] lg:text-[clamp(20px,calc(24*100vw/1920),24px)]",
                  )}
                >
                  {loc.title}
                </h2>
                <a
                  href={loc.kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-[60px] bg-[#FAE100] pl-5 pr-3 py-2 font-[Pretendard,system-ui,sans-serif] text-sm font-medium text-[#1F2121]",
                    "md:h-auto md:rounded-full md:bg-[#FFE000] md:px-3 md:py-1.5 md:text-xs md:font-bold md:text-[#3C1E1E]",
                  )}
                >
                  <span className="order-1 md:order-2">카카오맵</span>
                  <MapPin
                    className="order-2 size-5 md:order-1 md:size-3"
                    strokeWidth={2}
                  />
                </a>
              </div>

              <p className="mb-0 font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121] md:hidden">
                {loc.address}
              </p>

              <div className="my-5 border-t border-[#1F2121]/20 pt-5 md:hidden" />

              <div className="mb-5 hidden border-t border-gray-100 md:mb-7 md:block" />

              <div className="space-y-3 md:space-y-5">
                {(
                  [
                    {
                      label: "주소",
                      value: <span className="text-gray-700">{loc.address}</span>,
                    },
                    {
                      label: "TEL",
                      value: (
                        <a
                          href={`tel:${loc.tel}`}
                          className="text-[#02633E] hover:underline md:text-gray-700"
                        >
                          {loc.tel}
                        </a>
                      ),
                    },
                    {
                      label: "FAX",
                      value: <span className="text-[#02633E] md:text-gray-700">{loc.fax}</span>,
                    },
                    {
                      label: "이메일",
                      value: (
                        <a
                          href={`mailto:${loc.email}`}
                          className="text-[#02633E] hover:underline md:text-gray-700"
                        >
                          {loc.email}
                        </a>
                      ),
                    },
                    {
                      label: "운영시간",
                      value: (
                        <span className="text-[#02633E] md:text-gray-700">{loc.hours}</span>
                      ),
                    },
                  ] satisfies { label: string; value: ReactNode }[]
                ).map(({ label, value }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex flex-col gap-2.5 md:flex-row md:items-start md:gap-10",
                      label === "주소" && "hidden md:flex",
                    )}
                  >
                    <span
                      className={cn(
                        "w-auto shrink-0 font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#1F2121]",
                        "md:w-20 md:text-sm md:font-bold md:text-gray-800 md:[letter-spacing:-0.02em] lg:text-[clamp(13px,calc(15*100vw/1920),15px)]",
                      )}
                    >
                      {label}
                    </span>
                    <span
                      className={cn(
                        "flex-1 font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 md:text-sm md:font-normal md:text-[clamp(13px,calc(15*100vw/1920),15px)]",
                      )}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 교통 안내: 모바일 베이지 배경·시안 타이포 / md 화이트 카드 ── */}
        <div className="mt-5 md:mt-5 md:overflow-hidden md:rounded-2xl md:bg-white md:shadow-sm">
          {/* 모바일 */}
          <div className="flex flex-col md:hidden">
            <div className="flex items-center gap-[11px] px-4 py-5">
              <SectionTitleStar
                className="h-[21px] w-[21px] shrink-0"
                variant="brandIntro"
              />
              <span className="font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121]">
                {loc.transportLabel}
              </span>
            </div>
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

          {/* PC: 1행 가로 배치 */}
          <div className="hidden items-center gap-0 md:flex">
            {/* 레이블 */}
            <div className="flex shrink-0 items-center gap-2 px-8 py-6">
              <SectionTitleStar className="h-[18px] w-[18px]" />
              <span
                className="whitespace-nowrap text-sm font-bold text-gray-800"
                style={{ letterSpacing: "-0.04em" }}
              >
                {loc.transportLabel}
              </span>
            </div>

            {/* 구분선 */}
            <div className="mx-2 h-10 w-px shrink-0 bg-gray-200" />

            {/* 자가용 */}
            <div className="flex flex-1 items-start gap-4 px-8 py-6">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#02633E" }}
              >
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="mb-1 text-sm font-bold text-gray-400">자가용 이용 시</p>
                <p className="text-sm leading-relaxed text-gray-600">{loc.carDesc}</p>
              </div>
            </div>

            {/* 구분선 */}
            <div className="h-10 w-px shrink-0 bg-gray-200" />

            {/* 대중교통 */}
            <div className="flex flex-1 items-start gap-4 px-8 py-6">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "#02633E" }}
              >
                <Bus className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="mb-1 text-sm font-bold text-gray-400">대중교통 이용 시</p>
                <p className="text-sm leading-relaxed text-gray-600">{loc.publicDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
