/**
 * PageBanner — 각 페이지 상단 공통 배너 컴포넌트
 *
 * 히어로 섹션과 동일한 여백/max-width/라운드 처리:
 *   - 외부 padding: px-4 pt-2 md:px-8 md:pt-4 lg:px-2.5
 *   - 최대 너비:    mx-auto md:max-w-[var(--hero-pc-width,1640px)]
 *   - 라운드:       rounded-3xl md:rounded-[2rem]
 */
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

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
}

export function PageBanner({
  imageUrl,
  title,
  subtitle,
  linkUrl,
  linkText = "자세히 보기",
  breadcrumb = [],
  dbBanner,
}: PageBannerProps) {
  const resolvedImage    = dbBanner?.image_url  ?? imageUrl;
  const resolvedTitle    = dbBanner?.title       ?? title;
  const resolvedSubtitle = dbBanner?.subtitle    ?? subtitle;
  const resolvedLinkUrl  = dbBanner?.link_url    ?? linkUrl;
  const resolvedLinkText = dbBanner?.link_text   ?? linkText;

  return (
    /* 히어로 배너와 동일한 외부 여백 */
    <div className="px-4 pt-2 md:px-8 md:pt-4 lg:px-2.5">
      {/* 히어로 배너와 동일한 최대 너비 */}
      <div className="mx-auto w-full md:max-w-[var(--hero-pc-width,1640px)]">
        {/* 배너 카드 — 히어로와 동일한 라운드 */}
        <div
          className="relative w-full overflow-hidden rounded-3xl md:rounded-[2rem] bg-gray-700"
          style={{
            backgroundImage: `url(${resolvedImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "180px",
            height: "clamp(180px, 18vw, 260px)",
          }}
        >
          {/* 어두운 오버레이 */}
          <div className="absolute inset-0 bg-black/45" />

          {/* 브레드크럼 — 좌상단 */}
          {breadcrumb.length > 0 && (
            <nav className="absolute top-4 left-5 z-10 flex items-center gap-1 text-white/70 text-xs md:text-sm">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="opacity-60">&gt;</span>}
                  {item.href ? (
                    <Link to={item.href} className="hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-white">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* 중앙 콘텐츠 */}
          <div
            className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-6 text-center"
            style={{ minHeight: "inherit" }}
          >
            <h1
              className="text-2xl font-bold text-white md:text-4xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              {resolvedTitle}
            </h1>

            {resolvedSubtitle && (
              <p className="mt-0.5 max-w-lg text-xs leading-relaxed text-white/80 md:text-sm">
                {resolvedSubtitle}
              </p>
            )}

            {resolvedLinkUrl && (
              <Link
                to={resolvedLinkUrl}
                className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/60 px-5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 md:text-sm"
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
