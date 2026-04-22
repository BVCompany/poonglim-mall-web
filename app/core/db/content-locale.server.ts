/**
 * DB에 저장되는 콘텐츠(뉴스·공지 등) 다국어 행 선택용 헬퍼.
 * - 동일 translation_group_id 에 locale 별로 최대 1행
 * - 요청 locale 우선, 없으면 ko 폴백
 */
export type ContentLocale = "ko" | "en";

export function normalizeContentLocale(raw: string | undefined | null): ContentLocale {
  if (!raw) return "ko";
  const l = raw.toLowerCase();
  if (l === "en" || l.startsWith("en-")) return "en";
  return "ko";
}

type RowWithLocaleGroup = {
  translation_group_id: string;
  locale: string;
  created_at: Date;
};

function localeRank(loc: string, preferred: ContentLocale): number {
  if (loc === preferred) return 0;
  if (loc === "ko") return 1;
  return 2;
}

/** 활성/필터된 전체 행에서 그룹당 한 행만 고름 (locale 우선순위). */
export function pickBestLocaleRows<T extends RowWithLocaleGroup>(
  rows: T[],
  preferred: ContentLocale,
): T[] {
  const byGroup = new Map<string, T[]>();
  for (const r of rows) {
    const gid = r.translation_group_id;
    const arr = byGroup.get(gid) ?? [];
    arr.push(r);
    byGroup.set(gid, arr);
  }
  const out: T[] = [];
  for (const [, arr] of byGroup) {
    const sorted = [...arr].sort(
      (a, b) =>
        localeRank(a.locale, preferred) - localeRank(b.locale, preferred) ||
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const best = sorted[0];
    if (best) out.push(best);
  }
  return out;
}
