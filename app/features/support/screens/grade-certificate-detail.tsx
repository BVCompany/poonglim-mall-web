/**
 * 등급판정서 상세 페이지
 */
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/grade-certificate-detail";
import { SupportArticleDetailMobile } from "~/features/support/components/support-article-detail-mobile";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import {
  getAdjacentCerts,
  getGradeCertById,
  hasAnyActiveGradeCertificates,
  incrementCertViewCount,
} from "../lib/queries.server";

/* ── 더미 데이터 ── */
const MOCK_MAP: Record<
  number,
  {
    cert_id: number;
    tab: "current" | "archive";
    cert_type: string;
    title: string;
    content: string;
    author: string;
    file_url: string | null;
    file_name: string | null;
    view_count: number;
    is_active: boolean;
    created_at: string;
  }
> = {
  12: {
    cert_id: 12,
    tab: "current",
    cert_type: "액란",
    title: "02/25 등급판정서 (액란용)",
    content: "02/25 등급판정서를 올려드리오니 업무에 참고 부탁드립니다.",
    author: "풍림푸드",
    file_url: "#",
    file_name: "6004-02250002.pdf",
    view_count: 1,
    is_active: true,
    created_at: "2026-02-18T14:44:00",
  },
  11: {
    cert_id: 11,
    tab: "current",
    cert_type: "포장란",
    title: "02/24 등급판정서 (포장란용)",
    content: "02/24 등급판정서를 출력드리오니 업무에 참고 부탁드립니다.",
    author: "풍림푸드",
    file_url: "#",
    file_name: "6004-02250001.pdf",
    view_count: 88,
    is_active: true,
    created_at: "2026-02-17T09:00:00",
  },
};

const MOCK_ADJACENT: Record<
  number,
  {
    prev: { cert_id: number; title: string } | null;
    next: { cert_id: number; title: string } | null;
  }
> = {
  12: {
    prev: { cert_id: 11, title: "02/24 등급판정서 (포장란용)" },
    next: null,
  },
  11: {
    prev: null,
    next: { cert_id: 12, title: "02/25 등급판정서 (액란용)" },
  },
};

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number(params.id);
  const pageBanner = await getPageBanner("grade-certificate").catch(() => null);

  let hasReal = false;
  try {
    hasReal = await hasAnyActiveGradeCertificates();
  } catch {
    hasReal = false;
  }

  let cert = null;
  let prev: { cert_id: number; title: string } | null = null;
  let next: { cert_id: number; title: string } | null = null;

  try {
    const row = await getGradeCertById(id);
    if (row?.is_active) {
      cert = row;
      await incrementCertViewCount(id);
      const adjacent = await getAdjacentCerts(id, row.tab);
      prev = adjacent.prev;
      next = adjacent.next;
    }
  } catch {
    /* DB 오류 시 목업 또는 404 */
  }

  if (!cert) {
    if (hasReal) {
      throw new Response("Not Found", { status: 404 });
    }
    const mock = MOCK_MAP[id];
    if (!mock) {
      throw new Response("Not Found", { status: 404 });
    }
    cert = mock as (typeof MOCK_MAP)[number];
    prev = MOCK_ADJACENT[id]?.prev ?? null;
    next = MOCK_ADJACENT[id]?.next ?? null;
  }

  return { cert, prev, next, pageBanner };
}

