/**
 * Admin Events/Notices Management Screen
 * 
 * Event and notice management page for admin panel.
 * Allows viewing, searching, editing, and deleting events/notices.
 */

import { useState } from "react";
import type { Route } from "./+types/events";
import { requireAdminAuth } from "../utils/auth.server";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminSidebar } from "../components/admin-sidebar";
import { EventAddModal, type EventFormData } from "../components/event-add-modal";
import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Badge } from "~/core/components/ui/badge";
import { Card } from "~/core/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import { MOCK_EVENTS } from "../data/events";
import type { AdminEvent } from "../types/event.types";

/**
 * Loader: Require admin authentication
 */
export async function loader({ request }: Route.LoaderArgs) {
  const adminUser = await requireAdminAuth(request);
  return { adminUser };
}

/**
 * Get badge color based on badge type
 */
function getBadgeVariant(badge?: AdminEvent["badge"]) {
  switch (badge) {
    case "hot":
      return "destructive";
    case "new":
      return "default";
    case "ending-soon":
      return "secondary";
    case "important":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Get badge label in Korean
 */
function getBadgeLabel(badge?: AdminEvent["badge"]) {
  switch (badge) {
    case "hot":
      return "HOT";
    case "new":
      return "NEW";
    case "ending-soon":
      return "마감임박";
    case "important":
      return "중요";
    default:
      return "";
  }
}

/**
 * Format date to Korean format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Admin Events/Notices Component
 */
export default function AdminEvents({ loaderData }: Route.ComponentProps) {
  const { adminUser } = loaderData;
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter events based on search query
  const filteredEvents = MOCK_EVENTS.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEvent = (eventData: EventFormData) => {
    // TODO: Add event to database
    console.log("Add event:", eventData);
    // For now, just log the data
    alert(`이벤트/공지가 추가되었습니다: ${eventData.title}`);
  };

  const handleEdit = (eventId: string) => {
    // TODO: Navigate to edit page
    console.log("Edit event:", eventId);
  };

  const handleDelete = (eventId: string) => {
    // TODO: Show confirmation dialog and delete
    console.log("Delete event:", eventId);
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
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                이벤트/공지 관리
              </h1>
              <p className="text-gray-600">
                이벤트와 공지사항을 추가, 수정, 삭제할 수 있습니다
              </p>
            </div>
            <Button 
              className="gap-2 bg-[#204E3A] hover:bg-[#1a3f2e]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              이벤트/공지 추가
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="제목으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </Card>
            ) : (
              filteredEvents.map((event) => (
                <Card key={event.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    {/* Event Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      {/* Title & Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.title}
                        </h3>
                        {event.badge && (
                          <Badge
                            variant={getBadgeVariant(event.badge)}
                            className="text-xs"
                          >
                            {getBadgeLabel(event.badge)}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>

                      {/* Date */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-700">
                          시작일: {formatDate(event.startDate)}
                        </span>
                        {event.endDate && (
                          <>
                            <span className="text-gray-400">~</span>
                            <span className="text-sm text-gray-700">
                              종료일: {formatDate(event.endDate)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs text-gray-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Results Count */}
          {filteredEvents.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              총 {filteredEvents.length}개의 이벤트/공지
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Add Event Modal */}
      <EventAddModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddEvent}
      />
    </div>
  );
}

