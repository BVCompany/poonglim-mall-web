/**
 * 공지사항 상세 페이지
 */
import type { Route } from "./+types/notice-detail";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import {
  getAdjacentNotices,
  getNoticeById,
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


export async function loader({ params, request }: Route.LoaderArgs) {
  const id = Number(params.id);

  const pageBanner = await getPageBanner("notice").catch(() => null);

  let notice = null;
  let prev: { notice_id: number; title: string } | null = null;
  let next: { notice_id: number; title: string } | null = null;

  try {
    notice = await getNoticeById(id);
    if (notice) {
      await incrementNoticeViewCount(id);
      const adjacent = await getAdjacentNotices(id);
      prev = adjacent.prev;
      next = adjacent.next;
    }
  } catch {
    // DB 미연결 시 더미 데이터 사용
  }

  return { notice, prev, next, pageBanner, id };
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

export default function NoticeDetailScreen({
  loaderData,
}: Route.ComponentProps) {
  const {
    notice: dbNotice,
    prev: dbPrev,
    next: dbNext,
    pageBanner,
    id,
  } = loaderData;

  const notice = dbNotice ?? MOCK_MAP[id] ?? MOCK_MAP[12];
  const prev = dbPrev ?? MOCK_ADJACENT[id]?.prev ?? null;
  const next = dbNext ?? MOCK_ADJACENT[id]?.next ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 페이지 배너 ── */}
      <PageBanner
        imageUrl="/banner/notice_banner_temp.png"
        title="공지사항"
        subtitle="풍림푸드의 새로운 소식과 안내사항을 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "공지사항", href: "/support/notice" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      {/* ── 본문 ── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-6 pb-[120px] md:px-6 md:pt-[100px] md:pb-[200px] lg:px-10">
        {/* ── 제목 + 날짜 ── */}
        <div
          className="flex flex-col gap-1 pb-4 md:flex-row md:items-start md:justify-between md:gap-6 md:pb-5"
          style={{ borderBottom: "1px solid #D8D0BB" }}
        >
          <h1
            className="text-lg leading-snug font-bold text-gray-900 md:text-2xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {notice.title}
          </h1>
          <span className="shrink-0 text-xs text-gray-400 md:pt-1 md:text-sm">
            {formatDateTime(notice.created_at)}
          </span>
        </div>

        {/* ── 작성자 / 조회수 ── */}
        <div
          className="flex items-center gap-3 py-3 text-xs text-gray-500 md:gap-5 md:py-4 md:text-sm"
          style={{ borderBottom: "1px solid #D8D0BB" }}
        >
          <span>
            글쓴이: <span className="text-gray-700">{notice.author}</span>
          </span>
          <span>
            조회수: <span className="text-gray-700">{notice.view_count}</span>
          </span>
        </div>

        {/* ── 본문 콘텐츠 ── */}
        <div
          className="prose prose-sm max-w-none py-8 leading-relaxed text-gray-700 md:py-10"
          style={{ minHeight: "200px" }}
          dangerouslySetInnerHTML={{ __html: notice.content }}
        />

        {/* ── 이전글 / 다음글 ── */}
        <div
          className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-8"
          style={{ borderTop: "1px solid #D8D0BB" }}
        >
          <div className="flex-1">
            {prev ? (
              <Link
                to={`/support/notice/${prev.notice_id}`}
                className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
              >
                <span className="font-medium text-gray-400">이전글</span>
                <span className="line-clamp-1 max-w-[200px] md:max-w-[280px]">{prev.title}</span>
                <ChevronLeft className="hidden h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5 md:block" />
              </Link>
            ) : (
              <span className="text-sm text-gray-300">이전글이 없습니다.</span>
            )}
          </div>

          <div className="flex-1 text-right">
            {next ? (
              <Link
                to={`/support/notice/${next.notice_id}`}
                className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
              >
                <span className="line-clamp-1 max-w-[200px] md:max-w-[280px]">{next.title}</span>
                <span className="font-medium text-gray-400">다음글</span>
                <ChevronRight className="hidden h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 md:block" />
              </Link>
            ) : (
              <span className="text-sm text-gray-300">다음글이 없습니다.</span>
            )}
          </div>
        </div>

        {/* 목록 버튼 */}
        <div className="mt-6 flex justify-center">
          <Link
            to="/support/notice"
            className="shrink-0 rounded-full px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:brightness-95"
            style={{ backgroundColor: "#EAE3C9" }}
          >
            목록
          </Link>
        </div>
      </div>
    </div>
  );
}
