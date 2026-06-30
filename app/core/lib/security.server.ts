/**
 * 악성/과도 트래픽 방어 유틸 (코드 레벨 1차 방어선)
 *
 * 주의: 서버리스 환경에서는 인메모리 rate limit가 인스턴스별로 분산되어
 * 완벽하지 않다. 정밀한 차단은 Vercel WAF(Firewall) 규칙으로 처리하고,
 * 여기서는 명백한 악성 봇 차단과 단일 인스턴스 폭주 완화만 담당한다.
 */

/**
 * robots.txt를 무시하고 콘텐츠를 긁어가는 대표적 봇/스크래퍼 UA.
 * 정상 검색엔진(Googlebot, Bingbot 등)은 의도적으로 제외한다.
 */
const BLOCKED_BOT_UA = [
  // AI 학습/수집 크롤러
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "CCBot",
  "Google-Extended",
  "PerplexityBot",
  "Applebot-Extended",
  "Bytespider",
  "Amazonbot",
  "Diffbot",
  "ImagesiftBot",
  "Omgili",
  "FriendlyCrawler",
  "cohere-ai",
  // 공격적 SEO/마케팅 크롤러
  "AhrefsBot",
  "SemrushBot",
  "DotBot",
  "MJ12bot",
  "BLEXBot",
  "DataForSeoBot",
  "PetalBot",
  "MegaIndex",
  "ZoominfoBot",
  "serpstatbot",
  // 스크래핑/HTTP 라이브러리 기본 UA
  "python-requests",
  "Scrapy",
  "Go-http-client",
  "node-fetch",
  "axios/",
  "libwww-perl",
  "curl/",
  "Wget/",
  "HeadlessChrome",
];

const BLOCKED_BOT_REGEX = new RegExp(
  BLOCKED_BOT_UA.map((ua) => ua.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i",
);

/**
 * 차단 대상 악성/스크래퍼 봇인지 판별.
 * UA가 없는 요청(빌드 시 정적 프리렌더 등 내부 요청)은 차단하지 않는다.
 */
export function isBlockedBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BLOCKED_BOT_REGEX.test(userAgent);
}

/** 요청에서 클라이언트 IP 추출 (Vercel: x-forwarded-for 첫 항목) */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

/**
 * 인메모리 슬라이딩(고정 윈도우) rate limiter.
 * 동일 인스턴스가 웜 상태인 동안만 유효하며, 단일 클라이언트의
 * 비정상 폭주(무한 새로고침/루프성 요청)를 완화하는 보조 수단이다.
 */
const RATE_LIMIT_WINDOW_MS = 10_000; // 10초 윈도우
const RATE_LIMIT_MAX = 100; // 윈도우당 최대 요청 수
const RATE_BUCKET_MAX_ENTRIES = 10_000; // 메모리 보호용 상한

type RateEntry = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateEntry>();

export function checkRateLimit(ip: string): {
  limited: boolean;
  retryAfterSec: number;
} {
  // IP를 식별할 수 없는 요청(빌드 시 프리렌더 등)은 제한하지 않는다.
  if (!ip || ip === "unknown") return { limited: false, retryAfterSec: 0 };

  const now = Date.now();
  const entry = rateBuckets.get(ip);

  if (!entry || entry.resetAt <= now) {
    // 메모리 누수 방지: 버킷이 너무 커지면 만료 항목 정리
    if (rateBuckets.size > RATE_BUCKET_MAX_ENTRIES) {
      for (const [key, value] of rateBuckets) {
        if (value.resetAt <= now) rateBuckets.delete(key);
      }
    }
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfterSec: 0 };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { limited: false, retryAfterSec: 0 };
}
