import { useState } from "react";
import { useTranslation } from "react-i18next";
import { EventsGrid } from "../components/events-grid";
import { EventsFilters } from "../components/events-filters";
import { NewsSection } from "../components/news-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/core/components/ui/tabs";

const eventCategories = [
  { id: "all", name: "전체 이벤트", count: 4 },
  { id: "promotion", name: "프로모션", count: 1 },
  { id: "popup", name: "팝업스토어", count: 1 },
  { id: "contest", name: "콘테스트", count: 1 },
  { id: "launch", name: "신제품 출시", count: 1 },
];

export default function EventScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-4 text-balance text-4xl font-bold md:text-5xl">이벤트 & 소식</h1>
          <p className="text-pretty text-xl opacity-90">풍림푸드의 최신 이벤트와 소식을 확인하세요</p>
        </div>
      </section>

      {/* Content Section with Tabs */}
      <section className="bg-background py-12">
        <div className="mx-auto max-w-7xl px-6">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2">
              <TabsTrigger value="events">이벤트</TabsTrigger>
              <TabsTrigger value="news">뉴스 & 소식</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <div className="flex flex-col gap-8 lg:flex-row">
                {/* Filters Sidebar */}
                <div className="flex-shrink-0 lg:w-64">
                  <EventsFilters
                    categories={eventCategories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                  />
                </div>

                {/* Events Grid */}
                <div className="flex-1">
                  <EventsGrid selectedCategory={selectedCategory} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="news">
              <NewsSection />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
