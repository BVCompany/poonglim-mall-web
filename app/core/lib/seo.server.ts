/** SNS·메신저 공유용 기본 OG 이미지 (1200×630) */
export const DEFAULT_OG_IMAGE_PATH = "/og/share.png";

/** 가로형 로고 등 OG 비율(≈1.91:1)에 맞지 않아 잘리기 쉬운 이미지 */
const UNSUITABLE_OG_IMAGE_PATTERNS = [
  /poonglim-logo-eng/i,
  /poonglim-food-footer-logo/i,
  /favicon\.png/i,
];

export function resolveAbsoluteUrl(url: string, request: Request): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const origin = new URL(request.url).origin;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function resolveSiteOrigin(siteUrl: string | undefined, request: Request): string {
  const trimmed = siteUrl?.trim();
  if (trimmed) return trimmed.replace(/\/$/, "");
  return new URL(request.url).origin;
}

export function resolveOgImageUrl(
  ogImage: string | undefined,
  siteUrl: string | undefined,
  request: Request,
): string {
  const origin = resolveSiteOrigin(siteUrl, request);
  const defaultUrl = `${origin}${DEFAULT_OG_IMAGE_PATH}`;
  const configured = ogImage?.trim() ?? "";
  if (!configured) return defaultUrl;

  const absolute = resolveAbsoluteUrl(configured, request);
  if (UNSUITABLE_OG_IMAGE_PATTERNS.some((pattern) => pattern.test(absolute))) {
    return defaultUrl;
  }
  return absolute;
}
