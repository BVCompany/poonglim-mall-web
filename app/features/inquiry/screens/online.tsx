import { useTranslation } from "react-i18next";
import { Button } from "~/core/components/ui/button";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { ShoppingCart, Building2, Phone, Mail, MapPin, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { Breadcrumb } from "~/core/components/breadcrumb";
import type { Route } from "./+types/online";
import i18next from "~/core/lib/i18next.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: (data as { metaTitle?: string } | undefined)?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return { metaTitle: t("pages.inquiryOnline.metaTitle") };
}

export default function OnlineInquiryScreen({ loaderData: _loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: t("pages.inquiryOnline.breadcrumbPurchase") },
          { label: t("pages.inquiryOnline.breadcrumbCurrent") },
        ]}
      />
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-6 text-center md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">{t("pages.inquiryOnline.heroTitle")}</h1>
          <p className="text-pretty text-xl opacity-90">{t("pages.inquiryOnline.heroSubtitle")}</p>
        </div>
      </section>

      <section className="bg-[var(--site-chrome-header-bg,#FDFDF5)] py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <div className="mx-auto grid w-full max-w-4xl gap-8 md:max-w-[min(896px,calc(896*100vw/1920))] md:grid-cols-2">
            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ShoppingCart className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("pages.inquiryOnline.b2cTitle")}</CardTitle>
                <CardDescription>{t("pages.inquiryOnline.b2cDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2cPoint1")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2cPoint2")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2cPoint3")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2cPoint4")}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full" size="lg">
                    <a href="https://smartstore.naver.com/poonglimfoods" target="_blank" rel="noopener noreferrer">
                      {t("pages.inquiryOnline.b2cCta")}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 transition-colors hover:border-primary/50">
              <CardHeader className="pb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{t("pages.inquiryOnline.b2bTitle")}</CardTitle>
                <CardDescription>{t("pages.inquiryOnline.b2bDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2bPoint1")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2bPoint2")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2bPoint3")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>{t("pages.inquiryOnline.b2bPoint4")}</span>
                  </div>
                </div>
                <div className="pt-4">
                  <Button asChild className="w-full" size="lg" variant="outline">
                    <Link to="/inquiry/bulk" viewTransition>
                      {t("pages.inquiryOnline.b2bCta")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.inquiryOnline.contactHeading")}</h2>
            <p className="text-muted-foreground">{t("pages.inquiryOnline.contactLead")}</p>
          </div>

          <div className="mx-auto grid w-full max-w-4xl gap-8 md:max-w-[min(896px,calc(896*100vw/1920))] md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <Phone className="mx-auto mb-2 h-8 w-8 text-primary" />
                <CardTitle>{t("pages.inquiryOnline.phoneTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <p className="text-lg font-semibold">043-878-7800</p>
                <p className="text-sm text-muted-foreground">{t("pages.inquiryOnline.phoneHoursWeekday")}</p>
                <p className="text-sm text-muted-foreground">{t("pages.inquiryOnline.phoneHoursSaturday")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="mx-auto mb-2 h-8 w-8 text-primary" />
                <CardTitle>{t("pages.inquiryOnline.emailTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <p className="font-semibold">info@poonglim.co.kr</p>
                <p className="text-sm text-muted-foreground">{t("pages.inquiryOnline.emailLine1")}</p>
                <p className="text-sm text-muted-foreground">{t("pages.inquiryOnline.emailLine2")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                <CardTitle>{t("pages.inquiryOnline.visitTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-center">
                <p className="text-sm">{t("pages.inquiryOnline.visitAddress")}</p>
                <p className="text-sm text-muted-foreground">{t("pages.inquiryOnline.visitNote")}</p>
                <Button variant="outline" size="sm" className="mt-2">
                  {t("pages.inquiryOnline.visitCta")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-[var(--site-chrome-header-bg,#FDFDF5)] py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <div className="mx-auto w-full max-w-2xl md:max-w-[min(672px,calc(672*100vw/1920))]">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.inquiryOnline.formHeading")}</h2>
              <p className="text-muted-foreground">{t("pages.inquiryOnline.formLead")}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <form className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">{t("pages.inquiryOnline.formName")}</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("pages.inquiryOnline.placeholderName")}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">{t("pages.inquiryOnline.formPhone")}</label>
                      <input
                        type="tel"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("pages.inquiryOnline.placeholderPhone")}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("pages.inquiryOnline.formEmail")}</label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t("pages.inquiryOnline.placeholderEmail")}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("pages.inquiryOnline.formType")}</label>
                    <select className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">{t("pages.inquiryOnline.typePlaceholder")}</option>
                      <option value="b2c">{t("pages.inquiryOnline.typeB2c")}</option>
                      <option value="b2b">{t("pages.inquiryOnline.typeB2b")}</option>
                      <option value="product">{t("pages.inquiryOnline.typeProduct")}</option>
                      <option value="partnership">{t("pages.inquiryOnline.typePartnership")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("pages.inquiryOnline.formMessage")}</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={t("pages.inquiryOnline.placeholderMessage")}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="privacy" className="rounded" />
                    <label htmlFor="privacy" className="text-sm text-muted-foreground">
                      {t("pages.inquiryOnline.formPrivacy")}
                    </label>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    {t("pages.inquiryOnline.formSubmit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
