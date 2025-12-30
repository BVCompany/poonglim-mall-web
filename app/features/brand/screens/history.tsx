import { Card, CardContent } from "~/core/components/ui/card";

const milestones = [
  {
    period: "1994 ~ 2000",
    achievements: [
      "법인 설립 및 공장 준공",
      "액란 사업 시작",
      "현 대표이사 취임",
      "ISO9002(액란부문) 인증",
      "국내최초 계란구이 사업시작/계란 기공품 제조기술 컨설팅 계약(일본 가나에푸드)",
    ],
    highlight: true,
  },
  {
    period: "2001 ~ 2005",
    achievements: [
      "사업 다각화(계란구이/오물렛/계란찜/푸딩/푸딩)",
      "서울국제식품산업전 참가",
      "전 푸딩판 등급제 실행",
    ],
    highlight: false,
  },
  {
    period: "2006 ~ 2010",
    achievements: [
      "사명 변경(풍림식업 → 풍림푸드)",
      "알가열성형제품 국내 최초 축산물 HACCP 획득",
      "영지란/젤리류 사업 시작",
      "자체 항생제 검사(CHRAM-II) 시스템 도입",
      "농림수산식품부 장관상 수상(축산물 HACCP 우수업체 선정)",
      "계란파우더(SD) 설비 도입",
      "축산물 HACCP 운용 우수업체 선정(알가공품/알가열성형제품 부문 수상)",
    ],
    highlight: false,
  },
  {
    period: "2011 ~ 2014",
    achievements: [
      "1동급 팩란 사업 시작",
      "축산물 HACCP 운용 우수업체선정",
      "영지란 LOHAS 인증 획득(껍계란/깐메추리알)",
    ],
    highlight: false,
  },
  {
    period: "2015 ~ 2018",
    achievements: [
      "농협중앙회 신장 우수농식품기업 워더스상 수상",
      "충청북도지사 고용우수기업 선정",
      "충청북도지사 중소기업대상 종합대상 수상",
      "풍림푸드 연구소 설립",
      "모범납세자 대통령 표창 수상",
      "가축전화 우수기업 선정",
      "살충제 및 농약 자체 분석기 도입(LC MS/MS 설비)",
      "소비자용(B2C) 사업 시작",
      "식용란 LOHAS 인증 획득",
      "매출 1,000억 돌파",
    ],
    highlight: true,
  },
  {
    period: "2019 ~ 현재",
    achievements: [
      "중복청년일자리창출 우수기업 인증",
      "FSSC22000 획득",
      "NH농협은행 친환경 농식품기업 선정",
      "식용 난각 분말 HACCP 획득",
      "매출 1,500억 돌파",
      "신규 액란/디저트 라인 도입",
      "FHA-Food & Beverage 2024 참가",
      "정부기관 추관 중견기업 수출 전환 지원단 선정 (산업통상자원부, KOTRA 등)",
    ],
    highlight: true,
  },
];

export default function BrandHistoryScreen() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-foreground py-24 text-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h1 className="mb-4 text-5xl font-bold">풍림푸드 연혁</h1>
            <p className="text-lg opacity-90">
              1985년부터 현재까지, 풍림푸드의 성장 여정
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="bg-muted py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-balance mb-4 text-4xl font-bold text-foreground">
              풍림푸드의 발자취
            </h2>
            <p className="text-pretty text-xl text-muted-foreground">
              1994년부터 현재까지, 30년간의 성장 과정과 주요 성과를 소개합니다
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card
                key={index}
                className={`${
                  milestone.highlight
                    ? "bg-primary/5 ring-2 ring-primary/30"
                    : ""
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col gap-6 md:flex-row">
                    {/* Period */}
                    <div className="flex-shrink-0 md:w-48">
                      <div
                        className={`text-3xl font-bold ${
                          milestone.highlight
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {milestone.period}
                      </div>
                    </div>

                    {/* Achievements */}
                    <div className="flex-1">
                      <ul className="space-y-3">
                        {milestone.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="mt-1.5 flex-shrink-0 text-primary">
                              •
                            </span>
                            <span className="leading-relaxed text-foreground">
                              {achievement}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
