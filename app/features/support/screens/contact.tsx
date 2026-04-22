/**
 * 문의하기 페이지
 * - 탭1: 문의하기 (폼 제출)
 * - 탭2: 문의내역 조회 (이름+연락처+비밀번호)
 */
import type { Route } from "./+types/contact";

import { Check, ChevronDown, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { data, useFetcher } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import {
  SectionPageTitle,
  SectionTitleStar,
} from "~/core/components/section-title-star";
import i18next from "~/core/lib/i18next.server";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import { createContact, lookupContacts } from "../lib/queries.server";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: (data as { metaTitle?: string } | undefined)?.metaTitle ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const pageBanner = await getPageBanner("contact").catch(() => null);
  return { pageBanner, metaTitle: t("pages.supportContact.metaTitle") };
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "contact") {
    try {
      const emailLocal = (fd.get("email_local") as string) ?? "";
      const emailDomain = (fd.get("email_domain") as string) ?? "";
      const email =
        emailLocal && emailDomain ? `${emailLocal}@${emailDomain}` : "";

      await createContact({
        inquiry_type: (fd.get("inquiry_type") as string) || "기타",
        name: fd.get("name") as string,
        email,
        phone: fd.get("phone") as string,
        company: (fd.get("company") as string) || null,
        title: (fd.get("inquiry_type") as string) || "기타",
        content: fd.get("content") as string,
        lookup_password: fd.get("lookup_password") as string,
      });
      return data({ success: true, intent: "contact" }, { status: 200 });
    } catch (err) {
      console.error("[문의하기] DB 저장 오류:", err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : t("pages.supportContact.errorGeneric");
      return data(
        { success: false, intent: "contact", error: message },
        { status: 500 },
      );
    }
  }

  if (intent === "lookup") {
    try {
      const results = await lookupContacts({
        name: fd.get("name") as string,
        phone: fd.get("phone") as string,
        lookup_password: fd.get("lookup_password") as string,
      });
      return data(
        { success: true, intent: "lookup", results },
        { status: 200 },
      );
    } catch {
      return data(
        {
          success: false,
          intent: "lookup",
          results: [],
          error: t("pages.supportContact.errorLookup"),
        },
        { status: 500 },
      );
    }
  }

  return data({ success: false }, { status: 400 });
}

/** DB·폼 값은 기존 한글 유지 (서버/기존 데이터 호환) */
const INQUIRY_OPTIONS = [
  { value: "제품 문의", key: "product" as const },
  { value: "배송 문의", key: "delivery" as const },
  { value: "B2B/대량구매", key: "b2b" as const },
  { value: "품질/안전", key: "quality" as const },
  { value: "환불/교환", key: "refund" as const },
  { value: "기타", key: "other" as const },
];

const EMAIL_DOMAIN_CUSTOM = "직접입력";

const EMAIL_DOMAINS = [
  EMAIL_DOMAIN_CUSTOM,
  "gmail.com",
  "naver.com",
  "kakao.com",
  "daum.net",
  "nate.com",
  "hanmail.net",
];

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

const nanum = "font-[family-name:var(--font-nanum)]";

/** 모바일 시안: h60 · rounded10 · 테두리 — PC(lg): 피그마 · 높이 60 · rounded 10 · 글자 18 #003F2B · 테두리 없음 */
const inputCls = cn(
  nanum,
  "w-full rounded-[10px] border border-black/10 bg-white px-4 text-base font-normal leading-5 text-[#003F2B] outline-none transition-colors placeholder:text-[#003F2B]/40",
  "min-h-[60px] py-[18px] md:min-h-0 md:rounded-lg md:py-3 md:text-sm",
  "lg:min-h-[60px] lg:rounded-[10px] lg:border-0 lg:px-4 lg:py-[18px] lg:text-lg lg:leading-5 lg:text-[#003F2B] lg:placeholder:text-[#003F2B]/50",
  "focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]/20 lg:focus:ring-0",
);

const selectCls = cn(inputCls, "cursor-pointer appearance-none pr-10");

