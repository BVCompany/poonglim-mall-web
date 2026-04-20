/**
 * FAQ 페이지 — 아코디언 스타일 (모바일 시안: Figma MO FAQ)
 */
import type { Route } from "./+types/faq";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import { PageBanner } from "~/core/components/page-banner";
import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";

import { getFaqs } from "../lib/queries.server";

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

/* ── 카테고리 정의 (시안: 전체보기 · 제품문의 · 주문/배송 · 품질/안전 · 기타) ── */
const CATEGORIES = [
  { key: "all", label: "전체보기" },
  { key: "product", label: "제품문의" },
  { key: "delivery", label: "주문/배송" },
  { key: "quality", label: "품질/안전" },
  { key: "general", label: "기타" },
] as const;

/* ── 더미 FAQ 데이터 ── */
const MOCK_FAQS = [
  {
    faq_id: 13,
    category: "product",
    question: "액란 제품은 어떻게 보관해야 하나요?",
    answer:
      "액란 제품은 반드시 냉장보관(0~10°C)해야 합니다. 개봉 후에는 가능한 빨리 사용하시고, 미개봉 제품은 제조일로부터 14일 이내에 사용해 주세요. 직사광선을 피하고 냄새가 강한 식품과 함께 보관하지 않는 것이 좋습니다.",
    sort_order: 0,
    is_active: true,
  },
  {
    faq_id: 12,
    category: "product",
    question: "액란 제품은 어떻게 보관해야 하나요?",
    answer: "액란 제품은 반드시 냉장(0~10°C)에서 보관해야 합니다.",
    sort_order: 1,
    is_active: true,
  },
  {
    faq_id: 11,
    category: "product",
    question: "백란이 일반 계란과 다른점은 무엇인가요?",
    answer:
      "백란은 껍데기 색이 흰색인 계란으로, 영양 성분은 일반 계란과 동일합니다.",
    sort_order: 2,
    is_active: true,
  },
  {
    faq_id: 10,
    category: "delivery",
    question: "풍림 제품의 유통기한은 얼마나 되나요?",
    answer: "제품마다 유통기한이 다릅니다. 포장재 표기를 참고해 주세요.",
    sort_order: 3,
    is_active: true,
  },
  {
    faq_id: 9,
    category: "delivery",
    question: "풍림몰에서 주문하면 배송은 얼마나 걸리나요?",
    answer: "주문 확인 후 영업일 기준 2~3일 내 배송됩니다.",
    sort_order: 4,
    is_active: true,
  },
  {
    faq_id: 8,
    category: "delivery",
    question: "풍림몰에서 주문하면 배송은 얼마나 걸리나요?",
    answer: "주문 확인 후 영업일 기준 2~3일 내 배송됩니다.",
    sort_order: 5,
    is_active: true,
  },
  {
    faq_id: 7,
    category: "quality",
    question: "인터 대량 주문은 어떻게 하나요?",
    answer: "B2B 문의 페이지를 통해 연락주시면 담당자가 안내드립니다.",
    sort_order: 6,
    is_active: true,
  },
  {
    faq_id: 6,
    category: "general",
    question: "반품 및 교환은 어떻게 하나요?",
    answer: "상품 수령 후 7일 이내 미개봉 상태에서 교환/반품 가능합니다.",
    sort_order: 7,
    is_active: true,
  },
  {
    faq_id: 5,
    category: "product",
    question: "풍림푸드 제품은 어떤 인증을 받나요?",
    answer: "HACCP, ISO 22000 등 다양한 품질 인증을 보유하고 있습니다.",
    sort_order: 8,
    is_active: true,
  },
  {
    faq_id: 4,
    category: "quality",
    question: "계란 안전성 검사는 얼마나 자주 하나요?",
    answer: "매월 정기적으로 계란 안전성 검사를 실시하고 있습니다.",
    sort_order: 9,
    is_active: true,
  },
  {
    faq_id: 3,
    category: "product",
    question: "계란의 등급은 어떻게 나누어지나요?",
    answer: "1+, 1, 2, 3등급으로 구분되며, 1+등급이 가장 신선합니다.",
    sort_order: 10,
    is_active: true,
  },
  {
    faq_id: 2,
    category: "b2b",
    question: "공장 견학이 가능한가요?",
    answer:
      "사전 예약을 통해 공장 견학이 가능합니다. 견학 신청 메뉴를 이용해 주세요.",
    sort_order: 11,
    is_active: true,
  },
  {
    faq_id: 1,
    category: "general",
    question: "자료 관련 문의는 어디로 하나요?",
    answer: "고객지원 > 문의하기 메뉴를 통해 문의해 주세요.",
    sort_order: 12,
    is_active: true,
  },
];

const ITEMS_PER_PAGE = 10;

