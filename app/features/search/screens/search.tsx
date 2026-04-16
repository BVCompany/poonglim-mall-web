import type { Route } from "./+types/search";

import { and, eq, ilike, or } from "drizzle-orm";
import { ArrowUpRight, ChevronDown, Lightbulb, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

import { PageContentMax } from "~/core/components/page-content-max";
import { SectionPageTitle } from "~/core/components/section-title-star";
import db from "~/core/db/drizzle-client.server";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { news } from "~/features/media/schema";
import { products } from "~/features/products/schema";
import { recipes } from "~/features/recipe/schema";
import { faqs } from "~/features/support/schema";

/* ─── Loader ─────────────────────────────────── */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return { q: "", products: [], recipes: [], news: [], faqs: [] };
  }

  const term = `%${q}%`;

  const [productItems, recipeItems, newsItems, faqItems] = await Promise.all([
    db
      .select({
        product_id: products.product_id,
        name: products.name,
        image_url: products.image_url,
        category: products.category,
        badge: products.badge,
        is_b2b: products.is_b2b,
        tags: products.tags,
        description: products.description,
      })
      .from(products)
      .where(
        and(
          eq(products.is_active, true),
          or(ilike(products.name, term), ilike(products.description, term)),
        ),
      )
      .limit(8)
      .catch(() => []),

    db
      .select({
        recipe_id: recipes.recipe_id,
        title: recipes.title,
        thumbnail_url: recipes.thumbnail_url,
        category: recipes.category,
        description: recipes.description,
        cooking_time: recipes.cooking_time,
        servings: recipes.servings,
      })
      .from(recipes)
      .where(
        and(
          eq(recipes.is_active, true),
          or(ilike(recipes.title, term), ilike(recipes.description, term)),
        ),
      )
      .limit(6)
      .catch(() => []),

    db
      .select({
        news_id: news.news_id,
        type: news.type,
        title: news.title,
        summary: news.summary,
        thumbnail_url: news.thumbnail_url,
        published_at: news.published_at,
        created_at: news.created_at,
      })
      .from(news)
      .where(
        and(
          eq(news.is_active, true),
          or(ilike(news.title, term), ilike(news.summary, term)),
        ),
      )
      .limit(4)
      .catch(() => []),

    db
      .select({
        faq_id: faqs.faq_id,
        category: faqs.category,
        question: faqs.question,
        answer: faqs.answer,
      })
      .from(faqs)
      .where(
        and(
          eq(faqs.is_active, true),
          or(ilike(faqs.question, term), ilike(faqs.answer, term)),
        ),
      )
      .limit(5)
      .catch(() => []),
  ]);

  return {
    q,
    products: productItems,
    recipes: recipeItems,
    news: newsItems,
    faqs: faqItems,
  };
}

export function meta({ data }: Route.MetaArgs) {
  const q = (data as any)?.q ?? "";
  return [{ title: q ? `"${q}" 검색 결과 | 풍림푸드` : "검색 | 풍림푸드" }];
}

/* ─── Types ──────────────────────────────────── */
type LoaderData = Awaited<ReturnType<typeof loader>>;

/* ─── Helpers ────────────────────────────────── */
const NEWS_TYPE_LABEL: Record<string, string> = {
  press: "보도자료",
  news: "뉴스",
  announcement: "공지",
};

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getNewsTypeLabel(type: string) {
  return NEWS_TYPE_LABEL[type] ?? type;
}

