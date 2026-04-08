/**
 * 품질 & 인증 페이지
 * 배너: PageBanner와 동일한 여백 구조, 1840×800 커스텀 이미지 + 하단 텍스트 오버레이
 */
import type { Route } from "./+types/certifications";

import { Fragment, useState } from "react";

import {
  getCertAwards,
  getCertItems,
} from "~/features/brand/lib/queries.server";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { pc1920, pcMin } from "~/core/lib/pc-fluid";

export function meta(_: Route.MetaArgs) {
  return [{ title: "품질 & 인증 | 풍림푸드" }];
}

export async function loader(_: Route.LoaderArgs) {
  const [dbAwards, dbCerts] = await Promise.all([
    getCertAwards().catch((e) => {
      console.error("[certifications] getCertAwards 실패:", e?.message ?? e);
      return [];
    }),
    getCertItems().catch((e) => {
      console.error("[certifications] getCertItems 실패:", e?.message ?? e);
      return [];
    }),
  ]);
  return { dbAwards, dbCerts };
}

/* ── 폴백 목 데이터 ── */
const MOCK_QUALITY_ITEMS = [
  {
    title: "식품 안전",
    desc: "원료 입고부터 제품 출하까지 전 과정에 엄격한 식품안전 기준을 적용하여 안전한 제품을 만듭니다.",
    image: "/certification/safety_img_transparent.png",
    bg: "#F5E56A",
  },
  {
    title: "친환경",
    desc: "최적의 온도·위생 환경에서 생산하여 항상 신선하고 맛있는 제품을 제공합니다.",
    image: "/certification/env_img_transparent.png",
    bg: "#B8CB98",
  },
  {
    title: "품질 경영",
    desc: "투명한 경영 활동과 지속적인 품질 개선으로 고객 신뢰를 높여 나갑니다.",
    image: "/certification/busi_img_transparent.png",
    bg: "#EFE9D5",
  },
  {
    title: "사회적 책임",
    desc: "환경 보호와 사회적 가치 창출을 위해 지속 가능한 경영을 실천합니다.",
    image: "/certification/recycle_img_transparent.png",
    bg: "#F4AAAA",
  },
];

const MOCK_CERT_ITEMS = [
  { id: 1, image_url: "/certification/cert01.png", title: "HACCP 인증 (팩란)" },
  { id: 2, image_url: "/certification/cert02.png", title: "표창장" },
  { id: 3, image_url: "/certification/cert03.png", title: "HACCP 인증 (액란)" },
  { id: 4, image_url: "/certification/cert04.png", title: "수질 성적서" },
  { id: 5, image_url: "/certification/cert05.png", title: "FSSC 22000" },
  { id: 6, image_url: "/certification/cert06.png", title: "공로패" },
  {
    id: 7,
    image_url: "/certification/cert07.png",
    title: "축산물 제조·가공업 허가",
  },
  { id: 8, image_url: "/certification/cert08.png", title: "ISO 22000" },
  { id: 9, image_url: "/certification/cert09.png", title: "LOHAS 인증" },
  { id: 10, image_url: "/certification/cert10.png", title: "중소기업 확인서" },
  { id: 11, image_url: "/certification/cert11.png", title: "우수업체 인증" },
];

const MOCK_AWARD_ITEMS = [
  {
    id: 1,
    title: "충북지방 중소벤처기업청 표창장",
    image_url: "/certification/cert-award-sme-1.png",
  },
];

