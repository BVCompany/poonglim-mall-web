/**
 * Server Entry Point
 * 
 * This file handles server-side rendering (SSR) for the application.
 * It configures internationalization, streaming rendering, and error handling.
 * 
 * The server entry point is responsible for:
 * 1. Setting up i18n for server-side rendering
 * 2. Rendering the application to a stream for optimal performance
 * 3. Configuring security headers for production
 * 4. Handling errors and reporting them to Sentry
 * 5. Optimizing rendering for bots and search engines
 * 6. Managing streaming timeouts to prevent hanging requests
 */
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import type {
  AppLoadContext,
  EntryContext,
  HandleErrorFunction,
} from "react-router";

import { createReadableStreamFromReadable } from "@react-router/node";
import * as Sentry from "@sentry/node";
import { createInstance } from "i18next";
import { isbot } from "isbot";
import { resolve as resolvePath } from "node:path";
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { ServerRouter } from "react-router";

// Import i18n configuration and translation resources
import i18next from "./core/lib/i18next.server"; // Server-side i18n instance
import { isBlockedBot } from "./core/lib/security.server";
import i18n from "./i18n"; // Shared i18n configuration
import en from "./locales/en";
import ko from "./locales/ko";

/**
 * Maximum time in milliseconds to wait for streaming content
 * 
 * This timeout prevents hanging requests by aborting the stream if it takes too long.
 * The 5-second timeout is a balance between giving enough time for data loading
 * while preventing excessive wait times for users on slow connections.
 * 
 * After this timeout, the stream will be aborted and the current content will be sent.
 */
export const streamTimeout = 5_000;

/**
 * Main server-side rendering handler
 * 
 * This function is the entry point for all server-side rendering requests.
 * It sets up i18n, renders the application to a stream, and configures response headers.
 * 
 * @param request - The incoming HTTP request
 * @param responseStatusCode - HTTP status code to use in the response
 * @param responseHeaders - HTTP headers to include in the response
 * @param routerContext - React Router context containing route information
 * @param loadContext - Additional context data for the application
 * @returns A Promise that resolves to a Response object
 */
export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
  // If you have middleware enabled:
  // loadContext: unstable_RouterContextProvider
) {
  // ── 1차 방어선: 악성 봇 차단 ──
  // robots.txt를 무시하는 스크래퍼/AI 크롤러는 즉시 차단한다.
  // 요청 빈도 제한(rate limit)은 Vercel WAF에서 처리한다.
  // (인메모리 rate limit은 서버리스에서 부정확하고, NAT 공유 IP 환경의
  //  정상 사용자를 오차단하므로 코드에서 제거함)
  const incomingUa = request.headers.get("user-agent");
  if (isBlockedBot(incomingUa)) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "Cache-Control": "no-store" },
    });
  }

  return new Promise(async (resolve, reject) => {
    const i18nextInstance = createInstance();

    const lng = await i18next.getLocale(request);
    const ns = i18next.getRouteNamespaces(routerContext);

    await i18nextInstance.use(initReactI18next).init({
      ...i18n,
      lng,
      ns,
      resources: {
        en: {
          common: en,
        },
        ko: {
          common: ko,
        },
      },
    });

    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");

    /**
     * Determine the appropriate rendering strategy based on the user agent
     * 
     * For search engines and bots, we use 'onAllReady' to ensure all content is loaded
     * before sending the response. This improves SEO by providing complete content.
     * 
     * For regular users, we use 'onShellReady' for faster initial page loads with streaming.
     * 
     * SPA Mode also uses 'onAllReady' to ensure complete content for static generation.
     * 
     * @see https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
     */
    let readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady" // Complete rendering for bots and static generation
        : "onShellReady"; // Streaming rendering for human users

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={i18nextInstance}>
        <ServerRouter context={routerContext} url={request.url} />
      </I18nextProvider>,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          // NOTE: includeSubDomains/preload 는 사용하지 않습니다.
          // 서브도메인 wos.freshegg.co.kr(오뚜기 수발주)이 HTTP만 제공하므로,
          // includeSubDomains 를 켜면 해당 서브도메인이 HTTPS 강제로 접속 불가가 됩니다.
          responseHeaders.set(
            "Strict-Transport-Security",
            "max-age=31536000",
          );
          if (process.env.NODE_ENV === "production") {
            // Extend and or override CSP for production depending on your needs
            // responseHeaders.set(
            //   "Content-Security-Policy",
            //   `
            //     default-src 'self';
            //     script-src 'self' https: 'unsafe-inline';
            //     style-src 'self' https: 'unsafe-inline';
            //     font-src 'self' https:;
            //     img-src 'self' https: data:;
            //     connect-src 'self' https:;
            //     frame-src 'self' https:;
            //     media-src 'self' https:;
            //     object-src 'none';
            //     base-uri 'self';
            //     frame-ancestors 'self';
            //   `
            //     .replace(/\s{2,}/g, " ")
            //     .trim(),
            // );
          }
          responseHeaders.set("X-Content-Type-Options", "nosniff");
          responseHeaders.set(
            "Referrer-Policy",
            "strict-origin-when-cross-origin",
          );
          responseHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
          responseHeaders.set("Cross-Origin-Embedder-Policy", "unsafe-none");
          responseHeaders.set("X-Frame-Options", "DENY");
          responseHeaders.set("X-XSS-Protection", "1; mode=block");

          // ── CDN 캐시 정책 ──
          // 공개 페이지(GET·200)는 Vercel CDN에서 캐시해 함수 호출·전송량을 절감한다.
          // 브라우저는 max-age=0으로 항상 재검증하되, CDN은 s-maxage 동안 캐시하고
          // stale-while-revalidate로 갱신 중에도 캐시본을 제공한다.
          // 관리자/API 및 비-GET·비-200 응답은 캐시하지 않는다(no-store).
          // 로케일 쿠키에 따라 응답이 달라지므로 Vary: Cookie를 함께 둔다.
          const pathname = new URL(request.url).pathname;
          const cacheablePublic =
            request.method === "GET" &&
            responseStatusCode === 200 &&
            !pathname.startsWith("/admin") &&
            !pathname.startsWith("/api");
          if (cacheablePublic) {
            responseHeaders.set(
              "Cache-Control",
              "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
            );
            responseHeaders.append("Vary", "Cookie");
          } else {
            responseHeaders.set("Cache-Control", "no-store");
          }

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error);
          }
        },
      },
    );

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    setTimeout(abort, streamTimeout + 1000);
  });
}

/**
 * Global server-side error handler
 * 
 * This function captures and reports server-side errors to Sentry in production.
 * It only reports errors if the request hasn't been aborted and Sentry is configured.
 * 
 * @param error - The error that occurred during rendering
 * @param context - Context object containing the request and other information
 */
export const handleError: HandleErrorFunction = (error, { request }) => {
  if (
    !request.signal.aborted &&
    process.env.SENTRY_DSN &&
    process.env.NODE_ENV === "production"
  ) {
    // Send the error to Sentry for monitoring and alerting
    Sentry.captureException(error);
    // Also log to console for server-side visibility
    console.error(error);
  }
};
