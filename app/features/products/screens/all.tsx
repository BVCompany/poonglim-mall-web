import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/all";
import { ProductGrid } from "../components/product-grid";
import { getProducts } from "../lib/queries.server";
import type { Product } from "../lib/queries.server";
import { getPageBanner } from "~/features/page-banners/lib/queries.server";
import { getActiveCategories } from "~/features/product-categories/lib/queries.server";
import type { ProductCategory } from "~/features/product-categories/schema";
import { PageBanner } from "~/core/components/page-banner";
import { SectionPageTitle } from "~/core/components/section-title-star";
import { SearchBar } from "~/core/components/search-bar";
import { normalizeContentLocale } from "~/core/db/content-locale.server";
import i18next from "~/core/lib/i18next.server";
import { pc1920 } from "~/core/lib/pc-fluid";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.metaTitle ?? "" },
  { name: "description", content: data?.metaDescription ?? "" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const contentLocale = normalizeContentLocale(await i18next.getLocale(request));
  const [dbProducts, pageBanner, dbCategories] = await Promise.all([
    getProducts(contentLocale).catch(() => [] as Product[]),
    getPageBanner("products").catch(() => null),
    getActiveCategories().catch(() => [] as ProductCategory[]),
  ]);
  return {
    dbProducts,
    pageBanner,
    dbCategories,
    metaTitle: t("pages.products.all.metaTitle"),
    metaDescription: t("pages.products.all.metaDescription"),
  };
}

