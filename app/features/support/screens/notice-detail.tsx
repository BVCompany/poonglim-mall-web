/**
 * 공지사항 상세 페이지
 */
import type { Route } from "./+types/notice-detail";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import {
  getAdjacentNotices,
  getNoticeById,
  hasAnyActiveNotices,
  incrementNoticeViewCount,
} from "../lib/queries.server";

/* ── 더미 데이터 ── */
const MOCK_MAP: Record<
  number,
  {
    notice_id: number;
    category: string;
    title: string;
    content: string;
    author: string;
    view_count: number;
    is_pinned: boolean;
    tags: string[];
    created_at: string;
  }
> = {
  12: {
    notice_id: 12,
    category: "공지",
    title: "2026년 설 연휴 배송 안내",
    content: `<p>안녕하세요, 풍림푸드입니다.</p>
<p>설 연휴 기간 배송 일정을 아래와 같이 안내드립니다.</p>
<br/>
<p><strong>휴무 기간:</strong> 2026년 1월 28일(수) ~ 2월 2일(월)</p>
<p><strong>배송 재개:</strong> 2026년 2월 3일(화)부터 정상 배송</p>
<br/>
<p>연휴 전 주문 마감일: 1월 27일(화) 오후 2시</p>
<p>연휴 기간 중 주문건은 2월 3일부터 순차적으로 처리됩니다.</p>
<br/>
<p>불편을 드려 죄송합니다. 감사합니다.</p>`,
    author: "풍림푸드",
    view_count: 1,
    is_pinned: true,
    tags: ["공고"],
    created_at: "2026-02-18T14:44:00",
  },
  11: {
    notice_id: 11,
    category: "안내",
    title: "풍림푸드 홈페이지 리뉴얼 안내",
    content: `<p>안녕하세요, 풍림푸드입니다.</p>
<p>풍림푸드 공식 홈페이지가 새롭게 리뉴얼되었습니다.</p>
<br/>
<p>이번 리뉴얼에서는 사용자 편의성을 대폭 개선하고, 더욱 풍성한 콘텐츠로 찾아뵙겠습니다.</p>
<br/>
<p>주요 변경 사항:</p>
<ul>
  <li>모바일 최적화 반응형 디자인 적용</li>
  <li>제품 소개 페이지 전면 개편</li>
  <li>레시피 섹션 신설</li>
  <li>고객지원 강화</li>
</ul>
<br/>
<p>앞으로도 풍림푸드를 많이 사랑해주세요. 감사합니다.</p>`,
    author: "풍림푸드",
    view_count: 312,
    is_pinned: true,
    tags: ["회사소개"],
    created_at: "2026-02-16T10:00:00",
  },
};

const MOCK_ADJACENT: Record<
  number,
  {
    prev: { notice_id: number; title: string } | null;
    next: { notice_id: number; title: string } | null;
  }
> = {
  12: {
    prev: { notice_id: 11, title: "풍림푸드 홈페이지 리뉴얼 안내" },
    next: null,
  },
  11: {
    prev: null,
    next: { notice_id: 12, title: "2026년 설 연휴 배송 안내" },
  },
};


export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);

  const pageBanner = await getPageBanner("notice").catch(() => null);

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveNotices();
  } catch {
    hasReal = false;
  }

  let notice = null;
  let prev: { notice_id: number; title: string } | null = null;
  let next: { notice_id: number; title: string } | null = null;

  try {
    const row = await getNoticeById(id);
    if (row?.is_active) {
      notice = row;
      await incrementNoticeViewCount(id);
      const adjacent = await getAdjacentNotices(id);
      prev = adjacent.prev;
      next = adjacent.next;
    }
  } catch {
    /* DB 오류 시 목업 또는 404 */
  }

  if (!notice) {
    if (hasReal) {
      throw new Response("Not Found", { status: 404 });
    }
    const mock = MOCK_MAP[id];
    if (!mock) {
      throw new Response("Not Found", { status: 404 });
    }
    notice = mock as (typeof MOCK_MAP)[number];
    prev = MOCK_ADJACENT[id]?.prev ?? null;
    next = MOCK_ADJACENT[id]?.next ?? null;
  }

  return { notice, prev, next, pageBanner };
}

export function meta({ data }: Route.MetaArgs) {
  const title =
    (data as { notice?: { title: string } } | null)?.notice?.title ??
    "공지사항 상세";
  return [{ title: `${title} | 풍림푸드` }];
}

