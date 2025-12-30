import { useTranslation } from "react-i18next";
import { Calendar, Tag } from "lucide-react";

export default function NewsScreen() {
  const { t } = useTranslation();

  const newsItems = [
    {
      id: 1,
      title: "풍림푸드, 글로벌 식품 안전 인증 획득",
      date: "2024.12.15",
      category: "공지사항",
      excerpt: "풍림푸드가 국제 식품 안전 기준인 FSSC 22000 인증을 획득하여 글로벌 시장 진출의 발판을 마련했습니다.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"
    },
    {
      id: 2,
      title: "2024년 신제품 라인업 공개",
      date: "2024.12.01",
      category: "제품뉴스",
      excerpt: "고객 여러분의 건강한 식탁을 위해 준비한 2024년 신제품 10종을 소개합니다.",
      image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400"
    },
    {
      id: 3,
      title: "친환경 포장재 도입 완료",
      date: "2024.11.20",
      category: "ESG",
      excerpt: "환경 보호를 위한 100% 재활용 가능 포장재 사용을 시작했습니다.",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400"
    },
    {
      id: 4,
      title: "지역 사회 후원 활동 진행",
      date: "2024.11.10",
      category: "사회공헌",
      excerpt: "어려운 이웃을 위한 식품 기부 및 후원 활동을 진행했습니다.",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400"
    },
    {
      id: 5,
      title: "제2공장 스마트 팩토리 구축 완료",
      date: "2024.10.25",
      category: "공지사항",
      excerpt: "최첨단 자동화 설비를 갖춘 제2공장이 본격 가동을 시작했습니다.",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400"
    },
    {
      id: 6,
      title: "해외 수출 300억원 돌파",
      date: "2024.10.01",
      category: "성과",
      excerpt: "올해 해외 수출액이 300억원을 돌파하며 역대 최고 실적을 달성했습니다.",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-4xl font-bold">
          {t("navigation.media.news")}
        </h1>
        <p className="text-muted-foreground mb-12 text-lg">
          풍림푸드의 최신 소식을 전해드립니다
        </p>

        {/* News Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((news) => (
            <article
              key={news.id}
              className="group overflow-hidden rounded-lg border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              {/* News Image */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                <img
                  src={news.image}
                  alt={news.title}
                  className="size-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Category Badge */}
                <div className="absolute left-4 top-4">
                  <span className="flex items-center gap-1 rounded-full bg-[#1F4E3A] px-3 py-1 text-xs font-medium text-white">
                    <Tag className="size-3" />
                    {news.category}
                  </span>
                </div>
              </div>

              {/* News Content */}
              <div className="p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4" />
                  <time>{news.date}</time>
                </div>
                <h3 className="mb-3 text-lg font-bold leading-tight">
                  {news.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {news.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination placeholder */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((page) => (
              <button
                key={page}
                className={`flex size-10 items-center justify-center rounded-md border transition-colors ${
                  page === 1
                    ? "bg-[#1F4E3A] text-white"
                    : "hover:bg-accent"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

