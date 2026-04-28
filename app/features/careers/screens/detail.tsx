import { Link, data } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import type { Route } from "./+types/detail";

import { Breadcrumb } from "~/core/components/breadcrumb";
import { PageContentMax } from "~/core/components/page-content-max";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getDemoJobPostingById } from "../lib/demo-job-postings.server";
import { getJobPostingById, type JobPosting } from "../lib/queries.server";
import i18next from "~/core/lib/i18next.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle ?? "" },
];

function splitRequirementsText(text: string | null | undefined): {
  required: string[];
  preferred: string[];
} {
  if (!text?.trim()) return { required: [], preferred: [] };
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const parts = normalized.split(
    /\n\s*(우대\s*사항|Preferred\s*qualifications?)\s*\n/i,
  );
  const required =
    parts[0]?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];
  const preferred =
    parts[1]?.split("\n").map((l) => l.trim()).filter(Boolean) ?? [];
  return { required, preferred };
}

function deadlineStatusKey(
  deadline: Date | null,
): "open" | "closing" | "always" {
  if (!deadline) return "always";
  const days = (deadline.getTime() - Date.now()) / 86400000;
  if (days <= 7) return "closing";
  return "open";
}

function ListCheckRow({
  children,
  variant = "duty",
}: {
  children: React.ReactNode;
  /** 모바일: 지원자격 본문 15px/22.5px — duty·복지는 14px/21px */
  variant?: "duty" | "requirement";
}) {
  return (
    <div className="flex max-lg:items-start max-lg:gap-1.5 items-center gap-2.5">
      <span
        className="flex size-5 shrink-0 items-center justify-center max-lg:mt-0.5"
        aria-hidden
      >
        <img
          src="/recruit/check-mark-icon.png"
          alt=""
          width={20}
          height={20}
          className="size-5 object-contain"
          decoding="async"
        />
      </span>
      <span
        className={cn(
          "font-[family-name:var(--font-nanum)] font-normal text-[#1F2121] break-words",
          variant === "requirement"
            ? "text-base leading-6 max-lg:text-[15px] max-lg:leading-[22.5px]"
            : "text-base leading-6 max-lg:text-sm max-lg:leading-[21px]",
        )}
      >
        {children}
      </span>
    </div>
  );
}

function DetailSection({
  title,
  children,
  withTopBorder,
}: {
  title: string;
  children: React.ReactNode;
  withTopBorder?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-5 lg:flex-row lg:items-start lg:gap-3 lg:py-[60px]",
        withTopBorder && "border-t border-[#F0EEDD]",
      )}
    >
      <div className="shrink-0 lg:w-[200px]">
        <h2 className="font-[family-name:var(--font-nanum)] text-xl font-extrabold leading-[30px] text-[#1F2121] break-words lg:text-[32px] lg:leading-[48px]">
          {title}
        </h2>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** PC: Pretendard 14/500 — 모바일 시안: 나눔 18px/800, px-40 py-20 */
const sidebarPrimaryBtnClass = cn(
  "flex w-full items-center justify-center rounded-[60px] bg-[#02633E] text-center text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#02633E]/40",
  "max-lg:px-10 max-lg:py-5 max-lg:font-[family-name:var(--font-nanum)] max-lg:text-lg max-lg:font-extrabold max-lg:leading-[23.4px]",
  "lg:min-h-[42px] lg:px-5 lg:py-2 lg:text-sm lg:font-medium lg:leading-normal lg:[font-family:Pretendard,system-ui,sans-serif]",
);

function processStepNumberClass(i: number, mobile: boolean) {
  if (mobile) {
    if (i === 0 || i === 2) return "text-white";
    return "text-[#F0EEDD]";
  }
  if (i === 0) return "text-white";
  return "text-[#F0EEDD]";
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  const locale = await i18next.getLocale(request);
  const fromDb = await getJobPostingById(id).catch(() => null);
  let job: JobPosting | null = null;
  if (fromDb) {
    if (fromDb.status !== "open" || !fromDb.is_active) {
      throw data("Not Found", { status: 404 });
    }
    job = fromDb;
  } else {
    job = getDemoJobPostingById(id, locale);
  }

  if (!job) throw data("Not Found", { status: 404 });

  return {
    job,
    metaTitle: t("pages.careers.detail.metaTitle", { title: job.title }),
  };
}

