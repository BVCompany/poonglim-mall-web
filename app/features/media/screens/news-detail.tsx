/**
 * 보도자료 상세 페이지 (모바일 시안: Figma 375)
 */
import type { Route } from "./+types/news-detail";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Share2,
} from "lucide-react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import {
  getAdjacentNews,
  getNewsById,
  hasAnyActiveNews,
  incrementNewsViewCount,
} from "~/features/media/lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

type NewsRow = {
  news_id: number;
  type: string;
  title: string;
  content: string;
  summary: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: Date | string;
  view_count?: string | null;
};

const MOCK_ITEMS: NewsRow[] = [
  {
    news_id: 1,
    type: "announcement",
    title: "풍림푸드, 달콤한 밤 맛 담은 '스위트 마롱 푸딩(스마푸)' 출시",
    content: `<p>풍림푸드가 식품의약품안전처가 주관하는 '2024년 식품안전대상'에서 우수상을 수상하는 영예를 안았습니다.</p>
<p>이번 수상은 풍림푸드가 30년간 쌓아온 철저한 품질관리 시스템과 식품안전에 대한 끊임없는 노력을 인정받은 결과입니다. HACCP, FSSC 22000 등 국제 인증을 획득하고, 자체 품질연구소를 통해 원료부터 완제품까지 전 과정에서 엄격한 품질검사를 실시해왔습니다.</p>
<p>풍림푸드 대표는 "이번 수상은 전 임직원이 함께 노력한 결과"라며 "앞으로도 소비자에게 안전하고 신뢰할 수 있는 제품을 제공하기 위해 최선을 다하겠다"고 소감을 밝혔습니다.</p>
<p>풍림푸드는 1994년 창업 이래 액란, 푸딩 등 계란 가공품 전문 기업으로 성장해왔으며, 현재 국내 액란 시장 점유율 1위를 기록하고 있습니다.</p>`,
    summary: null,
    thumbnail_url: null,
    published_at: "2026-02-18",
    created_at: new Date("2026-02-18T14:44:00"),
    view_count: "128",
  },
  {
    news_id: 2,
    type: "press",
    title: "신제품 '프리미엄 액란 플러스' 출시 신…",
    content: "<p>본문입니다.</p>",
    summary: null,
    thumbnail_url: null,
    published_at: "2026-02-19",
    created_at: new Date("2026-02-19"),
    view_count: "45",
  },
  {
    news_id: 3,
    type: "press",
    title: "풍림푸드, 2024년 식품안전대상 수상 풍림푸…",
    content: "<p>본문입니다.</p>",
    summary: null,
    thumbnail_url: null,
    published_at: "2026-02-17",
    created_at: new Date("2026-02-17"),
    view_count: "210",
  },
];

