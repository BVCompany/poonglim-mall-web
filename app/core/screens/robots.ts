import type { LoaderFunctionArgs } from "react-router";

import { resolveSiteOrigin } from "~/core/lib/seo.server";

export async function loader({ request }: LoaderFunctionArgs) {
  // SITE_URL 미설정 시 요청 origin으로 폴백(운영에서 항상 유효한 Sitemap URL 보장)
  const origin = resolveSiteOrigin(process.env.SITE_URL, request);
  return new Response(
    `# AI 학습/수집 크롤러 차단
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: CCBot
User-agent: Google-Extended
User-agent: PerplexityBot
User-agent: Bytespider
User-agent: Amazonbot
Disallow: /

# 공격적 SEO/마케팅 크롤러 차단
User-agent: AhrefsBot
User-agent: SemrushBot
User-agent: MJ12bot
User-agent: DotBot
User-agent: BLEXBot
User-agent: DataForSeoBot
User-agent: PetalBot
Disallow: /

# 일반 크롤러: 관리자/API 등 비공개 경로 차단
User-agent: *
Disallow: /admin
Disallow: /dashboard
Disallow: /account
Disallow: /settings
Disallow: /payments
Disallow: /api
Allow: /
Crawl-delay: 10

Sitemap: ${origin}/sitemap.xml`,
    {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
