/**
 * Admin Recipe Mock Data — DB 비어 있을 때만 목록에 표시
 */
import type { AdminRecipe } from "../types/recipe.types";

export const MOCK_RECIPES: AdminRecipe[] = [
  {
    id: "demo-1",
    title: "에그샌드위치",
    description: "부드러운 에그샐러드로 만드는 간단한 샌드위치",
    category: "home",
    difficulty: "easy",
    cookingTime: "15분",
    servings: "2인분",
    image: "/recipe/recipe01.png",
    tags: ["간편", "아침식사", "도시락"],
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
  {
    id: "demo-2",
    title: "푸딩 타르트",
    description: "카페 스타일의 고급스러운 푸딩 타르트",
    category: "cafe",
    difficulty: "medium",
    cookingTime: "30분",
    servings: "4인분",
    image: "/recipe/recipe02.png",
    tags: ["디저트", "카페", "특별한날"],
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-08T00:00:00Z",
  },
];
