/**
 * Admin Job Applications Management Page
 * 
 * Allows admins to view and manage job applications.
 */

import { useState, useMemo } from "react";
import { useFetcher } from "react-router";
import type { Route } from "./+types/applications";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { useTranslation } from "react-i18next";
import { Search, Eye, Trash2, X, FileText, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Separator } from "~/core/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "~/core/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/core/components/ui/select";
import { MOCK_JOB_APPLICATIONS } from "../data/careers";
import type { AdminJobApplication } from "../types/career.types";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { jobApplications, jobPostings } = await import("~/features/careers/schema");
  const { desc, eq } = await import("drizzle-orm");
  const dbApplications = await db
    .select({ app: jobApplications, job: jobPostings })
    .from(jobApplications)
    .leftJoin(jobPostings, eq(jobApplications.job_id, jobPostings.job_id))
    .orderBy(desc(jobApplications.created_at))
    .catch(() => []);
  return { adminUser, dbApplications };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminAuth(request);
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { jobApplications } = await import("~/features/careers/schema");
  const { eq } = await import("drizzle-orm");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;
  const id = Number(fd.get("id"));

  if (intent === "status" && id) {
    const status = fd.get("status") as "submitted" | "reviewing" | "accepted" | "rejected";
    await db.update(jobApplications).set({ status }).where(eq(jobApplications.application_id, id));
  }
  if (intent === "delete" && id) {
    await db.delete(jobApplications).where(eq(jobApplications.application_id, id));
  }
  return { success: true };
}

type DbApp = { app: typeof import("~/features/careers/schema").jobApplications.$inferSelect; job: typeof import("~/features/careers/schema").jobPostings.$inferSelect | null };

export default function AdminApplicationsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbApplications } = loaderData;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<DbApp | null>(null);
  const fetcher = useFetcher();

  const filteredApplications = useMemo(() => {
    const list = dbApplications.length > 0 ? dbApplications : [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      ({ app, job }) =>
        app.applicant_name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        (job?.title ?? "").toLowerCase().includes(q)
    );
  }, [dbApplications, searchQuery]);

  const stats = useMemo(() => ({
    total: dbApplications.length,
    submitted: dbApplications.filter(({ app }) => app.status === "submitted").length,
    reviewing: dbApplications.filter(({ app }) => app.status === "reviewing").length,
    accepted: dbApplications.filter(({ app }) => app.status === "accepted").length,
    rejected: dbApplications.filter(({ app }) => app.status === "rejected").length,
  }), [dbApplications]);

  const handleStatusChange = (id: number, status: string) => {
    const fd = new FormData();
    fd.append("intent", "status");
    fd.append("id", String(id));
    fd.append("status", status);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleDelete = (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", String(id));
    fetcher.submit(fd, { method: "POST" });
    setSelectedApp(null);
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "reviewing":
        return "secondary";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "대기중";
      case "reviewing":
        return "서류검토중";
      case "accepted":
        return "합격";
      case "rejected":
        return "불합격";
      default:
        return status;
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case "entry":
        return "신입";
      case "experienced":
        return "경력";
      default:
        return level;
    }
  };

  const getEducationLabel = (level: string) => {
    switch (level) {
      case "high-school":
        return "고등학교 졸업";
      case "associate":
        return "전문대 졸업";
      case "bachelor":
        return "대학교 졸업";
      case "master":
        return "석사";
      case "doctorate":
        return "박사";
      default:
        return level;
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
            <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.applications.title")}
        </h1>
        <p className="mt-2 text-gray-600">
          {t("admin.applications.description")}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-600">전체</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-600">접수완료</div>
          <div className="mt-1 text-2xl font-bold text-gray-600">{stats.submitted}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-600">서류검토중</div>
          <div className="mt-1 text-2xl font-bold text-orange-600">{stats.reviewing}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-600">합격</div>
          <div className="mt-1 text-2xl font-bold text-green-600">{stats.accepted}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium text-gray-600">불합격</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{stats.rejected}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t("admin.applications.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">접수일</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">지원 공고</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">이메일</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">연락처</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">상태</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredApplications.map(({ app, job }) => (
                <tr key={app.application_id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {app.created_at.toLocaleDateString("ko-KR")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {app.applicant_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {job?.title ?? "-"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {app.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {app.phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge variant={getStatusBadgeVariant(app.status)}>
                      {getStatusLabel(app.status)}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedApp({ app, job })}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(app.application_id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">지원서가 없습니다</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery ? "검색 결과가 없습니다." : "접수된 지원서가 없습니다."}
          </p>
        </div>
      )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={(o) => !o && setSelectedApp(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>지원서 상세</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-5 mt-2">
              {/* 공고 정보 */}
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-xs text-gray-500 mb-1">지원 공고</p>
                <p className="font-semibold text-gray-900">{selectedApp.job?.title ?? "알 수 없음"}</p>
                {selectedApp.job && (
                  <p className="text-sm text-gray-500">{selectedApp.job.department} · {selectedApp.job.location}</p>
                )}
              </div>

              <Separator />

              {/* 지원자 정보 */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">지원자 정보</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{selectedApp.app.applicant_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{selectedApp.app.birth_date ?? "미입력"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedApp.app.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedApp.app.phone}</span>
                  </div>
                  {selectedApp.app.address && (
                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedApp.app.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedApp.app.cover_letter && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">지원 동기</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-3">
                      {selectedApp.app.cover_letter}
                    </p>
                  </div>
                </>
              )}

              {selectedApp.app.portfolio_url && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">포트폴리오</h3>
                    <a
                      href={selectedApp.app.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary underline"
                    >
                      {selectedApp.app.portfolio_url}
                    </a>
                  </div>
                </>
              )}

              <Separator />

              {/* 상태 변경 */}
              <div className="flex items-center gap-3">
                <p className="text-sm font-medium text-gray-700 flex-shrink-0">상태 변경:</p>
                <Select
                  value={selectedApp.app.status}
                  onValueChange={(v) => handleStatusChange(selectedApp.app.application_id, v)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">접수완료</SelectItem>
                    <SelectItem value="reviewing">서류검토중</SelectItem>
                    <SelectItem value="accepted">합격</SelectItem>
                    <SelectItem value="rejected">불합격</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedApp.app.application_id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedApp(null)} className="flex-1">
                  닫기
                </Button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                접수일시: {selectedApp.app.created_at.toLocaleString("ko-KR")}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

