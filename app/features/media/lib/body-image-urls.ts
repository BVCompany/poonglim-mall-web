/** `news.body_image_urls` JSON 배열 파싱·직렬화 */

export function parseNewsBodyImageUrls(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  } catch {
    return [];
  }
}

export function serializeNewsBodyImageUrls(urls: string[]): string | null {
  const cleaned = urls.map((u) => u.trim()).filter(Boolean);
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}
