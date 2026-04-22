import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/talent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Heart, Shield, Lightbulb, Leaf, Users } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import i18next from "~/core/lib/i18next.server";

interface IdealTrait {
  icon: typeof Heart;
  title: string;
  description: string;
}

interface GrowthStory {
  name: string;
  department: string;
  years: string;
  story: string;
}

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.careers.talent.metaTitle") };
}

export default function CareersTalentScreen() {
  const { t } = useTranslation();

  const idealCandidateTraits: IdealTrait[] = useMemo(
    () => [
      {
        icon: Heart,
        title: t("pages.careers.talent.traits.health.title"),
        description: t("pages.careers.talent.traits.health.description"),
      },
      {
        icon: Shield,
        title: t("pages.careers.talent.traits.trust.title"),
        description: t("pages.careers.talent.traits.trust.description"),
      },
      {
        icon: Lightbulb,
        title: t("pages.careers.talent.traits.innovation.title"),
        description: t("pages.careers.talent.traits.innovation.description"),
      },
      {
        icon: Leaf,
        title: t("pages.careers.talent.traits.sustainability.title"),
        description: t("pages.careers.talent.traits.sustainability.description"),
      },
    ],
    [t],
  );

  const growthStories: GrowthStory[] = useMemo(
    () => [
      {
        name: t("pages.careers.talent.stories.a.name"),
        department: t("pages.careers.talent.stories.a.department"),
        years: t("pages.careers.talent.stories.a.years"),
        story: t("pages.careers.talent.stories.a.story"),
      },
      {
        name: t("pages.careers.talent.stories.b.name"),
        department: t("pages.careers.talent.stories.b.department"),
        years: t("pages.careers.talent.stories.b.years"),
        story: t("pages.careers.talent.stories.b.story"),
      },
      {
        name: t("pages.careers.talent.stories.c.name"),
        department: t("pages.careers.talent.stories.c.department"),
        years: t("pages.careers.talent.stories.c.years"),
        story: t("pages.careers.talent.stories.c.story"),
      },
    ],
    [t],
  );

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: t("pages.careers.breadcrumb"), href: "/careers/positions" },
          { label: t("navigation.careers.talent") },
        ]}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
              {t("pages.careers.talent.heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground">{t("pages.careers.talent.heroSubtitle")}</p>
          </div>
        </div>
      </section>

      {/* Ideal Candidate */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {idealCandidateTraits.map((trait, index) => (
              <Card key={index} className="text-center transition-shadow hover:shadow-lg">
                <CardHeader>
                  <trait.icon className="mx-auto mb-4 h-12 w-12 text-primary" />
                  <CardTitle className="text-xl">{trait.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{trait.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CEO Message */}
          <Card className="mx-auto mb-16 max-w-4xl border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="mb-3 text-xl font-bold text-foreground">{t("pages.careers.talent.ceoTitle")}</h3>
                  <blockquote className="text-lg leading-relaxed italic text-muted-foreground">
                    &ldquo;{t("pages.careers.talent.ceoQuote")}&rdquo;
                  </blockquote>
                  <cite className="mt-4 block font-semibold text-primary">{t("pages.careers.talent.ceoCite")}</cite>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Growth Stories */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.careers.talent.growthTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.careers.talent.growthSubtitle")}</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {growthStories.map((story, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>{story.name}</CardTitle>
                  <CardDescription>
                    {story.department} • {story.years}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <blockquote className="italic text-muted-foreground">"{story.story}"</blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
