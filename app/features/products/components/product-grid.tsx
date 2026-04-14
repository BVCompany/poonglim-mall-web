import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { Search, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import { pcMin } from "~/core/lib/pc-fluid";

const PAGE_SIZE = 8; // 한 페이지당 표시 제품 수

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

const MOCK_PRODUCTS: Product[] = [
  { id: 1,  name: "짜먹는 에그샐러드 1kg",        category: ["liquid_egg"],  image: "/home/premium_egg.png", badge: "BEST", description: "간편하게 즐기는 프리미엄 에그샐러드",       tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 2,  name: "짜먹는 콘버터 에그샐러드 1kg", category: ["liquid_egg"],  image: "/home/premium_egg.png", badge: "NEW",  isB2b: true, description: "고소한 콘버터가 들어간 에그샐러드",        tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 3,  name: "짜먹는 단호박 에그샐러드 1kg", category: ["liquid_egg"],  image: "/home/premium_egg.png", description: "영양 가득한 단호박 에그샐러드",                tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 4,  name: "짜먹는 김치 에그샐러드 1kg",   category: ["liquid_egg"],  image: "/home/premium_egg.png", badge: "BEST", description: "한국적인 맛의 김치 에그샐러드",              tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 5,  name: "커스터드 푸딩",                category: ["pudding"],     image: "/home/puding.png",      badge: "BEST", description: "부드럽고 진한 커스터드 푸딩",               tags: ["#디저트", "#프리미엄", "#커스터드"] },
  { id: 6,  name: "카라멜 푸딩",                  category: ["pudding"],     image: "/home/puding.png",      badge: "NEW",  description: "달콤한 카라멜 소스와 함께",              tags: ["#디저트", "#카라멜"] },
  { id: 7,  name: "계란찜",                       category: ["convenience"], image: "/home/solution.png",    badge: "BEST", description: "부드러운 계란찜",                       tags: ["#간편식", "#업소용"] },
  { id: 8,  name: "계란말이",                     category: ["convenience"], image: "/home/solution.png",    description: "폭신한 계란말이",                              tags: ["#간편식", "#업소용"] },
  { id: 9,  name: "스크램블 에그 파우더",          category: ["liquid_egg"],  image: "/home/premium_egg.png", badge: "NEW",  description: "빠르게 만드는 부드러운 스크램블 에그", tags: ["#간편", "#파우더", "#아침식사"] },
  { id: 10, name: "프리미엄 구운 계란 12구",       category: ["convenience"], image: "/home/premium_egg.png", badge: "BEST", description: "전통 방식으로 구운 프리미엄 구운 계란",  tags: ["#구운계란", "#간식", "#건강"] },
  { id: 11, name: "훈제 계란 10구",               category: ["convenience"], image: "/home/premium_egg.png", description: "향긋하게 훈제한 계란",                          tags: ["#훈제", "#간식", "#건강식"] },
  { id: 12, name: "녹차 계란 10구",               category: ["convenience"], image: "/home/premium_egg.png", description: "녹차 성분을 먹여 키운 닭의 계란",                tags: ["#녹차", "#건강", "#프리미엄"] },
  { id: 13, name: "짜먹는 마요 에그샐러드 1kg",   category: ["liquid_egg"],  image: "/home/premium_egg.png", badge: "NEW",  description: "고소한 마요네즈 베이스 에그샐러드",     tags: ["#마요", "#간편", "#샌드위치"] },
  { id: 14, name: "바닐라 푸딩",                  category: ["pudding"],     image: "/home/puding.png",      description: "진한 바닐라 향의 부드러운 푸딩",                tags: ["#바닐라", "#디저트", "#프리미엄"] },
  { id: 15, name: "딸기 푸딩",                    category: ["pudding"],     image: "/home/puding.png",      badge: "NEW",  description: "상큼한 딸기가 듬뿍 들어간 푸딩",       tags: ["#딸기", "#디저트"] },
  { id: 16, name: "업소용 액란 5L",               category: ["liquid_egg"],  image: "/home/premium_egg.png", isB2b: true,   description: "업소 전용 대용량 액란",                 tags: ["#B2B", "#업소용", "#대용량"] },
  { id: 17, name: "계란 샌드위치 필링 2kg",       category: ["liquid_egg"],  image: "/home/premium_egg.png", badge: "BEST", description: "샌드위치 가게를 위한 전문 필링",         tags: ["#샌드위치", "#필링", "#B2B"] },
  { id: 18, name: "토마토 에그 솔루션",            category: ["convenience"], image: "/home/solution.png",    badge: "NEW",  description: "토마토와 계란의 완벽한 조화",           tags: ["#토마토", "#간편식", "#건강"] },
];

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
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDir, setSlideDir] = useState<"next" | "prev">("next");
  const [animKey, setAnimKey] = useState(0);
  const prevFiltered = useRef<string>("");

  const source: Product[] = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: p.product_id,
        name: p.name,
        category: Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []),
        image: p.image_url ?? "/home/premium_egg.png",
        badge: p.badge?.toUpperCase(),
        isB2b: p.is_b2b,
        description: p.description,
        tags: p.tags ?? [],
        shopUrl: p.shop_url ?? undefined,
      }))
    : MOCK_PRODUCTS;

  const filtered = source.filter((p) => {
    const cats = Array.isArray(p.category) ? p.category : [p.category];
    const matchCat = selectedCategory === "all" || cats.includes(selectedCategory);
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "latest") return b.id - a.id;
    if (sortOption === "name") return a.name.localeCompare(b.name, "ko");
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

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">검색 결과가 없습니다.</p>
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
              aria-label="이전 페이지"
            >
              <ChevronLeft className="h-5 w-5 md:h-[18px] md:w-[18px] md:text-[#02633E]" strokeWidth={2.5} />
            </button>
            <div className="w-px shrink-0 bg-[#EAE3C9] md:bg-[#E2E0D0]" aria-hidden />
            <button
              onClick={() => currentPage < totalPages && goPage(currentPage + 1, "next")}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center text-[#003F2B] transition-colors hover:bg-[#EAE3C9]/50 disabled:cursor-not-allowed disabled:opacity-30 md:h-[52px] md:w-[52px] md:rounded-br-[40px] md:rounded-tr-[40px] md:bg-[#F0EEDD] md:hover:bg-[#E8E4D4]"
              aria-label="다음 페이지"
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
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const badges: string[] = [];
  if (product.badge && product.badge !== "B2B") badges.push(product.badge);
  if (product.isB2b) badges.push("B2B");

  return (
    /* 카드 루트 — 클릭 시 상세 페이지로 바로 이동 */
    <div
      className="group relative cursor-pointer overflow-hidden rounded-[10px] bg-[#EAE3C9] shadow-sm transition-all duration-200 hover:shadow-md md:rounded-[40px] md:shadow-none"
      onClick={() => navigate(`/products/${product.id}`, { viewTransition: true })}
    >

      {/* ① 이미지 영역 — PC 시안: 카드 폭 대비 세로 비율 약 360/392 */}
      <div className="relative aspect-square overflow-hidden bg-[#EAE3C9] md:aspect-[392/360]">
        <div className="absolute inset-0 flex items-center justify-center p-3 md:p-6">
          <img
            src={imgError ? "/home/premium_egg.png" : product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        </div>

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

        {/* 풍림몰 badge — 모바일 우상단 상시 표시 */}
        <div className="absolute right-2 top-2 z-10 md:hidden">
          {product.shopUrl ? (
            <a
              href={product.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-[18px] items-center gap-0.5 rounded-full bg-[#32AF32] px-2 text-[9px] font-bold text-white"
              style={{ fontFamily: "NanumSquareRound" }}
            >
              풍림몰
              <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} />
            </a>
          ) : (
            <div
              className="flex h-[18px] items-center gap-0.5 rounded-full bg-[#32AF32]/60 px-2 text-[9px] font-bold text-white/80"
              style={{ fontFamily: "NanumSquareRound" }}
            >
              풍림몰
              <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {/* ② 텍스트 영역 */}
      <div className="px-2.5 pb-2.5 pt-2.5 md:px-10 md:pb-10 md:pt-0">
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
          상세보기
        </Link>

        {product.shopUrl ? (
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
            풍림몰
            <ArrowUpRight className="shrink-0" style={{ width: pcMin(10), height: pcMin(10) }} strokeWidth={2.5} />
          </a>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center justify-center gap-0.5 rounded-full px-2 text-center font-bold uppercase leading-tight text-white/50"
            style={{
              backgroundColor: "rgba(50, 175, 50, 0.35)",
              width: pcMin(140),
              height: pcMin(140),
              fontSize: pcMin(16),
              fontFamily: "NanumSquareRound, sans-serif",
              fontWeight: 700,
            }}
          >
            풍림몰
            <ArrowUpRight className="shrink-0 opacity-50" style={{ width: pcMin(10), height: pcMin(10) }} strokeWidth={2.5} />
          </div>
        )}
      </div>

    </div>
  );
}
