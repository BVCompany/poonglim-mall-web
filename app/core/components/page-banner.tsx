/**
 * PageBanner — 각 페이지 상단 공통 배너 컴포넌트
 *
 * 히어로와 동일한 카드 폭·라운드:
 *   - 외부: px-4 pt-2 md:px-8 md:pt-4 lg:px-2.5 (히어로와 동일)
 *   - 최대 너비: md:max-w-[var(--hero-pc-width)]
 * 브레드크럼 좌표는 `app.css`의 `.page-banner-breadcrumb-x`로 로고와 정렬.
 */
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageBannerProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  linkUrl?: string;
  linkText?: string;
  breadcrumb?: BreadcrumbItem[];
  dbBanner?: {
    title: string;
    subtitle?: string | null;
    image_url?: string | null;
    link_url?: string | null;
    link_text?: string | null;
  } | null;
  mobileHeightClassName?: string;
  /** true면 md 미만에서 배너 블록 전체를 숨김 (PC만 표시) */
  hideOnMobile?: boolean;
  hideBreadcrumbOnMobile?: boolean;
  frostedLinkOnMobile?: boolean;
  mobileSubtitle?: string;
}

export function PageBanner({
  imageUrl,
  title,
  subtitle,
  linkUrl,
  linkText = "자세히 보기",
  breadcrumb = [],
  dbBanner,
  mobileHeightClassName = "h-[clamp(200px,28vw,380px)]",
  hideOnMobile = true,
  hideBreadcrumbOnMobile = false,
  frostedLinkOnMobile = false,
  mobileSubtitle,
}: PageBannerProps) {
  const resolvedImage = dbBanner?.image_url ?? imageUrl;
  const resolvedTitle = dbBanner?.title ?? title;
  const resolvedSubtitle = dbBanner?.subtitle ?? subtitle;
  const resolvedLinkUrl = dbBanner?.link_url ?? linkUrl;
  const resolvedLinkText = dbBanner?.link_text ?? linkText;

  return (
    <div className={`px-4 pt-2 md:px-8 md:pt-4 lg:px-2.5 ${hideOnMobile ? "hidden md:block" : ""}`}>
      <div className="mx-auto w-full md:max-w-[var(--hero-pc-width,1640px)]">
        <div
          className={`relative w-full overflow-hidden rounded-3xl bg-gray-700 md:rounded-[2rem] ${mobileHeightClassName}`}
          style={{
            backgroundImage: `url(${resolvedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/45" />

          {/* 브레드크럼 — 배너 폭 유지, 위치만 헤더 로고와 맞춤 (.page-banner-breadcrumb-x) */}
          {breadcrumb.length > 0 && (
            <div
              className={`page-banner-breadcrumb-x absolute top-4 z-10 md:top-5 ${hideBreadcrumbOnMobile ? "hidden md:flex" : "flex"}`}
            >
              <Breadcrumb
                items={breadcrumb.filter((_, i) => i > 0).map((item) => ({
                  label: item.label,
                  href: item.href,
                }))}
                standalone={false}
              />
            </div>
          )}

          {/* 중앙 콘텐츠 */}
          <div
            className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center"
            style={{ minHeight: "inherit" }}
          >
            <h1
              className="font-extrabold text-white"
              style={{
                fontSize: "clamp(30px, 4vw, 60px)",
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
              }}
            >
              {resolvedTitle}
            </h1>

            {resolvedSubtitle && (
              <p
                className="mt-1 max-w-xl leading-relaxed text-white/80"
                style={{ fontSize: "16px", letterSpacing: "-0.02em" }}
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
                className={`mt-2 inline-flex items-center gap-1 rounded-full px-5 py-1.5 text-xs font-medium transition-colors md:text-sm ${
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
