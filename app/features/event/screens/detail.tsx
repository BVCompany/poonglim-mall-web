/**
 * 이벤트 상세 페이지
 */
import type { Route } from "./+types/detail";

import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Headphones,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import { Link, data } from "react-router";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { cn } from "~/core/lib/utils";

import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import {
  getAdjacentEvents,
  getEventById,
  hasAnyActiveEvents,
} from "../lib/queries.server";
import type { Event } from "../lib/queries.server";

/* ── 더미 데이터 ── */
const MOCK_MAP: Record<
  number,
  {
    event_id: number;
    title: string;
    content: string;
    badge: string | null;
    thumbnail_url: string | null;
    started_at: Date | null;
    ended_at: Date | null;
    created_at: Date;
    view_count: string;
    location?: string;
    contact?: string;
  }
> = {
  2: {
    event_id: 2,
    title: "월간 레시피 콘테스트",
    content: "풍림푸드 제품을 활용한 레시피를 공모합니다.",
    badge: "new",
    thumbnail_url: null,
    started_at: new Date("2026-04-01"),
    ended_at: new Date("2026-04-30"),
    created_at: new Date("2026-03-01T10:00:00"),
    view_count: "342",
    location: "온라인",
    contact: "고객센터 080-299-9292",
  },
  3: {
    event_id: 3,
    title: "강남 팝업스토어 오픈",
    content: `팝업스토어 소개\n풍림푸드의 다양한 제품을 직접 보고, 맛보고, 구매할 수 있는 팝업스토어가 서울 강남 가로수길에 오픈합니다.\n\n운영 시간\n매일 오전 11시 ~ 오후 9시 (연중무휴)\n\n체험 프로그램\n신제품 시식 코너\n액란 활용 쿠킹 클래스 (사전 예약 필수)\n포토존 및 SNS 이벤트\n현장 구매 특별 할인\n\n오시는 길\n서울 강남구 가로수길 12-3 1층 (신사역 8번 출구 도보 5분)`,
    badge: null,
    thumbnail_url: null,
    started_at: new Date("2026-06-01"),
    ended_at: new Date("2026-06-30"),
    created_at: new Date("2026-02-18T14:44:00"),
    view_count: "890",
    location: "서울 강남구 가로수길",
    contact: "팝업스토어 문의 02-1234-5678",
  },
  4: {
    event_id: 4,
    title: "신제품 출시 기념 할인 이벤트",
    content: `프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.\n\n행사 기간: 2024년 12월 1일 ~ 12월 31일\n\n참여 방법\n1. 풍림푸드 공식 홈페이지 접속\n2. 이벤트 페이지에서 쿠폰 다운로드\n3. 구매 시 쿠폰 적용\n\n혜택\n최대 30% 할인\n무료배송\n사은품 증정 (선착순 500명)`,
    badge: "hot",
    thumbnail_url: null,
    started_at: new Date("2024-12-01"),
    ended_at: new Date("2024-12-31"),
    created_at: new Date("2026-01-15T10:00:00"),
    view_count: "1250",
    location: "온라인",
    contact: "이벤트 문의 080-299-9292",
  },
};

const MOCK_ADJACENT: Record<
  number,
  {
    prev: { event_id: number; title: string } | null;
    next: { event_id: number; title: string } | null;
  }
> = {
  /* created_at desc 가정: 월간(2) > 강남(3) > 신제품(4) */
  2: {
    prev: { event_id: 3, title: "강남 팝업스토어 오픈" },
    next: null,
  },
  3: {
    prev: { event_id: 4, title: "신제품 출시 기념 할인 이벤트" },
    next: { event_id: 2, title: "월간 레시피 콘테스트" },
  },
  4: {
    prev: null,
    next: { event_id: 3, title: "강남 팝업스토어 오픈" },
  },
};

