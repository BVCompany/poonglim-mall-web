import { and, eq, ilike, or } from "drizzle-orm";
import { ChevronDown, SearchIcon } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/search";

import { PageContentMax } from "~/core/components/page-content-max";
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
    <div className="mx-auto flex w-full max-w-[750px] items-center justify-between">
      <div className="flex h-16 w-[640px] max-w-[calc(100%-110px)] items-center rounded-full border border-[#E4E4DE] bg-[#F7F7F4] px-6">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder="검색어를 입력해주세요."
          className="h-full flex-1 bg-transparent text-[16px] outline-none placeholder:text-gray-400"
          style={{ letterSpacing: "-0.02em" }}
          autoFocus
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="flex h-8 w-8 items-center justify-center text-gray-400 hover:text-gray-600"
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
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white transition-all hover:brightness-110"
        style={{ backgroundColor: "#02633E" }}
        type="button"
        aria-label="검색"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
    <div className="mb-4 flex items-center gap-1.5">
      <span className="text-[20px] font-semibold leading-none text-[#02633E]">+</span>
      <h2 className="text-[24px] font-bold text-[#1F2121]" style={{ letterSpacing: "-0.04em" }}>
        {title}
      </h2>
      <span className="text-[18px] font-medium text-[#6B6B67]">({count})</span>
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
    <div className="mx-auto flex min-h-[420px] w-full max-w-[760px] flex-col items-center justify-center px-4 text-center">
      <h1
        className="font-extrabold text-[#1F2121]"
        style={{ fontSize: "clamp(36px, 4.2vw, 64px)", letterSpacing: "-0.05em" }}
      >
        검색 결과가 없습니다.
      </h1>

      <div className="mt-8 w-full max-w-[640px]">
        <SearchInputBar value={inputValue} onChange={onChange} onSearch={onSearch} />
      </div>

      {q && (
        <p className="mt-6 text-[14px] text-gray-500" style={{ letterSpacing: "-0.02em" }}>
          <span className="font-semibold text-[#003F2B]">'{q}'</span> 에 대한 검색 결과를 찾을 수 없습니다
        </p>
      )}

      <div className="mt-14 w-full max-w-[420px] text-left">
        <div
          className="mb-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
          style={{ backgroundColor: "#EFE9D4" }}
        >
          <SearchIcon className="h-3 w-3 text-[#232323]" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-[#232323]" style={{ letterSpacing: "-0.02em" }}>
            검색 TIP
          </span>
        </div>
        <ul className="space-y-1.5 text-[13px] text-[#4E4E4E]" style={{ letterSpacing: "-0.02em" }}>
          <li>- 검색어의 철자가 정확한지 확인해주세요.</li>
          <li>- 다른 검색어로 검색해보세요.</li>
          <li>- 더 일반적인 단어로 검색해보세요.</li>
        </ul>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F2EB" }}>
      <PageContentMax className="pb-[120px] pt-[60px]">
        {!hasResults ? (
          <>
            <div className="mb-8 border-b border-[#E8E6DC] pb-3">
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

            <div className="mt-12 border-t border-[#E8E6DC] pt-8 text-center">
              <Link
                to="/products/all"
                className="inline-flex items-center gap-1.5 rounded-lg px-6 py-3 text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: "#2EA43D", letterSpacing: "-0.02em" }}
              >
                전체 제품 보기
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 border-b border-[#E8E6DC] pb-3">
              <div className="flex items-center gap-2 text-[12px] text-[#6D6D66]" style={{ letterSpacing: "-0.02em" }}>
                <Link to="/" className="hover:text-[#003F2B]">Home</Link>
                <span>&gt;</span>
                <span className="text-[#343434]">검색</span>
              </div>
            </div>

            {/* ── 타이틀 + 검색바 ── */}
            <div className="w-full border-b border-[#E8E6DC]">
              <div className="mx-auto flex h-[390px] w-full max-w-[760px] flex-col items-center justify-center text-center">
                <h1
                  className="mb-5 font-extrabold text-[#1F2121]"
                  style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.04em" }}
                >
                  검색 결과
                </h1>
                <div className="mx-auto max-w-[560px]">
                  <SearchInputBar value={inputValue} onChange={setInputValue} onSearch={handleSearch} />
                </div>
                {q && (
                  <p className="mt-3 text-[13px] text-gray-500" style={{ letterSpacing: "-0.02em" }}>
                    <span className="font-semibold text-[#003F2B]">'{q}'</span> 검색결과 총{" "}
                    <span className="font-semibold text-[#003F2B]">{total}개</span>
                  </p>
                )}
              </div>
            </div>

          <div className="mt-[100px] w-full space-y-14">

            {/* ── 제품 ── */}
            {productItems.length > 0 && (
              <section>
                <SectionHeader title="제품 카테고리" count={productItems.length} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {productItems.map((item) => (
                    <Link
                      key={item.product_id}
                      to={`/products/${item.product_id}`}
                      className="group relative block overflow-hidden rounded-2xl bg-[#EDEBE4] shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <div className="relative aspect-square overflow-hidden bg-[#EDEBE4]">
                        {item.badge && (
                          <div className="absolute left-3 top-3 z-10">
                            <span
                              className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                              style={{
                                backgroundColor: item.badge.toUpperCase() === "NEW" ? "#ffd55d" : "#f4f2e5",
                                color: item.badge.toUpperCase() === "NEW" ? "#1a1a1a" : "#204E3A",
                              }}
                            >
                              {item.badge.toUpperCase()}
                            </span>
                          </div>
                        )}
                        {!item.badge && item.is_b2b && (
                          <div className="absolute left-3 top-3 z-10">
                            <span className="rounded-full bg-[#32af32] px-2.5 py-0.5 text-[11px] font-bold text-white">
                              B2B
                            </span>
                          </div>
                        )}
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <div className="px-4 pb-5 pt-4">
                        <p
                          className="mb-1 line-clamp-2 leading-snug text-[#1F2121]"
                          style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.015em" }}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p
                            className="line-clamp-1 text-gray-500"
                            style={{ fontSize: "16px", fontWeight: 400, letterSpacing: "-0.015em" }}
                          >
                            {item.description}
                          </p>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {item.tags.slice(0, 4).map((tag, idx) => (
                              <span
                                key={`${item.product_id}-${idx}`}
                                className="rounded-full bg-[#f4f2e5] px-2 py-0.5 font-medium text-[#555]"
                                style={{ fontSize: "12px", letterSpacing: "-0.02em" }}
                              >
                                {tag.startsWith("#") ? tag : `#${tag}`}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── 레시피 ── */}
            {recipeItems.length > 0 && (
              <section>
                <SectionHeader title="레시피" count={recipeItems.length} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recipeItems.map((item) => (
                    <Link
                      key={item.recipe_id}
                      to={`/recipe/${item.recipe_id}`}
                      className="group relative block aspect-square overflow-hidden rounded-2xl bg-gray-200"
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
                      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-3">
                        <p
                          className="mb-2 inline-block rounded-lg px-2.5 py-1 font-bold leading-snug text-white"
                          style={{
                            fontSize: "clamp(15px, 1.4vw, 19px)",
                            letterSpacing: "-0.02em",
                            backgroundColor: "rgba(0,0,0,0.20)",
                          }}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p
                            className="mb-2.5 line-clamp-1 text-white/75"
                            style={{ fontSize: "clamp(11px, 1vw, 13px)", letterSpacing: "-0.01em" }}
                          >
                            {item.description}
                          </p>
                        )}
                        {item.cooking_time && (
                          <div className="flex items-center gap-0 text-white/65" style={{ fontSize: "clamp(11px, 1vw, 13px)" }}>
                            <span>{item.cooking_time}</span>
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
                <div className="space-y-3">
                  {newsItems.map((item) => (
                    <Link
                      key={item.news_id}
                      to="/media/news"
                      className="group flex w-full cursor-pointer items-center overflow-hidden rounded-2xl bg-white transition-colors duration-300 hover:bg-[#003F2B]"
                      style={{ height: 235 }}
                    >
                      <div
                        className="mx-3 h-[215px] w-[215px] shrink-0 self-center overflow-hidden rounded-xl"
                      >
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#EAE3C9] group-hover:bg-[#1a3d2b]" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center gap-2 px-6 min-w-0">
                        <div className="mb-1.5 flex items-center gap-2">
                          <span
                            className="inline-flex h-[28px] items-center rounded-full bg-[#EAE3C9] px-3 font-bold text-[#003F2B] transition-colors duration-300 group-hover:bg-white/15 group-hover:text-[#EAE3C9]"
                            style={{
                              fontSize: "12px",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {getNewsTypeLabel(item.type)}
                          </span>
                        </div>
                        <p
                          className="mt-[22px] line-clamp-2 font-bold text-[#1F2121] transition-colors duration-300 group-hover:text-[#EAE3C9]"
                          style={{ fontSize: "20px", letterSpacing: "-0.04em" }}
                        >
                          {item.title}
                        </p>
                        {item.summary && (
                          <p
                            className="truncate text-[#1F2121] transition-colors duration-300 group-hover:text-[#EAE3C9]"
                            style={{ fontSize: "14px", letterSpacing: "-0.04em" }}
                          >
                            {item.summary}
                          </p>
                        )}
                        <span className="mt-[20px] text-sm text-gray-400 transition-colors duration-300 group-hover:text-[#EAE3C9]/60">
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
                <div className="space-y-2">
                  {faqItems.map((item) => {
                    const isOpen = openFaqId === item.faq_id;
                    return (
                    <div
                      key={item.faq_id}
                      className="overflow-hidden rounded-xl transition-all duration-200"
                      style={{ backgroundColor: isOpen ? "#fff" : "#EAE3C9" }}
                    >
                      <button
                        onClick={() => setOpenFaqId((prev) => (prev === item.faq_id ? null : item.faq_id))}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors"
                        type="button"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold"
                          style={{ backgroundColor: "#F0EEDD", color: "#02633E" }}
                        >
                          Q
                        </span>
                        <span className="flex-1 text-sm font-semibold text-gray-800">
                          {item.question}
                        </span>
                        <ChevronDown
                          className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200"
                          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      </button>

                      {isOpen && (
                        <>
                          <div style={{ borderTop: "2px solid #F5F2EB" }} />
                          <div className="flex gap-4 px-5 pb-5 pt-4">
                            <img
                              src="/faq/answer_icon.png"
                              alt="A"
                              className="h-7 w-7 shrink-0 object-contain"
                            />
                            <p className="flex-1 text-sm leading-relaxed text-gray-600">
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
