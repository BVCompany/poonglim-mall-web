import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";

export default function LiquidEggsScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            {t("navigation.products.liquidEggs", "액란 제품")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            신선하고 안전한 액상 계란 제품 라인업
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <ProductGrid selectedCategory="liquid-eggs" searchQuery="" />
        </div>
      </section>
    </div>
  );
}
