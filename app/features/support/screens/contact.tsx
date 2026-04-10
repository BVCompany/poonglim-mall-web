/**
 * 문의하기 페이지
 * - 탭1: 문의하기 (폼 제출)
 * - 탭2: 문의내역 조회 (이름+연락처+비밀번호)
 */
import { useState } from "react";
import { data, useFetcher } from "react-router";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import type { Route } from "./+types/contact";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { createContact, lookupContacts } from "../lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "문의하기 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const pageBanner = await getPageBanner("contact").catch(() => null);
  return { pageBanner };
}

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData();
  const intent = fd.get("intent") as string;

  if (intent === "contact") {
    try {
      const emailLocal = (fd.get("email_local") as string) ?? "";
      const emailDomain = (fd.get("email_domain") as string) ?? "";
      const email = emailLocal && emailDomain ? `${emailLocal}@${emailDomain}` : "";

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
      const message = err instanceof Error ? err.message : "제출 중 오류가 발생했습니다.";
      return data({ success: false, intent: "contact", error: message }, { status: 500 });
    }
  }

  if (intent === "lookup") {
    try {
      const results = await lookupContacts({
        name: fd.get("name") as string,
        phone: fd.get("phone") as string,
        lookup_password: fd.get("lookup_password") as string,
      });
      return data({ success: true, intent: "lookup", results }, { status: 200 });
    } catch {
      return data({ success: false, intent: "lookup", results: [], error: "조회 중 오류가 발생했습니다." }, { status: 500 });
    }
  }

  return data({ success: false }, { status: 400 });
}

/* ── 문의유형 옵션 ── */
const INQUIRY_TYPES = ["제품 문의", "배송 문의", "B2B/대량구매", "품질/안전", "환불/교환", "기타"];

/* ── 이메일 도메인 옵션 ── */
const EMAIL_DOMAINS = ["직접입력", "gmail.com", "naver.com", "kakao.com", "daum.net", "nate.com", "hanmail.net"];

const STATUS_LABEL: Record<string, string> = {
  pending: "접수 완료",
  completed: "처리 완료",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};

const nanum = "font-[family-name:var(--font-nanum)]";

/** 모바일 시안: h60 · rounded10 · 입력글자 #003F2B 16/400 — PC는 기존 테두리 유지 */
const inputCls = cn(
  nanum,
  "w-full rounded-[10px] border border-black/10 bg-white px-4 text-base font-normal leading-5 text-[#003F2B] outline-none transition-colors placeholder:text-[#003F2B]/40",
  "min-h-[60px] py-[18px] md:min-h-0 md:rounded-lg md:py-3 md:text-sm",
  "focus:border-[#02633E] focus:ring-1 focus:ring-[#02633E]/20",
);

const selectCls = cn(
  inputCls,
  "cursor-pointer appearance-none pr-10",
);

const requiredMark = (
  <span
    className="ml-0.5 text-base font-medium text-[#F3372C] [font-family:Pretendard,system-ui,sans-serif]"
    aria-hidden
  >
    *
  </span>
);

const requiredNote = (
  <span className={cn(nanum, "text-xs font-normal text-black")}>
    <span className="text-[#F3372C]">* </span>
    필수 입력사항
  </span>
);

