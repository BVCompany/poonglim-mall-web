/**
 * FAQ 페이지 — 아코디언 스타일 (모바일 시안: Figma MO FAQ)
 */
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
} from "lucide-react";
import type { Route } from "./+types/faq";
import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
import { cn } from "~/core/lib/utils";
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

/* ── 카테고리 정의 (시안: 전체 보기 · 제품문의 · 주문/배송 · 품질/안전 · 기타) ── */
const CATEGORIES = [
  { key: "all", label: "전체 보기" },
  { key: "product", label: "제품문의" },
  { key: "delivery", label: "주문/배송" },
  { key: "quality", label: "품질/안전" },
  { key: "general", label: "기타" },
] as const;

/* ── 더미 FAQ 데이터 ── */
const MOCK_FAQS = [
  { faq_id: 13, category: "product",  question: "액란 제품은 어떻게 보관해야 하나요?",               answer: "액란 제품은 반드시 냉장보관(0~10°C)해야 합니다. 개봉 후에는 가능한 빨리 사용하시고, 미개봉 제품은 제조일로부터 14일 이내에 사용해 주세요. 직사광선을 피하고 냄새가 강한 식품과 함께 보관하지 않는 것이 좋습니다.", sort_order: 0, is_active: true },
  { faq_id: 12, category: "product",  question: "액란 제품은 어떻게 보관해야 하나요?",               answer: "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다.", sort_order: 1, is_active: true },
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

const nanum = "font-[family-name:var(--font-nanum)]";

export default function FAQScreen({ loaderData }: Route.ComponentProps) {
  const { dbFaqs, pageBanner, activeCategory: rawCategory } = loaderData;
  const activeCategory = CATEGORIES.some((c) => c.key === rawCategory)
    ? rawCategory
    : "all";
  const [, setSearchParams] = useSearchParams();
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [page, setPage] = useState(1);

  const allFaqs = (dbFaqs.length > 0 ? dbFaqs : MOCK_FAQS) as typeof MOCK_FAQS;

  useEffect(() => {
    setPage(1);
    setOpenId(null);
  }, [activeCategory, query]);

  const byCategory = allFaqs.filter((f) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "general")
      return f.category === "general" || f.category === "b2b";
    return f.category === activeCategory;
  });

  const filtered = byCategory.filter(
    (f) =>
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = () => { setQuery(inputValue); setPage(1); };

  const handleCategoryChange = (key: (typeof CATEGORIES)[number]["key"]) => {
    setInputValue("");
    setQuery("");
    setPage(1);
    setOpenId(null);
    setSearchParams((p) => {
      if (key === "all") p.delete("category");
      else p.set("category", key);
      return p;
    });
  };

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-[#F4F2E5]">
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

      <PageContentMax className="pb-[200px] pt-0 md:py-10 md:pb-0">
        {/* 모바일: 시안 — 녹색 스파클(별) + FAQ (Figma 사각형은 PNG 스파클로 대체) */}
        <div
          className={cn(
            nanum,
            "mb-0 flex items-center gap-[11px] pt-5 md:hidden",
          )}
        >
          <SectionTitleStar
            variant="product"
            className="h-[21px] w-[21px]"
          />
          <h1 className="text-[18px] font-extrabold leading-[30px] text-[#1F2121]">
            FAQ
          </h1>
        </div>

        {/* 필터 탭 + 검색 */}
        <div className="mb-5 flex flex-col gap-4 max-md:mb-0 md:flex-row md:items-center md:justify-between">
          <div
            className={cn(
              "flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] max-md:px-0 max-md:pb-5 max-md:pt-3.5 md:flex-wrap md:gap-2 md:pb-0 md:pt-0",
              "[&::-webkit-scrollbar]:hidden",
            )}
          >
            {CATEGORIES.map(({ key, label }) => {
              const isActive = key === activeCategory;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategoryChange(key)}
                  className={cn(
                    nanum,
                    "inline-flex shrink-0 items-center gap-2 rounded-[40px] px-3 py-1.5 text-xs font-bold leading-[18px] transition-colors",
                    "md:h-[43px] md:gap-1.5 md:px-5 md:text-lg md:font-medium",
                    isActive
                      ? "bg-[#02633E] text-white"
                      : "bg-[#EAE3C9] text-[#1F2121]",
                  )}
                >
                  {isActive && (
                    <Check
                      className="h-3 w-3 shrink-0 md:h-3.5 md:w-3.5"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  )}
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

        {/* FAQ 아코디언 */}
        {paginated.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            검색 결과가 없습니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-md:gap-2.5 md:gap-2">
            {paginated.map((faq) => {
              const isOpen = openId === faq.faq_id;
              return (
                <div
                  key={faq.faq_id}
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    "max-md:rounded-[10px] md:rounded-xl",
                    isOpen ? "bg-white" : "bg-[#EAE3C9]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggle(faq.faq_id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 text-left transition-colors max-md:gap-2.5 max-md:p-5 md:gap-4 md:px-5 md:py-4",
                      isOpen
                        ? "max-md:rounded-t-[10px] max-md:bg-white"
                        : "max-md:rounded-[10px] max-md:bg-[#EAE3C9]",
                    )}
                  >
                    <span
                      className={cn(
                        nanum,
                        "flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full text-sm font-extrabold leading-[21px] text-[#02633E] md:h-7 md:w-7 md:text-xs",
                      )}
                      style={{ backgroundColor: "#F0EEDD" }}
                    >
                      Q
                    </span>
                    <span
                      className={cn(
                        nanum,
                        "min-w-0 flex-1 text-sm leading-[21px] text-[#1F2121] md:font-semibold",
                        isOpen
                          ? "max-md:font-bold md:text-sm"
                          : "max-md:font-normal md:text-sm",
                      )}
                    >
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <>
                        <ChevronUp
                          className="h-[18px] w-[18px] shrink-0 text-[#02633E] md:hidden"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <ChevronDown
                          className="hidden h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 md:block"
                          style={{ transform: "rotate(180deg)" }}
                          aria-hidden
                        />
                      </>
                    ) : (
                      <>
                        <ChevronDown
                          className="h-[18px] w-[18px] shrink-0 text-[#02633E] md:hidden"
                          strokeWidth={2}
                          aria-hidden
                        />
                        <ChevronDown
                          className="hidden h-5 w-5 shrink-0 text-gray-400 md:block"
                          aria-hidden
                        />
                      </>
                    )}
                  </button>

                  {isOpen && (
                    <div
                      className={cn(
                        "flex gap-2.5 max-md:gap-2.5 max-md:rounded-b-[10px] max-md:border-t max-md:border-[#EAE3C9] max-md:bg-white max-md:px-5 max-md:pb-[60px] max-md:pt-5 md:gap-4 md:border-t-2 md:border-[#F5F2EB] md:px-5 md:pb-5 md:pt-4",
                      )}
                    >
                      <img
                        src="/faq/answer_icon.png"
                        alt=""
                        className="h-[21px] w-[21px] shrink-0 object-contain md:h-7 md:w-7"
                      />
                      <p
                        className={cn(
                          nanum,
                          "min-w-0 flex-1 text-[15px] font-normal leading-[22.5px] text-[#1F2121] md:text-sm md:leading-relaxed md:text-gray-600",
                        )}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {filtered.length > 0 && (
        <div className="mt-10 flex items-center justify-center max-md:pt-10 max-md:gap-[30px] md:mt-8 md:gap-1.5">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="이전 페이지"
            className={cn(
              "flex shrink-0 items-center justify-center bg-white text-[#02633E] transition-colors disabled:opacity-30",
              "h-12 w-12 rounded-[40px] max-md:overflow-hidden",
              "md:h-9 md:w-9 md:rounded-full md:border md:border-gray-300 md:text-gray-500 md:hover:border-[#02633E] md:hover:text-[#02633E]",
            )}
          >
            <ChevronLeft
              className="h-[18px] w-[18px] md:h-4 md:w-4"
              strokeWidth={2}
              aria-hidden
            />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-label={`${p}페이지`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "flex items-center justify-center font-[family-name:var(--font-nanum)] transition-colors",
                "max-md:min-h-12 max-md:min-w-10 max-md:bg-transparent max-md:px-2 max-md:text-base max-md:font-extrabold max-md:leading-[20.8px] max-md:text-[#003F2B]",
                "md:h-9 md:w-9 md:rounded-full md:text-sm md:font-medium",
                p === page
                  ? "md:bg-[#02633E] md:text-white"
                  : "md:bg-transparent md:text-[#555]",
              )}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="다음 페이지"
            className={cn(
              "flex shrink-0 items-center justify-center bg-white text-[#02633E] transition-colors disabled:opacity-30",
              "h-12 w-12 rounded-[40px] max-md:overflow-hidden",
              "md:h-9 md:w-9 md:rounded-full md:border md:border-gray-300 md:text-gray-500 md:hover:border-[#02633E] md:hover:text-[#02633E]",
            )}
          >
            <ChevronRight
              className="h-[18px] w-[18px] md:h-4 md:w-4"
              strokeWidth={2}
              aria-hidden
            />
          </button>
        </div>
        )}

        {/* CTA — 모바일: 흰 카드 rounded-[40px] · 문의 버튼 #003F2B */}
        <div className="mt-10 max-md:mt-0 max-md:px-0 max-md:pb-10 max-md:pt-10 md:mt-12">
          <div className="mx-auto max-w-[1080px] rounded-[40px] bg-white p-5 md:rounded-2xl md:p-0">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:gap-6 md:px-8 md:py-6 md:text-left">
              <div className="flex w-full flex-col items-center gap-5 md:flex-row md:items-center md:gap-5">
                <img
                  src="/faq/faq_icon.png"
                  alt=""
                  className="h-[60px] w-[60px] shrink-0 object-contain md:h-16 md:w-16"
                />
                <div className="flex w-full flex-col items-center gap-2.5 md:items-start">
                  <p
                    className={cn(
                      nanum,
                      "text-lg font-bold leading-[27px] text-[#1F2121] md:text-[28px]",
                    )}
                  >
                    원하는 답변을 찾지 못하셨나요?
                  </p>
                  <p
                    className={cn(
                      nanum,
                      "text-center text-sm font-normal uppercase leading-[21px] text-[#1F2121] md:text-left md:text-base md:normal-case md:text-gray-500",
                    )}
                  >
                    문의하기를 통해 질문해 주시면
                    <br className="md:hidden" />
                    친절하게 답변드리겠습니다.
                  </p>
                </div>
              </div>
              <Link
                to="/support/contact"
                className={cn(
                  nanum,
                  "inline-flex w-full items-center justify-center gap-2 rounded-[51px] bg-[#003F2B] px-5 py-5 text-lg font-extrabold leading-[23.4px] text-white transition-all hover:brightness-110 md:w-auto md:shrink-0 md:rounded-full md:py-3 md:text-[22px]",
                )}
              >
                문의하기
                <ArrowUpRight className="h-4 w-4 shrink-0 md:hidden" strokeWidth={2.25} />
                <ChevronRight className="hidden h-4 w-4 md:inline" strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
