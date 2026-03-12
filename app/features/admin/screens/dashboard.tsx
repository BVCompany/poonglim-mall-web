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

// ─── 목 데이터 ────────────────────────────────────────────────────────────────
const MOCK_ACTIVITIES = [
  { title: "신규 채용 지원서 접수",    desc: "생산직 - 김민수 지원서",          time: "30분 전" },
  { title: "제품 정보 업데이트",        desc: "짜먹는 에그샐러드 1kg - 가격 수정", time: "2시간 전" },
  { title: "이벤트 등록",              desc: "설 맞이 특별 프로모션",            time: "5시간 전" },
  { title: "레시피 추가",              desc: "액란을 활용한 스크램블 에그",       time: "1일 전" },
];

const MOCK_INQUIRIES = [
  { title: "대량 구매 문의 - 에그샐러드 500개", cat: "B2B 문의",  time: "10분 전",  status: "미답변" },
  { title: "제품 유통기한 관련 질문",            cat: "제품 문의", time: "1시간 전", status: "미답변" },
  { title: "공장 견학 신청 - 서울 A초등학교",    cat: "견학 신청", time: "2시간 전", status: "처리중" },
  { title: "액란 제품 납품 가능 여부",           cat: "구매 문의", time: "5시간 전", status: "답변완료" },
];

const STATUS_STYLE: Record<string, string> = {
  미답변: "bg-red-100 text-red-600",
  처리중: "bg-amber-100 text-amber-600",
  답변완료: "bg-emerald-100 text-emerald-600",
};

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
                <div className="divide-y divide-gray-50">
                  {MOCK_ACTIVITIES.map((a, i) => (
                    <div key={i} className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{a.title}</p>
                        <p className="truncate text-xs text-gray-400">{a.desc}</p>
                      </div>
                      <span className="ml-4 shrink-0 text-xs text-gray-400">{a.time}</span>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-1">
                  {MOCK_INQUIRIES.map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-gray-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{q.title}</p>
                        <p className="text-xs text-gray-400">
                          {q.cat} · {q.time}
                        </p>
                      </div>
                      <span
                        className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[q.status] ?? "bg-gray-100 text-gray-500"}`}
                      >
                        {q.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
