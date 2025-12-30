import { ChefHat, Coffee, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";

export function RecipeTeaser() {
  const { t } = useTranslation();

  const recipeCategories = [
    {
      icon: ChefHat,
      title: t("home.recipes.home.title"),
      description: t("home.recipes.home.description"),
      image:
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop",
    },
    {
      icon: Coffee,
      title: t("home.recipes.cafe.title"),
      description: t("home.recipes.cafe.description"),
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
    },
    {
      icon: Utensils,
      title: t("home.recipes.restaurant.title"),
      description: t("home.recipes.restaurant.description"),
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
    },
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            {t("home.recipes.title")}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            {t("home.recipes.subtitle1")}
            <br className="md:hidden" /> {t("home.recipes.subtitle2")}
          </p>
        </div>

        <div className="relative mb-12">
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:gap-8 md:overflow-visible scrollbar-hide -mr-6 md:mr-0">
            {recipeCategories.map((category, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-shadow overflow-hidden flex-shrink-0 w-[80vw] md:w-auto snap-center p-0"
              >
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 left-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md font-bold text-lg text-primary">
                      {index + 1}
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-pretty">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/recipe/easy" viewTransition>
              {t("home.recipes.viewMore")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

