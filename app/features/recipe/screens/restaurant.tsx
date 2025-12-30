import { useTranslation } from "react-i18next";
import { RecipeGrid } from "../components/recipe-grid";

export default function RestaurantRecipesScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            외식업체 솔루션
          </h1>
          <p className="text-pretty text-xl opacity-90">
            대량 조리를 위한 효율적인 레시피
          </p>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <RecipeGrid selectedCategory="restaurant" selectedDifficulty="all" searchQuery="" />
        </div>
      </section>
    </div>
  );
}

