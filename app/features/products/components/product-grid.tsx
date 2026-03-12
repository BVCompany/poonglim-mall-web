import { useState } from "react";
import { Link } from "react-router";
import { Search } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
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
  category: string;
  badge?: string | null;
  image_url?: string | null;
  price?: number | null;
  original_price?: number | null;
  is_b2b: boolean;
  tags?: string[] | null;
  shop_url?: string | null;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: "짜먹는 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", badge: "BEST", description: "간편하게 즐기는 프리미엄 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 2, name: "짜먹는 콘버터 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", badge: "NEW", isB2b: true, description: "고소한 콘버터가 들어간 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 3, name: "짜먹는 단호박 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", description: "영양 가득한 단호박 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 4, name: "짜먹는 김치 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", badge: "BEST", description: "한국적인 맛의 김치 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 5, name: "커스터드 푸딩", category: "pudding", image: "/home/puding.png", badge: "BEST", description: "부드럽고 진한 커스터드 푸딩", tags: ["#디저트", "#프리미엄", "#커스터드"] },
  { id: 6, name: "카라멜 푸딩", category: "pudding", image: "/home/puding.png", badge: "NEW", description: "달콤한 카라멜 소스와 함께", tags: ["#디저트", "#카라멜"] },
  { id: 7, name: "계란찜", category: "convenience", image: "/home/solution.png", badge: "BEST", description: "부드러운 계란찜", tags: ["#간편식", "#업소용"] },
  { id: 8, name: "계란말이", category: "convenience", image: "/home/solution.png", description: "폭신한 계란말이", tags: ["#간편식", "#업소용"] },
];

/** 사용자 지정 배지 색상 */
const BADGE_STYLE: Record<string, string> = {
  BEST: "bg-[#f4f2e5] text-[#204E3A]",
  NEW:  "bg-[#ffd55d] text-[#1a1a1a]",
  SALE: "bg-orange-500 text-white",
  B2B:  "bg-[#32af32] text-white",
};

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
  dbProducts?: DbProduct[];
}

export function ProductGrid({ selectedCategory, searchQuery, dbProducts = [] }: ProductGridProps) {
  const source: Product[] = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: p.product_id,
        name: p.name,
        category: p.category,
        image: p.image_url ?? "/home/premium_egg.png",
        badge: p.badge?.toUpperCase(),
        isB2b: p.is_b2b,
        description: p.description,
        tags: p.tags ?? [],
        shopUrl: p.shop_url ?? undefined,
      }))
    : MOCK_PRODUCTS;

  const filtered = source.filter((p) => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    return (
      <div className="py-20 text-center">
        <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
        <p className="text-gray-500">검색 결과가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);

  // 표시할 배지 목록 구성 (badge + is_b2b 동시 지원)
  const badges: string[] = [];
  if (product.badge && product.badge !== "B2B") badges.push(product.badge);
  if (product.isB2b) badges.push("B2B");

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-[#EDEBE4] shadow-sm transition-all duration-200 hover:shadow-md">

      {/* 이미지 영역 — object-contain + 패딩으로 배경 노출 (홈 카드와 동일 방식) */}
      <div className="relative aspect-square overflow-hidden bg-[#EDEBE4]">
        {/* 이미지 패딩 래퍼 */}
        <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6">
          <img
            src={imgError ? "/home/premium_egg.png" : product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        </div>

        {/* 배지 — 절대 위치, 좌상단, 여러 개 가로 나열 */}
        {badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex gap-1">
            {badges.map((b) => (
              <span
                key={b}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${BADGE_STYLE[b] ?? "bg-gray-500 text-white"}`}
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* 호버 오버레이 — 대형 원형 버튼 */}
        <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:gap-4">
          <Link
            to={`/products/${product.id}`}
            className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-white/25 text-center text-[11px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/40 md:h-20 md:w-20 md:text-xs"
            viewTransition
          >
            상세보기
          </Link>

          {product.shopUrl ? (
            <a
              href={product.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-[#204E3A] text-center text-[11px] font-semibold text-white transition-colors hover:bg-[#1a3f2e] md:h-20 md:w-20 md:text-xs"
            >
              풍림몰 가기
            </a>
          ) : (
            <div className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-[#204E3A]/40 text-center text-[11px] font-semibold text-white/50 md:h-20 md:w-20 md:text-xs">
              풍림몰 가기
            </div>
          )}
        </div>
      </div>

      {/* 텍스트 영역 */}
      <div className="px-3 pb-4 pt-3 md:px-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 md:text-base">
          {product.name}
        </h3>
        {/* 설명 — 1줄 초과 시 ... 처리 */}
        <p className="mb-2.5 line-clamp-1 text-xs text-gray-500">
          {product.description}
        </p>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
          {product.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="text-[11px] text-[#204E3A]/60">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