export default function ContactScreen({ loaderData }: Route.ComponentProps) {
  const pageBanner = loaderData?.pageBanner ?? null;
  const fetcher = useFetcher<typeof action>();
  const [activeTab, setActiveTab] = useState<"contact" | "lookup">("contact");

  const [form, setForm] = useState({
    inquiry_type: "",
    name: "",
    phone: "",
    email_local: "",
    email_domain: "직접입력",
    email_custom: "",
    company: "",
    lookup_password: "",
    content: "",
    agreed: false,
  });

  const [lookupForm, setLookupForm] = useState({ name: "", phone: "", lookup_password: "" });

  const setF = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const actionData = fetcher.data as
    | { success: boolean; intent: string; error?: string; results?: { contact_id: number; inquiry_type: string; title: string; content: string; status: string; created_at: Date | string }[] }
    | undefined;

  const contactSuccess = actionData?.success && actionData?.intent === "contact";
  const lookupResults = actionData?.intent === "lookup" ? (actionData?.results ?? []) : null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agreed) { alert("개인정보 처리방침에 동의해주세요."); return; }
    const fd = new FormData();
    fd.append("intent", "contact");
    fd.append("inquiry_type", form.inquiry_type);
    fd.append("name", form.name);
    fd.append("phone", form.phone);
    fd.append("email_local", form.email_local);
    fd.append("email_domain", form.email_domain === "직접입력" ? form.email_custom : form.email_domain);
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

  const labelClass = cn(
    nanum,
    "text-base font-bold text-black md:text-[clamp(15px,3vw,20px)] md:font-semibold md:text-gray-800",
  );

  /** 모바일 시안: 라벨 행 너비 200px (문의유형 전용 행 제외) */
  const fieldLabelClass = cn(
    labelClass,
    "max-md:inline-flex max-md:w-[200px] max-md:max-w-full max-md:shrink-0 max-md:items-center max-md:gap-0.5",
  );

  const HQ_ADDRESS = "충청북도 진천군 이월면 궁동길 51-21";
  const HQ_ADDRESS_SHORT = "충북 진천군 이월면 궁동길 51-21";

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
      <PageBanner
        imageUrl="/banner/support_banner_temp.png"
        title="문의하기"
        subtitle="궁금한 점이 있으시면 언제든 문의해주세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "문의하기" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pb-[200px] pt-0 md:py-12 md:pb-12">
        {/* 모바일 시안: 스파클 + 문의하기 */}
        <div
          className={cn(
            nanum,
            "flex items-center gap-[11px] pt-5 md:hidden",
          )}
        >
          <SectionTitleStar variant="product" className="h-[21px] w-[21px]" />
          <h1 className="text-[18px] font-extrabold leading-[30px] text-[#1F2121]">
            문의하기
          </h1>
        </div>

        <div className="flex flex-col gap-5 pt-5 pb-10 max-md:gap-5 md:gap-6 lg:flex-row lg:items-start lg:gap-10 lg:pt-6">
          {/* 본사/공장 카드 */}
          <div
            className={cn(
              "w-full shrink-0 bg-white shadow-sm max-md:rounded-[10px] max-md:p-5 md:rounded-2xl md:p-7 lg:w-[340px]",
            )}
          >
            <div className="flex items-start justify-between gap-3 max-md:items-center">
              <h3
                className={cn(
                  nanum,
                  "text-xl font-extrabold leading-[30px] text-[#1F2121] md:text-lg md:leading-snug",
                )}
              >
                본사/공장
              </h3>
              <a
                href={`https://map.kakao.com/link/search/${encodeURIComponent(HQ_ADDRESS)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[42px] shrink-0 items-center gap-1 rounded-[60px] bg-[#FAE100] py-2 pl-6 pr-3 text-sm font-medium text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif] transition-opacity hover:opacity-90"
              >
                카카오맵
                <MapPin className="h-5 w-5 shrink-0 rounded-full" aria-hidden />
              </a>
            </div>
            <p
              className={cn(
                nanum,
                "mt-3 text-base font-bold leading-6 text-[#1F2121] md:mt-2 md:text-sm md:font-normal md:text-gray-500",
              )}
            >
              {HQ_ADDRESS_SHORT}
            </p>

            <div className="my-5 border-t border-[#1F2121]/20 pt-5 max-md:my-5 md:my-4 md:border-gray-100" />

            <div className={cn(nanum, "flex flex-col gap-3 text-sm md:text-sm")}>
              <div className="flex flex-col gap-2.5">
                <span className="w-[100px] text-base font-extrabold leading-6 text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400">
                  TEL
                </span>
                <a
                  href="tel:02-538-5617"
                  className="text-base font-extrabold leading-6 text-[#02633E] hover:underline md:text-sm md:font-normal"
                >
                  02-538-5617
                </a>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="w-[100px] text-base font-extrabold leading-6 text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400">
                  FAX
                </span>
                <span className="text-base font-extrabold leading-6 text-[#02633E] md:text-sm md:font-normal">
                  02-538-5623
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="w-[100px] text-base font-extrabold leading-6 text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400">
                  이메일
                </span>
                <div>
                  <a
                    href="mailto:poonglim@freshegg.co.kr"
                    className="block text-base font-extrabold leading-6 text-[#02633E] hover:underline md:text-sm md:font-normal"
                  >
                    poonglim@freshegg.co.kr
                  </a>
                  <p className="mt-1 text-sm font-bold leading-[21px] text-[#1F2121]/50 md:text-xs md:font-normal md:text-gray-400">
                    24시간 접수 가능
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="w-[100px] text-base font-extrabold leading-6 text-[#1F2121] md:w-16 md:text-xs md:font-semibold md:text-gray-400">
                  운영시간
                </span>
                <div>
                  <p className="text-base font-extrabold leading-6 text-[#02633E] md:text-sm md:font-normal md:text-gray-600">
                    평일 09:00 - 18:00
                  </p>
                  <p className="mt-1 text-sm font-bold leading-[21px] text-[#1F2121]/50 md:text-xs md:font-normal md:text-gray-400">
                    주말/공휴일 휴무
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 탭 + 폼 — 모바일: 탭↔본문 gap 60px (시안) */}
          <div className="flex-1 max-md:pb-[60px] md:pb-0">
            <div className="flex flex-col max-md:gap-[60px]">
            <div
              className={cn(
                "flex overflow-hidden",
                "md:mb-6 md:rounded-xl md:border md:border-[#D8D0BB]",
              )}
            >
              <button
                type="button"
                onClick={() => setActiveTab("contact")}
                className={cn(
                  nanum,
                  "flex flex-1 items-center justify-center gap-2.5 text-base font-extrabold leading-6 transition-colors",
                  "max-md:rounded-l-[40px] max-md:rounded-r-none max-md:px-[30px] max-md:py-5",
                  "md:h-auto md:rounded-none md:py-4 md:text-sm md:font-bold",
                  activeTab === "contact"
                    ? "bg-[#32AF32] text-white"
                    : "bg-[#EAE3C9] text-[#1F2121]",
                )}
              >
                {activeTab === "contact" && (
                  <SectionTitleStar
                    variant="onDark"
                    className="h-[14px] w-[14px] shrink-0"
                  />
                )}
                문의하기
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("lookup")}
                className={cn(
                  nanum,
                  "flex flex-1 items-center justify-center gap-2.5 text-base font-extrabold leading-6 transition-colors",
                  "max-md:rounded-r-[40px] max-md:rounded-l-none max-md:px-[30px] max-md:py-5",
                  "md:h-auto md:rounded-none md:py-4 md:text-sm md:font-medium",
                  activeTab === "lookup"
                    ? "bg-[#32AF32] text-white"
                    : "bg-[#EAE3C9] text-[#1F2121]",
                )}
              >
                {activeTab === "lookup" && (
                  <SectionTitleStar
                    variant="onDark"
                    className="h-[14px] w-[14px] shrink-0"
                  />
                )}
                문의내역 조회
              </button>
            </div>

            {/* ── 탭1: 문의하기 ── */}
            {activeTab === "contact" && (
              contactSuccess ? (
                <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white py-12 text-center md:py-16">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full text-2xl md:h-16 md:w-16 md:text-3xl" style={{ backgroundColor: "#F0EEDD" }}>✅</div>
                  <p className="text-lg font-bold text-gray-800 md:text-xl">문의가 접수되었습니다.</p>
                  <p className="text-xs text-gray-500 md:text-sm">담당자 확인 후 빠르게 연락드리겠습니다.</p>
                  <button
                    onClick={() => { setActiveTab("contact"); setForm({ inquiry_type: "", name: "", phone: "", email_local: "", email_domain: "직접입력", email_custom: "", company: "", lookup_password: "", content: "", agreed: false }); fetcher.load?.(""); }}
                    className="mt-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: "#02633E" }}
                  >
                    새 문의 작성
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleContactSubmit}
                  className="flex w-full flex-col max-md:gap-10 md:gap-5"
                >
                  <div className="flex w-full flex-col gap-5">
                  <div className="flex flex-col gap-5">
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className={cn(labelClass, "inline-flex items-center gap-0.5")}>
                        문의유형
                        {requiredMark}
                      </div>
                      {requiredNote}
                    </div>
                    <div className="relative">
                      <select
                        value={form.inquiry_type}
                        onChange={(e) => setF("inquiry_type", e.target.value)}
                        required
                        className={cn(
                          selectCls,
                          !form.inquiry_type && "text-[#003F2B]/50",
                        )}
                      >
                        <option value="" disabled>
                          선택해주세요.
                        </option>
                        {INQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1F2121] opacity-60"
                        aria-hidden
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={fieldLabelClass}>
                      이름
                      {requiredMark}
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setF("name", e.target.value)}
                      placeholder="홍길동"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={fieldLabelClass}>
                      연락처
                      {requiredMark}
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setF("phone", e.target.value)}
                      placeholder="연락처를 입력해주세요."
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={fieldLabelClass}>이메일</label>
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-2">
                      <input
                        type="text"
                        value={form.email_local}
                        onChange={(e) => setF("email_local", e.target.value)}
                        placeholder="이메일을 입력해주세요."
                        className={cn(inputCls, "md:flex-[2]")}
                      />
                      <div
                        className={cn(
                          "flex min-h-[60px] w-full items-center justify-center rounded-[10px] border border-black/10 bg-white text-[18px] font-light leading-5 text-[#7B7B7B] [font-family:Pretendard,system-ui,sans-serif] md:hidden",
                        )}
                        aria-hidden
                      >
                        @
                      </div>
                      <span
                        className={cn(
                          "hidden shrink-0 text-lg font-light text-[#7B7B7B] [font-family:Pretendard,system-ui,sans-serif] md:inline",
                        )}
                      >
                        @
                      </span>
                      {form.email_domain === "직접입력" && (
                        <input
                          type="text"
                          value={form.email_custom}
                          onChange={(e) => setF("email_custom", e.target.value)}
                          placeholder="도메인 직접입력"
                          className={cn(inputCls, "w-full md:min-w-0 md:flex-1")}
                        />
                      )}
                      <div className="relative w-full md:min-w-0 md:flex-1">
                        <select
                          value={form.email_domain}
                          onChange={(e) => {
                            setF("email_domain", e.target.value);
                            if (e.target.value !== "직접입력")
                              setF("email_custom", "");
                          }}
                          className={selectCls}
                        >
                          {EMAIL_DOMAINS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1F2121] opacity-60"
                          aria-hidden
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={fieldLabelClass}>
                      회사/기관명
                      {requiredMark}
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => setF("company", e.target.value)}
                      placeholder="회사명(선택)"
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={fieldLabelClass}>
                      비밀번호
                      {requiredMark}
                    </label>
                    <input
                      type="password"
                      value={form.lookup_password}
                      onChange={(e) => setF("lookup_password", e.target.value)}
                      placeholder="문의내역 조회 시 필요합니다"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={fieldLabelClass}>
                      문의 내용
                      {requiredMark}
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setF("content", e.target.value)}
                      placeholder="문의 내용을 상세히 작성해주세요."
                      required
                      rows={6}
                      className={cn(inputCls, "min-h-[200px] resize-none md:min-h-0")}
                    />
                  </div>
                  </div>

                  <div className="flex w-full flex-col items-stretch gap-5">
                  <div
                    className={cn(
                      nanum,
                      "flex w-full items-center gap-3 rounded-[10px] bg-[#EAE3C9] p-5 text-sm font-bold leading-[21px] text-[#1F2121] md:rounded-xl md:p-4",
                    )}
                  >
                    <label htmlFor="agree" className="min-w-0 flex-1 cursor-pointer">
                      개인정보 수집 및 이용에 동의합니다. 수집된 정보는 문의 답변 목적으로만 사용되며, 답변 완료 후 일정 기간 보관 후 파기됩니다.
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
                          className="pointer-events-none absolute left-0.5 top-0.5 h-3.5 w-3.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>

                  {actionData?.intent === "contact" && !actionData.success && (
                    <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      ⚠️{" "}
                      {(actionData as { error?: string }).error ??
                        "제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
                    </div>
                  )}

                  <div className="flex w-full flex-col pt-0 md:flex md:justify-center">
                    <button
                      type="submit"
                      disabled={fetcher.state === "submitting"}
                      className={cn(
                        nanum,
                        "w-full rounded-[60px] bg-[#02633E] px-10 py-5 text-lg font-extrabold leading-[23.4px] text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 md:w-auto md:rounded-full md:px-10 md:py-3 md:text-[clamp(15px,2.5vw,18px)] md:leading-normal",
                      )}
                    >
                      {fetcher.state === "submitting" ? "제출 중..." : "문의 접수하기"}
                    </button>
                  </div>
                  </div>
                </form>
              )
            )}

            {/* ── 탭2: 문의내역 조회 ── */}
            {activeTab === "lookup" && (
              <div className="flex flex-col max-md:gap-[30px] md:gap-6">
                <p
                  className={cn(
                    nanum,
                    "text-base font-bold text-black md:text-[28px] md:leading-snug md:text-gray-800",
                  )}
                  style={{ letterSpacing: "-0.02em" }}
                >
                  문의 시 입력하신 정보로 조회하실 수 있습니다.
                </p>

                <form
                  onSubmit={handleLookupSubmit}
                  className="flex w-full flex-col gap-5 md:gap-5"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className={cn(labelClass, "inline-flex items-center gap-0.5")}>
                        이름
                        {requiredMark}
                      </div>
                      {requiredNote}
                    </div>
                    <input
                      type="text"
                      value={lookupForm.name}
                      onChange={(e) =>
                        setLookupForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="홍길동"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={cn(labelClass, "inline-flex items-center gap-0.5")}>
                      연락처
                      {requiredMark}
                    </label>
                    <input
                      type="tel"
                      value={lookupForm.phone}
                      onChange={(e) =>
                        setLookupForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="연락처를 입력해주세요."
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col gap-5">
                    <label className={cn(labelClass, "inline-flex items-center gap-0.5")}>
                      비밀번호
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
                      placeholder="문의내역 조회 시 필요합니다"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="flex flex-col items-stretch gap-5 pt-0 md:flex md:justify-center">
                    <button
                      type="submit"
                      disabled={fetcher.state === "submitting"}
                      className={cn(
                        nanum,
                        "inline-flex w-full items-center justify-center gap-2.5 rounded-[60px] bg-[#02633E] px-10 py-5 text-lg font-extrabold leading-[23.4px] text-white transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 md:w-auto md:rounded-full md:py-3 md:text-[clamp(15px,2.5vw,18px)] md:leading-normal",
                      )}
                    >
                      {fetcher.state === "submitting" ? "조회 중..." : "문의내역 조회"}
                      <Search className="h-6 w-6 shrink-0 text-white md:h-4 md:w-4" strokeWidth={2} aria-hidden />
                    </button>
                  </div>
                </form>

                {lookupResults !== null && (
                  <div className="w-full">
                    {lookupResults.length === 0 ? (
                      <div className="rounded-xl py-10 text-center text-sm text-gray-400" style={{ backgroundColor: "#fff" }}>
                        일치하는 문의내역이 없습니다.
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
                                    {item.inquiry_type}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-800">{item.title}</span>
                                </div>
                                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.content}</p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_COLOR[item.status] ?? "bg-gray-100 text-gray-600"}`}>
                                  {STATUS_LABEL[item.status] ?? item.status}
                                </span>
                                <span className="text-xs text-gray-400">{formatDate(item.created_at)}</span>
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
