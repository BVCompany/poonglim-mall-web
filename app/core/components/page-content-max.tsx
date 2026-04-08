/**
 * 본문·브레드크럼 등 공통 가로 레이아웃
 *
 * 뷰포트 쪽 여백(gutter)은 바깥, max-width(1600·PC 비율)는 안쪽에만 적용해
 * `max-w + 내부 px`로 인해 1520처럼 줄어드는 현상을 막습니다.
 */
import type { ElementType, ReactNode } from "react";

import { cn } from "~/core/lib/utils";

/** 브레드크럼·본문 섹션과 동일한 수평 gutter */
export const PAGE_GUTTER_X = "px-4 md:px-6 lg:px-10";

type PageContentMaxProps = {
  children: ReactNode;
  /** 바깥 래퍼 태그 (기본 div) */
  as?: ElementType;
  /** 바깥 래퍼 (gutter + 이 클래스) */
  className?: string;
  /** 안쪽 max-width 박스 */
  innerClassName?: string;
};

export function PageContentMax({
  as: Outer = "div",
  children,
  className,
  innerClassName,
}: PageContentMaxProps) {
  return (
    <Outer className={cn(PAGE_GUTTER_X, className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-[var(--content-max-width)]",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Outer>
  );
}
