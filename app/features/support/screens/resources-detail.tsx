/**
 * 자료실 상세 페이지 (모바일 레이아웃은 등급판정서 상세와 동일 — SupportArticleDetailMobile)
 */
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Route } from "./+types/resources-detail";

import { SupportArticleDetailMobile } from "~/features/support/components/support-article-detail-mobile";
import { PageBanner } from "~/core/components/page-banner";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { PageContentMax } from "~/core/components/page-content-max";
import { adminContentToHtml } from "~/core/lib/content-html";
import { pc1920 } from "~/core/lib/pc-fluid";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import {
  getAdjacentLibraryResources,
  getLibraryResourceById,
  incrementLibraryResourceViewCount,
} from "~/features/support/lib/queries.server";
import i18next from "~/core/lib/i18next.server";

type ResourceDetail = {
  id: number;
  title: string;
  category: string;
  content: string;
  author: string;
  view_count: number;
  publishedAt: string;
  file_name: string;
  file_url: string;
  cover_image_url: string | null;
};


export async function loader({ params, request }: Route.LoaderArgs) {
  const id = Number(params.id);
  const pageBanner = await getPageBanner("resources").catch(() => null);
  const t = await i18next.getFixedT(request);

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
          publishedAt: row.published_at.toISOString(),
          file_name: row.file_name,
          file_url: row.file_url,
          cover_image_url: row.cover_image_url ?? null,
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
      /* no-op */
    }
  }

  if (!resource) {
    throw new Response("Not Found", { status: 404 });
  }

  const metaTitle = `${resource.title} | ${t("common.metaTitleSuffix")}`;

  return { resource, prev, next, pageBanner, metaTitle };
}

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle },
];

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
  const { t } = useTranslation();
  const { resource, prev, next, pageBanner } = loaderData;
  const bodyHtml = adminContentToHtml(resource.content);

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/rating_banner_temp.png"
        title={t("pages.resources.title")}
        subtitle={t("pages.resources.subtitleDetail")}
        breadcrumb={[
          { label: t("common.breadcrumbHome"), href: "/" },
          { label: t("navigation.support.title"), href: "/support" },
          { label: t("navigation.links.resources"), href: "/support/resources" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="max-md:pt-0 pb-[120px] pt-6 md:pt-[60px] md:pb-[100px]">
        <SupportArticleDetailMobile
          title={resource.title}
          createdAt={resource.publishedAt}
          author={resource.author}
          viewCount={resource.view_count}
          coverImageUrl={resource.cover_image_url}
          bodyHtml={bodyHtml}
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
                  {formatDateTime(resource.publishedAt)}
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
                      <span>{t("pages.supportArticle.author")}</span>
                      <span>{resource.author}</span>
                    </span>
                    <span className="inline-flex items-baseline gap-2.5 text-sm font-medium leading-[14px] text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif]">
                      <span>{t("pages.supportArticle.views")}</span>
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

                {resource.cover_image_url ? (
                  <figure className="m-0 w-full">
                    <img
                      src={resource.cover_image_url}
                      alt={resource.title}
                      className="mx-auto block max-h-[min(520px,70vh)] w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                ) : null}

                <div
                  className="font-[NanumSquareRound,sans-serif] text-base font-normal leading-[22.4px] text-[#1F2121]"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
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
                    <span className="shrink-0">{t("pages.supportArticle.prev")}</span>
                    <span className="min-w-0 flex-1 truncate">{prev.title}</span>
                  </Link>
                ) : (
                  <div className="flex h-[66px] items-center px-10 text-base text-[#1F2121]/35">
                    {t("pages.supportArticle.noPrev")}
                  </div>
                )}
              </div>

              <Link
                to="/support/resources"
                className="inline-flex shrink-0 items-center justify-center rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 font-[NanumSquareRound,sans-serif] text-base font-extrabold leading-[20.8px] text-[#003F2B] no-underline transition-colors hover:brightness-[0.98]"
              >
                {t("pages.supportArticle.list")}
              </Link>

              <div className="min-w-0 flex-1 basis-[280px]">
                {next ? (
                  <Link
                    to={next.href}
                    className="flex h-[66px] min-h-[66px] items-center gap-[30px] overflow-hidden rounded-[40px] px-10 py-[11px] font-[NanumSquareRound,sans-serif] text-base font-bold leading-[20.8px] text-[#003F2B] no-underline transition-opacity hover:opacity-80"
                  >
                    <span className="min-w-0 flex-1 truncate">{next.title}</span>
                    <div className="flex w-[92px] shrink-0 items-center justify-end gap-5">
                      <span>{t("pages.supportArticle.next")}</span>
                      <ChevronRight
                        className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                  </Link>
                ) : (
                  <div className="flex h-[66px] items-center justify-end px-10 text-base text-[#1F2121]/35">
                    {t("pages.supportArticle.noNext")}
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
