/**
 * PC(md+) 레이아웃: 1920 시안 픽셀을 뷰포트에 맞춰 동일 비율로 스케일.
 * 모바일 전용 블록에는 사용하지 말 것.
 */
export function pc1920(minPx: number, designPx: number): string {
  return `clamp(${minPx}px, calc(${designPx} * 100vw / 1920), ${designPx}px)`;
}

/** 상한 시안 px, 뷰포트에 비례해 줄어듦 (박스 width/height 등) */
export function pcMin(designPx: number): string {
  return `min(${designPx}px, calc(${designPx} * 100vw / 1920))`;
}
