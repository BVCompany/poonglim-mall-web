import { Shield, Heart, Leaf, Award } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BrandPhilosophy() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t("home.values.health.title"),
      description: t("home.values.health.description"),
    },
    {
      icon: Shield,
      title: t("home.values.trust.title"),
      description: t("home.values.trust.description"),
    },
    {
      icon: Leaf,
      title: t("home.values.esg.title"),
      description: t("home.values.esg.description"),
    },
    {
      icon: Award,
      title: t("home.values.innovation.title"),
      description: t("home.values.innovation.description"),
    },
  ];

  return (
    <section className="py-24 bg-muted">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
            {t("home.values.title")}
          </h2>
          <p className="text-xl text-muted-foreground text-pretty">
            {t("home.values.subtitle1")}
            <br className="md:hidden" /> {t("home.values.subtitle2")}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center group">
              <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <value.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-base md:text-xl font-semibold mb-2 md:mb-3 text-foreground">
                {value.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground text-pretty">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