const BADGE_LABEL: Record<string, string> = {
  hot: "HOT",
  new: "NEW",
  ending_soon: "마감임박",
  important: "중요",
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  await getPageBanner("event").catch(() => null);

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveEvents();
  } catch {
    hasReal = false;
  }

  let event: Event | null = null;
  let prev: { event_id: number; title: string } | null = null;
  let next: { event_id: number; title: string } | null = null;

  try {
    const row = await getEventById(id);
    if (row?.is_active) {
      event = row;
      const adjacent = await getAdjacentEvents(id);
      prev = adjacent.prev;
      next = adjacent.next;
    }
  } catch {
    /* DB 오류 시 아래에서 목업 또는 404 */
  }

  if (!event) {
    if (hasReal) throw data("Not Found", { status: 404 });
    const mock = MOCK_MAP[id];
    if (!mock) throw data("Not Found", { status: 404 });
    event = mock as unknown as Event;
    prev = MOCK_ADJACENT[id]?.prev ?? null;
    next = MOCK_ADJACENT[id]?.next ?? null;
  }

  return { event, prev, next, id };
}

export function meta({ data: d }: Route.MetaArgs) {
  const title =
    (d as { event?: { title: string } } | null)?.event?.title ?? "이벤트 상세";
  return [{ title: `${title} | 풍림푸드` }];
}

