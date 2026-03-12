import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/all";
import { ProductGrid } from "../components/product-grid";
import { getProducts } from "../lib/queries.server";
import type { Product } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { Search, ChevronRight } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  liquid_egg:  "액란가공품",
  pudding:     "푸딩 시리즈",
  convenience: "간편식",
  b2b:         "B2B 전용",
};

export async function loader(_: Route.LoaderArgs) {
  const [dbProducts, pageBanner] = await Promise.all([
    getProducts().catch(() => [] as Product[]),
    getPageBanner("products").catch(() => null),
  ]);
  return { dbProducts, pageBanner };
}

export default function ProductsAllScreen({ loaderData }: Route.ComponentProps) {
  const { dbProducts, pageBanner } = loaderData;
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "전체 제품", count: dbProducts.length || 8 },
    ...Object.entries(
      (dbProducts.length > 0 ? dbProducts : []).reduce<Record<string, number>>((acc, p) => {
        acc[p.category] = (acc[p.category] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([id, count]) => ({ id, name: CATEGORY_LABELS[id] ?? id, count })),
  ];

  const filteredCount = dbProducts.length > 0
    ? dbProducts.filter((p) =>
        selectedCategory === "all" || p.category === selectedCategory
      ).length
    : 8;

  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      {/* ── 페이지 배너 ── */}
      <section
        className="relative w-full h-52 md:h-72 overflow-hidden bg-[#204E3A]"
        style={pageBanner?.image_url ? {
          backgroundImage: `url(${pageBanner.image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {pageBanner?.title ?? "제품 소개"}
          </h1>
          {pageBanner?.subtitle && (
            <p className="text-white/80 text-sm md:text-base max-w-xl">
              {pageBanner.subtitle}
            </p>
          )}
          {pageBanner?.link_url && (
            <Link
              to={pageBanner.link_url}
              className="mt-2 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-5 py-2 rounded-full border border-white/30 transition-colors"
            >
              {pageBanner.link_text ?? "더 알아보기"}
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* ── 카테고리 탭 + 검색 ── */}
      <section className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* 카테고리 탭 */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-[#204E3A] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                  <span className={`ml-1.5 text-xs ${selectedCategory === cat.id ? "text-white/70" : "text-gray-400"}`}>
                    ({cat.count})
                  </span>
                </button>
              ))}
            </div>

            {/* 검색창 */}
            <div className="relative flex-shrink-0 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력해주세요."
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30 w-56"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 제품 그리드 ── */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* 모바일 검색 */}
        <div className="relative mb-5 md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="검색어를 입력해주세요."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#204E3A]/30"
          />
        </div>

        {/* 추천 제품 섹션 */}
        {selectedCategory === "all" && searchQuery === "" && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <span className="text-[#204E3A]">✦</span> 추천 제품
            </h2>
          </div>
        )}

        <ProductGrid
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          dbProducts={dbProducts}
        />
      </section>
    </div>
  );
}
