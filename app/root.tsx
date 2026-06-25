/**
 * Root Application Component
 *
 * This is the top-level component of the application that sets up:
 * - Theme management with dark/light mode support
 * - Internationalization (i18n) configuration
 * - Global UI components like dialogs and sheets
 * - Error boundaries and 404 handling
 * - Analytics integrations (Google Tag Manager)
 * - Customer support integration (Channel.io)
 * - Progress indicators for navigation
 */
import "./app.css";

import type { Route } from "./+types/root";

import * as Sentry from "@sentry/react-router";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css?url";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
  useNavigate,
  useNavigation,
  useRouteLoaderData,
  useSearchParams,
} from "react-router";
import { useChangeLanguage } from "remix-i18next/react";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { Toaster } from "sonner";

import { Dialog } from "./core/components/ui/dialog";
import { Sheet } from "./core/components/ui/sheet";
import i18next from "./core/lib/i18next.server";
import { themeSessionResolver } from "./core/lib/theme-session.server";
import { cn } from "./core/lib/utils";
import { resolveOgImageUrl } from "./core/lib/seo.server";
import NotFound from "./core/screens/404";
import { getAllSettings } from "./features/site-settings/lib/queries.server";
import { SETTING_KEYS } from "./features/site-settings/schema";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.png", type: "image/png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://hangeul.pstatic.net/hangeul_static/css/nanum-square-round.css",
  },
  { rel: "stylesheet", href: nProgressStyles },
];

/**
 * Root loader function
 *
 * This server-side function runs on every request and is responsible for:
 * 1. Validating that all required environment variables are present
 * 2. Loading the user's theme preference from the session
 * 3. Detecting the user's preferred locale
 *
 * The data returned from this loader is available throughout the application
 * via the useRouteLoaderData hook with the 'root' ID.
 *
 * @param request - The incoming HTTP request
 * @returns Object containing theme and locale preferences
 */
export async function loader({ request }: Route.LoaderArgs) {
  // NOTE: Supabase validation temporarily disabled for development
  // TODO: Re-enable when Supabase credentials are available
  // Validate that all required Supabase environment variables are present
  // This prevents the application from starting with incomplete configuration
  
  // TEMPORARILY COMMENTED OUT - Will be re-enabled when Supabase is configured
  /*
  if (
    !process.env.DATABASE_URL ||
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.DATABASE_URL === "" ||
    process.env.SUPABASE_URL === "" ||
    process.env.SUPABASE_ANON_KEY === "" ||
    process.env.SUPABASE_SERVICE_ROLE_KEY === ""
  ) {
    throw new Error("Missing Supabase environment variables");
  }
  */

  // Concurrently load theme, locale, and SEO settings
  const [{ getTheme }, locale, seoSettings] = await Promise.all([
    themeSessionResolver(request),
    i18next.getLocale(request),
    getAllSettings().catch(() => ({} as Record<string, string>)),
  ]);

  return {
    theme: getTheme(),
    locale,
    seo: {
      siteName:           seoSettings[SETTING_KEYS.SEO_SITE_NAME]           ?? "풍림푸드",
      description:        seoSettings[SETTING_KEYS.SEO_DESCRIPTION]         ?? "",
      ogImage:            resolveOgImageUrl(
        seoSettings[SETTING_KEYS.SEO_OG_IMAGE],
        seoSettings[SETTING_KEYS.SEO_SITE_URL],
        request,
      ),
      siteUrl:            seoSettings[SETTING_KEYS.SEO_SITE_URL]            ?? "",
      robots:             seoSettings[SETTING_KEYS.SEO_ROBOTS]              ?? "index,follow",
      googleVerification: seoSettings[SETTING_KEYS.SEO_GOOGLE_VERIFICATION] ?? "",
      naverVerification:  seoSettings[SETTING_KEYS.SEO_NAVER_VERIFICATION]  ?? "",
      gaId:               seoSettings[SETTING_KEYS.SEO_GA_ID]               ?? "",
      favicon:            seoSettings[SETTING_KEYS.FAVICON]                 ?? "",
      viewportContent:
        seoSettings[SETTING_KEYS.SEO_VIEWPORT_CONTENT]?.trim() ?? "",
      metaKeywords:       seoSettings[SETTING_KEYS.SEO_META_KEYWORDS]?.trim() ?? "",
      metaAuthor:         seoSettings[SETTING_KEYS.SEO_META_AUTHOR]?.trim() ?? "",
      httpEquivContentType:
        seoSettings[SETTING_KEYS.SEO_HTTP_EQUIV_CONTENT_TYPE]?.trim() ?? "",
    },
  };
}

