/**
 * FAQ 페이지 — 아코디언 스타일
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Route } from "./+types/faq";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { getFaqs } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

export const meta: Route.MetaFunction = () => [
  { title: "자주 묻는 질문 | 풍림푸드" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") ?? "all";

  const [dbFaqs, pageBanner] = await Promise.all([
    getFaqs(category === "all" ? undefined : category).catch(() => []),
    getPageBanner("faq").catch(() => null),
  ]);

  return { dbFaqs, pageBanner, activeCategory: category };
}

/* ── 카테고리 정의 ── */
const CATEGORIES = [
  { key: "all",      label: "전체보기" },
  { key: "product",  label: "제품문의" },
  { key: "delivery", label: "구매/배송" },
  { key: "quality",  label: "품질/기타" },
];

/* ── 더미 FAQ 데이터 ── */
const MOCK_FAQS = [
  { faq_id: 13, category: "product",  question: "액란 제품은 어떻게 냉장보관 하나요?",               answer: "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다. 개봉 후에는 가능한 빨리 사용해 주시고, 미개봉 제품은 제조일부터 14일 이내에 사용해 주세요. 직사광선을 피하고 냉내다 강한 식품과 함께 보관하지 않는 것이 좋습니다.", sort_order: 0, is_active: true },
  { faq_id: 12, category: "product",  question: "액란 제품은 어떻게 냉장보관 하나요?",               answer: "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다.", sort_order: 1, is_active: true },
  { faq_id: 11, category: "product",  question: "백란이 일반 계란과 다른점은 무엇인가요?",            answer: "백란은 껍데기 색이 흰색인 계란으로, 영양 성분은 일반 계란과 동일합니다.", sort_order: 2, is_active: true },
  { faq_id: 10, category: "delivery", question: "풍림 제품의 유통기한은 얼마나 되나요?",              answer: "제품마다 유통기한이 다릅니다. 포장재 표기를 참고해 주세요.", sort_order: 3, is_active: true },
  { faq_id: 9,  category: "delivery", question: "풍림몰에서 주문하면 배송은 얼마나 걸리나요?",       answer: "주문 확인 후 영업일 기준 2~3일 내 배송됩니다.", sort_order: 4, is_active: true },
  { faq_id: 8,  category: "delivery", question: "풍림몰에서 주문하면 배송은 얼마나 걸리나요?",       answer: "주문 확인 후 영업일 기준 2~3일 내 배송됩니다.", sort_order: 5, is_active: true },
  { faq_id: 7,  category: "quality",  question: "인터 대량 주문은 어떻게 하나요?",                   answer: "B2B 문의 페이지를 통해 연락주시면 담당자가 안내드립니다.", sort_order: 6, is_active: true },
  { faq_id: 6,  category: "general",  question: "반품 및 교환은 어떻게 하나요?",                     answer: "상품 수령 후 7일 이내 미개봉 상태에서 교환/반품 가능합니다.", sort_order: 7, is_active: true },
  { faq_id: 5,  category: "product",  question: "풍림푸드 제품은 어떤 인증을 받나요?",               answer: "HACCP, ISO 22000 등 다양한 품질 인증을 보유하고 있습니다.", sort_order: 8, is_active: true },
  { faq_id: 4,  category: "quality",  question: "계란 안전성 검사는 얼마나 자주 하나요?",            answer: "매월 정기적으로 계란 안전성 검사를 실시하고 있습니다.", sort_order: 9, is_active: true },
  { faq_id: 3,  category: "product",  question: "계란의 등급은 어떻게 나누어지나요?",                answer: "1+, 1, 2, 3등급으로 구분되며, 1+등급이 가장 신선합니다.", sort_order: 10, is_active: true },
  { faq_id: 2,  category: "b2b",      question: "공장 견학이 가능한가요?",                           answer: "사전 예약을 통해 공장 견학이 가능합니다. 견학 신청 메뉴를 이용해 주세요.", sort_order: 11, is_active: true },
  { faq_id: 1,  category: "general",  question: "자료 관련 문의는 어디로 하나요?",                   answer: "고객지원 > 문의하기 메뉴를 통해 문의해 주세요.", sort_order: 12, is_active: true },
];

const ITEMS_PER_PAGE = 10;

