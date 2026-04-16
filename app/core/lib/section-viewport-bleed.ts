/**
 * `navigation.layout`의 `max-w-[1920px]` 본문 안에서도 가로로 뷰포트 전체를 채울 때 사용합니다.
 * 배경색·컬러 대역이 브라우저 축소·초와이드에서도 화면 끝까지 이어지게 합니다.
 *
 * 사용: 루트 또는 `<section>`에 `className={cn(SECTION_VIEWPORT_BLEED, "bg-…", "min-w-0")}` 후
 * 내부는 기존처럼 `mx-auto max-w-[var(--content-max-width)]` + 패딩.
 */
export const SECTION_VIEWPORT_BLEED =
  "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2" as const;
