import { useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/core/components/ui/badge";
import { ExternalLink, Search } from "lucide-react";

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  badge?: string;
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
  { id: 2, name: "짜먹는 콘버터 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", badge: "NEW", description: "고소한 콘버터가 들어간 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 3, name: "짜먹는 단호박 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", description: "영양 가득한 단호박 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 4, name: "짜먹는 김치 에그샐러드 1kg", category: "liquid_egg", image: "/home/premium_egg.png", badge: "BEST", description: "한국적인 맛의 김치 에그샐러드", tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"] },
  { id: 5, name: "커스터드 푸딩", category: "pudding", image: "/home/puding.png", badge: "BEST", description: "부드럽고 진한 커스터드 푸딩", tags: ["#디저트", "#프리미엄", "#커스터드"] },
  { id: 6, name: "카라멜 푸딩", category: "pudding", image: "/home/puding.png", badge: "NEW", description: "달콤한 카라멜 소스와 함께", tags: ["#디저트", "#카라멜"] },
  { id: 7, name: "계란찜", category: "convenience", image: "/home/solution.png", badge: "BEST", description: "부드러운 계란찜", tags: ["#간편식", "#업소용"] },
  { id: 8, name: "계란말이", category: "convenience", image: "/home/solution.png", description: "폭신한 계란말이", tags: ["#간편식", "#업소용"] },
];

const BADGE_STYLE: Record<string, string> = {
  NEW:  "bg-[#5DB876] text-white",
  BEST: "bg-[#204E3A] text-white",
  SALE: "bg-orange-500 text-white",
  B2B:  "bg-blue-600 text-white",
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
        <Search className="mx-auto h-10 w-10 text-gray-300 mb-3" />
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

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-[#F5F2EB] border border-transparent hover:border-[#204E3A]/20 transition-all duration-200">
      {/* 이미지 영역 */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F2EB]">
        <img
          src={imgError ? "/home/premium_egg.png" : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {/* 배지 */}
        {product.badge && (
          <span className={`absolute top-3 left-3 text-[11px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLE[product.badge] ?? "bg-gray-500 text-white"}`}>
            {product.badge}
          </span>
        )}

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <Link
            to={`/products/${product.id}`}
            className="bg-white text-[#204E3A] text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#204E3A] hover:text-white transition-colors"
            viewTransition
          >
            상세보기
          </Link>
          {product.shopUrl && (
            <a
              href={product.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#204E3A] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#1a3f2e] transition-colors flex items-center gap-1"
            >
              풍림몰 가기
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* 텍스트 영역 */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2">{product.description}</p>
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] text-gray-400">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
