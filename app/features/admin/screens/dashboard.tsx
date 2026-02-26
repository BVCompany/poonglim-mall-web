/**
 * Admin Dashboard Screen
 * 
 * Main dashboard for admin panel.
 * Displays overview and quick access to admin features.
 */

import type { Route } from "./+types/dashboard";
import { requireAdminAuth } from "../utils/auth.server";
import { Link } from "react-router";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import {
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

/**
 * Admin Dashboard Component
 */
export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;

  // Mock data for dashboard
  const stats = [
    {
      title: "미답변 문의",
      value: "2",
      subtitle: "최근 1시간",
      icon: AlertCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "긴급 승인 대기",
      value: "1",
      subtitle: "승인 필요",
      icon: Clock,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "신규 지원자",
      value: "5",
      subtitle: "리뷰 필요",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
  ];

  const recentActivities = [
    {
      title: "신규 제품 지원서 접수",
      description: "삼식이 - 김이수 지원서",
      time: "30분 전",
    },
    {
      title: "제품 정보 업데이트",
      description: "뽀드득 에그 1kg - 가격 수정",
      time: "2시간 전",
    },
    {
      title: "이벤트 등록",
      description: "신 봄맞이 특별 프로모션",
      time: "5시간 전",
    },
    {
      title: "레시피 추가",
      description: "에깅롤 활용 스크램블 에그",
      time: "1일 전",
    },
  ];

  const recentInquiries = [
    {
      title: "대량 구매 문의 - 에그랜드 500개",
      category: "B2B 문의",
      time: "10분 전",
      status: "마감일" as const,
    },
    {
      title: "제품 유통기한 문의 질문",
      category: "제품 문의",
      time: "1시간 전",
      status: "마감일" as const,
    },
    {
      title: "공장 견학 신청 - 서울 A초등학교",
      category: "견학 신청",
      time: "2시간 전",
      status: "처리중" as const,
    },
    {
      title: "에깅 제품 납품 재고 문의",
      category: "구매 문의",
      time: "5시간 전",
      status: "처리중" as const,
    },
    {
      title: "레시피 협업 제안",
      category: "기타 문의",
      time: "1일 전",
      status: "담당자" as const,
    },
  ];

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
              대시보드
            </h1>
            <p className="text-gray-600">
              처리가 필요한 업무를 확인하세요
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className={`p-6 border-2 ${stat.borderColor} ${stat.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {stat.title}
                      </p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          {stat.subtitle}
                          <ArrowRight className="w-3 h-3" />
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Analytics Banner */}
          <Card className="p-8 mb-8 bg-gradient-to-r from-emerald-700 to-emerald-600 border-0">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">
                  상세 방문 통계 확인하기
                </h3>
                <p className="text-emerald-100">
                  Google Analytics에서 실시간 트래픽과 사용자 행동을 분석하세요
                </p>
              </div>
              <Button
                variant="secondary"
                className="gap-2 bg-white text-emerald-700 hover:bg-emerald-50"
                asChild
              >
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <TrendingUp className="w-4 h-4" />
                  Analytics 열기
                </a>
              </Button>
            </div>
          </Card>

          {/* Recent Activities & Inquiries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                최근 활동
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                최근 업데이트된 콘텐츠
              </p>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Inquiries */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  최근 고객 문의
                </h3>
                <Link
                  to="/admin/inquiries"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  전체보기 →
                </Link>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                최신순 고객 문의
              </p>
              <div className="space-y-3">
                {recentInquiries.map((inquiry, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 mb-1 truncate">
                        {inquiry.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{inquiry.category}</span>
                        <span>·</span>
                        <span>{inquiry.time}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        inquiry.status === "마감일"
                          ? "destructive"
                          : inquiry.status === "처리중"
                            ? "default"
                            : "secondary"
                      }
                      className="ml-3 whitespace-nowrap"
                    >
                      {inquiry.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
