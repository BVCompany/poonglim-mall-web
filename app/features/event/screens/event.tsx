/**
 * 이벤트 목록 페이지
 */
import { Fragment, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { Route } from "./+types/event";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { cn } from "~/core/lib/utils";
import { getEvents } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "이벤트 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") ?? "전체보기";

  const [dbEvents, pageBanner] = await Promise.all([
    getEvents().catch(() => []),
    getPageBanner("event").catch(() => null),
  ]);

  return { dbEvents, pageBanner, activeTab: tab };
}

type MockEventRow = {
  event_id: number;
  type: "event" | "notice";
  badge: "hot" | "new" | "ending_soon" | "important" | null;
  title: string;
  summary: string;
  thumbnail_url: string | null;
  started_at: Date | null;
  ended_at: Date | null;
  is_active: boolean;
  created_at: Date;
  view_count: string;
  content: string;
  /** 모바일 시안 — 장소 칩 (`events.location`, 없으면 "온라인") */
  location?: string | null;
};

/* ── 더미 데이터 ── */
const MOCK_EVENTS: MockEventRow[] = [
  {
    event_id: 4,
    type: "event",
    badge: "hot",
    title: "신제품 출시 기념 할인 이벤트",
    summary: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    thumbnail_url: null,
    started_at: new Date("2026-02-18"),
    ended_at: new Date("2026-02-24"),
    is_active: true,
    created_at: new Date("2026-02-10"),
    view_count: "1250",
    content: "",
    location: "온라인",
  },
  {
    event_id: 5,
    type: "event",
    badge: null,
    title: "신제품 출시 기념 할인 이벤트",
    summary: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    thumbnail_url: null,
    started_at: new Date("2026-02-18"),
    ended_at: new Date("2026-02-24"),
    is_active: true,
    created_at: new Date("2026-02-11"),
    view_count: "800",
    content: "",
    location: "서울 코엑스",
  },
  {
    event_id: 3,
    type: "event",
    badge: null,
    title: "강남 팝업스토어 오픈",
    summary: "풍림푸드 제품을 직접 체험하고 구매할 수 있는 팝업스토어가 강남에 오픈합니다.",
    thumbnail_url: null,
    started_at: new Date("2026-06-01"),
    ended_at: new Date("2026-06-15"),
    is_active: true,
    created_at: new Date("2026-05-20"),
    view_count: "890",
    content: "",
    location: "서울 강남구 가로수길",
  },
  {
    event_id: 2,
    type: "event",
    badge: "new",
    title: "월간 레시피 콘테스트",
    summary: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    thumbnail_url: null,
    started_at: new Date("2026-02-18"),
    ended_at: new Date("2026-02-24"),
    is_active: true,
    created_at: new Date("2026-02-12"),
    view_count: "342",
    content: "",
    location: "온라인",
  },
  {
    event_id: 6,
    type: "event",
    badge: null,
    title: "월간 레시피 콘테스트",
    summary: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    thumbnail_url: null,
    started_at: new Date("2026-02-18"),
    ended_at: new Date("2026-02-24"),
    is_active: true,
    created_at: new Date("2026-02-13"),
    view_count: "200",
    content: "",
    location: "온라인",
  },
  {
    event_id: 1,
    type: "event",
    badge: null,
    title: "신제품 출시 기념 할인 이벤트",
    summary: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    thumbnail_url: null,
    started_at: new Date("2025-01-01"),
    ended_at: new Date("2025-01-20"),
    is_active: true,
    created_at: new Date("2024-12-01"),
    view_count: "150",
    content: "",
    location: "온라인",
  },
  {
    event_id: 101,
    type: "notice",
    badge: null,
    title: "시스템 점검 공지",
    summary: "원활한 서비스를 위한 시스템 점검 일정을 안내드립니다.",
    thumbnail_url: null,
    started_at: new Date("2026-03-01"),
    ended_at: new Date("2026-03-01"),
    is_active: true,
    created_at: new Date("2026-02-20"),
    view_count: "50",
    content: "",
    location: "온라인",
  },
  {
    event_id: 102,
    type: "notice",
    badge: null,
    title: "배송 일정 변경 안내",
    summary: "명절 배송 마감 및 출고 일정을 안내드립니다.",
    thumbnail_url: null,
    started_at: new Date("2026-02-01"),
    ended_at: new Date("2026-02-28"),
    is_active: true,
    created_at: new Date("2026-01-28"),
    view_count: "120",
    content: "",
    location: "온라인",
  },
];

