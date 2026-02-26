/**
 * Admin Recipe Types
 * 
 * Type definitions for recipe management in admin panel.
 */

/**
 * Recipe category types
 */
export type RecipeCategory = "home" | "cafe" | "restaurant";

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
  cookingTime: number; // in minutes
  servings: number;
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

