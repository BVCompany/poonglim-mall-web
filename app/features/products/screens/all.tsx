import { useState } from "react";
import type { Route } from "./+types/all";
import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";
import { ProductFilters } from "../components/product-filters";
import { ProductSearch } from "../components/product-search";
import { getProducts } from "../lib/queries.server";
import type { Product } from "../lib/queries.server";

const CATEGORY_LABEL: Record<string, string> = {
  liquid_egg: "액란",
  pudding: "푸딩",
  convenience: "간편식",
  b2b: "B2B",
};

export async function loader(_: Route.LoaderArgs) {
  const dbProducts = await getProducts().catch(() => [] as Product[]);
  return { dbProducts };
}

export default function ProductsAllScreen({ loaderData }: Route.ComponentProps) {
  const { dbProducts } = loaderData;
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // DB 데이터 기반으로 카테고리 카운트 동적 생성
  const categories = dbProducts.length > 0
    ? [
        { id: "all", name: "전체 제품", count: dbProducts.length },
        ...Object.entries(
          dbProducts.reduce<Record<string, number>>((acc, p) => {
            acc[p.category] = (acc[p.category] ?? 0) + 1;
            return acc;
          }, {}),
        ).map(([id, count]) => ({
          id,
          name: CATEGORY_LABEL[id] ?? id,
          count,
        })),
      ]
    : [
        { id: "all", name: "전체 제품", count: 21 },
        { id: "liquid_egg", name: "액란", count: 9 },
        { id: "pudding", name: "푸딩", count: 6 },
        { id: "convenience", name: "간편식", count: 6 },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            {t("products.allProducts", "제품 소개")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            {t(
              "products.allProductsSubtitle",
              "풍림푸드의 프리미엄 제품 라인업을 만나보세요",
            )}
          </p>
        </div>
      </section>

      {/* Products Section with Filters */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filters Sidebar */}
            <div className="flex-shrink-0 lg:w-64">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-8">
                <ProductSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              </div>

              <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} dbProducts={dbProducts} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
