import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";

export default function ConvenienceScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            {t("navigation.products.convenience", "간편식 제품")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            외식업체와 가정용 간편식 솔루션
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <ProductGrid selectedCategory="convenience" searchQuery="" />
        </div>
      </section>
    </div>
  );
}
