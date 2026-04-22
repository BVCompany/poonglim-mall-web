import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "~/core/components/ui/button";
import { Breadcrumb } from "~/core/components/breadcrumb";

export default function PuddingsScreen() {
  const { t } = useTranslation();

  const products = useMemo(() => {
    const imgs = [
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
      "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400",
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
    ] as const;
    const ratings = [4.9, 4.8, 4.7, 4.8, 4.9, 4.8] as const;
    const keys = ["p1", "p2", "p3", "p4", "p5", "p6"] as const;
    return keys.map((key, i) => {
      const d = t(`pages.products.categoryPudding.demos.${key}`, {
        returnObjects: true,
      }) as { name: string; description: string; price: string; category: string };
      return {
        id: i + 1,
        name: d.name,
        category: d.category,
        price: d.price,
        rating: ratings[i],
        image: imgs[i],
        description: d.description,
      };
    });
  }, [t]);

  return (
    <div className="w-full">
      <Breadcrumb
        items={[
          { label: t("pages.products.shared.breadcrumbProducts"), href: "/products/all" },
          { label: t("pages.products.categoryPudding.breadcrumbLabel") },
        ]}
      />
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))] text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            {t("navigation.products.puddings")}
          </h1>
          <p className="text-lg opacity-90">
            {t("pages.products.categoryPudding.heroSub")}
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-[var(--site-chrome-header-bg,#FDFDF5)] py-16">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <p className="mb-12 text-center text-lg text-muted-foreground">
            {t("pages.products.categoryPudding.demoLead")}
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
                      {t("pages.products.categoryPudding.addToCart")}
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

