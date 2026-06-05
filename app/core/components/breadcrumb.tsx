/**
 * Breadcrumb — 전 페이지 공통 브레드크럼
 *
 * - **크림 배경(단독, PC)**: 계란이야기와 동일 시안 — `Home` + Chevron + 항목, NanumSquareRound 16/24,
 *   하단 `#EAE3C9` 1px
 * - **PageBanner 내부** (`standalone={false}`): 이미지 위 오버레이만 — 하단 border 없음, 화이트 톤 + 얕은 그림자
 */
import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { PageContentMax } from "~/core/components/page-content-max";
import { cn } from "~/core/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** false = PageBanner 등 오버레이용 (구분선·크림 띠 없음) */
  standalone?: boolean;
  /**
   * - default | productDetail: 동일 레이아웃(계란이야기 PC 시안). productDetail은 하위 호환 별칭.
   * - pageBanner: PageBanner 이미지 위 — 색만 반전
   */
  variant?: "default" | "productDetail" | "pageBanner";
}

/** PC 단독 띠 — 계란이야기(productDetail)와 동일 */
function DesktopCreamBreadcrumbBar({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="hidden w-full bg-[var(--site-chrome-header-bg,#FDFDF5)] md:block">
      <PageContentMax>
        <div className="border-b border-[#EAE3C9] px-2.5 py-2.5">
          <BreadcrumbNavRow theme="cream" items={items} />
        </div>
      </PageContentMax>
    </div>
  );
}

function BreadcrumbNavRow({
  theme,
  items,
}: {
  theme: "cream" | "banner";
  items: BreadcrumbItem[];
}) {
  const isCream = theme === "cream";
  const navClass = cn(
    "flex flex-wrap items-center gap-2.5 text-xl leading-7",
    isCream ? "text-[#1F2121]" : "text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]",
  );
  const linkClass = isCream
    ? "font-normal transition-colors hover:text-[#02633E]"
    : "font-normal text-white/90 transition-colors hover:text-white";
  const chevronClass = isCream
    ? "h-3.5 w-3.5 shrink-0 text-[#1F2121]/35"
    : "h-3.5 w-3.5 shrink-0 text-white/55";
  const currentClass = isCream ? "font-bold" : "font-bold text-white";

  return (
    <nav className={navClass} style={{ fontFamily: "NanumSquareRound, sans-serif" }}>
      <Link to="/" className={linkClass}>
        Home
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2.5">
            <ChevronRight className={chevronClass} aria-hidden strokeWidth={2} />
            {item.href ? (
              <Link to={item.href} className={linkClass}>
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? currentClass
                    : isCream
                      ? "font-medium text-[#1F2121]"
                      : "font-normal text-white/90"
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Breadcrumb({
  items,
  standalone = true,
  variant = "default",
}: BreadcrumbProps) {
  if (standalone) {
    if (variant === "pageBanner") {
      /* 단독으로 pageBanner 쓰는 경우는 거의 없으나 타입 대비 */
      return (
        <div className="hidden md:block">
          <BreadcrumbNavRow theme="banner" items={items} />
        </div>
      );
    }

    /* default · productDetail 통일 */
    return <DesktopCreamBreadcrumbBar items={items} />;
  }

  /* PageBanner 내부 — 이미지 위 오버레이 (하단 border 없음) */
  return <BreadcrumbNavRow theme="banner" items={items} />;
}
