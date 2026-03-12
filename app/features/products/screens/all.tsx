import { useState } from "react";
import type { Route } from "./+types/all";
import { ProductGrid } from "../components/product-grid";
import { getProducts } from "../lib/queries.server";
import type { Product } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveCategories } from "~/features/product-categories/lib/queries.server";
import type { ProductCategory } from "~/features/product-categories/schema";
import { PageBanner } from "~/core/components/page-banner";
import { Search } from "lucide-react";

export const meta: Route.MetaFunction = () => [
  { title: "제품 소개 | 풍림푸드" },
  { name: "description", content: "풍림푸드의 다양한 제품을 소개합니다." },
];

export async function loader(_: Route.LoaderArgs) {
  const [dbProducts, pageBanner, dbCategories] = await Promise.all([
    getProducts().catch(() => [] as Product[]),
    getPageBanner("products").catch(() => null),
    getActiveCategories().catch(() => [] as ProductCategory[]),
  ]);
  return { dbProducts, pageBanner, dbCategories };
}

export default function ProductsAllScreen({ loaderData }: Route.ComponentProps) {
  const { dbProducts, pageBanner, dbCategories } = loaderData;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalCount = dbProducts.length;

  const inCategory = (productCategory: string | string[], slug: string) => {
    if (Array.isArray(productCategory)) return productCategory.includes(slug);
    return productCategory === slug;
  };

  const categories = dbCategories.length > 0
    ? [
        { id: "all", name: "전체 제품", count: totalCount },
        ...dbCategories.map((cat) => ({
          id: cat.slug,
          name: cat.name,
          count: dbProducts.filter((p) => inCategory(p.category, cat.slug)).length,
        })),
      ]
    : [
        { id: "all", name: "전체 제품", count: totalCount },
        ...Object.entries(
          dbProducts.reduce<Record<string, number>>((acc, p) => {
            const cats = Array.isArray(p.category) ? p.category : [p.category];
            cats.forEach((c) => { if (c) acc[c] = (acc[c] ?? 0) + 1; });
            return acc;
          }, {}),
        ).map(([id, count]) => ({ id, name: id, count })),
      ];

  const currentCategoryCount = categories.find((c) => c.id === selectedCategory)?.count ?? totalCount;

  return (
    <div className="min-h-screen bg-[#F5F2EB]">

      {/* ── 페이지 배너 ── */}
      <PageBanner
        imageUrl="/banner/product_banner_temp.png"
        title="계란이야기"
        subtitle="대한민국 대표 계란 풍림푸드 계란 이야기를 들어볼래요?"
        linkUrl="/brand/intro"
        linkText="자세히 보기"
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "제품소개" },
        ]}
        dbBanner={pageBanner}
      />

      {/* ── 배너 아래 여백 확보 + 제품 카테고리 헤더 + 검색 ── */}
      <div className="px-4 pt-12 pb-5 md:px-8 md:pt-16 lg:px-2.5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">

          {/* 타이틀 — 36px / letterSpacing -4% */}
          <h2
            className="flex items-center gap-2 font-bold text-gray-900"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", letterSpacing: "-0.04em" }}
          >
            <img src="/home/product-star.png" alt="" className="h-6 w-6 object-contain md:h-8 md:w-8" />
            제품 카테고리
          </h2>

          {/* 검색창 — PC: 인풋 + 버튼이 나란히 분리된 형태 */}
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

          {/* 모바일 검색창: 인풋 + 버튼 나란히 분리 */}
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

          {/* 탭 바 — #02633E, 18px bold, letterSpacing -4% */}
          <div
            className="flex items-center overflow-x-auto rounded-full px-4 py-3 scrollbar-none md:px-5 md:py-4"
            style={{ backgroundColor: "#02633E" }}
          >
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === "all";
              const showCount = isAll || isActive;

              return (
                <div key={cat.id} className="flex flex-shrink-0 items-center">
                  {/* "전체 제품" 다음 구분선 */}
                  {idx === 1 && (
                    <span className="mx-3 h-5 w-px flex-shrink-0 bg-white/40 md:mx-4" />
                  )}
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      fontSize: "18px",
                      letterSpacing: "-0.04em",
                      color: isActive ? "#02633E" : undefined,
                    }}
                    className={`
                      flex-shrink-0 whitespace-nowrap rounded-full px-6 py-2.5 font-bold transition-all duration-150 md:px-7 md:py-3
                      ${isActive
                        ? "bg-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
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

      {/* ── 총 N개 제품 ── */}
      <div className="px-4 pb-4 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">
          <p className="text-sm font-medium text-gray-600">
            총 <span className="font-bold text-[#02633E]">{currentCategoryCount}</span>개 제품
          </p>
        </div>
      </div>

      {/* ── 제품 그리드 ── */}
      <div className="px-4 pb-16 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">
          <ProductGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            dbProducts={dbProducts}
          />
        </div>
      </div>

    </div>
  );
}
