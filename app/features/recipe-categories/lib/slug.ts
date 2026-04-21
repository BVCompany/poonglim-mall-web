/** 레시피 카테고리 slug 생성 (관리자 화면과 동일 규칙) */
export function toRecipeCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_가-힣]/g, "");
}
