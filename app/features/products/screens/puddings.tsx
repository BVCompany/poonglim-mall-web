import { useTranslation } from "react-i18next";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "~/core/components/ui/button";

export default function PuddingsScreen() {
  const { t } = useTranslation();

  const products = [
    {
      id: 1,
      name: "커스터드 푸딩 6입",
      category: "푸딩",
      price: "12,900원",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
      description: "부드럽고 진한 커스터드 푸딩",
    },
    {
      id: 2,
      name: "카라멜 푸딩 6입",
      category: "푸딩",
      price: "13,900원",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
      description: "달콤한 카라멜 소스와 함께",
    },
    {
      id: 3,
      name: "초코 푸딩 6입",
      category: "푸딩",
      price: "14,900원",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      description: "진한 초콜릿 맛 프리미엄 푸딩",
    },
    {
      id: 4,
      name: "바닐라 푸딩 6입",
      category: "푸딩",
      price: "12,900원",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
      description: "고급 바닐라빈 사용",
    },
    {
      id: 5,
      name: "망고 푸딩 6입",
      category: "푸딩",
      price: "15,900원",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400",
      description: "상큼한 망고 과육 푸딩",
    },
    {
      id: 6,
      name: "딸기 푸딩 6입",
      category: "푸딩",
      price: "15,900원",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
      description: "신선한 딸기로 만든 프리미엄 푸딩",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {t("navigation.products.puddings")}
          </h1>
          <p className="text-lg opacity-90">
            부드럽고 달콤한 풍림푸드의 프리미엄 푸딩 시리즈
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-12 text-center text-lg text-muted-foreground">
            엄선된 원료로 만든 고품질 디저트 푸딩
          </p>

          {/* Products Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="size-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-xs font-medium">
                    {product.category}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="mb-2 font-bold">{product.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {product.description}
                  </p>

                  <div className="mb-3 flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{product.price}</span>
                    <Button size="sm" className="gap-2">
                      <ShoppingCart className="size-4" />
                      담기
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

