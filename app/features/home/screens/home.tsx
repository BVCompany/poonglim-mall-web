import type { Route } from "./+types/home";

import i18next from "~/core/lib/i18next.server";
import { BrandPhilosophy } from "../components/brand-philosophy";
import { CompanyIntro } from "../components/company-intro";
import { FeaturedProducts } from "../components/featured-products";
import { HeroSection } from "../components/hero-section";
import { HomePromoPopup } from "../components/home-promo-popup";
import { InstagramFeed } from "../components/instagram-feed";
import { NewsFeed } from "../components/news-feed";
import {
  getActiveBanners,
  getActiveInstagramPosts,
  getActivePopups,
} from "../lib/queries.server";
import { getFeaturedProducts } from "~/features/products/lib/queries.server";
import { normalizeContentLocale } from "~/core/db/content-locale.server";
import { getRecentNews } from "~/features/media/lib/queries.server";
import { getCompanyIntroSettings } from "~/features/site-settings/lib/queries.server";

export const meta: Route.MetaFunction = ({ data }) => {
  return [
    { title: data?.title },
    { name: "description", content: data?.subtitle },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const contentLocale = normalizeContentLocale(await i18next.getLocale(request));

  // DB 데이터 병렬 조회 (실패 시 폴백)
  const [banners, popups, featuredProducts, recentNews, companyIntro, instagramPosts] = await Promise.all([
    getActiveBanners().catch((e) => { console.error("[home] 배너 조회 실패:", e); return []; }),
    getActivePopups().catch((e) => { console.error("[home] 팝업 조회 실패:", e); return []; }),
    getFeaturedProducts(10, contentLocale).catch(() => []),
    getRecentNews(5, contentLocale).catch(() => []),
    getCompanyIntroSettings().catch(() => ({ image: null, title: null, link: null })),
    getActiveInstagramPosts().catch((e) => { console.error("[home] 인스타 조회 실패:", e); return []; }),
  ]);

  return {
    title: t("home.metaTitle"),
    subtitle: t("home.hero.subtitle1") + " " + t("home.hero.subtitle2"),
    banners,
    popups,
    featuredProducts,
    recentNews,
    companyIntro,
    instagramPosts,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    banners,
    popups,
    featuredProducts,
    recentNews,
    companyIntro,
    instagramPosts,
  } = loaderData;

  return (
    <>
      <HomePromoPopup popups={popups} />
      {/* 1. Hero Section - 풀스크린 슬라이더 */}
      <HeroSection banners={banners} />

      {/* 2. Brand Philosophy - "Enrich Your Day with Good Food." */}
      <BrandPhilosophy />

      {/* 3. Featured Products - 대표 제품 가로 스크롤 */}
      <FeaturedProducts dbProducts={featuredProducts} />

      {/* 4. Company Intro - 회사 소개 풀와이드 영상/이미지 */}
      <CompanyIntro
        image={companyIntro.image}
        title={companyIntro.title}
        link={companyIntro.link}
      />

      {/* 6. Instagram Feed - 인스타그램 피드 */}
      <InstagramFeed posts={instagramPosts} />

      {/* 7. News Feed - 뉴스/보도자료 슬라이더 */}
      <NewsFeed dbNews={recentNews} />
    </>
  );
}
