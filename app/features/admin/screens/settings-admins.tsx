/**
 * Admin User Management Page
 *
 * Allows super admins to manage admin accounts and permissions.
 */
import type { Route } from "./+types/settings-admins";

import { Edit, RotateCcw, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  type AdminRole,
  AdminUserAddModal,
  type AdminUserFormData,
} from "../components/admin-user-add-modal";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireSuperAdmin } from "../utils/auth.server";
import { getPermissionLabel } from "../utils/permissions";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireSuperAdmin(request);
  const db = (await import("~/core/db/drizzle-client.server")).default;
  const { admins } = await import("~/features/admin/schema");
  const dbAdmins = await db
    .select({
      admin_id: admins.admin_id,
      name: admins.name,
      email: admins.email,
      role: admins.role,
      permissions: admins.permissions,
      is_active: admins.is_active,
      created_at: admins.created_at,
    })
    .from(admins)
    .catch(() => []);
  return { adminUser, dbAdmins };
}

export async function action({ request }: Route.ActionArgs) {
  await requireSuperAdmin(request);
  await requireAdminMutation(request, ADMIN_PERMISSIONS.ADMINS, "admins");

  const db = (await import("~/core/db/drizzle-client.server")).default;
  const { admins } = await import("~/features/admin/schema");
  const { eq } = await import("drizzle-orm");
  const { default: bcrypt } = await import("bcryptjs");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "create") {
    const password = fd.get("password") as string;
    const hash = await bcrypt.hash(password, 10);
    const roleRaw = fd.get("role") as string;
    const dbRole: "super" | "admin" =
      roleRaw === "super" || roleRaw === "super_admin" ? "super" : "admin";
    await db.insert(admins).values({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password_hash: hash,
      role: dbRole,
      permissions: fd.get("permissions")
        ? (fd.get("permissions") as string).split(",")
        : [],
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    const roleRaw = fd.get("role") as string;
    const dbRole: "super" | "admin" =
      roleRaw === "super" || roleRaw === "super_admin" ? "super" : "admin";
    const password = (fd.get("password") as string | null)?.trim();
    const values: {
      name: string;
      email: string;
      role: "super" | "admin";
      permissions: string[];
      password_hash?: string;
    } = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      role: dbRole,
      permissions: fd.get("permissions")
        ? (fd.get("permissions") as string).split(",")
        : [],
    };
    if (password) {
      values.password_hash = await bcrypt.hash(password, 10);
    }
    if (id) await db.update(admins).set(values).where(eq(admins.admin_id, id));
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id)
      await db
        .update(admins)
        .set({ is_active: false, active_session_id: null })
        .where(eq(admins.admin_id, id));
    return { success: true };
  }

  if (intent === "activate") {
    const id = Number(fd.get("id"));
    if (id)
      await db
        .update(admins)
        .set({ is_active: true })
        .where(eq(admins.admin_id, id));
    return { success: true };
  }

  return { success: false };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbAdmins } = loaderData;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const fetcher = useFetcher();

  const dbRoleToAdminRole = (r: string): AdminRole =>
    r === "super" ? "super" : "general";
  const admins: AdminUser[] =
    dbAdmins.length > 0
      ? dbAdmins.map((a) => ({
          id: String(a.admin_id),
          name: a.name,
          email: a.email,
          role: dbRoleToAdminRole(a.role),
          permissions: a.permissions ?? [],
          isActive: a.is_active,
          createdAt: a.created_at.toISOString().slice(0, 10),
        }))
      : [];

  const handleAddAdmin = (adminData: AdminUserFormData) => {
    const fd = new FormData();
    fd.append("intent", "create");
    fd.append("name", adminData.name);
    fd.append("email", adminData.email);
    fd.append("password", adminData.password ?? "changeme123!");
    fd.append("role", adminData.role);
    fd.append("permissions", adminData.permissions.join(","));
    fetcher.submit(fd, { method: "POST" });
    setIsAddModalOpen(false);
  };

  const handleEditAdmin = (adminData: AdminUserFormData) => {
    if (!editingAdmin) return;
    const fd = new FormData();
    fd.append("intent", "update");
    fd.append("id", editingAdmin.id);
    fd.append("name", adminData.name);
    fd.append("email", adminData.email);
    fd.append("password", adminData.password ?? "");
    fd.append("role", adminData.role);
    fd.append("permissions", adminData.permissions.join(","));
    fetcher.submit(fd, { method: "POST" });
    setEditingAdmin(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 비활성화하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleActivate = (id: string) => {
    const fd = new FormData();
    fd.append("intent", "activate");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  const getRoleLabel = (role: AdminRole) => {
    return role === "super" ? "슈퍼 관리자" : "일반 관리자";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminNavbar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  관리자 계정 관리
                </h1>
                <p className="text-gray-600">
                  관리자 계정을 생성하고 권한을 설정하세요
                </p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                관리자 추가
              </Button>
            </div>

            {/* Admin List */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b px-6 py-4">
                <h2 className="font-semibold text-gray-900">관리자 목록</h2>
                <p className="mt-1 text-sm text-gray-600">
                  현재 등록된 관리자 계정 ({admins.length}명)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        역할
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        권한
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        등록일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">
                          {admin.name}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {admin.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              admin.role === "super"
                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                : "bg-gray-500 text-white hover:bg-gray-600"
                            }
                          >
                            {getRoleLabel(admin.role)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              admin.isActive
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "bg-red-100 text-red-700 hover:bg-red-100"
                            }
                          >
                            {admin.isActive ? "활성" : "비활성"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex max-w-sm flex-wrap gap-2">
                            {admin.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                              >
                                {getPermissionLabel(permission)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {admin.createdAt}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingAdmin(admin)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {admin.isActive ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(admin.id)}
                                className="h-8 w-8 text-red-600 hover:text-red-700"
                                title="관리자 비활성화"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleActivate(admin.id)}
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700"
                                title="관리자 재활성화"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {admins.length === 0 && (
                <div className="py-12 text-center">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    등록된 관리자가 없습니다
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    새 관리자를 추가하여 시스템을 관리하세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AdminUserAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddAdmin}
      />
      <AdminUserAddModal
        open={Boolean(editingAdmin)}
        onOpenChange={(open) => {
          if (!open) setEditingAdmin(null);
        }}
        onSubmit={handleEditAdmin}
        initialData={
          editingAdmin
            ? {
                name: editingAdmin.name,
                email: editingAdmin.email,
                password: "",
                role: editingAdmin.role,
                permissions: editingAdmin.permissions,
              }
            : undefined
        }
        mode="edit"
      />
    </div>
  );
}
