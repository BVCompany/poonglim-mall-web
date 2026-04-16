import { useTranslation } from "react-i18next";
import { RecipeGrid } from "../components/recipe-grid";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";

export default function RestaurantRecipesScreen() {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        SECTION_VIEWPORT_BLEED,
        "min-h-screen min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)]",
      )}
    >
      <Breadcrumb
        items={[
          { label: "레시피", href: "/recipe/main" },
          { label: "외식업체 솔루션" },
        ]}
      />
      {/* Hero Section */}
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "min-w-0 bg-primary py-16 text-primary-foreground",
        )}
      >
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
      <section
        className={cn(
          SECTION_VIEWPORT_BLEED,
          "min-w-0 bg-[var(--site-chrome-header-bg,#FDFDF5)] py-12",
        )}
      >
        <div className="mx-auto w-full max-w-7xl px-6 md:max-w-[min(1280px,calc(1280*100vw/1920))]">
          <RecipeGrid selectedCategory="restaurant" selectedDifficulty="all" searchQuery="" />
        </div>
      </section>
    </div>
  );
}

