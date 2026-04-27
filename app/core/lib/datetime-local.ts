/**
 * HTML `datetime-local` 값 (`yyyy-MM-ddTHH:mm`, 로컬) 헬퍼
 */

const pad2 = (n: number) => String(n).padStart(2, "0");

export function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function splitDatetimeLocal(s: string): { date: string; time: string } | null {
  const t = s.trim();
  if (!t) return null;
  const [datePart, rest = ""] = t.split("T");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  const timePart = rest.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(timePart)) return { date: datePart, time: timePart };
  return { date: datePart, time: "12:00" };
}

export function mergeDatetimeLocal(date: string, time: string): string {
  const hm = /^\d{2}:\d{2}$/.test(time) ? time : "12:00";
  return `${date}T${hm}`;
}

/** 폼/서버: 빈 값이면 현재 시각 */
export function parseDatetimeLocalToDate(s: string): Date {
  const raw = s.trim();
  if (!raw) return new Date();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