export function meta({ data }: Route.MetaArgs) {
  const title =
    (data as { cert?: { title: string } } | null)?.cert?.title ??
    "등급판정서 상세";
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

const nanum = "font-[family-name:var(--font-nanum)]";
const pretendard = "font-[Pretendard,system-ui,sans-serif]";

function certBodyHtml(content: string) {
  if (/<[a-z][\s\S]*>/i.test(content)) return content;
  return content.replace(/\n/g, "<br/>");
}

export default function GradeCertDetailScreen({ loaderData }: Route.ComponentProps) {
  const { cert, prev, next, pageBanner } = loaderData;

  const hasRealFileUrl = Boolean(
    cert.file_url && cert.file_url !== "#" && cert.file_url.length > 0,
  );
  const fileHref = hasRealFileUrl ? String(cert.file_url) : null;

  const articleClassPc = cn(
    "prose prose-sm max-w-none text-[#1F2121]",
    `${nanum} text-base font-normal leading-[22.4px]`,
    "prose-p:leading-[22.4px] prose-headings:text-[#1F2121]",
  );

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/rating_banner_temp.png"
        title="등급판정서"
        subtitle="계란 등급판정 결과를 공개하여 품질 신뢰를 높이고 있습니다"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "등급판정서", href: "/support/grade-certificate" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-0 pb-[120px] md:pb-[100px] md:pt-[60px]">
        <SupportArticleDetailMobile
          title={cert.title}
          createdAt={cert.created_at}
          author={cert.author}
          viewCount={cert.view_count}
          bodyPlain={cert.content}
          fileName={cert.file_name}
          fileUrl={cert.file_url}
          prev={
            prev
              ? {
                  href: `/support/grade-certificate/${prev.cert_id}`,
                  title: prev.title,
                }
              : null
          }
          next={
            next
              ? {
                  href: `/support/grade-certificate/${next.cert_id}`,
                  title: next.title,
                }
              : null
          }
          listHref="/support/grade-certificate"
        />

        {/* PC — 라이트 톤(페이지 #FDFDF5). 시안 HTML: 제목·본문 #1F2121, 첨부 pill #EAE3C9, 네비 #003F2B */}
        <div className="hidden md:flex md:flex-col md:gap-[30px]">
          <div className="border-b border-[#EAE3C9]">
            <div className="flex items-start justify-between gap-5 px-[30px] pb-[30px] pt-5">
              <h1
                className={cn(
                  nanum,
                  "min-w-0 flex-1 text-xl font-extrabold leading-[26px] text-[#1F2121]",
                )}
              >
                {cert.title}
              </h1>
              <time
                className={cn(
                  nanum,
                  "shrink-0 text-center text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]",
                )}
                dateTime={String(cert.created_at)}
              >
                {formatDateTime(cert.created_at)}
              </time>
            </div>
          </div>

          <div className="flex flex-col gap-5 pb-[200px]">
            <div className="flex flex-col rounded-[40px]">
              <div className="flex flex-col gap-[30px] px-[30px]">
                <div className="flex w-full min-w-0 items-center gap-5">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[9px]">
                    <div
                      className={cn(
                        pretendard,
                        "flex items-start gap-2.5 text-sm font-medium leading-[14px] text-[#1F2121]",
                      )}
                    >
                      <span>글쓴이:</span>
                      <span>{cert.author}</span>
                    </div>
                    <div
                      className={cn(
                        pretendard,
                        "flex items-start gap-2.5 text-sm font-medium leading-[14px] text-[#1F2121]",
                      )}
                    >
                      <span>조회수:</span>
                      <span>{cert.view_count}</span>
                    </div>
                  </div>
                  {cert.file_name ? (
                    fileHref ? (
                      <a
                        href={fileHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-[10px] rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 transition-opacity hover:opacity-90"
                      >
                        <span
                          className={cn(
                            nanum,
                            "text-base font-extrabold leading-[20.8px] text-[#1F2121]",
                          )}
                        >
                          첨부 {cert.file_name}
                        </span>
                        <Download
                          className="h-3.5 w-3.5 shrink-0 text-[#02633E]"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </a>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-[10px] rounded-[40px] bg-[#EAE3C9] px-5 py-2.5">
                        <span
                          className={cn(
                            nanum,
                            "text-base font-extrabold leading-[20.8px] text-[#1F2121]",
                          )}
                        >
                          첨부 {cert.file_name}
                        </span>
                        <Download
                          className="h-3.5 w-3.5 shrink-0 text-[#02633E]"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </span>
                    )
                  ) : null}
                </div>
                <div
                  className={articleClassPc}
                  dangerouslySetInnerHTML={{ __html: certBodyHtml(cert.content) }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-[60px]">
            <div className="flex w-full max-w-full items-center justify-center gap-[60px] pt-[100px]">
              <div className="min-w-0 flex-1">
                {prev ? (
                  <Link
                    to={`/support/grade-certificate/${prev.cert_id}`}
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
                to="/support/grade-certificate"
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
                    to={`/support/grade-certificate/${next.cert_id}`}
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
