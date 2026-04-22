import { useTranslation } from "react-i18next";
import { Button } from "~/core/components/ui/button";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Users, TrendingUp, Shield, Truck, HeadphonesIcon } from "lucide-react";
import { Breadcrumb } from "~/core/components/breadcrumb";
import type { Route } from "./+types/bulk";
import i18next from "~/core/lib/i18next.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: (data as { metaTitle?: string } | undefined)?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.inquiryBulk.metaTitle") };
}

export default function BulkInquiryScreen({ loaderData: _loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  const categories = [
    {
      badge: t("pages.inquiryBulk.catCafeBadge"),
      title: t("pages.inquiryBulk.catCafeTitle"),
      description: t("pages.inquiryBulk.catCafeDesc"),
      products: [
        t("pages.inquiryBulk.catCafeP1"),
        t("pages.inquiryBulk.catCafeP2"),
        t("pages.inquiryBulk.catCafeP3"),
      ],
      cta: t("pages.inquiryBulk.catCafeCta"),
    },
    {
      badge: t("pages.inquiryBulk.catBakeryBadge"),
      title: t("pages.inquiryBulk.catBakeryTitle"),
      description: t("pages.inquiryBulk.catBakeryDesc"),
      products: [
        t("pages.inquiryBulk.catBakeryP1"),
        t("pages.inquiryBulk.catBakeryP2"),
        t("pages.inquiryBulk.catBakeryP3"),
      ],
      cta: t("pages.inquiryBulk.catBakeryCta"),
    },
    {
      badge: t("pages.inquiryBulk.catRestaurantBadge"),
      title: t("pages.inquiryBulk.catRestaurantTitle"),
      description: t("pages.inquiryBulk.catRestaurantDesc"),
      products: [
        t("pages.inquiryBulk.catRestaurantP1"),
        t("pages.inquiryBulk.catRestaurantP2"),
        t("pages.inquiryBulk.catRestaurantP3"),
      ],
      cta: t("pages.inquiryBulk.catRestaurantCta"),
    },
  ];

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: t("pages.inquiryBulk.breadcrumbPurchase") },
          { label: t("pages.inquiryBulk.breadcrumbCurrent") },
        ]}
      />
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto w-full max-w-3xl text-center md:max-w-[min(768px,calc(768*100vw/1920))]">
            <Badge className="mb-4">{t("pages.inquiryBulk.badge")}</Badge>
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">{t("pages.inquiryBulk.heroTitle")}</h1>
            <p className="mb-8 text-xl text-muted-foreground">{t("pages.inquiryBulk.heroLead")}</p>
            <Button size="lg" className="mr-4">
              {t("pages.inquiryBulk.ctaPrimary")}
            </Button>
            <Button size="lg" variant="outline">
              {t("pages.inquiryBulk.ctaSecondary")}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.inquiryBulk.benefitsTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.inquiryBulk.benefitsLead")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.inquiryBulk.benefitVolumeTitle")}</CardTitle>
                <CardDescription>{t("pages.inquiryBulk.benefitVolumeDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t("pages.inquiryBulk.benefitVolumeLi1")}</li>
                  <li>• {t("pages.inquiryBulk.benefitVolumeLi2")}</li>
                  <li>• {t("pages.inquiryBulk.benefitVolumeLi3")}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.inquiryBulk.benefitQualityTitle")}</CardTitle>
                <CardDescription>{t("pages.inquiryBulk.benefitQualityDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t("pages.inquiryBulk.benefitQualityLi1")}</li>
                  <li>• {t("pages.inquiryBulk.benefitQualityLi2")}</li>
                  <li>• {t("pages.inquiryBulk.benefitQualityLi3")}</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Truck className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.inquiryBulk.benefitDeliveryTitle")}</CardTitle>
                <CardDescription>{t("pages.inquiryBulk.benefitDeliveryDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t("pages.inquiryBulk.benefitDeliveryLi1")}</li>
                  <li>• {t("pages.inquiryBulk.benefitDeliveryLi2")}</li>
                  <li>• {t("pages.inquiryBulk.benefitDeliveryLi3")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.inquiryBulk.categoriesTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.inquiryBulk.categoriesLead")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Card key={index} className="relative">
                {category.badge ? (
                  <Badge className="absolute -right-2 -top-2 z-10">{category.badge}</Badge>
                ) : null}
                <CardHeader>
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="mb-4 space-y-2">
                    {category.products.map((product, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        • {product}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    {category.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.inquiryBulk.supportTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.inquiryBulk.supportLead")}</p>
          </div>

          <div className="mx-auto grid w-full max-w-4xl gap-8 md:max-w-[min(896px,calc(896*100vw/1920))] md:grid-cols-2">
            <Card>
              <CardHeader>
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{t("pages.inquiryBulk.dedicatedTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{t("pages.inquiryBulk.dedicatedBody")}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t("pages.inquiryBulk.dedicatedLi1")}</li>
                  <li>• {t("pages.inquiryBulk.dedicatedLi2")}</li>
                  <li>• {t("pages.inquiryBulk.dedicatedLi3")}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <HeadphonesIcon className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>{t("pages.inquiryBulk.support247Title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{t("pages.inquiryBulk.support247Body")}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• {t("pages.inquiryBulk.support247Li1")}</li>
                  <li>• {t("pages.inquiryBulk.support247Li2")}</li>
                  <li>• {t("pages.inquiryBulk.support247Li3")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">{t("pages.inquiryBulk.finalTitle")}</h2>
          <p className="mb-8 text-xl opacity-90">{t("pages.inquiryBulk.finalLead")}</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary">
              {t("pages.inquiryBulk.finalCtaPrimary")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              {t("pages.inquiryBulk.finalCtaSecondary")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
