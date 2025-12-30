/**
 * Home Page Component
 * 
 * Main landing page with multiple sections showcasing Poonglim Food's brand,
 * products, recipes, and social media presence.
 */

import type { Route } from "./+types/home";

import i18next from "~/core/lib/i18next.server";
import { HeroSection } from "../components/hero-section";
import { BrandPhilosophy } from "../components/brand-philosophy";
import { FeaturedProducts } from "../components/featured-products";
import { RecipeTeaser } from "../components/recipe-teaser";
import { InstagramFeed } from "../components/instagram-feed";
import { EventBanner } from "../components/event-banner";

/**
 * Meta function for setting page metadata
 */
export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
  ];
};

/**
 * Loader function for server-side data fetching
 */
export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  
  return {
    title: t("home.title"),
    subtitle: t("home.hero.subtitle1") + " " + t("home.hero.subtitle2"),
  };
}

/**
 * Home page component with all main sections
 */
export default function Home() {
  return (
    <>
      {/* Hero Section - 히어로 섹션 */}
      <HeroSection />
      
      {/* Brand Philosophy - 풍림푸드의 가치 */}
      <BrandPhilosophy />
      
      {/* Featured Products - 대표 제품 */}
      <FeaturedProducts />
      
      {/* Recipe Teaser - 활용법 & 레시피 */}
      <RecipeTeaser />
      
      {/* Instagram Feed - 인스타그램 피드 */}
      <InstagramFeed />
      
      {/* Event Banner - 특별한 이벤트와 소식 */}
      <EventBanner />
    </>
  );
}
