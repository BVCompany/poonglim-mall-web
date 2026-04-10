/**
 * 품질 & 인증 페이지
 * 배너: PageBanner와 동일한 여백 구조, 1840×800 커스텀 이미지 + 하단 텍스트 오버레이
 */
import type { Route } from "./+types/certifications";
import type { ReactNode } from "react";

import { Fragment, useState } from "react";

import {
  getCertAwards,
  getCertItems,
} from "~/features/brand/lib/queries.server";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { cn } from "~/core/lib/utils";
import { pc1920, pcMin } from "~/core/lib/pc-fluid";

const nanum = "font-[family-name:var(--font-nanum)]";

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

/* ── 폴백 목 데이터 (모바일 카드 시안: p20·gap10·타이포 동일) ── */
const MOCK_QUALITY_ITEMS: {
  title: string;
  desc: ReactNode;
  image: string;
  bg: string;
}[] = [
  {
    title: "식품안전",
    desc: (
      <>
        HACCP, FSSC 22000 인증을 통해 원료 입고부터 출하까지
        <br />
        전 과정을 철저히 관리합니다.
      </>
    ),
    image: "/certification/safety_img_transparent.png",
    bg: "#FBE28A",
  },
  {
    title: "친환경",
    desc: (
      <>
        친환경 농산물, 무항생제
        <br />
        인증으로 자연 그대로의 건강한 제품을 생산합니다.
      </>
    ),
    image: "/certification/env_img_transparent.png",
    bg: "#C3C8AE",
  },
  {
    title: "품질 경영",
    desc: "기업부설연구소 운영과 지속적인 품질 개선으로 최고의 제품을 만들어갑니다.",
    image: "/certification/busi_img_transparent.png",
    bg: "#FFF9E1",
  },
  {
    title: "사회적 책임",
    desc: "가족친화, 고용우수기업 인증으로 함께 성장하는 기업문화를 실천합니다.",
    image: "/certification/recycle_img_transparent.png",
    bg: "#FBB8BF",
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

type CertListItem = (typeof MOCK_CERT_ITEMS)[number];

/** 인증서 탭 카드 — 시안: p20·rounded-30·gap20 / 이미지 h270·rounded-10 / 제목 14px 800 #1F2121 */
function CertTabCard({ item, variant }: { item: CertListItem; variant: "slide" | "grid" }) {
  const { image_url, title } = item;
  return (
    <div
      className={cn(
        nanum,
        "inline-flex w-full max-w-full flex-col items-center gap-5 rounded-[30px] bg-white p-5",
        variant === "slide" &&
          "w-[min(303px,calc(100vw-2.75rem))] shrink-0 snap-start",
        variant === "grid" && "md:min-h-0",
      )}
    >
      <div
        className={cn(
          "flex w-full shrink-0 flex-col items-stretch gap-[18px]",
          "h-[270px]",
          variant === "grid" &&
            "md:h-[clamp(270px,calc(345*100vw/1920),345px)]",
        )}
      >
        <img
          src={image_url ?? ""}
          alt={title}
          className="h-full w-full rounded-[10px] object-contain object-center"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-[10px] self-stretch">
        <p className="w-full text-center text-[14px] font-extrabold leading-[21px] text-[#1F2121]">
          {title}
        </p>
      </div>
    </div>
  );
}

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
    <div className="w-full bg-[#F4F2E5] md:bg-[#F5F2E8]">
      <Breadcrumb
        items={[
          { label: "회사소개", href: "/brand/intro" },
          { label: "품질 & 인증" },
        ]}
      />
      {/* ── 페이지 타이틀 (PC) ── */}
      <div className="hidden py-10 text-center md:block md:py-14">
        <h1 className="text-[36px] leading-tight font-bold tracking-tight text-[#02633E] md:text-[clamp(32px,calc(52*100vw/1920),52px)]">
          품질 & 인증
        </h1>
        <p className="mt-3 text-sm text-gray-500 md:text-base">
          30년 전통의 품질 관리 노하우와 국내외 공인 인증
        </p>
      </div>

      {/* 모바일 히어로: 343 높이 · 30px 라운드 · 그라데이션 + 텍스트 오버레이 (375 시안) */}
      <div className="px-4 pt-6 md:hidden">
        <div className="relative h-[343px] w-full overflow-hidden rounded-[30px]">
          <img
            src="/certification/certification_banner.png"
            alt="품질 & 인증"
            className="absolute inset-0 h-full w-full object-cover object-[56%_42%]"
            width={1840}
            height={800}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[15px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(232, 232, 230, 0) 0%, #E8E8E6 69%)",
            }}
            aria-hidden
          />
          <div className="absolute left-0 right-0 top-[139px] flex flex-col gap-2.5 p-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2.5">
                <h2
                  className={cn(
                    nanum,
                    "text-[20px] font-extrabold leading-7 text-[#003F2B]",
                  )}
                >
                  품질은 약속입니다
                </h2>
                <p
                  className={cn(
                    nanum,
                    "text-[14px] font-normal leading-[21px] text-[#003F2B]",
                  )}
                >
                  풍림푸드는 1994년 창업 이래 &quot;품질이 곧 신뢰&quot;라는
                  <br />
                  철학 아래, 엄격한 품질 관리 시스템을 구축해 왔습니다.
                  <br />
                  <br />
                  단순히 인증을 획득하는 것을 넘어,
                  <br />
                  매일의 생산 현장에서 그 기준을 실천하는 것이
                  <br />
                  진정한 품질이라고 믿습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 커스텀 배너 — PC만 ── */}
      <div className="hidden px-4 pt-2 md:block md:px-8 md:pt-4 lg:px-2.5">
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

      {/* ══ 섹션 1: 품질 약속 카드 (모바일 시안: px16·py40·카드 간 gap10, 카드 p20·justify-center) ══ */}
      <div className="mx-auto w-full max-w-full px-4 py-10 md:max-w-[min(1208px,calc(1208*100vw/1920))] md:pb-20 md:pt-16">
        <div className="flex w-full flex-col items-start justify-start gap-2.5 md:grid md:grid-cols-2 md:gap-2">
          {MOCK_QUALITY_ITEMS.map(({ title, desc, image, bg }) => (
            <div
              key={title}
              className={cn(
                "w-full min-w-0 self-stretch overflow-hidden rounded-[20px] p-5",
                /* 모바일: 가로 줄 — flex(블록)로 유지해 텍스트 열 너비 버그 방지, 시각은 시안과 동일 */
                "flex flex-row items-start justify-center gap-2.5",
                "md:h-[clamp(320px,calc(520*100vw/1920),520px)] md:min-h-0 md:flex-col md:justify-start md:gap-0 md:p-0 md:rounded-2xl",
              )}
              style={{ backgroundColor: bg }}
            >
              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-1 basis-0 flex-col items-start justify-start gap-2.5",
                  "md:basis-auto md:gap-0 md:px-8 md:pt-8",
                )}
              >
                <div className="flex w-full min-w-0 flex-col justify-end md:contents">
                  <h3
                    className={cn(
                      nanum,
                      "break-words text-[18px] font-extrabold leading-[27px] text-[#1F2121]",
                      "md:mb-3 md:font-bold md:tracking-[-0.02em] md:text-[clamp(16px,calc(22*100vw/1920),22px)]",
                    )}
                  >
                    {title}
                  </h3>
                </div>
                <p
                  className={cn(
                    nanum,
                    "w-full min-w-0 self-stretch break-words text-[14px] font-bold leading-[21px] text-[#1F2121]",
                    "md:font-normal md:text-gray-700 md:text-[clamp(13px,calc(15*100vw/1920),15px)]",
                  )}
                >
                  {desc}
                </p>
              </div>
              <div className="shrink-0 md:flex md:flex-1 md:items-end md:justify-center md:px-8 md:pb-8">
                <img
                  src={image}
                  alt={title}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] shrink-0 object-contain mix-blend-darken md:h-[min(310px,calc(310*100vw/1920))] md:w-[min(310px,calc(310*100vw/1920))] md:max-w-full md:mix-blend-normal"
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
        {/* 섹션 헤더 — gutter는 PageContentMax만 사용 (모바일 이중 px 방지) */}
        <div className="mb-8 flex flex-col gap-2.5 py-5 text-left md:mb-10 md:py-0 md:text-center">
          <h2
            className={cn(
              nanum,
              "text-[18px] font-extrabold leading-[30px] text-[#003F2B]",
              "md:mb-3 md:text-[clamp(26px,calc(42*100vw/1920),42px)] md:font-bold md:leading-tight md:tracking-[-0.03em] md:text-[#02633E]",
            )}
          >
            주요 인증 및 수상내역
          </h2>
          <p
            className={cn(
              nanum,
              "text-[14px] font-bold leading-[16.8px] text-[#1F2121] md:text-base md:font-normal md:leading-normal md:text-gray-500",
            )}
          >
            국내외 공인 기관의 엄격한 인증과 수상을 통해 품질을 인정받았습니다
          </p>
        </div>

        {/* 탭 — 모바일: 12px 6px 패딩 · 12px 글자 (시안) */}
        <div className="mb-8 flex gap-2.5 md:mb-10">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                nanum,
                "rounded-full px-3 py-1.5 text-[12px] font-bold leading-[18px] transition-all md:px-5 md:py-2 md:text-sm md:font-semibold",
                activeTab === key
                  ? "bg-[#02633E] text-white"
                  : "bg-transparent text-[#1F2121] md:bg-[#EAE3C9] md:text-[#555]",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 수상내역 — 모바일: 아이보리 단일 카드(이미지 + 캡션) / PC: 기존 2열 */}
        {activeTab === "award" && (
          <>
            <div className="flex flex-col gap-4 md:hidden">
              {awards.map(({ id, title, image_url }) => (
                <div
                  key={id}
                  className={cn(
                    nanum,
                    "flex min-h-0 flex-col gap-5 rounded-[30px] bg-[#EAE3C9] p-5",
                  )}
                >
                  <div className="flex h-[303px] w-full flex-col gap-[18px] overflow-hidden rounded-[10px]">
                    <img
                      src={image_url ?? ""}
                      alt={title}
                      className="h-full w-full rounded-[10px] object-contain object-center"
                    />
                  </div>
                  <p className="text-center text-[14px] font-extrabold leading-[21px] text-[#003F2B]">
                    {title}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden md:flex md:h-[clamp(420px,calc(894*100vw/1920),894px)] md:flex-row md:gap-4">
              {awards.map(({ id, title, image_url }) => (
                <Fragment key={id}>
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
          </>
        )}

        {/* 인증서 — 모바일: 가로 스냅 슬라이드(다음 카드 일부 노출) / PC: 그리드 */}
        {activeTab === "cert" && (
          <>
            <div className="-mx-4 md:hidden">
              <div
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 scroll-pr-4 px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                aria-label="인증서 목록"
              >
                {certs.map((item) => (
                  <CertTabCard key={item.id} item={item} variant="slide" />
                ))}
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {certs.map((item) => (
                <CertTabCard key={item.id} item={item} variant="grid" />
              ))}
            </div>
          </>
        )}
      </PageContentMax>
    </div>
  );
}
