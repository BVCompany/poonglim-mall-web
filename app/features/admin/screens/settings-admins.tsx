/**
 * Admin User Management Page
 * 
 * Allows super admins to manage admin accounts and permissions.
 */

import { useState } from "react";
import type { Route } from "./+types/settings-admins";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import {
  AdminUserAddModal,
  type AdminUserFormData,
  type AdminRole,
  type AdminPermission,
} from "../components/admin-user-add-modal";
import { Button } from "~/core/components/ui/button";
import { Badge } from "~/core/components/ui/badge";
import { Edit, Trash2, Plus, UserPlus } from "lucide-react";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  createdAt: string;
}

const MOCK_ADMINS: AdminUser[] = [
  {
    id: "1",
    name: "메인 관리자",
    email: "admin@poonglim.com",
    role: "super",
    permissions: ["products", "recipes", "events", "careers", "banners", "admins"],
    createdAt: "2024-01-01",
  },
];

export default function AdminUsersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const [admins, setAdmins] = useState<AdminUser[]>(MOCK_ADMINS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddAdmin = (adminData: AdminUserFormData) => {
    const newAdmin: AdminUser = {
      id: Date.now().toString(),
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      permissions: adminData.permissions,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAdmins([...admins, newAdmin]);
    alert(`관리자가 추가되었습니다: ${adminData.name}`);
  };

  const handleEdit = (id: string) => {
    console.log("Edit admin:", id);
    alert(`관리자 수정: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setAdmins(admins.filter((admin) => admin.id !== id));
      alert(`관리자 삭제: ${id}`);
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    return role === "super" ? "슈퍼 관리자" : "일반 관리자";
  };

  const getPermissionLabel = (permission: AdminPermission) => {
    const labels: Record<AdminPermission, string> = {
      products: "제품 관리",
      recipes: "레시피 관리",
      events: "이벤트/공지 관리",
      careers: "채용 공고 관리",
      banners: "배너 관리",
      admins: "관리자 관리",
    };
    return labels[permission];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminNavbar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
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
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">관리자 목록</h2>
                <p className="text-sm text-gray-600 mt-1">
                  현재 등록된 관리자 계정 ({admins.length}명)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이름
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        이메일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        역할
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        권한
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        등록일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {admin.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2 max-w-sm">
                            {admin.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded"
                              >
                                {getPermissionLabel(permission)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {admin.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(admin.id)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(admin.id)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {admins.length === 0 && (
                <div className="text-center py-12">
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
    </div>
  );
}

