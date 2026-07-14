/**
 * PageBanner — 각 페이지 상단 공통 배너 컴포넌트
 *
 * 레이아웃:
 *   - 외부: px-4 pt-2 md:px-10 md:pt-4 (PC 가로 40px 시안; 배경색은 페이지별)
 *   - 카드: md+ 1840×380 비율(PC 시안), 라운드 40px, 상단 그라데이션 오버레이만(PC)
 *   - `mobileHeightClassName`은 md 미만 높이만 지정 (예: max-md:h-[375px])
 *   - `mobileAspectRatio`가 있으면 md 미만은 높이 대신 비율로 박스 크기 결정 (예: Figma 375에서 343×343 → "343 / 343")
 * 브레드크럼 좌표는 `app.css`의 `.page-banner-breadcrumb-x`로 로고와 정렬.
 */
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { pickLocalizedText } from "~/core/lib/localized-text";
import { cn } from "~/core/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageBannerProps {
  imageUrl: string;
  /** 지정 시 md 미만에서만 이 이미지를 배경으로 사용 (PC·태블릿은 `imageUrl` / DB 이미지 유지) */
  mobileImageUrl?: string;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  /** 비우면 DB → 이 prop → i18n 기본값(자세히 보기) 순으로 적용 */
  linkText?: string;
  breadcrumb?: BreadcrumbItem[];
  dbBanner?: {
    title: string;
    subtitle?: string | null;
    title_en?: string | null;
    subtitle_en?: string | null;
    image_url?: string | null;
    link_url?: string | null;
    link_text?: string | null;
    link_text_en?: string | null;
  } | null;
  mobileHeightClassName?: string;
  /**
   * md 미만 배너의 `aspect-ratio` (가로는 부모 `w-full` 기준).
   * 예: 375 시안 343×343 → `"343 / 343"`. 비율만 바꾸려면 `"4 / 3"` 등.
   * 지정 시 `mobileHeightClassName`의 모바일 높이보다 우선합니다.
   */
  mobileAspectRatio?: string;
  /** true면 md 미만에서 배너 블록 전체를 숨김 (PC만 표시) */
  hideOnMobile?: boolean;
  hideBreadcrumbOnMobile?: boolean;
  frostedLinkOnMobile?: boolean;
  mobileSubtitle?: string;
}

