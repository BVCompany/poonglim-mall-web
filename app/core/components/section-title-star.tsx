/**
 * 섹션 타이틀 옆 스파클(별) — `public/home` 또는 `public/intro` PNG.
 *
 * **에셋별 색·용도 (시안·캡처 맞출 때 이 표를 기준으로 `variant` 선택)**
 *
 * | variant       | 파일                         | 색감              | Typical 배경 / 용도 |
 * |---------------|------------------------------|-------------------|---------------------|
 * | `intro`       | `home/intro-star.png`        | 살구·웜 골드 톤   | 크림 톤 포인트 |
 * | `product`     | `home/product-star.png`      | 브랜드 그린 계열 | 공지·지원·제품 등 일반 섹션 |
 * | `company`     | `home/company-intro-star.png`| 아이보리·소프트   | 딥그린·어두운 카드 위 라벨 |
 * | `onDark`      | `home/star_icon.png`         | 흰색(투명 배경)   | 어두운 배경 타이틀 |
 * | `brandIntro`  | `home/product-star.png`      | 진한 녹색 스파클  | **회사소개(브랜드 스토리)** 등 타이틀 (장식용 `intro/Vector*`와 구분) |
 *
 * 새 시안 PNG를 `public`에 넣은 뒤 `SECTION_TITLE_STAR_SRC`에 키를 추가하거나,
 * `src` prop으로 절대 경로를 넘기면 됩니다 (`src`가 있으면 `variant`보다 우선).
 */
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "~/core/lib/utils";

export const SECTION_TITLE_STAR_SRC = {
  intro: "/home/intro-star.png",
  product: "/home/product-star.png",
  company: "/home/company-intro-star.png",
  onDark: "/home/star_icon.png",
  /** 회사소개 시리즈 섹션 타이틀 — 진한 녹색 계열 */
  brandIntro: "/home/product-star.png",
} as const;

export type SectionTitleStarVariant = keyof typeof SECTION_TITLE_STAR_SRC;

type SectionTitleStarProps = Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "alt"
> & {
  variant?: SectionTitleStarVariant;
  /** `public` 기준 절대 경로. 지정 시 `variant`보다 우선 (시안 전용 에셋) */
  src?: string;
};

export function SectionTitleStar({
  variant = "product",
  src: srcOverride,
  className,
  ...props
}: SectionTitleStarProps) {
  const src = srcOverride ?? SECTION_TITLE_STAR_SRC[variant];

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn("shrink-0 object-contain select-none", className)}
      {...props}
    />
  );
}