/**
 * i18n handle for the root route
 * Specifies that this route uses the 'common' translation namespace
 */
export const handle = {
  i18n: "common",
};

/**
 * Primary Layout Component
 *
 * This component wraps the entire application with the ThemeProvider
 * to enable dark/light mode functionality. It retrieves theme preferences
 * from the root loader data and provides a theme switching API endpoint.
 *
 * @param children - Child components to render within the layout
 */
export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData("root");
  return (
    <ThemeProvider
      specifiedTheme={data?.theme ?? "light"}
      themeAction="/api/settings/theme" // API endpoint for changing theme
    >
      <InnerLayout>{children}</InnerLayout>
    </ThemeProvider>
  );
}

/** SEO / env — GA4 직연동(`G-…`) 또는 Tag Manager(`GTM-…`) 측정 ID */
function resolveGoogleTagId(seoGaId: string | undefined): string {
  return (seoGaId || import.meta.env.VITE_GOOGLE_TAG_ID || "").trim();
}

function isGtmContainerId(id: string): boolean {
  return /^GTM-[A-Z0-9]+$/i.test(id);
}

function isGa4MeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id);
}

/**
 * Inner Layout Component
 *
 * This component handles the HTML structure of the application and applies:
 * - Language direction (RTL/LTR) based on the current locale
 * - Theme class to the HTML element
 * - Special handling for pre-rendered routes (blog, legal pages)
 * - Loading of analytics and customer support scripts
 *
 * @param children - Child components to render within the layout
 */
function InnerLayout({ children }: { children: React.ReactNode }) {
  const [theme] = useTheme();
  const data = useRouteLoaderData<typeof loader>("root");
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const seo = data?.seo;
  const googleTagId = resolveGoogleTagId(seo?.gaId);
  const gtmActive = isGtmContainerId(googleTagId);
  const ga4DirectActive = isGa4MeasurementId(googleTagId);

  // Set the i18next language based on the locale from the loader
  useChangeLanguage(data?.locale ?? "en");

  // Detect if the current route is a pre-rendered page (blog or legal)
  // These pages require special theme handling
  const isPreRendered =
    pathname.includes("/legal") || pathname.includes("/blog");

  return (
    <html
      lang={data?.locale ?? "en"}
      className={cn(theme ?? "", "h-full")}
      dir={i18n.dir()}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content={
            seo?.viewportContent && seo.viewportContent.length > 0
              ? seo.viewportContent
              : "width=device-width, initial-scale=1"
          }
        />

        {seo?.httpEquivContentType && seo.httpEquivContentType.length > 0 ? (
          <meta httpEquiv="Content-Type" content={seo.httpEquivContentType} />
        ) : null}

        {seo?.metaKeywords && seo.metaKeywords.length > 0 ? (
          <meta name="keywords" content={seo.metaKeywords} />
        ) : null}

        {seo?.metaAuthor && seo.metaAuthor.length > 0 ? (
          <meta name="author" content={seo.metaAuthor} />
        ) : null}

        {/* SEO — robots */}
        {seo?.robots && <meta name="robots" content={seo.robots} />}

        {/* SEO — 기본 description (각 페이지의 meta가 없을 때 폴백) */}
        {seo?.description && <meta name="description" content={seo.description} />}

        {/* SEO — OG 기본값 */}
        {seo?.siteName   && <meta property="og:site_name" content={seo.siteName} />}
        {seo?.siteUrl    && <meta property="og:url"       content={seo.siteUrl} />}
        {seo?.ogImage    && <meta property="og:type"      content="website" />}
        {seo?.ogImage    && <meta property="og:image"     content={seo.ogImage} />}
        {seo?.ogImage    && <meta property="og:image:width"  content="1200" />}
        {seo?.ogImage    && <meta property="og:image:height" content="630" />}
        {seo?.siteName   && seo?.ogImage && (
          <meta property="og:image:alt" content={seo.siteName} />
        )}
        {seo?.ogImage    && <meta name="twitter:card"     content="summary_large_image" />}
        {seo?.ogImage    && <meta name="twitter:image"    content={seo.ogImage} />}

        {/* 검색엔진 인증 */}
        {seo?.googleVerification && (
          <meta name="google-site-verification" content={seo.googleVerification} />
        )}
        {seo?.naverVerification && (
          <meta name="naver-site-verification" content={seo.naverVerification} />
        )}

        <Meta />
        <Links />
        {/* 파비콘 — DB 업로드 값이 있으면 static보다 나중에 선언해 우선 적용 */}
        {seo?.favicon && (
          <link rel="icon" href={seo.favicon} />
        )}
        {isPreRendered ? (
          <script src="/scripts/prerendered-theme.js" />
        ) : (
          <PreventFlashOnWrongTheme ssrTheme={Boolean(data?.theme)} />
        )}
        {gtmActive ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagId}');`,
            }}
          />
        ) : null}
      </head>
      <body className="h-full">
        {gtmActive ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        {children}
        <Toaster richColors position="bottom-right" />
        <ScrollRestoration />
        <Scripts />
        {/* GA4 직삽입(gtag) — GTM 사용 시에는 태그 매니저 안에서만 GA4를 켜고 여기는 비워 두세요 */}
        {ga4DirectActive ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleTagId}');`,
              }}
            />
          </>
        ) : null}
        {import.meta.env.VITE_CHANNEL_PLUGIN_KEY &&
          import.meta.env.VITE_CHANNEL_PLUGIN_KEY !== "" && (
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){var w=window;if(w.ChannelIO){return w.console.error("ChannelIO script included twice.");}var ch=function(){ch.c(arguments);};ch.q=[];ch.c=function(args){ch.q.push(args);};w.ChannelIO=ch;function l(){if(w.ChannelIOInitialized){return;}w.ChannelIOInitialized=true;var s=document.createElement("script");s.type="text/javascript";s.async=true;s.src="https://cdn.channel.io/plugin/ch-plugin-web.js";var x=document.getElementsByTagName("script")[0];if(x.parentNode){x.parentNode.insertBefore(s,x);}}if(document.readyState==="complete"){l();}else{w.addEventListener("DOMContentLoaded",l);w.addEventListener("load",l);}})();
            ChannelIO('boot', {
              "pluginKey": "${import.meta.env.VITE_CHANNEL_PLUGIN_KEY}",
              "hideChannelButtonOnBoot": true
            });