const BADGE_LABEL: Record<string, string> = {
  hot: "HOT",
  new: "NEW",
  ending_soon: "마감임박",
  important: "중요",
};

/** 모바일 시안 — 상단 필터 탭 */
const TABS = ["전체보기", "공지", "안내", "이벤트"] as const;

const ITEMS_PER_PAGE = 9;

const nanum = "font-[family-name:var(--font-nanum)]";

function matchesTab(
  type: "event" | "notice",
  title: string,
  tab: string,
): boolean {
  if (tab === "전체보기") return true;
  if (tab === "이벤트") return type === "event";
  if (tab === "공지") return type === "notice" && !title.includes("안내");
  if (tab === "안내") return type === "notice" && title.includes("안내");
  return true;
}

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
  예정: { bg: "#C9A84C", color: "#fff" },
  종료: { bg: "#AAAAAA", color: "#fff" },
};

/** 썸네일 좌상단 상태 뱃지 — 시안 색상 */
function ThumbnailStatusBadge({ status }: { status: "진행중" | "예정" | "종료" }) {
  if (status === "진행중") {
    return (
      <span
        className="inline-flex rounded-full px-3 py-2 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
        style={{ backgroundColor: "#32AF32", lineHeight: "12px" }}
      >
        진행중
      </span>
    );
  }
  if (status === "예정") {
    return (
      <span
        className="inline-flex rounded-full px-3 py-2 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
        style={{ backgroundColor: "#F3BC1E", lineHeight: "12px" }}
      >
        예정
      </span>
    );
  }
  return (
    <span
      className="inline-flex rounded-full px-3 py-2 text-[10px] font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
      style={{ backgroundColor: "#003F2B", lineHeight: "10px" }}
    >
      종료
    </span>
  );
}