export function PageBanner({
  imageUrl,
  mobileImageUrl,
  title,
  subtitle,
  linkUrl,
  linkText: linkTextProp,
  breadcrumb = [],
  dbBanner,
  mobileHeightClassName = "max-md:h-[clamp(200px,28vw,380px)]",
  mobileAspectRatio,
  hideOnMobile = true,
  hideBreadcrumbOnMobile = false,
  frostedLinkOnMobile = false,
  mobileSubtitle,
}: PageBannerProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const resolvedImage = dbBanner?.image_url ?? imageUrl;
  const splitMobileBg = Boolean(mobileImageUrl);
  const mobileBoxByAspect = Boolean(mobileAspectRatio?.trim());
  const resolvedTitle = dbBanner
    ? pickLocalizedText(dbBanner.title, dbBanner.title_en, isEn)
    : title;
  const resolvedSubtitle = dbBanner
    ? pickLocalizedText(dbBanner.subtitle, dbBanner.subtitle_en, isEn) || subtitle
    : subtitle;
  const resolvedLinkUrl = dbBanner?.link_url ?? linkUrl;
  const resolvedLinkText = dbBanner
    ? pickLocalizedText(dbBanner.link_text, dbBanner.link_text_en, isEn) ||
      linkTextProp ||
      t("home.featuredProducts.learnMore")
    : linkTextProp ?? t("home.featuredProducts.learnMore");

  return (
    <div className={`px-4 pt-2 md:px-10 md:pt-4 ${hideOnMobile ? "hidden md:block" : ""}`}>
      <div className="mx-auto w-full md:max-w-[var(--hero-pc-width,1640px)]">
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-3xl bg-gray-700 md:aspect-[1840/380] md:h-auto md:min-h-[200px] md:rounded-[40px]",
            mobileBoxByAspect
              ? "max-md:h-auto max-md:min-h-0 max-md:[aspect-ratio:var(--page-banner-mobile-ar)]"
              : mobileHeightClassName,
          )}
          style={
            {
              ...(mobileBoxByAspect && mobileAspectRatio
                ? { ["--page-banner-mobile-ar" as string]: mobileAspectRatio.trim() }
                : {}),
              ...(splitMobileBg
                ? {}
                : {
                    backgroundImage: `url(${resolvedImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }),
            }
          }
        >
          {splitMobileBg && mobileImageUrl ? (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center md:hidden"
                style={{ backgroundImage: `url(${mobileImageUrl})` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 hidden bg-cover bg-center md:block"
                style={{
                  backgroundImage: `url(${resolvedImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </>
          ) : null}
          {/* 모바일: 전면 딤 / PC 시안: 상단~35%만 그라데이션 (배경 노란 프레임 등은 미적용) */}
          <div
            className="pointer-events-none absolute inset-0 max-md:bg-black/45 md:[background:linear-gradient(180deg,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0)_35%)]"
            aria-hidden
          />

          {/* 브레드크럼 — 배너 폭 유지, 위치만 헤더 로고와 맞춤 (.page-banner-breadcrumb-x) */}
          {breadcrumb.length > 0 && (
            <div
              className={`page-banner-breadcrumb-x absolute top-4 z-10 md:top-5 ${hideBreadcrumbOnMobile ? "max-md:hidden md:flex" : "flex"}`}
            >
              <Breadcrumb
                items={breadcrumb.filter((_, i) => i > 0).map((item) => ({
                  label: item.label,
                  href: item.href,
                }))}
                standalone={false}
                variant="pageBanner"
              />
            </div>
          )}

          {/* 중앙 콘텐츠 — PC: 타이틀 60/84·800, 서브 16/19.2, 본문 열 max 487px 시안 */}
          <div
            className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center gap-2 px-6 text-center md:gap-2.5"
            style={{ minHeight: "inherit" }}
          >
            <h1
              className="max-w-full break-words font-extrabold text-[clamp(30px,4vw,60px)] leading-[1.15] tracking-[-0.04em] text-white md:max-w-[487px] md:text-[60px] md:leading-[84px] md:tracking-normal"
              style={{ fontFamily: "NanumSquareRound, sans-serif" }}
            >
              {resolvedTitle}
            </h1>

            {resolvedSubtitle && (
              <p
                className="mt-1 max-w-xl break-words leading-relaxed text-white/80 max-md:tracking-[-0.02em] md:mt-0 md:max-w-[487px] md:text-base md:leading-[19.2px] md:text-white"
                style={{ fontSize: "16px", fontFamily: "NanumSquareRound, sans-serif" }}
              >
                {mobileSubtitle ? (
                  <>
                    <span className="whitespace-pre-line md:hidden">{mobileSubtitle}</span>
                    <span className="hidden md:inline">{resolvedSubtitle}</span>
                  </>
                ) : (
                  resolvedSubtitle
                )}
              </p>
            )}

            {resolvedLinkUrl && (
              <Link
                to={resolvedLinkUrl}
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-5 py-1.5 text-xs font-medium transition-colors md:text-sm ${resolvedSubtitle ? "md:mt-[30px]" : ""} ${
                  frostedLinkOnMobile
                    ? "border-transparent bg-white/60 text-[13px] font-extrabold tracking-[-0.04em] text-[#003F2B] hover:bg-white/70 md:border-white/60 md:bg-transparent md:text-sm md:font-medium md:tracking-normal md:text-white md:hover:bg-white/20"
                    : "border border-white/60 text-white hover:bg-white/20"
                }`}
              >
                {resolvedLinkText}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
