import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/benefits";
import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Shield, GraduationCap, Gift, Coffee, Users, Heart, Building2 } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import i18next from "~/core/lib/i18next.server";

interface Benefit {
  icon: typeof Shield;
  title: string;
  description: string;
}

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.careers.benefits.metaTitle") };
}

export default function CareersBenefitsScreen() {
  const { t } = useTranslation();

  const benefits: Benefit[] = useMemo(
    () => [
      {
        icon: Shield,
        title: t("pages.careers.benefits.cards.insurance.title"),
        description: t("pages.careers.benefits.cards.insurance.description"),
      },
      {
        icon: GraduationCap,
        title: t("pages.careers.benefits.cards.education.title"),
        description: t("pages.careers.benefits.cards.education.description"),
      },
      {
        icon: Gift,
        title: t("pages.careers.benefits.cards.family.title"),
        description: t("pages.careers.benefits.cards.family.description"),
      },
      {
        icon: Coffee,
        title: t("pages.careers.benefits.cards.meal.title"),
        description: t("pages.careers.benefits.cards.meal.description"),
      },
      {
        icon: Users,
        title: t("pages.careers.benefits.cards.points.title"),
        description: t("pages.careers.benefits.cards.points.description"),
      },
      {
        icon: Heart,
        title: t("pages.careers.benefits.cards.health.title"),
        description: t("pages.careers.benefits.cards.health.description"),
      },
    ],
    [t],
  );

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: t("navigation.mega.company"), href: "/brand/intro" },
          { label: t("pages.careers.breadcrumb"), href: "/careers/positions" },
          { label: t("navigation.careers.benefits") },
        ]}
      />
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
              {t("pages.careers.benefits.heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground">{t("pages.careers.benefits.heroSubtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              {t("pages.careers.benefits.sectionBenefitsTitle")}
            </h2>
            <p className="text-muted-foreground">{t("pages.careers.benefits.sectionBenefitsSubtitle")}</p>
          </div>

          <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                <CardHeader>
                  <benefit.icon className="mx-auto mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              {t("pages.careers.benefits.sectionWorkTitle")}
            </h2>
            <p className="text-muted-foreground">{t("pages.careers.benefits.sectionWorkSubtitle")}</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {t("pages.careers.benefits.workIntroTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <p className="text-muted-foreground">{t("pages.careers.benefits.workIntroImageCaption")}</p>
                </div>
                <p className="text-muted-foreground">{t("pages.careers.benefits.workIntroBody")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  {t("pages.careers.benefits.workInterviewTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <blockquote className="border-l-4 border-primary pl-4 italic">
                  &ldquo;{t("pages.careers.benefits.workInterviewQuote")}&rdquo;
                </blockquote>
                <cite className="font-semibold text-primary">{t("pages.careers.benefits.workInterviewCite")}</cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground">
            {t("pages.careers.benefits.detailSectionTitle")}
          </h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("pages.careers.benefits.detailHoursTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>{t("pages.careers.benefits.detailHoursL1")}</p>
                <p>{t("pages.careers.benefits.detailHoursL2")}</p>
                <p>{t("pages.careers.benefits.detailHoursL3")}</p>
                <p>{t("pages.careers.benefits.detailHoursL4")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("pages.careers.benefits.detailEduTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>{t("pages.careers.benefits.detailEduL1")}</p>
                <p>{t("pages.careers.benefits.detailEduL2")}</p>
                <p>{t("pages.careers.benefits.detailEduL3")}</p>
                <p>{t("pages.careers.benefits.detailEduL4")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("pages.careers.benefits.detailHealthTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p>{t("pages.careers.benefits.detailHealthL1")}</p>
                <p>{t("pages.careers.benefits.detailHealthL2")}</p>
                <p>{t("pages.careers.benefits.detailHealthL3")}</p>
                <p>{t("pages.careers.benefits.detailHealthL4")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
