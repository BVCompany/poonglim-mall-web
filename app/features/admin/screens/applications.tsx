/**
 * Admin Job Applications Management Page
 * 
 * Allows admins to view and manage job applications.
 */

import { useState, useMemo } from "react";
import type { Route } from "./+types/applications";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { useTranslation } from "react-i18next";
import { Search, Eye, Trash2 } from "lucide-react";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { MOCK_JOB_APPLICATIONS } from "../data/careers";
import type { AdminJobApplication } from "../types/career.types";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  const { default: db } = await import("~/core/db/drizzle-client.server");
  const { jobApplications, jobPostings } = await import("~/features/careers/schema");
  const { desc } = await import("drizzle-orm");
  const dbApplications = await db
    .select({ app: jobApplications, job: jobPostings })
    .from(jobApplications)
    .leftJoin(jobPostings, (cols: any) => cols.app.job_id.eq(cols.job.job_id))
    .orderBy(desc(jobApplications.created_at))
    .catch(() => []);
  return { adminUser, dbApplications };
}

export default function AdminApplicationsPage({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [applications] = useState<AdminJobApplication[]>(MOCK_JOB_APPLICATIONS);

  // Real-time search filter
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;

    const query = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.applicantName.toLowerCase().includes(query) ||
        app.email.toLowerCase().includes(query) ||
        app.jobTitle.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: applications.length,
      reviewing: applications.filter((app) => app.status === "reviewing").length,
      accepted: applications.filter((app) => app.status === "accepted").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
  }, [applications]);

  const handleView = (id: string) => {
    console.log("View application:", id);
    // TODO: Navigate to detail page or open modal
  };

  const handleDelete = (id: string) => {
    console.log("Delete application:", id);
    // TODO: Show confirmation modal and delete
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
      <div className="mb-8 grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.applications.stats.total")}
          </div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.applications.stats.reviewing")}
          </div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {stats.reviewing}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.applications.stats.accepted")}
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {stats.accepted}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            {t("admin.applications.stats.rejected")}
          </div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {stats.rejected}
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.date")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.position")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.experience")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.education")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.status")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t("admin.applications.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {new Date(application.appliedAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {application.applicantName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {application.jobTitle}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {getExperienceLevelLabel(application.experienceLevel)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{getEducationLabel(application.education.level)}</div>
                    <div className="text-gray-500">{application.education.school}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {getStatusLabel(application.status)}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(application.id)}
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(application.id)}
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {t("admin.applications.noResults")}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchQuery
              ? t("admin.applications.noSearchResults")
              : t("admin.applications.noApplications")}
          </p>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}

