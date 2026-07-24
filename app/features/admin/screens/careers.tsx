/**
 * Admin Job Postings Management Page
 *
 * Allows admins to manage job postings (view, create, edit, delete).
 */
import type { AdminJobPosting } from "../types/career.types";
import type { Route } from "./+types/careers";

import { eq } from "drizzle-orm";
import {
  Briefcase,
  Calendar,
  Edit,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import db from "~/core/db/drizzle-client.server";
import type { JobPosting } from "~/features/careers/lib/queries.server";
import { getAllJobPostingsForAdmin } from "~/features/careers/lib/queries.server";
import { jobPostings } from "~/features/careers/schema";

import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { JobAddModal, type JobFormData } from "../components/job-add-modal";
import { ADMIN_PERMISSIONS } from "../types/auth.types";
import { requireAdminMutation, requireAdminPermission } from "../utils/auth.server";

export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminPermission(
    request,
    ADMIN_PERMISSIONS.CAREERS,
  );
  const dbJobs = await getAllJobPostingsForAdmin().catch(() => []);
  return { adminUser, dbJobs };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdminMutation(request, ADMIN_PERMISSIONS.CAREERS, "careers");
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  const JOB_TYPE_MAP: Record<
    string,
    "full_time" | "part_time" | "contract" | "intern"
  > = {
    정규직: "full_time",
    파트타임: "part_time",
    계약직: "contract",
    인턴: "intern",
  };
  const EXP_MAP: Record<string, "entry" | "experienced" | "senior" | "all"> = {
    신입: "entry",
    경력: "experienced",
    시니어: "senior",
    "신입/경력": "all",
  };

  const formToJobStatus = (s: string): "open" | "closed" | "draft" => {
    if (s === "모집중") return "open";
    if (s === "임시저장") return "draft";
    return "closed";
  };

  if (intent === "create") {
    await db.insert(jobPostings).values({
      title: ((fd.get("position") as string) || "").trim() || "미정",
      department: ((fd.get("title") as string) || "").trim() || "미정",
      location: (fd.get("location") as string) || "미정",
      job_type: JOB_TYPE_MAP[fd.get("employmentType") as string] ?? "full_time",
      experience_level: EXP_MAP[fd.get("experience") as string] ?? "all",
      description: fd.get("description") as string,
      requirements: (fd.get("qualifications") as string) || null,
      benefits: (fd.get("benefits") as string) || null,
      hiring_process:
        ((fd.get("hiringProcess") as string) || "").trim() || null,
      status: formToJobStatus(String(fd.get("status") ?? "")),
      deadline: fd.get("deadline")
        ? new Date(fd.get("deadline") as string)
        : null,
      is_active: true,
    });
    return { success: true };
  }

  if (intent === "update") {
    const id = Number(fd.get("id"));
    if (!id) return { success: false };
    await db
      .update(jobPostings)
      .set({
        title: ((fd.get("position") as string) || "").trim() || "미정",
        department: ((fd.get("title") as string) || "").trim() || "미정",
        location: (fd.get("location") as string) || "미정",
        job_type:
          JOB_TYPE_MAP[fd.get("employmentType") as string] ?? "full_time",
        experience_level: EXP_MAP[fd.get("experience") as string] ?? "all",
        description: fd.get("description") as string,
        requirements: (fd.get("qualifications") as string) || null,
        benefits: (fd.get("benefits") as string) || null,
        hiring_process:
          ((fd.get("hiringProcess") as string) || "").trim() || null,
        status: formToJobStatus(String(fd.get("status") ?? "")),
        deadline: fd.get("deadline")
          ? new Date(fd.get("deadline") as string)
          : null,
      })
      .where(eq(jobPostings.job_id, id));
    return { success: true };
  }

  if (intent === "delete") {
    const id = Number(fd.get("id"));
    if (id) await db.delete(jobPostings).where(eq(jobPostings.job_id, id));
    return { success: true };
  }

  return { success: false };
}

const JOB_TYPE_LABEL: Record<string, string> = {
  full_time: "정규직",
  part_time: "파트타임",
  contract: "계약직",
  intern: "인턴",
};
const EXP_LABEL: Record<string, string> = {
  entry: "신입",
  experienced: "경력",
  senior: "시니어",
  all: "신입/경력",
};

