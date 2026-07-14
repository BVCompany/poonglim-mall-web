/**
 * 악성 봇 차단 유틸 (코드 레벨 1차 방어선)
 *
 * 요청 빈도 제한(rate limit)은 Vercel WAF(Firewall)에서 처리한다.
 * 인메모리 rate limit은 서버리스에서 부정확하고 NAT 공유 IP 환경의
 * 정상 사용자를 오차단하므로 코드에서는 봇 UA 차단만 담당한다.
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
