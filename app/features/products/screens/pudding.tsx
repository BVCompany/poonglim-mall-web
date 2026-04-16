import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";
import { useTranslation } from "react-i18next";
import { ProductGrid } from "../components/product-grid";

export default function PuddingScreen() {
  const { t } = useTranslation();

  return (
    <div className={cn(SECTION_VIEWPORT_BLEED, "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]")}>
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            {t("navigation.products.pudding", "푸딩 시리즈")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            부드럽고 진한 맛의 프리미엄 푸딩 제품
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[var(--site-chrome-header-bg,#FDFDF5)] py-12">
        <div className="mx-auto max-w-7xl px-6">
          <ProductGrid selectedCategory="puddings" searchQuery="" />
        </div>
      </section>
    </div>
  );
}

