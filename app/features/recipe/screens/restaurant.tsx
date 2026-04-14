import { useTranslation } from "react-i18next";
import { RecipeGrid } from "../components/recipe-grid";
import { Breadcrumb } from "~/core/components/breadcrumb";

export default function RestaurantRecipesScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--site-chrome-header-bg,#F4F2E5)]">
      <Breadcrumb
        items={[
          { label: "레시피", href: "/recipe/main" },
          { label: "외식업체 솔루션" },
        ]}
      />
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))] text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            외식업체 솔루션
          </h1>
          <p className="text-pretty text-xl opacity-90">
            대량 조리를 위한 효율적인 레시피
          </p>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="bg-[var(--site-chrome-header-bg,#F4F2E5)] py-12">
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <RecipeGrid selectedCategory="restaurant" selectedDifficulty="all" searchQuery="" />
        </div>
      </section>
    </div>
  );
}