export default function ProductsAllScreen({ loaderData }: Route.ComponentProps) {
  const { dbProducts, pageBanner, dbCategories } = loaderData;
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const SORT_OPTIONS = useMemo(
    () =>
      [
        { id: "recommended" as const, label: t("pages.products.all.sortRecommended") },
        { id: "latest" as const, label: t("pages.products.all.sortLatest") },
        { id: "name" as const, label: t("pages.products.all.sortName") },
      ] as const,
    [t],
  );
  const [sortOption, setSortOption] = useState<(typeof SORT_OPTIONS)[number]["id"]>("recommended");
  const [isSortOpen, setIsSortOpen] = useState(false);

  const totalCount = dbProducts.length;

  const inCategory = (productCategory: string | string[], slug: string) => {
    if (Array.isArray(productCategory)) return productCategory.includes(slug);
    return productCategory === slug;
  };

  const categories = dbCategories.length > 0
    ? [
        { id: "all", name: t("pages.products.all.categoryAll"), count: totalCount },
        ...dbCategories.map((cat) => ({
          id: cat.slug,
          name: isEn && cat.name_en ? cat.name_en : cat.name,
          count: dbProducts.filter((p) => inCategory(p.category, cat.slug)).length,
        })),
      ]
    : [
        { id: "all", name: t("pages.products.all.categoryAll"), count: totalCount },
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
    <div
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
      )}
    >
      {/* ── 페이지 배너 ── */}
      <PageBanner
        imageUrl="/banner/product_banner_temp.png"
        mobileImageUrl="/product/m_product_banner.png"
        title={t("pages.products.all.bannerTitle")}
        subtitle={t("pages.products.all.bannerSubtitle")}
        mobileSubtitle={t("pages.products.all.bannerSubtitleMobile")}
        linkUrl="/products/egg-story"
        linkText={t("pages.products.all.ctaLearnMore")}
        mobileAspectRatio="343 / 343"
        hideOnMobile={false}
        hideBreadcrumbOnMobile
        frostedLinkOnMobile
        breadcrumb={[
          { label: t("common.breadcrumbHome"), href: "/" },
          { label: t("pages.products.shared.breadcrumbProducts") },
        ]}
        dbBanner={
          pageBanner
            ? { ...pageBanner, link_url: "/products/egg-story" }
            : null
        }
      />

      {/* ── 배너 아래 여백 확보 + 제품 카테고리 헤더 + 검색 (PC: 시안 1600px 중앙 + 상단 60px) ── */}
      <div className="px-4 pb-5 pt-5 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))] md:pt-[60px]">
        <div className="mx-auto flex min-w-0 w-full max-w-[var(--content-max-width)] items-center justify-between gap-4 md:gap-5">

          {/* 타이틀 — 36px / letterSpacing -4% */}
          <SectionPageTitle
            as="h2"
            preset="none"
            starVariant="product"
            className="flex items-center gap-[11px] font-bold text-[#1F2121] md:gap-5"
            rootStyle={{ fontSize: pc1920(18, 36), letterSpacing: "-0.04em" }}
            markClassName="h-[21px] w-[21px] flex-shrink-0 md:h-[21px] md:w-[21px]"
            wrapTitle={false}
          >
            {t("pages.products.all.categoryHeading")}
          </SectionPageTitle>

          {/* 검색창 */}
          <div className="hidden min-w-0 shrink md:block">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={() => setSearchQuery(searchInput)}
              inputClassName="min-h-0 border border-[#02633E] py-5 font-bold placeholder:font-bold placeholder:text-[#666666] md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(360px,calc(360*100vw/1920))] md:px-10"
              buttonClassName="md:h-[min(64px,calc(64*100vw/1920))] md:w-[min(64px,calc(64*100vw/1920))] md:p-5"
            />
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 바 (PC: 채용공고 탭줄과 동일 — 콘텐츠 max 폭 안 라운드 바) ── */}
      <div className="px-4 pb-5 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto min-w-0 w-full max-w-[var(--content-max-width)]">
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
                    isActive ? "bg-[#02633E] text-white" : "bg-white text-[#154725]"
                  }`}
                  style={{
                    fontFamily: "NanumSquareRound",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {cat.name}
                  {showCount && cat.count > 0 && <span className="ml-0.5 opacity-70">({cat.count})</span>}
                </button>
              );
            })}
          </div>

          {/* 데스크탑 탭 바 — 녹색 띠: 가로 스크롤로 축소 시 겹침 방지 */}
          <div
            className={cn(
              "scrollbar-hide hidden min-w-0 flex-nowrap items-center overflow-x-auto rounded-[clamp(20px,calc(40*100vw/1920),40px)] bg-[#02633E] px-[clamp(12px,calc(20*100vw/1920),20px)] py-[clamp(10px,calc(16*100vw/1920),16px)] md:flex md:gap-[clamp(8px,calc(10*100vw/1920),10px)]",
            )}
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const isAll = cat.id === "all";
              const showCount = isAll || isActive;

              return (
                <div key={cat.id} className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      fontSize: pc1920(15, 18),
                      letterSpacing: "-0.04em",
                      color: isActive ? "#154725" : undefined,
                      fontFamily: "NanumSquareRound",
                      fontWeight: isActive ? 800 : 700,
                    }}
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-[clamp(20px,calc(40*100vw/1920),40px)] px-[clamp(12px,calc(20*100vw/1920),20px)] py-[clamp(6px,calc(10*100vw/1920),10px)] transition-all duration-150",
                      isActive ? "bg-white" : "text-white hover:bg-white/10",
                    )}
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
      <div className="px-4 pb-4 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto flex min-w-0 w-full max-w-[var(--content-max-width)] items-center justify-between">
          <p className="text-sm font-medium text-gray-600 md:text-sm">
            <span
              className="text-xs font-bold text-[#02633E] md:hidden"
              style={{ fontFamily: "NanumSquareRound" }}
            >
              {t("pages.products.all.totalMobile", { count: currentCategoryCount })}
            </span>
            <span
              className="hidden md:inline"
              style={{
                fontFamily: "NanumSquareRound",
                fontSize: pc1920(14, 18),
                lineHeight: 1.5,
                color: "#003F2B",
                fontWeight: 700,
              }}
            >
              {t("pages.products.all.totalDesktop", { count: currentCategoryCount })}
            </span>
          </p>
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-[var(--site-chrome-header-bg,#FDFDF5)] px-3 py-1 text-xs font-medium text-black"
                onClick={() => setIsSortOpen((prev) => !prev)}
              >
                {SORT_OPTIONS.find((opt) => opt.id === sortOption)?.label ??
                  t("pages.products.all.sortRecommended")}
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
              alt={t("pages.products.shared.sortIconAlt")}
              className="h-7 w-7 rounded-md border border-[#DCD8C8] bg-[var(--site-chrome-header-bg,#FDFDF5)] object-contain p-1.5"
            />
          </div>
        </div>
      </div>

      {/* ── 제품 그리드 ── */}
      <div className="px-4 pb-16 md:px-[max(1rem,calc((100vw-var(--content-max-width))/2))]">
        <div className="mx-auto min-w-0 w-full max-w-[var(--content-max-width)]">
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
