import { useTranslation } from "react-i18next";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "~/core/components/ui/button";

export default function ProductCategory1Screen() {
  const { t } = useTranslation();

  const products = [
    {
      id: 1,
      name: "프리미엄 소고기 세트",
      price: "59,900원",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400",
      description: "최상급 한우로 만든 프리미엄 소고기 세트"
    },
    {
      id: 2,
      name: "국내산 돼지고기",
      price: "29,900원",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400",
      description: "신선한 국내산 돼지고기"
    },
    {
      id: 3,
      name: "닭가슴살 세트",
      price: "19,900원",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
      description: "건강한 단백질 공급원"
    },
    {
      id: 4,
      name: "삼겹살 특선",
      price: "35,900원",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400",
      description: "육즙 가득한 삼겹살"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-4xl font-bold">
          {t("navigation.products.category1")}
        </h1>
        <p className="text-muted-foreground mb-12 text-lg">
          엄선된 최상급 육류 제품을 만나보세요
        </p>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="mb-2 font-bold">{product.name}</h3>
                <p className="text-muted-foreground mb-3 text-sm">
                  {product.description}
                </p>
                
                {/* Rating */}
                <div className="mb-3 flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>

                {/* Price and CTA */}
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
    </div>
  );
}

