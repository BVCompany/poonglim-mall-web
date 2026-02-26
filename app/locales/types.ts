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
    eventBanner: {
      title1: string;
      title2: string;
      event1: string;
      event2: string;
      event3: string;
      viewEvents: string;
      findPopup: string;
      altText: string;
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
  admin: {
    login: {
      title: string;
      subtitle: string;
      email: string;
      password: string;
      rememberMe: string;
      loginButton: string;
      loggingIn: string;
      testAccount: string;
      errors: {
        required: string;
        invalid: string;
      };
    };
    sidebar: {
      title: string;
      dashboard: string;
      products: string;
      posts: string;
      careers: string;
      inquiries: string;
      settings: string;
      logout: string;
      menu: {
        eventsNotices: string;
        recipes: string;
        positions: string;
        applicants: string;
        consulting: string;
        tour: string;
        banners: string;
        popups: string;
        admins: string;
      };
    };
    dashboard: {
      title: string;
      subtitle: string;
      viewWebsite: string;
      stats: {
        unansweredInquiries: string;
        recentTime: string;
        urgentApproval: string;
        approvalNeeded: string;
        newApplicants: string;
        reviewNeeded: string;
      };
      analytics: {
        title: string;
        description: string;
        openAnalytics: string;
      };
      recentActivities: {
        title: string;
        subtitle: string;
      };
      recentInquiries: {
        title: string;
        subtitle: string;
        viewAll: string;
      };
      status: {
        urgent: string;
        processing: string;
        assigned: string;
      };
    };
    products: {
      title: string;
      subtitle: string;
      addProduct: string;
      searchPlaceholder: string;
      noResults: string;
      totalProducts: string;
      edit: string;
      delete: string;
      badges: {
        best: string;
        new: string;
        sale: string;
        recommended: string;
      };
    };
    events: {
      title: string;
      subtitle: string;
      addEvent: string;
      searchPlaceholder: string;
      noResults: string;
      totalEvents: string;
      edit: string;
      delete: string;
      startDate: string;
      endDate: string;
      badges: {
        hot: string;
        new: string;
        endingSoon: string;
        important: string;
      };
    };
    recipes: {
      title: string;
      subtitle: string;
      addRecipe: string;
      searchPlaceholder: string;
      noResults: string;
      totalRecipes: string;
      edit: string;
      delete: string;
      cookingTime: string;
      servings: string;
      categories: {
        home: string;
        cafe: string;
        restaurant: string;
      };
      difficulty: {
        easy: string;
        medium: string;
        hard: string;
      };
    };
    careers: {
      title: string;
      description: string;
      addJob: string;
      searchPlaceholder: string;
      noResults: string;
      noSearchResults: string;
      noJobPostings: string;
      deadline: string;
    };
    applications: {
      title: string;
      description: string;
      searchPlaceholder: string;
      noResults: string;
      noSearchResults: string;
      noApplications: string;
      stats: {
        total: string;
        reviewing: string;
        accepted: string;
        rejected: string;
      };
      table: {
        date: string;
        name: string;
        position: string;
        experience: string;
        education: string;
        status: string;
        actions: string;
      };
    };
  };
};
