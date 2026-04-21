/** 관리자·공개 목록 공통 — news_categories.color 값 */
export function newsCategoryBadgeClass(color: string): string {
  switch (color) {
    case "sky":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "violet":
      return "border-violet-200 bg-violet-50 text-violet-800";
    case "emerald":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "amber":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "orange":
      return "border-orange-200 bg-orange-50 text-orange-900";
    case "rose":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-gray-200 bg-gray-100 text-gray-800";
  }
}

export const NEWS_CATEGORY_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "sky", label: "파랑" },
  { value: "violet", label: "보라" },
  { value: "emerald", label: "초록" },
  { value: "amber", label: "노랑" },
  { value: "orange", label: "주황" },
  { value: "rose", label: "분홍" },
  { value: "slate", label: "회색" },
];