export default function FAQScreen({ loaderData }: Route.ComponentProps) {
  const { dbFaqs, pageBanner, activeCategory } = loaderData;
  const [, setSearchParams] = useSearchParams();
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const allFaqs = (dbFaqs.length > 0 ? dbFaqs : MOCK_FAQS) as typeof MOCK_FAQS;

  useEffect(() => { setPage(1); setOpenId(null); }, [activeCategory, query]);

  const filtered = allFaqs.filter((f) =>
    f.question.toLowerCase().includes(query.toLowerCase()) ||
    f.answer.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = () => { setQuery(inputValue); setPage(1); };

  const handleCategoryChange = (key: string) => {
    setInputValue(""); setQuery(""); setPage(1); setOpenId(null);
    setSearchParams((p) => {
      if (key === "all") p.delete("category"); else p.set("category", key);
      return p;
    });
  };

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      <PageBanner
        imageUrl="/banner/faq_banner_temp.png"
        title="자주 묻는 질문"
        subtitle="궁금하신 점을 빠르게 확인하세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "FAQ" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <div className="px-4 pt-3 md:hidden">
        <div className="inline-flex items-center gap-1.5">
          <img src="/home/product-star.png" alt="" className="h-3.5 w-3.5 object-contain" />
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#1F2121]">FAQ</h1>
        </div>
      </div>

      {/* ── 본문 ── */}
      <PageContentMax className="py-6 pb-[200px] md:py-10 md:pb-0">

        {/* ── 필터 탭 + 검색 (검색은 PC만) ── */}
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ key, label }) => {
              const isActive = key === activeCategory;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategoryChange(key)}
                  className="flex h-[clamp(34px,5vw,43px)] items-center gap-1.5 rounded-full px-3 text-[clamp(13px,2.5vw,18px)] font-medium transition-colors md:h-[43px] md:px-5 md:text-lg"
                  style={{
                    letterSpacing: "-0.04em",
                    ...(isActive
                      ? { backgroundColor: "#02633E", color: "#fff" }
                      : { backgroundColor: "#EAE3C9", color: "#003F2B" }),
                  }}
                >
                  {isActive && <Check className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5" strokeWidth={2.5} />}
                  {label}
                </button>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="검색어를 입력해주세요."
              className="h-16 w-64 rounded-full border-0 bg-white px-5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: "#02633E" }}
              aria-label="검색"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── FAQ 아코디언 목록 ── */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">검색 결과가 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {paginated.map((faq) => {
              const isOpen = openId === faq.faq_id;
              return (
                <div
                  key={faq.faq_id}
                  className="overflow-hidden rounded-xl transition-all duration-200"
                  style={{ backgroundColor: isOpen ? "#fff" : "#EAE3C9" }}
                >
                  <button
                    onClick={() => toggle(faq.faq_id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors md:gap-4 md:px-5 md:py-4"
                  >
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold md:h-7 md:w-7 md:text-xs"
                      style={{ backgroundColor: "#F0EEDD", color: "#02633E" }}
                    >
                      Q
                    </span>
                    <span className="flex-1 text-[13px] font-semibold text-gray-800 md:text-sm">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 md:h-5 md:w-5"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                  </button>

                  {isOpen && (
                    <>
                      <div style={{ borderTop: "2px solid #F5F2EB" }} />
                      <div className="flex gap-3 px-4 pb-4 pt-3 md:gap-4 md:px-5 md:pb-5 md:pt-4">
                        <img
                          src="/faq/answer_icon.png"
                          alt="A"
                          className="h-6 w-6 shrink-0 object-contain md:h-7 md:w-7"
                        />
                        <p className="flex-1 text-[13px] leading-relaxed text-gray-600 md:text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── 페이지네이션 ── */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors"
                style={
                  p === page
                    ? { backgroundColor: "#02633E", color: "#fff" }
                    : { backgroundColor: "transparent", color: "#555" }
                }
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 transition-colors disabled:opacity-30 hover:border-[#02633E] hover:text-[#02633E]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── CTA 카드 ── */}
        <div
          className="mt-10 rounded-2xl md:mt-12"
          style={{ backgroundColor: "#fff" }}
        >
          <div className="mx-auto flex max-w-[1080px] flex-col items-center gap-4 px-5 py-6 text-center md:flex-row md:justify-between md:gap-6 md:px-8 md:text-left">
            <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:gap-5">
              <img
                src="/faq/faq_icon.png"
                alt="FAQ 캐릭터"
                className="h-12 w-12 shrink-0 object-contain md:h-16 md:w-16"
              />
              <div>
                <p className="text-lg font-bold text-gray-800 md:text-[28px]" style={{ letterSpacing: "-0.04em" }}>원하는 답변을 찾지 못하셨나요?</p>
                <p className="mt-0.5 text-xs text-gray-500 md:text-[16px]" style={{ letterSpacing: "-0.04em" }}>
                  상담톡 혹은 이메일 문의를 통해 친절하게 안내해 드리겠습니다.
                </p>
              </div>
            </div>
            <Link
              to="/support/contact"
              className="inline-flex w-full items-center justify-center gap-1 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 md:w-auto md:shrink-0 md:px-6 md:py-3 md:text-[22px]"
              style={{ letterSpacing: "-0.02em", backgroundColor: "#02633E" }}
            >
              문의하기
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
