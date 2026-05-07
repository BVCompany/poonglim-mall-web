/**
 * 오시는 길 페이지
 */
import type { TFunction } from "i18next";
import { type ReactNode, useMemo, useState } from "react";
import { Bus, Car, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/location";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const pageBanner = await getPageBanner("location").catch(() => null);
  return { pageBanner, metaTitle: t("pages.brand.location.metaTitle") };
}

const TAB_IDS = ["seoul", "hq"] as const;
type TabId = (typeof TAB_IDS)[number];

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

/**
 * Google iframe 임베드 — 구형 maps.google.com + output=embed 는
 * 종종 지오코딩·줌이 무시되고 세계지도만 보입니다. www.google.com/maps 로 고정합니다.
 */
function googleMapEmbedSrc(queryForGeocode: string, zoom = 17) {
  const q = encodeURIComponent(queryForGeocode.trim());
  return `https://www.google.com/maps?q=${q}&z=${zoom}&hl=ko&output=embed`;
}

/** 지하철 노선 뱃지 — PC 시안: min 27px · #BDB193 · 18/27 extrabold */
const SubwayBadge = ({ line }: { line: string }) => (
  <span className="mr-1 inline-flex min-h-[27px] min-w-[27px] shrink-0 items-center justify-center rounded-full bg-[#BDB193] px-1 font-[family-name:var(--font-nanum)] text-lg font-extrabold leading-[27px] text-white">
    {line}
  </span>
);

const navHighlightClass =
  "font-[family-name:var(--font-nanum)] text-base font-extrabold leading-6 text-[#32AF32]";

function buildLocations(t: TFunction): Record<TabId, LocationInfo> {
  return {
    seoul: {
      title: t("pages.brand.location.tabs.seoul"),
      address: "서울특별시 강남구 봉은사로 64길 5",
      tel: "02-538-5617",
      fax: "02-538-5623",
      hours: t("pages.brand.location.hoursWeekday"),
      email: "poonglim@freshegg.co.kr",
      kakaoUrl: "https://map.kakao.com/link/search/서울특별시 강남구 봉은사로 64길 5",
      mapSrc: googleMapEmbedSrc("서울특별시 강남구 봉은사로 64길 5", 16),
      transportLabel: t("pages.brand.location.seoul.transportTitle"),
      carDesc: (
        <>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
            {t("pages.brand.location.seoul.carLine1")}
          </span>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
            &apos;
          </span>
          <span className={navHighlightClass}>
            {t("pages.brand.location.seoul.carHighlight")}
          </span>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
            &apos;{" "}
          </span>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
            {t("pages.brand.location.seoul.carLine2")}
          </span>
        </>
      ),
      publicDesc: (
        <>
          <SubwayBadge line="9" />
          {t("pages.brand.location.seoul.publicAfterBadge")}
        </>
      ),
    },
    hq: {
      title: t("pages.brand.location.tabs.hq"),
      /** 푸터·hqAddressShort와 동일 (궁동길) — 카카오/구글 지오코딩 및 안내 통일 */
      address: "충청북도 진천군 이월면 궁동길 51-21",
      tel: "043-533-2285",
      fax: "043-533-2988",
      hours: t("pages.brand.location.hoursWeekday"),
      email: "poonglim@freshegg.co.kr",
      kakaoUrl:
        "https://map.kakao.com/link/search/충청북도 진천군 이월면 궁동길 51-21",
      mapSrc: googleMapEmbedSrc(
        "충청북도 진천군 이월면 궁동길 51-21",
        15,
      ),
      transportLabel: t("pages.brand.location.hq.transportTitle"),
      carDesc: (
        <>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
            {t("pages.brand.location.hq.carLine1")}
          </span>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
            &apos;
          </span>
          <span className={navHighlightClass}>
            {t("pages.brand.location.hq.carHighlight")}
          </span>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#32AF32]">
            &apos;{" "}
          </span>
          <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
            {t("pages.brand.location.hq.carLine2")}
          </span>
        </>
      ),
      publicDesc: (
        <>{t("pages.brand.location.hq.publicTransit")}</>
      ),
    },
  };
}

export default function LocationScreen({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const pageBanner = loaderData?.pageBanner ?? null;
  const locations = useMemo(() => buildLocations(t), [t]);
  const [activeTab, setActiveTab] = useState<TabId>("seoul");
  const loc = locations[activeTab];

  const detailRows = useMemo(
    () =>
      [
        {
          key: "address",
          label: t("pages.brand.location.labelAddress"),
          value: <span className="text-[#1F2121]">{loc.address}</span>,
        },
        {
          key: "tel",
          label: t("pages.brand.location.labelTel"),
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
          key: "fax",
          label: t("pages.brand.location.labelFax"),
          value: (
            <span className="text-[#02633E] md:text-[#1F2121]">{loc.fax}</span>
          ),
        },
        {
          key: "hours",
          label: t("pages.brand.location.labelHours"),
          value: (
            <span className="text-[#02633E] md:text-[#1F2121]">{loc.hours}</span>
          ),
        },
        {
          key: "email",
          label: t("pages.brand.location.labelEmail"),
          value: (
            <a
              href={`mailto:${loc.email}`}
              className="text-[#02633E] hover:underline md:text-[#1F2121] md:hover:opacity-80"
            >
              {loc.email}
            </a>
          ),
        },
      ] as const,
    [t, loc],
  );

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/support_banner_temp.png"
        title={t("pages.brand.location.bannerTitle")}
        subtitle={t("pages.brand.location.bannerSubtitle")}
        breadcrumb={[
          { label: t("common.breadcrumbHome"), href: "/" },
          { label: t("navigation.mega.company"), href: "/brand/intro" },
          { label: t("pages.brand.location.bannerTitle") },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <SectionPageTitle
        as="h1"
        preset="none"
        className="inline-flex items-center gap-1.5 px-4 pt-3 md:hidden"
        markClassName="h-3.5 w-3.5"
        titleClassName="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]"
      >
        {t("pages.brand.location.mobileH1")}
      </SectionPageTitle>

      <PageContentMax className="py-6 md:pt-[60px] md:pb-10">
        <div className="mb-5 flex gap-2.5 px-0 py-3.5 max-md:px-0 md:mb-5 md:gap-2.5 md:py-0">
          {TAB_IDS.map((tab) => {
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
                {locations[tab].title}
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-[10px] bg-white shadow-sm md:rounded-[40px]">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-0 md:py-10">
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
                  title={t("pages.brand.location.mapTitle", { name: loc.title })}
                  className="h-full w-full"
                />
              </div>
            </div>

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
                  <span>{t("pages.brand.location.kakaoMap")}</span>
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
                {detailRows.map(({ key, label, value }) => (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col gap-2.5 md:flex-row md:items-center md:gap-3",
                      key === "address" && "hidden md:flex",
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
                    {t("pages.brand.location.byCar")}
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
                    {t("pages.brand.location.byTransit")}
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
                    {t("pages.brand.location.byCar")}
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
                    {t("pages.brand.location.byTransit")}
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
