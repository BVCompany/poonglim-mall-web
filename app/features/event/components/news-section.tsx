import { Link } from "react-router";
import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  summary: string;
  image: string;
  featured: boolean;
}

// Mock news data
const allNews: NewsItem[] = [
  {
    id: 1,
    title: "풍림푸드, 2024년 식품안전대상 수상",
    category: "수상",
    date: "2024.12.15",
    summary: "식품의약품안전처가 주관하는 2024년 식품안전대상에서 우수상을 수상했습니다.",
    image: "/home/premium_egg.png",
    featured: true,
  },
  {
    id: 2,
    title: "신제품 '프리미엄 액란 플러스' 출시",
    category: "신제품",
    date: "2024.12.10",
    summary: "기존 액란 제품보다 영양가를 높인 프리미엄 액란 플러스를 새롭게 출시했습니다.",
    image: "/home/premium_egg.png",
    featured: true,
  },
  {
    id: 3,
    title: "동남아시아 수출 확대, 베트남 진출",
    category: "사업확장",
    date: "2024.12.05",
    summary: "베트남 현지 유통업체와 파트너십을 체결하여 동남아시아 시장 진출을 본격화합니다.",
    image: "/home/solution.png",
    featured: false,
  },
  {
    id: 4,
    title: "ESG 경영 우수기업 선정",
    category: "ESG",
    date: "2024.11.28",
    summary: "지속가능경영원이 주관하는 ESG 경영 우수기업에 선정되었습니다.",
    image: "/home/solution.png",
    featured: false,
  },
  {
    id: 5,
    title: "제3공장 건설 착공식 개최",
    category: "시설확장",
    date: "2024.11.20",
    summary: "생산 능력 확대를 위한 제3공장 건설 착공식을 경기도 화성에서 개최했습니다.",
    image: "/home/solution.png",
    featured: false,
  },
  {
    id: 6,
    title: "대학생 장학금 지원 프로그램 시작",
    category: "사회공헌",
    date: "2024.11.15",
    summary: "식품영양학과 대학생을 대상으로 한 장학금 지원 프로그램을 새롭게 시작합니다.",
    image: "/home/puding.png",
    featured: false,
  },
];

export function NewsSection() {
  const featuredNews = allNews.filter((item) => item.featured);
  const regularNews = allNews.filter((item) => !item.featured);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "수상":
        return "bg-yellow-100 text-yellow-800";
      case "신제품":
        return "bg-green-100 text-green-800";
      case "사업확장":
        return "bg-blue-100 text-blue-800";
      case "ESG":
        return "bg-purple-100 text-purple-800";
      case "시설확장":
        return "bg-orange-100 text-orange-800";
      case "사회공헌":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Featured News */}
      {featuredNews.length > 0 && (
        <div>
          <h2 className="mb-6 text-2xl font-bold">주요 소식</h2>
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredNews.map((item) => (
              <Card key={item.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge className={`absolute left-4 top-4 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="mb-3 text-balance text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mb-4 text-pretty text-muted-foreground">{item.summary}</p>
                  <Link
                    to={`/event/news/${item.id}`}
                    viewTransition
                    className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80"
                  >
                    자세히 보기
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular News */}
      <div>
        <h2 className="mb-6 text-2xl font-bold">전체 소식</h2>
        <div className="space-y-4">
          {regularNews.map((item) => (
            <Card key={item.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-full flex-shrink-0 rounded object-cover md:w-32"
                  />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <Badge className={`${getCategoryColor(item.category)} text-xs`}>{item.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{item.date}</span>
                      </div>
                    </div>
                    <h3 className="mb-2 text-balance text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-pretty text-muted-foreground">{item.summary}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link
                      to={`/event/news/${item.id}`}
                      viewTransition
                      className="inline-flex items-center gap-2 font-medium text-primary hover:text-primary/80"
                    >
                      자세히 보기
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

