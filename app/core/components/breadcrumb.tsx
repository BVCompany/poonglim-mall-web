/**
 * Breadcrumb — 전 페이지 공통 브레드크럼 컴포넌트
 *
 * 단독 사용 (standalone=true, 기본값):
 *   전폭 배경: 헤더와 동일 `var(--site-chrome-header-bg, #F4F2E5)`
 *   PageContentMax와 동일 레이아웃(바깥 gutter + 안쪽 max-width 1600), 하단 구분선, md+만 표시
 *
 * 배너 안 사용 (standalone=false):
 *   absolute 배치, 하단 구분선 없음, 흰색 텍스트
 *   variant="pageBanner": PC 히어로 시안 — 14px/21px, NanumSquareRound, 현재 항목 700
 *
 * variant="productDetail": 제품 상세 PC 시안 — Home, 16px, 하단 #EAE3C9, > 구분
 */
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { PageContentMax } from "~/core/components/page-content-max";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** false일 경우 배너 내부용 스타일 (흰색 텍스트, 구분선 없음) */
  standalone?: boolean;
  /** 제품 상세 등 Figma PC 시안 / pageBanner는 PageBanner(PC 히어로) 전용 */
  variant?: "default" | "productDetail" | "pageBanner";
}

export function Breadcrumb({ items, standalone = true, variant = "default" }: BreadcrumbProps) {
  if (standalone) {
    if (variant === "productDetail") {
      return (
        <div className="hidden w-full bg-[var(--site-chrome-header-bg,#F4F2E5)] md:block">
          <PageContentMax>
            <div className="border-b border-[#EAE3C9] px-2.5 py-2.5">
              <nav
                className="flex flex-wrap items-center gap-2.5 text-base leading-6 text-[#1F2121]"
                style={{ fontFamily: "NanumSquareRound, sans-serif" }}
              >
                <Link to="/" className="font-normal transition-colors hover:text-[#02633E]">
                  Home
                </Link>
                {items.map((item, i) => (
                  <span key={i} className="flex items-center gap-2.5">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#1F2121]/35" aria-hidden strokeWidth={2} />
                    {item.href ? (
                      <Link
                        to={item.href}
                        className="font-normal transition-colors hover:text-[#02633E]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-bold">{item.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            </div>
          </PageContentMax>
        </div>
      );
    }

    return (
      <div className="hidden w-full bg-[var(--site-chrome-header-bg,#F4F2E5)] md:block">
        <PageContentMax>
          <nav className="flex items-center gap-2 py-4 text-xs text-gray-400">
            <Link to="/" className="transition-colors hover:text-[#02633E]">
              HOME
            </Link>
            {items.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="opacity-50">/</span>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="transition-colors hover:text-[#02633E]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-gray-700">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
          <div className="border-t border-gray-200" />
        </PageContentMax>
      </div>
    );
  }

  /* 배너 내부용 — PageBanner PC 시안: 14px / 21px / gap 10px (모바일은 동일 토큰으로 읽기 쉽게 유지) */
  if (variant === "pageBanner") {
    return (
      <nav
        className="flex flex-wrap items-center gap-2.5 text-sm leading-[21px] text-white"
        style={{ fontFamily: "NanumSquareRound, sans-serif" }}
      >
        <Link to="/" className="font-normal transition-colors hover:text-white/90">
          Home
        </Link>
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2.5">
            <ChevronRight className="h-2 w-2 shrink-0 text-white" aria-hidden strokeWidth={2.5} />
            {item.href ? (
              <Link to={item.href} className="font-normal transition-colors hover:text-white/90">
                {item.label}
              </Link>
            ) : (
              <span className="font-bold">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    );
  }

  /* 배너 내부용(기본) — 구분선 없음, 흰색 반투명 텍스트 */
  return (
    <nav className="flex items-center gap-1.5 text-xs text-white/70 md:text-sm">
      <Link to="/" className="transition-colors hover:text-white">
        HOME
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="opacity-50">/</span>
          {item.href ? (
            <Link to={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
