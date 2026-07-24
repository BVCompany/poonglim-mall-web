/**
 * Admin Factory Tour Applications Management Page
 *
 * Allows admins to view and manage factory tour applications.
 */
import type { Route } from "./+types/inquiries-factory-tours";

import { CheckCircle, Eye, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Textarea } from "~/core/components/ui/textarea";
import {
  getFactoryTourSettings,
  upsertSetting,
} from "~/features/site-settings/lib/queries.server";
import { SETTING_KEYS } from "~/features/site-settings/schema";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.FACTORY_TOURS,
  );
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { factoryTourApplications } = await import("~/features/brand/schema");
  const { desc } = await import("drizzle-orm");
  const dbTours = await db
    .select()
    .from(factoryTourApplications)
    .orderBy(desc(factoryTourApplications.created_at))
    .catch(() => []);
  const tourSettings = await getFactoryTourSettings().catch(() => ({
    enabled: true,
    disabledMessage: "",
  }));
  return { adminUser, dbTours, tourSettings };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.FACTORY_TOURS, "factory_tours");
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { factoryTourApplications } = await import("~/features/brand/schema");
  const { eq } = await import("drizzle-orm");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "saveTourSettings") {
    const enabled = fd.get("enabled") === "true";
    const disabledMessage = (fd.get("disabledMessage") as string) ?? "";
    await upsertSetting(
      SETTING_KEYS.FACTORY_TOUR_ENABLED,
      enabled ? "true" : "false",
    );
    await upsertSetting(
      SETTING_KEYS.FACTORY_TOUR_DISABLED_MESSAGE,
      disabledMessage,
    );
    return { success: true };
  }

  const id = Number(fd.get("id"));
  if (intent === "approve" && id)
    await db
      .update(factoryTourApplications)
      .set({ status: "approved" })
      .where(eq(factoryTourApplications.tour_id, id));
  if (intent === "reject" && id)
    await db
      .update(factoryTourApplications)
      .set({ status: "rejected" })
      .where(eq(factoryTourApplications.tour_id, id));
  if (intent === "delete" && id)
    await db
      .delete(factoryTourApplications)
      .where(eq(factoryTourApplications.tour_id, id));
  return { success: true };
}

interface TourApplication {
  id: string;
  applicantName: string;
  organization: string | null;
  phone: string;
  participants: number;
  purpose: string;
  message: string | null;
  requestedDate: string;
  appliedDate: string;
  status: "승인대기" | "승인완료" | "거절";
}

