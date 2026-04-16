import { cn } from "~/core/lib/utils";

/** 보도자료·이벤트 등 썸네일 없음 시 — 흰 배경 + 중앙 로고 */
export const MEDIA_THUMB_FALLBACK_LOGO_SRC = "/home/poonglim-logo-eng.png";

export function MediaThumbFallback({
  className,
  logoClassName,
}: {
  className?: string;
  /** 로고 박스 크기 (기본: 영역 대비 비율) */
  logoClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full min-h-0 items-center justify-center bg-white px-3.5 md:px-5 lg:px-6",
        className,
      )}
    >
      <img
        src={MEDIA_THUMB_FALLBACK_LOGO_SRC}
        alt=""
        className={cn(
          "object-contain",
          logoClassName ??
            "max-h-[45%] max-w-full md:max-h-[40%] md:max-w-full",
        )}
      />
    </div>
  );
}
