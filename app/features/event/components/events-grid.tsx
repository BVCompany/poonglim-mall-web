import { Link } from "react-router";
import { Calendar, MapPin, Gift, Users } from "lucide-react";
import { Card, CardContent } from "~/core/components/ui/card";
import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";

interface Event {
  id: number;
  title: string;
  category: string;
  status: "ongoing" | "upcoming" | "ended";
  startDate: string;
  endDate: string;
  location: string;
  image: string;
  description: string;
  participants: number;
  benefits: string[];
}

// Mock events data
const allEvents: Event[] = [
  {
    id: 1,
    title: "신제품 출시 기념 할인 이벤트",
    category: "promotion",
    status: "ongoing",
    startDate: "2024.12.01",
    endDate: "2024.12.31",
    location: "온라인",
    image: "/home/premium_egg.png",
    description: "프리미엄 액란 신제품 출시를 기념하여 최대 30% 할인 혜택을 제공합니다.",
    participants: 1250,
    benefits: ["최대 30% 할인", "무료배송", "사은품 증정"],
  },
  {
    id: 2,
    title: "강남 팝업스토어 오픈",
    category: "popup",
    status: "upcoming",
    startDate: "2025.01.15",
    endDate: "2025.01.28",
    location: "서울 강남구 가로수길",
    image: "/home/puding.png",
    description: "풍림푸드 제품을 직접 체험하고 구매할 수 있는 팝업스토어가 강남에 오픈합니다.",
    participants: 0,
    benefits: ["제품 시식", "현장 할인", "한정 굿즈"],
  },
  {
    id: 3,
    title: "월간 레시피 콘테스트",
    category: "contest",
    status: "ongoing",
    startDate: "2024.12.01",
    endDate: "2024.12.31",
    location: "온라인",
    image: "/home/premium_egg.png",
    description: "풍림푸드 제품을 활용한 창의적인 레시피를 공모합니다.",
    participants: 89,
    benefits: ["상금 100만원", "제품 1년 무료", "레시피북 수록"],
  },
  {
    id: 4,
    title: "B2B 파트너 초청 세미나",
    category: "launch",
    status: "ended",
    startDate: "2024.11.15",
    endDate: "2024.11.15",
    location: "서울 코엑스",
    image: "/home/solution.png",
    description: "외식업체 파트너를 위한 신제품 소개 및 활용법 세미나가 개최되었습니다.",
    participants: 150,
    benefits: ["신제품 소개", "샘플 제공", "특별 할인"],
  },
];

interface EventsGridProps {
  selectedCategory: string;
}

export function EventsGrid({ selectedCategory }: EventsGridProps) {
  const filteredEvents = allEvents.filter(
    (event) => selectedCategory === "all" || event.category === selectedCategory
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Badge className="bg-green-600">진행중</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-600">예정</Badge>;
      case "ended":
        return <Badge variant="secondary">종료</Badge>;
      default:
        return null;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "promotion":
        return "프로모션";
      case "popup":
        return "팝업스토어";
      case "contest":
        return "콘테스트";
      case "launch":
        return "신제품 출시";
      default:
        return category;
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">총 {filteredEvents.length}개 이벤트</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
            <div className="relative">
              <img
                src={event.image}
                alt={event.title}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute left-4 top-4 flex gap-2">
                {getStatusBadge(event.status)}
                <Badge variant="outline" className="bg-white/90">
                  {getCategoryName(event.category)}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="mb-3 text-xl font-semibold text-foreground">{event.title}</h3>
              <p className="mb-4 text-pretty text-muted-foreground">{event.description}</p>

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {event.startDate} ~ {event.endDate}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                {event.participants > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.participants.toLocaleString()}명 참여</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="mb-2 font-medium">혜택</h4>
                <div className="flex flex-wrap gap-1">
                  {event.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      <Gift className="mr-1 h-3 w-3" />
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button asChild className="w-full" disabled={event.status === "ended"}>
                <Link to={`/event/${event.id}`} viewTransition>
                  {event.status === "ended" ? "종료된 이벤트" : "자세히 보기"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">해당 카테고리의 이벤트가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

