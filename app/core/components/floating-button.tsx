/**
 * Floating Button Component
 *
 * 오른쪽 하단 고정 플로팅 버튼
 * - 메인: 채팅/문의 (그라데이션, 말풍선 아이콘)
 * - 스크롤: 위/아래 (어두운 원형, 구분선으로 분리)
 */
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback } from "react";

export default function FloatingButton() {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const scrollToBottom = useCallback(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const handleChatClick = useCallback(() => {
    if (typeof window !== "undefined" && (window as unknown as { ChannelIO?: { open: () => void } }).ChannelIO) {
      (window as unknown as { ChannelIO: { open: () => void } }).ChannelIO.open();
    } else {
      window.location.href = "/support";
    }
  }, []);

  return (
    <div
      className="fixed bottom-6 right-3 z-40 flex flex-col items-center gap-0 md:bottom-8 md:right-8"
      aria-label="플로팅 메뉴"
    >
      {/* 메인 버튼: 채팅/문의 - 그라데이션 */}
      <button
        type="button"
        onClick={handleChatClick}
        className="flex size-11 shrink-0 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 md:size-12"
        style={{
          background: "linear-gradient(to bottom, #f3bc1e 0%, #72bd5c 100%)",
        }}
        aria-label="채팅/문의하기"
      >
        <img
          src="/home/talk-icon.png"
          alt=""
          className="size-6 object-contain md:size-5"
          aria-hidden
        />
      </button>

      {/* 스크롤 버튼: 위/아래 - 어두운 원형, 구분선 */}
      <div
        className="mt-1 flex flex-col overflow-hidden rounded-full bg-neutral-800 shadow-lg md:mt-1.5"
        role="group"
        aria-label="스크롤"
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="flex size-11 shrink-0 items-center justify-center text-white transition-colors hover:bg-neutral-700 active:bg-neutral-600 md:size-12"
          aria-label="맨 위로"
        >
          <ChevronUp className="size-6 md:size-5" strokeWidth={2.5} />
        </button>
        <div className="h-px w-full bg-white/30" aria-hidden />
        <button
          type="button"
          onClick={scrollToBottom}
          className="flex size-11 shrink-0 items-center justify-center text-white transition-colors hover:bg-neutral-700 active:bg-neutral-600 md:size-12"
          aria-label="맨 아래로"
        >
          <ChevronDown className="size-6 md:size-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
