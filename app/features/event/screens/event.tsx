/**
 * 이벤트 목록 페이지
 */
import { Fragment, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { Route } from "./+types/event";
import { PageBanner } from "~/core/components/page-banner";
import { getEventsOnly } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "이벤트 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "전체보기";

  const [dbEvents, pageBanner] = await Promise.all([
    getEventsOnly().catch(() => []),
    getPageBanner("event").catch(() => null),
  ]);

  return { dbEvents, pageBanner, activeStatus: status };
}

/* ── 더미 데이터 ── */
const MOCK_EVENTS = [
  {
    event_id: 4,
    type: "event" as const,
    badge: "hot" as const,
    title: "신제품 출시 기념 할인 이벤트",
    summary: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    thumbnail_url: null as string | null,
    started_at: new Date("2024-12-01"),
    ended_at: new Date("2024-12-31"),
    is_active: true,
    created_at: new Date("2024-11-25"),
    view_count: "1250",
    content: "",
  },
  {
    event_id: 3,
    type: "event" as const,
    badge: null as null,
    title: "강남 팝업스토어 오픈",
    summary: "풍림푸드 제품을 직접 체험하고 구매할 수 있는 팝업스토어가 강남에 오픈합니다.",
    thumbnail_url: null as string | null,
    started_at: new Date("2025-01-15"),
    ended_at: new Date("2025-01-28"),
    is_active: true,
    created_at: new Date("2025-01-10"),
    view_count: "890",
    content: "",
  },
  {
    event_id: 2,
    type: "event" as const,
    badge: "new" as const,
    title: "월간 레시피 콘테스트",
    summary: "풍림푸드 제품을 활용한 창의적인 레시피를 공모합니다.",
    thumbnail_url: null as string | null,
    started_at: new Date("2024-12-01"),
    ended_at: new Date("2024-12-31"),
    is_active: true,
    created_at: new Date("2024-11-20"),
    view_count: "342",
    content: "",
  },
  {
    event_id: 1,
    type: "event" as const,
    badge: null as null,
    title: "B2B 파트너 초청 세미나",
    summary: "외식업체 파트너를 위한 신제품 소개 및 활용법 세미나",
    thumbnail_url: null as string | null,
    started_at: new Date("2024-11-15"),
    ended_at: new Date("2024-11-15"),
    is_active: true,
    created_at: new Date("2024-11-01"),
    view_count: "150",
    content: "",
  },
];

const BADGE_LABEL: Record<string, string> = {
  hot: "HOT",
  new: "NEW",
  ending_soon: "마감임박",
  important: "중요",
};

const STATUSES = ["전체보기", "진행중", "예정", "종료"];
const ITEMS_PER_PAGE = 9;

function getEventStatus(started_at: Date | null, ended_at: Date | null): "진행중" | "예정" | "종료" {
  const now = new Date();
  if (ended_at && ended_at < now) return "종료";
  if (started_at && started_at > now) return "예정";
  return "진행중";
}

