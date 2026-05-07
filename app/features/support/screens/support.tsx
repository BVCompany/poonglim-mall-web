import { useMemo } from "react";
import { Form, useNavigation, useActionData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/support";
import { Button } from "~/core/components/ui/button";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/core/components/ui/accordion";
import { Phone, Mail, MessageCircle, Clock, Search, HelpCircle, FileText, Users } from "lucide-react";
import { normalizeContentLocale } from "~/core/db/content-locale.server";
import i18next from "~/core/lib/i18next.server";
import { getFaqs, createContact } from "../lib/queries.server";
import type { Faq as DbFaq } from "../lib/queries.server";
import { Breadcrumb } from "~/core/components/breadcrumb";

const FAQ_CAT_ORDER = ["product", "delivery", "b2b", "quality", "general"] as const;

/** 폼 value는 DB·기존 로직 호환을 위해 한글 유지, 라벨만 i18n */
const INQUIRY_FORM_OPTIONS = [
  { value: "주문 관련", tKey: "order" as const },
  { value: "제품 문의", tKey: "product" as const },
  { value: "배송 문의", tKey: "delivery" as const },
  { value: "품질 문의", tKey: "quality" as const },
  { value: "B2B 문의", tKey: "b2b" as const },
  { value: "기타", tKey: "other" as const },
];

export const meta: Route.MetaFunction = ({ data }) => [
  { title: (data as { metaTitle?: string } | undefined)?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const contentLocale = normalizeContentLocale(await i18next.getLocale(request));
  const dbFaqs = await getFaqs(undefined, contentLocale).catch(() => [] as DbFaq[]);
  return { dbFaqs, metaTitle: t("pages.supportHub.metaTitle") };
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const fd = await request.formData();
  try {
    await createContact({
      inquiry_type: (fd.get("type") as string) || "기타",
      name: fd.get("name") as string,
      phone: (fd.get("phone") as string) || null,
      email: fd.get("email") as string,
      title: (fd.get("type") as string) || "기타",
      content: fd.get("content") as string,
      lookup_password: "",
    });
    return { success: true };
  } catch {
    return { success: false, error: t("pages.supportHub.errorSubmit") };
  }
}

interface FAQ {
  question: string;
  answer: string;
}

interface FAQCategory {
  /** `faq_category` enum 값과 동일 */
  category: string;
  questions: FAQ[];
}


export default function SupportScreen({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { dbFaqs } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formSubmitted = actionData?.success === true;

  const faqs: FAQCategory[] = useMemo(() => {
    const grouped = dbFaqs.reduce<Record<string, FAQ[]>>((acc, f) => {
      const cat = f.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ question: f.question, answer: f.answer });
      return acc;
    }, {});
    const entries = Object.entries(grouped).sort((a, b) => {
      const ia = FAQ_CAT_ORDER.indexOf(a[0] as (typeof FAQ_CAT_ORDER)[number]);
      const ib = FAQ_CAT_ORDER.indexOf(b[0] as (typeof FAQ_CAT_ORDER)[number]);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
    return entries.map(([category, questions]) => ({ category, questions }));
  }, [dbFaqs]);

  const faqCategoryTitle = (cat: string) => {
    if ((FAQ_CAT_ORDER as readonly string[]).includes(cat)) {
      return t(`pages.faq.categories.${cat}`);
    }
    return cat;
  };

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb items={[{ label: t("pages.supportHub.breadcrumb") }]} />
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
              {t("pages.supportHub.heroTitle")}
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">{t("pages.supportHub.heroLead")}</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t("pages.supportHub.heroChat")}
              </Button>
              <Button size="lg" variant="outline">
                <Phone className="mr-2 h-5 w-5" />
                {t("pages.supportHub.heroPhone")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.supportHub.methodsTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.supportHub.methodsLead")}</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Phone className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.supportHub.phoneCardTitle")}</CardTitle>
                <CardDescription>{t("pages.supportHub.phoneCardDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-semibold">1588-1234</p>
                  <Badge variant="secondary" className="mt-1">
                    {t("pages.supportHub.phoneFreeBadge")}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{t("pages.supportHub.phoneHoursWeekday")}</span>
                  </div>
                  <p>{t("pages.supportHub.phoneHoursSaturday")}</p>
                  <p>{t("pages.supportHub.phoneClosed")}</p>
                </div>
                <Button className="w-full">{t("pages.supportHub.phoneCta")}</Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Mail className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.supportHub.emailCardTitle")}</CardTitle>
                <CardDescription>{t("pages.supportHub.emailCardDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">support@pungrimfood.co.kr</p>
                  <Badge variant="secondary" className="mt-1">
                    {t("pages.supportHub.emailBadge")}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{t("pages.supportHub.emailLi1")}</p>
                  <p>{t("pages.supportHub.emailLi2")}</p>
                  <p>{t("pages.supportHub.emailLi3")}</p>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  {t("pages.supportHub.emailCta")}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.supportHub.chatCardTitle")}</CardTitle>
                <CardDescription>{t("pages.supportHub.chatCardDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">{t("pages.supportHub.chatLine")}</p>
                  <Badge variant="secondary" className="mt-1">
                    {t("pages.supportHub.chatBadge")}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{t("pages.supportHub.chatLi1")}</p>
                  <p>{t("pages.supportHub.chatLi2")}</p>
                  <p>{t("pages.supportHub.chatLi3")}</p>
                </div>
                <Button className="w-full">{t("pages.supportHub.chatCta")}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.supportHub.faqTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.supportHub.faqLead")}</p>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Search Bar — PC만 */}
            <div className="relative mb-8 hidden md:block">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
              <input
                type="text"
                placeholder={t("pages.supportHub.faqSearchPlaceholder")}
                className="w-full rounded-lg border border-input py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {faqs.length === 0 ? (
                <p className="py-8 text-center text-base text-muted-foreground">
                  {t("empty.faq")}
                </p>
              ) : null}
              {faqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {faqCategoryTitle(category.category)}
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${categoryIndex}-${index}`}
                        className="rounded-lg border border-border px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                        <AccordionContent className="pb-4 pt-2 text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.supportHub.inquiryTitle")}</h2>
              <p className="text-muted-foreground">{t("pages.supportHub.inquiryLead")}</p>
            </div>

            <Card>
              <CardContent className="p-6">
                {formSubmitted ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <svg
                        className="h-8 w-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">{t("pages.supportHub.successTitle")}</h3>
                    <p className="text-muted-foreground">{t("pages.supportHub.successBody")}</p>
                  </div>
                ) : (
                  <Form method="post" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">{t("pages.supportHub.formName")}</label>
                        <input
                          name="name"
                          type="text"
                          className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={t("pages.supportHub.placeholderName")}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">{t("pages.supportHub.formPhone")}</label>
                        <input
                          name="phone"
                          type="tel"
                          className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={t("pages.supportHub.placeholderPhone")}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">{t("pages.supportHub.formEmail")}</label>
                      <input
                        name="email"
                        type="email"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("pages.supportHub.placeholderEmail")}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">{t("pages.supportHub.formType")}</label>
                      <select
                        name="type"
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="">{t("pages.supportHub.typePlaceholder")}</option>
                        {INQUIRY_FORM_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(`pages.supportHub.formInquiry.${opt.tKey}`)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">{t("pages.supportHub.formContent")}</label>
                      <textarea
                        name="content"
                        rows={5}
                        className="w-full rounded-md border border-input px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder={t("pages.supportHub.placeholderContent")}
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="privacy" className="rounded" required />
                      <label htmlFor="privacy" className="text-sm text-muted-foreground">
                        {t("pages.supportHub.formPrivacy")}
                      </label>
                    </div>

                    {actionData?.error && <p className="text-sm text-red-500">{actionData.error}</p>}

                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? t("pages.supportHub.formSubmitting") : t("pages.supportHub.formSubmit")}
                    </Button>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">{t("pages.supportHub.resourcesTitle")}</h2>
            <p className="text-muted-foreground">{t("pages.supportHub.resourcesLead")}</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.supportHub.resourceCatalogTitle")}</CardTitle>
                <CardDescription>{t("pages.supportHub.resourceCatalogDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{t("pages.supportHub.resourceCatalogBody")}</p>
                <Button variant="outline" className="w-full bg-transparent">
                  {t("pages.supportHub.download")}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <Users className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.supportHub.resourceManualTitle")}</CardTitle>
                <CardDescription>{t("pages.supportHub.resourceManualDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{t("pages.supportHub.resourceManualBody")}</p>
                <Button variant="outline" className="w-full bg-transparent">
                  {t("pages.supportHub.download")}
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center transition-shadow hover:shadow-lg">
              <CardHeader>
                <HelpCircle className="mx-auto mb-4 h-12 w-12 text-primary" />
                <CardTitle>{t("pages.supportHub.resourceCertTitle")}</CardTitle>
                <CardDescription>{t("pages.supportHub.resourceCertDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{t("pages.supportHub.resourceCertBody")}</p>
                <Button variant="outline" className="w-full bg-transparent">
                  {t("pages.supportHub.download")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
