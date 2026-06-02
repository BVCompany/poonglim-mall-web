/**
 * Application Routes Configuration
 *
 * This file defines all routes for the application using React Router's
 * file-based routing system. Routes are organized by feature and access level.
 *
 * The structure uses layouts for shared UI elements and prefixes for route grouping.
 * This approach creates a hierarchical routing system that's both maintainable and scalable.
 */
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  route("/robots.txt", "core/screens/robots.ts"),
  route("/sitemap.xml", "core/screens/sitemap.ts"),
  ...prefix("/debug", [
    // You should delete this in production.
    route("/sentry", "debug/sentry.tsx"),
    route("/analytics", "debug/analytics.tsx"),
  ]),
  // API Routes. Routes that export actions and loaders but no UI.
  ...prefix("/api", [
    ...prefix("/settings", [
      route("/theme", "features/settings/api/set-theme.tsx"),
      route("/locale", "features/settings/api/set-locale.tsx"),
    ]),
    // ⚠️ Supabase 필요 - 향후 DB 작업 시 활성화
    // ...prefix("/users", [
    //   index("features/users/api/delete-account.tsx"),
    //   route("/password", "features/users/api/change-password.tsx"),
    //   route("/email", "features/users/api/change-email.tsx"),
    //   route("/profile", "features/users/api/edit-profile.tsx"),
    //   route("/providers", "features/users/api/connect-provider.tsx"),
    //   route(
    //     "/providers/:provider",
    //     "features/users/api/disconnect-provider.tsx",
    //   ),
    // ]),
    // ...prefix("/cron", [route("/mailer", "features/cron/api/mailer.tsx")]),
    ...prefix("/blog", [route("/og", "features/blog/api/og.tsx")]),
  ]),

  layout("core/layouts/navigation.layout.tsx", [
    // ⚠️ Supabase 필요 - 향후 DB 작업 시 활성화
    // route("/auth/confirm", "features/auth/screens/confirm.tsx"),
    index("features/home/screens/home.tsx"),
    route("/error", "core/screens/error.tsx"),
    // ⚠️ 인증 관련 라우트 - 향후 DB 작업 시 활성화
    // layout("core/layouts/public.layout.tsx", [
    //   // Routes that should only be visible to unauthenticated users.
    //   route("/login", "features/auth/screens/login.tsx"),
    //   route("/join", "features/auth/screens/join.tsx"),
    //   ...prefix("/auth", [
    //     route("/api/resend", "features/auth/api/resend.tsx"),
    //     route(
    //       "/forgot-password/reset",
    //       "features/auth/screens/forgot-password.tsx",
    //     ),
    //     route("/magic-link", "features/auth/screens/magic-link.tsx"),
    //     ...prefix("/otp", [
    //       route("/start", "features/auth/screens/otp/start.tsx"),
    //       route("/complete", "features/auth/screens/otp/complete.tsx"),
    //     ]),
    //     ...prefix("/social", [
    //       route("/start/:provider", "features/auth/screens/social/start.tsx"),
    //       route(
    //         "/complete/:provider",
    //         "features/auth/screens/social/complete.tsx",
    //       ),
    //     ]),
    //   ]),
    // ]),
    // layout("core/layouts/private.layout.tsx", { id: "private-auth" }, [
    //   ...prefix("/auth", [
    //     route(
    //       "/forgot-password/create",
    //       "features/auth/screens/new-password.tsx",
    //     ),
    //     route("/email-verified", "features/auth/screens/email-verified.tsx"),
    //   ]),
    //   // Routes that should only be visible to authenticated users.
    //   route("/logout", "features/auth/screens/logout.tsx"),
    // ]),
    route("/contact", "features/contact/screens/contact-us.tsx"),

    // Brand Routes (브랜드/회사소개)
    ...prefix("/brand", [
      route("/intro", "features/brand/screens/intro.tsx"),
      route("/history", "features/brand/screens/history.tsx"),
      route("/certifications", "features/brand/screens/certifications.tsx"),
      route("/factory-tour", "features/brand/screens/factory-tour.tsx"),
      route("/location", "features/brand/screens/location.tsx"),
    ]),

    // Products Routes (제품소개)
    ...prefix("/products", [
      route("/egg-story", "features/products/screens/egg-story.tsx"),
      route("/all", "features/products/screens/all.tsx"),
      route("/liquid-eggs", "features/products/screens/liquid-eggs.tsx"),
      route("/puddings", "features/products/screens/puddings.tsx"),
      route("/convenience", "features/products/screens/convenience.tsx"),
      route("/:id", "features/products/screens/detail.tsx"),
    ]),

    // Recipe Routes (레시피)
    ...prefix("/recipe", [
      route("/main", "features/recipe/screens/main.tsx"),
      route("/easy", "features/recipe/screens/easy.tsx"),
      route("/dessert", "features/recipe/screens/dessert.tsx"),
      route("/restaurant", "features/recipe/screens/restaurant.tsx"),
      route("/:id", "features/recipe/screens/detail.tsx"),
    ]),

    // Search Route (전체 검색)
    route("/search", "features/search/screens/search.tsx"),

    // Media Routes (홍보센터)
    route("/media/news", "features/media/screens/news.tsx"),
    route("/media/news/:newsId", "features/media/screens/news-detail.tsx"),

    // Event Routes (이벤트)
    route("/event", "features/event/screens/event.tsx"),
    route("/event/:id", "features/event/screens/detail.tsx"),

    // Inquiry Routes (구매문의)
    ...prefix("/inquiry", [
      route("/online", "features/inquiry/screens/online.tsx"),
      route("/bulk", "features/inquiry/screens/bulk.tsx"),
    ]),

    // Customer Support Routes (고객지원)
    route("/support", "features/support/screens/support.tsx"),
    ...prefix("/support", [
      route("/notice", "features/support/screens/notice.tsx"),
      route("/notice/:id", "features/support/screens/notice-detail.tsx"),
      route("/resources", "features/support/screens/resources.tsx"),
      route("/resources/:id", "features/support/screens/resources-detail.tsx"),
      route("/safety-test", "features/support/screens/safety-test.tsx"),
      route(
        "/grade-certificate",
        "features/support/screens/grade-certificate.tsx",
      ),
      route(
        "/grade-certificate/:id",
        "features/support/screens/grade-certificate-detail.tsx",
      ),
      route("/faq", "features/support/screens/faq.tsx"),
      route("/contact", "features/support/screens/contact.tsx"),
    ]),

    // Careers Routes (채용)
    ...prefix("/careers", [
      route("/positions", "features/careers/screens/positions.tsx"),
      route("/talent", "features/careers/screens/talent.tsx"),
      route("/benefits", "features/careers/screens/benefits.tsx"),
      route("/:id/apply", "features/careers/screens/apply.tsx"),
      route("/:id", "features/careers/screens/detail.tsx"),
    ]),

    // ⚠️ 결제 관련 라우트 - 향후 DB 작업 시 활성화
    // ...prefix("/payments", [
    //   route("/checkout", "features/payments/screens/checkout.tsx"),
    //   layout("core/layouts/private.layout.tsx", { id: "private-payments" }, [
    //     route("/success", "features/payments/screens/success.tsx"),
    //     route("/failure", "features/payments/screens/failure.tsx"),
    //   ]),
    // ]),
  ]),

  // ⚠️ 사용자 대시보드 - 향후 DB 작업 시 활성화
  // layout("core/layouts/private.layout.tsx", { id: "private-dashboard" }, [
  //   layout("features/users/layouts/dashboard.layout.tsx", [
  //     ...prefix("/dashboard", [
  //       index("features/users/screens/dashboard.tsx"),
  //       route("/payments", "features/payments/screens/payments.tsx"),
  //     ]),
  //     route("/account/edit", "features/users/screens/account.tsx"),
  //   ]),
  // ]),

  ...prefix("/legal", [route("/:slug", "features/legal/screens/policy.tsx")]),
  layout("features/blog/layouts/blog.layout.tsx", [
    ...prefix("/blog", [
      index("features/blog/screens/posts.tsx"),
      route("/:slug", "features/blog/screens/post.tsx"),
    ]),
  ]),

  // Admin Routes (관리자)
  ...prefix("/admin", [
    index("features/admin/screens/index.tsx"),
    route("/login", "features/admin/screens/login.tsx"),
    route("/logout", "features/admin/screens/logout.tsx"),
    route("/dashboard", "features/admin/screens/dashboard.tsx"),
    // 파일 업로드 API - /admin 경로 아래에 두어야 세션 쿠키(path:"/admin")가 전달됨
    route("/api/upload", "features/upload/api/upload.tsx"),
    route("/products", "features/admin/screens/products.tsx"),
    route(
      "/product-categories",
      "features/admin/screens/product-categories.tsx",
    ),
    route("/notices", "features/admin/screens/notices.tsx"),
    route(
      "/grade-certificates",
      "features/admin/screens/grade-certificates.tsx",
    ),
    route("/certifications", "features/admin/screens/certifications.tsx"),
    route("/faqs", "features/admin/screens/faqs.tsx"),
    route("/events", "features/admin/screens/events.tsx"),
    route("/recipes", "features/admin/screens/recipes.tsx"),
    route("/recipe-categories", "features/admin/screens/recipe-categories.tsx"),
    route("/careers", "features/admin/screens/careers.tsx"),
    route("/applications", "features/admin/screens/applications.tsx"),
    ...prefix("/inquiries", [
      route("/consulting", "features/admin/screens/inquiries-consulting.tsx"),
      route("/tour", "features/admin/screens/inquiries-factory-tours.tsx"),
    ]),
    ...prefix("/settings", [
      route("/banners", "features/admin/screens/settings-banners.tsx"),
      route(
        "/page-banners",
        "features/admin/screens/settings-page-banners.tsx",
      ),
      route("/popups", "features/admin/screens/settings-popups.tsx"),
      route("/instagram", "features/admin/screens/settings-instagram.tsx"),
      route("/admins", "features/admin/screens/settings-admins.tsx"),
      route("/site", "features/admin/screens/settings-site.tsx"),
      route("/seo", "features/admin/screens/settings-seo.tsx"),
    ]),
    ...prefix("/media", [
      route("/news", "features/admin/screens/media-news.tsx"),
      route("/catalog", "features/admin/screens/media-catalog.tsx"),
    ]),
    ...prefix("/support", [
      route("/resources", "features/admin/screens/support-resources.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
