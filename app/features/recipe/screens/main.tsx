import { Fragment, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Route } from "./+types/main";
import { RecipeGrid } from "../components/recipe-grid";
import { getRecipes } from "../lib/queries.server";
import type { Recipe } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveRecipeCategories } from "~/features/recipe-categories/lib/queries.server";
import type { RecipeCategory } from "~/features/recipe-categories/schema";
import { PageBanner } from "~/core/components/page-banner";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { SearchBar } from "~/core/components/search-bar";
import { pc1920 } from "~/core/lib/pc-fluid";

export const meta: Route.MetaFunction = () => [
  { title: "레시피 | 풍림푸드" },
  { name: "description", content: "풍림푸드 제품을 활용한 다양한 레시피를 소개합니다." },
];

export async function loader(_: Route.LoaderArgs) {
  const [dbRecipes, pageBanner, dbCategories] = await Promise.all([
    getRecipes().catch(() => [] as Recipe[]),
    getPageBanner("recipe").catch(() => null),
    getActiveRecipeCategories().catch(() => [] as RecipeCategory[]),
  ]);
  return { dbRecipes, pageBanner, dbCategories };
}

export default function RecipeMainScreen({ loaderData }: Route.ComponentProps) {
  const { dbRecipes, pageBanner, dbCategories } = loaderData;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const SORT_OPTIONS = [
    { id: "recommended", label: "추천순" },
    { id: "latest", label: "최신순" },
    { id: "name", label: "가나다순" },
  ] as const;
  const [sortOption, setSortOption] = useState<(typeof SORT_OPTIONS)[number]["id"]>("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const showBanner = true;

  const totalCount = dbRecipes.length;

  const categories = [
    { id: "all", name: "전체 레시피", count: totalCount },
    ...(dbCategories.length > 0
      ? dbCategories.map((cat) => ({
          id: cat.slug,
          name: cat.name,
          count: dbRecipes.filter((r) => r.category === cat.slug).length,
        }))
      : Object.entries(
          dbRecipes.reduce<Record<string, number>>((acc, r) => {
            if (r.category) acc[r.category] = (acc[r.category] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([id, count]) => ({ id, name: id, count }))
    ),
  ];

  const currentCount = categories.find((c) => c.id === selectedCategory)?.count ?? totalCount;

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">

      {/* ── 페이지 배너 ── */}
      {showBanner && (
        <PageBanner
          imageUrl="/banner/recipe_banner_temp.png"
          title="레시피"
          subtitle="풍림푸드 제품으로 만드는 다양한 요리를 만나보세요"
          dbBanner={pageBanner}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "제품소개", href: "/products/all" },
            { label: "레시피" },
          ]}
        />
      )}

      {/* ── 헤딩 + 검색 (PC 시안: 60px 상단, 1600 정렬) ── */}
      <div className="px-4 pb-5 pt-5 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))] md:pb-10 md:pt-[60px]">
        <div className="mx-auto flex max-w-[var(--content-max-width)] items-center justify-between gap-4 md:gap-5">
          <SectionPageTitle
            as="h2"
            preset="none"
            starVariant="product"
            className="flex items-center gap-[11px] font-bold md:gap-5"
            rootStyle={{
              fontSize: pc1920(20, 36),
              letterSpacing: "-0.04em",
              color: "#003F2B",
              fontFamily: "NanumSquareRound, sans-serif",
              fontWeight: 800,
              lineHeight: pc1920(30, 54),
            }}
            markClassName="h-[21px] w-[21px] flex-shrink-0 md:h-[21px] md:w-[21px]"
            wrapTitle={false}
          >
            레시피
          </SectionPageTitle>

          <div className="hidden md:block">
            <SearchBar
              className="md:gap-[min(30px,calc(30*100vw/1920))]"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={() => setSearchQuery(searchInput)}
              inputClassName="min-h-0 border border-[#02633E] py-5 font-bold placeholder:font-bold placeholder:text-[#02633E] md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(360px,calc(360*100vw/1920))] md:px-10"
              buttonClassName="md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(64px,calc(64*100vw/1920))] md:p-5"
            />
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 바 — PC: #F3BC1E, radius 40px, 활성 흰 배경·#1F2121 800 ── */}
      <div className="px-4 pb-5 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto max-w-[var(--content-max-width)]">

          {/* 모바일 탭 */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:hidden">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const showCount = cat.id === "all" || isActive;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? "bg-[#F3BC1E] text-white" : "bg-white text-[#1F2121]"
                  }`}
                  style={{ letterSpacing: "-0.03em", fontFamily: "NanumSquareRound", fontWeight: isActive ? 700 : 800 }}
                >
                  {cat.name}
                  {showCount && cat.count > 0 && <span className="ml-0.5 opacity-70">({cat.count})</span>}
                </button>
              );
            })}
          </div>

          <div
            className="scrollbar-hide hidden items-center overflow-x-auto rounded-[40px] px-4 py-3 md:flex md:gap-[min(60px,calc(60*100vw/1920))] md:px-[min(60px,calc(60*100vw/1920))] md:py-5"
            style={{ backgroundColor: "#F3BC1E" }}
          >
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === "all";
              const showCount = isAll || isActive;

              return (
                <Fragment key={cat.id}>
                  {idx === 1 && (
                    <span
                      aria-hidden
                      className="h-[22px] w-px shrink-0 self-center bg-white/90"
                    />
                  )}
                  <div className="flex flex-shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        fontSize: pc1920(15, 18),
                        letterSpacing: "-0.04em",
                        color: isActive ? "#1F2121" : undefined,
                        fontFamily: "NanumSquareRound, sans-serif",
                        fontWeight: isActive ? 800 : 700,
                      }}
                      className={`
                        flex-shrink-0 whitespace-nowrap rounded-[40px] border-0 px-5 py-2.5 shadow-none outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#003F2B]/30 md:px-5 md:py-2.5
                        ${isActive ? "bg-white" : "text-white hover:bg-white/15"}
                      `}
                    >
                      {cat.name}
                      {showCount && cat.count > 0 && (
                        <span className="ml-0.5">({cat.count})</span>
                      )}
                    </button>
                  </div>
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto flex max-w-[var(--content-max-width)] items-center justify-between">
          <p className="text-sm font-medium text-gray-600 md:text-sm">
            <span className="text-xs font-bold text-[#02633E] md:hidden" style={{ fontFamily: "NanumSquareRound" }}>총 </span>
            <span className="text-xs font-bold text-[#32AF32] md:hidden" style={{ fontFamily: "NanumSquareRound" }}>{currentCount}</span>
            <span className="text-xs font-bold text-[#02633E] md:hidden" style={{ fontFamily: "NanumSquareRound" }}>개 레시피</span>
            <span
              className="hidden md:inline"
              style={{
                fontFamily: "NanumSquareRound, sans-serif",
                fontSize: pc1920(14, 18),
                lineHeight: 1.5,
                color: "#003F2B",
                fontWeight: 700,
              }}
            >
              총{" "}
              <span style={{ fontWeight: 800 }}>{currentCount}개의 레시피</span>
            </span>
          </p>
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-[#EAE3C9] px-3 py-1 text-xs font-medium text-black"
                onClick={() => setIsSortOpen((prev) => !prev)}
              >
                {SORT_OPTIONS.find((opt) => opt.id === sortOption)?.label ?? "추천순"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSortOpen ? "rotate-180" : ""}`} />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 top-9 z-20 w-24 overflow-hidden rounded-lg border border-[#E1D9BF] bg-white shadow-md">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSortOption(opt.id);
                        setIsSortOpen(false);
                      }}
                      className={`block w-full px-3 py-2 text-left text-xs ${
                        sortOption === opt.id ? "bg-[#F4F0E1] font-semibold text-[#003F2B]" : "text-[#4B4B4B]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <img
              src="/product/sort_icon.png"
              alt="정렬 아이콘"
              className="h-7 w-7 rounded-md border border-[#DCD8C8] bg-[#EAE3C9] object-contain p-1.5"
            />
          </div>
        </div>
      </div>

      <div className="px-4 pb-16 md:mt-[30px] md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto max-w-[var(--content-max-width)]">
          <RecipeGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            sortOption={sortOption}
            dbRecipes={dbRecipes}
          />
        </div>
      </div>

    </div>
  );
}