export default function AdminCareersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser, dbJobs } = loaderData;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const fetcher = useFetcher();

  const JOB_TYPE_INV: Record<string, string> = {
    full_time: "정규직",
    part_time: "파트타임",
    contract: "계약직",
    intern: "인턴",
  };
  const EXP_INV: Record<string, string> = {
    entry: "신입",
    experienced: "경력",
    senior: "시니어",
    all: "신입/경력",
  };

  const statusToForm = (s: JobPosting["status"]): string => {
    if (s === "open") return "모집중";
    if (s === "draft") return "임시저장";
    return "마감";
  };

  const editJobInitial = useMemo((): JobFormData | null => {
    if (!editingJob) return null;
    const j = editingJob;
    return {
      jobId: j.job_id,
      position: j.title,
      title: j.department,
      employmentType: JOB_TYPE_INV[j.job_type] ?? "정규직",
      location: j.location,
      experience: EXP_INV[j.experience_level] ?? "신입/경력",
      status: statusToForm(j.status),
      deadline: j.deadline
        ? new Date(j.deadline).toISOString().slice(0, 10)
        : "",
      description: j.description,
      qualifications: j.requirements ?? "",
      benefits: j.benefits ?? "",
      hiringProcess: j.hiring_process ?? "",
    };
  }, [editingJob]);

  const JOB_TYPE_MAP: Record<string, AdminJobPosting["jobType"]> = {
    full_time: "full-time",
    part_time: "part-time",
    contract: "contract",
    intern: "intern",
  };
  const EXP_MAP2: Record<string, AdminJobPosting["experienceLevel"]> = {
    entry: "entry",
    experienced: "experienced",
    senior: "senior",
    all: "all",
  };
  const sourceJobs: AdminJobPosting[] =
    dbJobs.length > 0
      ? dbJobs.map((j) => ({
          id: String(j.job_id),
          title: j.title,
          department: j.department,
          location: j.location,
          jobType: JOB_TYPE_MAP[j.job_type] ?? "full-time",
          experienceLevel: EXP_MAP2[j.experience_level] ?? "all",
          description: j.description,
          status:
            j.status === "open"
              ? "open"
              : j.status === "draft"
                ? "draft"
                : "closed",
          deadline: j.deadline
            ? new Date(j.deadline).toISOString().slice(0, 10)
            : "",
          created_at: j.created_at.toISOString(),
          updated_at: j.updated_at.toISOString(),
        }))
      : [];

  const filteredJobPostings = useMemo(() => {
    if (!searchQuery.trim()) return sourceJobs;
    const query = searchQuery.toLowerCase();
    return sourceJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query),
    );
  }, [sourceJobs, searchQuery]);

  const handleJobSubmit = (jobData: JobFormData) => {
    const fd = new FormData();
    if (jobData.jobId != null) {
      fd.append("intent", "update");
      fd.append("id", String(jobData.jobId));
    } else {
      fd.append("intent", "create");
    }
    const { jobId: _jid, ...fields } = jobData;
    Object.entries(fields).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    fetcher.submit(fd, { method: "POST" });
  };

  const handleEdit = (id: string) => {
    const row = dbJobs.find((j) => String(j.job_id) === id);
    if (row) {
      setIsAddModalOpen(false);
      setEditingJob(row);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const fd = new FormData();
    fd.append("intent", "delete");
    fd.append("id", id);
    fetcher.submit(fd, { method: "POST" });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "closed":
        return "secondary";
      case "draft":
        return "outline";
      default:
        return "default";
    }
  };

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case "entry":
        return "신입";
      case "experienced":
        return "경력";
      case "senior":
        return "시니어";
      case "all":
        return "신입/경력";
      default:
        return level;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "full-time":
        return "정규직";
      case "part-time":
        return "파트타임";
      case "contract":
        return "계약직";
      case "intern":
        return "인턴";
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "모집중";
      case "closed":
        return "마감";
      case "draft":
        return "임시저장";
      default:
        return status;
    }
  };

  const isDeadlineNear = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Within 7 days
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("admin.careers.title")}
                </h1>
                <p className="mt-2 text-gray-600">
                  {t("admin.careers.description")}
                </p>
              </div>
              <Button
                className="bg-[#204E3A] hover:bg-[#1a3f2e]"
                onClick={() => {
                  setEditingJob(null);
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("admin.careers.addJob")}
              </Button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t("admin.careers.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Job Postings List */}
            <div className="space-y-4">
              {filteredJobPostings.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Header with Title, Badge, and Actions */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      <Badge
                        className={`${
                          job.status === "open"
                            ? "bg-[#204E3A] text-white hover:bg-[#1a3f2e]"
                            : "bg-gray-500 text-white hover:bg-gray-600"
                        }`}
                      >
                        {getStatusLabel(job.status)}
                      </Badge>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(job.id)}
                        className="h-8 w-8 text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(job.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mb-4 text-sm text-gray-600">
                    {job.description}
                  </p>

                  {/* Job Details - Single Line */}
                  <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {getExperienceLevelLabel(job.experienceLevel)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{getJobTypeLabel(job.jobType)}</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="text-sm">
                    <span className="font-medium text-red-600">
                      마감: {job.deadline}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredJobPostings.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {t("admin.careers.noResults")}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchQuery
                    ? t("admin.careers.noSearchResults")
                    : t("admin.careers.noJobPostings")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Job Modal */}
      <JobAddModal
        open={isAddModalOpen || editingJob != null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setEditingJob(null);
          }
        }}
        mode={editingJob ? "edit" : "create"}
        initial={editJobInitial}
        onSubmit={handleJobSubmit}
      />
    </div>
  );
}
