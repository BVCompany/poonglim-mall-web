/**
 * 문의하기 페이지
 * - 탭1: 문의하기 (폼 제출)
 * - 탭2: 문의내역 조회 (이름+연락처+비밀번호)
 */
import { useState } from "react";
import { Link, data, useFetcher } from "react-router";
import { Check, MapPin, Search } from "lucide-react";
import type { Route } from "./+types/contact";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
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

/* ── 입력 공통 스타일 ── */
const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#02633E] placeholder:text-gray-300";
const labelStyleDesktop: React.CSSProperties = { fontSize: "20px", letterSpacing: "-0.02em", fontWeight: 600, color: "#374151", marginBottom: "6px" };
const requiredMark = <span className="ml-0.5 text-red-500">*</span>;
const requiredNote = (
  <span style={{ fontSize: "13px", letterSpacing: "-0.02em", color: "#aaa", fontWeight: 400 }}>
    <span className="text-red-500">*</span> 필수 입력사항
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

  const labelStyle: React.CSSProperties = {
    ...labelStyleDesktop,
    fontSize: "clamp(15px, 3vw, 20px)",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
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

      <div className="px-4 pt-3 md:hidden">
        <div className="inline-flex items-center gap-1.5">
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]">문의하기</h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <PageContentMax className="py-6 md:py-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">

          {/* ── 왼쪽: 본사/공장 카드 ── */}
          <div
            className="w-full shrink-0 rounded-2xl p-5 shadow-sm md:p-7 lg:w-[340px]"
            style={{ backgroundColor: "#fff" }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 md:text-lg">본사/공장</h3>
                <p className="mt-1 text-xs text-gray-500 md:text-sm">충북 진천군 이월면 공동길 51-21</p>
              </div>
              <a
                href="https://map.kakao.com/link/search/충북 진천군 이월면 공동길 51-21"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "#FFE000", color: "#3C1E1E" }}
              >
                <MapPin className="h-3 w-3" />
                카카오맵
              </a>
            </div>

            <div className="my-4 border-t border-gray-100" />

            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex gap-3">
                <span className="w-14 shrink-0 font-semibold text-gray-400 md:w-16">TEL</span>
                <a href="tel:02-538-5617" className="text-[#02633E] hover:underline">02-538-5617</a>
              </div>
              <div className="flex gap-3">
                <span className="w-14 shrink-0 font-semibold text-gray-400 md:w-16">FAX</span>
                <a href="tel:02-538-5623" className="text-[#02633E] hover:underline">02-538-5623</a>
              </div>
              <div className="flex gap-3">
                <span className="w-14 shrink-0 font-semibold text-gray-400 md:w-16">이메일</span>
                <div>
                  <a href="mailto:poonglim@freshegg.co.kr" className="block text-[#02633E] hover:underline">
                    poonglim@freshegg.co.kr
                  </a>
                  <span className="text-[10px] text-gray-400 md:text-xs">24시간 접수 가능</span>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-14 shrink-0 font-semibold text-gray-400 md:w-16">운영시간</span>
                <span className="text-gray-600">
                  평일 09:00 - 18:00<br />
                  <span className="text-[10px] text-gray-400 md:text-xs">주말/공휴일 휴무</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 탭 + 폼 ── */}
          <div className="flex-1 pb-[200px] md:pb-0">
            {/* 탭 */}
            <div className="mb-6 flex overflow-hidden rounded-full border border-[#D8D0BB] md:rounded-xl">
              <button
                onClick={() => setActiveTab("contact")}
                className="flex h-16 flex-1 items-center justify-center gap-2 px-2 text-[16px] font-extrabold tracking-[-0.04em] transition-colors md:h-auto md:py-4 md:text-sm md:font-bold md:tracking-normal"
                style={{
                  ...(activeTab === "contact"
                    ? { backgroundColor: "#32AF32", color: "#fff" }
                    : { backgroundColor: "#F0EEDD", color: "#555" }),
                }}
              >
                {activeTab === "contact" && (
                  <img src="/home/star_icon.png" alt="" className="h-3.5 w-3.5 object-contain md:h-4 md:w-4" />
                )}
                문의하기
              </button>
              <button
                onClick={() => setActiveTab("lookup")}
                className="flex h-16 flex-1 items-center justify-center gap-2 px-2 text-[16px] font-extrabold tracking-[-0.04em] transition-colors md:h-auto md:py-4 md:text-sm md:font-medium md:tracking-normal"
                style={{
                  ...(activeTab === "lookup"
                    ? { backgroundColor: "#32AF32", color: "#fff" }
                    : { backgroundColor: "#F0EEDD", color: "#555" }),
                }}
              >
                {activeTab === "lookup" && (
                  <img src="/home/star_icon.png" alt="" className="h-3.5 w-3.5 object-contain md:h-4 md:w-4" />
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
                <form onSubmit={handleContactSubmit} className="space-y-4 md:space-y-5">
                  {/* 문의유형 */}
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                      <label style={labelStyle}>문의유형 {requiredMark}</label>
                      {requiredNote}
                    </div>
                    <select
                      value={form.inquiry_type}
                      onChange={(e) => setF("inquiry_type", e.target.value)}
                      required
                      className={inputCls}
                      style={{ color: form.inquiry_type ? "#111" : "#aaa" }}
                    >
                      <option value="" disabled>선택해주세요.</option>
                      {INQUIRY_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>이름 {requiredMark}</label>
                    <input type="text" value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="홍길동" required className={inputCls} />
                  </div>

                  <div>
                    <label style={labelStyle}>연락처 {requiredMark}</label>
                    <input type="tel" value={form.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="연락처를 입력해주세요." required className={inputCls} />
                  </div>

                  <div>
                    <label style={labelStyle}>이메일</label>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <input
                        type="text"
                        value={form.email_local}
                        onChange={(e) => setF("email_local", e.target.value)}
                        placeholder="이메일을 입력해주세요."
                        className="min-w-0 flex-[2] rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#02633E] placeholder:text-gray-300"
                      />
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 text-sm text-gray-400">@</span>
                        {form.email_domain === "직접입력" && (
                          <input
                            type="text"
                            value={form.email_custom}
                            onChange={(e) => setF("email_custom", e.target.value)}
                            placeholder="도메인 직접입력"
                            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#02633E] placeholder:text-gray-300"
                          />
                        )}
                        <select
                          value={form.email_domain}
                          onChange={(e) => { setF("email_domain", e.target.value); if (e.target.value !== "직접입력") setF("email_custom", ""); }}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition-colors focus:border-[#02633E]"
                        >
                          {EMAIL_DOMAINS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>직급/직함</label>
                    <input type="text" placeholder="직급/직함을 입력해주세요." className={inputCls} />
                  </div>

                  <div>
                    <label style={labelStyle}>회사/기관명</label>
                    <input type="text" value={form.company} onChange={(e) => setF("company", e.target.value)} placeholder="회사명(선택)" className={inputCls} />
                  </div>

                  <div>
                    <label style={labelStyle}>비밀번호 {requiredMark}</label>
                    <input type="password" value={form.lookup_password} onChange={(e) => setF("lookup_password", e.target.value)} placeholder="문의내역 조회 시 필요합니다" required className={inputCls} />
                  </div>

                  <div>
                    <label style={labelStyle}>문의 내용 {requiredMark}</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setF("content", e.target.value)}
                      placeholder="문의 내용을 상세히 작성해주세요."
                      required
                      rows={6}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <div
                    className="flex items-center justify-between gap-4 rounded-xl p-3 text-xs text-gray-500 md:p-4"
                    style={{ backgroundColor: "#F0EEDD" }}
                  >
                    <label
                      htmlFor="agree"
                      className="cursor-pointer leading-relaxed"
                      style={{ fontSize: "clamp(12px, 2.5vw, 18px)", letterSpacing: "-0.02em" }}
                    >
                      개인정보 수집 및 이용에 동의합니다. 수집된 정보는 문의 답변 목적으로만 사용되며, 답변 완료 후 일정 기간 보관 후 파기됩니다.
                    </label>
                    <div className="relative shrink-0">
                      <input
                        id="agree"
                        type="checkbox"
                        checked={form.agreed}
                        onChange={(e) => setF("agreed", e.target.checked)}
                        className="h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-colors checked:border-[#02633E] checked:bg-[#02633E]"
                      />
                      {form.agreed && (
                        <Check
                          className="pointer-events-none absolute inset-0 h-5 w-5 p-0.5 text-white"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>

                  {actionData?.intent === "contact" && !actionData.success && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      ⚠️ {(actionData as { error?: string }).error ?? "제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}
                    </div>
                  )}

                  <div className="pt-2 md:flex md:justify-center">
                    <button
                      type="submit"
                      disabled={fetcher.state === "submitting"}
                      className="w-full rounded-full px-8 py-2.5 text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 md:w-auto md:px-10 md:py-3"
                      style={{ backgroundColor: "#02633E", fontSize: "clamp(15px, 2.5vw, 18px)", letterSpacing: "-0.015em", fontWeight: 800 }}
                    >
                      {fetcher.state === "submitting" ? "제출 중..." : "문의 접수하기"}
                    </button>
                  </div>
                </form>
              )
            )}

            {/* ── 탭2: 문의내역 조회 ── */}
            {activeTab === "lookup" && (
              <div className="space-y-6">
                <p className="text-lg font-bold text-gray-800 md:text-[28px]" style={{ letterSpacing: "-0.02em" }}>
                  문의 시 입력하신 정보로 조회하실 수 있습니다.
                </p>

                <form onSubmit={handleLookupSubmit} className="space-y-4 md:space-y-5">
                  <div>
                    <div className="flex items-center justify-between" style={{ marginBottom: "6px" }}>
                      <label style={labelStyle}>이름 {requiredMark}</label>
                      {requiredNote}
                    </div>
                    <input
                      type="text"
                      value={lookupForm.name}
                      onChange={(e) => setLookupForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="홍길동"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>연락처 {requiredMark}</label>
                    <input
                      type="tel"
                      value={lookupForm.phone}
                      onChange={(e) => setLookupForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="연락처를 입력해주세요."
                      required
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>비밀번호 {requiredMark}</label>
                    <input
                      type="password"
                      value={lookupForm.lookup_password}
                      onChange={(e) => setLookupForm((p) => ({ ...p, lookup_password: e.target.value }))}
                      placeholder="문의내역 조회 시 필요합니다"
                      required
                      className={inputCls}
                    />
                  </div>

                  <div className="pt-2 md:flex md:justify-center">
                    <button
                      type="submit"
                      disabled={fetcher.state === "submitting"}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-2.5 text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-60 md:w-auto md:px-10 md:py-3"
                      style={{ backgroundColor: "#02633E", fontSize: "clamp(15px, 2.5vw, 18px)", letterSpacing: "-0.015em", fontWeight: 800 }}
                    >
                      <Search className="h-4 w-4" />
                      {fetcher.state === "submitting" ? "조회 중..." : "문의내역 조회"}
                    </button>
                  </div>
                </form>

                {lookupResults !== null && (
                  <div className="mt-6">
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
      </PageContentMax>
    </div>
  );
}
