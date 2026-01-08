/**
 * Admin Popup Management Page
 * 
 * Allows admins to manage modal popups (view, create, edit, delete).
 */

import { useState } from "react";
import type { Route } from "./+types/settings-popups";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { PopupAddModal, type PopupFormData } from "../components/popup-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Edit, Trash2, Plus, Search, Eye } from "lucide-react";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

interface Popup {
  id: string;
  title: string;
  content: string;
  frequency: "once" | "daily" | "always";
  startDate: string;
  endDate: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  createdAt: string;
}

const MOCK_POPUPS: Popup[] = [
  {
    id: "1",
    title: "신제품 출시 안내",
    content: "새로운 제품이 출시되었습니다. 지금 확인하세요!",
    frequency: "once",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    imageUrl: "",
    linkUrl: "/products",
    isActive: true,
    createdAt: "2024-01-01",
  },
];

export default function AdminPopupsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [popups, setPopups] = useState<Popup[]>(MOCK_POPUPS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredPopups = popups.filter((popup) =>
    popup.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPopup = (popupData: PopupFormData) => {
    const newPopup: Popup = {
      id: Date.now().toString(),
      title: popupData.title,
      content: popupData.content,
      frequency: popupData.frequency,
      startDate: popupData.startDate,
      endDate: popupData.endDate,
      imageUrl: popupData.imageUrl,
      linkUrl: popupData.linkUrl,
      isActive: popupData.isActive,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setPopups([...popups, newPopup]);
    alert(`팝업이 추가되었습니다: ${popupData.title}`);
  };

  const handleEdit = (id: string) => {
    console.log("Edit popup:", id);
    alert(`팝업 수정: ${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      setPopups(popups.filter((popup) => popup.id !== id));
      alert(`팝업 삭제: ${id}`);
    }
  };

  const getFrequencyLabel = (frequency: Popup["frequency"]) => {
    const labels: Record<Popup["frequency"], string> = {
      once: "1회만",
      daily: "매일",
      always: "항상",
    };
    return labels[frequency];
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
                  팝업 관리
                </h1>
                <p className="text-gray-600">
                  사이트 모달 팝업을 관리합니다
                </p>
              </div>
              <Button
                className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                팝업 추가
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="팝업 제목 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Popup List Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        제목
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        기간
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        빈도
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPopups.map((popup) => (
                      <tr key={popup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {popup.title}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {popup.startDate} ~ {popup.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {getFrequencyLabel(popup.frequency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={
                              popup.isActive
                                ? "bg-[#204E3A] text-white hover:bg-[#1a3f2e]"
                                : "bg-gray-500 text-white hover:bg-gray-600"
                            }
                          >
                            {popup.isActive ? "활성" : "비활성"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(popup.id)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(popup.id)}
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
              {filteredPopups.length === 0 && (
                <div className="text-center py-12">
                  <Eye className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    {searchQuery ? "검색 결과가 없습니다" : "등록된 팝업이 없습니다"}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {searchQuery
                      ? "다른 검색어로 시도해보세요"
                      : "새 팝업을 추가하여 사용자에게 알림을 보내세요"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Popup Modal */}
      <PopupAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddPopup}
      />
    </div>
  );
}

