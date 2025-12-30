import { useTranslation } from "react-i18next";
import { Target, Heart, Lightbulb, Users } from "lucide-react";

export default function VisionScreen() {
  const { t } = useTranslation();

  const visionItems = [
    {
      icon: Target,
      title: "우리의 비전",
      content: "최고 품질의 식품으로 고객의 건강한 삶에 기여하는 글로벌 식품 기업"
    },
    {
      icon: Heart,
      title: "핵심 가치",
      content: "품질, 신뢰, 혁신, 고객 만족을 최우선으로 하는 기업 문화"
    },
    {
      icon: Lightbulb,
      title: "경영 철학",
      content: "지속 가능한 성장과 사회적 책임을 다하는 기업 시민"
    },
    {
      icon: Users,
      title: "인재 경영",
      content: "창의적이고 도전적인 인재를 육성하여 함께 성장하는 조직"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-4xl font-bold">
          {t("navigation.company.vision")}
        </h1>
        
        {/* Vision Grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {visionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-[#1F4E3A] p-3">
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detailed Philosophy */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>경영 철학</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-[#1F4E3A]">1. 품질 최우선</h3>
              <p>
                고객의 건강과 안전을 최우선으로 생각하며, 최고 품질의 제품만을 
                생산합니다. 엄격한 품질 관리 시스템을 통해 모든 제품의 안전성을 
                보장합니다.
              </p>
            </div>
            <div>
              <h3 className="text-[#1F4E3A]">2. 지속 가능한 경영</h3>
              <p>
                환경 보호와 사회적 책임을 다하며, 지속 가능한 식품 산업 생태계 
                조성에 앞장섭니다. 친환경 원료 사용과 에너지 절감을 통해 
                미래 세대를 위한 환경을 보존합니다.
              </p>
            </div>
            <div>
              <h3 className="text-[#1F4E3A]">3. 혁신과 도전</h3>
              <p>
                끊임없는 연구개발을 통해 새로운 제품과 서비스를 개발하며, 
                변화하는 시장 환경에 능동적으로 대응합니다. 실패를 두려워하지 
                않는 도전 정신으로 미래를 개척합니다.
              </p>
            </div>
            <div>
              <h3 className="text-[#1F4E3A]">4. 상생과 협력</h3>
              <p>
                협력사, 고객, 지역사회와 함께 성장하는 상생 경영을 실천합니다. 
                공정한 거래와 투명한 경영을 통해 모든 이해관계자와 신뢰를 
                구축합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

