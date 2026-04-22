import type { TFunction } from "i18next";

/** 식품안전나라 계란 위해정보 */
export const EGG_SAFETY_KOREA_URL =
  "https://www.foodsafetykorea.go.kr/portal/fooddanger/eggHazardList.do?menu_grp=MENU_NEW02&menu_no=3497";

export type MegaSectionId = "company" | "products" | "promo" | "support";

export type MegaNavLink = {
  name: string;
  href: string;
  external?: boolean;
};

export type MegaNavSection = {
  id: MegaSectionId;
  title: string;
  links: MegaNavLink[];
};

export function getMegaNavSections(t: TFunction): MegaNavSection[] {
  return [
    {
      id: "company",
      title: t("navigation.mega.company"),
      links: [
        { name: t("navigation.brand.intro"), href: "/brand/intro" },
        { name: t("navigation.brand.history"), href: "/brand/history" },
        {
          name: t("navigation.brand.certifications"),
          href: "/brand/certifications",
        },
        { name: t("navigation.careers.title"), href: "/careers/positions" },
        { name: t("navigation.brand.location"), href: "/brand/location" },
      ],
    },
    {
      id: "products",
      title: t("navigation.mega.products"),
      links: [
        { name: t("navigation.links.eggStory"), href: "/products/egg-story" },
        {
          name: t("navigation.links.productBrowse"),
          href: "/products/all",
        },
        { name: t("navigation.recipe.title"), href: "/recipe/main" },
      ],
    },
    {
      id: "promo",
      title: t("navigation.mega.promo"),
      links: [
        {
          name: t("navigation.links.pressReleases"),
          href: "/media/news",
        },
        { name: t("navigation.event.title"), href: "/event" },
        {
          name: t("navigation.brand.factoryTour"),
          href: "/brand/factory-tour",
        },
      ],
    },
    {
      id: "support",
      title: t("navigation.mega.support"),
      links: [
        { name: t("navigation.links.notice"), href: "/support/notice" },
        { name: t("navigation.links.resources"), href: "/support/resources" },
        {
          name: t("navigation.links.eggSafety"),
          href: EGG_SAFETY_KOREA_URL,
          external: true,
        },
        {
          name: t("navigation.links.gradeCertificate"),
          href: "/support/grade-certificate",
        },
        { name: t("navigation.links.faq"), href: "/support/faq" },
        { name: t("navigation.links.contact"), href: "/support/contact" },
      ],
    },
  ];
}

export function isMegaSectionActive(
  id: MegaSectionId,
  pathname: string,
): boolean {
  if (id === "company") {
    if (pathname.includes("/factory-tour")) return false;
    return pathname.startsWith("/brand/") || pathname.startsWith("/careers");
  }
  if (id === "products") {
    return pathname.startsWith("/products") || pathname.startsWith("/recipe");
  }
  if (id === "promo") {
    return (
      pathname.startsWith("/media") ||
      pathname.startsWith("/event") ||
      pathname.includes("/factory-tour")
    );
  }
  if (id === "support") {
    return pathname.startsWith("/support");
  }
  return false;
}
