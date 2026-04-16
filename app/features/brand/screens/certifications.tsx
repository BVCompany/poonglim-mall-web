/**
 * 품질 & 인증 페이지
 * 배경: 헤더와 동일(--site-chrome-header-bg / #FDFDF5)
 * PC: 1600 타이틀 밴드(60/40r) · 1840×800 히어로 · 4카드 600·gap20
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
const pretendard = "font-[Pretendard,system-ui,sans-serif]";

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
    desc: "HACCP, FSSC 22000 인증을 통해 원료 입고부터 출하까지 전 과정을 철저히 관리합니다.",
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

/** 인증서 탭 카드 — 모바일(슬라이드): 기존 시안 / PC(그리드): 1920 시안 px를 100vw/1920로 스케일 */
function CertTabCard({ item, variant }: { item: CertListItem; variant: "slide" | "grid" }) {
  const { image_url, title } = item;
  return (
    <div
      className={cn(
        nanum,
        "inline-flex w-full max-w-full flex-col items-center gap-5 rounded-[30px] bg-white p-5",
        variant === "slide" &&
          "w-[min(303px,calc(100vw-2.75rem))] shrink-0 snap-start",
        variant === "grid" &&
          cn(
            "md:min-h-0",
            "md:gap-[min(20px,calc(20*100vw/1920))]",
            "md:rounded-[min(35.16px,calc(35.16*100vw/1920))]",
            "md:p-[min(20px,calc(20*100vw/1920))]",
          ),
      )}
    >
      <div
        className={cn(
          "flex w-full shrink-0 flex-col items-stretch gap-[18px]",
          "h-[270px]",
          variant === "grid" &&
            "md:gap-[min(18px,calc(18*100vw/1920))] md:h-[min(345px,calc(345*100vw/1920))]",
        )}
      >
        <img
          src={image_url ?? ""}
          alt={title}
          className={cn(
            "h-full w-full object-contain object-center",
            "rounded-[10px]",
            variant === "grid" &&
              "md:rounded-[min(10px,calc(10*100vw/1920))]",
          )}
        />
      </div>
      <div
        className={cn(
          "flex w-full flex-col items-center self-stretch",
          variant === "slide" && "gap-[10px]",
          variant === "grid" &&
            "md:gap-[min(10.55px,calc(10.55*100vw/1920))]",
        )}
      >
        <p className="w-full break-words text-center text-[14px] font-extrabold leading-[21px] text-[#1F2121]">
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
    <div className="w-full bg-[var(--site-chrome-header-bg,#FDFDF5)]">
      <Breadcrumb
        items={[
          { label: "회사소개", href: "/brand/intro" },
          { label: "품질 & 인증" },
        ]}
      />

      {/* PC: 1600 컬럼 · 상단 타이틀 밴드(바깥 60r · 안 40r) + 히어로와 gap 20 */}
      <PageContentMax className="hidden pb-5 md:block">
        <div className="mx-auto flex h-[min(300px,calc(300*100vw/1920))] w-full max-w-full flex-col rounded-[60px] px-10">
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[40px]">
            <div className={cn("flex w-full max-w-[487px] flex-col gap-2.5 text-center")}>
              <h1
                className={cn(
                  nanum,
                  "text-[clamp(40px,calc(60*100vw/1920),60px)] font-extrabold leading-[1.4] text-[#003F2B] md:leading-[84px]",
                )}
              >
                품질 & 인증
              </h1>
              <p className={cn(nanum, "text-base font-normal leading-[19.2px] text-[#003F2B]")}>
                30년 전통의 품질 관리 노하우와 국내외 공인 인증
              </p>
            </div>
          </div>
        </div>
      </PageContentMax>

      {/* 모바일: 페이지 타이틀 (375) */}
      <div className="px-4 py-8 text-center md:hidden">
        <h1 className={cn(nanum, "text-[36px] font-bold leading-tight tracking-tight text-[#02633E]")}>
          품질 & 인증
        </h1>
        <p className={cn(nanum, "mt-3 text-sm text-[#1F2121]/70")}>
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

      {/* ── PC 히어로: 1840×800 · 라운드 40 · 딥그린 타이포(시안) ── */}
      <div className="hidden md:block md:px-10 md:pb-4">
        <div className="mx-auto w-full max-w-[var(--hero-pc-width)]">
          <div
            className="relative overflow-hidden rounded-[40px]"
            style={{ aspectRatio: "1840 / 800" }}
          >
            <img
              src="/certification/certification_banner.png"
              alt="품질 & 인증 배너"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex flex-col",
                "pt-[min(60px,calc(60*100vw/1920))] pb-[min(80px,calc(80*100vw/1920))]",
                "pl-[min(120px,calc(120*100vw/1920))] pr-[min(120px,calc(120*100vw/1920))]",
              )}
            >
              <div className={cn("flex max-w-[min(727px,100%)] flex-col gap-2.5")}>
                <h2
                  className={cn(
                    nanum,
                    "text-[clamp(22px,calc(32*100vw/1920),32px)] font-extrabold leading-tight text-[#003F2B] md:leading-[44.8px]",
                  )}
                >
                  품질은 약속입니다
                </h2>
                <p className={cn(nanum, "text-base font-normal leading-[19.2px] text-[#003F2B]")}>
                  풍림푸드는 1994년 창업 이래 &quot;품질이 곧 신뢰&quot;라는 철학 아래, 엄격한 품질
                  관리 시스템을 구축해 왔습니다.
                  <br />
                  단순히 인증을 획득하는 것을 넘어, 매일의 생산 현장에서 그 기준을 실천하는 것이
                  진정한 품질이라고 믿습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 섹션 1: 품질 약속 카드 — PC 시안: p40·r40·col·center·gap20 / 제목 28·42·800 / 본문 16·700·24 / 310 이미지 darken ══ */}
      <PageContentMax className="py-10 md:rounded-[60px] md:py-[min(100px,calc(100*100vw/1920))]">
        <div className="flex w-full flex-col items-start justify-start gap-2.5 md:mx-auto md:grid md:max-w-[1220px] md:grid-cols-2 md:gap-5">
          {MOCK_QUALITY_ITEMS.map(({ title, desc, image, bg }) => (
            <div
              key={title}
              className={cn(
                "w-full min-w-0 self-stretch overflow-hidden rounded-[20px] p-5",
                "flex flex-row items-start justify-center gap-2.5",
                "md:h-[min(520px,calc(520*100vw/1920))] md:min-h-0 md:flex-col md:items-center md:justify-center md:gap-5 md:rounded-[40px] md:p-10",
              )}
              style={{ backgroundColor: bg }}
            >
              <div
                className={cn(
                  "flex min-h-0 min-w-0 flex-1 basis-0 flex-col items-start justify-start gap-2.5",
                  "md:basis-auto md:w-full md:gap-5",
                )}
              >
                <h3
                  className={cn(
                    nanum,
                    "w-full break-words text-[18px] font-extrabold leading-[27px] text-[#1F2121] md:min-h-[42px] md:self-stretch md:text-[28px] md:font-extrabold md:leading-[42px]",
                  )}
                >
                  {title}
                </h3>
                <div
                  className={cn(
                    nanum,
                    "w-full min-w-0 self-stretch break-words text-[14px] font-bold leading-[21px] text-[#1F2121] md:self-stretch md:text-base md:font-bold md:leading-6 md:text-[#1F2121]",
                  )}
                >
                  {desc}
                </div>
              </div>
              <div className="flex shrink-0 md:w-full md:justify-center">
                <img
                  src={image}
                  alt={title}
                  width={120}
                  height={120}
                  className="h-[120px] w-[120px] shrink-0 object-contain mix-blend-darken md:h-[min(310px,calc(310*100vw/1920))] md:w-[min(310px,calc(310*100vw/1920))] md:max-w-full md:mix-blend-darken"
                />
              </div>
            </div>
          ))}
        </div>
      </PageContentMax>

      {/* ══ 섹션 2: 주요 인증 및 수상내역 ══
          컨테이너에 수평 패딩 없음 → 수상내역 카드가 1600px 전체 사용.
          타이틀·탭·인증서 그리드는 요소 단위로 px-4 md:px-0 적용. */}
      <PageContentMax className="pb-16 md:pb-[min(100px,calc(100*100vw/1920))] md:pt-[min(60px,calc(60*100vw/1920))]">
        {/* 섹션 헤더 — PC 시안: 60/84 · #003F2B */}
        <div className="mb-8 flex flex-col gap-2.5 py-5 text-left md:mb-10 md:py-0 md:text-center">
          <h2
            className={cn(
              nanum,
              "text-[18px] font-extrabold leading-[30px] text-[#003F2B]",
              "md:text-[clamp(36px,calc(60*100vw/1920),60px)] md:font-extrabold md:leading-[84px]",
            )}
          >
            주요 인증 및 수상내역
          </h2>
          <p
            className={cn(
              nanum,
              "text-[14px] font-bold leading-[16.8px] text-[#1F2121] md:text-base md:font-normal md:leading-[19.2px] md:text-[#003F2B]",
            )}
          >
            국내외 공인 기관의 엄격한 인증과 수상을 통해 품질을 인정받았습니다
          </p>
        </div>

        {/* 탭 — 모바일 기존 / PC: Pretendard 16/24 · 비활성 배경 없음 */}
        <div className="mb-8 flex gap-2.5 md:mb-10">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[12px] leading-[18px] transition-all",
                "md:px-5 md:py-2 md:text-base md:leading-6",
                pretendard,
                activeTab === key
                  ? "bg-[#02633E] font-bold text-white md:font-bold"
                  : "bg-transparent font-bold text-[#1F2121] md:font-medium",
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

            <div className="hidden md:flex md:h-[clamp(420px,calc(894*100vw/1920),894px)] md:flex-row md:gap-5">
              {awards.map(({ id, title, image_url }) => (
                <Fragment key={id}>
                  <div
                    className={cn(
                      nanum,
                      "flex items-center justify-center rounded-[40px] md:h-full md:w-[min(533px,calc(533*100vw/1920))] md:shrink-0 md:p-10",
                    )}
                    style={{ backgroundColor: "#EAE3C9", minHeight: 280 }}
                  >
                    <h3
                      className={cn(
                        nanum,
                        "break-words text-center text-[clamp(22px,calc(32*100vw/1920),32px)] font-extrabold leading-[44.8px] text-[#003F2B]",
                      )}
                      style={{ letterSpacing: "-0.04em" }}
                    >
                      {title}
                    </h3>
                  </div>

                  <div
                    className="flex flex-1 items-center justify-center rounded-[60px] bg-white md:h-full"
                    style={{
                      padding: pc1920(24, 60),
                      minHeight: 280,
                    }}
                  >
                    <img
                      src={image_url ?? ""}
                      alt={title}
                      className="max-h-full w-full rounded-[60px] object-contain"
                      style={{
                        maxWidth: pcMin(1017),
                        maxHeight: pcMin(774),
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
