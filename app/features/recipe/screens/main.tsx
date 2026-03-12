import { useState } from "react";
import type { Route } from "./+types/main";
import { RecipeGrid } from "../components/recipe-grid";
import { getRecipes } from "../lib/queries.server";
import type { Recipe } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveRecipeCategories } from "~/features/recipe-categories/lib/queries.server";
import type { RecipeCategory } from "~/features/recipe-categories/schema";
import { PageBanner } from "~/core/components/page-banner";
import { Search } from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

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
      <PageBanner
        imageUrl="/banner/recipe_banner_temp.png"
        title="레시피"
        subtitle="풍림푸드 제품으로 만드는 다양한 요리를 경험해보세요"
        dbBanner={pageBanner}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "레시피" },
        ]}
      />

      {/* ── 헤딩 + 검색 ── */}
      <div className="px-4 pb-5 pt-12 md:px-8 md:pt-16 lg:px-2.5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <h2
            className="flex items-center gap-2 font-bold text-gray-900"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", letterSpacing: "-0.04em" }}
          >
            <img src="/home/product-star.png" alt="" className="h-6 w-6 object-contain md:h-8 md:w-8" />
            레시피
          </h2>

          {/* PC 검색 */}
          <div className="hidden items-center gap-2 md:flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              placeholder="검색어를 입력해주세요."
              className="w-72 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#02633E]/30"
            />
            <button
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:brightness-110"
              style={{ backgroundColor: "#02633E" }}
            >
              <Search className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 바 ── */}
      <div className="px-4 pb-5 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">

          {/* 모바일 검색 */}
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#02633E]/30"
            />
            <button
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "#02633E" }}
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* 탭 — 레시피는 #F3BC1E 배경 */}
          <div
            className="flex items-center overflow-x-auto rounded-full px-4 py-3 scrollbar-none md:px-5 md:py-4"
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
                      fontSize: "18px",
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

      {/* ── 총 N개 ── */}
      <div className="px-4 pb-4 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">
          <p className="text-sm font-medium text-gray-600">
            총 <span className="font-bold text-[#02633E]">{currentCount}</span>개 레시피
          </p>
        </div>
      </div>

      {/* ── 레시피 그리드 ── */}
      <div className="px-4 pb-16 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">
          <RecipeGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            dbRecipes={dbRecipes}
          />
        </div>
      </div>

    </div>
  );
}
