import { useTranslation } from "react-i18next";
import { RecipeGrid } from "../components/recipe-grid";
import { Breadcrumb } from "~/core/components/breadcrumb";
import { SECTION_VIEWPORT_BLEED } from "~/core/lib/section-viewport-bleed";
import { cn } from "~/core/lib/utils";

export default function HomeRecipesScreen() {
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
          { label: t("navigation.recipe.title"), href: "/recipe/main" },
          { label: t("pages.recipes.sub.home.breadcrumbCurrent") },
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
            {t("pages.recipes.sub.home.heroTitle")}
          </h1>
          <p className="text-pretty text-xl opacity-90">
            {t("pages.recipes.sub.home.heroSubtitle")}
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
          <RecipeGrid selectedCategory="home" selectedDifficulty="all" searchQuery="" />
        </div>
      </section>
    </div>
  );
}
