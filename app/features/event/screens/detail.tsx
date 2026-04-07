/**
 * 이벤트 상세 페이지
 */
import type { Route } from "./+types/detail";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Share2,
} from "lucide-react";
import { Link, data } from "react-router";

import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import { getAdjacentEvents, getEventById } from "../lib/queries.server";

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
  3: {
    event_id: 3,
    title: "강남 팝업스토어 오픈",
    content: `팝업스토어 소개\n풍림푸드의 다양한 제품을 직접 보고, 맛보고, 구매할 수 있는 팝업스토어가 서울 강남 가로수길에 오픈합니다.\n\n운영 시간\n평일 오전 11시 ~ 오후 9시 (만휴무일)\n\n체험 프로그램\n제품 시식 시간 매시\n연 할인 쿠킹 클래스 (사전 예약 필수)\n포토존 및 SNS 이벤트\n특별 운영 할인 혜택\n\n오시는 길\n서울 강남구 가로수길 12-3 1층 (신사역 8번 출구 도보 5분)`,
    badge: null,
    thumbnail_url: null,
    started_at: new Date("2025-01-15"),
    ended_at: new Date("2025-01-28"),
    created_at: new Date("2025-01-10T14:44:00"),
    view_count: "890",
    location: "서울 강남구 기호수림",
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
    created_at: new Date("2024-11-25T10:00:00"),
    view_count: "1250",
  },
};

const MOCK_ADJACENT: Record<
  number,
  {
    prev: { event_id: number; title: string } | null;
    next: { event_id: number; title: string } | null;
  }
> = {
  3: {
    prev: { event_id: 2, title: "신제품 출시 기념 할인 이벤트" },
    next: { event_id: 4, title: "월간 레시피 콘테스트" },
  },
  4: {
    prev: { event_id: 3, title: "강남 팝업스토어 오픈" },
    next: null,
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

  // page banner는 더 이상 상세에서 사용하지 않지만 타입 일관성을 위해 유지
  await getPageBanner("event").catch(() => null);

  let event = null;
  let prev: { event_id: number; title: string } | null = null;
  let next: { event_id: number; title: string } | null = null;

  try {
    event = await getEventById(id);
    if (event && event.is_active) {
      const adjacent = await getAdjacentEvents(id);
      prev = adjacent.prev;
      next = adjacent.next;
    } else {
      event = null;
    }
  } catch {
    // DB 미연결 시 더미 사용
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

export default function EventDetailScreen({
  loaderData,
}: Route.ComponentProps) {
  const { event: dbEvent, prev: dbPrev, next: dbNext, id } = loaderData;

  const event = dbEvent ?? MOCK_MAP[id] ?? MOCK_MAP[3];
  const prev = dbPrev ?? MOCK_ADJACENT[id]?.prev ?? null;
  const next = dbNext ?? MOCK_ADJACENT[id]?.next ?? null;

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

  const location = (event as (typeof MOCK_MAP)[number]).location ?? null;
  const contact = (event as (typeof MOCK_MAP)[number]).contact ?? null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: event.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 브레드크럼 ── */}
      <div
        className="mx-auto hidden max-w-[1600px] md:block"
        style={{ borderBottom: "1px solid #D8D0BB" }}
      >
        <div className="mx-auto max-w-[1600px] py-3">
          <nav className="flex items-center gap-1 text-sm text-gray-400">
            <Link to="/" className="transition-colors hover:text-[#02633E]">
              Home
            </Link>
            <span className="opacity-60">&gt;</span>
            <Link
              to="/event"
              className="transition-colors hover:text-[#02633E]"
            >
              홍보센터
            </Link>
            <span className="opacity-60">&gt;</span>
            <Link
              to="/event"
              className="transition-colors hover:text-[#02633E]"
            >
              이벤트
            </Link>
          </nav>
        </div>
      </div>

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-8 pb-[120px] md:px-6 md:pt-[60px] md:pb-[200px] lg:px-10">
        {/* ── 가운데 정렬 헤더 영역 ── */}
        <div className="pb-4 text-center md:pb-12">
          {/* 배지 */}
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
            {badgeLabel && (
              <span
                className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold"
                style={{ backgroundColor: "#02633E", color: "#fff" }}
              >
                {badgeLabel}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1
            className="text-xl font-bold text-gray-900 md:text-[28px]"
            style={{ letterSpacing: "-0.02em", lineHeight: 1.35 }}
          >
            {event.title}
          </h1>
        </div>

        {/* 제목 아래 구분선 */}
        <div style={{ borderTop: "1px solid #D8D0BB" }} />

        {/* 날짜 + 공유 */}
        <div className="flex items-center justify-between py-3 md:py-4">
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

        {/* ── 이벤트 정보 행 ── */}
        {(periodStr || location || contact) && (
          <div
            className="flex flex-col gap-2.5 py-5"
            style={{ borderBottom: "1px solid #D8D0BB" }}
          >
            {periodStr && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#02633E" }}
                >
                  <Calendar className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="w-8 shrink-0 font-medium text-gray-400">
                  기간
                </span>
                <span>{periodStr}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#02633E" }}
                >
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="w-8 shrink-0 font-medium text-gray-400">
                  장소
                </span>
                <span>{location}</span>
              </div>
            )}
            {contact && (
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#02633E" }}
                >
                  <Phone className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="w-8 shrink-0 font-medium text-gray-400">
                  문의
                </span>
                <span>{contact}</span>
              </div>
            )}
          </div>
        )}

        {/* ── 썸네일 ── */}
        {event.thumbnail_url && (
          <div className="mt-8 overflow-hidden rounded-xl">
            <img
              src={event.thumbnail_url}
              alt={event.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* ── 본문 콘텐츠 ── */}
        {event.content.trim().startsWith("<") ? (
          // 리치 텍스트(HTML) 콘텐츠
          <div
            className="event-content py-8 text-gray-700 md:py-10"
            style={{ minHeight: "200px", fontSize: "15px" }}
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        ) : (
          // 순수 텍스트 콘텐츠 (기존 더미 데이터 등)
          <div
            className="py-8 text-gray-700 md:py-10"
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

        {/* ── 이전글 / 목록 / 다음글 ── */}
        <div
          className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:gap-4 md:pt-8"
          style={{ borderTop: "1px solid #D8D0BB" }}
        >
          {/* 이전글 */}
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
                <span className="line-clamp-1 max-w-[180px] md:max-w-[260px]">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="text-sm text-gray-300">이전글이 없습니다.</span>
            )}
          </div>

          {/* 목록 버튼 */}
          <div className="flex justify-center">
            <Link
              to="/event"
              className="shrink-0 rounded-full px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:brightness-95"
              style={{ backgroundColor: "#EAE3C9" }}
            >
              목록
            </Link>
          </div>

          {/* 다음글 */}
          <div className="flex-1 text-right">
            {next ? (
              <Link
                to={`/event/${next.event_id}`}
                className="group inline-flex items-center justify-end gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
              >
                <span className="line-clamp-1 max-w-[180px] md:max-w-[260px]">
                  {next.title}
                </span>
                <span className="shrink-0 font-medium text-gray-400">
                  다음글
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <span className="text-sm text-gray-300">다음글이 없습니다.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
