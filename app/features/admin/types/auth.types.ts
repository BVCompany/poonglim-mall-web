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
  // Content Management
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_RECIPES: "manage_recipes",
  MANAGE_EVENTS: "manage_events",
  MANAGE_NEWS: "manage_news",
  MANAGE_BLOG: "manage_blog",

  // User Management
  MANAGE_INQUIRIES: "manage_inquiries",
  MANAGE_APPLICATIONS: "manage_applications",

  // System Management
  MANAGE_ADMINS: "manage_admins",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_SETTINGS: "manage_settings",
} as const;

/**
 * Role-based permissions mapping
 */
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: Object.values(ADMIN_PERMISSIONS),
  admin: [
    ADMIN_PERMISSIONS.MANAGE_PRODUCTS,
    ADMIN_PERMISSIONS.MANAGE_RECIPES,
    ADMIN_PERMISSIONS.MANAGE_EVENTS,
    ADMIN_PERMISSIONS.MANAGE_NEWS,
    ADMIN_PERMISSIONS.MANAGE_BLOG,
    ADMIN_PERMISSIONS.MANAGE_INQUIRIES,
    ADMIN_PERMISSIONS.MANAGE_APPLICATIONS,
    ADMIN_PERMISSIONS.VIEW_ANALYTICS,
  ],
  editor: [
    ADMIN_PERMISSIONS.MANAGE_PRODUCTS,
    ADMIN_PERMISSIONS.MANAGE_RECIPES,
    ADMIN_PERMISSIONS.MANAGE_EVENTS,
    ADMIN_PERMISSIONS.MANAGE_NEWS,
    ADMIN_PERMISSIONS.MANAGE_BLOG,
  ],
};

/**
 * Temporary admin credentials for development
 * TODO: Remove when Supabase authentication is implemented
 */
export const TEMP_ADMIN_CREDENTIALS = {
  email: "admin@poonglim.com",
  password: "poonglim2024",
  user: {
    id: "temp-admin-001",
    email: "admin@poonglim.com",
    name: "관리자",
    role: "super_admin" as AdminRole,
    permissions: Object.values(ADMIN_PERMISSIONS),
  },
};
