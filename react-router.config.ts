import type { Config } from "@react-router/dev/config";

import { sentryOnBuildEnd } from "@sentry/react-router";
import { vercelPreset } from "@vercel/react-router/vite";
import { readdir } from "node:fs/promises";
import path from "node:path";

declare module "react-router" {
  interface Future {
    unstable_middleware: true;
  }
}

const urls = (
  await readdir(path.join(process.cwd(), "app", "features", "blog", "docs"))
)
  .filter((file) => file.endsWith(".mdx"))
  .map((file) => `/blog/${file.replace(".mdx", "")}`);

export default {
  ssr: true,
  async prerender() {
    // sitemap.xml·robots.txt는 프리렌더에서 제외한다.
    // 빌드 시점엔 실제 도메인(origin)을 알 수 없어 URL이 깨지므로,
    // 요청 시 동적 생성하여 요청 origin을 사용한다(캐시 헤더로 성능 보전).
    return [
      "/legal/terms-of-service",
      "/legal/privacy-policy",
      "/blog",
      ...urls,
    ];
  },
  presets: [
    ...(process.env.VERCEL ? [vercelPreset()] : []),
  ],
  buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
    if (
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT &&
      process.env.SENTRY_AUTH_TOKEN
    ) {
      await sentryOnBuildEnd({
        viteConfig,
        reactRouterConfig,
        buildManifest,
      });
    }
  },
} satisfies Config;
