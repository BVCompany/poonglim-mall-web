import { useTranslation } from "react-i18next";
import { Heart, Leaf, Shield, Award, Users, Globe, CheckCircle } from "lucide-react";
import { Card, CardContent } from "~/core/components/ui/card";

export default function BrandIntroScreen() {
  const { t } = useTranslation();

  // 경영 철학
  const philosophies = [
    {
      icon: Heart,
      title: "고객 중심",
      description: "고객의 건강과 만족을 최우선으로 생각하는 제품 개발과 서비스 제공",
      color: "text-red-600",
    },
    {
      icon: Shield,
      title: "품질 신뢰",
      description: "HACCP, ISO 등 국제 인증을 통한 철저한 품질 관리 시스템 구축",
      color: "text-blue-600",
    },
    {
      icon: Leaf,
      title: "ESG 경영",
      description: "환경을 생각하는 지속가능한 경영과 사회적 책임 실천",
      color: "text-green-600",
    },
    {
      icon: Award,
      title: "혁신 추구",
      description: "끊임없는 연구개발을 통한 혁신적인 제품과 기술 개발",
      color: "text-purple-600",
    },
    {
      icon: Users,
      title: "상생 협력",
      description: "파트너사와의 동반성장을 통한 건전한 생태계 조성",
      color: "text-orange-600",
    },
    {
      icon: Globe,
      title: "글로벌 진출",
      description: "한국의 우수한 식품 기술을 세계에 알리는 글로벌 기업으로 도약",
      color: "text-indigo-600",
    },
  ];

  // 인증 현황
  const certifications = [
    {
      icon: Shield,
      name: "HACCP",
      description: "식품안전관리인증기준",
      details: "원료 입고부터 제품 출하까지 전 과정 안전 관리",
      year: "2010년 인증",
    },
    {
      icon: Award,
      name: "ISO 22000",
      description: "식품안전경영시스템",
      details: "국제 표준 식품안전 경영시스템 구축 및 운영",
      year: "2015년 인증",
    },
    {
      icon: CheckCircle,
      name: "KS 인증",
      description: "한국산업표준 인증",
      details: "국가 표준 품질 기준 충족 제품 생산",
      year: "2018년 인증",
    },
    {
      icon: Leaf,
      name: "친환경 인증",
      description: "환경친화적 제품 인증",
      details: "지속가능한 생산 공정과 친환경 포장재 사용",
      year: "2020년 인증",
    },
  ];

  // 발자취
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

  return (
    <div className="w-full">
      {/* Hero Section - 브랜드 스토리 */}
      <section className="relative py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop"
            alt="풍림푸드 제조시설"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              풍림푸드 브랜드 스토리
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-pretty opacity-90">
              1994년 설립 이래 30년간 축적된 노하우와 혁신적인 기술로
              <br />
              고객의 건강하고 풍요로운 일상을 만들어가고 있습니다
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">30+</div>
                <div className="text-lg opacity-80">년의 전통</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">500+</div>
                <div className="text-lg opacity-80">거래처</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-lg opacity-80">제품 라인업</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6 text-balance">
                건강한 식품으로 더 나은 세상을
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p className="text-pretty">
                  풍림푸드는 1994년 작은 식품 제조업체로 시작하여, 오늘날 대한민국을 대표하는 프리미엄 식품 전문기업으로
                  성장했습니다.
                </p>
                <p className="text-pretty">
                  우리는 단순히 제품을 만드는 것이 아니라, 고객의 건강하고 풍요로운 일상을 만들어가는 파트너가 되고자
                  합니다. 엄선된 원료와 첨단 기술, 그리고 30년간 축적된 노하우를 바탕으로 최고 품질의 제품을 선보이고
                  있습니다.
                </p>
                <p className="text-pretty">
                  앞으로도 풍림푸드는 지속가능한 경영과 사회적 책임을 다하며, 고객과 함께 성장하는 기업이 되겠습니다.
                </p>
              </div>
            </div>
            <div className="relative pb-8 md:pb-10">
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <img
                  src="/intro/president.png"
                  alt="풍림푸드 대표이사 정언현"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <Card className="absolute bottom-4 md:bottom-6 left-0 md:-left-4 bg-white dark:bg-gray-900 shadow-xl">
                <CardContent className="p-6">
                  <blockquote className="text-lg font-medium text-foreground mb-3">
                    "고객의 건강이 곧 우리의 사명입니다"
                  </blockquote>
                  <cite className="text-sm text-muted-foreground">- 풍림푸드 대표이사 정언현</cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              풍림푸드의 경영 철학
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              6가지 핵심 가치로 더 나은 미래를 만들어갑니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {philosophies.map((philosophy, index) => (
              <div
                key={index}
                className="bg-background p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-16 h-16 mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${philosophy.color}`}
                >
                  <philosophy.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{philosophy.title}</h3>
                <p className="text-muted-foreground text-pretty">{philosophy.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Certifications Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              품질 인증 현황
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              국내외 공인 기관의 엄격한 인증을 통해 품질을 보장합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {certifications.map((cert, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <cert.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
                  <p className="text-xs text-muted-foreground mb-3 text-pretty">{cert.details}</p>
                  <p className="text-xs font-medium text-primary">{cert.year}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">원료 검사율</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24시간</div>
                <div className="text-sm text-muted-foreground">품질 모니터링</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">0건</div>
                <div className="text-sm text-muted-foreground">최근 3년 품질 사고</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Timeline Section */}
      <section className="py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4 text-balance">
              풍림푸드의 발자취
            </h2>
            <p className="text-xl text-muted-foreground text-pretty">
              1994년부터 현재까지, 30년간의 성장 과정과 주요 성과를 소개합니다
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <Card
                key={index}
                className={`${
                  milestone.highlight ? "ring-2 ring-primary/30 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Period */}
                    <div className="md:w-48 flex-shrink-0">
                      <div
                        className={`text-3xl font-bold ${
                          milestone.highlight ? "text-primary" : "text-muted-foreground"
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
                            <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                            <span className="text-foreground leading-relaxed">{achievement}</span>
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
