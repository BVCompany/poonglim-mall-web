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

  // 제품의 category는 text[] — includes로 판별
  const inCategory = (productCategory: string | string[], slug: string) => {
    if (Array.isArray(productCategory)) return productCategory.includes(slug);
    return productCategory === slug;
  };

  // DB에 카테고리가 있으면 DB 기준, 없으면 제품 데이터에서 자동 추출
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

  // 현재 선택된 카테고리 수량 (검색 전 카테고리 기준)
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

      {/* ── 제품 카테고리 헤더 + 검색 ── */}
      <div className="px-4 pt-8 pb-4 md:px-8 lg:px-2.5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          {/* 타이틀 — 36px / letterSpacing -4% */}
          <h2
            className="flex items-center gap-2 font-bold text-gray-900"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", letterSpacing: "-0.04em" }}
          >
            <img src="/home/product-star.png" alt="" className="h-6 w-6 object-contain md:h-7 md:w-7" />
            제품 카테고리
          </h2>

          {/* 검색창 — PC */}
          <div className="relative hidden items-center md:flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="w-64 rounded-full border border-gray-300 bg-white py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30"
            />
            <button
              className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#204E3A] transition-colors hover:bg-[#1a3f2e]"
            >
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 바 + 모바일 검색 ── */}
      <div className="px-4 pb-4 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">
          {/* 모바일 검색창 */}
          <div className="relative mb-3 flex items-center md:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30"
            />
            <button className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#204E3A]">
              <Search className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* 탭 바 — 녹색 캡슐 */}
          <div className="flex items-center overflow-x-auto rounded-full bg-[#204E3A] px-3 py-2 scrollbar-none md:px-4 md:py-2.5">
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === "all";
              // 전체 제품은 항상 수량 표시, 나머지는 활성 상태일 때만 표시
              const showCount = isAll || isActive;

              return (
                <div key={cat.id} className="flex flex-shrink-0 items-center">
                  {/* "전체 제품" 다음에만 구분선 */}
                  {idx === 1 && (
                    <span className="mx-2 h-5 w-px flex-shrink-0 bg-white/30 md:mx-3" />
                  )}
                  <button
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`
                      flex-shrink-0 whitespace-nowrap rounded-full px-5 py-2 text-sm font-medium transition-all duration-150 md:px-6 md:py-2.5
                      ${isActive
                        ? "bg-white text-[#204E3A]"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {cat.name}
                    {showCount && cat.count > 0 && (
                      <span className={`ml-1 text-xs ${isActive ? "text-[#204E3A]/60" : "text-white/50"}`}>
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
            총 <span className="font-bold text-[#204E3A]">{currentCategoryCount}</span>개 제품
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
