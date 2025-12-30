import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";

export default function HistoryScreen() {
  const { t } = useTranslation();

  const historyData = [
    {
      year: "2024",
      events: [
        "글로벌 식품 안전 인증 획득",
        "신제품 라인 10종 출시",
        "해외 수출 300억원 달성"
      ]
    },
    {
      year: "2020",
      events: [
        "스마트 팩토리 구축 완료",
        "친환경 인증 획득",
        "매출 1,000억원 돌파"
      ]
    },
    {
      year: "2015",
      events: [
        "중국 지사 설립",
        "제2공장 준공",
        "우수 중소기업 선정"
      ]
    },
    {
      year: "2010",
      events: [
        "ISO 9001 인증 획득",
        "연구개발센터 설립",
        "매출 500억원 달성"
      ]
    },
    {
      year: "2000",
      events: [
        "코스닥 상장",
        "HACCP 인증 획득",
        "해외 수출 시작"
      ]
    },
    {
      year: "1990",
      events: [
        "풍림푸드 설립",
        "제1공장 준공",
        "주요 제품 생산 개시"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">
          {t("navigation.company.history")}
        </h1>

        <div className="prose prose-lg dark:prose-invert mb-12 max-w-none">
          <p className="text-lg">
            1990년 설립 이래 30년 이상의 역사를 통해 대한민국 식품 산업 발전에 
            기여해 온 풍림푸드의 발자취입니다.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative space-y-8">
          {/* Vertical line */}
          <div className="absolute bottom-0 left-8 top-0 w-0.5 bg-border md:left-12" />

          {historyData.map((item, index) => (
            <div key={index} className="relative flex gap-6 md:gap-8">
              {/* Year Badge */}
              <div className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-background bg-[#1F4E3A] text-white md:size-24">
                <div className="text-center">
                  <Calendar className="mx-auto mb-1 size-4 md:size-5" />
                  <span className="text-xs font-bold md:text-sm">{item.year}</span>
                </div>
              </div>

              {/* Events Card */}
              <div className="flex-1 rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold">{item.year}년</h3>
                <ul className="space-y-2">
                  {item.events.map((event, eventIndex) => (
                    <li key={eventIndex} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-1 shrink-0">•</span>
                      <span className="leading-relaxed">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Future Vision */}
        <div className="mt-12 rounded-lg bg-gradient-to-r from-[#1F4E3A] to-[#2d7050] p-8 text-white">
          <h2 className="mb-4 text-2xl font-bold text-white">미래를 향한 비전</h2>
          <p className="text-white opacity-90">
            풍림푸드는 지난 30년의 경험과 노하우를 바탕으로, 글로벌 식품 기업으로 
            도약하기 위한 새로운 도전을 계속하고 있습니다. 2030년까지 매출 5,000억원, 
            해외 수출 비중 50% 달성을 목표로 나아가겠습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

