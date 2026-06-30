export async function loader() {
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

Sitemap: ${process.env.SITE_URL}/sitemap.xml`,
    {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
