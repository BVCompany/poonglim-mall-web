/**
 * 자료실 상세 페이지 (모바일 레이아웃은 등급판정서 상세와 동일 — SupportArticleDetailMobile)
 */
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/resources-detail";
import { SupportArticleDetailMobile } from "~/features/support/components/support-article-detail-mobile";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
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
    <div className="min-h-screen bg-[#F4F2E5]">
      <PageBanner
        imageUrl="/banner/rating_banner_temp.png"
        title="자료실"
        subtitle="풍림푸드의 다양한 자료를 확인하실 수 있습니다."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "자료실", href: "/support/resources" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="max-md:pt-0 pb-[120px] pt-6 md:pt-[100px] md:pb-[200px]">
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

        <div className="hidden md:block">
          <div
            className="flex flex-col gap-1 pb-4 md:flex-row md:items-start md:justify-between md:gap-6 md:pb-5"
            style={{ borderBottom: "1px solid #D8D0BB" }}
          >
            <h1
              className="text-lg font-bold leading-snug text-gray-900 md:text-2xl"
              style={{ letterSpacing: "-0.02em" }}
            >
              {resource.title}
            </h1>
            <span className="shrink-0 text-xs text-gray-400 md:pt-1 md:text-sm">
              {formatDateTime(resource.created_at)}
            </span>
          </div>

          <div
            className="flex flex-col gap-3 py-3 text-xs text-gray-500 md:flex-row md:items-center md:justify-between md:gap-5 md:py-4 md:text-sm"
            style={{ borderBottom: "1px solid #D8D0BB" }}
          >
            <div className="flex flex-wrap items-center gap-3 md:gap-5">
              <span>
                글쓴이: <span className="text-gray-700">{resource.author}</span>
              </span>
              <span>
                조회수:{" "}
                <span className="text-gray-700">{resource.view_count}</span>
              </span>
              <span
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
              >
                {resource.category}
              </span>
            </div>

            <a
              href={resource.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all hover:brightness-95 active:scale-95"
              style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
            >
              <span>첨부 {resource.file_name}</span>
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>

          <div
            className="prose prose-sm max-w-none py-8 leading-relaxed text-gray-700 md:py-10"
            style={{ minHeight: "200px" }}
            dangerouslySetInnerHTML={{
              __html: resource.content.replace(/\n/g, "<br/>"),
            }}
          />

          <div
            className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-8"
            style={{ borderTop: "1px solid #D8D0BB" }}
          >
            <div className="flex-1">
              {prev ? (
                <Link
                  to={prev.href}
                  className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
                >
                  <span className="font-medium text-gray-400">이전글</span>
                  <span className="line-clamp-1 max-w-[200px] md:max-w-[280px]">
                    {prev.title}
                  </span>
                  <ChevronLeft className="hidden h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5 md:block" />
                </Link>
              ) : (
                <span className="text-sm text-gray-300">이전글이 없습니다.</span>
              )}
            </div>

            <div className="flex-1 text-right">
              {next ? (
                <Link
                  to={next.href}
                  className="group inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#02633E]"
                >
                  <span className="line-clamp-1 max-w-[200px] md:max-w-[280px]">
                    {next.title}
                  </span>
                  <span className="font-medium text-gray-400">다음글</span>
                  <ChevronRight className="hidden h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 md:block" />
                </Link>
              ) : (
                <span className="text-sm text-gray-300">다음글이 없습니다.</span>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/support/resources"
              className="shrink-0 rounded-full px-8 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:brightness-95"
              style={{ backgroundColor: "#EAE3C9" }}
            >
              목록
            </Link>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
