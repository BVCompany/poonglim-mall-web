/**
 * 고객지원 게시형 상세 — 모바일 시안 (등급판정서·자료실·공지 등 공통)
 */
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";

const nanum = "font-[family-name:var(--font-nanum)]";

function formatDateTime(val: string | Date) {
  const d = new Date(val);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export type SupportArticleDetailMobileProps = {
  title: string;
  createdAt: string | Date;
  author: string;
  viewCount: number;
  /** HTML 본문 (자료실·공지 등) */
  bodyHtml?: string;
  /** 순수 텍스트 본문 (줄바꿈 → br) */
  bodyPlain?: string;
  fileName?: string | null;
  fileUrl?: string | null;
  prev: { href: string; title: string } | null;
  next: { href: string; title: string } | null;
  listHref: string;
};

export function SupportArticleDetailMobile({
  title,
  createdAt,
  author,
  viewCount,
  bodyHtml,
  bodyPlain,
  fileName,
  fileUrl,
  prev,
  next,
  listHref,
}: SupportArticleDetailMobileProps) {
  const { t } = useTranslation();
  const attachmentHref =
    fileUrl && fileUrl !== "#" && fileUrl.length > 0 ? fileUrl : null;

  const articleClass = cn(
    nanum,
    "max-w-none w-full min-h-[44px] text-base font-normal uppercase leading-[22.4px] text-[#1F2121]",
  );
  const articleClassHtml = cn(
    nanum,
    "max-w-none w-full min-h-[44px] text-base font-normal leading-[22.4px] text-[#1F2121]",
  );

  return (
    <div className="flex flex-col gap-0 md:hidden">
      <div className="border-b border-[#EAE3C9] py-5">
        <div className="flex flex-col items-start justify-center gap-5">
          <div className="flex w-full items-center gap-3 self-stretch">
            <h1
              className={cn(
                nanum,
                "min-w-0 flex-1 text-2xl font-extrabold leading-[31.2px] text-[#1F2121]",
              )}
            >
              {title}
            </h1>
          </div>
          <p
            className={cn(
              nanum,
              "w-full text-left text-sm font-normal uppercase leading-[19.6px] text-[#1F2121]",
            )}
          >
            {formatDateTime(createdAt)}
          </p>
        </div>
      </div>

      <div className="border-b border-[#EAE3C9] pt-5 pb-[200px]">
        <div className="flex flex-col gap-5">
          <div className="inline-flex flex-wrap items-center gap-2.5">
            <span
              className={cn(
                nanum,
                "inline-flex items-start gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
              )}
            >
              <span>{t("pages.supportArticle.author")}</span>
              <span>{author}</span>
            </span>
            <span
              className={cn(
                nanum,
                "inline-flex items-start gap-2.5 text-sm font-bold leading-[14px] text-[#1F2121]",
              )}
            >
              <span>{t("pages.supportArticle.views")}</span>
              <span>{viewCount}</span>
            </span>
          </div>

          {fileName ? (
            <a
              href={attachmentHref ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                nanum,
                "inline-flex w-fit max-w-full items-center gap-2.5 rounded-[40px] bg-[#EAE3C9] px-5 py-2.5 text-base font-extrabold leading-[20.8px] text-[#1F2121] transition-opacity hover:opacity-90",
              )}
              onClick={(e) => {
                if (!attachmentHref) e.preventDefault();
              }}
            >
              <span className="min-w-0 break-words">
                {t("pages.supportArticle.attachment", { file: fileName })}
              </span>
              <Download
                className="h-3.5 w-3.5 shrink-0 text-[#02633E]"
                strokeWidth={2.25}
                aria-hidden
              />
            </a>
          ) : null}

          <div className="flex w-full gap-2.5 self-stretch pt-2.5">
            {bodyHtml != null ? (
              <div
                className={cn(
                  articleClassHtml,
                  "prose prose-sm max-w-none prose-p:text-[#1F2121]",
                )}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <div
                className={articleClass}
                dangerouslySetInnerHTML={{
                  __html: (bodyPlain ?? "").replace(/\n/g, "<br/>"),
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-[60px]">
        <div className="flex w-full flex-col gap-2.5 pt-10">
          {prev ? (
            <Link
              to={prev.href}
              className={cn(
                nanum,
                "flex h-[66px] min-h-[66px] items-center gap-5 overflow-hidden px-5 py-[11px] text-base font-bold leading-[20.8px] text-[#003F2B]",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{prev.title}</span>
              <span className="shrink-0">{t("pages.supportArticle.prev")}</span>
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
              {t("pages.supportArticle.noPrev")}
            </div>
          )}

          {next ? (
            <Link
              to={next.href}
              className={cn(
                nanum,
                "flex h-[66px] min-h-[66px] items-center gap-5 overflow-hidden rounded-[40px] px-5 py-[11px] text-base font-bold leading-[20.8px] text-[#003F2B]",
              )}
            >
              <span className="min-w-0 flex-1 truncate">{next.title}</span>
              <div className="flex w-[92px] shrink-0 items-center justify-end gap-5">
                <span>{t("pages.supportArticle.next")}</span>
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
              {t("pages.supportArticle.noNext")}
            </div>
          )}
        </div>

        <Link
          to={listHref}
          className={cn(
            nanum,
            "w-full rounded-[60px] bg-[#EAE3C9] px-[60px] py-5 text-center text-base font-extrabold leading-[20.8px] text-[#003F2B] transition-colors active:brightness-95",
          )}
        >
          {t("pages.supportArticle.list")}
        </Link>
      </div>
    </div>
  );
}
