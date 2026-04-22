import type { TFunction } from "i18next";

/** 목록 필터용 — DB·데모와 동일한 category 문자열과 매칭 */
export const RESOURCES_ALL_TAB = "__resources_all__" as const;

const KO_NAME_TO_I18N_KEY: Record<string, string> = {
  카탈로그: "pages.resources.categories.catalog",
  회사소개: "pages.resources.categories.companyIntro",
  인증서: "pages.resources.categories.certificate",
  기타: "pages.resources.categories.other",
};

/** 알려진 한글 카테고리만 영어 라벨로 치환, 그 외는 원문 유지 */
export function resourceCategoryTabLabel(name: string, t: TFunction): string {
  const key = KO_NAME_TO_I18N_KEY[name];
  return key ? t(key) : name;
}
