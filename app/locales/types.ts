export type Translation = {
  home: {
    title: string;
    subtitle: string;
    hero: {
      title1: string;
      title2: string;
      subtitle1: string;
      subtitle2: string;
      exploreProducts: string;
      aboutUs: string;
      altText: string;
    };
    values: {
      title: string;
      subtitle1: string;
      subtitle2: string;
      health: { title: string; description: string };
      trust: { title: string; description: string };
      esg: { title: string; description: string };
      innovation: { title: string; description: string };
    };
    featuredProducts: {
      title: string;
      subtitle1: string;
      subtitle2: string;
      viewAll: string;
      learnMore: string;
      product1: { name: string; category: string; description: string };
      product2: { name: string; category: string; description: string };
      product3: { name: string; category: string; description: string };
    };
    recipes: {
      title: string;
      subtitle1: string;
      subtitle2: string;
      viewMore: string;
      home: { title: string; description: string };
      cafe: { title: string; description: string };
      restaurant: { title: string; description: string };
    };
    instagram: {
      title: string;
      subtitle1: string;
      subtitle2: string;
      follow: string;
    };
    news: {
      title: string;
      subtitle1: string;
      subtitle2: string;
      viewAll: string;
    };
  };
  navigation: {
    en: string;
    kr: string;
    es: string;
    mall: string;
    brand: {
      title: string;
      intro: string;
      history: string;
      certifications: string;
      factoryTour: string;
    };
    products: {
      title: string;
      all: string;
      liquidEggs: string;
      puddings: string;
      convenience: string;
    };
    recipe: {
      title: string;
      all: string;
      home: string;
      cafe: string;
      restaurant: string;
    };
    event: {
      title: string;
    };
    inquiry: {
      title: string;
      general: string;
      b2b: string;
    };
    support: {
      title: string;
    };
    careers: {
      title: string;
      positions: string;
      benefits: string;
      talent: string;
    };
  };
};