`,
              }}
            ></script>
          )}
      </body>
    </html>
  );
}

/**
 * Main Application Component
 *
 * This is the primary component rendered by React Router.
 * It handles global UI elements, progress indicators, and navigation.
 *
 * Key responsibilities:
 * 1. Setting up progress indicators for navigation (NProgress)
 * 2. Handling Supabase authentication redirects
 * 3. Providing global UI context (Sheet and Dialog components)
 */
export default function App() {
  const navigation = useNavigation();

  // Initialize NProgress with spinner for better UX during navigation
  useEffect(() => {
    NProgress.configure({ showSpinner: true });
  }, []);

  // Show/hide progress bar based on navigation state
  useEffect(() => {
    if (navigation.state === "loading") {
      NProgress.start();
    } else if (navigation.state === "idle") {
      NProgress.done();
    }
  }, [navigation.state]);

  // Handle Supabase authentication redirects
  // This is a workaround for a Supabase auth issue: https://github.com/supabase/auth/issues/1927
  // TODO: Remove this once the issue is fixed
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/") {
      const error = searchParams.get("error");
      const code = searchParams.get("code");
      if (error) {
        // Redirect to error page if authentication failed
        navigate(`/error?${searchParams.toString()}`);
      } else if (code) {
        // Redirect to dashboard if authentication succeeded
        navigate(`/dashboard/account`);
      }
    }
  }, [searchParams]);

  return (
    <Sheet>
      <Dialog>
        <Outlet />
      </Dialog>
    </Sheet>
  );
}

/**
 * Global Error Boundary Component
 *
 * This component catches and displays errors that occur during rendering
 * anywhere in the application. It provides different behavior based on:
 * - Error type (route error vs. JavaScript error)
 * - Environment (development vs. production)
 *
 * Key features:
 * - Special handling for 404 errors with a custom NotFound component
 * - Error reporting to Sentry in production
 * - Detailed stack traces in development mode
 * - User-friendly error messages in production
 *
 * @param error - The error that was caught by React Router
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    // Handle route errors (404, 500, etc.)
    if (error.status === 404) {
      // Show custom 404 page for "not found" errors
      return <NotFound />;
    }
    message = "Error";
    details = error.statusText || details;
  } else if (error && error instanceof Error) {
    // Handle JavaScript errors
    if (
      import.meta.env.VITE_SENTRY_DSN &&
      import.meta.env.MODE === "production"
    ) {
      // Report error to Sentry in production
      Sentry.captureException(error);
    }
    if (import.meta.env.DEV) {
      // Show detailed error information in development
      details = error.message;
      stack = error.stack;
    }
  }

  // Render a simple error page with available information
  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
