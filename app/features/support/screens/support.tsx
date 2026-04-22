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

const MOCK_FAQS: FAQCategory[] = [
  {
    category: "delivery",
    questions: [
      {
        question: "주문은 어떻게 하나요?",
        answer:
          "온라인 쇼핑몰에서 직접 주문하시거나, 전화(1588-1234) 또는 이메일(sales@pungrimfood.co.kr)로 주문하실 수 있습니다. B2B 고객의 경우 전담 영업팀을 통해 주문 가능합니다.",
      },
      {
        question: "배송은 얼마나 걸리나요?",
        answer:
          "일반 주문의 경우 주문 후 1-2일 내 배송됩니다. 대용량 주문이나 맞춤 제품의 경우 3-5일 정도 소요될 수 있습니다. 모든 제품은 콜드체인 시스템으로 신선하게 배송됩니다.",
      },
      {
        question: "배송비는 얼마인가요?",
        answer:
          "5만원 이상 주문 시 무료배송이며, 그 이하는 3,000원의 배송비가 부과됩니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",
      },
    ],
  },
  {
    category: "product",
    questions: [
      {
        question: "제품의 유통기한은 어떻게 되나요?",
        answer:
          "액상계란 제품은 냉장보관 시 제조일로부터 14일, 푸딩 제품은 21일입니다. 모든 제품에는 제조일과 유통기한이 명확히 표시되어 있습니다.",
      },
      {
        question: "알레르기 정보를 확인할 수 있나요?",
        answer:
          "모든 제품 포장지에 알레르기 유발 요소가 명시되어 있습니다. 계란, 우유, 대두 등의 알레르기 정보는 제품 상세 페이지에서도 확인하실 수 있습니다.",
      },
      {
        question: "보관 방법은 어떻게 되나요?",
        answer:
          "모든 제품은 냉장보관(0-4°C)이 필요합니다. 개봉 후에는 밀폐용기에 보관하시고 가능한 빨리 사용하시기 바랍니다.",
      },
    ],
  },
  {
    category: "b2b",
    questions: [
      {
        question: "B2B 할인 혜택은 무엇인가요?",
        answer:
          "수량에 따라 5-15%의 차등 할인을 제공합니다. 정기 주문 고객에게는 추가 할인 혜택이 있으며, 전담 영업팀을 통해 맞춤형 가격을 제안받으실 수 있습니다.",
      },
      {
        question: "맞춤형 제품 개발이 가능한가요?",
        answer:
          "네, 가능합니다. 최소 주문량과 개발 기간에 대해서는 별도 상담이 필요합니다. 전담 R&D팀이 고객의 요구사항에 맞는 제품을 개발해드립니다.",
      },
      {
        question: "정기 배송 서비스는 어떻게 이용하나요?",
        answer:
          "B2B 고객 대상으로 주 1-3회 정기 배송 서비스를 제공합니다. 배송 주기와 수량은 사업장 특성에 맞게 조정 가능하며, 긴급 주문도 대응 가능합니다.",
      },
    ],
  },
];

export default function SupportScreen({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { dbFaqs } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formSubmitted = actionData?.success === true;

  const faqs: FAQCategory[] = useMemo(() => {
    if (dbFaqs.length > 0) {
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
    }
    return MOCK_FAQS;
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
