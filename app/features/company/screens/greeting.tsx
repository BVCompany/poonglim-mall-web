import { useTranslation } from "react-i18next";

export default function GreetingScreen() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">
          {t("navigation.company.greeting")}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Hero Section */}
          <div className="mb-12 rounded-lg bg-gradient-to-r from-[#1F4E3A] to-[#2d7050] p-8 text-white">
            <h2 className="mb-4 text-3xl font-bold text-white">풍림푸드를 찾아주셔서 감사합니다</h2>
            <p className="text-lg text-white opacity-90">
              고객 여러분의 건강한 식탁을 위해 최선을 다하는 풍림푸드가 되겠습니다.
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              안녕하십니까, 풍림푸드 대표이사 <strong>홍길동</strong>입니다.
            </p>
            <p className="leading-relaxed">
              저희 풍림푸드는 1990년 설립 이래 30년 이상 식품 산업의 발전과 
              국민 건강 증진을 위해 노력해 왔습니다. 고품질의 식품을 합리적인 
              가격으로 제공하여 모든 가정의 행복한 식탁을 만드는 것이 저희의 
              사명입니다.
            </p>
            <p className="leading-relaxed">
              우리는 엄격한 품질 관리 시스템과 최첨단 생산 설비를 통해 
              안전하고 신선한 제품을 생산하고 있습니다. 또한 지속 가능한 
              식품 산업을 위해 친환경 경영과 사회적 책임을 다하고자 
              노력하고 있습니다.
            </p>
            <p className="leading-relaxed">
              앞으로도 풍림푸드는 고객 여러분의 신뢰에 보답하고자 
              끊임없는 연구개발과 혁신을 통해 더 나은 제품과 서비스를 
              제공하겠습니다.
            </p>
            <p className="mt-8 text-lg font-semibold">
              고객 여러분의 건강과 행복을 위해 항상 최선을 다하는 
              풍림푸드가 되겠습니다.
            </p>
          </div>

          {/* Signature */}
          <div className="mt-12 text-right">
            <p className="text-lg font-bold">풍림푸드 대표이사</p>
            <p className="mt-2 text-2xl font-bold">홍 길 동</p>
          </div>
        </div>
      </div>
    </div>
  );
}