function formatDateTime(val: string | Date) {
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatDate(val: Date | null) {
  if (!val) return "";
  const d = new Date(val);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getEventStatus(started_at: Date | null, ended_at: Date | null) {
  const now = new Date();
  if (ended_at && new Date(ended_at) < now) return "종료";
  if (started_at && new Date(started_at) > now) return "예정";
  return "진행중";
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  진행중: { bg: "#02633E", color: "#fff" },
  예정: { bg: "#C9A84C", color: "#fff" },
  종료: { bg: "#AAAAAA", color: "#fff" },
};

/** 모바일 시안 — 목록 카드와 동일 색상 */
function StatusBadge({ status }: { status: "진행중" | "예정" | "종료" }) {
  if (status === "진행중") {
    return (
      <span
        className="inline-flex rounded-full px-3 py-1.5 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
        style={{ backgroundColor: "#32AF32", lineHeight: "12px" }}
      >
        진행중
      </span>
    );
  }
  if (status === "예정") {
    return (
      <span
        className="inline-flex rounded-full px-3 py-1.5 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
        style={{ backgroundColor: "#F3BC1E", lineHeight: "12px" }}
      >
        예정
      </span>
    );
  }
  return (
    <span
      className="inline-flex rounded-full px-3 py-1.5 text-[10px] font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
      style={{ backgroundColor: "#003F2B", lineHeight: "10px" }}
    >
      종료
    </span>
  );
}

const nanum = "font-[family-name:var(--font-nanum)]";

export default function EventDetailScreen({
  loaderData,
}: Route.ComponentProps) {
  const { event, prev, next } = loaderData;

  const status = getEventStatus(
    event.started_at ? new Date(event.started_at) : null,
    event.ended_at ? new Date(event.ended_at) : null,
  );
  const statusStyle = STATUS_STYLE[status];
  const badgeLabel = event.badge ? BADGE_LABEL[event.badge] : null;

  const periodStr = (() => {
    const s = formatDate(event.started_at ? new Date(event.started_at) : null);
    const e = formatDate(event.ended_at ? new Date(event.ended_at) : null);
    if (s && e) return `${s} ~ ${e}`;
    if (s) return `${s} ~`;
    if (e) return `~ ${e}`;
    return null;
  })();

  const location = event.location?.trim() ? event.location : null;
  const contact = event.contact?.trim() ? event.contact : null;

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    if (navigator.share) {
      void navigator.share({ title: event.title, url });
    } else {
      void navigator.clipboard?.writeText(url);
    }
  };

  const bodyIsHtml = event.content.trim().startsWith("<");

  const infoIconClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#003F2B]";

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
      <div className="hidden md:block">
        <Breadcrumb
          items={[
            { label: "홍보센터", href: "/event" },
            { label: "이벤트", href: "/event" },
          ]}
        />
      </div>

      <PageContentMax className="max-md:pb-16 max-md:pt-0 pb-[120px] pt-8 md:pb-[200px] md:pt-[60px]">
        {/* ── 모바일 (Figma 375) ── */}
        <div className="flex flex-col md:hidden">
          <div className="border-b border-[#EAE3C9]">
            <div className="flex flex-col gap-5 py-5">
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={status} />
                  {badgeLabel ? (
                    <span
                      className="inline-flex rounded-full bg-[#02633E] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      {badgeLabel}
                    </span>
                  ) : null}
                </div>
                <h1
                  className={cn(
                    nanum,
                    "text-xl font-extrabold leading-[26px] text-[#1F2121]",
                  )}
                >
                  {event.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="border-b border-[#EAE3C9] pt-5 pb-[60px]">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    nanum,
                    "text-sm font-bold leading-[14px] text-[#1F2121]",
                  )}
                >
                  {formatDateTime(event.created_at)}
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="shrink-0 rounded-[40px] bg-[#EAE3C9] p-2.5 text-[#4F4F4F] transition-colors active:brightness-95"
                  aria-label="공유"
                >
                  <Share2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {(periodStr || location || contact) && (
                <div className="flex w-full flex-col gap-3">
                  {periodStr ? (
                    <div className="flex min-w-0 items-center gap-5">
                      <span className={infoIconClass}>
                        <Calendar className="h-[18px] w-[18px] text-white" />
                      </span>
                      <div
                        className={cn(
                          nanum,
                          "flex min-w-0 flex-wrap items-center gap-3",
                        )}
                      >
                        <span className="text-base font-extrabold leading-[22.4px] text-[#1F2121]">
                          기간
                        </span>
                        <span className="text-[15px] font-bold leading-[22.5px] text-[#1F2121]">
                          {periodStr}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  {location ? (
                    <div className="flex min-w-0 items-center gap-5">
                      <span className={infoIconClass}>
                        <MapPin className="h-[18px] w-[18px] text-white" />
                      </span>
                      <div
                        className={cn(
                          nanum,
                          "flex min-w-0 flex-wrap items-center gap-3",
                        )}
                      >
                        <span className="text-base font-extrabold leading-[22.4px] text-[#1F2121]">
                          장소
                        </span>
                        <span className="text-[15px] font-bold leading-[22.5px] text-[#1F2121]">
                          {location}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  {contact ? (
                    <div className="flex min-w-0 items-center gap-5">
                      <span className={infoIconClass}>
                        <Headphones className="h-[18px] w-[18px] text-white" />
                      </span>
                      <div
                        className={cn(
                          nanum,
                          "flex min-w-0 flex-wrap items-center gap-3",
                        )}
                      >
                        <span className="text-base font-extrabold leading-[22.4px] text-[#1F2121]">
                          문의
                        </span>
                        <span className="min-w-0 break-words text-[15px] font-bold leading-[22.5px] text-[#1F2121]">
                          {contact}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="h-[167px] w-full overflow-hidden bg-[#D5CEB4]">
                {event.thumbnail_url ? (
                  <img
                    src={event.thumbnail_url}
                    alt=""
                    className="h-full w-full object-cover object-center"
                  />
                ) : null}
              </div>

              {bodyIsHtml ? (
                <div
                  className={cn(
                    nanum,
                    "event-content min-h-[120px] text-base font-normal leading-[22.4px] text-[#1F2121]",
                  )}
                  dangerouslySetInnerHTML={{ __html: event.content }}
                />
              ) : (
                <div
                  className={cn(
                    nanum,
                    "min-h-[120px] whitespace-pre-line text-base font-normal leading-[22.4px] text-[#1F2121]",
                  )}
                >
                  {event.content}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-[60px] pt-10">
            <div className="flex w-full flex-col gap-2.5">
              {prev ? (
                <Link
                  to={`/event/${prev.event_id}`}
                  className={cn(
                    nanum,
                    "flex h-[66px] min-h-[66px] items-center gap-5 overflow-hidden px-5 py-[11px] text-sm font-bold leading-[18.2px] text-[#003F2B]",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{prev.title}</span>
                  <span className="shrink-0">이전글</span>
                  <ChevronUp
                    className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                    strokeWidth={2}
                    aria-hidden
                  />
                </Link>
              ) : (
                <div
                  className={cn(
                    nanum,
                    "flex h-[66px] items-center px-5 text-sm text-[#1F2121]/35",
                  )}
                >
                  이전글이 없습니다.
                </div>
              )}

              {next ? (
                <Link
                  to={`/event/${next.event_id}`}
                  className={cn(
                    nanum,
                    "flex h-[66px] min-h-[66px] items-center gap-5 overflow-hidden rounded-[40px] px-5 py-[11px] text-sm font-bold leading-[18.2px] text-[#003F2B]",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{next.title}</span>
                  <div className="flex w-[92px] shrink-0 items-center justify-end gap-5">
                    <span>다음글</span>
                    <ChevronDown
                      className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                </Link>
              ) : (
                <div
                  className={cn(
                    nanum,
                    "flex h-[66px] items-center justify-end rounded-[40px] px-5 text-sm text-[#1F2121]/35",
                  )}
                >
                  다음글이 없습니다.
                </div>
              )}
            </div>

            <Link
              to="/event"
              className={cn(
                nanum,
                "w-full rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 text-center text-base font-extrabold leading-[20.8px] text-[#003F2B] transition-colors active:brightness-95",
              )}
            >
              목록
            </Link>
          </div>
        </div>

        {/* ── 데스크톱 ── */}
        <div className="hidden md:block">
          <div className="pb-12 text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <span
                className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                }}
              >
                {status}
              </span>
              {badgeLabel ? (
                <span
                  className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: "#02633E", color: "#fff" }}
                >
                  {badgeLabel}
                </span>
              ) : null}
            </div>
            <h1
              className="text-[28px] font-bold text-gray-900"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.35 }}
            >
              {event.title}
            </h1>
          </div>

          <div style={{ borderTop: "1px solid #D8D0BB" }} />

          <div className="flex items-center justify-between py-4">
            <span className="text-sm text-gray-400">
              {formatDateTime(event.created_at)}
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E]"
              style={{ borderColor: "#D8D0BB", backgroundColor: "#fff" }}
            >
              <Share2 className="h-3.5 w-3.5" />
              공유
            </button>
          </div>

          {(periodStr || location || contact) && (
            <div
              className="flex flex-col gap-2.5 py-5"
              style={{ borderBottom: "1px solid #D8D0BB" }}
            >
              {periodStr ? (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#02633E]">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="w-8 shrink-0 font-medium text-gray-400">
                    기간
                  </span>
                  <span>{periodStr}</span>
                </div>
              ) : null}
              {location ? (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#02633E]">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="w-8 shrink-0 font-medium text-gray-400">
                    장소
                  </span>
                  <span>{location}</span>
                </div>
              ) : null}
              {contact ? (
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#02633E]">
                    <Phone className="h-3.5 w-3.5 text-white" />
                  </span>
                  <span className="w-8 shrink-0 font-medium text-gray-400">
                    문의
                  </span>
                  <span>{contact}</span>
                </div>
              ) : null}
            </div>
          )}

          {event.thumbnail_url ? (
            <div className="mt-8 overflow-hidden rounded-xl">
              <img
                src={event.thumbnail_url}
                alt={event.title}
                className="w-full object-cover"
              />
            </div>
          ) : null}

          {bodyIsHtml ? (
            <div
              className="event-content py-10 text-gray-700"
              style={{ minHeight: "200px", fontSize: "15px" }}
              dangerouslySetInnerHTML={{ __html: event.content }}
            />
          ) : (
            <div
              className="py-10 text-gray-700"
              style={{
                minHeight: "200px",
                whiteSpace: "pre-line",
                fontSize: "15px",
                lineHeight: "1.8",
              }}
            >
              {event.content}
            </div>
          )}

          <div
            className="flex flex-col gap-3 pt-8 md:flex-row md:items-center md:gap-4"
            style={{ borderTop: "1px solid #D8D0BB" }}
          >
            <div className="flex-1">
              {prev ? (
                <Link
                  to={`/event/${prev.event_id}`}
                  className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
                >
                  <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  <span className="shrink-0 font-medium text-gray-400">
                    이전글
                  </span>
                  <span className="line-clamp-1 max-w-[260px]">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span className="text-sm text-gray-300">
                  이전글이 없습니다.
                </span>
              )}
            </div>

            <div className="flex justify-center">
              <Link
                to="/event"
                className="shrink-0 rounded-full px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:brightness-95"
                style={{ backgroundColor: "#EAE3C9" }}
              >
                목록
              </Link>
            </div>

            <div className="flex-1 text-right">
              {next ? (
                <Link
                  to={`/event/${next.event_id}`}
                  className="group inline-flex items-center justify-end gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
                >
                  <span className="line-clamp-1 max-w-[260px]">
                    {next.title}
                  </span>
                  <span className="shrink-0 font-medium text-gray-400">
                    다음글
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <span className="text-sm text-gray-300">
                  다음글이 없습니다.
                </span>
              )}
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