/* ─── Search Input Bar ───────────────────────── */
function SearchInputBar({
  value,
  onChange,
  onSearch,
  /** PC 검색 결과 없음 시안: 흰 pill만 (그린 보더 없음) */
  pcPlainPill = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  pcPlainPill?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[750px] items-center gap-1.5">
      <div className="flex h-[42px] min-h-0 w-full min-w-0 flex-1 items-center rounded-full border border-[#02633E] bg-white px-5 py-2.5 lg:hidden">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="검색어를 입력해주세요."
          className="h-full min-w-0 flex-1 bg-transparent font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] outline-none placeholder:font-bold placeholder:text-[#A3A3A3]"
          style={{ letterSpacing: "-0.02em" }}
          autoFocus
        />
      </div>
      <button
        onClick={onSearch}
        className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-110 lg:hidden"
        style={{ backgroundColor: "#02633E" }}
        type="button"
        aria-label="검색"
      >
        <SearchIcon className="size-5" strokeWidth={1.8} />
      </button>

      {/* PC 시안: pill + 2px 그린 보더 · px-10 py-5 · 분리 검색 버튼 p-5 */}
      <div className="hidden w-full min-w-0 items-center gap-1.5 lg:flex">
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 items-center gap-[30px] rounded-[60px] bg-white py-5 pr-4 pl-10",
            !pcPlainPill && "border-2 border-[#02633E]",
          )}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="검색어를 입력해주세요."
            className="min-h-0 min-w-0 flex-1 bg-transparent font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121] outline-none placeholder:font-bold placeholder:text-[#666666]"
          />
          {value ? (
            <button
              onClick={() => onChange("")}
              className="flex size-6 shrink-0 items-center justify-center text-[#1F2121] hover:opacity-70"
              type="button"
              aria-label="지우기"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden
              >
                <rect
                  x="2"
                  y="2"
                  width="16"
                  height="16"
                  rx="2"
                  fill="#E6E6E6"
                />
                <path
                  d="M7 7l6 6M13 7l-6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
        <button
          onClick={onSearch}
          className="flex shrink-0 items-center justify-center rounded-[60px] bg-[#02633E] p-5 text-white transition-all hover:brightness-110 active:scale-[0.99]"
          type="button"
          aria-label="검색"
        >
          <SearchIcon className="size-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ─── Section Header ─────────────────────────── */
function SectionHeader({
  title,
  count,
  variant = "default",
}: {
  title: string;
  count: number;
  variant?: "default" | "recipe";
}) {
  return (
    <SectionPageTitle
      as="h2"
      preset="responsiveLg"
      starVariant="product"
      className="mb-0 py-5 lg:mb-10 lg:py-0"
      wrapTitle={false}
    >
      <span
        className={cn(
          "font-[family-name:var(--font-nanum)] text-[18px] leading-[30px] font-extrabold text-[#1F2121] tracking-[-0.04em] lg:text-[36px] lg:leading-[54px]",
          variant === "recipe" ? "lg:text-[#003F2B]" : "lg:text-[#1F2121]",
        )}
      >
        <span className="lg:hidden">
          {title} <span className="font-extrabold">({count})</span>
        </span>
        <span className="hidden lg:inline">
          {title} ({count})
        </span>
      </span>
    </SectionPageTitle>
  );
}

/* ─── No Results ─────────────────────────────── */
function NoResults({
  q,
  inputValue,
  onChange,
  onSearch,
}: {
  q: string;
  inputValue: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center lg:max-w-[750px] lg:gap-10">
      <div className="flex w-full flex-col items-center gap-5 py-8 lg:gap-5 lg:py-0">
        <h1
          className="font-[family-name:var(--font-nanum)] text-[20px] leading-[30px] font-extrabold text-[#1F2121] lg:text-[28px] lg:leading-[42px] lg:font-extrabold"
          style={{ letterSpacing: "-0.04em" }}
        >
          검색 결과가 없습니다.
        </h1>

        <div className="w-full max-w-[640px] lg:max-w-none">
          <SearchInputBar
            value={inputValue}
            onChange={onChange}
            onSearch={onSearch}
            pcPlainPill
          />
        </div>

        {q ? (
          <div className="w-full pb-0 lg:pb-10">
            <p
              className="mx-auto w-full max-w-[311px] font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold text-[#1F2121] opacity-60 lg:max-w-none lg:text-base lg:leading-6 lg:font-bold"
              style={{ letterSpacing: "-0.02em" }}
            >
              <span className="lg:hidden">
                <span className="text-[#1F2121]">'{q}'</span>
                <span className="text-[#1F2121]">
                  {" "}
                  에 대한 검색 결과를 찾을 수 없습니다
                </span>
              </span>
              <span className="hidden lg:inline">
                &apos;{q}&apos;에 대한 검색 결과를 찾을 수 없습니다
              </span>
            </p>
          </div>
        ) : null}
      </div>

      {/* 검색 TIP — 모바일: 좌우 배치 / PC 시안: 세로·rounded 40 컨테이너·gap 12·pill #EAE3C9 r30 */}
      <div className="mt-0 w-full border-t border-[#EAE3C9] py-[30px] lg:mt-0 lg:w-full lg:rounded-[40px] lg:border-0 lg:py-0">
        <div className="flex w-full items-start justify-between gap-4 lg:flex-col lg:items-start lg:gap-3">
          <div className="inline-flex shrink-0 flex-col rounded-[30px] bg-[#EAE3C9] px-[10px] py-1.5 lg:py-1.5">
            <div className="inline-flex items-center gap-1 lg:gap-1">
              <Lightbulb
                className="size-5 shrink-0 text-[#2A343D]"
                strokeWidth={1.75}
              />
              <span className="font-[family-name:var(--font-nanum)] text-[13px] leading-[19.5px] font-extrabold text-[#1F2121] lg:text-sm lg:leading-[21px] lg:font-extrabold">
                검색 TIP
              </span>
            </div>
          </div>
          <p
            className="min-w-0 shrink text-left font-[family-name:var(--font-nanum)] text-xs leading-[18px] font-bold text-[#1F2121] lg:text-sm lg:leading-[21px] lg:font-bold"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="lg:hidden">
              - 검색어의 철자가 정확한지 확인해주세요.
              <br />
              - 다른 검색어로 검색해보세요.
              <br />- 더 일반적인 단어로 검색해보세요.
            </span>
            <span className="hidden lg:inline">
              - 검색어의 철자가 정확한지 확인해주세요.
              <br />
              - 다른 검색어로 검색해보세요.
              <br />- 더 일반적인 단어로 검색해보세요.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────── */
export default function SearchScreen({ loaderData }: Route.ComponentProps) {
  const {
    q,
    products: productItems,
    recipes: recipeItems,
    news: newsItems,
    faqs: faqItems,
  } = loaderData as LoaderData;

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(q);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const handleSearch = () => {
    const term = inputValue.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const total =
    productItems.length +
    recipeItems.length +
    newsItems.length +
    faqItems.length;
  const hasResults = total > 0;

  useEffect(() => {
    if (faqItems.length > 0) setOpenFaqId(faqItems[0].faq_id);
    else setOpenFaqId(null);
    // faqItems는 검색어 q 변경 시 로더에서 함께 갱신됨
    // eslint-disable-next-line react-hooks/exhaustive-deps -- q 변경 시에만 첫 FAQ를 펼침
  }, [q]);

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <PageContentMax className="pb-16 lg:pb-[120px]">
        {!hasResults ? (
          <>
            <div className="mb-6 hidden border-b border-[#EAE3C9] py-2.5 lg:mb-8 lg:block">
              <div className="flex items-center gap-2.5 font-[family-name:var(--font-nanum)] text-sm leading-[21px] text-[#1F2121]">
                <Link to="/" className="font-normal hover:text-[#003F2B]">
                  Home
                </Link>
                <span className="text-[#1F2121] opacity-50" aria-hidden>
                  ›
                </span>
                <span className="font-bold">검색</span>
              </div>
            </div>

            <div className="w-full lg:border-b lg:border-[#EAE3C9] lg:pt-[100px] lg:pb-10">
              <NoResults
                q={q}
                inputValue={inputValue}
                onChange={setInputValue}
                onSearch={handleSearch}
              />
            </div>

            {/* PC 시안: pt-40 pb-[100px] · 750×(px 70 py 20) r10 · text-center으로 PC에서 버튼 가로 중앙 */}
            <div className="mt-6 flex w-full flex-col items-center lg:mt-0 lg:pt-10 lg:pb-[100px]">
              <div className="w-full max-w-full text-center lg:mx-auto lg:w-[750px] lg:max-w-[750px] lg:rounded-[10px] lg:px-[70px] lg:py-5">
                <Link
                  to="/products/all"
                  className="inline-flex h-[44px] w-full max-w-full items-center justify-center gap-[10px] rounded-[10px] bg-[#32AF32] px-5 py-1.5 font-[family-name:var(--font-nanum)] text-base font-bold text-white uppercase transition-all hover:brightness-110 active:scale-[0.98] lg:w-auto lg:max-w-none"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  전체 제품 보기
                  <ArrowUpRight
                    className="size-3 h-6 w-6 shrink-0 text-[#FDFDF5]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 hidden border-b border-[#EAE3C9] py-2.5 lg:mb-0 lg:block">
              <div className="flex items-center gap-2.5 font-[family-name:var(--font-nanum)] text-sm leading-[21px] text-[#1F2121]">
                <Link to="/" className="font-normal hover:text-[#003F2B]">
                  Home
                </Link>
                <span className="text-[#1F2121] opacity-50" aria-hidden>
                  ›
                </span>
                <span className="font-bold">검색</span>
              </div>
            </div>

            {/* ── 타이틀 + 검색바 (PC 시안: max 750px, 하단 Ivory 보더) ── */}
            <div className="w-full lg:border-b lg:border-[#EAE3C9]">
              <div className="mx-auto flex w-full max-w-[760px] flex-col items-center gap-5 py-8 text-center lg:max-w-[750px] lg:gap-10 lg:pt-[100px] lg:pb-10">
                <h1
                  className="font-[family-name:var(--font-nanum)] text-[20px] leading-[30px] font-extrabold text-[#1F2121] lg:text-[28px] lg:leading-[42px]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  검색 결과
                </h1>
                <div className="mx-auto w-full max-w-[560px] lg:max-w-none">
                  <SearchInputBar
                    value={inputValue}
                    onChange={setInputValue}
                    onSearch={handleSearch}
                  />
                </div>
                {q ? (
                  <>
                    <p
                      className="mt-0 font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-bold lg:hidden"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      <span className="text-[#1F2121]">'{q}'</span>
                      <span className="text-[#1F2121]"> 검색 결과</span>
                      <span className="font-extrabold text-[#02633E]">
                        {" "}
                        {total}건
                      </span>
                    </p>
                    <p className="hidden w-full text-center font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121] opacity-60 lg:block">
                      <span>'{q}' 검색 결과</span>
                      <span className="font-extrabold text-[#02633E]">
                        {" "}
                        {total}건
                      </span>
                    </p>
                  </>
                ) : null}
              </div>
            </div>

            <div className="mt-6 w-full space-y-10 border-t border-[#EAE3C9] pt-8 lg:mt-0 lg:space-y-[100px] lg:border-0 lg:pt-10">
              {/* ── 제품 ── */}
              {productItems.length > 0 && (
                <section>
                  <SectionHeader
                    title="제품 카테고리"
                    count={productItems.length}
                  />
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:gap-[10px]">
                    {productItems.map((item) => {
                      const badgeRaw = item.badge
                        ? String(item.badge).toLowerCase()
                        : "";
                      const isB2bProduct = item.is_b2b || badgeRaw === "b2b";
                      const showMallPill = !isB2bProduct;
                      const showBadge = item.badge && badgeRaw !== "b2b";
                      return (
                        <Link
                          key={item.product_id}
                          to={`/products/${item.product_id}`}
                          className="group flex w-full flex-col items-stretch overflow-hidden rounded-[10px] bg-[#EAE3C9] shadow-sm transition-all duration-200 hover:shadow-md lg:inline-flex lg:w-[392px] lg:flex-none lg:rounded-[40px] lg:shadow-none"
                        >
                          {/* PC 시안: 392×360 이미지 영역 · 썸네일은 중앙 배치(약 227×202) · 배지 좌상 ~20px */}
                          <div className="relative h-[166px] shrink-0 overflow-hidden bg-[#EAE3C9] lg:flex lg:h-[360px] lg:w-full lg:items-center lg:justify-center">
                            <div className="absolute top-3.5 right-3.5 left-3.5 z-10 flex items-start justify-between gap-2 lg:top-5 lg:right-auto lg:left-5">
                              <div className="flex flex-wrap items-center gap-1.5 lg:gap-1.5">
                                {showBadge && (
                                  <span
                                    className="rounded-full px-3 py-2 font-[family-name:var(--font-nanum)] text-xs leading-3 font-bold text-[#1F2121] lg:px-3 lg:py-2 lg:[font-family:Pretendard,system-ui,sans-serif] lg:text-xs lg:leading-3 lg:font-medium"
                                    style={{
                                      backgroundColor:
                                        badgeRaw === "new"
                                          ? "#FFD55D"
                                          : "#f4f2e5",
                                    }}
                                  >
                                    {String(item.badge).toUpperCase()}
                                  </span>
                                )}
                                {isB2bProduct && (
                                  <span className="rounded-full bg-[#32AF32] px-3 py-2 [font-family:Pretendard,system-ui,sans-serif] text-xs leading-3 font-medium text-white uppercase lg:px-3 lg:py-2 lg:leading-3">
                                    B2B
                                  </span>
                                )}
                              </div>
                              {showMallPill && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#32AF32] px-1.5 py-1 font-[family-name:var(--font-nanum)] text-xs leading-3 font-bold text-white uppercase lg:hidden">
                                  풍림몰
                                  <ArrowUpRight
                                    className="size-1.5 text-[#FDFDF5]"
                                    strokeWidth={2.5}
                                  />
                                </span>
                              )}
                            </div>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105 lg:h-auto lg:max-h-[202px] lg:w-auto lg:max-w-[227px] lg:flex-none"
                              />
                            ) : (
                              <div className="h-full w-full lg:max-h-[202px] lg:max-w-[227px]" />
                            )}
                          </div>
                          {/* 시안: 하단 px-40 pb-40 · 타이틀/설명/태그 gap ~9px */}
                          <div className="flex min-w-0 flex-1 flex-col gap-2 px-2.5 pt-0 pb-2.5 text-left lg:gap-[9px] lg:px-10 lg:pt-0 lg:pb-10">
                            <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-[15px] leading-[22.5px] font-extrabold text-[#1F2121] lg:text-[20px] lg:leading-[26px] lg:font-extrabold">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-[13px] leading-[19.5px] font-normal text-[#1F2121] uppercase lg:line-clamp-2 lg:text-[16px] lg:leading-[22.4px] lg:uppercase">
                                {item.description}
                              </p>
                            )}
                            {item.tags && item.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1 lg:mt-0 lg:gap-1.5">
                                {item.tags.slice(0, 4).map((tag, idx) => (
                                  <span
                                    key={`${item.product_id}-${idx}`}
                                    className="rounded-full bg-[#EAE3C9] px-1.5 py-1 [font-family:Pretendard,system-ui,sans-serif] text-xs leading-3 font-medium text-[#1F2121] lg:px-[12.58px] lg:py-[7.19px] lg:text-xs lg:leading-3"
                                  >
                                    {tag.startsWith("#") ? tag : `#${tag}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ── 레시피 ── */}
              {recipeItems.length > 0 && (
                <section>
                  <SectionHeader
                    title="레시피"
                    count={recipeItems.length}
                    variant="recipe"
                  />
                  <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
                    {recipeItems.map((item) => (
                      <Link
                        key={item.recipe_id}
                        to={`/recipe/${item.recipe_id}`}
                        className="group relative aspect-square overflow-hidden rounded-[13px] bg-[#EAE3C9] lg:rounded-[30px]"
                      >
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#EAE3C9]" />
                        )}
                        {/* PC 캡처: 하단으로 갈수록 어두워져 흰 글자 대비 — HTML의 이미지 영역 그라데이션에 가깝게 */}
                        <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent lg:inset-x-0 lg:top-auto lg:bottom-0 lg:h-[70%] lg:bg-gradient-to-b lg:from-transparent lg:via-black/30 lg:to-black/75" />
                        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-2.5 pt-6 pb-2.5 lg:gap-6 lg:p-10 lg:pt-0 lg:pb-10">
                          {/* HTML 타이포: 제목·설명 gap 12px, 설명 블록과 메타 gap 24px — 전부 이미지 위 오버레이(캡처 기준) */}
                          <div className="flex flex-col gap-3">
                            <p className="inline-block w-fit rounded-[13px] bg-black/20 px-3 py-1.5 font-[family-name:var(--font-nanum)] text-[15px] leading-[15px] font-extrabold text-white lg:rounded-[40px] lg:px-5 lg:py-2.5 lg:text-2xl lg:leading-9 lg:font-extrabold">
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-[13px] leading-[19.5px] font-bold text-white uppercase lg:line-clamp-2 lg:px-5 lg:text-sm lg:leading-[21px] lg:font-bold lg:uppercase">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {(item.cooking_time || item.servings) && (
                            <div className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-nanum)] text-[10px] leading-[14px] font-normal text-white uppercase lg:mt-0 lg:gap-2.5 lg:px-5 lg:text-sm lg:leading-[19.6px] lg:font-normal lg:uppercase">
                              {item.cooking_time && (
                                <span>{item.cooking_time}</span>
                              )}
                              {item.cooking_time && item.servings && (
                                <span className="opacity-90 lg:text-[10px] lg:leading-[14px] lg:opacity-100">
                                  |
                                </span>
                              )}
                              {item.servings && <span>{item.servings}</span>}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ── 보도자료 ── */}
              {newsItems.length > 0 && (
                <section>
                  <SectionHeader title="보도자료" count={newsItems.length} />
                  <div className="flex flex-col gap-2.5 lg:space-y-3">
                    {newsItems.map((item) => (
                      <Link
                        key={item.news_id}
                        to={`/media/news/${item.news_id}`}
                        className="group flex w-full cursor-pointer items-stretch overflow-hidden rounded-[20px] bg-[#EAE3C9] transition-colors duration-300 hover:brightness-[0.99] lg:items-start lg:rounded-[40px] lg:hover:bg-[#003F2B] lg:hover:brightness-100"
                      >
                        {/* PC 시안: 235×235 래퍼 · p-[8.58px] · 썸네일 217.85² · r-[25.73px] */}
                        <div className="flex shrink-0 flex-col justify-center p-5 lg:size-[235px] lg:shrink-0 lg:justify-start lg:p-[8.58px]">
                          <div className="size-20 overflow-hidden rounded-[15px] lg:size-[217.85px] lg:rounded-[25.73px]">
                            {item.thumbnail_url ? (
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                              />
                            ) : (
                              <div className="h-full w-full bg-[#EAE3C9] group-hover:bg-[#1a3d2b] lg:group-hover:bg-[#2a4d3c]" />
                            )}
                          </div>
                        </div>
                        {/* PC: p-30 · 태그↔본문 gap-40 · (제목·요약)↔날짜 gap-24 · 제목↔요약 gap-12 */}
                        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 py-5 pr-5 pl-3 text-left lg:justify-start lg:gap-10 lg:px-[30px] lg:py-[30px]">
                          <span className="inline-flex w-fit items-center rounded-full bg-[#003F2B] px-3 py-2 [font-family:Pretendard,system-ui,sans-serif] text-xs leading-3 font-medium text-white transition-colors duration-300 lg:group-hover:bg-white/15 lg:group-hover:text-[#EAE3C9]">
                            {getNewsTypeLabel(item.type)}
                          </span>
                          <div className="flex min-w-0 flex-col gap-3 lg:gap-6">
                            <div className="flex min-w-0 flex-col gap-2.5 lg:gap-3">
                              <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-base leading-6 font-bold text-[#1F2121] transition-colors duration-300 lg:text-[20px] lg:leading-[30px] lg:font-bold lg:group-hover:text-[#EAE3C9]">
                                {item.title}
                              </p>
                              {item.summary && (
                                <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-xs leading-[18px] font-normal text-[#1F2121] uppercase transition-colors duration-300 lg:line-clamp-3 lg:text-sm lg:leading-[21px] lg:font-normal lg:uppercase lg:group-hover:text-[#EAE3C9]">
                                  {item.summary}
                                </p>
                              )}
                            </div>
                            <span className="font-[family-name:var(--font-nanum)] text-[10px] leading-[14px] font-normal text-[#1F2121] uppercase transition-colors duration-300 lg:text-sm lg:leading-[19.6px] lg:group-hover:text-[#EAE3C9]/80">
                              {formatDate(item.published_at ?? item.created_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ── FAQ ── */}
              {faqItems.length > 0 && (
                <section>
                  <SectionHeader
                    title="자주 묻는 질문"
                    count={faqItems.length}
                  />
                  <div className="space-y-2.5 lg:space-y-2">
                    {faqItems.map((item) => {
                      const isOpen = openFaqId === item.faq_id;
                      return (
                        <div
                          key={item.faq_id}
                          className="overflow-hidden rounded-[10px] transition-all duration-200"
                          style={{
                            backgroundColor: isOpen ? "#fff" : "#EAE3C9",
                          }}
                        >
                          <button
                            onClick={() =>
                              setOpenFaqId((prev) =>
                                prev === item.faq_id ? null : item.faq_id,
                              )
                            }
                            className="flex w-full items-center gap-5 px-5 py-5 text-left transition-colors lg:gap-5 lg:py-[30px] lg:pr-[30px] lg:pl-[50px]"
                            type="button"
                          >
                            <span
                              className="flex size-[21px] shrink-0 items-center justify-center rounded-full px-2 font-[family-name:var(--font-nanum)] text-sm leading-[21px] font-extrabold text-[#02633E] lg:size-10 lg:text-xl lg:leading-[30px] lg:font-extrabold"
                              style={{ backgroundColor: "#F0EEDD" }}
                            >
                              Q
                            </span>
                            <span
                              className={cn(
                                "min-w-0 flex-1 font-[family-name:var(--font-nanum)] text-sm leading-[21px] text-[#1F2121]",
                                "lg:text-xl lg:leading-[30px]",
                                isOpen
                                  ? "font-bold lg:font-bold"
                                  : "font-normal lg:font-normal",
                              )}
                            >
                              {item.question}
                            </span>
                            <span className="flex w-16 shrink-0 justify-center lg:w-[65px]">
                              <ChevronDown
                                className="h-[18px] w-[18px] shrink-0 text-[#02633E] transition-transform duration-200"
                                style={{
                                  transform: isOpen
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                }}
                              />
                            </span>
                          </button>

                          {isOpen && (
                            <>
                              <div className="border-t border-[#EAE3C9]" />
                              <div className="flex gap-5 px-5 pt-5 pb-5 lg:gap-5 lg:pt-[30px] lg:pr-[30px] lg:pb-[60px] lg:pl-[50px]">
                                <img
                                  src="/faq/answer_icon.png"
                                  alt="A"
                                  className="hidden h-10 w-10 shrink-0 object-contain lg:block"
                                />
                                <p className="flex-1 font-[family-name:var(--font-nanum)] text-base leading-6 font-normal text-[#1F2121] lg:text-xl lg:leading-[30px] lg:font-normal">
                                  {item.answer}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </PageContentMax>
    </div>
  );
}
