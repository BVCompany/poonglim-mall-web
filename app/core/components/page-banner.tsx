/**
 * PageBanner — 각 페이지 상단 공통 배너 컴포넌트
 *
 * 특징:
 *  - 양쪽 여백(px-4 md:px-6) + 라운드 처리(rounded-2xl)
 *  - 좌상단 브레드크럼
 *  - 중앙 타이틀 / 부제목 / CTA 버튼
 *  - DB에서 pageBanner를 받아 동적 교체 가능, 없으면 props 기본값 사용
 */
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageBannerProps {
  /** 배경 이미지 URL (로컬 or 외부) */
  imageUrl: string;
  /** 배너 타이틀 */
  title: string;
  /** 배너 부제목 */
  subtitle?: string;
  /** CTA 버튼 링크 */
  linkUrl?: string;
  /** CTA 버튼 텍스트 */
  linkText?: string;
  /** 브레드크럼 아이템 목록 */
  breadcrumb?: BreadcrumbItem[];
  /** DB 페이지 배너로 오버라이드 */
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
  const resolvedImage    = dbBanner?.image_url    ?? imageUrl;
  const resolvedTitle    = dbBanner?.title         ?? title;
  const resolvedSubtitle = dbBanner?.subtitle      ?? subtitle;
  const resolvedLinkUrl  = dbBanner?.link_url      ?? linkUrl;
  const resolvedLinkText = dbBanner?.link_text     ?? linkText;

  return (
    /* 양쪽 여백 wrapper */
    <div className="px-4 pt-4 md:px-6 md:pt-5">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-gray-700"
        style={{
          backgroundImage: `url(${resolvedImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "180px",
          height: "clamp(180px, 18vw, 260px)",
        }}
      >
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/45 rounded-2xl" />

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
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 gap-2"
          style={{ minHeight: "inherit" }}
        >
          <h1
            className="text-2xl md:text-4xl font-bold text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            {resolvedTitle}
          </h1>

          {resolvedSubtitle && (
            <p className="text-white/80 text-xs md:text-sm max-w-lg leading-relaxed mt-0.5">
              {resolvedSubtitle}
            </p>
          )}

          {resolvedLinkUrl && (
            <Link
              to={resolvedLinkUrl}
              className="mt-2 inline-flex items-center gap-1 border border-white/60 hover:bg-white/20 text-white text-xs md:text-sm font-medium px-5 py-1.5 rounded-full transition-colors"
            >
              {resolvedLinkText}
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
