import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";
import { Breadcrumb } from "~/core/components/breadcrumb";

export default function ConvenienceScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      <Breadcrumb
        items={[
          { label: "제품소개", href: "/products/all" },
          { label: "간편식" },
        ]}
      />
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))] text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            {t("navigation.products.convenience", "간편식 제품")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            외식업체와 가정용 간편식 솔루션
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[var(--site-chrome-header-bg,#F4F2E5)] py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <ProductGrid selectedCategory="convenience" searchQuery="" />
        </div>
      </section>
    </div>
  );
}
