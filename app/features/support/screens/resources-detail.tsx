/**
 * 자료실 상세 페이지 (모바일 레이아웃은 등급판정서 상세와 동일 — SupportArticleDetailMobile)
 */
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/resources-detail";
import { SupportArticleDetailMobile } from "~/features/support/components/support-article-detail-mobile";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { pc1920 } from "~/core/lib/pc-fluid";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import {
  getAdjacentLibraryResources,
  getLibraryResourceById,
  hasAnyActiveLibraryResources,
  incrementLibraryResourceViewCount,
} from "~/features/support/lib/queries.server";

type ResourceDetail = {
  id: number;
  title: string;
  category: string;
  content: string;
  author: string;
  view_count: number;
  created_at: string;
  file_name: string;
  file_url: string;
};

/** `resources.tsx` 목록과 id·제목·파일을 맞춘 더미 (DB 연동 시 loader만 교체) */
const MOCK_MAP: Record<number, ResourceDetail> = {
  10: {
    id: 10,
    category: "인증서",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 42,
    created_at: "2026-02-16T12:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  9: {
    id: 9,
    category: "카탈로그",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 38,
    created_at: "2026-02-16T11:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  8: {
    id: 8,
    category: "기타",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 35,
    created_at: "2026-02-16T10:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  7: {
    id: 7,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 31,
    created_at: "2026-02-16T09:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  6: {
    id: 6,
    category: "인증서",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 28,
    created_at: "2026-02-16T08:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  5: {
    id: 5,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 24,
    created_at: "2026-02-16T07:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  4: {
    id: 4,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 20,
    created_at: "2026-02-16T06:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  3: {
    id: 3,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 16,
    created_at: "2026-02-16T05:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  2: {
    id: 2,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 12,
    created_at: "2026-02-16T04:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
  1: {
    id: 1,
    category: "회사소개",
    title: "2026년 풍림푸드 종합 제품 카탈로그",
    content:
      "자료를 올려드리오니 업무에 참고 부탁드립니다. 첨부 파일을 내려받아 활용해 주세요.",
    author: "풍림푸드",
    view_count: 8,
    created_at: "2026-02-16T03:00:00",
    file_name: "풍림푸드_카탈로그_2026.pdf",
    file_url: "#",
  },
};

function adjacentFor(id: number): {
  prev: { href: string; title: string } | null;
  next: { href: string; title: string } | null;
} {
  const prevRow = MOCK_MAP[id - 1];
  const nextRow = MOCK_MAP[id + 1];
  return {
    prev: prevRow
      ? { href: `/support/resources/${prevRow.id}`, title: prevRow.title }
      : null,
    next: nextRow
      ? { href: `/support/resources/${nextRow.id}`, title: nextRow.title }
      : null,
  };
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  const pageBanner = await getPageBanner("resources").catch(() => null);

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveLibraryResources();
  } catch {
    hasReal = false;
  }

  type PrevNext = { href: string; title: string } | null;
  let resource: ResourceDetail | null = null;
  let prev: PrevNext = null;
  let next: PrevNext = null;

  if (Number.isFinite(id)) {
    try {
      const row = await getLibraryResourceById(id);
      if (row) {
        await incrementLibraryResourceViewCount(id).catch(() => null);
        resource = {
          id: row.resource_id,
          category: row.category,
          title: row.title,
          content: row.content,
          author: row.author,
          view_count: row.view_count + 1,
          created_at: row.created_at.toISOString(),
          file_name: row.file_name,
          file_url: row.file_url,
        };
        const adj = await getAdjacentLibraryResources(id).catch(() => ({
          prev: null,
          next: null,
        }));
        prev = adj.prev
          ? { href: `/support/resources/${adj.prev.resource_id}`, title: adj.prev.title }
          : null;
        next = adj.next
          ? { href: `/support/resources/${adj.next.resource_id}`, title: adj.next.title }
          : null;
      }
    } catch {
      /* DB 오류 시 목업 분기 */
    }
  }

  if (!resource) {
    if (hasReal) {
      throw new Response("Not Found", { status: 404 });
    }
    const mock = Number.isFinite(id) ? MOCK_MAP[id] : undefined;
    if (!mock) {
      throw new Response("Not Found", { status: 404 });
    }
    resource = mock;
    const a = adjacentFor(id);
    prev = a.prev;
    next = a.next;
  }

  return { resource, prev, next, pageBanner };
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.resource?.title ?? "자료실";
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

export default function ResourcesDetailScreen({ loaderData }: Route.ComponentProps) {
  const { resource, prev, next, pageBanner } = loaderData;

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      <PageBanner
        imageUrl="/banner/rating_banner_temp.png"
        title="자료실"
        subtitle="카탈로그, 인증서, 회사소개서 등 각종 자료를 다운로드하실 수 있습니다."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "자료실", href: "/support/resources" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="max-md:pt-0 pb-[120px] pt-6 md:pt-[60px] md:pb-[100px]">
        <SupportArticleDetailMobile
          title={resource.title}
          createdAt={resource.created_at}
          author={resource.author}
          viewCount={resource.view_count}
          bodyPlain={resource.content}
          fileName={resource.file_name}
          fileUrl={resource.file_url}
          prev={prev}
          next={next}
          listHref="/support/resources"
        />

        {/* PC 본문 — 시안: 컬럼 gap 30px / 제목행·본문(pb200)·하단네비(pt100, gap60) */}
        <div className="hidden md:flex md:flex-col" style={{ gap: pc1920(12, 30) }}>
          <div className="w-full border-b border-[#EAE3C9]">
            <div
              className="flex items-center gap-5"
              style={{
                paddingTop: pc1920(16, 20),
                paddingBottom: pc1920(20, 30),
                paddingLeft: pc1920(16, 30),
                paddingRight: pc1920(16, 30),
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-3 py-2 text-center text-xs font-medium leading-3 text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]">
                    {resource.category}
                  </span>
                  <h1
                    className="min-w-0 font-[NanumSquareRound,sans-serif] font-extrabold text-[#1F2121]"
                    style={{
                      fontSize: pc1920(16, 20),
                      lineHeight: pc1920(22, 26),
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {resource.title}
                  </h1>
                </div>
                <span className="shrink-0 text-center font-[NanumSquareRound,sans-serif] text-sm font-normal leading-[19.6px] text-[#1F2121]">
                  {formatDateTime(resource.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex w-full flex-col gap-5"
            style={{ paddingBottom: pc1920(80, 200) }}
          >
            <div className="flex flex-col rounded-[40px]">
              <div
                className="flex flex-col gap-[30px]"
                style={{
                  paddingLeft: pc1920(16, 30),
                  paddingRight: pc1920(16, 30),
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <div className="flex flex-wrap items-center gap-[9px]">
                    <span className="inline-flex items-baseline gap-2.5 text-sm font-medium leading-[14px] text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]">
                      <span>글쓴이:</span>
                      <span>{resource.author}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-2.5 text-sm font-medium leading-[14px] text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]">
                      <span>조회수:</span>
                      <span className="tabular-nums">{resource.view_count}</span>
                    </span>
                  </div>
                  <a
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2.5 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 font-[NanumSquareRound,sans-serif] text-base font-extrabold leading-[20.8px] text-[#1F2121] no-underline transition-colors hover:brightness-[0.98]"
                  >
                    <span className="min-w-0 truncate">{resource.file_name}</span>
                    <Download
                      className="h-3.5 w-3.5 shrink-0 text-[#02633E]"
                      strokeWidth={2.25}
                      aria-hidden
                    />
                  </a>
                </div>

                <div
                  className="font-[NanumSquareRound,sans-serif] text-base font-normal leading-[22.4px] text-[#1F2121]"
                  dangerouslySetInnerHTML={{
                    __html: resource.content.trim().startsWith("<")
                      ? resource.content
                      : resource.content.replace(/\n/g, "<br/>"),
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className="flex flex-col items-center gap-[60px]"
            style={{ paddingTop: pc1920(48, 100) }}
          >
            <div className="flex w-full flex-wrap items-center justify-center gap-[30px] md:flex-nowrap md:gap-[60px]">
              <div className="min-w-0 flex-1 basis-[280px]">
                {prev ? (
                  <Link
                    to={prev.href}
                    className="flex h-[66px] min-h-[66px] items-center gap-[30px] overflow-hidden rounded-[40px] px-10 py-[11px] font-[NanumSquareRound,sans-serif] text-base font-bold leading-[20.8px] text-[#003F2B] no-underline transition-opacity hover:opacity-80"
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
                  <div className="flex h-[66px] items-center px-10 text-base text-[#1F2121]/35">
                    이전글이 없습니다.
                  </div>
                )}
              </div>

              <Link
                to="/support/resources"
                className="inline-flex shrink-0 items-center justify-center rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 font-[NanumSquareRound,sans-serif] text-base font-extrabold leading-[20.8px] text-[#003F2B] no-underline transition-colors hover:brightness-[0.98]"
              >
                목록
              </Link>

              <div className="min-w-0 flex-1 basis-[280px]">
                {next ? (
                  <Link
                    to={next.href}
                    className="flex h-[66px] min-h-[66px] items-center gap-[30px] overflow-hidden rounded-[40px] px-10 py-[11px] font-[NanumSquareRound,sans-serif] text-base font-bold leading-[20.8px] text-[#003F2B] no-underline transition-opacity hover:opacity-80"
                  >
                    <span className="min-w-0 flex-1 truncate">{next.title}</span>
                    <div className="flex w-[92px] shrink-0 items-center justify-end gap-5">
                      <span>다음글</span>
                      <ChevronRight
                        className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                  </Link>
                ) : (
                  <div className="flex h-[66px] items-center justify-end px-10 text-base text-[#1F2121]/35">
                    다음글이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