export default function EventScreen({ loaderData }: Route.ComponentProps) {
  const { dbEvents, pageBanner, activeTab } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const source = (dbEvents.length > 0 ? dbEvents : MOCK_EVENTS) as MockEventRow[];

  const normalized = source.map((e, i) => {
    const started = e.started_at ? new Date(e.started_at) : null;
    const ended = e.ended_at ? new Date(e.ended_at) : null;
    return {
      event_id: Number(e.event_id ?? i + 1),
      title: String(e.title ?? ""),
      type: (e.type === "notice" ? "notice" : "event") as "event" | "notice",
      summary: String(e.summary ?? ""),
      badge: e.badge ?? null,
      thumbnail_url: e.thumbnail_url ?? null,
      started_at: started,
      ended_at: ended,
      created_at: new Date(e.created_at),
      view_count: String(e.view_count ?? "0"),
      venue: e.location?.trim() ? e.location.trim() : "온라인",
      status: getEventStatus(started, ended),
    };
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, query]);

  const byTab = normalized.filter((e) =>
    matchesTab(e.type, e.title, activeTab),
  );

  const filtered = byTab.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

  const handleTabChange = (t: string) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    if (t === "전체보기") {
      setSearchParams({});
    } else {
      setSearchParams({ tab: t });
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
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

      {/* ── 본문 ── */}
      <PageContentMax className="max-md:pb-16 max-md:pt-0 py-0 md:py-10">

        {/* ── 필터 탭 + 검색 ── */}
        <div className="mb-5 flex flex-col gap-4 max-md:mb-0 max-md:gap-0 md:flex-row md:items-center md:justify-between">
          {/* 모바일 시안: px-4 py-3.5, 가로 스크롤 탭 */}
          <div className="scrollbar-hide -mx-1 flex gap-2.5 overflow-x-auto px-1 py-3.5 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:py-0">
            {TABS.map((t) => {
              const isActive = t === activeTab;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTabChange(t)}
                  className={cn(
                    nanum,
                    "flex shrink-0 items-center gap-2 rounded-[40px] px-3 py-1.5 text-xs font-bold leading-[18px] transition-colors",
                    "md:h-[43px] md:px-5 md:text-lg md:font-medium",
                  )}
                  style={{
                    letterSpacing: "-0.04em",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#1F2121" }),
                  }}
                >
                  {isActive && (
                    <Check className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.5} />
                  )}
                  {t}
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
          <div className="flex flex-col gap-2 max-md:gap-5 max-md:pt-0 md:gap-2">
            {paginated.map((event, idx) => {
              const num = filtered.length - ((page - 1) * ITEMS_PER_PAGE + idx);
              const statusStyle = STATUS_STYLE[event.status];
              const badgeLabel = event.badge ? BADGE_LABEL[event.badge] : null;
              const isEnded = event.status === "종료";
              return (
                <Fragment key={event.event_id}>
                  {/* 모바일 시안 — 아이보리 카드 + 썸네일 뱃지 + 종료 오버레이 */}
                  <Link
                    to={`/event/${event.event_id}`}
                    className="group relative flex w-full flex-col overflow-hidden rounded-[20px] bg-[#EAE3C9] transition-all active:brightness-95 md:hidden"
                  >
                    <div className="flex flex-col gap-2.5 p-2.5 pb-0">
                      <div className="relative h-[167px] w-full overflow-hidden rounded-xl bg-[#D5CEB4]">
                        {event.thumbnail_url ? (
                          <img
                            src={event.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover object-center"
                          />
                        ) : null}
                        <div className="pointer-events-none absolute left-4 top-4">
                          <ThumbnailStatusBadge status={event.status} />
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex flex-col gap-4 p-5",
                        nanum,
                        isEnded && "text-[#1F2121]",
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <h3
                          className={cn(
                            "font-bold text-[#1F2121]",
                            isEnded ? "text-[15px] leading-[22.5px]" : "text-base leading-6",
                          )}
                        >
                          {event.title}
                        </h3>
                        {event.summary ? (
                          <p
                            className={cn(
                              "line-clamp-2 text-[#1F2121]",
                              isEnded
                                ? "text-[13px] font-normal leading-[19.5px]"
                                : "text-sm font-normal leading-[21px]",
                            )}
                          >
                            {event.summary}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2">
                        <p
                          className={cn(
                            "text-[#1F2121]",
                            isEnded
                              ? "text-[10px] font-normal leading-[14px]"
                              : "text-xs font-normal leading-[16.8px]",
                          )}
                        >
                          {formatPeriod(event.started_at, event.ended_at)}
                        </p>
                        <span
                          className={cn(
                            "inline-flex w-fit rounded-full bg-[#F4F2E5] px-1.5 py-1 font-medium text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]",
                            isEnded ? "text-[10px] leading-[10px]" : "text-xs leading-3",
                          )}
                        >
                          {event.venue}
                        </span>
                      </div>
                    </div>
                    {isEnded ? (
                      <div
                        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[20px] bg-[#2C383A]/60"
                        aria-hidden
                      >
                        <div
                          className={cn(
                            nanum,
                            "flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[#1F2121] px-5 py-2.5 text-center text-base font-bold leading-[22.4px] text-white",
                          )}
                        >
                          종료된 이벤트
                        </div>
                      </div>
                    ) : null}
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

        {/* ── 페이지네이션 (모바일 시안: 흰 원 48px + 숫자 #003F2B extrabold) ── */}
        <div className="mt-10 flex items-center justify-center gap-2 max-md:gap-[30px] max-md:pt-10">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E] disabled:opacity-30 max-md:h-12 max-md:w-12 max-md:rounded-[40px] max-md:border-0"
          >
            <ChevronLeft
              className="h-4 w-4 text-[#02633E] max-md:h-[18px] max-md:w-[18px]"
              strokeWidth={2}
            />
          </button>

          <div className="flex items-center gap-1.5 max-md:gap-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={cn(
                  nanum,
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  p === page
                    ? "bg-[#02633E] text-white max-md:bg-transparent max-md:text-base max-md:font-extrabold max-md:leading-[20.8px] max-md:text-[#003F2B]"
                    : "text-[#555] max-md:text-sm max-md:font-normal",
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors hover:border-[#02633E] hover:text-[#02633E] disabled:opacity-30 max-md:h-12 max-md:w-12 max-md:rounded-[40px] max-md:border-0"
          >
            <ChevronRight
              className="h-4 w-4 text-[#02633E] max-md:h-[18px] max-md:w-[18px]"
              strokeWidth={2}
            />
          </button>
        </div>
      </PageContentMax>
    </div>
  );
}
