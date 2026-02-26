/**
 * Admin Career Types
 * 
 * Type definitions for career/job posting and application management in admin panel.
 */

/**
 * Job posting status
 */
export type JobStatus = "open" | "closed" | "draft";

/**
 * Job type
 */
export type JobType = "full-time" | "part-time" | "contract" | "intern";

/**
 * Experience level
 */
export type ExperienceLevel = "entry" | "experienced" | "senior" | "all";

/**
 * Admin Job Posting interface
 */
export interface AdminJobPosting {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  deadline: string;
  status: JobStatus;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Application status
 */
export type ApplicationStatus = "pending" | "reviewing" | "accepted" | "rejected";

/**
 * Education level
 */
export type EducationLevel = "high-school" | "associate" | "bachelor" | "master" | "doctorate";

/**
 * Admin Job Application interface
 */
export interface AdminJobApplication {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  experienceLevel: "entry" | "experienced";
  education: {
    level: EducationLevel;
    school: string;
    major?: string;
    graduationYear?: string;
  };
  resume?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  reviewedAt?: string;
  notes?: string;
}

/**
 * Job posting form data
 */
export interface JobPostingFormData {
  title: string;
  description: string;
  department: string;
  location: string;
  experienceLevel: ExperienceLevel;
  jobType: JobType;
  deadline: string;
  status: JobStatus;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
}

/**
 * Application filters
 */
export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobPostingId?: string;
  search?: string;
}

