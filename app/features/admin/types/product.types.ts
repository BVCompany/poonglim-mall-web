/**
 * Admin Product Types
 * 
 * Type definitions for product management in admin panel.
 */

/**
 * Product category types
 */
export type ProductCategory = "liquid-eggs" | "puddings" | "convenience" | "other";

/**
 * Product status
 */
export type ProductStatus = "active" | "inactive" | "out-of-stock";

/**
 * Product badge types
 */
export type ProductBadge = "best" | "new" | "sale" | "recommended";

/**
 * Admin Product interface
 */
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  tags: string[];
  badge?: ProductBadge;
  status: ProductStatus;
  stock?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Product form data
 */
export interface ProductFormData {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  tags: string[];
  badge?: ProductBadge;
  status: ProductStatus;
  stock?: number;
}

/**
 * Product filter options
 */
export interface ProductFilters {
  category?: ProductCategory;
  status?: ProductStatus;
  search?: string;
  badge?: ProductBadge;
}