function formatDate(val: string | Date) {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatPeriod(started_at: Date | null, ended_at: Date | null) {
  if (!started_at && !ended_at) return "-";
  const s = started_at ? formatDate(started_at) : "";
  const e = ended_at ? formatDate(ended_at) : "";
  if (s && e) return `${s} ~ ${e}`;
  if (s) return `${s} ~`;
  return `~ ${e}`;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  진행중: { bg: "#02633E", color: "#fff" },
  예정:   { bg: "#C9A84C", color: "#fff" },
  종료:   { bg: "#AAAAAA", color: "#fff" },
};

export default function EventScreen({ loaderData }: Route.ComponentProps) {
  const { dbEvents, pageBanner, activeStatus } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const source = (dbEvents.length > 0 ? dbEvents : MOCK_EVENTS) as typeof MOCK_EVENTS;

  const normalized = source.map((e, i) => ({
    event_id: Number(e.event_id ?? i + 1),
    title: String(e.title ?? ""),
    badge: e.badge ?? null,
    thumbnail_url: e.thumbnail_url ?? null,
    started_at: e.started_at ? new Date(e.started_at) : null,
    ended_at: e.ended_at ? new Date(e.ended_at) : null,
    created_at: new Date(e.created_at),
    view_count: String(e.view_count ?? "0"),
    status: getEventStatus(
      e.started_at ? new Date(e.started_at) : null,
      e.ended_at ? new Date(e.ended_at) : null,
    ),
  }));

  useEffect(() => { setPage(1); }, [activeStatus, query]);

  const byStatus = activeStatus === "전체보기"
    ? normalized
    : normalized.filter((e) => e.status === activeStatus);

  const filtered = byStatus.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const handleStatusChange = (s: string) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    if (s === "전체보기") {
      setSearchParams({});
    } else {
      setSearchParams({ status: s });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      <PageBanner
        imageUrl="/banner/notice_banner_temp.png"
        title="이벤트"
        subtitle="풍림푸드의 다양한 이벤트 소식을 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "홍보센터", href: "/event" },
          { label: "이벤트" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* 모바일 상단 타이틀 */}
      <div className="px-4 pt-3 md:hidden">
        <div className="inline-flex items-center gap-1.5">
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]">이벤트</h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:py-10 md:px-6 lg:px-10">

        {/* ── 필터 탭 + 검색 ── */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => {
              const isActive = s === activeStatus;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="flex h-[clamp(34px,5vw,43px)] items-center gap-1.5 rounded-full px-3 text-[clamp(13px,2.5vw,18px)] font-medium transition-colors md:h-[43px] md:px-5 md:text-lg"
                  style={{
                    letterSpacing: "-0.04em",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B" }),
                  }}
                >
                  {isActive && (
                    <Check className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.5} />
                  )}
                  {s}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어를 입력해주세요."
              className="h-16 w-64 rounded-full border-0 bg-white px-5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "#02633E" }}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── 목록 ── */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            해당 이벤트가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginated.map((event, idx) => {
              const num = filtered.length - ((page - 1) * ITEMS_PER_PAGE + idx);
              const statusStyle = STATUS_STYLE[event.status];
              const badgeLabel = event.badge ? BADGE_LABEL[event.badge] : null;
              return (
                <Fragment key={event.event_id}>
                  {/* 모바일 카드 */}
                  <Link
                    to={`/event/${event.event_id}`}
                    className="group grid grid-cols-[58px_1fr] items-start gap-x-3 gap-y-1 rounded-xl px-4 py-3 transition-all hover:brightness-[0.97] md:hidden"
                    style={{ backgroundColor: "#F0EEDD" }}
                  >
                    <div className="row-span-2 flex flex-col items-center gap-1.5 pt-0.5">
                      <span className="text-xs text-gray-500">{num}</span>
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {event.status}
                      </span>
                      {badgeLabel && (
                        <span
                          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
                        >
                          {badgeLabel}
                        </span>
                      )}
                    </div>
                    <span className="truncate text-[13px] font-medium text-gray-800 transition-colors group-hover:text-[#02633E]">
                      {event.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span>{formatPeriod(event.started_at, event.ended_at)}</span>
                    </div>
                  </Link>

                  {/* PC 테이블형 행 */}
                  <Link
                    to={`/event/${event.event_id}`}
                    className="group hidden grid-cols-[80px_1fr_200px_120px_56px] items-center gap-4 rounded-xl px-5 py-4 transition-all hover:brightness-[0.97] md:grid"
                    style={{ backgroundColor: "#F0EEDD" }}
                  >
                    <div className="text-center">
                      <span className="text-sm text-gray-400">{num}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      {badgeLabel && (
                        <span
                          className="shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                          style={{ backgroundColor: "#02633E", color: "#fff" }}
                        >
                          {badgeLabel}
                        </span>
                      )}
                      <span className="truncate text-sm font-medium text-gray-800 transition-colors group-hover:text-[#02633E]">
                        {event.title}
                      </span>
                    </div>
                    <span className="text-center text-xs text-gray-400">
                      {formatPeriod(event.started_at, event.ended_at)}
                    </span>
                    <div className="flex justify-center">
                      <span
                        className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                      >
                        {event.status}
                      </span>
                    </div>
                    <span className="text-right text-xs text-gray-400">{event.view_count}</span>
                  </Link>
                </Fragment>
              );
            })}
          </div>
        )}

        {/* ── 페이지네이션 ── */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors"
              style={
                p === page
                  ? { backgroundColor: "#02633E", color: "#fff" }
                  : { backgroundColor: "transparent", color: "#555" }
              }
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
