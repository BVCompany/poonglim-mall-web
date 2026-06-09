import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { Search, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import { pcMin } from "~/core/lib/pc-fluid";

const PAGE_SIZE = 8; // 한 페이지당 표시 제품 수

/** 라우트 경로 slug → DB/목업 category 값 */
const ROUTE_CATEGORY_TO_DB: Record<string, string> = {
  "liquid-eggs": "liquid_egg",
  puddings: "pudding",
};

function resolveCategoryFilter(selectedCategory: string): string {
  return ROUTE_CATEGORY_TO_DB[selectedCategory] ?? selectedCategory;
}

interface Product {
  id: number;
  name: string;
  category: string[];    // text[] 대응
  image: string;
  badge?: string;
  isB2b?: boolean;
  description: string;
  tags: string[];
  shopUrl?: string;
}

interface DbProduct {
  product_id: number;
  name: string;
  description: string;
  category: string | string[];   // text[] 대응
  badge?: string | null;
  image_url?: string | null;
  price?: number | null;
  original_price?: number | null;
  is_b2b: boolean;
  tags?: string[] | null;
  shop_url?: string | null;
}


/** 사용자 지정 배지 색상 */
const BADGE_STYLE: Record<string, string> = {
  BEST: "bg-[#EAE3C9] text-[#1F2121]",
  NEW:  "bg-[#FFD55D] text-[#1F2121]",
  SALE: "bg-orange-500 text-white",
  B2B:  "bg-[#32AF32] text-white",
};

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
  sortOption?: "recommended" | "latest" | "name";
  dbProducts?: DbProduct[];
}