// 탭: 수상내역 → 인증서 순서
const TABS = [
  { key: "award", label: "수상내역" },
  { key: "cert", label: "인증서" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function CertificationsScreen({
  loaderData,
}: Route.ComponentProps) {
  const { dbAwards, dbCerts } = loaderData;
  const [activeTab, setActiveTab] = useState<TabKey>("award");

  const awards = (
    dbAwards.length > 0 ? dbAwards : MOCK_AWARD_ITEMS
  ) as typeof MOCK_AWARD_ITEMS;
  const certs = (
    dbCerts.length > 0 ? dbCerts : MOCK_CERT_ITEMS
  ) as typeof MOCK_CERT_ITEMS;

  return (
    <div className="w-full bg-[#F5F2E8]">
      <Breadcrumb
        items={[
          { label: "회사소개", href: "/brand/intro" },
          { label: "품질 & 인증" },
        ]}
      />
      {/* ── 페이지 타이틀 ── */}
      <div className="py-10 text-center md:py-14">
        <h1 className="text-[36px] leading-tight font-bold tracking-tight text-[#02633E] md:text-[clamp(32px,calc(52*100vw/1920),52px)]">
          품질 & 인증
        </h1>
        <p className="mt-3 text-sm text-gray-500 md:text-base">
          30년 전통의 품질 관리 노하우와 국내외 공인 인증
        </p>
      </div>

      {/* ── 커스텀 배너 — PageBanner와 동일한 외부 여백 ── */}
      <div className="px-4 pt-2 md:px-8 md:pt-4 lg:px-2.5">
        <div className="mx-auto w-full" style={{ maxWidth: "var(--hero-pc-width)" }}>
          <div
            className="relative overflow-hidden rounded-3xl md:rounded-[2rem]"
            style={{ aspectRatio: "1840 / 800" }}
          >
            <img
              src="/certification/certification_banner.png"
              alt="품질 & 인증 배너"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 px-6 pb-7 md:px-12 md:pb-10">
              <h2 className="mb-1.5 text-[18px] font-bold text-white md:text-[clamp(16px,calc(30*100vw/1920),30px)]">
                품질은 약속입니다
              </h2>
              <p className="max-w-xs text-xs leading-relaxed text-white/80 md:max-w-xl md:text-sm">
                풍림푸드는 30년간 쌓아온 기술력과 엄격한 품질 관리를 바탕으로
                고객의 식탁에 신선하고 안전한 제품을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 섹션 1: 품질 약속 카드 ══ */}
      <div className="mx-auto max-w-[min(1208px,calc(1208*100vw/1920))] px-4 pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MOCK_QUALITY_ITEMS.map(({ title, desc, image, bg }) => (
            <div
              key={title}
              className="flex min-h-[280px] w-full flex-col overflow-hidden rounded-2xl md:min-h-0 md:h-[clamp(320px,calc(520*100vw/1920),520px)]"
              style={{ backgroundColor: bg }}
            >
              <div className="px-8 pt-8">
                <h3
                  className="mb-3 text-[18px] font-bold text-[#1F2121] md:text-[clamp(16px,calc(22*100vw/1920),22px)]"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-700 md:text-[clamp(13px,calc(15*100vw/1920),15px)]">
                  {desc}
                </p>
              </div>
              <div className="flex flex-1 items-end justify-center px-8 pb-8">
                <img
                  src={image}
                  alt={title}
                  className="object-contain"
                  style={{
                    width: pcMin(310),
                    height: pcMin(310),
                    maxWidth: "100%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ 섹션 2: 주요 인증 및 수상내역 ══
          컨테이너에 수평 패딩 없음 → 수상내역 카드가 1600px 전체 사용.
          타이틀·탭·인증서 그리드는 요소 단위로 px-4 md:px-0 적용. */}
      <PageContentMax className="pb-16 md:pb-20">

        {/* 섹션 헤더 — 자체 패딩 */}
        <div className="mb-8 px-4 text-center md:mb-10 md:px-0">
          <h2 className="mb-3 text-[32px] font-bold tracking-[-0.03em] text-[#02633E] md:text-[clamp(26px,calc(42*100vw/1920),42px)]">
            주요 인증 및 수상내역
          </h2>
          <p className="text-sm text-gray-500 md:text-base">
            국내외 공인 기관의 엄격한 인증과 수상을 통해 품질을 인정받았습니다.
          </p>
        </div>

        {/* 탭 버튼 — 자체 패딩, 좌측 x=0 */}
        <div className="mb-8 flex gap-2 px-4 md:mb-10 md:px-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all"
              style={
                activeTab === key
                  ? { backgroundColor: "#02633E", color: "#fff" }
                  : { backgroundColor: "#EAE3C9", color: "#555" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── 수상내역 탭 콘텐츠
            패딩 없음 → 텍스트 카드 좌측이 탭 버튼 좌측과 동일한 x=0에서 시작
            텍스트 533px + 이미지 flex-1 = 1600px, 높이 894px */}
        {activeTab === "award" && (
          <div className="flex flex-col gap-4 px-4 md:h-[clamp(420px,calc(894*100vw/1920),894px)] md:flex-row md:gap-4 md:px-0">
            {awards.map(({ id, title, image_url }) => (
              <Fragment key={id}>
                {/* 좌: 텍스트 카드 — 533×894 시안 비율 */}
                <div
                  className="flex items-center justify-center rounded-2xl p-8 md:h-full md:w-[min(533px,calc(533*100vw/1920))] md:shrink-0"
                  style={{ backgroundColor: "#EAE3C9", minHeight: 280 }}
                >
                  <h3
                    className="text-center font-bold text-[#003F2B]"
                    style={{
                      fontSize: pc1920(20, 32),
                      letterSpacing: "-0.04em",
                      lineHeight: 1.4,
                    }}
                  >
                    {title}
                  </h3>
                </div>

                {/* 우: 이미지 카드 — flex-1×894 */}
                <div
                  className="flex flex-1 items-center justify-center rounded-2xl bg-white md:h-full"
                  style={{
                    padding: pc1920(16, 32),
                    minHeight: 280,
                  }}
                >
                  <img
                    src={image_url ?? ""}
                    alt={title}
                    className="object-contain"
                    style={{
                      maxWidth: pcMin(1017),
                      maxHeight: pcMin(774),
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              </Fragment>
            ))}
          </div>
        )}

        {/* ── 인증서 탭 콘텐츠 — 4열, 카드 385×445 */}
        {activeTab === "cert" && (
          <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-3 md:gap-5 md:px-0 lg:grid-cols-4">
            {certs.map(({ id, image_url, title }) => (
              <div
                key={id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white"
                style={{ height: pc1920(300, 445) }}
              >
                <div className="shrink-0 px-5 pt-5">
                  <img
                    src={image_url ?? ""}
                    alt={title}
                    className="rounded-xl object-contain"
                    style={{ width: "100%", height: pc1920(200, 345) }}
                  />
                </div>
                <div className="flex flex-1 items-center justify-center px-4">
                  <p className="text-center text-sm font-semibold text-gray-700">{title}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </PageContentMax>
    </div>
  );
}
