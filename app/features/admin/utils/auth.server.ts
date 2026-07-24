/**
 * Admin Authentication Server Utilities
 *
 * Server-side authentication functions for admin users.
 * Currently uses temporary session-based authentication.
 * TODO: Replace with Supabase authentication when DB is configured.
 */
import type { AdminLoginCredentials, AdminUser } from "../types/auth.types";
import type { CrudOperation } from "./permissions";

import { createCookieSessionStorage, redirect } from "react-router";

import { hasPermission, menuPermission } from "./permissions";

/**
 * Session storage configuration
 */
const SESSION_SECRET =
  process.env.SESSION_SECRET ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.DATABASE_URL ??
  (process.env.NODE_ENV === "production"
    ? (() => {
        throw new Error(
          "SESSION_SECRET or another server-only secret is required in production",
        );
      })()
    : "development-only-admin-secret");
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
    request.headers.get("Cookie"),
  );
  return session;
}

/**
 * Get current admin user from session
 */
export async function getAdminUser(
  request: Request,
): Promise<AdminUser | null> {
  const session = await getAdminSession(request);
  const adminUser = session.get("adminUser");

  if (!adminUser) {
    return null;
  }

  const sessionUser = adminUser as AdminUser;

  // 권한 회수와 계정 비활성화가 기존 세션에도 즉시 반영되도록 매 요청마다
  // DB의 현재 상태를 기준으로 세션 사용자 정보를 재검증한다.
  try {
    const db = (await import("~/core/db/drizzle-client.server")).default;
    const { admins } = await import("../schema");
    const { and, eq } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(admins)
      .where(
        and(
          eq(admins.admin_id, Number(sessionUser.id)),
          eq(admins.is_active, true),
        ),
      )
      .limit(1);
    const current = rows[0];
    if (!current) return null;

    return {
      id: String(current.admin_id),
      name: current.name,
      email: current.email,
      role: current.role === "super" ? "super_admin" : "admin",
      permissions: current.permissions ?? [],
    };
  } catch {
    return null;
  }
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

export async function requireAdminPermission(
  request: Request,
  permission: string,
): Promise<AdminUser> {
  const adminUser = await requireAdminAuth(request);
  const requiredPermission = permission.includes(".")
    ? permission
    : menuPermission(permission, "read");
  if (!hasPermission(adminUser, requiredPermission)) {
    throw new Response("권한이 없습니다.", { status: 403 });
  }

  return adminUser;
}

export async function requireSuperAdmin(request: Request): Promise<AdminUser> {
  const adminUser = await requireAdminAuth(request);
  if (adminUser.role !== "super_admin") {
    throw new Response("최고관리자만 접근할 수 있습니다.", { status: 403 });
  }
  return adminUser;
}

const SENSITIVE_AUDIT_FIELDS = new Set([
  "password",
  "password_hash",
  "current_password",
  "new_password",
  "token",
]);

function auditValue(key: string, value: FormDataEntryValue): unknown {
  if (SENSITIVE_AUDIT_FIELDS.has(key.toLowerCase())) return "[REDACTED]";
  if (value instanceof File) {
    return { name: value.name, size: value.size, type: value.type };
  }
  // 본문·HTML·base64 데이터로 로그가 비정상적으로 커지는 것을 막는다.
  return value.length > 2_000 ? `${value.slice(0, 2_000)}…` : value;
}

/**
 * 변경 요청을 먼저 감사 로그에 기록한 뒤 권한이 확인된 관리자를 반환한다.
 * 로그 INSERT가 실패하면 실제 변경도 시작하지 않는 fail-closed 방식이다.
 */
export async function requireAdminMutation(
  request: Request,
  menuPermissionKey: string,
  menu: string,
  operationOverride?: CrudOperation | CrudOperation[],
): Promise<AdminUser> {
  const formData = await request.clone().formData();
  const intent = String(formData.get("intent") ?? request.method).toLowerCase();
  const inferredOperation: CrudOperation =
    (Array.isArray(operationOverride) ? undefined : operationOverride) ??
    (intent.includes("delete")
      ? "delete"
      : intent.includes("create")
        ? "create"
        : "update");
  const adminUser = await requireAdminAuth(request);
  const allowedOperations = Array.isArray(operationOverride)
    ? operationOverride
    : [inferredOperation];
  if (
    !allowedOperations.some((operation) =>
      hasPermission(adminUser, menuPermission(menuPermissionKey, operation)),
    )
  ) {
    throw new Response("권한이 없습니다.", { status: 403 });
  }
  const details: Record<string, unknown> = {};

  for (const [key, value] of formData.entries()) {
    const safeValue = auditValue(key, value);
    const previous = details[key];
    details[key] =
      previous === undefined
        ? safeValue
        : Array.isArray(previous)
          ? [...previous, safeValue]
          : [previous, safeValue];
  }

  const action = intent;
  const targetId =
    formData.get("id") ??
    formData.get("admin_id") ??
    formData.get("product_id") ??
    formData.get("recipe_id");
  const db = (await import("~/core/db/drizzle-client.server")).default;
  const { adminAuditLogs } = await import("../schema");
  const url = new URL(request.url);

  await db.insert(adminAuditLogs).values({
    admin_id: adminUser.id,
    admin_name: adminUser.name,
    admin_email: adminUser.email,
    menu,
    action,
    request_path: url.pathname,
    target_id: typeof targetId === "string" ? targetId : null,
    details,
    ip_address:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip"),
    user_agent: request.headers.get("user-agent"),
  });

  return adminUser;
}

/**
 * DB 기반 관리자 로그인
 * admins 테이블에서 이메일로 조회 후 bcrypt 비교
 */
export async function loginAdmin(
  credentials: AdminLoginCredentials,
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

    const isValid = await bcrypt.compare(
      credentials.password,
      admin.password_hash,
    );
    if (!isValid) return null;

    const roleMap: Record<string, AdminUser["role"]> = {
      super: "super_admin",
      admin: "admin",
    };
    return {
      id: String(admin.admin_id),
      name: admin.name,
      email: admin.email,
      role: roleMap[admin.role] ?? "admin",
      permissions: (admin.permissions ?? []) as AdminUser["permissions"],
    };
  } catch {
    return null;
  }
}

/**
 * Create admin session after successful login
 */
export async function createAdminSession(
  adminUser: AdminUser,
  redirectTo: string = "/admin/dashboard",
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
