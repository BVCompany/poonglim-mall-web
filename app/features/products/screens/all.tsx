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

  const totalCount = dbProducts.length || 0;

  // DB에 카테고리가 있으면 DB 기준, 없으면 제품 데이터에서 자동 추출
  const categories = dbCategories.length > 0
    ? [
        { id: "all", name: "전체 제품", count: totalCount },
        ...dbCategories.map((cat) => ({
          id: cat.slug,
          name: cat.name,
          count: dbProducts.filter((p) => p.category === cat.slug).length,
        })),
      ]
    : [
        { id: "all", name: "전체 제품", count: totalCount },
        ...Object.entries(
          dbProducts.reduce<Record<string, number>>((acc, p) => {
            acc[p.category] = (acc[p.category] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([id, count]) => ({ id, name: id, count })),
      ];

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
      <div className="px-4 md:px-8 lg:px-2.5 pt-8 pb-4">
        <div className="mx-auto max-w-[var(--hero-pc-width,1640px)] flex items-center justify-between gap-4">
          {/* 타이틀 */}
          <h2 className="flex items-center gap-2 text-lg md:text-xl font-bold text-gray-900">
            <img src="/home/product-star.png" alt="" className="w-5 h-5 md:w-6 md:h-6 object-contain" />
            제품 카테고리
          </h2>

          {/* 검색창 — PC */}
          <div className="relative hidden md:flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="pl-4 pr-12 py-2.5 text-sm border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30 w-64"
            />
            <button
              onClick={() => {}}
              className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-[#204E3A] rounded-full hover:bg-[#1a3f2e] transition-colors"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 바 (녹색 캡슐) ── */}
      <div className="px-4 md:px-8 lg:px-2.5 pb-6">
        <div className="mx-auto max-w-[var(--hero-pc-width,1640px)]">
          {/* 모바일 검색창 */}
          <div className="relative flex items-center mb-4 md:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-300 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30"
            />
            <button className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-[#204E3A] rounded-full">
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* 탭 바 */}
          <div className="bg-[#204E3A] rounded-full px-2 py-2 flex items-center gap-0 overflow-x-auto scrollbar-none">
            {categories.map((cat, idx) => (
              <div key={cat.id} className="flex items-center flex-shrink-0">
                {/* 첫 번째와 두 번째 항목 사이 구분선 */}
                {idx === 1 && (
                  <span className="h-4 w-px bg-white/30 mx-1 flex-shrink-0" />
                )}
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`
                    flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 whitespace-nowrap
                    ${selectedCategory === cat.id
                      ? "bg-white text-[#204E3A]"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  {cat.name}
                  {cat.count > 0 && (
                    <span className={`ml-1.5 text-xs ${selectedCategory === cat.id ? "text-[#204E3A]/60" : "text-white/50"}`}>
                      ({cat.count})
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 제품 그리드 ── */}
      <div className="px-4 md:px-8 lg:px-2.5 pb-16">
        <div className="mx-auto max-w-[var(--hero-pc-width,1640px)]">
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
