import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";
import { ProductFilters } from "../components/product-filters";
import { ProductSearch } from "../components/product-search";

const categories = [
  { id: "all", name: "전체 제품", count: 21 },
  { id: "liquid-eggs", name: "액란", count: 9 },
  { id: "puddings", name: "푸딩", count: 6 },
  { id: "convenience", name: "간편식", count: 6 },
];

export default function ProductsAllScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

              <ProductGrid selectedCategory={selectedCategory} searchQuery={searchQuery} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
