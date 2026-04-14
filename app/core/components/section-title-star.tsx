/**
 * 섹션 타이틀 마크(별 PNG) + 통합 레이아웃 `SectionPageTitle`.
 *
 * 시안 HTML에 `width/height`만 있는 녹색 사각형 div가 있어도, 실제 디자인 캡처·피그마를 보면
 * 장식은 스파클(별) 이미지인 경우가 많습니다. 이 프로젝트에서는 섹션 타이틀 마크를 **PNG 스파클만** 사용합니다.
 *
 * **에셋별 색·용도 (`SectionTitleStar` variant)**
 *
 * | variant       | 파일                         | 색감              | Typical 배경 / 용도 |
 * |---------------|------------------------------|-------------------|---------------------|
 * | `intro`       | `home/intro-star.png`        | 살구·웜 골드 톤   | 크림 톤 포인트 |
 * | `product`     | `home/product-star.png`      | 브랜드 그린 계열 | 공지·지원·제품 등 일반 섹션 |
 * | `company`     | `home/company-intro-star.png`| 아이보리·소프트   | 딥그린·어두운 카드 위 라벨 |
 * | `onDark`      | `home/star_icon.png`         | 흰색(투명 배경)   | 어두운 배경 타이틀 |
 * | `yellowStar`  | `home/intro-star.png`        | 웜 옐로·골드 스파클 | 딥그린 배경 섹션(공장견학 갤러리 등) |
 * | `introVector` | `intro/Vector.png`           | 회사소개 히어로 별 | FAQ 등 — 녹색 탭과 톤 맞출 때 |
 * | `brandIntro`  | `home/product-star.png`      | 진한 녹색 스파클  | 회사소개(브랜드 스토리) 등 |
 *
 * **SectionPageTitle preset** — 본문·리스트 상단 타이틀 통일용
 * - `default`: 모바일 18/30 extrabold · PC clamp 20px
 * - `large`: PC 대형 섹션(연혁 «풍림푸드의 발자취») 36/54
 * - `responsiveLg`: 모바일 18/30 · lg 36/54 (검색 결과 헤더 등)
 * - `brandIntro`: gap-2 · 마크 16px — 회사소개 내부 라벨(타이틀 크기는 `titleStyle`/`titleClassName`로 조정)
 * - `none`: 마크만 프리셋, 줄 간격은 `className`으로 전부 지정
 *
 * 새 PNG는 `public`에 넣고 `SECTION_TITLE_STAR_SRC`에 키를 추가하거나 `src`로 절대 경로 전달.
 */
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

import { cn } from "~/core/lib/utils";

export const SECTION_TITLE_STAR_SRC = {
  intro: "/home/intro-star.png",
  /** 시안 #F3BC1E 포인트 대체 — 실제 에셋은 동일 스파클 형태의 웜 옐로 PNG */
  yellowStar: "/home/intro-star.png",
  product: "/home/product-star.png",
  company: "/home/company-intro-star.png",
  onDark: "/home/star_icon.png",
  introVector: "/intro/Vector.png",
  brandIntro: "/home/product-star.png",
} as const;

export type SectionTitleStarVariant = keyof typeof SECTION_TITLE_STAR_SRC;

type SectionTitleStarProps = Omit<ComponentPropsWithoutRef<"img">, "src" | "alt"> & {
  variant?: SectionTitleStarVariant;
  /** `public` 기준 절대 경로. 지정 시 `variant`보다 우선 */
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

/* ── SectionPageTitle (마크 + 텍스트 한 묶음) ── */

export const SECTION_PAGE_TITLE_PRESET = {
  default: {
    root: "flex items-center gap-[11px] md:gap-2.5",
    mark: "h-[21px] w-[21px]",
    title:
      "min-w-0 font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121] md:text-[clamp(16px,calc(20*100vw/1920),20px)] md:font-semibold md:leading-[26px] md:tracking-[-0.02em]",
  },
  large: {
    root: "flex w-full items-center gap-5",
    mark: "size-[21px]",
    title:
      "min-w-0 font-[family-name:var(--font-nanum)] text-[36px] font-extrabold leading-[54px] text-[#1F2121]",
  },
  responsiveLg: {
    root: "flex items-center gap-[11px] lg:gap-5",
    mark: "size-[21px] shrink-0",
    title:
      "min-w-0 font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121] tracking-[-0.04em] lg:text-[36px] lg:leading-[54px]",
  },
  brandIntro: {
    root: "flex items-center gap-2",
    mark: "h-4 w-4",
    title:
      "min-w-0 font-[family-name:var(--font-nanum)] font-bold tracking-[-0.04em] text-[#003F2B]",
  },
  none: {
    root: "",
    mark: "h-[21px] w-[21px]",
    title: "",
  },
} as const;

export type SectionPageTitlePreset = keyof typeof SECTION_PAGE_TITLE_PRESET;

type SectionPageTitleProps = {
  as?: "h1" | "h2" | "h3" | "div" | "span" | "p";
  children: ReactNode;
  starVariant?: SectionTitleStarVariant;
  src?: string;
  preset?: SectionPageTitlePreset;
  className?: string;
  /** 루트 요소(마크+타이틀을 감싼 태그) 인라인 스타일 */
  rootStyle?: CSSProperties;
  titleClassName?: string;
  titleStyle?: CSSProperties;
  /** `SectionTitleStar`에 추가 클래스 (예: `hidden md:block`) */
  markClassName?: string;
  /** false면 `children`을 `<span>`으로 감싸지 않음(복잡한 타이틀 구조용). 타이틀 타이포는 부모에 직접 부여 */
  wrapTitle?: boolean;
};

export function SectionPageTitle({
  as: Comp = "h2",
  children,
  starVariant = "product",
  src,
  preset = "default",
  className,
  rootStyle,
  titleClassName,
  titleStyle,
  markClassName,
  wrapTitle = true,
}: SectionPageTitleProps) {
  const p = SECTION_PAGE_TITLE_PRESET[preset];

  const mark = (
    <SectionTitleStar
      variant={starVariant}
      src={src}
      className={cn(p.mark, markClassName)}
    />
  );

  const body =
    wrapTitle === false ? (
      children
    ) : (
      <span className={cn(p.title, titleClassName)} style={titleStyle}>
        {children}
      </span>
    );

  return (
    <Comp className={cn(p.root, className)} style={rootStyle}>
      {mark}
      {body}
    </Comp>
  );
}
