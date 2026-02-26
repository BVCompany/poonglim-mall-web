import type { Route } from "./+types/home";

import i18next from "~/core/lib/i18next.server";
import { BrandPhilosophy } from "../components/brand-philosophy";
import { CompanyIntro } from "../components/company-intro";
import { FeaturedProducts } from "../components/featured-products";
import { HeroSection } from "../components/hero-section";
import { InstagramFeed } from "../components/instagram-feed";
import { NewsFeed } from "../components/news-feed";
export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);

  return {
    title: t("home.title"),
    subtitle: t("home.hero.subtitle1") + " " + t("home.hero.subtitle2"),
  };
}

export default function Home() {
  return (
    <>
      {/* 1. Hero Section - 풀스크린 슬라이더 */}
      <HeroSection />

      {/* 2. Brand Philosophy - "Enrich Your Day with Good Food." */}
      <BrandPhilosophy />

      {/* 3. Featured Products - 대표 제품 가로 스크롤 */}
      <FeaturedProducts />

      {/* 4. Company Intro - 회사 소개 풀와이드 영상/이미지 */}
      <CompanyIntro />

      {/* 6. Instagram Feed - 인스타그램 피드 */}
      <InstagramFeed />

      {/* 7. News Feed - 뉴스/보도자료 슬라이더 */}
      <NewsFeed />
    </>
  );
}
