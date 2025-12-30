import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "~/core/components/ui/button";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1920&h=1080&fit=crop"
          alt={t("home.hero.altText")}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-screen-xl mx-auto px-6 w-full">
        <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight md:leading-tight">
          {t("home.hero.title1")}
          <br className="md:hidden" /> {t("home.hero.title2")}
        </h1>
        <p className="text-lg md:text-2xl mb-8 text-pretty opacity-90 leading-relaxed">
          {t("home.hero.subtitle1")}
          <br className="md:hidden" /> {t("home.hero.subtitle2")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-lg px-8 py-6">
            <Link to="/products/all" viewTransition>
              {t("home.hero.exploreProducts")}
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Link to="/brand/intro" viewTransition>
              {t("home.hero.aboutUs")}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