export default function AdminFactoryToursPage({
  loaderData,
}: Route.ComponentProps) {
  const { adminUser, dbTours, tourSettings } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [tourEnabled, setTourEnabled] = useState(tourSettings.enabled);
  const [disabledMessage, setDisabledMessage] = useState(
    tourSettings.disabledMessage ?? "",
  );
  const fetcher = useFetcher();
  const settingsFetcher = useFetcher<{ success?: boolean }>();
  const savingSettings = settingsFetcher.state !== "idle";

  const handleSaveSettings = (nextEnabled?: boolean) => {
    const enabled = nextEnabled ?? tourEnabled;
    const fd = new FormData();
    fd.append("intent", "saveTourSettings");
    fd.append("enabled", String(enabled));
    fd.append("disabledMessage", disabledMessage);
    settingsFetcher.submit(fd, { method: "POST" });
  };

  const applications: TourApplication[] =
    dbTours.length > 0
      ? dbTours.map((t) => ({
          id: String(t.tour_id),
          applicantName: t.applicant_name,
          organization: t.organization ?? null,
          phone: t.phone,
          participants: t.participants,
          purpose: t.purpose,
          message: t.message ?? null,
          requestedDate: new Date(t.requested_date).toLocaleString("ko-KR"),
          appliedDate: t.created_at.toLocaleString("ko-KR"),
          status: (t.status === "approved"
            ? "승인완료"
            : t.status === "rejected"
              ? "거절"
              : "승인대기") as TourApplication["status"],
        }))
      : [];

  const filteredApplications = applications.filter(
    (app) =>
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery) ||
      app.purpose.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusBadge = (status: TourApplication["status"]) => {
    const statusConfig = {
      승인대기: { className: "bg-orange-500 text-white", label: "승인대기" },
      승인완료: { className: "bg-[#204E3A] text-white", label: "승인완료" },
      거절: { className: "bg-red-500 text-white", label: "거절" },
    };
    return statusConfig[status];
  };

  const handleView = (id: string) => {
    console.log("View application:", id);
    alert(`견학 신청 상세보기: ${id}`);
  };

  const handleApprove = (id: string) => {
    const fd = new FormData();
    fd.append("intent", "approve");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  const handleReject = (id: string) => {
    const fd = new FormData();
    fd.append("intent", "reject");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar adminUser={adminUser} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <AdminNavbar />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                견학 신청 관리
              </h1>
              <p className="text-gray-600">
                공장 견학 신청을 확인하고 승인하세요
              </p>
            </div>

            {/* 견학 신청 접수 on/off 설정 */}
            <Card className="mb-6 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    견학 신청서 접수
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    공장 견학 운영 시기에 맞춰 신청서 작성을 켜고 끌 수
                    있습니다. 꺼두면 견학 페이지의 신청 섹션이 흐리게 처리되고
                    안내 문구가 표시됩니다.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={tourEnabled}
                  onClick={() => {
                    const next = !tourEnabled;
                    setTourEnabled(next);
                    handleSaveSettings(next);
                  }}
                  disabled={savingSettings}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                    tourEnabled ? "bg-[#204E3A]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      tourEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-600">현재 상태:</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    tourEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tourEnabled ? "신청 접수 중" : "신청 중지 (안내 문구 노출)"}
                </span>
              </div>

              {/* 비활성 시 안내 문구 */}
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  신청 중지 시 안내 문구
                  <span className="ml-1.5 text-xs font-normal text-gray-400">
                    (비우면 기본 문구가 표시됩니다)
                  </span>
                </label>
                <Textarea
                  value={disabledMessage}
                  onChange={(e) => setDisabledMessage(e.target.value)}
                  rows={3}
                  placeholder={
                    "예: 현재 공장 견학 신청을 받지 않습니다.\n다음 견학 일정은 추후 공지 예정입니다. 문의: 043-533-2285"
                  }
                />
                <div className="mt-3 flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    disabled={savingSettings}
                    className="bg-[#204E3A] hover:bg-[#1a3f2e]"
                  >
                    {savingSettings ? "저장 중..." : "안내 문구 저장"}
                  </Button>
                  {settingsFetcher.data?.success && !savingSettings && (
                    <span className="text-sm text-green-600">
                      저장되었습니다.
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="mb-1 text-xl font-bold text-gray-900">
                          {app.purpose.split(" ")[0]}
                        </h3>
                        <p className="text-sm text-gray-500">
                          신청일시: {app.appliedDate} · 방문 예정:{" "}
                          {app.requestedDate}
                        </p>
                      </div>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </div>

                    <div className="mb-4 grid grid-cols-4 gap-4">
                      <div>
                        <p className="mb-1 text-sm text-gray-600">담당자명</p>
                        <p className="font-medium text-gray-900">
                          {app.applicantName}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-600">단체명</p>
                        <p className="font-medium text-gray-900">
                          {app.organization ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-600">연락처</p>
                        <p className="font-medium text-gray-900">{app.phone}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm text-gray-600">방문 인원</p>
                        <p className="font-medium text-gray-900">
                          {app.participants}명
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="mb-1 text-sm text-gray-600">신청 내용</p>
                      <p className="font-medium text-gray-900">{app.purpose}</p>
                    </div>
                    {app.message && (
                      <div className="mb-4 rounded-lg bg-gray-50 px-4 py-3">
                        <p className="mb-1 text-sm text-gray-600">문의사항</p>
                        <p className="text-sm text-gray-800">{app.message}</p>
                      </div>
                    )}

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
              <div className="py-12 text-center">
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
