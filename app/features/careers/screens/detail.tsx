import { Link, data } from "react-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/detail";
import { Button } from "~/core/components/ui/button";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Separator } from "~/core/components/ui/separator";
import { MapPin, Clock, Users, GraduationCap, Building2, CheckCircle, ArrowLeft } from "lucide-react";
import { getJobPostingById } from "../lib/queries.server";
import i18next from "~/core/lib/i18next.server";

export const meta: Route.MetaFunction = ({ data }) => [{ title: data?.metaTitle ?? "" }];

export async function loader({ request, params }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const id = Number(params.id);
  if (!id) throw data("Not Found", { status: 404 });

  const job = await getJobPostingById(id).catch(() => null);
  if (!job || job.status !== "open") throw data("Not Found", { status: 404 });

  return {
    job,
    metaTitle: t("pages.careers.detail.metaTitle"),
  };
}

export default function CareerDetailScreen({ loaderData }: Route.ComponentProps) {
  const { job } = loaderData;
  const { t, i18n } = useTranslation();

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

  const hiringProcess = useMemo(
    () => [
      t("pages.careers.detail.processSteps.s1"),
      t("pages.careers.detail.processSteps.s2"),
      t("pages.careers.detail.processSteps.s3"),
      t("pages.careers.detail.processSteps.s4"),
    ],
    [t],
  );

  const requirements = job.requirements
    ? job.requirements.split("\n").filter(Boolean)
    : [];
  const benefits = job.benefits
    ? job.benefits.split("\n").filter(Boolean)
    : [];

  const isNew = job.created_at
    ? Date.now() - new Date(job.created_at).getTime() < 1000 * 60 * 60 * 24 * 14
    : false;

  const locale = i18n.language?.startsWith("en") ? "en-US" : "ko-KR";

  const deadlineStr = job.deadline
    ? new Date(job.deadline).toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("pages.careers.detail.deadlineOpen");

  const deadlineLine = t("pages.careers.detail.applyDeadlineLabel", { date: deadlineStr });

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: t("pages.careers.breadcrumb"), href: "/careers/positions" },
          { label: t("pages.careers.detail.breadcrumbPostings") },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <Link to="/careers/positions" className="mb-6 inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t("pages.careers.detail.backToList")}
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="mb-2 text-2xl">{job.title}</CardTitle>
                    <CardDescription className="text-lg">{job.department}</CardDescription>
                  </div>
                  {isNew && (
                    <Badge className="bg-green-100 text-green-800">{t("pages.careers.detail.newBadge")}</Badge>
                  )}
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{jobTypeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{expLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">~{deadlineStr}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>

            {requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("pages.careers.detail.requirementsTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("pages.careers.detail.benefitsTitle")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>{t("pages.careers.detail.processTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 md:flex-row">
                  {hiringProcess.map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {i + 1}
                        </div>
                        <span className="font-medium">{step}</span>
                      </div>
                      {i < hiringProcess.length - 1 && (
                        <div className="hidden h-0.5 w-8 bg-muted md:block" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">{t("pages.careers.detail.applyTitle")}</CardTitle>
                <CardDescription className="text-center">{deadlineLine}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to={`/careers/${job.job_id}/apply`} viewTransition>
                  <Button className="w-full" size="lg">
                    {t("pages.careers.detail.applyOnline")}
                  </Button>
                </Link>
                <div className="text-center text-sm text-muted-foreground">
                  <p>{t("pages.careers.detail.applyTimeHint")}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {t("pages.careers.detail.companyInfoTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-semibold">{t("pages.careers.detail.companyName")}</h4>
                  <p className="text-sm text-muted-foreground">{t("pages.careers.detail.companyIndustry")}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">{t("pages.careers.detail.labelFounded")}</p>
                    <p className="text-muted-foreground">{t("pages.careers.detail.foundedValue")}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{t("pages.careers.detail.labelHeadcount")}</p>
                    <p className="text-muted-foreground">
                      {job.headcount ?? 1}
                      {t("pages.careers.detail.headcountUnit")}
                    </p>
                  </div>
                </div>
                <Link to="/brand/intro" viewTransition>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    {t("pages.careers.detail.viewIntro")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("pages.careers.detail.contactTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">{t("pages.careers.detail.contactTeam")}</p>
                <p>hr@pungrimfood.co.kr</p>
                <p>{t("pages.careers.detail.contactHours")}</p>
                <p className="text-xs">{t("pages.careers.detail.contactLunch")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