export default function CareerDetailScreen({ loaderData }: Route.ComponentProps) {
  const { job } = loaderData;
  const { t } = useTranslation();

  const jobTypeLabel = useMemo(() => {
    const m: Record<string, string> = {
      full_time: t("pages.careers.shared.jobType.full_time"),
      part_time: t("pages.careers.shared.jobType.part_time"),
      contract: t("pages.careers.shared.jobType.contract"),
      intern: t("pages.careers.shared.jobType.intern"),
    };
    return m[job.job_type] ?? job.job_type;
  }, [t, job.job_type]);

  const expLabel = useMemo(() => {
    const m: Record<string, string> = {
      entry: t("pages.careers.shared.expLevel.entry"),
      experienced: t("pages.careers.shared.expLevel.experienced"),
      senior: t("pages.careers.shared.expLevel.senior"),
      all: t("pages.careers.shared.expLevel.all"),
    };
    return m[job.experience_level] ?? job.experience_level;
  }, [t, job.experience_level]);

  const hiringProcess = useMemo(() => {
    const custom = job.hiring_process
      ?.split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (custom && custom.length > 0) return custom;
    return [
      t("pages.careers.detail.processSteps.s1"),
      t("pages.careers.detail.processSteps.s2"),
      t("pages.careers.detail.processSteps.s3"),
      t("pages.careers.detail.processSteps.s4"),
    ];
  }, [job.hiring_process, t]);

  const { required: requiredItems, preferred: preferredItems } =
    splitRequirementsText(job.requirements);

  const benefitLines = job.benefits
    ? job.benefits.split("\n").map((l) => l.trim()).filter(Boolean)
    : [];
  const benefitColSplit = useMemo(() => {
    const half = Math.ceil(benefitLines.length / 2);
    return [benefitLines.slice(0, half), benefitLines.slice(half)] as const;
  }, [benefitLines]);

  const descLines = useMemo(() => {
    return job.description
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [job.description]);
  const subtitle = descLines.length > 1 ? descLines[0] : "";
  const dutyLines = descLines.length > 1 ? descLines.slice(1) : descLines;

  const isNew =
    !!job.created_at &&
    Date.now() - new Date(job.created_at).getTime() <
      1000 * 60 * 60 * 24 * 14;

  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const statusKey = deadlineStatusKey(deadlineDate);
  const statusLabel = t(`pages.careers.positions.jobStatus.${statusKey}`);

  const deadlineSidebar =
    deadlineDate != null
      ? format(deadlineDate, "yyyy.MM.dd")
      : t("pages.careers.detail.deadlineOpen");

  return (
    <div
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
      )}
    >
      <Breadcrumb
        items={[
          {
            label: t("pages.careers.positions.breadcrumbCurrent"),
            href: "/careers/positions",
          },
          { label: job.title },
        ]}
      />

      <div className="pb-16 pt-5 md:pt-[60px] lg:pb-24 lg:pt-[100px]">
        <PageContentMax className="px-4 md:px-8 lg:px-[160px]">
          <Link
            to="/careers/positions"
            viewTransition
            className="mb-5 inline-flex max-w-full items-center gap-5 rounded-[40px] text-[#003F2B] transition-opacity hover:opacity-80 max-lg:mb-5 lg:mb-5 lg:gap-[30px]"
          >
            <ChevronLeft
              className="size-[18px] shrink-0 text-[#02633E]"
              strokeWidth={2}
              aria-hidden
            />
            <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-[20.8px] break-words">
              {t("pages.careers.detail.backToListShort")}
            </span>
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-10">
            {/* ── 본문 ── */}
            <div className="flex min-w-0 flex-1 flex-col gap-2.5">
              {/* 요약 카드 */}
              <div className="rounded-[20px] bg-white p-5 lg:rounded-[40px] lg:p-10">
                <div className="flex flex-col gap-5 lg:gap-10">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {statusKey === "closing" ? (
                      <span className="inline-flex shrink-0 items-center rounded-[100px] bg-[#FFD55D] px-2.5 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3 text-[#1F2121] lg:px-3 lg:py-2">
                        {statusLabel}
                      </span>
                    ) : statusKey === "open" ? (
                      <span className="inline-flex shrink-0 items-center rounded-[100px] bg-[#32AF32] px-2.5 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3 text-white lg:px-3 lg:py-2">
                        {statusLabel}
                      </span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center rounded-[100px] bg-[#003F2B] px-2.5 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3 text-white lg:px-3 lg:py-2">
                        {statusLabel}
                      </span>
                    )}
                    {isNew ? (
                      <span className="inline-flex shrink-0 items-center rounded-[100px] bg-[#FF5D5D] px-2.5 py-1.5 text-center [font-family:Pretendard,system-ui,sans-serif] text-xs font-medium leading-3 text-white lg:px-3 lg:py-2">
                        {t("pages.careers.detail.newBadge")}
                      </span>
                    ) : null}
                    <span className="font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] text-[#1F2121] break-words lg:text-lg lg:leading-[27px]">
                      {job.department}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 lg:gap-2.5">
                    <h1 className="font-[family-name:var(--font-nanum)] text-[28px] font-extrabold leading-[36.4px] text-[#1F2121] break-words lg:text-[48px] lg:leading-[62.4px]">
                      {job.title}
                    </h1>
                    {subtitle ? (
                      <p className="font-[family-name:var(--font-nanum)] text-sm font-normal leading-[18.2px] text-[#1F2121] break-words lg:text-xl lg:leading-[26px]">
                        {subtitle}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-center font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]">
                      {expLabel}
                    </span>
                    <span className="text-center font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]">
                      {job.location}
                    </span>
                    <span className="text-center font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[16.8px] text-[#1F2121]">
                      {jobTypeLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 상세 카드 */}
              <div className="overflow-hidden rounded-[20px] bg-white px-5 lg:rounded-[40px] lg:px-10">
                {dutyLines.length > 0 ? (
                  <DetailSection title={t("pages.careers.detail.dutiesTitle")}>
                    <div className="flex flex-col gap-1">
                      {dutyLines.map((line, i) => (
                        <ListCheckRow key={i}>{line}</ListCheckRow>
                      ))}
                    </div>
                  </DetailSection>
                ) : null}

                {requiredItems.length > 0 || preferredItems.length > 0 ? (
                  <DetailSection
                    title={t("pages.careers.detail.requirementsTitle")}
                    withTopBorder={dutyLines.length > 0}
                  >
                    <div className="flex flex-col gap-5 lg:gap-10">
                      {requiredItems.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          {preferredItems.length > 0 ? (
                            <h3 className="font-[family-name:var(--font-nanum)] text-sm font-extrabold leading-[21px] text-[#1F2121] lg:text-lg lg:leading-[27px]">
                              {t("pages.careers.detail.requirementsRequired")}
                            </h3>
                          ) : null}
                          <div className="flex flex-col gap-1">
                            {requiredItems.map((line, i) => (
                              <ListCheckRow key={`r-${i}`} variant="requirement">
                                {line}
                              </ListCheckRow>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {preferredItems.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                          <h3 className="font-[family-name:var(--font-nanum)] text-sm font-extrabold leading-[21px] text-[#1F2121] lg:text-lg lg:leading-[27px]">
                            {t("pages.careers.detail.requirementsPreferred")}
                          </h3>
                          <div className="flex flex-col gap-1">
                            {preferredItems.map((line, i) => (
                              <ListCheckRow key={`p-${i}`} variant="requirement">
                                {line}
                              </ListCheckRow>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </DetailSection>
                ) : null}

                {benefitLines.length > 0 ? (
                  <DetailSection
                    title={t("pages.careers.detail.benefitsTitle")}
                    withTopBorder={
                      dutyLines.length > 0 ||
                      requiredItems.length > 0 ||
                      preferredItems.length > 0
                    }
                  >
                    <div className="flex flex-row gap-2.5 lg:gap-3">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        {benefitColSplit[0].map((line, i) => (
                          <ListCheckRow key={`b0-${i}`}>{line}</ListCheckRow>
                        ))}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        {benefitColSplit[1].map((line, i) => (
                          <ListCheckRow key={`b1-${i}`}>{line}</ListCheckRow>
                        ))}
                      </div>
                    </div>
                  </DetailSection>
                ) : null}

                <DetailSection
                  title={t("pages.careers.detail.processTitle")}
                  withTopBorder={
                    dutyLines.length > 0 ||
                    requiredItems.length > 0 ||
                    preferredItems.length > 0 ||
                    benefitLines.length > 0
                  }
                >
                  <div className="hidden w-full flex-row items-center gap-2 lg:flex">
                    {hiringProcess.map((label, i) => (
                      <div
                        key={i}
                        className="flex min-w-0 flex-1 items-center gap-2"
                      >
                        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#32AF32]">
                          <span
                            className={cn(
                              "font-[family-name:var(--font-nanum)] text-base font-bold leading-6",
                              processStepNumberClass(i, false),
                            )}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <span className="min-w-0 font-[family-name:var(--font-nanum)] text-lg font-extrabold leading-[27px] text-[#003F2B] break-words">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex w-full flex-col gap-2.5 lg:hidden">
                    {hiringProcess.map((label, i) => (
                      <div
                        key={i}
                        className="flex w-full min-w-0 items-center gap-1.5"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#32AF32]">
                          <span
                            className={cn(
                              "font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px]",
                              processStepNumberClass(i, true),
                            )}
                          >
                            {i + 1}
                          </span>
                        </div>
                        <span className="min-w-0 font-[family-name:var(--font-nanum)] text-sm font-extrabold leading-[21px] text-[#003F2B] break-words">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </DetailSection>
              </div>
            </div>

            {/* ── 사이드바 (PC 440) ── */}
            <aside className="flex w-full shrink-0 flex-col gap-2.5 lg:w-[440px]">
              <div className="rounded-[20px] bg-[#EAE3C9] p-5 lg:rounded-[40px] lg:p-10">
                <div className="flex flex-col gap-10">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-row items-start justify-between gap-3">
                      <h2 className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-xl font-extrabold leading-[30px] text-[#1F2121] break-words lg:text-2xl lg:leading-9">
                        {t("pages.careers.detail.applyTitle")}
                      </h2>
                      <p className="shrink-0 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121]/50 break-words">
                        {t("pages.careers.detail.deadlineSidebar", {
                          date: deadlineSidebar,
                        })}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2.5">
                      <span className="w-[120px] shrink-0 font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121]">
                        {t("pages.careers.detail.applyTimeLabel")}
                      </span>
                      <span className="font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#02633E]">
                        {t("pages.careers.detail.applyTimeValue")}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/careers/${job.job_id}/apply`}
                    viewTransition
                    className={sidebarPrimaryBtnClass}
                  >
                    {t("pages.careers.detail.applyOnline")}
                  </Link>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#EAE3C9] p-5 lg:rounded-[40px] lg:p-10">
                <div className="flex flex-col gap-5 lg:gap-10">
                  <div className="flex flex-col gap-5">
                    <h2 className="font-[family-name:var(--font-nanum)] text-xl font-extrabold leading-[30px] text-[#1F2121] lg:text-2xl lg:leading-9">
                      {t("pages.careers.detail.contactTitle")}
                    </h2>
                    <div className="flex flex-wrap items-start gap-2.5">
                      <span className="w-[100px] shrink-0 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] lg:w-[120px] lg:text-base lg:leading-6">
                        {t("pages.careers.detail.contactTeam")}
                      </span>
                      <div className="min-w-0 flex flex-col gap-2.5">
                        <div className="font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#02633E] break-all lg:text-base lg:leading-6">
                          <a
                            href={`mailto:${t("pages.careers.detail.contactEmail")}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {t("pages.careers.detail.contactEmail")}
                          </a>
                          <br />
                          <a
                            href={`tel:${t("pages.careers.detail.contactPhone").replace(/[^\d+]/g, "")}`}
                            className="underline-offset-2 hover:underline"
                          >
                            {t("pages.careers.detail.contactPhone")}
                          </a>
                        </div>
                        <p className="font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121]/50">
                          {t("pages.careers.detail.contactHours")}
                          <br />
                          {t("pages.careers.detail.contactLunch")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white" aria-hidden />

                  <div className="flex flex-col gap-5">
                    <h2 className="font-[family-name:var(--font-nanum)] text-xl font-extrabold leading-[30px] text-[#1F2121] lg:text-2xl lg:leading-9">
                      {t("pages.careers.detail.companyInfoTitle")}
                    </h2>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="w-[100px] shrink-0 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] lg:w-[120px] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.companyName")}
                        </span>
                        <span className="font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#02633E] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.companyIndustry")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="w-[100px] shrink-0 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] lg:w-[120px] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.labelFounded")}
                        </span>
                        <span className="font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#02633E] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.foundedValue")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="w-[100px] shrink-0 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] lg:w-[120px] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.labelEmployees")}
                        </span>
                        <span className="font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#02633E] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.companyEmployeesValue")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-start gap-2.5">
                        <span className="w-[100px] shrink-0 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] lg:w-[120px] lg:text-base lg:leading-6">
                          {t("pages.careers.detail.labelMainBusiness")}
                        </span>
                        <span className="min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#02633E] break-words lg:text-base lg:leading-6">
                          {t("pages.careers.detail.mainBusinessValue")}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/brand/intro"
                      viewTransition
                      className={sidebarPrimaryBtnClass}
                    >
                      {t("pages.careers.detail.viewIntro")}
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </PageContentMax>
      </div>
    </div>
  );
}
