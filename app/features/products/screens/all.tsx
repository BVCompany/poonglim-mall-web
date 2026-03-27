import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Route } from "./+types/all";
import { ProductGrid } from "../components/product-grid";
import { getProducts } from "../lib/queries.server";
import type { Product } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveCategories } from "~/features/product-categories/lib/queries.server";
import type { ProductCategory } from "~/features/product-categories/schema";
import { PageBanner } from "~/core/components/page-banner";
import { SearchBar } from "~/core/components/search-bar";

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
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const SORT_OPTIONS = [
    { id: "recommended", label: "추천순" },
    { id: "latest", label: "최신순" },
    { id: "name", label: "가나다순" },
  ] as const;
  const [sortOption, setSortOption] = useState<(typeof SORT_OPTIONS)[number]["id"]>("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);

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
        mobileSubtitle={"대한민국 대표 계란\n풍림푸드 계란 이야기를 들어볼래요?"}
        linkUrl="/brand/intro"
        linkText="자세히 보기"
        mobileHeightClassName="h-[375px] md:h-[clamp(200px,28vw,380px)]"
        hideBreadcrumbOnMobile
        frostedLinkOnMobile
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "제품소개" },
        ]}
        dbBanner={pageBanner}
      />

      {/* ── 배너 아래 여백 확보 + 제품 카테고리 헤더 + 검색 ── */}
      <div className="px-4 pb-5 pt-10 md:px-8 md:pt-16 lg:px-2.5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">

          {/* 타이틀 — 36px / letterSpacing -4% */}
          <h2
            className="flex items-center gap-2 font-bold text-gray-900"
            style={{ fontSize: "clamp(22px, 3vw, 36px)", letterSpacing: "-0.04em" }}
          >
            <img src="/home/product-star.png" alt="" className="h-6 w-6 object-contain md:h-8 md:w-8" />
            제품 카테고리
          </h2>

          {/* 검색창 */}
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
        <div className="mx-auto max-w-[1600px]">
          {/* 모바일 탭 — 개별 알약 버튼 */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:hidden">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const showCount = cat.id === "all" || isActive;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive ? "bg-[#02633E] text-white" : "bg-[#EAE3C9] text-[#003F2B]"
                  }`}
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {cat.name}
                  {showCount && cat.count > 0 && <span className="ml-0.5 opacity-70">({cat.count})</span>}
                </button>
              );
            })}
          </div>

          {/* 데스크탑 탭 바 — #02633E */}
          <div
            className="hidden items-center overflow-x-auto rounded-full px-4 py-3 scrollbar-none md:flex md:px-5 md:py-4"
            style={{ backgroundColor: "#02633E" }}
          >
            {categories.map((cat, idx) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === "all";
              const showCount = isAll || isActive;

              return (
                <div key={cat.id} className="flex flex-shrink-0 items-center">
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

      {/* ── 총 N개 제품 / 모바일 정렬행 ── */}
      <div className="px-4 pb-4 md:px-8 lg:px-2.5">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          <p className="text-sm font-medium text-gray-600">
            총 <span className="font-bold text-[#02633E]">{currentCategoryCount}</span>개 제품
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

      {/* ── 제품 그리드 ── */}
      <div className="px-4 pb-16 md:px-8 lg:px-2.5">
        <div className="mx-auto max-w-[1600px]">
          <ProductGrid
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            sortOption={sortOption}
            dbProducts={dbProducts}
          />
        </div>
      </div>

    </div>
  );
}
