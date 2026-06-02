/**
 * 관리자 목록 공통 정렬 컨트롤
 *
 * 업로드/게시물 목록에서 최신순(기본)·과거순 정렬을 제공합니다.
 */
import { cn } from "~/core/lib/utils";

export type ListSortOrder = "newest" | "oldest";

/**
 * 표시 날짜(또는 임의 시각) 기준으로 목록을 정렬한다.
 *
 * 번역 그룹(한/영 쌍)처럼 같은 그룹의 행을 분리하지 않기 위해, 그룹을 하나의 단위로
 * 묶어 정렬하고 같은 그룹 안에서는 기존 순서를 유지한다. 이때 그룹 대표 시각은
 * "원본(최초) 작성 시각"을 사용한다. 그렇지 않으면(최신 시각 사용) 오래된 글에 영문
 * 번역을 나중에 추가했을 때 해당 글이 통째로 최신으로 올라오는 문제가 생긴다.
 *
 * 날짜가 동일한 경우(예: 같은 날짜만 저장되는 작성일)에는 `getId`(숫자 PK)를 보조
 * 기준으로 사용해, 최신순이면 더 최근(=원본 id가 큰) 항목이 위로 오도록 한다.
 */
export function sortByCreatedDesc<T>(
  rows: T[],
  order: ListSortOrder,
  getGroupId: (row: T) => string | number,
  getTime: (row: T) => number,
  getId?: (row: T) => number,
): T[] {
  const repTime = new Map<string | number, number>();
  const repId = new Map<string | number, number>();
  for (const row of rows) {
    const group = getGroupId(row);
    const time = Number.isFinite(getTime(row)) ? getTime(row) : 0;
    const prevTime = repTime.get(group);
    // 그룹의 최초 작성 시각(가장 이른 시각)을 대표값으로 사용
    repTime.set(group, prevTime === undefined ? time : Math.min(prevTime, time));
    if (getId) {
      const id = getId(row);
      const prevId = repId.get(group);
      // 그룹 원본 행(가장 작은 id)을 대표 id로 사용
      repId.set(group, prevId === undefined ? id : Math.min(prevId, id));
    }
  }
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const groupA = getGroupId(a.row);
      const groupB = getGroupId(b.row);
      if (groupA === groupB) return a.index - b.index;
      const ta = repTime.get(groupA) ?? 0;
      const tb = repTime.get(groupB) ?? 0;
      if (ta !== tb) return order === "newest" ? tb - ta : ta - tb;
      if (getId) {
        const ia = repId.get(groupA) ?? 0;
        const ib = repId.get(groupB) ?? 0;
        if (ia !== ib) return order === "newest" ? ib - ia : ia - ib;
      }
      return a.index - b.index;
    })
    .map((item) => item.row);
}

/** 날짜 문자열/Date를 안전하게 타임스탬프로 변환 */
export function toTimestamp(value: Date | string | null | undefined): number {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function ListSortSelect({
  value,
  onChange,
  className,
}: {
  value: ListSortOrder;
  onChange: (value: ListSortOrder) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ListSortOrder)}
      aria-label="정렬 순서"
      className={cn(
        "h-10 shrink-0 rounded-md border border-[#02633E]/30 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#02633E]/30",
        className,
      )}
    >
      <option value="newest">최신순</option>
      <option value="oldest">과거순</option>
    </select>
  );
}
