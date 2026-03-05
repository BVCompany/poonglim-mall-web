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
 * DB 기반 관리자 로그인
 * admins 테이블에서 이메일로 조회 후 bcrypt 비교
 */
export async function loginAdmin(
  credentials: AdminLoginCredentials
): Promise<AdminUser | null> {
  try {
    const db = (await import("~/core/db/drizzle-client.server")).default;
    const { admins } = await import("../schema");
    const { eq } = await import("drizzle-orm");
    const { default: bcrypt } = await import("bcryptjs");

    const rows = await db
      .select()
      .from(admins)
      .where(eq(admins.email, credentials.email))
      .limit(1);

    const admin = rows[0];
    if (!admin || !admin.is_active) return null;

    const isValid = await bcrypt.compare(credentials.password, admin.password_hash);
    if (!isValid) return null;

    const roleMap: Record<string, AdminUser["role"]> = { super: "super_admin", admin: "admin" };
    return {
      id: String(admin.admin_id),
      name: admin.name,
      email: admin.email,
      role: roleMap[admin.role] ?? "admin",
      permissions: (admin.permissions ?? []) as AdminUser["permissions"],
    };
  } catch {
    // DB 연결 실패 시 임시 자격증명으로 폴백 (개발 환경)
    if (
      credentials.email === TEMP_ADMIN_CREDENTIALS.email &&
      credentials.password === TEMP_ADMIN_CREDENTIALS.password
    ) {
      return TEMP_ADMIN_CREDENTIALS.user;
    }
    return null;
  }
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

