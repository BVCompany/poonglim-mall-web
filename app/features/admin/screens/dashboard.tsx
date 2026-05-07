/**
 * Admin Dashboard Screen
 * GA4 방문 통계 + 업무 현황 대시보드
 */
import type { Route } from "./+types/dashboard";
import { requireAdminAuth } from "../utils/auth.server";
import { Link } from "react-router";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { getAnalyticsData } from "~/features/analytics/queries.server";
import {
  AlertCircle, Clock, Users, TrendingUp, TrendingDown,
  ArrowRight, ExternalLink, Radio,
} from "lucide-react";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const analytics = await getAnalyticsData().catch(() => null);
  return { adminUser, analytics };
}

// ─── 헬퍼 ─────────────────────────────────────────────────────────────────────
function ChangeChip({ value }: { value: number }) {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        isPositive ? "text-emerald-600" : "text-red-500"
      }`}
    >
      <Icon className="h-3 w-3" />
      {isPositive ? "+" : ""}{value}%
    </span>
  );
}



// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { adminUser, analytics } = loaderData;
  const ga = analytics ?? {
    realtimeUsers: 0, todayUsers: 0, todayUsersChange: 0,
    weekUsers: 0, weekUsersChange: 0, isDemo: true,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-auto">
          <div className="p-8">

            {/* ── 헤더 ── */}
            <div className="mb-8">
              <h1 className="mb-1 text-3xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-500">처리가 필요한 업무를 확인하세요</p>
            </div>

            {/* ── 긴급 업무 카드 3종 ── */}
            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* 미답변 문의 */}
              <Link to="/admin/inquiries/consulting" className="group">
                <div className="rounded-xl border border-red-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-600">미답변 문의</p>
                    <div className="rounded-full bg-red-50 p-2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  </div>
                  <p className="mb-1 text-4xl font-bold text-gray-900">2</p>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    처리 대기 중
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>

              {/* 견학 승인 대기 */}
              <Link to="/admin/inquiries/tour" className="group">
                <div className="rounded-xl border border-amber-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-600">견학 승인 대기</p>
                    <div className="rounded-full bg-amber-50 p-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                  </div>
                  <p className="mb-1 text-4xl font-bold text-gray-900">1</p>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    승인 필요
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>

              {/* 신규 지원서 */}
              <Link to="/admin/applications" className="group">
                <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-600">신규 지원서</p>
                    <div className="rounded-full bg-blue-50 p-2">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                  <p className="mb-1 text-4xl font-bold text-gray-900">5</p>
                  <p className="flex items-center gap-1 text-sm text-gray-400">
                    검토 필요
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </Link>
            </div>

            {/* ── 방문 통계 (GA4) ── */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* 섹션 헤더 */}
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">방문 통계</h2>
                  {ga.isDemo && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                      데모 데이터
                    </span>
                  )}
                  {!ga.isDemo && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      <Radio className="h-2.5 w-2.5" />
                      실시간
                    </span>
                  )}
                </div>
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Analytics 열기
                </a>
              </div>
              <p className="mb-5 text-xs text-gray-400">실시간 웹사이트 방문 현황</p>

              {/* 통계 3종 */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* 실시간 접속자 — 초록 카드 */}
                <div className="relative overflow-hidden rounded-xl bg-emerald-500 p-5 text-white">
                  {/* 배경 장식 */}
                  <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                  <div className="absolute -bottom-6 -right-2 h-24 w-24 rounded-full bg-white/10" />
                  <p className="relative mb-2 text-xs font-medium text-emerald-100">실시간 접속자</p>
                  <p className="relative text-5xl font-bold">{ga.realtimeUsers}</p>
                  <p className="relative mt-2 text-xs text-emerald-100">현재 활성 사용자</p>
                </div>

                {/* 오늘 방문자 */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">오늘 방문자</p>
                    <ChangeChip value={ga.todayUsersChange} />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{ga.todayUsers.toLocaleString()}</p>
                  <p className="mt-2 text-xs text-gray-400">전일 대비</p>
                </div>

                {/* 이번주 방문자 */}
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">이번주 방문자</p>
                    <ChangeChip value={ga.weekUsersChange} />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{ga.weekUsers.toLocaleString()}</p>
                  <p className="mt-2 text-xs text-gray-400">전주 대비</p>
                </div>
              </div>
            </div>

            {/* ── 최근 활동 + 최근 고객 문의 ── */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

              {/* 최근 활동 */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-0.5 font-bold text-gray-900">최근 활동</h3>
                <p className="mb-5 text-xs text-gray-400">최근 업데이트된 콘텐츠</p>
                <p className="py-4 text-center text-sm text-gray-400">최근 활동 내역이 없습니다.</p>
              </div>

              {/* 최근 고객 문의 */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-0.5 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">최근 고객 문의</h3>
                  <Link
                    to="/admin/inquiries/consulting"
                    className="flex items-center gap-0.5 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    전체보기
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <p className="mb-5 text-xs text-gray-400">최신순 문의 현황</p>
                <p className="py-4 text-center text-sm text-gray-400">문의 내역이 없습니다.</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
