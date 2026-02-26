/**
 * Admin Banner Management Page
 * 
 * Allows admins to manage main page banners (view, create, edit, delete, reorder).
 */

import { useState } from "react";
import type { Route } from "./+types/settings-banners";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { BannerAddModal, type BannerFormData } from "../components/banner-add-modal";
import { Button } from "~/core/components/ui/button";
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, Plus } from "lucide-react";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

interface Banner {
  id: string;
  order: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  buttonText: string;
  isActive: boolean;
  createdAt: string;
}

const MOCK_BANNERS: Banner[] = [
  {
    id: "1",
    order: 1,
    imageUrl: "/images/hero-banner.jpg",
    title: "건강하고 풍요로운 일상",
    subtitle: "신뢰할 수 있는 품질과 혁신적인 기술로 만든는 풍림푸드 제품을 만나보세요",
    linkUrl: "/products",
    buttonText: "제품 둘러보기",
    isActive: true,
    createdAt: "2024-01-01",
  },
];

export default function AdminBannersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddBanner = (bannerData: BannerFormData) => {
    const newBanner: Banner = {
      id: Date.now().toString(),
      order: banners.length + 1,
      imageUrl: bannerData.imageUrl,
      title: bannerData.title,
      subtitle: bannerData.subtitle,
      linkUrl: bannerData.linkUrl,
      buttonText: bannerData.buttonText,
      isActive: bannerData.isActive,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setBanners([...banners, newBanner]);
    alert(`배너가 추가되었습니다: ${bannerData.title}`);
  };

  const handleMoveUp = (id: string) => {
    const index = banners.findIndex((b) => b.id === id);
    if (index > 0) {
      const newBanners = [...banners];
      [newBanners[index - 1], newBanners[index]] = [
        newBanners[index],
        newBanners[index - 1],
      ];
      // Update orders
      newBanners.forEach((banner, idx) => {
        banner.order = idx + 1;
      });
      setBanners(newBanners);
    }
  };

  const handleMoveDown = (id: string) => {
    const index = banners.findIndex((b) => b.id === id);
    if (index < banners.length - 1) {
      const newBanners = [...banners];
      [newBanners[index], newBanners[index + 1]] = [
        newBanners[index + 1],
        newBanners[index],
      ];
      // Update orders
      newBanners.forEach((banner, idx) => {
        banner.order = idx + 1;
      });
      setBanners(newBanners);
    }
  };

  const handleToggleActive = (id: string) => {
    setBanners(
      banners.map((banner) =>
        banner.id === id ? { ...banner, isActive: !banner.isActive } : banner
      )
    );
  };

  const handleEdit = (id: string) => {
    console.log("Edit banner:", id);
    alert(`배너 수정: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setBanners(banners.filter((banner) => banner.id !== id));
      alert(`배너 삭제: ${id}`);
    }
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
                  메인 배너 관리
                </h1>
                <p className="text-gray-600">
                  홈페이지 메인 배너를 관리하세요
                </p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                배너 추가
              </Button>
            </div>

            {/* Banner List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">배너 목록</h2>
                <p className="text-sm text-gray-600 mt-1">
                  현재 등록된 배너 ({banners.length}개)
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        순서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        미리보기
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        링크
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
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
                    {banners.map((banner, index) => (
                      <tr key={banner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => handleMoveUp(banner.id)}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-900 text-center">
                              {banner.order}
                            </span>
                            <button
                              onClick={() => handleMoveDown(banner.id)}
                              disabled={index === banners.length - 1}
                              className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-16 w-24 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/96x64?text=No+Image";
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {banner.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {banner.subtitle}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{banner.linkUrl}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {banner.buttonText}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={banner.isActive}
                            onClick={() => handleToggleActive(banner.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              banner.isActive ? "bg-[#204E3A]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                banner.isActive ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {banner.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(banner.id)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(banner.id)}
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
              {banners.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    등록된 배너가 없습니다
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    새 배너를 추가하여 메인 페이지를 꾸며보세요
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Banner Modal */}
      <BannerAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddBanner}
      />
    </div>
  );
}

