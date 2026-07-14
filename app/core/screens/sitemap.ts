/**
 * Sitemap Generator (XML)
 *
 * 검색엔진 색인을 위한 사이트맵을 동적으로 생성한다.
 * - 도메인은 SITE_URL 환경변수 → 없으면 요청 origin으로 폴백(운영에서 항상 유효)
 * - 실제 공개 정적 페이지 목록 + legal 문서(MDX)로 구성
 * - 관리자(/admin)·API·검색 등 색인 불필요 경로는 제외
 */
import type { LoaderFunctionArgs } from "react-router";

import { readdir } from "node:fs/promises";
import path from "node:path";

import { resolveSiteOrigin } from "~/core/lib/seo.server";

/** 색인 대상 공개 정적 경로 */
const STATIC_PUBLIC_PATHS = [
  "/",
  "/contact",
  // 브랜드/회사소개
  "/brand/intro",
  "/brand/history",
  "/brand/certifications",
  "/brand/factory-tour",
  "/brand/location",
  // 제품소개
  "/products/all",
  "/products/egg-story",
  "/products/liquid-eggs",
  "/products/puddings",
  "/products/convenience",
  // 레시피
  "/recipe/main",
  "/recipe/easy",
  "/recipe/dessert",
  "/recipe/restaurant",
  // 홍보센터
  "/media/news",
  // 이벤트
  "/event",
  // 구매문의
  "/inquiry/online",
  "/inquiry/bulk",
  // 고객지원
  "/support",
  "/support/notice",
  "/support/resources",
  "/support/safety-test",
  "/support/grade-certificate",
  "/support/faq",
  "/support/contact",
  // 채용
  "/careers/positions",
  "/careers/talent",
  "/careers/benefits",
];

async function readLegalPaths(): Promise<string[]> {
  try {
    const files = await readdir(
      path.join(process.cwd(), "app", "features", "legal", "docs"),
    );
    return files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => `/legal/${file.replace(".mdx", "")}`);
  } catch {
    return [];
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const origin = resolveSiteOrigin(process.env.SITE_URL, request);
  const legalPaths = await readLegalPaths();

  const paths = [...STATIC_PUBLIC_PATHS, ...legalPaths];
  const urls = paths
    .map((p) => `  <url><loc>${origin}${p}</loc></url>`)
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
