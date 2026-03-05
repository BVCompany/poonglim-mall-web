/**
 * Admin Consulting Inquiries Management Page
 * 
 * Allows admins to view and manage consulting inquiries.
 */

import { useState } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/inquiries-consulting";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Input } from "~/core/components/ui/input";
import { Button } from "~/core/components/ui/button";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import { Search, Eye, CheckCircle, Trash2, Phone, Mail } from "lucide-react";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { inquiries } = await import("~/features/inquiry/schema");
  const dbInquiries = await db.select().from(inquiries).catch(() => []);
  return { adminUser, dbInquiries };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { inquiries } = await import("~/features/inquiry/schema");
  const { eq } = await import("drizzle-orm");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;
  if (intent === "complete") {
    const id = Number(fd.get("id"));
    if (id) await db.update(inquiries).set({ status: "completed" }).where(eq(inquiries.inquiry_id, id));
  }
  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(inquiries).where(eq(inquiries.inquiry_id, id));
  }
  return { success: true };
}

interface Inquiry {
  id: string;
  date: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  title: string;
  status: "대기중" | "처리완료";
}

const MOCK_INQUIRIES: Inquiry[] = [
  {
    id: "1",
    date: "2024-01-15",
    name: "김철수",
    phone: "010-1234-5678",
    email: "kim@example.com",
    type: "제품 문의",
    title: "액란 제품 대량 구매 문의",
    status: "대기중",
  },
  {
    id: "2",
    date: "2024-01-14",
    name: "이영희",
    phone: "010-2345-6789",
    email: "lee@example.com",
    type: "일반 소비자 문의",
    title: "제품 배송 문의",
    status: "처리완료",
  },
  {
    id: "3",
    date: "2024-01-13",
    name: "박민수",
    phone: "010-3456-7890",
    email: "park@example.com",
    type: "B2B 문의",
    title: "장기 배송 계약 문의",
    status: "처리완료",
  },
];

export default function AdminConsultingInquiriesPage({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, dbInquiries } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const fetcher = useFetcher();

  const inquiries: Inquiry[] = dbInquiries.length > 0
    ? dbInquiries.map((i) => ({
        id: String(i.inquiry_id),
        date: i.created_at.toISOString().slice(0, 10),
        name: i.name,
        phone: i.phone,
        email: i.email,
        type: i.type,
        title: i.title,
        status: i.status === "completed" ? "처리완료" as const : "대기중" as const,
      }))
    : MOCK_INQUIRIES;

  const filteredInquiries = inquiries.filter(
    (inquiry) =>
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === "대기중").length,
    completed: inquiries.filter((i) => i.status === "처리완료").length,
  };

  const handleView = (id: string) => {
    console.log("View inquiry:", id);
    alert(`상담 문의 상세보기: ${id}`);
  };

  const handleComplete = (id: string) => {
    const fd = new FormData();
    fd.append("intent", "complete");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
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
                상담 문의 관리
              </h1>
              <p className="text-gray-600">
                웹사이트에서 남겨진 문의 내용을 확인하고 관리합니다
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <Card className="p-6">
                <h3 className="text-sm text-gray-600 mb-2">전체 문의</h3>
                <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm text-gray-600 mb-2">대기중</h3>
                <p className="text-4xl font-bold text-orange-500">{stats.pending}</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-sm text-gray-600 mb-2">처리완료</h3>
                <p className="text-4xl font-bold text-emerald-600">{stats.completed}</p>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="이름, 이메일, 제목으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      접수일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      연락처
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      문의 유형
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inquiry.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inquiry.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {inquiry.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {inquiry.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inquiry.type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {inquiry.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {inquiry.status === "대기중" ? (
                          <Badge className="bg-gray-900 text-white">
                            대기중
                          </Badge>
                        ) : (
                          <Badge className="bg-[#204E3A] text-white">
                            처리완료
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(inquiry.id)}
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inquiry.status === "대기중" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleComplete(inquiry.id)}
                              className="h-8 w-8 text-[#204E3A]"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(inquiry.id)}
                            className="h-8 w-8 text-red-600"
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
            {filteredInquiries.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Search className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  검색 결과가 없습니다
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? "다른 검색어로 시도해보세요"
                    : "문의가 없습니다"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

