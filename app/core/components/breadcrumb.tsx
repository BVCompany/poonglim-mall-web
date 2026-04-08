/**
 * Breadcrumb — 전 페이지 공통 브레드크럼 컴포넌트
 *
 * 단독 사용 (standalone=true, 기본값):
 *   PageContentMax와 동일 레이아웃(바깥 gutter + 안쪽 max-width 1600), 하단 구분선, md+만 표시
 *
 * 배너 안 사용 (standalone=false):
 *   absolute 배치, 하단 구분선 없음, 흰색 텍스트
 */
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
}

export function Breadcrumb({ items, standalone = true }: BreadcrumbProps) {
  if (standalone) {
    return (
      <div className="hidden md:block">
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

  /* 배너 내부용 — 구분선 없음, 흰색 반투명 텍스트 */
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
