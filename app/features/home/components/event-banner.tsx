import { Calendar, MapPin, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { Button } from "~/core/components/ui/button";

export function EventBanner() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-balance">
              {t("home.eventBanner.title1")}
              <br className="md:hidden" /> {t("home.eventBanner.title2")}
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6" />
                <span className="text-lg">{t("home.eventBanner.event1")}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                <span className="text-lg">{t("home.eventBanner.event2")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <span className="text-lg">{t("home.eventBanner.event3")}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/event" viewTransition>
                  {t("home.eventBanner.viewEvents")}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Link to="/event" viewTransition>
                  {t("home.eventBanner.findPopup")}
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop"
              alt={t("home.eventBanner.altText")}
              className="w-full h-48 md:h-80 object-cover rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