/* ── 날짜 포맷 ── */
function formatDateTime(val: string | Date) {
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

const nanum = "font-[family-name:var(--font-nanum)]";

export default function NoticeDetailScreen({
  loaderData,
}: Route.ComponentProps) {
  const { notice, prev, next, pageBanner } = loaderData;

  const articleClassMobile = cn(
    "prose prose-sm max-w-none text-[#1F2121]",
    `${nanum} text-base font-normal leading-[22.4px]`,
    "prose-p:leading-[22.4px] prose-headings:text-[#1F2121]",
  );

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/notice_banner_temp.png"
        title="공지사항"
        subtitle="계란 등급판정 결과를 공개하여 품질 신뢰를 높이고 있습니다"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "공지사항", href: "/support/notice" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-0 pb-[120px] md:pb-[100px] md:pt-[60px]">
        {/* ── 모바일 본문 (Figma 375) ── */}
        <div className="flex flex-col gap-0 md:hidden">
          {/* 제목 + 날짜: 가로 여백은 PageContentMax(px-4) 한 번만 · 열 gap 20px · 날짜는 제목과 동일 왼쪽 정렬 */}
          <div className="border-b border-[#EAE3C9] py-5">
            <div className="flex flex-col items-start justify-center gap-5">
              <div className="flex w-full items-center gap-3 self-stretch">
                <h1
                  className={cn(
                    nanum,
                    "min-w-0 flex-1 text-2xl font-extrabold leading-[31.2px] text-[#1F2121]",
                  )}
                >
                  {notice.title}
                </h1>
              </div>
              <p
                className={cn(
                  nanum,
                  "w-full text-left text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]",
                )}
              >
                {formatDateTime(notice.created_at)}
              </p>
            </div>
          </div>

          <div className="border-b border-[#EAE3C9] pt-5 pb-[200px]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={cn(
                    nanum,
                    "inline-flex items-center gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
                  )}
                >
                  <span>글쓴이:</span>
                  <span>{notice.author}</span>
                </span>
                <span
                  className={cn(
                    nanum,
                    "inline-flex items-center gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
                  )}
                >
                  <span>조회수:</span>
                  <span>{notice.view_count}</span>
                </span>
              </div>
              <div className="pt-2.5">
                <div
                  className={articleClassMobile}
                  dangerouslySetInnerHTML={{ __html: notice.content }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-[60px]">
            <div className="flex w-full flex-col gap-2.5 pt-10">
              {prev ? (
                <Link
                  to={`/support/notice/${prev.notice_id}`}
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
                  to={`/support/notice/${next.notice_id}`}
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
              to="/support/notice"
              className={cn(
                nanum,
                "w-full rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 text-center text-base font-extrabold leading-[20.8px] text-[#003F2B] transition-colors active:brightness-95",
              )}
            >
              목록
            </Link>
          </div>
        </div>

        <div className="hidden md:flex md:flex-col md:gap-[30px]">
          <div className="border-b border-[#EAE3C9]">
            <div className="flex items-start justify-between gap-5 px-[30px] pb-[30px] pt-5">
              <h1
                className={cn(
                  nanum,
                  "min-w-0 flex-1 text-2xl font-extrabold leading-[31.2px] text-[#1F2121]",
                )}
              >
                {notice.title}
              </h1>
              <time
                className={cn(
                  nanum,
                  "shrink-0 text-center text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]",
                )}
                dateTime={String(notice.created_at)}
              >
                {formatDateTime(notice.created_at)}
              </time>
            </div>
          </div>

          {/* 시안: padding-bottom 200px · 내부 column gap 20px · rounded-[40px] 래퍼 안 gap 30px */}
          <div className="flex flex-col gap-5 border-b border-[#EAE3C9] pb-[200px]">
            <div className="flex flex-col rounded-[40px]">
              <div className="flex flex-col gap-[30px] px-[30px]">
                <div className="flex min-h-[41px] flex-wrap items-center gap-[9px]">
                  <span
                    className={cn(
                      nanum,
                      "inline-flex items-center gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
                    )}
                  >
                    <span>글쓴이:</span>
                    <span>{notice.author}</span>
                  </span>
                  <span
                    className={cn(
                      nanum,
                      "inline-flex items-center gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
                    )}
                  >
                    <span>조회수:</span>
                    <span>{notice.view_count}</span>
                  </span>
                </div>
                <div
                  className={articleClassMobile}
                  dangerouslySetInnerHTML={{ __html: notice.content }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-[60px]">
            <div className="flex w-full max-w-full items-center justify-center gap-[60px] pt-[100px]">
              <div className="min-w-0 flex-1">
                {prev ? (
                  <Link
                    to={`/support/notice/${prev.notice_id}`}
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
                to="/support/notice"
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
                    to={`/support/notice/${next.notice_id}`}
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
