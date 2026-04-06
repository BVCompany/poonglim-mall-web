/**
 * 오시는 길 페이지
 */
import { type ReactNode, useState } from "react";
import { MapPin, Bus, Car, Check } from "lucide-react";
import type { Route } from "./+types/location";
import { PageBanner } from "~/core/components/page-banner";
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

const HL = ({ children }: { children: ReactNode }) => (
  <strong style={{ color: "#02633E", fontWeight: 600 }}>{children}</strong>
);

const SubwayBadge = ({ line }: { line: string }) => (
  <span
    className="mr-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
    style={{ backgroundColor: "#BDB92F" }}
  >
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
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
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
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]">오시는 길</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-6 lg:px-10">

        {/* ── 탭: 작은 pill 버튼 (모바일·PC 공통) ── */}
        <div className="mb-6 flex gap-2 md:mb-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                style={
                  isActive
                    ? { backgroundColor: "#02633E", color: "#fff" }
                    : { backgroundColor: "#EAE3C9", color: "#555" }
                }
              >
                {isActive && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
                {tab}
              </button>
            );
          })}
        </div>

        {/* ── 메인 카드 ── */}
        {/* 제목을 왼쪽 컬럼 내부에 두어 제목 탑과 지도 탑이 동일 레벨에서 시작 */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start">

            {/* 왼쪽: 제목 + 구분선 + 정보 */}
            <div className="flex-1 px-5 py-6 md:px-8 md:py-8">
              {/* 제목 + 카카오맵 */}
              <div className="mb-4 flex items-center gap-3 md:mb-5">
                <h2
                  className="text-xl font-bold text-gray-900 md:text-2xl"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {loc.title}
                </h2>
                <a
                  href={loc.kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                  style={{ backgroundColor: "#FFE000", color: "#3C1E1E" }}
                >
                  <MapPin className="h-3 w-3" />
                  카카오맵
                </a>
              </div>

              {/* 구분선 */}
              <div className="mb-5 border-t border-gray-100 md:mb-7" />

              {/* 정보 행 */}
              <div className="space-y-5">
                {(
                  [
                    { label: "주소", value: <span className="text-gray-700">{loc.address}</span> },
                    {
                      label: "TEL",
                      value: (
                        <a href={`tel:${loc.tel}`} className="text-gray-700 hover:underline">
                          {loc.tel}
                        </a>
                      ),
                    },
                    { label: "FAX", value: <span className="text-gray-700">{loc.fax}</span> },
                    { label: "운영시간", value: <span className="text-gray-700">{loc.hours}</span> },
                    {
                      label: "이메일",
                      value: (
                        <a href={`mailto:${loc.email}`} className="text-gray-700 hover:underline">
                          {loc.email}
                        </a>
                      ),
                    },
                  ] satisfies { label: string; value: ReactNode }[]
                ).map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-6 md:gap-10">
                    <span
                      className="w-16 shrink-0 text-sm font-bold text-gray-800 md:w-20 md:text-[15px]"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {label}
                    </span>
                    <span className="flex-1 text-sm md:text-[15px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽: 지도 — 왼쪽 컬럼과 동일한 여백 */}
            <div className="px-5 py-6 md:px-8 md:py-8 md:pl-0 md:shrink-0">
            <div className="h-[260px] w-full overflow-hidden rounded-xl sm:h-[360px] md:h-[510px] md:w-[920px]">
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

          </div>
        </div>

        {/* ── 교통 안내 ── */}
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm md:mt-5">
          {/* 모바일: 세로 스택 */}
          <div className="flex flex-col gap-4 px-5 py-5 md:hidden">
            <div className="flex items-center gap-2">
              <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />
              <span className="text-sm font-bold text-gray-800" style={{ letterSpacing: "-0.04em" }}>
                {loc.transportLabel}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#02633E" }}>
                <Car className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-bold text-gray-500">자가용 이용 시</p>
                <p className="text-xs leading-relaxed text-gray-600">{loc.carDesc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#02633E" }}>
                <Bus className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-bold text-gray-500">대중교통 이용 시</p>
                <p className="text-xs leading-relaxed text-gray-600">{loc.publicDesc}</p>
              </div>
            </div>
          </div>

          {/* PC: 1행 가로 배치 */}
          <div className="hidden items-center gap-0 md:flex">
            {/* 레이블 */}
            <div className="flex shrink-0 items-center gap-2 px-8 py-6">
              <img src="/home/product-star.png" alt="" className="h-[18px] w-[18px] shrink-0 object-contain" />
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
      </div>
    </div>
  );
}
