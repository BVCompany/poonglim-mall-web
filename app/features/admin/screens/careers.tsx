/**
 * Admin Job Postings Management Page
 * 
 * Allows admins to manage job postings (view, create, edit, delete).
 */

import { useState, useMemo } from "react";
import type { Route } from "./+types/careers";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { JobAddModal, type JobFormData } from "../components/job-add-modal";
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Briefcase, 
  MapPin, 
  Calendar,
  Users
} from "lucide-react";
import { Input } from "~/core/components/ui/input";
import { Button } from "~/core/components/ui/button";
import { Badge } from "~/core/components/ui/badge";
import { MOCK_JOB_POSTINGS } from "../data/careers";
import type { AdminJobPosting } from "../types/career.types";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

export default function AdminCareersPage({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [jobPostings] = useState<AdminJobPosting[]>(MOCK_JOB_POSTINGS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Real-time search filter
  const filteredJobPostings = useMemo(() => {
    if (!searchQuery.trim()) return jobPostings;

    const query = searchQuery.toLowerCase();
    return jobPostings.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.department.toLowerCase().includes(query)
    );
  }, [jobPostings, searchQuery]);

  const handleAddJob = (jobData: JobFormData) => {
    // TODO: Add job to database
    console.log("Add job:", jobData);
    alert(`채용 공고가 추가되었습니다: ${jobData.title}`);
  };

  const handleEdit = (id: string) => {
    console.log("Edit job posting:", id);
    // TODO: Navigate to edit page or open modal
  };

  const handleDelete = (id: string) => {
    console.log("Delete job posting:", id);
    // TODO: Show confirmation modal and delete
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
        return "계약직";
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

      <div className="flex flex-col flex-1 overflow-hidden">
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
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.careers.addJob")}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
            <p className="mb-4 text-sm text-gray-600">{job.description}</p>

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
                <span>{getExperienceLevelLabel(job.experienceLevel)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{getJobTypeLabel(job.jobType)}</span>
              </div>
            </div>

            {/* Deadline */}
            <div className="text-sm">
              <span className="text-red-600 font-medium">
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
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddJob}
      />
    </div>
  );
}

