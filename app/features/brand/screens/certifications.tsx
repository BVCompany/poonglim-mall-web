/**
 * 품질 & 인증 페이지
 * 배경: 헤더와 동일(--site-chrome-header-bg / #FDFDF5)
 * PC: 1600 타이틀 밴드(60/40r) · 1840×800 히어로 · 4카드 600·gap20
 */
import type { Route } from "./+types/certifications";
import type { ReactNode } from "react";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { XIcon } from "lucide-react";

import {
  getCertAwards,
  getCertItems,
} from "~/features/brand/lib/queries.server";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import i18next from "~/core/lib/i18next.server";
import { cn } from "~/core/lib/utils";
import { pcMin } from "~/core/lib/pc-fluid";

const nanum = "font-[family-name:var(--font-nanum)]";
const pretendard = "font-[Pretendard,system-ui,sans-serif]";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
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
  return { dbAwards, dbCerts, metaTitle: t("pages.brand.certifications.metaTitle") };
}

/* ── 폴백 목 데이터 (모바일 카드 시안: p20·gap10·타이포 동일) ── */
const MOCK_QUALITY_ITEMS_KO: {
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

const MOCK_QUALITY_ITEMS_EN: (typeof MOCK_QUALITY_ITEMS_KO)[number][] = [
  {
    title: "Food safety",
    desc: "HACCP and FSSC 22000 cover every step from inbound raw materials to outbound shipment.",
    image: "/certification/safety_img_transparent.png",
    bg: "#FBE28A",
  },
  {
    title: "Eco-friendly",
    desc: (
      <>
        Eco-certified ingredients and antibiotic-free practices
        <br />
        help us deliver wholesome products as nature intended.
      </>
    ),
    image: "/certification/env_img_transparent.png",
    bg: "#C3C8AE",
  },
  {
    title: "Quality management",
    desc: "Our in-house R&D lab and continuous improvement culture drive best-in-class products.",
    image: "/certification/busi_img_transparent.png",
    bg: "#FFF9E1",
  },
  {
    title: "Social responsibility",
    desc: "Family-friendly and employment-excellence certifications reflect how we grow with our people.",
    image: "/certification/recycle_img_transparent.png",
    bg: "#FBB8BF",
  },
];

const MOCK_CERT_ITEMS_KO = [
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

const MOCK_CERT_ITEMS_EN = [
  { id: 1, image_url: "/certification/cert01.png", title: "HACCP (pouched liquid egg)" },
  { id: 2, image_url: "/certification/cert02.png", title: "Commendation plaque" },
  { id: 3, image_url: "/certification/cert03.png", title: "HACCP (liquid egg)" },
  { id: 4, image_url: "/certification/cert04.png", title: "Water quality report" },
  { id: 5, image_url: "/certification/cert05.png", title: "FSSC 22000" },
  { id: 6, image_url: "/certification/cert06.png", title: "Appreciation plaque" },
  {
    id: 7,
    image_url: "/certification/cert07.png",
    title: "Livestock product manufacturing license",
  },
  { id: 8, image_url: "/certification/cert08.png", title: "ISO 22000" },
  { id: 9, image_url: "/certification/cert09.png", title: "LOHAS certification" },
  { id: 10, image_url: "/certification/cert10.png", title: "SME confirmation" },
  { id: 11, image_url: "/certification/cert11.png", title: "Exemplary business certification" },
];

const MOCK_AWARD_ITEMS_KO = [
  {
    id: 1,
    title: "충북지방 중소벤처기업청 표창장",
    image_url: "/certification/cert-award-sme-1.png",
  },
];

const MOCK_AWARD_ITEMS_EN = [
  {
    id: 1,
    title: "Commendation from Chungbuk Regional SMEs Office",
    image_url: "/certification/cert-award-sme-1.png",
  },
];

type TabKey = "award" | "cert";

type CertListItem = (typeof MOCK_CERT_ITEMS_KO)[number];

/** 인증서 탭 카드 — 모바일(슬라이드): 기존 시안 / PC(그리드): 1920 시안 px를 100vw/1920로 스케일 */
function CertTabCard({
  item,
  variant,
  onPreview,
}: {
  item: CertListItem;
  variant: "slide" | "grid";
  onPreview?: (item: CertListItem) => void;
}) {
  const { image_url, title } = item;
  const imgClass = cn(
    "h-full w-full object-contain object-center",
    "rounded-[10px]",
    variant === "grid" && "md:rounded-[min(10px,calc(10*100vw/1920))]",
  );
  const imageInner =
    image_url && onPreview ? (
      <button
        type="button"
        onClick={() => onPreview(item)}
        className="flex h-full w-full cursor-zoom-in items-center justify-center border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#02633E]/50 focus-visible:ring-offset-2"
        aria-label={`${title} 원본 이미지 보기`}
      >
        <img src={image_url} alt="" className={imgClass} />
      </button>
    ) : (
      <img src={image_url ?? ""} alt={title} className={imgClass} />
    );
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
        {imageInner}
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

type AwardListEntry = (typeof MOCK_AWARD_ITEMS_KO)[number];

/**
 * 수상내역
 * · 모바일: 베이지 카드 1장 — 상단 이미지 · 하단 리스트(스크롤) · 탭 선택 시 상단 이미지 변경 · 이미지 클릭 시 모달
 * · PC: 왼쪽 리스트 · 오른쪽 이미지(동일 동작)
 */
function AwardsListPanel({
  awards,
  onPreview,
  listAriaLabel,
  emptyLabel,
  noImageLabel,
}: {
  awards: AwardListEntry[];
  onPreview: (item: { image_url?: string | null; title: string }) => void;
  listAriaLabel: string;
  emptyLabel: string;
  noImageLabel: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const awardsIdentity = useMemo(() => awards.map((a) => a.id).join(","), [awards]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [awardsIdentity]);

  const safeIndex = awards.length > 0 ? Math.min(selectedIndex, awards.length - 1) : 0;
  const current = awards[safeIndex];

  if (awards.length === 0) {
    return (
      <p className={cn(nanum, "rounded-[30px] bg-[#EAE3C9]/60 px-5 py-10 text-center text-sm text-[#003F2B]/80 md:rounded-[40px] md:text-base")}>
        {emptyLabel}
      </p>
    );
  }

  const listScrollClass =
    "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [scrollbar-color:rgba(0,63,43,0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#003F2B]/30";

  return (
    <div
      className={cn(
        "flex flex-col gap-4 overflow-hidden rounded-[30px] bg-[#EAE3C9] p-4",
        "md:min-h-[min(360px,calc(360*100vw/1920))] md:flex-row md:items-stretch md:gap-5 md:rounded-none md:bg-transparent md:p-0 md:overflow-visible",
      )}
    >
      {/* 모바일: 상단 이미지 / PC: 오른쪽 이미지 */}
      <div
        className={cn(
          "order-1 flex min-h-[200px] min-w-0 flex-1 items-center justify-center rounded-[16px] bg-white p-3",
          "md:order-2 md:min-h-[280px] md:rounded-[60px] md:p-[clamp(16px,calc(48*100vw/1920),48px)]",
        )}
      >
        {current?.image_url ? (
          <button
            type="button"
            onClick={() => onPreview({ image_url: current.image_url, title: current.title })}
            className={cn(
              "flex w-full cursor-zoom-in items-center justify-center border-0 bg-transparent p-0",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#02633E]/40",
            )}
            aria-label={`${current.title} 원본 이미지 보기`}
          >
            <img
              src={current.image_url}
              alt=""
              className={cn(
                "w-full object-contain",
                "max-h-[min(320px,52vh)] rounded-[10px]",
                "md:max-h-[min(774px,calc(774*100vw/1920))] md:rounded-[40px]",
              )}
              style={{ maxWidth: pcMin(1017) }}
            />
          </button>
        ) : (
          <span className={cn(nanum, "text-sm text-[#003F2B]/50")}>{noImageLabel}</span>
        )}
      </div>

      {/* 모바일: 하단 리스트 / PC: 왼쪽 리스트 */}
      <div
        className={cn(
          nanum,
          "order-2 flex max-h-[min(42vh,300px)] min-h-0 flex-col overflow-hidden md:order-1 md:max-h-none",
          "md:h-auto md:w-[min(380px,calc(380*100vw/1920))] md:shrink-0 md:self-stretch md:rounded-[40px] md:bg-[#EAE3C9]",
        )}
      >
        <div
          className={cn(listScrollClass, "px-0 pb-0.5 pt-0.5 md:flex-1 md:px-6 md:py-6")}
          aria-label={listAriaLabel}
          role="region"
        >
          <ul className="m-0 flex list-none flex-col justify-start gap-1 md:min-h-full md:justify-center md:gap-2">
            {awards.map((item, idx) => {
              const selected = idx === safeIndex;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    aria-current={selected ? "true" : undefined}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-center transition-colors md:px-4 md:py-3",
                      "text-[13px] leading-snug md:text-[clamp(15px,calc(18*100vw/1920),18px)] md:leading-relaxed",
                      selected
                        ? "bg-[#003F2B]/10 font-extrabold text-[#003F2B] md:bg-[#003F2B]/[0.08]"
                        : "font-medium text-[#003F2B]/55 hover:bg-black/[0.04]",
                    )}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CertificationsScreen({
  loaderData,
}: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const { dbAwards, dbCerts } = loaderData;
  const [activeTab, setActiveTab] = useState<TabKey>("award");
  const [imagePreview, setImagePreview] = useState<{ src: string; title: string } | null>(null);
  const isEn = i18n.language.startsWith("en");

  const openCertPreview = (item: { image_url?: string | null; title: string }) => {
    const src = item.image_url?.trim();
    if (!src) return;
    setImagePreview({ src, title: item.title });
  };

  const tabDefs = useMemo(
    () =>
      [
        { key: "award" as const, label: t("pages.brand.certifications.tabAwards") },
        { key: "cert" as const, label: t("pages.brand.certifications.tabCerts") },
      ] as const,
    [t],
  );

  const qualityItems = isEn ? MOCK_QUALITY_ITEMS_EN : MOCK_QUALITY_ITEMS_KO;

  const awards = (
    dbAwards.length > 0
      ? dbAwards
      : isEn
        ? MOCK_AWARD_ITEMS_EN
        : MOCK_AWARD_ITEMS_KO
  ) as typeof MOCK_AWARD_ITEMS_KO;
  const certs = (
    dbCerts.length > 0
      ? dbCerts
      : isEn
        ? MOCK_CERT_ITEMS_EN
        : MOCK_CERT_ITEMS_KO
  ) as typeof MOCK_CERT_ITEMS_KO;

  return (
    <div className="w-full bg-[var(--site-chrome-header-bg,#FDFDF5)]">
      <Breadcrumb
        items={[
          { label: t("navigation.mega.company"), href: "/brand/intro" },
          { label: t("pages.brand.certifications.breadcrumbCurrent") },
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
                {t("pages.brand.certifications.breadcrumbCurrent")}
              </h1>
              <p className={cn(nanum, "text-base font-normal leading-[19.2px] text-[#003F2B]")}>
                {t("pages.brand.certifications.sectionCertsSubtitle")}
              </p>
            </div>
          </div>
        </div>
      </PageContentMax>

      {/* 모바일: 페이지 타이틀 (375) */}
      <div className="px-4 py-8 text-center md:hidden">
        <h1 className={cn(nanum, "text-[36px] font-bold leading-tight tracking-tight text-[#02633E]")}>
          {t("pages.brand.certifications.breadcrumbCurrent")}
        </h1>
        <p className={cn(nanum, "mt-3 text-sm text-[#1F2121]/70")}>
          {t("pages.brand.certifications.sectionCertsSubtitle")}
        </p>
      </div>

      {/* 모바일 히어로: 343 높이 · 30px 라운드 · 그라데이션 + 텍스트 오버레이 (375 시안) */}
      <div className="px-4 pt-6 md:hidden">
        <div className="relative h-[343px] w-full overflow-hidden rounded-[30px]">
          <img
            src="/certification/certification_banner.png"
            alt={t("pages.brand.certifications.heroAlt")}
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
                  {t("pages.brand.certifications.heroTitle")}
                </h2>
                <p
                  className={cn(
                    nanum,
                    "whitespace-pre-line text-[14px] font-normal leading-[21px] text-[#003F2B]",
                  )}
                >
                  {t("pages.brand.certifications.heroLeadMobile")}
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
              alt={t("pages.brand.certifications.heroAltBanner")}
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
                  {t("pages.brand.certifications.heroTitle")}
                </h2>
                <p
                  className={cn(
                    nanum,
                    "whitespace-pre-line text-base font-normal leading-[19.2px] text-[#003F2B]",
                  )}
                >
                  {t("pages.brand.certifications.heroLeadDesktop")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 섹션 1: 품질 약속 카드 — PC 시안: p40·r40·col·center·gap20 / 제목 28·42·800 / 본문 16·700·24 / 310 이미지 darken ══ */}
      <PageContentMax className="py-10 md:rounded-[60px] md:py-[min(100px,calc(100*100vw/1920))]">
        <div className="flex w-full flex-col items-start justify-start gap-2.5 md:mx-auto md:grid md:max-w-[1220px] md:grid-cols-2 md:gap-5">
          {qualityItems.map(({ title, desc, image, bg }) => (
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
            {t("pages.brand.certifications.sectionCertsTitle")}
          </h2>
          <p
            className={cn(
              nanum,
              "text-[14px] font-bold leading-[16.8px] text-[#1F2121] md:text-base md:font-normal md:leading-[19.2px] md:text-[#003F2B]",
            )}
          >
            {t("pages.brand.certifications.sectionCertsSubtitle")}
          </p>
        </div>

        {/* 탭 — 모바일 기존 / PC: Pretendard 16/24 · 비활성 배경 없음 */}
        <div className="mb-8 flex gap-2.5 md:mb-10">
          {tabDefs.map(({ key, label }) => (
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

        {/* 수상내역 — 왼쪽 제목 리스트 + 오른쪽 이미지 · 이미지 클릭 시 모달 */}
        {activeTab === "award" && (
          <div className="px-0">
            <AwardsListPanel
              awards={awards as AwardListEntry[]}
              onPreview={openCertPreview}
              listAriaLabel={t("pages.brand.certifications.awardsListAria")}
              emptyLabel={t("pages.brand.certifications.awardsEmpty")}
              noImageLabel={t("pages.brand.certifications.awardNoImage")}
            />
          </div>
        )}

        {/* 인증서 — 모바일: 가로 스냅 슬라이드(다음 카드 일부 노출) / PC: 그리드 */}
        {activeTab === "cert" && (
          <>
            <div className="-mx-4 md:hidden">
              <div
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-pl-4 scroll-pr-4 px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                aria-label={t("pages.brand.certifications.certListAria")}
              >
                {certs.map((item) => (
                  <CertTabCard
                    key={item.id}
                    item={item}
                    variant="slide"
                    onPreview={openCertPreview}
                  />
                ))}
              </div>
            </div>

            <div className="hidden grid-cols-2 gap-4 md:grid md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {certs.map((item) => (
                <CertTabCard
                  key={item.id}
                  item={item}
                  variant="grid"
                  onPreview={openCertPreview}
                />
              ))}
            </div>
          </>
        )}
      </PageContentMax>

      {/*
        modal={false}: Radix 스크롤 잠금(RemoveScroll) 미사용 → 본문 스크롤 위치 유지.
        딤은 수동 레이어로 처리.
      */}
      <Dialog
        modal={false}
        open={imagePreview !== null}
        onOpenChange={(open) => {
          if (!open) setImagePreview(null);
        }}
      >
        <DialogContent
          hideClose
          className={cn(
            "!fixed !inset-0 z-50 !flex !h-[100dvh] !max-h-[100dvh] !w-full !max-w-none !translate-x-0 !translate-y-0",
            "flex-col items-center justify-center gap-0 overflow-y-auto border-0 bg-transparent p-4 shadow-none",
          )}
        >
          <button
            type="button"
            className="absolute inset-0 z-0 bg-black/50"
            aria-label={t("home.promoPopup.close")}
            onClick={() => setImagePreview(null)}
          />
          <div
            className={cn(
              "relative z-10 flex max-h-[min(92vh,900px)] w-[min(100%,1200px)] max-w-[calc(100vw-2rem)]",
              "shrink-0 flex-col gap-3 overflow-y-auto rounded-lg border border-gray-200 bg-background p-4 shadow-lg sm:p-6",
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <DialogHeader className="min-w-0 flex-1 space-y-1 text-left">
                <DialogTitle className="font-[family-name:var(--font-nanum)] text-base font-extrabold text-[#003F2B] sm:pr-2">
                  {imagePreview?.title}
                </DialogTitle>
              </DialogHeader>
              <DialogClose
                className={cn(
                  "ring-offset-background focus:ring-ring shrink-0 rounded-xs opacity-70 transition-opacity",
                  "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
                  "self-end sm:mt-0.5 [&_svg]:size-4",
                )}
              >
                <XIcon />
                <span className="sr-only">{t("home.promoPopup.close")}</span>
              </DialogClose>
            </div>
            {imagePreview?.src ? (
              <div className="flex justify-center rounded-2xl bg-[#FDFDF5] p-2">
                <img
                  src={imagePreview.src}
                  alt={imagePreview.title}
                  className="max-h-[min(78vh,800px)] w-full object-contain"
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
