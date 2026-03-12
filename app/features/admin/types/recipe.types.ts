/**
 * Admin Recipe Types
 * 
 * Type definitions for recipe management in admin panel.
 */

/**
 * Recipe category types
 * DB 카테고리 슬러그를 그대로 사용하므로 string으로 확장
 */
export type RecipeCategory = "home" | "cafe" | "restaurant" | (string & {});

/**
 * Recipe difficulty level
 */
export type RecipeDifficulty = "easy" | "medium" | "hard";

/**
 * Recipe badge types
 */
export type RecipeBadge = "popular" | "new" | "recommended" | "seasonal";

/**
 * Admin Recipe interface
 */
export interface AdminRecipe {
  id: string;
  title: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  cookingTime: string; // "15분", "15~20분" 등
  servings: string;   // "2인분", "2~3인분" 등
  image: string;
  tags: string[];
  badge?: RecipeBadge;
  ingredients?: string[];
  instructions?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Recipe form data
 */
export interface RecipeFormData {
  title: string;
  description: string;
  category: RecipeCategory;
  difficulty: RecipeDifficulty;
  cookingTime: number;
  servings: number;
  image: string;
  tags: string[];
  badge?: RecipeBadge;
  ingredients: string[];
  instructions: string[];
}

/**
 * Recipe filter options
 */
export interface RecipeFilters {
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  search?: string;
}

