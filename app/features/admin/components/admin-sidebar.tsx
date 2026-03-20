/**
 * Admin Sidebar Navigation
 *
 * Sidebar navigation component for admin panel.
 * Includes collapsible menu items and user info.
 */
import type { AdminUser } from "../types/auth.types";

import {
  ChevronDown,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Form, Link, useLocation } from "react-router";

import { Button } from "~/core/components/ui/button";
import { cn } from "~/core/lib/utils";

interface AdminSidebarProps {
  adminUser: AdminUser;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  children?: {
    title: string;
    href: string;
  }[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "대시보드",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    id: "products",
    title: "제품 관리",
    icon: Package,
    children: [
      { title: "제품 목록", href: "/admin/products" },
      { title: "카테고리 관리", href: "/admin/product-categories" },
    ],
  },
  {
    id: "posts",
    title: "게시물 관리",
    icon: FileText,
    children: [
      { title: "공지사항", href: "/admin/notices" },
      { title: "등급판정서", href: "/admin/grade-certificates" },
      { title: "FAQ", href: "/admin/faqs" },
      { title: "이벤트/공지", href: "/admin/events" },
      { title: "레시피 목록", href: "/admin/recipes" },
      { title: "레시피 카테고리", href: "/admin/recipe-categories" },
      { title: "뉴스/보도자료", href: "/admin/media/news" },
      { title: "카탈로그", href: "/admin/media/catalog" },
    ],
  },
  {
    id: "careers",
    title: "채용 관리",
    icon: Users,
    children: [
      { title: "채용 공고", href: "/admin/careers" },
      { title: "지원서 관리", href: "/admin/applications" },
    ],
  },
  {
    id: "inquiries",
    title: "고객 문의",
    icon: MessageSquare,
    children: [
      { title: "상담 문의", href: "/admin/inquiries/consulting" },
      { title: "견학 신청", href: "/admin/inquiries/tour" },
    ],
  },
  {
    id: "banners",
    title: "배너 관리",
    icon: Image,
    children: [
      { title: "메인 배너", href: "/admin/settings/banners" },
      { title: "페이지 배너", href: "/admin/settings/page-banners" },
      { title: "홈 섹션 관리", href: "/admin/settings/site" },
    ],
  },
  {
    id: "settings",
    title: "설정",
    icon: Settings,
    children: [
      { title: "팝업 관리", href: "/admin/settings/popups" },
      { title: "사이트 설정", href: "/admin/settings/seo" },
      { title: "관리자 관리", href: "/admin/settings/admins" },
    ],
  },
];

export function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["dashboard"]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.href) {
      return isActive(item.href);
    }
    if (item.children) {
      return item.children.some((child) => isActive(child.href));
    }
    return false;
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200 px-6">
        <h1 className="w-full text-left text-xl font-bold text-[#204E3A]">
          풍림푸드 관리자
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isItemActive = isMenuActive(item);
          const isExpanded = expandedMenus.includes(item.id);

          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              {item.href ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isItemActive
                      ? "bg-[#204E3A] text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{item.title}</span>
                </Link>
              ) : (
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isItemActive
                      ? "bg-[#204E3A] text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180 transform",
                    )}
                  />
                </button>
              )}

              {/* Submenu */}
              {item.children && isExpanded && (
                <div className="mt-1 ml-8 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive(child.href)
                          ? "bg-[#204E3A]/10 font-medium text-[#204E3A]"
                          : "text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 rounded-lg bg-gray-50 p-3">
          <p className="mb-1 text-xs text-gray-500">로그인 계정</p>
          <p className="text-sm font-medium text-gray-900">{adminUser.email}</p>
        </div>
        <Form method="post" action="/admin/logout">
          <Button
            type="submit"
            variant="outline"
            className="w-full justify-center gap-2"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </Form>
      </div>
    </div>
  );
}
