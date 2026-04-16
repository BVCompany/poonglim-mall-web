import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type RevealOptions = {
  /** 스크롤 트리거 최소값(px). 히어로가 뷰포트 상단에 가깝게 붙어 있을 때 보정 */
  minTriggerPx?: number;
  /** `sectionOffsetTop - innerHeight * ratio` 로 트리거 (메인 BrandPhilosophy 기본 0.5) */
  triggerViewportRatio?: number;
};

/**
 * 메인 "Enrich Your Day…" (BrandPhilosophy)와 동일한 스크롤 기반 등장 인터랙션.
 * `app.css`의 `@keyframes slide-up-fade`, `slide-from-right-fade` 사용.
 */
export function useBrandPhilosophyReveal(options?: RevealOptions) {
  const minTriggerPx = options?.minTriggerPx ?? 100;
  const triggerViewportRatio = options?.triggerViewportRatio ?? 0.5;

  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      setVisible(true);
      window.removeEventListener("scroll", onScroll);
    };

    const sectionOffsetTop = el.offsetTop;
    const triggerAt = Math.max(
      sectionOffsetTop - window.innerHeight * triggerViewportRatio,
      minTriggerPx,
    );

    const onScroll = () => {
      if (window.scrollY >= triggerAt) trigger();
    };

    if (window.scrollY >= triggerAt) {
      trigger();
      return;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [minTriggerPx, triggerViewportRatio]);

  const slideStyle = (delay: number): CSSProperties =>
    visible
      ? {
          animation: `slide-up-fade 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        }
      : { opacity: 0 };

  const badgeStyle = (delay: number): CSSProperties =>
    visible
      ? {
          animation: `slide-from-right-fade 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        }
      : { opacity: 0 };

  const sparkleStyle = (
    delay: number,
    base: CSSProperties,
  ): CSSProperties => ({
    ...base,
    ...(visible
      ? {
          animation: `slide-up-fade 1s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
        }
      : { opacity: 0 }),
  });

  return {
    sectionRef,
    visible,
    slideStyle,
    badgeStyle,
    sparkleStyle,
  };
}
