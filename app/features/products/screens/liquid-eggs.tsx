import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";

export default function LiquidEggsScreen() {
  const { t } = useTranslation();

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      <Breadcrumb
        items={[
          { label: "제품소개", href: "/products/all" },
          { label: "액란가공품" },
        ]}
      />
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))] text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            {t("navigation.products.liquidEggs", "액란 제품")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            신선하고 안전한 액상 계란 제품 라인업
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[var(--site-chrome-header-bg,#FDFDF5)] py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <ProductGrid selectedCategory="liquid-eggs" searchQuery="" />
        </div>
      </section>
    </div>
  );
}
