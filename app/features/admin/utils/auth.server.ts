/**
 * Admin Authentication Server Utilities
 * 
 * Server-side authentication functions for admin users.
 * Currently uses temporary session-based authentication.
 * TODO: Replace with Supabase authentication when DB is configured.
 */

import { createCookieSessionStorage, redirect } from "react-router";
import type { AdminUser, AdminLoginCredentials } from "../types/auth.types";
import { TEMP_ADMIN_CREDENTIALS, ROLE_PERMISSIONS } from "../types/auth.types";

/**
 * Session storage configuration
 */
const SESSION_SECRET = process.env.SESSION_SECRET || "temp-admin-secret-key";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const adminSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__admin_session",
    httpOnly: true,
    path: "/admin",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
  },
});

/**
 * Get admin session from request
 */
export async function getAdminSession(request: Request) {
  const session = await adminSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return session;
}

/**
 * Get current admin user from session
 */
export async function getAdminUser(request: Request): Promise<AdminUser | null> {
  const session = await getAdminSession(request);
  const adminUser = session.get("adminUser");
  
  if (!adminUser) {
    return null;
  }
  
  return adminUser as AdminUser;
}

/**
 * Require admin authentication
 * Redirects to login if not authenticated
 */
export async function requireAdminAuth(request: Request): Promise<AdminUser> {
  const adminUser = await getAdminUser(request);
  
  if (!adminUser) {
    throw redirect("/admin/login");
  }
  
  return adminUser;
}

/**
 * Check if admin has specific permission
 */
export function hasPermission(adminUser: AdminUser, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[adminUser.role] || [];
  return rolePermissions.includes(permission);
}

/**
 * Temporary login function
 * TODO: Replace with Supabase authentication
 * 
 * @param credentials - Admin login credentials
 * @returns Admin user or null if authentication fails
 */
export async function loginAdmin(
  credentials: AdminLoginCredentials
): Promise<AdminUser | null> {
  // TODO: Replace with Supabase query when DB is configured
  // const { data, error } = await supabase
  //   .from('admins')
  //   .select('*')
  //   .eq('email', credentials.email)
  //   .single();
  
  // Temporary authentication for development
  if (
    credentials.email === TEMP_ADMIN_CREDENTIALS.email &&
    credentials.password === TEMP_ADMIN_CREDENTIALS.password
  ) {
    return TEMP_ADMIN_CREDENTIALS.user;
  }
  
  return null;
}

/**
 * Create admin session after successful login
 */
export async function createAdminSession(
  adminUser: AdminUser,
  redirectTo: string = "/admin/dashboard"
) {
  const session = await adminSessionStorage.getSession();
  session.set("adminUser", adminUser);
  
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await adminSessionStorage.commitSession(session),
    },
  });
}

/**
 * Destroy admin session (logout)
 */
export async function destroyAdminSession(request: Request) {
  const session = await getAdminSession(request);
  
  return redirect("/admin/login", {
    headers: {
      "Set-Cookie": await adminSessionStorage.destroySession(session),
    },
  });
}

/**
 * Redirect if already authenticated
 */
export async function redirectIfAdminAuthenticated(request: Request) {
  const adminUser = await getAdminUser(request);
  
  if (adminUser) {
    throw redirect("/admin/dashboard");
  }
}

