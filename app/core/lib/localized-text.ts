/** 영문 사이트에서 en 값 우선, 없으면 ko 폴백 */
export function pickLocalizedText(
  ko: string | null | undefined,
  en: string | null | undefined,
  isEn: boolean,
): string {
  if (isEn && en?.trim()) return en.trim();
  return ko?.trim() ?? "";
}
