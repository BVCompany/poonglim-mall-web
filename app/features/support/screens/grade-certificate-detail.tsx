/**
 * 등급판정서 상세 페이지
 */
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Link } from "react-router";
import type { Route } from "./+types/grade-certificate-detail";
import { PageBanner } from "~/core/components/page-banner";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import {
  getAdjacentCerts,
  getGradeCertById,
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
    content: "02/25 등급판정서를 출력드리오니 업무에 참고 부탁드립니다.",
    author: "풍림푸드",
    file_url: null,
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
    file_url: null,
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

  let cert = null;
  let prev: { cert_id: number; title: string } | null = null;
  let next: { cert_id: number; title: string } | null = null;

  try {
    cert = await getGradeCertById(id);
    if (cert) {
      await incrementCertViewCount(id);
      const adjacent = await getAdjacentCerts(id, cert.tab);
      prev = adjacent.prev;
      next = adjacent.next;
    }
  } catch {
    // DB 미연결 → 더미 데이터
  }

  return { cert, prev, next, pageBanner, id };
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

export default function GradeCertDetailScreen({ loaderData }: Route.ComponentProps) {
  const { cert: dbCert, prev: dbPrev, next: dbNext, pageBanner, id } = loaderData;

  const cert = dbCert ?? MOCK_MAP[id] ?? MOCK_MAP[12];
  const prev = dbPrev ?? MOCK_ADJACENT[id]?.prev ?? null;
  const next = dbNext ?? MOCK_ADJACENT[id]?.next ?? null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      {/* ── 배너 ── */}
      <PageBanner
        imageUrl="/banner/rating_banner_temp.png"
        title="등급판정서"
        subtitle="계란 농장판정 결과를 공개하여 품질 신뢰를 높이고 있습니다."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "등급판정서", href: "/support/grade-certificate" },
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
            className="text-lg font-bold leading-snug text-gray-900 md:text-2xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {cert.title}
          </h1>
          <span className="shrink-0 text-xs text-gray-400 md:pt-1 md:text-sm">
            {formatDateTime(cert.created_at)}
          </span>
        </div>

        {/* ── 작성자 / 조회수 / 첨부파일 ── */}
        <div
          className="flex flex-col gap-3 py-3 text-xs text-gray-500 md:flex-row md:items-center md:justify-between md:gap-5 md:py-4 md:text-sm"
          style={{ borderBottom: "1px solid #D8D0BB" }}
        >
          <div className="flex items-center gap-3 md:gap-5">
            <span>
              글쓴이: <span className="text-gray-700">{cert.author}</span>
            </span>
            <span>
              조회수: <span className="text-gray-700">{cert.view_count}</span>
            </span>
          </div>

          {cert.file_name && (
            <a
              href={cert.file_url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all hover:brightness-95 active:scale-95 md:px-4 md:py-2 md:text-xs"
              style={{ backgroundColor: "#EAE3C9", color: "#003F2B" }}
            >
              <span>첨부 {cert.file_name}</span>
              <Download className="h-3 w-3 md:h-3.5 md:w-3.5" />
            </a>
          )}
        </div>

        {/* ── 본문 콘텐츠 ── */}
        <div
          className="prose prose-sm max-w-none py-8 leading-relaxed text-gray-700 md:py-10"
          style={{ minHeight: "200px" }}
          dangerouslySetInnerHTML={{ __html: cert.content.replace(/\n/g, "<br/>") }}
        />

        {/* ── 이전글 / 다음글 ── */}
        <div
          className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-8"
          style={{ borderTop: "1px solid #D8D0BB" }}
        >
          <div className="flex-1">
            {prev ? (
              <Link
                to={`/support/grade-certificate/${prev.cert_id}`}
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
                to={`/support/grade-certificate/${next.cert_id}`}
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
            to="/support/grade-certificate"
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
