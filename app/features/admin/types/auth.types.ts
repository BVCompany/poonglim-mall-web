/**
 * Admin Authentication Types
 *
 * Type definitions for admin authentication system.
 * Supports both temporary authentication and future Supabase integration.
 */

/**
 * Admin role types
 */
export type AdminRole = "super_admin" | "admin" | "editor";

/**
 * Admin user interface
 */
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions?: string[];
  sessionId?: string;
  created_at?: string;
}

/**
 * Admin login credentials
 */
export interface AdminLoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Admin session interface
 */
export interface AdminSession {
  user: AdminUser;
  token?: string;
  expires_at?: string;
}

/**
 * Admin permissions
 */
export const ADMIN_PERMISSIONS = {
  DASHBOARD: "dashboard",
  PRODUCTS: "products",
  PRODUCT_CATEGORIES: "product_categories",
  NOTICES: "notices",
  GRADE_CERTIFICATES: "grade_certificates",
  FAQS: "faqs",
  CERTIFICATIONS: "certifications",
  EVENTS: "events",
  RECIPES: "recipes",
  RECIPE_CATEGORIES: "recipe_categories",
  NEWS: "news",
  CATALOG: "catalog",
  RESOURCES: "resources",
  CAREERS: "careers",
  APPLICATIONS: "applications",
  CONSULTING_INQUIRIES: "consulting_inquiries",
  FACTORY_TOURS: "factory_tours",
  BANNERS: "banners",
  PAGE_BANNERS: "page_banners",
  SITE_HOME: "site_home",
  INSTAGRAM: "instagram",
  POPUPS: "popups",
  SEO: "seo",
  ADMINS: "admins",
  AUDIT_LOGS: "audit_logs",
} as const;

export type AdminPermission =
  (typeof ADMIN_PERMISSIONS)[keyof typeof ADMIN_PERMISSIONS];

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: Object.values(ADMIN_PERMISSIONS),
  admin: [],
  editor: [],
};
