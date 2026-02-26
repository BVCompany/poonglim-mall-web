/**
 * Admin Factory Tour Applications Management Page
 * 
 * Allows admins to view and manage factory tour applications.
 */

import { useState } from "react";
import type { Route } from "./+types/inquiries-factory-tours";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Input } from "~/core/components/ui/input";
import { Button } from "~/core/components/ui/button";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

interface TourApplication {
  id: string;
  applicantName: string;
  phone: string;
  participants: number;
  purpose: string;
  requestedDate: string;
  appliedDate: string;
  status: "승인대기" | "승인완료" | "거절";
}

const MOCK_APPLICATIONS: TourApplication[] = [
  {
    id: "1",
    applicantName: "김선생",
    phone: "010-1234-5678",
    participants: 30,
    purpose: "식품 제조 과정 학습",
    requestedDate: "2025-02-15 10:00",
    appliedDate: "2025-01-05 14:30",
    status: "승인대기",
  },
  {
    id: "2",
    applicantName: "이교수",
    phone: "010-2345-6789",
    participants: 25,
    purpose: "일반 소비자 현장 실습",
    requestedDate: "2025-02-20 14:00",
    appliedDate: "2025-01-03 10:15",
    status: "승인완료",
  },
  {
    id: "3",
    applicantName: "박대리",
    phone: "010-3456-7890",
    participants: 20,
    purpose: "직원 복지 프로그램",
    requestedDate: "2025-03-05 15:00",
    appliedDate: "2025-01-01 09:00",
    status: "거절",
  },
];

export default function AdminFactoryToursPage({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [applications] = useState<TourApplication[]>(MOCK_APPLICATIONS);

  const filteredApplications = applications.filter((app) =>
    app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.phone.includes(searchQuery) ||
    app.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: TourApplication["status"]) => {
    const statusConfig = {
      "승인대기": { className: "bg-orange-500 text-white", label: "승인대기" },
      "승인완료": { className: "bg-[#204E3A] text-white", label: "승인완료" },
      "거절": { className: "bg-red-500 text-white", label: "거절" },
    };
    return statusConfig[status];
  };

  const handleView = (id: string) => {
    console.log("View application:", id);
    alert(`견학 신청 상세보기: ${id}`);
  };

  const handleApprove = (id: string) => {
    console.log("Approve application:", id);
    alert(`견학 신청 승인: ${id}`);
  };

  const handleReject = (id: string) => {
    console.log("Reject application:", id);
    alert(`견학 신청 거절: ${id}`);
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                견학 신청 관리
              </h1>
              <p className="text-gray-600">
                공장 견학 신청을 확인하고 승인하세요
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="기관명 또는 신청자를 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const statusConfig = getStatusBadge(app.status);
                return (
                  <Card key={app.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {app.purpose.split(" ")[0]}
                        </h3>
                        <p className="text-sm text-gray-500">
                          신청일시: {app.appliedDate} · 방문 예정: {app.requestedDate}
                        </p>
                      </div>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">신청자</p>
                        <p className="font-medium text-gray-900">{app.applicantName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">연락처</p>
                        <p className="font-medium text-gray-900">{app.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">참가 인원</p>
                        <p className="font-medium text-gray-900">{app.participants}명</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">방문 목적</p>
                        <p className="font-medium text-gray-900">{app.purpose}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(app.id)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        상세보기
                      </Button>
                      {app.status === "승인대기" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(app.id)}
                            className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
                          >
                            <CheckCircle className="h-4 w-4" />
                            승인
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(app.id)}
                            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                            거절
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  검색 결과가 없습니다
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요"
                    : "견학 신청이 없습니다"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