export default function ContactScreen({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const pageBanner = loaderData?.pageBanner ?? null;
  const fetcher = useFetcher<typeof action>();
  const [activeTab, setActiveTab] = useState<"contact" | "lookup">("contact");

  const [form, setForm] = useState({
    inquiry_type: "",
    name: "",
    phone: "",
    email_local: "",
    email_domain: EMAIL_DOMAIN_CUSTOM,
    email_custom: "",
    company: "",
    lookup_password: "",
    content: "",
    agreed: false,
  });

  const [lookupForm, setLookupForm] = useState({
    name: "",
    phone: "",
    lookup_password: "",
  });

  const setF = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const actionData = fetcher.data as
    | {
        success: boolean;
        intent: string;
        error?: string;
        results?: {
          contact_id: number;
          inquiry_type: string;
          title: string;
          content: string;
          status: string;
          created_at: Date | string;
        }[];
      }
    | undefined;

  const contactSuccess =
    actionData?.success && actionData?.intent === "contact";
  const lookupResults =
    actionData?.intent === "lookup" ? (actionData?.results ?? []) : null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) {
      alert(t("pages.supportContact.privacyAlert"));
      return;
    }
    const fd = new FormData();
    fd.append("intent", "contact");
    fd.append("inquiry_type", form.inquiry_type);
    fd.append("name", form.name);
    fd.append("phone", form.phone);
    fd.append("email_local", form.email_local);
    fd.append(
      "email_domain",
      form.email_domain === EMAIL_DOMAIN_CUSTOM ? form.email_custom : form.email_domain,
    );
    fd.append("company", form.company);
    fd.append("lookup_password", form.lookup_password);
    fd.append("content", form.content);
    fetcher.submit(fd, { method: "post" });
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("intent", "lookup");
    fd.append("name", lookupForm.name);
    fd.append("phone", lookupForm.phone);
    fd.append("lookup_password", lookupForm.lookup_password);
    fetcher.submit(fd, { method: "post" });
  };

  const formatDate = (val: Date | string) => {
    const d = new Date(val);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const requiredMark = (
    <span
      className="ml-0.5 [font-family:Pretendard,system-ui,sans-serif] text-base font-medium text-[#F3372C] lg:text-xl lg:font-medium"
      aria-hidden
    >
      *
    </span>
  );

  const requiredNote = (
    <span className={cn(nanum, "text-xs font-normal text-black lg:text-[13px]")}>
      <span className="text-[#F3372C]">* </span>
      {t("pages.supportContact.requiredNote")}
    </span>
  );

  const requiredNoteLookup = (
    <span className={cn(nanum, "text-xs font-normal text-black")}>
      <span className="text-[#F3372C]">* </span>
      {t("pages.supportContact.requiredNote")}
    </span>
  );

  const inquiryLabel = (value: string) => {
    const opt = INQUIRY_OPTIONS.find((o) => o.value === value);
    return opt ? t(`pages.supportContact.inquiry.${opt.key}`) : value;
  };

  const statusLabel = (status: string) => {
    if (status === "pending") return t("pages.supportContact.status.pending");
    if (status === "completed") return t("pages.supportContact.status.completed");
    return status;
  };

  const domainOptionLabel = (d: string) =>
    d === EMAIL_DOMAIN_CUSTOM ? t("pages.supportContact.emailDomainCustom") : d;

  const hqAddress = t("pages.supportContact.hqAddress");
  const hqAddressShort = t("pages.supportContact.hqAddressShort");

  const labelClass = cn(
    nanum,
    "text-base font-bold text-black md:text-[clamp(15px,3vw,20px)] md:font-semibold md:text-gray-800",
    "lg:text-xl lg:font-bold lg:text-black",
  );

  /** 모바일 시안: 라벨 행 너비 200px (문의유형 전용 행 제외) */
  const fieldLabelClass = cn(
    labelClass,
    "max-md:inline-flex max-md:w-[200px] max-md:max-w-full max-md:shrink-0 max-md:items-center max-md:gap-0.5",
  );

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/support_banner_temp.png"
        title={t("pages.supportContact.bannerTitle")}
        subtitle={t("pages.supportContact.bannerSubtitle")}
        breadcrumb={[
          { label: t("common.breadcrumbHome"), href: "/" },
          { label: t("navigation.support.title"), href: "/support" },
          { label: t("navigation.links.contact") },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-0 pb-[200px] md:py-12 md:pb-12 lg:py-[100px] lg:pb-[100px]">
        {/* 모바일 시안: 스파클 + 문의하기 */}
        <SectionPageTitle
          as="h1"
          preset="default"
          starVariant="product"
          className={cn(nanum, "pt-5 md:hidden")}
        >
          {t("pages.supportContact.mobileH1")}
        </SectionPageTitle>

        <div className="flex flex-col gap-5 pt-5 pb-10 max-md:gap-5 md:gap-6 lg:flex-row lg:items-start lg:gap-[100px] lg:pt-0 lg:pb-0">
          {/* 본사/공장 카드 — PC: w 580 · rounded 40 · p 60 (피그마) */}
          <div
            className={cn(
              "w-full shrink-0 bg-white shadow-sm max-md:rounded-[10px] max-md:p-5 md:rounded-2xl md:p-7",
              "mb-10 lg:w-[580px] lg:rounded-[40px] lg:p-[60px] lg:shadow-none",
            )}
          >
            <div className="flex items-start justify-between gap-3 max-md:items-center lg:items-end lg:gap-3">
              <h3
                className={cn(
                  nanum,
                  "text-xl leading-[30px] font-extrabold text-[#1F2121] md:text-lg md:leading-snug",
                  "lg:text-[28px] lg:leading-[42px] lg:font-extrabold",
                )}
              >
                {t("pages.supportContact.hqTitle")}
              </h3>
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(hqAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[42px] shrink-0 items-center gap-1 rounded-[60px] bg-[#FAE100] py-2 pr-3 pl-6 [font-family:Pretendard,system-ui,sans-serif] text-sm font-medium text-[#1F2121] transition-opacity hover:opacity-90 lg:h-[42px] lg:py-2 lg:pr-3 lg:pl-6"
              >
                {t("pages.supportContact.kakaoMap")}
                <img
                  src="/faq/marker_icon.png"
                  alt=""
                  aria-hidden
                  className="h-5 w-5 shrink-0 object-contain"
                />
              </a>
            </div>
            <p
              className={cn(
                nanum,
                "mt-3 text-base leading-6 font-bold text-[#1F2121] md:mt-2 md:text-sm md:font-normal md:text-gray-500",
                "lg:mt-3 lg:text-lg lg:leading-[27px] lg:font-bold lg:text-[#1F2121]",
              )}
            >
              {hqAddressShort}
            </p>

            <div className="my-5 border-t border-[#1F2121]/20 pt-5 max-md:my-5 md:my-4 md:border-gray-100 lg:my-10 lg:border-[#1F2121]/20 lg:pt-10" />

            <div
              className={cn(
                nanum,
                "flex flex-col gap-3 text-sm md:text-sm lg:gap-3",
              )}
            >
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-2.5">
                <span className="w-[100px] shrink-0 text-base leading-6 font-extrabold text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400 lg:w-[100px] lg:text-base lg:leading-6 lg:font-extrabold lg:text-[#1F2121]">
                  {t("pages.supportContact.labelTel")}
                </span>
                <a
                  href="tel:02-538-5617"
                  className="text-base leading-6 font-extrabold text-[#02633E] hover:underline md:text-sm md:font-normal lg:text-base lg:leading-6 lg:font-extrabold"
                >
                  02-538-5617
                </a>
              </div>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-2.5">
                <span className="w-[100px] shrink-0 text-base leading-6 font-extrabold text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400 lg:w-[100px] lg:text-base lg:leading-6 lg:font-extrabold lg:text-[#1F2121]">
                  {t("pages.supportContact.labelFax")}
                </span>
                <span className="text-base leading-6 font-extrabold text-[#02633E] md:text-sm md:font-normal lg:text-base lg:leading-6 lg:font-extrabold">
                  02-538-5623
                </span>
              </div>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:gap-2.5">
                <span className="w-[100px] shrink-0 text-base leading-6 font-extrabold text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400 lg:w-[100px] lg:text-base lg:leading-6 lg:font-extrabold lg:text-[#1F2121]">
                  {t("pages.supportContact.labelEmail")}
                </span>
                <div className="min-w-0 lg:flex-1">
                  <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-2 lg:gap-y-0">
                    <a
                      href="mailto:poonglim@freshegg.co.kr"
                      className="block text-base leading-6 font-extrabold text-[#02633E] hover:underline md:text-sm md:font-normal lg:text-base lg:leading-6 lg:font-extrabold"
                    >
                      poonglim@freshegg.co.kr
                    </a>
                    <p className="text-sm leading-[21px] font-bold text-[#1F2121]/50 md:text-xs md:font-normal md:text-gray-400 lg:text-sm lg:leading-[21px] lg:font-bold">
                      {t("pages.supportContact.emailNote24h")}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:gap-2.5">
                <span className="w-[100px] shrink-0 text-base leading-6 font-extrabold text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400 lg:w-[100px] lg:text-base lg:leading-6 lg:font-extrabold lg:text-[#1F2121]">
                  {t("pages.supportContact.labelHours")}
                </span>
                <div className="min-w-0 lg:flex-1">
                  <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-2">
                    <p className="text-base leading-6 font-extrabold text-[#02633E] md:text-sm md:font-normal md:text-gray-600 lg:text-base lg:leading-6 lg:font-extrabold lg:text-[#02633E]">
                      {t("pages.supportContact.hoursWeekday")}
                    </p>
                    <p className="text-sm leading-[21px] font-bold text-[#1F2121]/50 md:text-xs md:font-normal md:text-gray-400 lg:text-sm lg:leading-[21px] lg:font-bold">
                      {t("pages.supportContact.hoursClosedNote")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 + 폼 — 모바일: 탭↔본문 gap 60px (시안) */}
          <div className="flex-1 max-md:pb-[40px] md:pb-0">
            <div className="flex flex-col max-md:gap-[60px]">
              <div
                className={cn(
                  "flex overflow-hidden",
                  "md:mb-6 md:rounded-xl md:border md:border-[#D8D0BB]",
                  "lg:mb-[60px] lg:rounded-none lg:border-0",
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className={cn(
                    nanum,
                    "flex flex-1 items-center justify-center gap-2.5 text-base leading-6 font-extrabold transition-colors",
                    "max-md:rounded-l-[40px] max-md:rounded-r-none max-md:px-[30px] max-md:py-5",
                    "md:h-auto md:rounded-none md:py-4 md:text-sm md:font-bold",
                    "lg:rounded-tl-[40px] lg:rounded-tr-none lg:rounded-br-none lg:rounded-bl-[40px] lg:px-[30px] lg:py-5 lg:text-xl lg:leading-[30px] lg:font-extrabold",
                    activeTab === "contact"
                      ? "bg-[#32AF32] text-white"
                      : "bg-[#EAE3C9] text-[#1F2121] lg:font-extrabold",
                  )}
                >
                  {activeTab === "contact" && (
                    <>
                      <SectionTitleStar
                        variant="introVector"
                        className="hidden h-[21px] w-[21px] shrink-0 object-contain brightness-0 invert lg:block"
                      />
                      <SectionTitleStar
                        variant="onDark"
                        className="h-[14px] w-[14px] shrink-0 lg:hidden"
                      />
                    </>
                  )}
                  {t("pages.supportContact.tabContact")}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("lookup")}
                  className={cn(
                    nanum,
                    "flex flex-1 items-center justify-center gap-2.5 text-base leading-6 font-extrabold transition-colors",
                    "max-md:rounded-l-none max-md:rounded-r-[40px] max-md:px-[30px] max-md:py-5",
                    "md:h-auto md:rounded-none md:py-4 md:text-sm md:font-medium",
                    "lg:rounded-tl-none lg:rounded-tr-[40px] lg:rounded-br-[40px] lg:rounded-bl-none lg:px-[30px] lg:py-5 lg:text-xl lg:leading-[30px] lg:font-extrabold",
                    activeTab === "lookup"
                      ? "bg-[#32AF32] text-white"
                      : "bg-[#EAE3C9] text-[#1F2121]",
                  )}
                >
                  {activeTab === "lookup" && (
                    <>
                      <SectionTitleStar
                        variant="introVector"
                        className="hidden h-[21px] w-[21px] shrink-0 object-contain brightness-0 invert lg:block"
                      />
                      <SectionTitleStar
                        variant="onDark"
                        className="h-[14px] w-[14px] shrink-0 lg:hidden"
                      />
                    </>
                  )}
                  {t("pages.supportContact.tabLookup")}
                </button>
              </div>

              {/* ── 탭1: 문의하기 ── */}
              {activeTab === "contact" &&
                (contactSuccess ? (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-12 text-center md:py-16">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full text-2xl md:h-16 md:w-16 md:text-3xl"
                      style={{ backgroundColor: "#F0EEDD" }}
                    >
                      ✅
                    </div>
                    <p className="text-lg font-bold text-gray-800 md:text-xl">
                      {t("pages.supportContact.successTitle")}
                    </p>
                    <p className="text-xs text-gray-500 md:text-sm">
                      {t("pages.supportContact.successSubtitle")}
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab("contact");
                        setForm({
                          inquiry_type: "",
                          name: "",
                          phone: "",
                          email_local: "",
                          email_domain: EMAIL_DOMAIN_CUSTOM,
                          email_custom: "",
                          company: "",
                          lookup_password: "",
                          content: "",
                          agreed: false,
                        });
                        fetcher.load?.("");
                      }}
                      className="mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                      style={{ backgroundColor: "#02633E" }}
                    >
                      {t("pages.supportContact.newInquiryCta")}
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleContactSubmit}
                    className="flex w-full flex-col max-md:gap-10 md:gap-5 lg:gap-[30px]"
                  >
                    <div className="flex w-full flex-col gap-5 lg:gap-[30px]">
                      <div className="flex flex-col gap-5 lg:gap-5">
                        <div className="flex w-full items-center justify-between gap-2">
                          <div
                            className={cn(
                              labelClass,
                              "inline-flex items-center gap-0.5",
                            )}
                          >
                            {t("pages.supportContact.labelInquiryType")}
                            {requiredMark}
                          </div>
                          {requiredNote}
                        </div>
                        <div className="relative">
                          <select
                            value={form.inquiry_type}
                            onChange={(e) =>
                              setF("inquiry_type", e.target.value)
                            }
                            required
                            className={cn(
                              selectCls,
                              !form.inquiry_type && "text-[#003F2B]/50",
                            )}
                          >
                            <option value="" disabled>
                              {t("pages.supportContact.selectInquiryPlaceholder")}
                            </option>
                            {INQUIRY_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {inquiryLabel(opt.value)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#1F2121] opacity-60"
                            aria-hidden
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-5">
                        <label className={fieldLabelClass}>
                          {t("pages.supportContact.labelName")}
                          {requiredMark}
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setF("name", e.target.value)}
                          placeholder={t("pages.supportContact.placeholderName")}
                          required
                          className={inputCls}
                        />
                      </div>

                      <div className="flex flex-col gap-5">
                        <label className={fieldLabelClass}>
                          {t("pages.supportContact.labelPhone")}
                          {requiredMark}
                        </label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setF("phone", e.target.value)}
                          placeholder={t("pages.supportContact.placeholderPhone")}
                          required
                          className={inputCls}
                        />
                      </div>

                      <div className="flex flex-col gap-5">
                        <label className={fieldLabelClass}>{t("pages.supportContact.labelEmailField")}</label>
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-2 lg:flex-row lg:items-stretch lg:gap-5">
                          <input
                            type="text"
                            value={form.email_local}
                            onChange={(e) =>
                              setF("email_local", e.target.value)
                            }
                            placeholder={t("pages.supportContact.placeholderEmailLocal")}
                            className={cn(
                              inputCls,
                              "md:flex-[2] lg:min-w-0 lg:flex-1",
                            )}
                          />
                          <div
                            className={cn(
                              "flex min-h-[60px] w-full items-center justify-center rounded-[10px] border border-black/10 bg-white [font-family:Pretendard,system-ui,sans-serif] text-[18px] leading-5 font-light text-[#7B7B7B]",
                              "md:hidden lg:flex lg:min-h-[60px] lg:w-12 lg:shrink-0 lg:rounded-[10px] lg:border-0 lg:bg-white",
                            )}
                            aria-hidden
                          >
                            @
                          </div>
                          <span
                            className={cn(
                              "hidden shrink-0 self-center [font-family:Pretendard,system-ui,sans-serif] text-lg font-light text-[#7B7B7B] md:inline lg:hidden",
                            )}
                          >
                            @
                          </span>
                          {form.email_domain === EMAIL_DOMAIN_CUSTOM && (
                            <input
                              type="text"
                              value={form.email_custom}
                              onChange={(e) =>
                                setF("email_custom", e.target.value)
                              }
                              placeholder={t("pages.supportContact.placeholderDomainCustom")}
                              className={cn(
                                inputCls,
                                "w-full md:min-w-0 md:flex-1",
                              )}
                            />
                          )}
                          <div className="relative w-full md:min-w-0 md:flex-1">
                            <select
                              value={form.email_domain}
                              onChange={(e) => {
                                setF("email_domain", e.target.value);
                                if (e.target.value !== EMAIL_DOMAIN_CUSTOM)
                                  setF("email_custom", "");
                              }}
                              className={selectCls}
                            >
                              {EMAIL_DOMAINS.map((d) => (
                                <option key={d} value={d}>
                                  {domainOptionLabel(d)}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-[#1F2121] opacity-60"
                              aria-hidden
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-5">
                        <label className={fieldLabelClass}>
                          {t("pages.supportContact.labelCompany")}
                          {requiredMark}
                        </label>
                        <input
                          type="text"
                          value={form.company}
                          onChange={(e) => setF("company", e.target.value)}
                          placeholder={t("pages.supportContact.placeholderCompany")}
                          className={inputCls}
                        />
                      </div>

                      <div className="flex flex-col gap-5">
                        <label className={fieldLabelClass}>
                          {t("pages.supportContact.labelPassword")}
                          {requiredMark}
                        </label>
                        <input
                          type="password"
                          value={form.lookup_password}
                          onChange={(e) =>
                            setF("lookup_password", e.target.value)
                          }
                          placeholder={t("pages.supportContact.placeholderPassword")}
                          required
                          className={inputCls}
                        />
                      </div>

                      <div className="flex flex-col gap-5">
                        <label className={fieldLabelClass}>
                          {t("pages.supportContact.labelContent")}
                          {requiredMark}
                        </label>
                        <textarea
                          value={form.content}
                          onChange={(e) => setF("content", e.target.value)}
                          placeholder={t("pages.supportContact.placeholderContent")}
                          required
                          rows={6}
                          className={cn(
                            inputCls,
                            "min-h-[200px] resize-none md:min-h-0 lg:min-h-[200px]",
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex w-full flex-col items-stretch gap-5">
                      <div
                        className={cn(
                          nanum,
                          "flex w-full items-center gap-3 rounded-[10px] bg-[#EAE3C9] p-5 text-sm leading-[21px] font-bold text-[#1F2121] md:rounded-xl md:p-4",
                          "lg:gap-3 lg:rounded-[10px] lg:px-[30px] lg:py-5 lg:font-[Pretendard,system-ui,sans-serif] lg:text-lg lg:leading-normal lg:font-medium lg:text-[#1F2121]",
                        )}
                      >
                        <label
                          htmlFor="agree"
                          className="min-w-0 flex-1 cursor-pointer lg:min-h-[44px] lg:leading-normal"
                        >
                          {t("pages.supportContact.privacyCheckbox")}
                        </label>
                        <div className="relative h-[18px] w-[18px] shrink-0">
                          <input
                            id="agree"
                            type="checkbox"
                            checked={form.agreed}
                            onChange={(e) => setF("agreed", e.target.checked)}
                            className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-full border border-[#DDDDDD] bg-white transition-colors checked:border-[#02633E] checked:bg-[#02633E]"
                          />
                          {form.agreed && (
                            <Check
                              className="pointer-events-none absolute top-0.5 left-0.5 h-3.5 w-3.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </div>

                      {actionData?.intent === "contact" &&
                        !actionData.success && (
                          <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            ⚠️{" "}
                            {(actionData as { error?: string }).error ??
                              t("pages.supportContact.errorGeneric")}
                          </div>
                        )}

                      <div className="flex w-full flex-col pt-0 md:flex md:justify-center lg:items-center">
                        <button
                          type="submit"
                          disabled={fetcher.state === "submitting"}
                          className={cn(
                            nanum,
                            "w-full rounded-[60px] bg-[#02633E] px-10 py-5 text-lg leading-[23.4px] font-extrabold text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 md:w-auto md:rounded-full md:px-10 md:py-3 md:text-[clamp(15px,2.5vw,18px)] md:leading-normal",
                            "lg:rounded-[60px] lg:px-10 lg:py-5 lg:text-lg lg:leading-[23.4px] lg:font-extrabold",
                          )}
                        >
                          {fetcher.state === "submitting"
                            ? t("pages.supportContact.submittingCta")
                            : t("pages.supportContact.submitCta")}
                        </button>
                      </div>
                    </div>
                  </form>
                ))}

              {/* ── 탭2: 문의내역 조회 — PC: 피그마 gap 30/20 · 안내 28/700 · 버튼 px 60 · 검색 24 */}
              {activeTab === "lookup" && (
                <div className="flex flex-col max-md:gap-[30px] md:gap-6 lg:gap-[60px]">
                  <form
                    onSubmit={handleLookupSubmit}
                    className="flex w-full flex-col gap-5 md:gap-5 lg:gap-[30px]"
                  >
                    <p
                      className={cn(
                        nanum,
                        "text-base font-bold text-black md:text-[28px] md:leading-snug md:text-gray-800",
                        "lg:text-[28px] lg:leading-normal lg:font-bold lg:text-black",
                      )}
                    >
                      {t("pages.supportContact.lookupIntro")}
                    </p>

                    <div className="flex flex-col gap-5 lg:gap-5">
                      <div className="flex w-full items-center justify-between gap-2">
                        <div
                          className={cn(
                            labelClass,
                            "inline-flex items-center gap-0.5",
                          )}
                        >
                          {t("pages.supportContact.labelName")}
                          {requiredMark}
                        </div>
                        <span className="hidden lg:inline">
                          {requiredNoteLookup}
                        </span>
                        <span className="lg:hidden">{requiredNote}</span>
                      </div>
                      <input
                        type="text"
                        value={lookupForm.name}
                        onChange={(e) =>
                          setLookupForm((p) => ({ ...p, name: e.target.value }))
                        }
                        placeholder={t("pages.supportContact.placeholderName")}
                        required
                        className={cn(
                          inputCls,
                          "lg:placeholder:text-neutral-900 lg:placeholder:opacity-80",
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-5 lg:gap-5">
                      <label
                        className={cn(
                          fieldLabelClass,
                          "inline-flex items-center gap-0.5 lg:inline-flex",
                        )}
                      >
                        {t("pages.supportContact.labelPhone")}
                        {requiredMark}
                      </label>
                      <input
                        type="tel"
                        value={lookupForm.phone}
                        onChange={(e) =>
                          setLookupForm((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        placeholder={t("pages.supportContact.placeholderPhone")}
                        required
                        className={cn(
                          inputCls,
                          "lg:min-h-[56px] lg:placeholder:text-[#1F2121] lg:placeholder:opacity-90",
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-5 lg:gap-5">
                      <label
                        className={cn(
                          fieldLabelClass,
                          "inline-flex items-center gap-0.5 lg:inline-flex",
                        )}
                      >
                        {t("pages.supportContact.labelPassword")}
                        {requiredMark}
                      </label>
                      <input
                        type="password"
                        value={lookupForm.lookup_password}
                        onChange={(e) =>
                          setLookupForm((p) => ({
                            ...p,
                            lookup_password: e.target.value,
                          }))
                        }
                        placeholder={t("pages.supportContact.placeholderPassword")}
                        required
                        className={cn(
                          inputCls,
                          "lg:placeholder:text-neutral-900 lg:placeholder:opacity-80",
                        )}
                      />
                    </div>

                    <div className="flex flex-col items-stretch gap-5 pt-0 md:flex md:justify-center lg:items-center">
                      <button
                        type="submit"
                        disabled={fetcher.state === "submitting"}
                        className={cn(
                          nanum,
                          "inline-flex w-full items-center justify-center gap-2.5 rounded-[60px] bg-[#02633E] px-10 py-5 text-lg leading-[23.4px] font-extrabold text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 md:w-auto md:rounded-full md:py-3 md:text-[clamp(15px,2.5vw,18px)] md:leading-normal",
                          "lg:gap-2.5 lg:rounded-[60px] lg:px-[60px] lg:py-5 lg:text-lg lg:leading-[23.4px] lg:font-extrabold",
                        )}
                      >
                        {fetcher.state === "submitting"
                          ? t("pages.supportContact.lookupSubmitting")
                          : t("pages.supportContact.lookupCta")}
                        <Search
                          className="h-6 w-6 shrink-0 text-white md:h-4 md:w-4 lg:h-6 lg:w-6"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </form>

                  {lookupResults !== null && (
                    <div className="w-full">
                      {lookupResults.length === 0 ? (
                        <div
                          className="rounded-xl py-10 text-center text-sm text-gray-400"
                          style={{ backgroundColor: "#fff" }}
                        >
                          {t("pages.supportContact.noLookupResults")}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lookupResults.map((item) => (
                            <div
                              key={item.contact_id}
                              className="rounded-xl p-4 md:p-5"
                              style={{ backgroundColor: "#fff" }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-[#EAE3C9] px-2.5 py-0.5 text-xs font-semibold text-[#003F2B]">
                                      {inquiryLabel(item.inquiry_type)}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-800">
                                      {item.title}
                                    </span>
                                  </div>
                                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                                    {item.content}
                                  </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLOR[item.status] ?? "bg-gray-100 text-gray-600"}`}
                                  >
                                    {statusLabel(item.status)}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(item.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
