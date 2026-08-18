/**
 * Admin Dashboard Screen
 * GA4 방문 통계 + 업무 현황 대시보드
 */
import type { Route } from "./+types/dashboard";

import { count, desc, eq } from "drizzle-orm";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  ExternalLink,
  Radio,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router";

import { getAnalyticsData } from "~/features/analytics/queries.server";
import {
  getPendingContactCount,
  getRecentContacts,
} from "~/features/support/lib/queries.server";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { getPermissionLabel } from "../utils/permissions";
import { requireAdminAuth } from "../utils/auth.server";

const ACTION_LABEL: Record<string, string> = {
  create: "등록",
  update: "수정",
  delete: "삭제",
  complete: "처리완료",
  pending: "대기 전환",
  approve: "승인",
  reject: "거절",
  status: "상태 변경",
};

function toIso(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const analytics = await getAnalyticsData().catch(() => null);

  const recentInquiries = await getRecentContacts(6).catch(() => []);
  const pendingInquiryCount = await getPendingContactCount().catch(() => 0);

  const db = (await import("~/core/db/drizzle-client.server")).default;
  const { adminAuditLogs } = await import("../schema");
  const { factoryTourApplications } = await import("~/features/brand/schema");
  const { jobApplications } = await import("~/features/careers/schema");

  const recentAuditLogs = await db
    .select({
      audit_log_id: adminAuditLogs.audit_log_id,
      admin_name: adminAuditLogs.admin_name,
      menu: adminAuditLogs.menu,
      action: adminAuditLogs.action,
      target_id: adminAuditLogs.target_id,
      created_at: adminAuditLogs.created_at,
    })
    .from(adminAuditLogs)
    .orderBy(desc(adminAuditLogs.created_at))
    .limit(6)
    .catch(() => []);

  const [{ pendingTourCount }] = await db
    .select({ pendingTourCount: count() })
    .from(factoryTourApplications)
    .where(eq(factoryTourApplications.status, "pending"))
    .catch(() => [{ pendingTourCount: 0 }]);

  const [{ newApplicationCount }] = await db
    .select({ newApplicationCount: count() })
    .from(jobApplications)
    .where(eq(jobApplications.status, "submitted"))
    .catch(() => [{ newApplicationCount: 0 }]);

  return {
    adminUser,
    analytics,
    stats: {
      pendingInquiries: pendingInquiryCount,
      pendingTours: Number(pendingTourCount) || 0,
      newApplications: Number(newApplicationCount) || 0,
    },
    recentActivities: recentAuditLogs.map((log) => ({
      id: log.audit_log_id,
      menu: getPermissionLabel(log.menu),
      action: ACTION_LABEL[log.action] ?? log.action,
      adminName: log.admin_name,
      targetId: log.target_id,
      createdAt: toIso(log.created_at),
    })),
    recentInquiries: recentInquiries.map((item) => ({
      id: item.contact_id,
      title: item.title,
      name: item.name,
      inquiryType: item.inquiry_type,
      status: item.status,
      createdAt: toIso(item.created_at),
    })),
  };
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



function formatRelativeTime(iso: string) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "방금 전";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}일 전`;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const INQUIRY_STATUS_LABEL: Record<string, string> = {
  pending: "대기중",
  completed: "처리완료",
};
const INQUIRY_STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard({ loaderData }: Route.ComponentProps) {
  const { adminUser, analytics, stats, recentActivities, recentInquiries } =
    loaderData;
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
                  <p className="mb-1 text-4xl font-bold text-gray-900">{stats.pendingInquiries}</p>
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
                  <p className="mb-1 text-4xl font-bold text-gray-900">{stats.pendingTours}</p>
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
                  <p className="mb-1 text-4xl font-bold text-gray-900">{stats.newApplications}</p>
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
                {recentActivities.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">최근 활동 내역이 없습니다.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recentActivities.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.menu}
                            <span className="ml-1.5 font-normal text-gray-600">{item.action}</span>
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {item.adminName}
                            {item.targetId ? ` · #${item.targetId}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
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
                {recentInquiries.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">문의 내역이 없습니다.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recentInquiries.map((item) => (
                      <li key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {item.name} · {item.inquiryType}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              INQUIRY_STATUS_COLOR[item.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {INQUIRY_STATUS_LABEL[item.status] ?? item.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
