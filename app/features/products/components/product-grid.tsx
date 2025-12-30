import { Link } from "react-router";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: "NEW" | "BEST" | "SALE";
  description: string;
  tags: string[];
}

// Mock product data
const allProducts: Product[] = [
  // 액란 제품
  {
    id: 1,
    name: "짜먹는 에그샐러드 1kg",
    category: "liquid-eggs",
    price: "14,800원",
    originalPrice: "18,000원",
    image: "/home/premium_egg.png",
    badge: "BEST",
    description: "간편하게 즐기는 프리미엄 에그샐러드",
    tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"],
  },
  {
    id: 2,
    name: "짜먹는 콘버터 에그샐러드 1kg",
    category: "liquid-eggs",
    price: "13,000원",
    originalPrice: "16,000원",
    image: "/home/premium_egg.png",
    badge: "SALE",
    description: "고소한 콘버터가 들어간 에그샐러드",
    tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"],
  },
  {
    id: 3,
    name: "짜먹는 단호박 에그샐러드 1kg",
    category: "liquid-eggs",
    price: "13,000원",
    originalPrice: "16,000원",
    image: "/home/premium_egg.png",
    badge: "SALE",
    description: "영양 가득한 단호박 에그샐러드",
    tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"],
  },
  {
    id: 4,
    name: "짜먹는 김치 에그샐러드 1kg",
    category: "liquid-eggs",
    price: "14,900원",
    originalPrice: "18,000원",
    image: "/home/premium_egg.png",
    description: "한국적인 맛의 김치 에그샐러드",
    tags: ["#간편", "#간편식사", "#직장인", "#한끼해결"],
  },
  {
    id: 5,
    name: "짜먹는 매콤 에그샐러드 500g",
    category: "liquid-eggs",
    price: "8,120원",
    originalPrice: "11,000원",
    image: "/home/premium_egg.png",
    badge: "NEW",
    description: "매콤한 맛이 일품인 에그샐러드",
    tags: ["#간편", "#샌드위치", "#직장인", "#아침식사"],
  },
  {
    id: 6,
    name: "짜먹는 달콤 에그샐러드 500g",
    category: "liquid-eggs",
    price: "8,120원",
    originalPrice: "11,000원",
    image: "/home/premium_egg.png",
    description: "달콤한 맛의 에그샐러드",
    tags: ["#간편", "#샌드위치", "#직장인", "#아침식사"],
  },
  {
    id: 7,
    name: "짜먹는 참치 에그샐러드 500g",
    category: "liquid-eggs",
    price: "8,120원",
    originalPrice: "11,000원",
    image: "/home/premium_egg.png",
    description: "참치가 들어간 고단백 에그샐러드",
    tags: ["#간편", "#샌드위치", "#직장인", "#아침식사"],
  },
  {
    id: 8,
    name: "뿌셔먹는 단호박 에그샐러드 150g, 2팩",
    category: "liquid-eggs",
    price: "5,960원",
    originalPrice: "9,000원",
    image: "/home/premium_egg.png",
    description: "간편하게 뿌려먹는 단호박 에그샐러드",
    tags: ["#간편", "#샌드위치", "#직장인", "#아침식사"],
  },
  {
    id: 9,
    name: "뿌셔먹는 에그샐러드 150g, 2팩",
    category: "liquid-eggs",
    price: "5,960원",
    originalPrice: "9,000원",
    image: "/home/premium_egg.png",
    description: "간편하게 뿌려먹는 에그샐러드",
    tags: ["#간편", "#샌드위치", "#직장인", "#아침식사"],
  },
  // 푸딩 제품
  {
    id: 10,
    name: "커스터드 푸딩",
    category: "puddings",
    price: "3,500원",
    image: "/home/puding.png",
    badge: "BEST",
    description: "부드럽고 진한 커스터드 푸딩",
    tags: ["#디저트", "#프리미엄", "#커스터드"],
  },
  {
    id: 11,
    name: "카라멜 푸딩",
    category: "puddings",
    price: "3,500원",
    image: "/home/puding.png",
    badge: "NEW",
    description: "달콤한 카라멜 소스와 함께",
    tags: ["#디저트", "#카라멜"],
  },
  {
    id: 12,
    name: "초코 푸딩",
    category: "puddings",
    price: "3,800원",
    image: "/home/puding.png",
    description: "진한 초콜릿 맛의 푸딩",
    tags: ["#디저트", "#초콜릿"],
  },
  {
    id: 13,
    name: "바닐라 푸딩",
    category: "puddings",
    price: "3,200원",
    image: "/home/puding.png",
    description: "부드러운 바닐라 푸딩",
    tags: ["#디저트", "#바닐라"],
  },
  {
    id: 14,
    name: "망고 푸딩",
    category: "puddings",
    price: "4,000원",
    image: "/home/puding.png",
    badge: "NEW",
    description: "상큼한 망고 푸딩",
    tags: ["#디저트", "#과일"],
  },
  {
    id: 15,
    name: "딸기 푸딩",
    category: "puddings",
    price: "4,000원",
    image: "/home/puding.png",
    description: "새콤달콤 딸기 푸딩",
    tags: ["#디저트", "#과일"],
  },
  // 편의식 제품
  {
    id: 16,
    name: "계란찜",
    category: "convenience",
    price: "2,500원",
    image: "/home/solution.png",
    badge: "BEST",
    description: "부드러운 계란찜",
    tags: ["#간편식", "#업소용"],
  },
  {
    id: 17,
    name: "계란말이",
    category: "convenience",
    price: "3,000원",
    image: "/home/solution.png",
    description: "폭신한 계란말이",
    tags: ["#간편식", "#업소용"],
  },
  {
    id: 18,
    name: "오므라이스",
    category: "convenience",
    price: "5,500원",
    image: "/home/solution.png",
    badge: "NEW",
    description: "간편한 오므라이스",
    tags: ["#간편식", "#한끼"],
  },
  {
    id: 19,
    name: "스크램블 에그",
    category: "convenience",
    price: "3,500원",
    image: "/home/solution.png",
    description: "폭신한 스크램블 에그",
    tags: ["#간편식", "#아침"],
  },
  {
    id: 20,
    name: "계란죽",
    category: "convenience",
    price: "4,000원",
    image: "/home/solution.png",
    description: "영양만점 계란죽",
    tags: ["#간편식", "#건강"],
  },
  {
    id: 21,
    name: "볶음밥",
    category: "convenience",
    price: "4,500원",
    image: "/home/solution.png",
    badge: "BEST",
    description: "고소한 계란 볶음밥",
    tags: ["#간편식", "#한끼"],
  },
];

interface ProductGridProps {
  selectedCategory: string;
  searchQuery: string;
}

export function ProductGrid({ selectedCategory, searchQuery }: ProductGridProps) {
  // Filter products
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">총 {filteredProducts.length}개 제품</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.badge && (
                <Badge
                  className={`absolute left-4 top-4 ${
                    product.badge === "NEW"
                      ? "bg-green-600"
                      : product.badge === "BEST"
                        ? "bg-blue-600"
                        : "bg-purple-600"
                  }`}
                >
                  {product.badge}
                </Badge>
              )}
              {product.originalPrice && (
                <Badge variant="destructive" className="absolute right-4 top-4">
                  할인
                </Badge>
              )}
            </div>

            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold text-foreground">{product.name}</h3>
              <p className="mb-3 text-pretty text-muted-foreground">{product.description}</p>

              <div className="mb-4 flex flex-wrap gap-1">
                {product.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-orange-100 text-xs text-orange-700 hover:bg-orange-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={`/products/${product.id}`} viewTransition>
                    <Eye className="mr-2 h-4 w-4" />
                    상세보기
                  </Link>
                </Button>
                <Button variant="outline">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">검색 조건에 맞는 제품이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
