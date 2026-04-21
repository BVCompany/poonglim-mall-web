import type { RecipeCategory } from "../schema";

const DEMO_TS = new Date("2026-01-01T00:00:00.000Z");

/**
 * 관리자 레시피 화면: `recipe_categories`가 비어 있을 때만 쓰는 예시 행
 * (마이그레이션 0007 시드와 동일한 slug·이름, 0022 색 기준)
 */
export function getRecipeCategoriesAdminDemo(): RecipeCategory[] {
  return [
    {
      category_id: -1,
      name: "가정용",
      slug: "easy",
      color: "sky",
      sort_order: 0,
      is_active: true,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      category_id: -2,
      name: "카페 & 베이커리",
      slug: "dessert",
      color: "rose",
      sort_order: 1,
      is_active: true,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
    {
      category_id: -3,
      name: "외식업체",
      slug: "restaurant",
      color: "emerald",
      sort_order: 2,
      is_active: true,
      created_at: DEMO_TS,
      updated_at: DEMO_TS,
    },
  ];
}

export function isRecipeCategoryAdminDemoRow(categoryId: number): boolean {
  return categoryId < 0;
}
