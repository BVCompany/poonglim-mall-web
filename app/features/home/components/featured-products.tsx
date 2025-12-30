import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent } from "~/core/components/ui/card";

export function FeaturedProducts() {
  const { t } = useTranslation();

  const products = [
    {
      id: 1,
      name: t("home.featuredProducts.product1.name"),
      category: t("home.featuredProducts.product1.category"),
      description: t("home.featuredProducts.product1.description"),
      image: "/home/premium_egg.png",
      badge: "NEW",
    },
    {
      id: 2,
      name: t("home.featuredProducts.product2.name"),
      category: t("home.featuredProducts.product2.category"),
      description: t("home.featuredProducts.product2.description"),
      image: "/home/puding.png",
      badge: "BEST",
    },
    {
      id: 3,
      name: t("home.featuredProducts.product3.name"),
      category: t("home.featuredProducts.product3.category"),
      description: t("home.featuredProducts.product3.description"),
      image: "/home/solution.png",
      badge: "B2B",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            {t("home.featuredProducts.title")}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            {t("home.featuredProducts.subtitle1")}
            <br className="md:hidden" />{" "}
            {t("home.featuredProducts.subtitle2")}
          </p>
        </div>

        <div className="relative mb-12">
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible scrollbar-hide -mr-6 md:mr-0">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-shadow overflow-hidden flex-shrink-0 w-[80vw] md:w-auto snap-center p-0"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        product.badge === "NEW"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : product.badge === "BEST"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
                      }`}
                    >
                      {product.badge}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.category}
                  </p>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-pretty">
                    {product.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  >
                    {t("home.featuredProducts.learnMore")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/products/all" viewTransition>
              {t("home.featuredProducts.viewAll")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