export function ProductGrid({
  selectedCategory,
  searchQuery,
  sortOption = "recommended",
  dbProducts = [],
}: ProductGridProps) {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const prevFiltered = useRef<string>("");

  const source: Product[] = dbProducts.map((p) => ({
    id: p.product_id,
    name: p.name,
    category: Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []),
    image: p.image_url ?? "/home/premium_egg.png",
    badge: p.badge?.toUpperCase(),
    isB2b: p.is_b2b,
    description: p.description,
    tags: p.tags ?? [],
    shopUrl: p.shop_url ?? undefined,
  }));

  const categorySlug = resolveCategoryFilter(selectedCategory);

  const filtered = source.filter((p) => {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    const matchCat =
      selectedCategory === "all" || cats.includes(categorySlug);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const sortLocale = i18n.language?.startsWith("ko") ? "ko" : "en";

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "latest") return b.id - a.id;
    if (sortOption === "name") return a.name.localeCompare(b.name, sortLocale);
    return 0;
  });

  // 카테고리/검색/정렬 변경 시 1페이지로 리셋
  const filterKey = `${selectedCategory}__${searchQuery}__${sortOption}`;
  useEffect(() => {
    if (prevFiltered.current !== filterKey) {
      prevFiltered.current = filterKey;
      setCurrentPage(1);
      setSlideDir("next");
      setAnimKey((k) => k + 1);
    }
  }, [filterKey]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageItems = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goPage = (page: number, dir: "next" | "prev") => {
    setSlideDir(dir);
    setCurrentPage(page);
    setAnimKey((k) => k + 1);
  };

  if (source.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-base text-gray-500">{t("empty.products")}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">{t("pages.products.grid.emptySearch")}</p>
      </div>
    );
  }

  // 슬라이드 애니메이션 keyframes
  const slideInStyle = slideDir === "next"
    ? { animation: "slideInFromRight 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" }
    : { animation: "slideInFromLeft 0.35s cubic-bezier(0.25,0.46,0.45,0.94) both" };

  return (
    <div>
      {/* 슬라이드 애니메이션 keyframes 정의 */}
      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-60px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* 제품 그리드 — 슬라이드 in */}
      <div
        key={animKey}
        style={slideInStyle}
        className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-[10px] lg:grid-cols-4"
      >
        {pageItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 페이지네이션 버튼 — 메인 슬라이드 네비와 동일한 디자인 */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center gap-3">
          <div className="inline-flex overflow-hidden rounded-full bg-white md:rounded-none">
            <button
              onClick={() => currentPage > 1 && goPage(currentPage - 1, "prev")}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30 md:h-[52px] md:w-[52px] md:rounded-bl-[40px] md:rounded-tl-[40px] md:bg-[#F0EEDD] md:hover:bg-[#E8E4D4]"
              aria-label={t("pages.products.grid.prevPage")}
            >
              <ChevronLeft className="h-5 w-5 md:h-[18px] md:w-[18px] md:text-[#02633E]" strokeWidth={2.5} />
            </button>
            <div className="w-px shrink-0 bg-[#EAE3C9] md:bg-[#E2E0D0]" aria-hidden />
            <button
              onClick={() => currentPage < totalPages && goPage(currentPage + 1, "next")}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30 md:h-[52px] md:w-[52px] md:rounded-br-[40px] md:rounded-tr-[40px] md:bg-[#F0EEDD] md:hover:bg-[#E8E4D4]"
              aria-label={t("pages.products.grid.nextPage")}
            >
              <ChevronRight className="h-5 w-5 md:h-[18px] md:w-[18px] md:text-[#02633E]" strokeWidth={2.5} />
            </button>
          </div>
          <span className="text-sm text-gray-500 md:hidden">
            <span className="font-bold text-[#003F2B]">{currentPage}</span>
            {" / "}
            {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const badges: string[] = [];
  if (product.badge && product.badge !== "B2B") badges.push(product.badge);
  if (product.isB2b) badges.push("B2B");

  return (
    /* 카드 루트 — 클릭 시 상세 페이지로 바로 이동 */
    <div
      className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-[#EAE3C9] p-3 shadow-sm transition-all duration-200 hover:shadow-md md:rounded-[40px] md:p-6 md:shadow-none"
      onClick={() => navigate(`/products/${product.id}`, { viewTransition: true })}
    >

      {/* ① 이미지 영역 — 메인 제품 섹션과 동일하게 크림 카드 안 흰색 라운드 박스(inset) +
          object-cover로 배경 유무·비율과 무관하게 동일 영역을 꽉 채워 통일감 있게 노출 */}
      <div className="relative aspect-square overflow-hidden rounded-[14px] bg-white md:aspect-[392/360] md:rounded-2xl">
        <img
          src={imgError ? "/home/premium_egg.png" : product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {/* 배지 — 좌상단 */}
        {badges.length > 0 && (
          <div className="absolute left-2 top-2 z-10 flex gap-1 md:left-5 md:top-5 md:gap-[5px]">
            {badges.map((b) => (
              <span
                key={b}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium md:px-[13px] md:py-[7px] md:text-xs md:font-medium ${BADGE_STYLE[b] ?? "bg-gray-500 text-white"}`}
                style={{ fontFamily: "Pretendard, system-ui, sans-serif" }}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* 풍림몰 badge — 모바일 우상단, 링크가 있을 때만 표시 */}
        {product.shopUrl && (
          <div className="absolute right-2 top-2 z-10 md:hidden">
            <a
              href={product.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-[18px] items-center gap-0.5 rounded-full bg-[#32AF32] px-2 text-[9px] font-bold text-white"
              style={{ fontFamily: "NanumSquareRound" }}
            >
              {t("pages.products.shared.mall")}
              <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} />
            </a>
          </div>
        )}
      </div>

      {/* ② 텍스트 영역 (카드 루트 패딩(p-3/md:p-6)을 사용하므로 가로 패딩은 0) */}
      <div className="px-0 pb-0 pt-2.5 md:pt-4">
        <h3
          className="mb-1 line-clamp-2 leading-[1.3] tracking-[-0.02em] text-gray-900 md:leading-[26px] md:tracking-[-0.015em]"
          style={{ fontSize: "15px", fontFamily: "NanumSquareRound", fontWeight: 800 }}
        >
          <span className="md:hidden">{product.name}</span>
          <span className="hidden text-[20px] md:inline">{product.name}</span>
        </h3>
        <p
          className="mb-2 line-clamp-1 tracking-[-0.02em] text-gray-500 md:mb-2.5 md:text-[#1F2121] md:tracking-[-0.015em]"
          style={{ fontSize: "12px", fontFamily: "NanumSquareRound", fontWeight: 400 }}
        >
          <span className="md:hidden">{product.description}</span>
          <span className="hidden text-[16px] md:inline md:leading-[22.4px]">{product.description}</span>
        </p>
        <div className="flex flex-wrap gap-1 md:gap-1.5">
          {product.tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              className={`rounded-full bg-[#EAE3C9] px-2 py-0.5 text-[10px] font-medium tracking-[-0.02em] text-[#555] md:px-[13px] md:py-[7px] md:text-xs md:text-[#1F2121] ${i === 3 ? "hidden md:inline-flex" : ""}`}
              style={{ fontFamily: "Pretendard, system-ui, sans-serif" }}
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      </div>

      {/* ③ 카드 전체 호버 오버레이 — PC 시안: 반투명 #2C383A 40%, 원형 CTA 140px */}
      <div
        className="absolute inset-0 z-20 hidden flex-row items-center justify-center gap-2.5 rounded-[40px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:flex"
        style={{ backgroundColor: "rgba(44, 56, 58, 0.4)" }}
      >
        <Link
          to={`/products/${product.id}`}
          className="flex shrink-0 items-center justify-center rounded-full px-3 text-center font-bold uppercase leading-tight text-[#1F2121] transition-all hover:brightness-105"
          style={{
            backgroundColor: "#FFD55D",
            width: pcMin(140),
            height: pcMin(140),
            fontSize: pcMin(16),
            fontFamily: "NanumSquareRound, sans-serif",
            fontWeight: 700,
          }}
          viewTransition
          onClick={(e) => e.stopPropagation()}
        >
          {t("pages.products.shared.viewDetail")}
        </Link>

        {/* 풍림몰 링크가 있을 때만 노출 — 없으면 상세보기 버튼만 가운데 표시 */}
        {product.shopUrl && (
          <a
            href={product.shopUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center justify-center gap-0.5 rounded-full px-2 text-center font-bold uppercase leading-tight text-white transition-all hover:brightness-105"
            style={{
              backgroundColor: "#32AF32",
              width: pcMin(140),
              height: pcMin(140),
              fontSize: pcMin(16),
              fontFamily: "NanumSquareRound, sans-serif",
              fontWeight: 700,
            }}
          >
            {t("pages.products.shared.mall")}
            <ArrowUpRight className="shrink-0" style={{ width: pcMin(10), height: pcMin(10) }} strokeWidth={2.5} />
          </a>
        )}
      </div>

    </div>
  );
}
