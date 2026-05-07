/**
 * 이벤트 목록 페이지
 */
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import type { Route } from "./+types/event";
import { MediaThumbFallback } from "~/core/components/media-thumb-fallback";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SearchBar } from "~/core/components/search-bar";
import { SectionPageTitle } from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { normalizeContentLocale } from "~/core/db/content-locale.server";
import { cn } from "~/core/lib/utils";
import { getEvents } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: (data as { metaTitle?: string } | undefined)?.metaTitle ?? "" },
];

export type EventTabKey = "all" | "notice" | "guide" | "event";

const EVENT_TAB_KEYS: EventTabKey[] = ["all", "notice", "guide", "event"];

const LEGACY_TAB_TO_KEY: Record<string, EventTabKey> = {
  전체보기: "all",
  공지: "notice",
  안내: "guide",
  이벤트: "event",
};

function normalizeEventTab(raw: string | null): EventTabKey {
  if (!raw) return "all";
  if (LEGACY_TAB_TO_KEY[raw]) return LEGACY_TAB_TO_KEY[raw];
  if (EVENT_TAB_KEYS.includes(raw as EventTabKey)) return raw as EventTabKey;
  return "all";
}

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const contentLocale = normalizeContentLocale(await i18next.getLocale(request));
  const url = new URL(request.url);
  const activeTab = normalizeEventTab(url.searchParams.get("tab"));

  const [dbEvents, pageBanner] = await Promise.all([
    getEvents(contentLocale).catch(() => []),
    getPageBanner("event").catch(() => null),
  ]);

  return {
    dbEvents,
    pageBanner,
    activeTab,
    metaTitle: t("pages.events.list.metaTitle"),
  };
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


const ITEMS_PER_PAGE = 9;

const nanum = "font-[family-name:var(--font-nanum)]";

function matchesTab(
  type: "event" | "notice",
  title: string,
  tab: EventTabKey,
): boolean {
  if (tab === "all") return true;
  if (tab === "event") return type === "event";
  if (tab === "notice") return type === "notice" && !title.includes("안내");
  if (tab === "guide") return type === "notice" && title.includes("안내");
  return true;
}

export type EventStatusKey = "ongoing" | "upcoming" | "ended";

function getEventStatus(
  started_at: Date | null,
  ended_at: Date | null,
): EventStatusKey {
  const now = new Date();
  if (ended_at && ended_at < now) return "ended";
  if (started_at && started_at > now) return "upcoming";
  return "ongoing";
}

