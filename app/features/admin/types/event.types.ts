/**
 * Admin Event/Notice Types
 * 
 * Type definitions for event and notice management in admin panel.
 */

/**
 * Event/Notice category types
 */
export type EventCategory = "event" | "notice" | "promotion" | "news";

/**
 * Event/Notice status
 */
export type EventStatus = "active" | "inactive" | "scheduled" | "ended" | "draft";

/**
 * Event/Notice badge types
 */
export type EventBadge = "hot" | "new" | "ending-soon" | "important";

/**
 * Admin Event/Notice interface
 */
export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  image: string;
  tags: string[];
  badge?: EventBadge;
  status: EventStatus;
  startDate: string;
  endDate?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Event/Notice form data
 */
export interface EventFormData {
  title: string;
  description: string;
  category: EventCategory;
  image: string;
  tags: string[];
  badge?: EventBadge;
  status: EventStatus;
  startDate: string;
  endDate?: string;
}

/**
 * Event/Notice filter options
 */
export interface EventFilters {
  category?: EventCategory;
  status?: EventStatus;
  search?: string;
  badge?: EventBadge;
}