const nanum = "font-[family-name:var(--font-nanum)]";
const pretendard = "font-[Pretendard,system-ui,sans-serif]";

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
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSearch = () => {
    setQuery(inputValue);
    setPage(1);
  };

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
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageBanner
        imageUrl="/banner/faq_banner_temp.png"
        title="자주 묻는 질문"
        subtitle="궁금하신 점을 빠르게 찾아보세요."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "고객지원", href: "/support" },
          { label: "FAQ" },
        ]}
        dbBanner={pageBanner}
        hideBreadcrumbOnMobile
      />

      <PageContentMax className="pt-0 pb-[200px] md:pt-[60px] md:pb-[100px]">
        {/* 모바일: 시안 — 녹색 스파클(별) + FAQ (Figma 사각형은 PNG 스파클로 대체) */}
        <SectionPageTitle
          as="h1"
          preset="default"
          starVariant="brandIntro"
          className={cn(nanum, "mb-0 pt-5 md:hidden")}
        >
          FAQ
        </SectionPageTitle>

        <div className="flex flex-col md:gap-[30px]">
          {/* 필터 탭 + 검색 — PC 시안: pb-20 · items-end · Pretendard 18 · 검색 360+버튼 430 */}
          <div className="mb-5 flex flex-col gap-4 max-md:mb-0 md:mb-0 md:flex-row md:items-end md:justify-between md:pb-5">
            <div
              className={cn(
                "flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] max-md:px-0 max-md:pt-3.5 max-md:pb-5 md:flex-wrap md:gap-[10px] md:pt-0 md:pb-0",
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
                      "inline-flex shrink-0 items-center rounded-[40px] transition-colors",
                      nanum,
                      "max-md:gap-2 max-md:px-3 max-md:py-1.5 max-md:text-xs max-md:leading-[18px] max-md:font-bold",
                      "md:gap-1.5 md:px-4 md:py-2 md:text-lg md:leading-[27px]",
                      pretendard,
                      "max-md:font-[family-name:var(--font-nanum)]",
                      isActive
                        ? "bg-[#02633E] text-white md:font-bold"
                        : "bg-[#EAE3C9] text-[#1F2121] md:font-medium",
                    )}
                  >
                    {isActive && (
                      <Check
                        className="h-3 w-3 shrink-0 md:h-4 md:w-4"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="hidden w-full max-w-[430px] shrink-0 items-center gap-1.5 md:flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="검색어를 입력해주세요."
                className={cn(
                  nanum,
                  "h-auto min-w-0 flex-1 rounded-[60px] border-0 bg-white px-10 py-5 text-base leading-6 font-bold text-[#1F2121] outline-none placeholder:text-[#1F2121]",
                )}
              />
              <button
                type="button"
                onClick={handleSearch}
                className="flex shrink-0 items-center justify-center rounded-[60px] bg-[#02633E] p-5 text-white transition-all hover:brightness-110 active:scale-[0.98]"
                aria-label="검색"
              >
                <Search className="h-6 w-6" strokeWidth={2} aria-hidden />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:gap-10">
            {/* FAQ 아코디언 */}
            {paginated.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 md:gap-[10px]">
                {paginated.map((faq) => {
                  const isOpen = openId === faq.faq_id;
                  return (
                    <div
                      key={faq.faq_id}
                      className={cn(
                        "transition-all duration-200",
                        "max-md:overflow-hidden max-md:rounded-[10px]",
                        isOpen ? "max-md:bg-white" : "max-md:bg-[#EAE3C9]",
                        isOpen
                          ? "md:pb-5"
                          : "md:rounded-[10px] md:bg-[#EAE3C9]",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(faq.faq_id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 text-left transition-colors",
                          "max-md:gap-2.5 max-md:p-5",
                          isOpen
                            ? "max-md:rounded-t-[10px] max-md:bg-white"
                            : "max-md:rounded-[10px] max-md:bg-[#EAE3C9]",
                          "md:gap-5 md:py-[30px] md:pr-[30px] md:pl-[50px]",
                          isOpen
                            ? "md:rounded-t-[10px] md:bg-white"
                            : "md:rounded-[10px]",
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5 md:gap-2.5">
                          <span
                            className={cn(
                              nanum,
                              "flex h-[21px] min-w-[21px] shrink-0 items-center justify-center rounded-full px-0 text-sm leading-[21px] font-extrabold text-[#02633E]",
                              "md:px-2 md:text-xl md:leading-[30px] md:font-extrabold",
                            )}
                            style={{ backgroundColor: "#F0EEDD" }}
                          >
                            Q
                          </span>
                          <span
                            className={cn(
                              nanum,
                              "min-w-0 flex-1 text-sm leading-[21px] text-[#1F2121]",
                              isOpen
                                ? "max-md:font-bold md:text-xl md:leading-[30px] md:font-bold"
                                : "max-md:font-normal md:text-xl md:leading-[30px] md:font-normal",
                            )}
                          >
                            {faq.question}
                          </span>
                        </div>
                        <div className="flex w-[65px] shrink-0 justify-center max-md:hidden">
                          {isOpen ? (
                            <ChevronDown
                              className="h-[18px] w-[18px] shrink-0 rotate-180 text-[#02633E]"
                              strokeWidth={2}
                              aria-hidden
                            />
                          ) : (
                            <ChevronDown
                              className="h-[18px] w-[18px] shrink-0 text-[#02633E]"
                              strokeWidth={2}
                              aria-hidden
                            />
                          )}
                        </div>
                        {isOpen ? (
                          <ChevronUp
                            className="h-[18px] w-[18px] shrink-0 text-[#02633E] md:hidden"
                            strokeWidth={2}
                            aria-hidden
                          />
                        ) : (
                          <ChevronDown
                            className="h-[18px] w-[18px] shrink-0 text-[#02633E] md:hidden"
                            strokeWidth={2}
                            aria-hidden
                          />
                        )}
                      </button>

                      {isOpen && (
                        <div
                          className={cn(
                            "flex gap-2.5 max-md:gap-2.5",
                            "max-md:rounded-b-[10px] max-md:border-t max-md:border-[#EAE3C9] max-md:bg-white max-md:px-5 max-md:pt-5 max-md:pb-[60px]",
                            "md:gap-5 md:rounded-b-[10px] md:border-t md:border-[#EAE3C9] md:bg-white md:px-[30px] md:pt-[30px] md:pb-[60px] md:pl-[50px]",
                          )}
                        >
                          <img
                            src="/faq/answer_icon.png"
                            alt=""
                            aria-hidden
                            className="mt-0.5 h-[21px] w-[21px] shrink-0 object-contain md:mt-1 md:h-[25px] md:w-[30px]"
                          />
                          <p
                            className={cn(
                              nanum,
                              "min-w-0 flex-1 text-[15px] leading-[22.5px] font-normal text-[#1F2121]",
                              "md:text-xl md:leading-[30px] md:font-normal",
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
              <div className="mt-10 flex items-center justify-center max-md:gap-[30px] max-md:pt-10 md:mt-0 md:gap-[30px] md:py-10">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="이전 페이지"
                  className={cn(
                    "flex shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30",
                    "h-12 w-12",
                  )}
                >
                  <ChevronLeft
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-label={`${p}페이지`}
                      aria-current={p === page ? "page" : undefined}
                      className={cn(
                        nanum,
                        "flex min-h-12 min-w-10 items-center justify-center bg-transparent px-2 text-base leading-[20.8px] font-extrabold text-[#003F2B] transition-colors",
                        "md:min-h-0 md:min-w-0 md:px-0 md:text-lg md:leading-[23.4px]",
                      )}
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="다음 페이지"
                  className={cn(
                    "flex shrink-0 items-center justify-center overflow-hidden rounded-[40px] bg-white text-[#02633E] transition-colors disabled:opacity-30",
                    "h-12 w-12",
                  )}
                >
                  <ChevronRight
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
              </div>
            )}

            {/* CTA — 흰 배경: 본문 컬럼 전폭(FAQ 목록과 동일). 내부 래퍼: max-w 1080 중앙 정렬(시안 HTML). */}
            <div className="mt-10 max-md:mt-0 max-md:px-0 max-md:pt-10 max-md:pb-10 md:mt-0">
              <div className="w-full rounded-[40px] bg-white p-5 md:p-[30px]">
                <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-6 text-center md:flex-row md:items-center md:justify-between md:gap-6 md:text-left">
                  <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-5 md:flex-row md:items-center md:gap-[30px]">
                    <img
                      src="/faq/faq_icon.png"
                      alt=""
                      className="h-[60px] w-[60px] shrink-0 object-contain md:h-[89.25px] md:w-[89.25px]"
                    />
                    <div className="flex w-full flex-col items-center gap-2 md:min-w-0 md:flex-1 md:items-start md:gap-2">
                      <p
                        className={cn(
                          nanum,
                          "text-lg leading-[27px] font-bold text-[#1F2121] md:text-[28px] md:leading-[42px]",
                        )}
                      >
                        원하는 답변을 찾지 못하셨나요?
                      </p>
                      <p
                        className={cn(
                          nanum,
                          "text-center text-sm leading-[21px] font-normal text-[#1F2121] uppercase md:text-left md:text-base md:leading-6 md:text-[#1F2121]",
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
                      "inline-flex w-full shrink-0 items-center justify-center gap-[15px] rounded-[51px] bg-[#003F2B] px-5 py-5 text-lg leading-[23.4px] font-extrabold text-white transition-all hover:brightness-110",
                      "font-[family-name:var(--font-nanum)]",
                      "md:w-auto md:gap-[14.66px] md:rounded-[51.3px] md:px-[29.31px] md:py-[14.66px] md:font-[Pretendard,system-ui,sans-serif] md:text-[21.98px] md:leading-[21.98px] md:font-medium",
                    )}
                  >
                    문의하기
                    <ChevronRight
                      className="h-5 w-5 shrink-0 md:h-[20.73px] md:w-[20.73px]"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContentMax>
    </div>
  );
}
