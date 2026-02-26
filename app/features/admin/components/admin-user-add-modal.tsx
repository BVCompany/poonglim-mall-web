/**
 * Admin User Add Modal Component
 * 
 * Modal for adding new admin users in admin panel.
 */

import { useState, useEffect } from "react";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Checkbox } from "~/core/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

interface AdminUserAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (admin: AdminUserFormData) => void;
}

export type AdminRole = "super" | "general";

export type AdminPermission = 
  | "products"
  | "recipes"
  | "events"
  | "careers"
  | "banners"
  | "admins";

export interface AdminUserFormData {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

export function AdminUserAddModal({
  open,
  onOpenChange,
  onSubmit,
}: AdminUserAddModalProps) {
  const [formData, setFormData] = useState<AdminUserFormData>({
    name: "",
    email: "",
    password: "",
    role: "general",
    permissions: [],
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "general",
        permissions: [],
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const togglePermission = (permission: AdminPermission) => {
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

  const permissionOptions: { value: AdminPermission; label: string }[] = [
    { value: "products", label: "제품 관리" },
    { value: "recipes", label: "레시피 관리" },
    { value: "events", label: "이벤트/공지 관리" },
    { value: "careers", label: "채용 공고 관리" },
    { value: "banners", label: "배너 관리" },
    { value: "admins", label: "관리자 관리" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">새 관리자 추가</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <p className="text-sm text-gray-600">
            관리자 정보를 입력하고 권한을 설정하세요
          </p>

          {/* Name & Email */}
          <div className="grid grid-cols-2 gap-4">
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
              placeholder="비밀번호를 입력하세요"
              required
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
            <div className="grid grid-cols-2 gap-3">
              {permissionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={formData.permissions.includes(option.value)}
                    onCheckedChange={() => togglePermission(option.value)}
                  />
                  <label
                    htmlFor={option.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
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
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