function formatDate(val: string | Date) {
  const d = new Date(val);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatPeriod(
  started_at: Date | null,
  ended_at: Date | null,
  rangeSep: string,
) {
  if (!started_at && !ended_at) return "-";
  const s = started_at ? formatDate(started_at) : "";
  const e = ended_at ? formatDate(ended_at) : "";
  if (s && e) return `${s} ${rangeSep} ${e}`;
  if (s) return `${s} ${rangeSep}`;
  return `${rangeSep} ${e}`;
}

/** 썸네일 좌상단 상태 뱃지 — 시안 색상 */
function ThumbnailStatusBadge({ status }: { status: EventStatusKey }) {
  const { t } = useTranslation();
  if (status === "ongoing") {
    return (
      <span
        className="inline-flex rounded-full px-3 py-2 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
        style={{ backgroundColor: "#32AF32", lineHeight: "12px" }}
      >
        {t("pages.events.list.statusOngoing")}
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span
        className="inline-flex rounded-full px-3 py-2 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
        style={{ backgroundColor: "#F3BC1E", lineHeight: "12px" }}
      >
        {t("pages.events.list.statusUpcoming")}
      </span>
    );
  }
  return (
    <span
      className="inline-flex rounded-full px-3 py-2 text-[10px] font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
      style={{ backgroundColor: "#003F2B", lineHeight: "10px" }}
    >
      {t("pages.events.list.statusEnded")}
    </span>
  );
}

/** Figma 375 기준 카드 폭·썸네일 높이 (PC 카드 최대 폭 520px과 동일 비율) */
const EVENT_CARD_REF_W = 343;
const EVENT_CARD_REF_THUMB_H = 167;

type EventCardRow = {
  event_id: number;
  title: string;
  summary: string;
  thumbnail_url: string | null;
  started_at: Date | null;
  ended_at: Date | null;
  badge: MockEventRow["badge"];
  venue: string;
  status: EventStatusKey;
};

function EventCard({ event }: { event: EventCardRow }) {
  const { t, i18n } = useTranslation();
  const isEnded = event.status === "ended";
  const periodSep = i18n.language.startsWith("ko") ? "~" : "–";
  return (
    <Link
      to={`/event/${event.event_id}`}
      className={cn(
        "group relative flex min-w-0 w-full max-w-full flex-col overflow-hidden rounded-[20px] bg-[#EAE3C9] transition-all hover:brightness-[0.98] active:brightness-95",
        "md:mx-auto md:max-w-[520px] md:rounded-[30px]",
      )}
    >
      <div className="flex flex-col gap-2.5 p-2.5 pb-0 md:gap-4 md:p-4 md:pb-0">
        <div
          className="relative w-full overflow-hidden rounded-xl bg-white md:rounded-2xl"
          style={{
            aspectRatio: `${EVENT_CARD_REF_W} / ${EVENT_CARD_REF_THUMB_H}`,
          }}
        >
          {event.thumbnail_url ? (
            <img
              src={event.thumbnail_url}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <MediaThumbFallback />
          )}
          <div className="pointer-events-none absolute left-4 top-4 md:left-6 md:top-6">
            <ThumbnailStatusBadge status={event.status} />
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col gap-4 p-5 md:gap-6 md:p-8",
          nanum,
          isEnded && "text-[#1F2121]",
        )}
      >
        <div className="flex flex-col gap-2 md:gap-3">
          <h3
            className={cn(
              "font-bold text-[#1F2121]",
              isEnded
                ? "text-[15px] leading-[22.5px] md:text-[23px] md:leading-[34px]"
                : "text-base leading-6 md:text-2xl md:leading-9",
            )}
          >
            {event.title}
          </h3>
          {event.summary ? (
            <p
              className={cn(
                "line-clamp-2 text-[#1F2121]",
                isEnded
                  ? "text-[13px] font-normal leading-[19.5px] md:text-[20px] md:leading-[30px]"
                  : "text-sm font-normal leading-[21px] md:text-lg md:leading-[27px]",
              )}
            >
              {event.summary}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 md:gap-3">
          <p
            className={cn(
              "text-[#1F2121]",
              isEnded
                ? "text-[10px] font-normal leading-[14px] md:text-[15px] md:leading-[21px]"
                : "text-xs font-normal leading-[16.8px] md:text-sm md:leading-[22px]",
            )}
          >
            {formatPeriod(event.started_at, event.ended_at, periodSep)}
          </p>
          <span
            className={cn(
              "inline-flex w-fit rounded-full bg-[#EAE3C9] px-1.5 py-1 font-medium text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]",
              isEnded
                ? "text-[10px] leading-[10px] md:px-2 md:py-1.5 md:text-[15px] md:leading-[15px]"
                : "text-xs leading-3 md:px-2 md:py-1.5 md:text-sm md:leading-4",
            )}
          >
            {event.venue}
          </span>
        </div>
      </div>
      {isEnded ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[20px] bg-[#2C383A]/60 md:rounded-[30px]"
          aria-hidden
        >
          <div
            className={cn(
              nanum,
              "flex h-[140px] w-[140px] items-center justify-center rounded-full bg-[#1F2121] px-5 py-2.5 text-center text-base font-bold leading-[22.4px] text-white",
              "md:h-[min(212px,calc(140*520/343))] md:w-[min(212px,calc(140*520/343))] md:px-8 md:py-4 md:text-[23px] md:leading-[32px]",
            )}
          >
            {t("pages.events.list.endedOverlay")}
          </div>
        </div>
      ) : null}
    </Link>
  );
}

export default function EventScreen({ loaderData }: Route.ComponentProps) {
  const { dbEvents, pageBanner, activeTab } = loaderData;
  const { t } = useTranslation();
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const source = dbEvents as MockEventRow[];

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
      venue: e.location?.trim()
        ? e.location.trim()
        : t("pages.events.list.venueOnline"),
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

  const handleTabChange = (tab: EventTabKey) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    if (tab === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/notice_banner_temp.png"
        title={t("pages.events.list.bannerTitle")}
        subtitle={t("pages.events.list.bannerSubtitle")}
        breadcrumb={[
          { label: t("common.breadcrumbHome"), href: "/" },
          { label: t("pages.events.list.breadcrumbPromo"), href: "/event" },
          { label: t("pages.events.list.breadcrumbCurrent") },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <SectionPageTitle
        as="h1"
        preset="default"
        className="px-4 pt-5 md:hidden"
      >
        {t("pages.events.list.mobileH1")}
      </SectionPageTitle>

      {/* ── 필터 탭 + 검색 (기존 유지) ── */}
      <PageContentMax className="max-md:pt-0 py-6 md:pb-5 md:pt-[60px]">

        <div className="mb-0 flex flex-col gap-4 md:mb-0 md:flex-row md:items-end md:justify-between md:pb-0">
          <div className="flex w-full flex-col items-start gap-1 max-md:pt-[14px] max-md:pb-5 md:contents">
            <div className="flex w-full flex-wrap items-center gap-[10px] max-md:flex-nowrap max-md:overflow-x-auto max-md:overscroll-x-contain max-md:py-3.5 max-md:[scrollbar-width:none] md:max-w-none md:gap-2.5 md:py-0 [&::-webkit-scrollbar]:hidden">
              {EVENT_TAB_KEYS.map((tab) => {
                const isActive = tab === activeTab;
                const tabLabel = t(`pages.events.list.tabs.${tab}`);
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => handleTabChange(tab)}
                    className={cn(
                      nanum,
                      "flex shrink-0 items-center rounded-[40px] px-3 py-1.5 text-xs font-bold leading-[18px] transition-colors",
                      "md:px-4 md:py-2 md:font-[Pretendard,system-ui,sans-serif] md:text-lg md:leading-[27px]",
                      isActive && "gap-2 md:gap-1.5",
                      isActive ? "md:font-bold" : "md:font-medium",
                    )}
                    style={{
                      letterSpacing: "-0.04em",
                      ...(isActive
                        ? { backgroundColor: "#02633E", color: "#fff" }
                        : { backgroundColor: "#EAE3C9", color: "#1F2121" }),
                    }}
                  >
                    {isActive && (
                      <Check
                        className="h-3 w-3 shrink-0 text-white md:h-4 md:w-4"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    )}
                    {tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex md:shrink-0">
            <SearchBar
              className="md:gap-[min(6px,calc(6*100vw/1920))]"
              value={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
              inputClassName="border-0 py-5 font-bold text-[#1F2121] placeholder:font-bold placeholder:text-[#1F2121] md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(360px,calc(360*100vw/1920))] md:px-10 md:font-[NanumSquareRound,sans-serif] md:text-base md:leading-6"
              buttonClassName="md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(64px,calc(64*100vw/1920))] md:p-5"
            />
          </div>
        </div>
      </PageContentMax>

      {/* 레시피 목록과 동일 가로 패딩·그리드: 모바일 2열 / PC 3열, 페이지당 9개 */}
      <div className="px-4 pb-16 md:mt-[30px] md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto min-w-0 w-full max-w-[var(--content-max-width)]">
          {normalized.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-base text-gray-500">{t("empty.events")}</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">
              {t("pages.events.list.empty")}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-5">
                {paginated.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-10 flex items-center justify-center gap-[30px] md:pt-10">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label={t("pages.events.list.paginationPrev")}
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30"
                  >
                    <ChevronLeft className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-label={t("pages.events.list.paginationPage", {
                        page: p,
                      })}
                      aria-current={p === page ? "page" : undefined}
                      className={cn(
                        "min-h-12 min-w-10 bg-transparent px-2 font-[NanumSquareRound,sans-serif] text-lg font-extrabold leading-[23.4px] text-[#003F2B] transition-opacity",
                        p === page ? "opacity-100" : "opacity-50 hover:opacity-80",
                      )}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    aria-label={t("pages.events.list.paginationNext")}
                    className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30"
                  >
                    <ChevronRight className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
