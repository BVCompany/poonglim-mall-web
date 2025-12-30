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
    
    // Brand Routes (브랜드)
    ...prefix("/brand", [
      route("/intro", "features/brand/screens/intro.tsx"),
      route("/history", "features/brand/screens/history.tsx"),
      route("/certifications", "features/brand/screens/certifications.tsx"),
      route("/factory-tour", "features/brand/screens/factory-tour.tsx"),
    ]),
    
    // Products Routes (제품)
    ...prefix("/products", [
      route("/all", "features/products/screens/all.tsx"),
      route("/liquid-eggs", "features/products/screens/liquid-eggs.tsx"),
      route("/puddings", "features/products/screens/puddings.tsx"),
      route("/convenience", "features/products/screens/convenience.tsx"),
    ]),
    
    // Recipe Routes (레시피)
    ...prefix("/recipe", [
      route("/main", "features/recipe/screens/main.tsx"),
      route("/easy", "features/recipe/screens/easy.tsx"),
      route("/dessert", "features/recipe/screens/dessert.tsx"),
      route("/restaurant", "features/recipe/screens/restaurant.tsx"),
      route("/:id", "features/recipe/screens/detail.tsx"),
    ]),
    
    // Event Route (이벤트)
    route("/event", "features/event/screens/event.tsx"),
    
    // Inquiry Routes (구매문의)
    ...prefix("/inquiry", [
      route("/online", "features/inquiry/screens/online.tsx"),
      route("/bulk", "features/inquiry/screens/bulk.tsx"),
    ]),
    
    // Customer Support Route (고객지원)
    route("/support", "features/support/screens/support.tsx"),
    
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
] satisfies RouteConfig;