function sortNewsLikeDb(a: NewsRow, b: NewsRow) {
  const pa = a.published_at ?? "";
  const pb = b.published_at ?? "";
  if (pa !== pb) return pb.localeCompare(pa);
  return (
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function getMockAdjacent(newsId: number) {
  const sorted = [...MOCK_ITEMS].sort(sortNewsLikeDb);
  const idx = sorted.findIndex((r) => r.news_id === newsId);
  if (idx === -1) return { prev: null, next: null };
  const older = sorted[idx + 1];
  const newer = sorted[idx - 1];
  return {
    prev: older ? { news_id: older.news_id, title: older.title } : null,
    next: newer ? { news_id: newer.news_id, title: newer.title } : null,
  };
}

/** 모바일 상단 뱃지 — 시안: 수상 = Light Green #32AF32 */
function badgeForType(type: string): { label: string; bg: string } {
  const t = type.toLowerCase();
  if (t === "announcement") return { label: "수상", bg: "#32AF32" };
  if (t === "news" || type === "뉴스") return { label: "뉴스", bg: "#003F2B" };
  return { label: "보도자료", bg: "#02633E" };
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.newsId);
  if (!Number.isFinite(id)) {
    throw new Response("Not Found", { status: 404 });
  }

  const [pageBanner, articleDb, hasRealNews] = await Promise.all([
    getPageBanner("news").catch(() => null),
    getNewsById(id).catch(() => null),
    hasAnyActiveNews().catch(() => false),
  ]);

  let article: NewsRow | null = articleDb as NewsRow | null;
  let prev: { news_id: number; title: string } | null = null;
  let next: { news_id: number; title: string } | null = null;

  if (articleDb) {
    const newCount = await incrementNewsViewCount(id).catch(() => null);
    article = {
      ...(articleDb as NewsRow),
      view_count: newCount ?? (articleDb as NewsRow).view_count ?? "0",
    };
    const adjacentTry = await getAdjacentNews(id).catch(() => ({
      prev: null,
      next: null,
    }));
    prev = adjacentTry.prev;
    next = adjacentTry.next;
  } else {
    if (hasRealNews) {
      throw new Response("Not Found", { status: 404 });
    }
    article = MOCK_ITEMS.find((m) => m.news_id === id) ?? null;
    const m = getMockAdjacent(id);
    prev = m.prev;
    next = m.next;
  }

  if (!article) {
    throw new Response("Not Found", { status: 404 });
  }

  return { article, prev, next, pageBanner };
}

export function meta({ data }: Route.MetaArgs) {
  const title =
    (data as { article?: { title: string } } | null)?.article?.title ??
    "보도자료";
  return [{ title: `${title} | 풍림푸드` }];
}

function formatDateTime(val: string | Date | null) {
  if (!val) return "";
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function formatViewCount(v: string | null | undefined): string {
  const n = Number.parseInt(String(v ?? "0"), 10);
  const safe = Number.isFinite(n) && n >= 0 ? n : 0;
  return safe.toLocaleString("ko-KR");
}

const nanum = "font-[family-name:var(--font-nanum)]";

export default function NewsDetailScreen({ loaderData }: Route.ComponentProps) {
  const { article, prev, next, pageBanner } = loaderData;

  const badge = badgeForType(article.type);
  const displayAt = article.published_at ?? article.created_at;
  const html =
    article.content?.trim() ||
    (article.summary ? `<p>${article.summary}</p>` : "<p></p>");

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url });
      } else if (url) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* 사용자 취소 등 */
    }
  }

  const articleClassMobile = cn(
    "prose prose-sm max-w-none text-[#1F2121]",
    `${nanum} text-base font-normal leading-6`,
    "prose-p:mb-0 prose-p:leading-6 prose-headings:text-[#1F2121]",
  );

  const articleClassDesktop =
    "prose prose-sm max-w-none py-8 leading-relaxed text-gray-700 md:py-10";

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/notice_banner_temp.png"
        title="보도자료"
        subtitle="풍림푸드의 보도자료와 소식을 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "홍보센터", href: "/media/news" },
          { label: "보도자료", href: "/media/news" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-0 pb-[120px] md:pt-[100px] md:pb-[200px]">
        {/* 모바일 — 시안 375 */}
        <div className="flex flex-col gap-0 md:hidden">
          <div className="border-b border-[#EAE3C9]">
            <div className="flex flex-col gap-5 py-5">
              <div className="flex flex-col gap-2.5">
                <span
                  className="inline-flex w-fit items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
                  style={{ backgroundColor: badge.bg, lineHeight: "12px" }}
                >
                  {badge.label}
                </span>
                <h1
                  className={cn(
                    nanum,
                    "text-xl font-extrabold leading-[26px] text-[#1F2121]",
                  )}
                >
                  {article.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="border-b border-[#EAE3C9] pt-5 pb-[60px]">
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between gap-2">
                <div
                  className={cn(
                    nanum,
                    "flex min-w-0 flex-wrap items-center gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
                  )}
                >
                  <span className="shrink-0">
                    {formatDateTime(displayAt)}
                  </span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    <span>조회수:</span>
                    <span>{formatViewCount(article.view_count)}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="shrink-0 rounded-[40px] bg-[#EAE3C9] p-2.5 text-[#4F4F4F] transition-colors active:brightness-95"
                  aria-label="공유"
                >
                  <Share2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {article.thumbnail_url ? (
                <img
                  src={article.thumbnail_url}
                  alt=""
                  className="w-full rounded-none object-cover"
                />
              ) : null}

              <div
                className={articleClassMobile}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-[60px] pt-10">
            <div className="flex w-full flex-col gap-2.5">
              {prev ? (
                <Link
                  to={`/media/news/${prev.news_id}`}
                  className={cn(
                    nanum,
                    "flex h-[66px] min-h-[66px] items-center gap-5 overflow-hidden px-5 py-[11px] text-base font-bold leading-[20.8px] text-[#003F2B]",
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
                  to={`/media/news/${next.news_id}`}
                  className={cn(
                    nanum,
                    "flex h-[66px] min-h-[66px] items-center gap-5 overflow-hidden rounded-[40px] px-5 py-[11px] text-base font-bold leading-[20.8px] text-[#003F2B]",
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
              to="/media/news"
              className={cn(
                nanum,
                "w-full rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 text-center text-base font-extrabold leading-[20.8px] text-[#003F2B] transition-colors active:brightness-95",
              )}
            >
              목록
            </Link>
          </div>
        </div>

        {/* 데스크톱 */}
        <div className="hidden md:block">
          <div
            className="flex flex-col gap-3 pb-4 md:flex-row md:items-start md:justify-between md:gap-6 md:pb-5"
            style={{ borderBottom: "1px solid #D8D0BB" }}
          >
            <div className="flex flex-col gap-2">
              <span
                className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium text-white [font-family:Pretendard,system-ui,sans-serif]"
                style={{ backgroundColor: badge.bg }}
              >
                {badge.label}
              </span>
              <h1
                className="text-lg leading-snug font-bold text-gray-900 md:text-2xl"
                style={{ letterSpacing: "-0.02em" }}
              >
                {article.title}
              </h1>
            </div>
            <span className="shrink-0 text-xs text-gray-400 md:pt-1 md:text-sm">
              {formatDateTime(displayAt)}
              <span className="mx-2 text-gray-300">·</span>
              조회 {formatViewCount(article.view_count)}
            </span>
          </div>

          {article.thumbnail_url ? (
            <div className="py-6">
              <img
                src={article.thumbnail_url}
                alt=""
                className="max-h-[520px] w-full rounded-xl object-cover"
              />
            </div>
          ) : null}

          <div
            className={articleClassDesktop}
            style={{ minHeight: "200px" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* 공지사항 상세와 동일: 이전글 · 목록 · 다음글 */}
          <div className="flex flex-col items-center gap-[60px]">
            <div className="flex w-full max-w-full items-center justify-center gap-[60px] pt-[100px]">
              <div className="min-w-0 flex-1">
                {prev ? (
                  <Link
                    to={`/media/news/${prev.news_id}`}
                    className={cn(
                      nanum,
                      "flex h-[66px] min-h-[66px] items-center gap-[30px] overflow-hidden rounded-[40px] px-10 py-[11px] text-base font-bold leading-[20.8px] text-[#003F2B] transition-opacity hover:opacity-90",
                    )}
                  >
                    <ChevronLeft
                      className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span className="shrink-0">이전글</span>
                    <span className="min-w-0 flex-1 truncate">{prev.title}</span>
                  </Link>
                ) : (
                  <div className="h-[66px]" aria-hidden />
                )}
              </div>

              <Link
                to="/media/news"
                className={cn(
                  nanum,
                  "shrink-0 rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 text-center text-base font-extrabold leading-[20.8px] text-[#003F2B] transition-colors hover:brightness-95",
                )}
              >
                목록
              </Link>

              <div className="min-w-0 flex-1">
                {next ? (
                  <Link
                    to={`/media/news/${next.news_id}`}
                    className={cn(
                      nanum,
                      "flex h-[66px] min-h-[66px] items-center gap-[30px] overflow-hidden rounded-[40px] px-10 py-[11px] text-base font-bold leading-[20.8px] text-[#003F2B] transition-opacity hover:opacity-90",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate text-right">
                      {next.title}
                    </span>
                    <span className="flex w-[92px] shrink-0 items-center justify-between">
                      <span>다음글</span>
                      <ChevronRight
                        className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                  </Link>
                ) : (
                  <div className="h-[66px]" aria-hidden />
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
