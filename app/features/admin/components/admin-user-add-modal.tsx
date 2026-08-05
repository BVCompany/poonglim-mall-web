/**
 * Admin User Add Modal Component
 *
 * Modal for adding new admin users in admin panel.
 */
import { useEffect, useState } from "react";

import { Button } from "~/core/components/ui/button";
import { Checkbox } from "~/core/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

import {
  ADMIN_MENU_OPTIONS,
  CRUD_OPERATIONS,
  CRUD_OPERATION_LABELS,
  expandPermissionsForEditing,
} from "../utils/permissions";

interface AdminUserAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (admin: AdminUserFormData) => void;
  initialData?: Partial<AdminUserFormData>;
  mode?: "create" | "edit";
}

export type AdminRole = "super" | "general";

export interface AdminUserFormData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: string[];
}

export function AdminUserAddModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = "create",
}: AdminUserAddModalProps) {
  const [formData, setFormData] = useState<AdminUserFormData>({
    name: initialData?.name ?? "",
    email: initialData?.email ?? "",
    password: initialData?.password ?? "",
    role: initialData?.role ?? "general",
    permissions: expandPermissionsForEditing(initialData?.permissions ?? []),
  });

  useEffect(() => {
    if (open) {
      setFormData({
        name: initialData?.name ?? "",
        email: initialData?.email ?? "",
        password: initialData?.password ?? "",
        role: initialData?.role ?? "general",
        permissions: expandPermissionsForEditing(initialData?.permissions ?? []),
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const togglePermission = (permission: string) => {
    if (formData.permissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permission],
      });
    }
  };

  const getRoleLabel = (role: AdminRole) => {
    return role === "super" ? "슈퍼 관리자" : "일반 관리자";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-1rem)] max-h-[900px] w-[calc(100vw-1rem)] max-w-none flex-col gap-0 overflow-hidden p-0 sm:h-[90dvh] sm:w-[calc(100vw-3rem)] sm:max-w-4xl">
        <DialogHeader className="shrink-0 border-b px-5 py-4 pr-12 sm:px-6">
          <DialogTitle className="text-xl font-bold">
            {mode === "edit" ? "관리자 권한 수정" : "새 관리자 추가"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <p className="text-sm text-gray-600">
              관리자 정보를 입력하고 메뉴 권한을 설정하세요
            </p>

            {/* Name & Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={
                  mode === "edit"
                    ? "변경할 경우에만 입력하세요"
                    : "비밀번호를 입력하세요"
                }
                required={mode === "create"}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">역할</Label>
              <Select
                value={formData.role}
                onValueChange={(value: AdminRole) =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="역할 선택">
                    {getRoleLabel(formData.role)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반 관리자</SelectItem>
                  <SelectItem value="super">슈퍼 관리자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <Label>메뉴 권한</Label>
              <div className="overflow-x-auto rounded-md border">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-[minmax(160px,1fr)_repeat(4,72px)] bg-gray-50 px-3 py-2 text-center text-xs font-medium text-gray-600">
                    <span className="text-left">메뉴</span>
                    {CRUD_OPERATIONS.map((operation) => (
                      <span key={operation}>
                        {CRUD_OPERATION_LABELS[operation]}
                      </span>
                    ))}
                  </div>
                  {ADMIN_MENU_OPTIONS.map((menu) => (
                    <div
                      key={menu.value}
                      className="grid grid-cols-[minmax(160px,1fr)_repeat(4,72px)] items-center border-t px-3 py-2"
                    >
                      <span className="text-sm font-medium">{menu.label}</span>
                      {CRUD_OPERATIONS.map((operation) => {
                        const permission = `${menu.value}.${operation}`;
                        return (
                          <div key={permission} className="flex justify-center">
                            <Checkbox
                              id={permission}
                              aria-label={`${menu.label} ${CRUD_OPERATION_LABELS[operation]}`}
                              checked={formData.permissions.includes(permission)}
                              onCheckedChange={() =>
                                togglePermission(permission)
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 border-t bg-background px-5 py-4 sm:px-6">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#204E3A] hover:bg-[#1a3f2e]"
              >
                {mode === "edit" ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
