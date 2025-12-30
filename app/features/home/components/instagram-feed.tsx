import { Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

export function InstagramFeed() {
  const { t } = useTranslation();

  const instagramPosts = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&h=500&fit=crop",
      caption: "건강하고 풍요로운 일상을 만듭니다 🥚",
      likes: 3421,
      comments: 156,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=500&fit=crop",
      caption: "엄격한 품질 관리로 신선함을 지킵니다 ✨",
      likes: 2890,
      comments: 94,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=500&fit=crop",
      caption: "풍림푸드의 프리미엄 품질을 경험하세요 🌟",
      likes: 1654,
      comments: 53,
    },
    {
      id: 4,
      image:
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=500&fit=crop",
      caption: "커피 푸딩으로 달콤한 하루 시작 ☕",
      likes: 1234,
      comments: 45,
    },
    {
      id: 5,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=500&fit=crop",
      caption: "영양을 가득 채운 한끼구이 신제품 출시! 🥕",
      likes: 2156,
      comments: 78,
    },
    {
      id: 6,
      image:
        "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=500&fit=crop",
      caption: "든든한 한 끼, 야채치즈 계란구이 🍳",
      likes: 1876,
      comments: 62,
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Instagram className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-balance">
              {t("home.instagram.title")}
            </h2>
          </div>
          <p className="text-lg text-muted-foreground mb-6 text-pretty">
            {t("home.instagram.subtitle1")}
            <br className="md:hidden" /> {t("home.instagram.subtitle2")}
          </p>
          <a
            href="https://www.instagram.com/poonglim.official"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            @poonglim.official
            <Instagram className="h-4 w-4" />
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/poonglim.official"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={post.image}
                alt={post.caption}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center px-4">
                  <p className="text-sm mb-3 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center justify-center gap-4 text-xs">
                    <span>❤️ {post.likes.toLocaleString()}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Follow Button */}
        <div className="text-center mt-10">
          <a
            href="https://www.instagram.com/poonglim.official"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Instagram className="h-5 w-5" />
            {t("home.instagram.follow")}
          </a>
        </div>
      </div>
    </section>
  );
}

