import { Link, data } from "react-router";
import type { Route } from "./+types/detail";
import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Separator } from "~/core/components/ui/separator";
import { ArrowLeft, Calendar, Eye, Tag } from "lucide-react";
import { getEventById } from "../lib/queries.server";

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  const event = await getEventById(id).catch(() => null);
  if (!event || !event.is_active) throw data("Not Found", { status: 404 });

  return { event };
}

const BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  hot:          { label: "HOT",   className: "bg-red-100 text-red-700" },
  new:          { label: "NEW",   className: "bg-blue-100 text-blue-700" },
  ending_soon:  { label: "마감임박", className: "bg-orange-100 text-orange-700" },
  important:    { label: "중요",   className: "bg-purple-100 text-purple-700" },
};

const TYPE_LABEL: Record<string, string> = {
  event: "이벤트", notice: "공지사항",
};

export default function EventDetailScreen({ loaderData }: Route.ComponentProps) {
  const { event } = loaderData;

  const badge = event.badge ? BADGE_CONFIG[event.badge] : null;
  const dateStr = new Date(event.created_at).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric",
  });
  const startStr = event.started_at
    ? new Date(event.started_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : null;
  const endStr = event.ended_at
    ? new Date(event.ended_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Back */}
        <Link
          to="/event"
          className="mb-6 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          이벤트/공지 목록으로
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline">{TYPE_LABEL[event.type] ?? event.type}</Badge>
            {badge && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
                {badge.label}
              </span>
            )}
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl leading-tight">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>등록일 {dateStr}</span>
            </div>
            {event.view_count && (
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>조회 {event.view_count}</span>
              </div>
            )}
          </div>

          {(startStr || endStr) && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-3 py-2 text-sm">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">
                {startStr && endStr
                  ? `${startStr} ~ ${endStr}`
                  : startStr
                  ? `${startStr}~`
                  : `~${endStr}`}
              </span>
            </div>
          )}
        </div>

        <Separator className="mb-8" />

        {/* Thumbnail */}
        {event.thumbnail_url && (
          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={event.thumbnail_url}
              alt={event.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Summary */}
        {event.summary && (
          <p className="mb-6 rounded-lg bg-muted/40 px-5 py-4 text-muted-foreground leading-relaxed">
            {event.summary}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-gray max-w-none">
          <div className="whitespace-pre-line leading-relaxed text-gray-700">
            {event.content}
          </div>
        </div>

        <Separator className="my-10" />

        {/* Footer nav */}
        <div className="flex justify-between">
          <Link to="/event">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
