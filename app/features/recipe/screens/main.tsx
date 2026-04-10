import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Route } from "./+types/main";
import { RecipeGrid } from "../components/recipe-grid";
import { getRecipes } from "../lib/queries.server";
import type { Recipe } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveRecipeCategories } from "~/features/recipe-categories/lib/queries.server";
import type { RecipeCategory } from "~/features/recipe-categories/schema";
import { PageBanner } from "~/core/components/page-banner";
import { SectionTitleStar } from "~/core/components/section-title-star";
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
    <div className="min-h-screen bg-[#F5F2EB]">

      {/* ── 페이지 배너 ── */}
      {showBanner && (
        <PageBanner
          imageUrl="/banner/recipe_banner_temp.png"
          title="레시피"
          subtitle="풍림푸드 제품으로 만드는 다양한 요리를 경험해보세요"
          mobileHeightClassName="h-[375px] md:h-[clamp(200px,28vw,380px)]"
          hideOnMobile={false}
          hideBreadcrumbOnMobile
          frostedLinkOnMobile
          dbBanner={pageBanner}
          breadcrumb={[
            { label: "Home", href: "/" },
            { label: "레시피" },
          ]}
        />
      )}

      {/* ── 헤딩 + 검색 ── */}
      <div className="px-4 pb-5 pt-5 md:px-8 md:pt-16 lg:px-2.5">
        <div className="mx-auto flex max-w-[var(--content-max-width)] items-center justify-between gap-4">
          <h2
            className="flex items-center gap-2 font-bold text-gray-900"
            style={{ fontSize: pc1920(20, 36), letterSpacing: "-0.04em" }}
          >
            <SectionTitleStar
              variant="product"
              className="h-[21px] w-[21px] flex-shrink-0 md:h-8 md:w-8"
            />
            <span style={{ fontFamily: "NanumSquareRound", fontWeight: 800 }} className="md:font-bold md:[font-family:inherit]">레시피</span>
          </h2>

          {/* 검색 */}
          <div className="hidden md:block">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={() => setSearchQuery(searchInput)}
            />
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 바 ── */}
      <div className="px-4 pb-5 md:px-8 lg:px-2.5">
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

          {/* 데스크탑 탭 */}
          <div
            className="hidden items-center overflow-x-auto rounded-full px-4 py-3 scrollbar-none md:flex md:px-5 md:py-4"
            style={{ backgroundColor: "#F3BC1E" }}
          >
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === "all";
              const showCount = isAll || isActive;

              return (
                <div key={cat.id} className="flex flex-shrink-0 items-center">
                  {idx === 1 && (
                    <span className="mx-3 h-5 w-px flex-shrink-0 bg-black/20 md:mx-4" />
                  )}
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      fontSize: pc1920(15, 18),
                      letterSpacing: "-0.04em",
                      color: isActive ? "#7A5C00" : undefined,
                    }}
                    className={`
                      flex-shrink-0 whitespace-nowrap rounded-full px-6 py-2.5 font-bold transition-all duration-150 md:px-7 md:py-3
                      ${isActive ? "bg-white" : "text-black/70 hover:bg-black/10 hover:text-black"}
                    `}
                  >
                    {cat.name}
                    {showCount && cat.count > 0 && (
                      <span className="ml-0.5" style={{ opacity: 0.6 }}>
                        ({cat.count})
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 총 N개 / 모바일 정렬행 ── */}
      <div className="px-4 pb-4 md:px-8 lg:px-2.5">
        <div className="mx-auto flex max-w-[var(--content-max-width)] items-center justify-between">
          <p className="text-sm font-medium text-gray-600 md:text-sm">
            <span className="text-xs font-bold text-[#02633E] md:hidden" style={{ fontFamily: "NanumSquareRound" }}>총 </span>
            <span className="text-xs font-bold text-[#32AF32] md:hidden" style={{ fontFamily: "NanumSquareRound" }}>{currentCount}</span>
            <span className="text-xs font-bold text-[#02633E] md:hidden" style={{ fontFamily: "NanumSquareRound" }}>개 레시피</span>
            <span className="hidden md:inline">총 <span className="font-bold text-[#02633E]">{currentCount}</span>개 레시피</span>
          </p>
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-[#F5F2EB] px-3 py-1 text-xs font-medium text-black"
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
              className="h-7 w-7 rounded-md border border-[#DCD8C8] bg-[#F5F2EB] object-contain p-1.5"
            />
          </div>
        </div>
      </div>

      {/* ── 레시피 그리드 ── */}
      <div className="px-4 pb-16 md:px-8 lg:px-2.5">
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
