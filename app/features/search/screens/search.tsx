import { and, eq, ilike, or } from "drizzle-orm";
import { ArrowUpRight, ChevronDown, Lightbulb, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/search";

import { PageContentMax } from "~/core/components/page-content-max";
import { SectionTitleStar } from "~/core/components/section-title-star";
import db from "~/core/db/drizzle-client.server";
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
  return [
    { title: q ? `"${q}" 검색 결과 | 풍림푸드` : "검색 | 풍림푸드" },
  ];
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
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[750px] items-center gap-1.5 lg:justify-between lg:gap-0">
      <div className="flex h-[42px] min-h-0 w-full min-w-0 flex-1 items-center rounded-full border border-[#02633E] bg-white px-5 py-2.5 lg:h-16 lg:w-[640px] lg:max-w-[calc(100%-110px)] lg:flex-none lg:border-[#E4E4DE] lg:bg-[#F7F7F4] lg:px-6 lg:py-0">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="검색어를 입력해주세요."
          className="h-full min-w-0 flex-1 bg-transparent font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] outline-none placeholder:font-bold placeholder:text-[#A3A3A3] lg:text-[16px] lg:font-normal lg:placeholder:font-normal lg:placeholder:text-gray-400"
          style={{ letterSpacing: "-0.02em" }}
          autoFocus
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="hidden h-8 w-8 shrink-0 items-center justify-center text-gray-400 hover:text-gray-600 lg:flex"
            type="button"
            aria-label="지우기"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      <button
        onClick={onSearch}
        className="flex size-[42px] shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-110 lg:h-16 lg:w-16"
        style={{ backgroundColor: "#02633E" }}
        type="button"
        aria-label="검색"
      >
        <SearchIcon className="size-5 lg:hidden" strokeWidth={1.8} />
        <svg className="hidden lg:block" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.75" stroke="white" strokeWidth="1.8" />
          <path d="M13.5 13.5L17 17" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Section Header ─────────────────────────── */
function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-0 flex items-center gap-[11px] py-5 lg:mb-4 lg:gap-1.5 lg:py-0">
      <SectionTitleStar variant="product" className="size-[21px] lg:hidden" />
      <span className="hidden text-[20px] font-semibold leading-none text-[#02633E] lg:inline">+</span>
      <h2
        className="font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121] lg:text-[24px] lg:font-bold lg:leading-none"
        style={{ letterSpacing: "-0.04em" }}
      >
        {title}
      </h2>
      <span className="font-[family-name:var(--font-nanum)] text-[18px] font-extrabold leading-[30px] text-[#1F2121] lg:font-medium lg:text-[#6B6B67]">
        ({count})
      </span>
    </div>
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
    <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center lg:min-h-[420px] lg:justify-center">
      <div className="flex w-full flex-col items-center gap-5 py-8 lg:gap-0 lg:py-0">
        <h1
          className="font-[family-name:var(--font-nanum)] text-[20px] font-extrabold leading-[30px] text-[#1F2121] lg:text-[clamp(36px,4.2vw,64px)] lg:leading-none"
          style={{ letterSpacing: "-0.05em" }}
        >
          검색 결과가 없습니다.
        </h1>

        <div className="w-full max-w-[640px] lg:mt-8">
          <SearchInputBar value={inputValue} onChange={onChange} onSearch={onSearch} />
        </div>

        {q && (
          <p
            className="w-full max-w-[311px] font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] text-[#1F2121] opacity-60 lg:mt-6 lg:max-w-none lg:opacity-100 lg:text-gray-500"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="lg:font-semibold lg:text-[#003F2B] lg:opacity-100">'{q}'</span>
            <span className="lg:font-normal lg:text-gray-500"> 에 대한 검색 결과를 찾을 수 없습니다</span>
          </p>
        )}
      </div>

      {/* 검색 TIP — 모바일: 시안(space-between·30px·pill 30px·12px/700 목록), PC: 기존 세로 스택 */}
      <div className="mt-0 w-full border-t border-[#EAE3C9] py-[30px] lg:mt-14 lg:border-0 lg:py-0">
        <div className="flex w-full items-start justify-between gap-4 lg:flex-col lg:justify-start lg:gap-4">
          <div className="inline-flex shrink-0 flex-col rounded-[30px] bg-[#EAE3C9] px-[10px] py-1.5 lg:w-fit lg:bg-[#EFE9D4]">
            <div className="inline-flex items-center gap-1">
              <Lightbulb className="size-5 shrink-0 text-[#2A343D] lg:hidden" strokeWidth={1.75} />
              <SearchIcon className="hidden h-3 w-3 shrink-0 text-[#232323] lg:block" strokeWidth={2} />
              <span className="font-[family-name:var(--font-nanum)] text-[13px] font-extrabold leading-[19.5px] text-[#1F2121] lg:text-[11px] lg:font-semibold">
                검색 TIP
              </span>
            </div>
          </div>
          <div
            className="min-w-0 shrink text-left font-[family-name:var(--font-nanum)] text-xs font-bold leading-[18px] text-[#1F2121] lg:max-w-[420px] lg:font-normal lg:text-[13px] lg:leading-normal lg:text-[#4E4E4E]"
            style={{ letterSpacing: "-0.02em" }}
          >
            <p className="lg:hidden">
              - 검색어의 철자가 정확한지 확인해주세요.
              <br />
              - 다른 검색어로 검색해보세요.
              <br />- 더 일반적인 단어로 검색해보세요.
            </p>
            <ul className="hidden space-y-1.5 lg:block">
              <li>- 검색어의 철자가 정확한지 확인해주세요.</li>
              <li>- 다른 검색어로 검색해보세요.</li>
              <li>- 더 일반적인 단어로 검색해보세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────── */
export default function SearchScreen({ loaderData }: Route.ComponentProps) {
  const { q, products: productItems, recipes: recipeItems, news: newsItems, faqs: faqItems } =
    loaderData as LoaderData;

  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(q);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const handleSearch = () => {
    const term = inputValue.trim();
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const total =
    productItems.length + recipeItems.length + newsItems.length + faqItems.length;
  const hasResults = total > 0;

  useEffect(() => {
    if (faqItems.length > 0) setOpenFaqId(faqItems[0].faq_id);
    else setOpenFaqId(null);
    // faqItems는 검색어 q 변경 시 로더에서 함께 갱신됨
    // eslint-disable-next-line react-hooks/exhaustive-deps -- q 변경 시에만 첫 FAQ를 펼침
  }, [q]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F4F2E5" }}>
      <PageContentMax className="pb-16 pt-6 lg:pb-[120px] lg:pt-[60px]">
        {!hasResults ? (
          <>
            <div className="mb-6 hidden border-b border-[#E8E6DC] pb-3 lg:mb-8 lg:block">
              <div className="flex items-center gap-2 text-[12px] text-[#6D6D66]" style={{ letterSpacing: "-0.02em" }}>
                <Link to="/" className="hover:text-[#003F2B]">Home</Link>
                <span>&gt;</span>
                <span className="text-[#343434]">검색</span>
              </div>
            </div>

            <NoResults
              q={q}
              inputValue={inputValue}
              onChange={setInputValue}
              onSearch={handleSearch}
            />

            <div className="mt-6 text-center lg:mt-12 lg:border-t lg:border-[#E8E6DC] lg:pt-8">
              <Link
                to="/products/all"
                className="inline-flex h-11 w-full max-w-full items-center justify-center gap-2 rounded-[10px] px-5 font-[family-name:var(--font-nanum)] text-base font-bold uppercase text-white transition-all hover:brightness-110 active:scale-[0.98] lg:h-auto lg:w-auto lg:rounded-lg lg:px-6 lg:py-3 lg:text-sm lg:font-semibold lg:normal-case"
                style={{ backgroundColor: "#32AF32", letterSpacing: "-0.02em" }}
              >
                전체 제품 보기
                <ArrowUpRight className="size-3 text-[#FDFDF5] lg:hidden" strokeWidth={2} />
                <svg className="hidden lg:block" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 hidden border-b border-[#E8E6DC] pb-3 lg:mb-8 lg:block">
              <div className="flex items-center gap-2 text-[12px] text-[#6D6D66]" style={{ letterSpacing: "-0.02em" }}>
                <Link to="/" className="hover:text-[#003F2B]">Home</Link>
                <span>&gt;</span>
                <span className="text-[#343434]">검색</span>
              </div>
            </div>

            {/* ── 타이틀 + 검색바 ── */}
            <div className="w-full lg:border-b lg:border-[#E8E6DC]">
              <div className="mx-auto flex w-full max-w-[760px] flex-col items-center py-8 text-center lg:h-[390px] lg:justify-center lg:py-0">
                <h1
                  className="mb-5 font-[family-name:var(--font-nanum)] text-[20px] font-extrabold leading-[30px] text-[#1F2121] lg:text-[clamp(28px,4vw,48px)] lg:leading-none"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  <span className="lg:hidden">검색 결과가 없습니다.</span>
                  <span className="hidden lg:inline">검색 결과</span>
                </h1>
                <div className="mx-auto w-full max-w-[560px]">
                  <SearchInputBar value={inputValue} onChange={setInputValue} onSearch={handleSearch} />
                </div>
                {q && (
                  <>
                    <p
                      className="mt-2.5 font-[family-name:var(--font-nanum)] text-sm font-bold leading-[21px] lg:hidden"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      <span className="text-[#1F2121]">'{q}'</span>
                      <span className="text-[#1F2121]"> 검색 결과</span>
                      <span className="font-extrabold text-[#02633E]"> {total}건</span>
                    </p>
                    <p
                      className="mt-3 hidden text-[13px] text-gray-500 lg:block"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      <span className="font-semibold text-[#003F2B]">'{q}'</span> 검색결과 총{" "}
                      <span className="font-semibold text-[#003F2B]">{total}개</span>
                    </p>
                  </>
                )}
              </div>
            </div>

          <div className="mt-6 w-full space-y-10 border-t border-[#EAE3C9] pt-8 lg:mt-[100px] lg:space-y-14 lg:border-0 lg:pt-0">

            {/* ── 제품 ── */}
            {productItems.length > 0 && (
              <section>
                <SectionHeader title="제품 카테고리" count={productItems.length} />
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                  {productItems.map((item) => {
                    const badgeRaw = item.badge ? String(item.badge).toLowerCase() : "";
                    const isB2bProduct = item.is_b2b || badgeRaw === "b2b";
                    const showMallPill = !isB2bProduct;
                    const showBadge =
                      item.badge && badgeRaw !== "b2b";
                    return (
                    <Link
                      key={item.product_id}
                      to={`/products/${item.product_id}`}
                      className="group relative block overflow-hidden rounded-[10px] bg-[#EAE3C9] shadow-sm transition-all duration-200 hover:shadow-md lg:rounded-2xl lg:bg-[#EDEBE4]"
                    >
                      <div className="relative h-[166px] overflow-hidden bg-[#EAE3C9] lg:aspect-square lg:h-auto lg:bg-[#EDEBE4]">
                        <div className="absolute left-3.5 right-3.5 top-3.5 z-10 flex items-end justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {showBadge && (
                              <span
                                className="rounded-full px-1.5 py-1 font-[family-name:var(--font-nanum)] text-xs font-bold leading-3 text-[#1F2121]"
                                style={{
                                  backgroundColor:
                                    badgeRaw === "new" ? "#FFD55D" : "#f4f2e5",
                                }}
                              >
                                {String(item.badge).toUpperCase()}
                              </span>
                            )}
                            {isB2bProduct && (
                              <span className="rounded-full bg-[#32AF32] px-1.5 py-1 font-[family-name:var(--font-nanum)] text-xs font-bold uppercase leading-3 text-white">
                                B2B
                              </span>
                            )}
                          </div>
                          {showMallPill && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#32AF32] px-1.5 py-1 font-[family-name:var(--font-nanum)] text-xs font-bold uppercase leading-3 text-white">
                              풍림몰
                              <ArrowUpRight className="size-1.5 text-[#FDFDF5]" strokeWidth={2.5} />
                            </span>
                          )}
                        </div>
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105 lg:object-cover"
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <div className="px-2.5 pb-2.5 pt-0 lg:px-4 lg:pb-5 lg:pt-4">
                        <p className="mb-2 line-clamp-2 font-[family-name:var(--font-nanum)] text-[15px] font-extrabold leading-[22.5px] text-[#1F2121] lg:mb-1 lg:text-[20px] lg:leading-snug">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-[13px] font-normal uppercase leading-[19.5px] text-[#1F2121] lg:line-clamp-1 lg:text-[16px] lg:normal-case lg:text-gray-500">
                            {item.description}
                          </p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1 lg:mt-2.5">
                            {item.tags.slice(0, 4).map((tag, idx) => (
                              <span
                                key={`${item.product_id}-${idx}`}
                                className="rounded-full bg-[#F4F2E5] px-1.5 py-1 text-xs font-medium leading-3 text-[#1F2121] [font-family:Pretendard,system-ui,sans-serif] lg:bg-[#f4f2e5] lg:px-2 lg:py-0.5 lg:text-[#555]"
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
                <SectionHeader title="레시피" count={recipeItems.length} />
                <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-4">
                  {recipeItems.map((item) => (
                    <Link
                      key={item.recipe_id}
                      to={`/recipe/${item.recipe_id}`}
                      className="group relative aspect-square overflow-hidden rounded-[13px] bg-[#EAE3C9] lg:rounded-2xl"
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
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/50 to-transparent lg:top-auto lg:h-[55%] lg:from-black/80 lg:via-black/40" />
                      <div className="absolute inset-x-0 bottom-0 p-2.5 pb-2.5 pt-6 lg:px-5 lg:pb-5 lg:pt-3">
                        <p className="mb-1 inline-block rounded-[13px] bg-black/20 px-3 py-1.5 font-[family-name:var(--font-nanum)] text-[15px] font-extrabold leading-[15px] text-white lg:mb-2 lg:rounded-lg lg:px-2.5 lg:py-1 lg:text-[clamp(15px,1.4vw,19px)] lg:leading-snug">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-[13px] font-bold uppercase leading-[19.5px] text-white lg:mb-2.5 lg:line-clamp-1 lg:text-white/75 lg:normal-case lg:[font-size:clamp(11px,1vw,13px)]">
                            {item.description}
                          </p>
                        )}
                        {(item.cooking_time || item.servings) && (
                          <div className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-nanum)] text-[10px] font-normal uppercase leading-[14px] text-white lg:mt-0 lg:gap-0 lg:text-white/65 lg:[font-size:clamp(11px,1vw,13px)] lg:normal-case">
                            {item.cooking_time && <span>{item.cooking_time}</span>}
                            {item.cooking_time && item.servings && <span className="opacity-90">|</span>}
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
                      to="/media/news"
                      className="group flex w-full cursor-pointer items-stretch overflow-hidden rounded-[20px] bg-[#EAE3C9] transition-colors duration-300 lg:h-[235px] lg:items-center lg:rounded-2xl lg:bg-white lg:hover:bg-[#003F2B]"
                    >
                      <div className="flex shrink-0 flex-col justify-center py-5 pl-5 lg:mx-3 lg:self-center lg:py-0 lg:pl-0">
                        <div className="size-20 overflow-hidden rounded-[15px] lg:h-[215px] lg:w-[215px] lg:rounded-xl">
                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#EAE3C9] lg:group-hover:bg-[#1a3d2b]" />
                          )}
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5 py-5 pr-5 pl-3 lg:gap-2 lg:px-6 lg:py-0 lg:pl-0">
                        <span className="inline-flex w-fit items-center rounded-full bg-[#003F2B] px-3 py-1.5 text-xs font-medium leading-3 text-white [font-family:Pretendard,system-ui,sans-serif] lg:h-7 lg:bg-[#EAE3C9] lg:font-bold lg:text-[#003F2B] lg:transition-colors lg:duration-300 lg:group-hover:bg-white/15 lg:group-hover:text-[#EAE3C9]">
                          {getNewsTypeLabel(item.type)}
                        </span>
                        <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-base font-bold leading-6 text-[#1F2121] transition-colors duration-300 lg:mt-[22px] lg:text-[20px] lg:group-hover:text-[#EAE3C9]">
                          {item.title}
                        </p>
                        {item.summary && (
                          <p className="line-clamp-2 font-[family-name:var(--font-nanum)] text-xs font-normal uppercase leading-[18px] text-[#1F2121] transition-colors duration-300 lg:truncate lg:text-[14px] lg:normal-case lg:group-hover:text-[#EAE3C9]">
                            {item.summary}
                          </p>
                        )}
                        <span className="font-[family-name:var(--font-nanum)] text-[10px] font-normal uppercase leading-[14px] text-[#1F2121] transition-colors duration-300 lg:mt-[20px] lg:text-sm lg:text-gray-400 lg:normal-case lg:group-hover:text-[#EAE3C9]/60">
                          {formatDate(item.published_at ?? item.created_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── FAQ ── */}
            {faqItems.length > 0 && (
              <section>
                <SectionHeader title="자주 묻는 질문" count={faqItems.length} />
                <div className="space-y-2.5 lg:space-y-2">
                  {faqItems.map((item) => {
                    const isOpen = openFaqId === item.faq_id;
                    return (
                    <div
                      key={item.faq_id}
                      className="overflow-hidden rounded-[10px] transition-all duration-200 lg:rounded-xl"
                      style={{ backgroundColor: isOpen ? "#fff" : "#EAE3C9" }}
                    >
                      <button
                        onClick={() => setOpenFaqId((prev) => (prev === item.faq_id ? null : item.faq_id))}
                        className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors lg:py-4"
                        type="button"
                      >
                        <span
                          className="flex size-[21px] shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-nanum)] text-sm font-extrabold leading-[21px] text-[#02633E] lg:h-7 lg:w-7 lg:text-xs"
                          style={{ backgroundColor: "#F0EEDD" }}
                        >
                          Q
                        </span>
                        <span
                          className={`flex-1 font-[family-name:var(--font-nanum)] text-sm leading-[21px] text-[#1F2121] lg:font-semibold lg:text-gray-800 ${
                            isOpen ? "font-bold" : "font-normal"
                          }`}
                        >
                          {item.question}
                        </span>
                        <ChevronDown
                          className="h-[18px] w-[18px] shrink-0 text-[#02633E] transition-transform duration-200 lg:h-5 lg:w-5 lg:text-gray-400"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      {isOpen && (
                        <>
                          <div className="border-t border-[#EAE3C9] lg:border-t-2 lg:border-[#F5F2EB]" />
                          <div className="flex gap-5 px-5 pb-5 pt-5 lg:gap-4 lg:pt-4">
                            <img
                              src="/faq/answer_icon.png"
                              alt="A"
                              className="hidden h-7 w-7 shrink-0 object-contain lg:block"
                            />
                            <p className="flex-1 font-[family-name:var(--font-nanum)] text-base font-normal leading-6 text-[#1F2121] lg:text-sm lg:leading-relaxed lg:text-gray-600">
                              {item.answer}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )})}
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
